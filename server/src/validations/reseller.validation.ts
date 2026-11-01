import { z } from "zod";

export const resellerTransactionSchema = z.object({
  provider: z.enum(["HORMUUD", "SOMTEL", "TELESOM"]).optional().default("HORMUUD"),
  recipientPhone: z.string().trim().min(1, "Recipient phone is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  earningProfit: z.number().min(0, "Earning profit must be at least 0").optional(),
});

export type ResellerTransactionInput = z.infer<typeof resellerTransactionSchema>;
