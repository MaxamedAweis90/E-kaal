import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  creditLimit: z.number().min(0, "Credit limit must be at least 0").optional().default(0),
});

export const customerTransactionSchema = z.object({
  type: z.enum(["DEBT_ADD", "DEBT_PAYMENT"], {
    errorMap: () => ({ message: "Type must be DEBT_ADD or DEBT_PAYMENT" }),
  }),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().trim().optional().default(""),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CustomerTransactionInput = z.infer<typeof customerTransactionSchema>;

