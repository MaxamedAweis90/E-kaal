import { Types } from "mongoose";
import { Merchant } from "../models";
import { UpdateMerchantProfileInput } from "../validations";

export class MerchantService {
  static async getProfile(merchantId: Types.ObjectId) {
    const merchant = await Merchant.findById(merchantId).lean();
    if (!merchant) {
      throw { statusCode: 404, code: "MERCHANT_NOT_FOUND", message: "Merchant not found" };
    }

    return merchant;
  }

  static async updateProfile(
    merchantId: Types.ObjectId,
    data: UpdateMerchantProfileInput
  ) {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw { statusCode: 404, code: "MERCHANT_NOT_FOUND", message: "Merchant not found" };
    }

    if (data.shopName !== undefined) merchant.shopName = data.shopName;
    if (data.email !== undefined) merchant.email = data.email;
    if (data.phone !== undefined) merchant.phone = data.phone;
    if (data.supportChannels !== undefined) {
      merchant.supportChannels = {
        ...merchant.supportChannels,
        ...data.supportChannels,
      };
    }

    return await merchant.save();
  }
}

