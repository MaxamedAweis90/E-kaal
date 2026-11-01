import { Router } from "express";
import { ProductController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validations";

const router = Router();

router.get("/", ProductController.listProducts);
router.post("/", validateBody(createProductSchema), ProductController.createProduct);
router.put("/:id", validateBody(updateProductSchema), ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

export const productRoutes = router;

