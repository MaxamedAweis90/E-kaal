import { Request, Response, NextFunction } from "express";
import { VendorService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class VendorController {
  static async listVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const vendors = await VendorService.listVendors(merchantId);
      return sendSuccess(res, vendors);
    } catch (err) {
      next(err);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const vendor = await VendorService.createVendor(merchantId, req.body);
      return sendSuccess(res, vendor, 201);
    } catch (err) {
      next(err);
    }
  }

  static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const result = await VendorService.recordPayment(merchantId, req.params.id, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}

