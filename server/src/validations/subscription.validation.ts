import { z } from "zod";

export const activateSubscriptionSchema = z.object({
  tier: z.enum(["1_MONTH", "6_MONTHS", "12_MONTHS"], {
    errorMap: () => ({ message: "Tier must be 1_MONTH, 6_MONTHS, or 12_MONTHS" }),
  }),
  phone: z.string().trim().min(1, "Phone is required"),
});

export type ActivateSubscriptionInput = z.infer<typeof activateSubscriptionSchema>;

