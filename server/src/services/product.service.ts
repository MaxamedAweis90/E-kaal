import { Types } from "mongoose";
import { Product, IProduct } from "../models";
import { CreateProductInput, UpdateProductInput } from "../validations";
import { roundMoney } from "../utils/math";

export class ProductService {
  static async listProducts(merchantId: Types.ObjectId) {
    const products = await Product.find({ merchantId }).sort({ createdAt: -1 }).lean();

    let totalCostValuation = 0;
    let totalSellingValuation = 0;

    const formattedProducts = products.map((p) => {
      const stock = p.stockCount || 0;
      const unitCost = roundMoney(p.unitCost);
      const sellingPrice = roundMoney(p.sellingPrice);
      const margin = roundMoney(sellingPrice - unitCost);

      totalCostValuation += stock * unitCost;
      totalSellingValuation += stock * sellingPrice;

      return {
        ...p,
        unitCost,
        sellingPrice,
        margin,
      };
    });

    const roundedCost = roundMoney(totalCostValuation);
    const roundedSelling = roundMoney(totalSellingValuation);
    const potentialProfit = roundMoney(roundedSelling - roundedCost);

    return {
      products: formattedProducts,
      metrics: {
        totalProducts: products.length,
        totalCostValuation: roundedCost,
        totalSellingValuation: roundedSelling,
        potentialProfit,
      },
    };
  }

  static async createProduct(merchantId: Types.ObjectId, data: CreateProductInput): Promise<IProduct> {
    const unitCost = roundMoney(data.unitCost);
    const sellingPrice = roundMoney(data.sellingPrice);
    const margin = roundMoney(sellingPrice - unitCost);

    const product = new Product({
      merchantId,
      name: data.name,
      barcode: data.barcode,
      stockCount: data.stockCount ?? 0,
      unitCost,
      sellingPrice,
      margin,
    });

    return await product.save();
  }

  static async updateProduct(
    merchantId: Types.ObjectId,
    productId: string,
    data: UpdateProductInput
  ): Promise<IProduct> {
    if (!Types.ObjectId.isValid(productId)) {
      throw { statusCode: 400, code: "INVALID_ID", message: "Invalid product ID" };
    }

    const product = await Product.findOne({ _id: productId, merchantId });
    if (!product) {
      throw { statusCode: 404, code: "PRODUCT_NOT_FOUND", message: "Product not found" };
    }

    if (data.name !== undefined) product.name = data.name;
    if (data.barcode !== undefined) product.barcode = data.barcode;
    if (data.stockCount !== undefined) product.stockCount = data.stockCount;
    if (data.unitCost !== undefined) product.unitCost = roundMoney(data.unitCost);
    if (data.sellingPrice !== undefined) product.sellingPrice = roundMoney(data.sellingPrice);

    product.margin = roundMoney(product.sellingPrice - product.unitCost);

    return await product.save();
  }

  static async deleteProduct(merchantId: Types.ObjectId, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw { statusCode: 400, code: "INVALID_ID", message: "Invalid product ID" };
    }

    const result = await Product.findOneAndDelete({ _id: productId, merchantId });
    if (!result) {
      throw { statusCode: 404, code: "PRODUCT_NOT_FOUND", message: "Product not found" };
    }

    return { id: productId, deleted: true };
  }
}
