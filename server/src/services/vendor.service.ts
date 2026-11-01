import { Types } from "mongoose";
import { Vendor, Transaction, IVendor } from "../models";
import { CreateVendorInput, VendorPaymentInput } from "../validations";
import { roundMoney } from "../utils/math";

export class VendorService {
  static async listVendors(merchantId: Types.ObjectId) {
    const vendors = await Vendor.find({ merchantId }).sort({ totalOwed: -1, createdAt: -1 }).lean();

    return vendors.map((v) => ({
      ...v,
      totalOwed: roundMoney(v.totalOwed),
    }));
  }

  static async createVendor(merchantId: Types.ObjectId, data: CreateVendorInput): Promise<IVendor> {
    const vendor = new Vendor({
      merchantId,
      name: data.name,
      phone: data.phone,
      totalOwed: roundMoney(data.totalOwed || 0),
      status: (data.totalOwed || 0) > 0 ? "ACTIVE" : "SETTLED",
    });

    return await vendor.save();
  }

  static async recordPayment(
    merchantId: Types.ObjectId,
    vendorId: string,
    data: VendorPaymentInput
  ) {
    if (!Types.ObjectId.isValid(vendorId)) {
      throw { statusCode: 400, code: "INVALID_ID", message: "Invalid vendor ID" };
    }

    const vendor = await Vendor.findOne({ _id: vendorId, merchantId });
    if (!vendor) {
      throw { statusCode: 404, code: "VENDOR_NOT_FOUND", message: "Vendor not found" };
    }

    const paymentAmount = roundMoney(data.amount);
    const newTotalOwed = Math.max(0, roundMoney(vendor.totalOwed - paymentAmount));

    vendor.totalOwed = newTotalOwed;
    vendor.status = newTotalOwed === 0 ? "SETTLED" : "ACTIVE";
    await vendor.save();

    const transaction = await Transaction.create({
      merchantId,
      partyType: "VENDOR",
      partyId: vendor._id,
      type: "VENDOR_PAYMENT",
      amount: paymentAmount,
      note: data.note || "",
      date: new Date(),
    });

    return {
      vendor: {
        ...vendor.toObject(),
        totalOwed: roundMoney(vendor.totalOwed),
      },
      transaction: {
        ...transaction.toObject(),
        amount: roundMoney(transaction.amount),
      },
    };
  }
}

