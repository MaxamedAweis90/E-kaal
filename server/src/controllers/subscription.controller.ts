import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class SubscriptionController {
  static async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const result = await SubscriptionService.activateSubscription(merchantId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = SubscriptionService.getPlans();
      return sendSuccess(res, plans);
    } catch (err) {
      next(err);
    }
  }
}

