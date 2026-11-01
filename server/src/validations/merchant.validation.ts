import { z } from "zod";

export const updateMerchantProfileSchema = z.object({
  shopName: z.string().trim().min(1, "Shop name is required").optional(),
  email: z.string().email("Invalid email").trim().optional(),
  phone: z.string().trim().min(1, "Phone is required").optional(),
  supportChannels: z
    .object({
      whatsapp: z.string().trim().optional(),
      call: z.string().trim().optional(),
      facebook: z.string().trim().optional(),
      tiktok: z.string().trim().optional(),
    })
    .optional(),
});

export type UpdateMerchantProfileInput = z.infer<typeof updateMerchantProfileSchema>;

