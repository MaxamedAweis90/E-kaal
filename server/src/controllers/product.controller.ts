import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services";
import { getMerchantId } from "../utils/merchant";
import { sendSuccess } from "../utils/response";

export class ProductController {
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const data = await ProductService.listProducts(merchantId);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const product = await ProductService.createProduct(merchantId, req.body);
      return sendSuccess(res, product, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const product = await ProductService.updateProduct(merchantId, req.params.id, req.body);
      return sendSuccess(res, product);
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await getMerchantId(req);
      const result = await ProductService.deleteProduct(merchantId, req.params.id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

