import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class DashboardController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const overview = await DashboardService.getOverview(merchantId);
      return sendSuccess(res, overview);
    } catch (err) {
      next(err);
    }
  }
}

