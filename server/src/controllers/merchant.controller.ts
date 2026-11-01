import { Request, Response, NextFunction } from "express";
import { MerchantService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class MerchantController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const merchant = await MerchantService.getProfile(merchantId);
      return sendSuccess(res, merchant);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const updated = await MerchantService.updateProfile(merchantId, req.body);
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }
}

