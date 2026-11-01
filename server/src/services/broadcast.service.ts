import { Types } from "mongoose";
import { BroadcastLog, IBroadcastLog } from "../models";
import { BroadcastMessageInput } from "../validations";

export class BroadcastService {
  static async sendBroadcast(
    merchantId: Types.ObjectId,
    data: BroadcastMessageInput
  ): Promise<IBroadcastLog> {
    if (data.message.length > 125) {
      throw { statusCode: 400, code: "MESSAGE_TOO_LONG", message: "Message cannot exceed 125 characters" };
    }

    const recipientObjectIds = data.recipientIds.map((id) => new Types.ObjectId(id));

    const log = new BroadcastLog({
      merchantId,
      message: data.message,
      recipientCount: recipientObjectIds.length,
      recipientIds: recipientObjectIds,
      sentAt: new Date(),
    });

    return await log.save();
  }

  static async listLogs(merchantId: Types.ObjectId) {
    return await BroadcastLog.find({ merchantId })
      .sort({ sentAt: -1 })
      .limit(50)
      .populate("recipientIds", "name phone")
      .lean();
  }
}

