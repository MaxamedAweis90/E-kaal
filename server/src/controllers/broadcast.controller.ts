import { Request, Response, NextFunction } from "express";
import { BroadcastService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class BroadcastController {
  static async sendBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const log = await BroadcastService.sendBroadcast(merchantId, req.body);
      return sendSuccess(res, log, 201);
    } catch (err) {
      next(err);
    }
  }

  static async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const logs = await BroadcastService.listLogs(merchantId);
      return sendSuccess(res, logs);
    } catch (err) {
      next(err);
    }
  }
}

