import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  totalOwed: z.number().min(0, "Total owed must be at least 0").optional().default(0),
});

export const vendorPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().trim().optional().default(""),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type VendorPaymentInput = z.infer<typeof vendorPaymentSchema>;

