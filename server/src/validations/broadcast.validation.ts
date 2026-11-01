import { z } from "zod";

export const broadcastMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(125, "Message cannot exceed 125 characters"),
  recipientIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")).min(1, "At least one recipient ID is required"),
});

export type BroadcastMessageInput = z.infer<typeof broadcastMessageSchema>;

