import { Request } from "express";
import { Types } from "mongoose";
import { Merchant } from "../models";

export const getMerchantId = async (req: Request): Promise<Types.ObjectId> => {
  const headerId = req.headers["x-merchant-id"] as string;
  if (headerId && Types.ObjectId.isValid(headerId)) {
    return new Types.ObjectId(headerId);
  }

  let merchant = await Merchant.findOne();
  if (!merchant) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    merchant = await Merchant.create({
      shopName: "Mudnaan Shop",
      phone: "614888881",
      email: "mudnaan@emudnaan.com",
      activeSubscriptionTier: "1_MONTH",
      subscriptionExpiresAt: expiresAt,
      supportChannels: {
        whatsapp: "+252614888881",
        call: "+252614888881",
      },
    });
  }

  return merchant._id as Types.ObjectId;
};

