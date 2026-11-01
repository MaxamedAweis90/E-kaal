import { Request, Response, NextFunction } from "express";
import { ResellerService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class ResellerController {
  static async getProviders(_req: Request, res: Response, next: NextFunction) {
    try {
      const providers = ResellerService.getProviders();
      return sendSuccess(res, providers);
    } catch (err) {
      next(err);
    }
  }

  static async transact(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const result = await ResellerService.executeTransaction(merchantId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async listHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const history = await ResellerService.listHistory(merchantId);
      return sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  }
}
