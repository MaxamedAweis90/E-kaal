import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class CustomerController {
  static async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const { search, status, sort } = req.query as { search?: string; status?: string; sort?: string };
      const customers = await CustomerService.listCustomers(merchantId, { search, status, sort });
      return sendSuccess(res, customers);
    } catch (err) {
      next(err);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const customer = await CustomerService.createCustomer(merchantId, req.body);
      return sendSuccess(res, customer, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const result = await CustomerService.getCustomerById(merchantId, req.params.id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async recordTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const result = await CustomerService.recordTransaction(merchantId, req.params.id, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}

