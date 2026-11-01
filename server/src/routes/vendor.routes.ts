import { Router } from "express";
import { VendorController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { createVendorSchema, vendorPaymentSchema } from "../validations";

const router = Router();

router.get("/", VendorController.listVendors);
router.post("/", validateBody(createVendorSchema), VendorController.createVendor);
router.post("/:id/pay", validateBody(vendorPaymentSchema), VendorController.recordPayment);

export const vendorRoutes = router;

