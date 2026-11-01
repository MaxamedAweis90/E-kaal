import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  barcode: z.string().trim().optional(),
  stockCount: z.number().int().min(0, "Stock count must be at least 0").optional().default(0),
  unitCost: z.number().min(0, "Unit cost must be at least 0"),
  sellingPrice: z.number().min(0, "Selling price must be at least 0"),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  barcode: z.string().trim().optional(),
  stockCount: z.number().int().min(0, "Stock count must be at least 0").optional(),
  unitCost: z.number().min(0, "Unit cost must be at least 0").optional(),
  sellingPrice: z.number().min(0, "Selling price must be at least 0").optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

