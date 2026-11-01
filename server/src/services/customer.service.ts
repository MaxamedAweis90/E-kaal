import { Types } from "mongoose";
import { Customer, Transaction, ICustomer } from "../models";
import { CreateCustomerInput, CustomerTransactionInput } from "../validations";
import { roundMoney } from "../utils/math";

export interface CustomerQueryOptions {
  search?: string;
  status?: string;
  sort?: string;
}

export class CustomerService {
  static async listCustomers(merchantId: Types.ObjectId, options: CustomerQueryOptions = {}) {
    const filter: Record<string, any> = { merchantId };

    if (options.status) {
      const s = options.status.toUpperCase();
      if (s === "OWING" || s === "ACTIVE") {
        filter.status = { $in: ["OWING", "ACTIVE", "OVER_LIMIT", "DELINQUENT"] };
      } else if (s === "CLEARED" || s === "SETTLED") {
        filter.status = { $in: ["CLEARED", "SETTLED"] };
      } else if (s === "OVER_LIMIT" || s === "DELINQUENT") {
        filter.status = { $in: ["OVER_LIMIT", "DELINQUENT"] };
      }
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, "i");
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (options.sort === "balance_desc") {
      sortQuery = { balance: -1 };
    } else if (options.sort === "balance_asc") {
      sortQuery = { balance: 1 };
    } else if (options.sort === "name") {
      sortQuery = { name: 1 };
    }

    const customers = await Customer.find(filter).sort(sortQuery).lean();

    return customers.map((c) => ({
      ...c,
      totalDebt: roundMoney(c.totalDebt),
      paid: roundMoney(c.paid),
      balance: roundMoney(c.balance),
      creditLimit: roundMoney(c.creditLimit),
      isOverLimit: c.creditLimit > 0 && c.balance > c.creditLimit,
    }));
  }

  static async createCustomer(merchantId: Types.ObjectId, data: CreateCustomerInput): Promise<ICustomer> {
    const existing = await Customer.findOne({ merchantId, phone: data.phone });
    if (existing) {
      throw { statusCode: 409, code: "CUSTOMER_EXISTS", message: "Customer with this phone number already exists" };
    }

    const customer = new Customer({
      merchantId,
      name: data.name,
      phone: data.phone,
      creditLimit: roundMoney(data.creditLimit || 0),
      totalDebt: 0,
      paid: 0,
      balance: 0,
      status: "CLEARED",
    });

    return await customer.save();
  }

  static async getCustomerById(merchantId: Types.ObjectId, customerId: string) {
    if (!Types.ObjectId.isValid(customerId)) {
      throw { statusCode: 400, code: "INVALID_ID", message: "Invalid customer ID" };
    }

    const customer = await Customer.findOne({ _id: customerId, merchantId }).lean();
    if (!customer) {
      throw { statusCode: 404, code: "CUSTOMER_NOT_FOUND", message: "Customer not found" };
    }

    const transactions = await Transaction.find({
      merchantId,
      partyType: "CUSTOMER",
      partyId: customer._id,
    })
      .sort({ date: -1 })
      .lean();

    return {
      customer: {
        ...customer,
        totalDebt: roundMoney(customer.totalDebt),
        paid: roundMoney(customer.paid),
        balance: roundMoney(customer.balance),
        creditLimit: roundMoney(customer.creditLimit),
        isOverLimit: customer.creditLimit > 0 && customer.balance > customer.creditLimit,
      },
      transactions: transactions.map((t) => ({
        ...t,
        amount: roundMoney(t.amount),
      })),
    };
  }

  static async recordTransaction(
    merchantId: Types.ObjectId,
    customerId: string,
    data: CustomerTransactionInput
  ) {
    if (!Types.ObjectId.isValid(customerId)) {
      throw { statusCode: 400, code: "INVALID_ID", message: "Invalid customer ID" };
    }

    const customer = await Customer.findOne({ _id: customerId, merchantId });
    if (!customer) {
      throw { statusCode: 404, code: "CUSTOMER_NOT_FOUND", message: "Customer not found" };
    }

    const amount = roundMoney(data.amount);

    if (data.type === "DEBT_ADD") {
      customer.totalDebt = roundMoney(customer.totalDebt + amount);
    } else if (data.type === "DEBT_PAYMENT") {
      customer.paid = roundMoney(customer.paid + amount);
    }

    customer.balance = roundMoney(customer.totalDebt - customer.paid);

    if (customer.balance === 0) {
      customer.status = "CLEARED";
    } else if (customer.creditLimit > 0 && customer.balance > customer.creditLimit) {
      customer.status = "OVER_LIMIT";
    } else {
      customer.status = "OWING";
    }

    await customer.save();

    const transaction = await Transaction.create({
      merchantId,
      partyType: "CUSTOMER",
      partyId: customer._id,
      type: data.type,
      amount,
      note: data.note || "",
      date: new Date(),
    });

    return {
      customer: {
        ...customer.toObject(),
        totalDebt: roundMoney(customer.totalDebt),
        paid: roundMoney(customer.paid),
        balance: roundMoney(customer.balance),
        creditLimit: roundMoney(customer.creditLimit),
        isOverLimit: customer.creditLimit > 0 && customer.balance > customer.creditLimit,
      },
      transaction: {
        ...transaction.toObject(),
        amount: roundMoney(transaction.amount),
      },
    };
  }
}
