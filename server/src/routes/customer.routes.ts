import { Router } from "express";
import { CustomerController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { createCustomerSchema, customerTransactionSchema } from "../validations";

const router = Router();

router.get("/", CustomerController.listCustomers);
router.post("/", validateBody(createCustomerSchema), CustomerController.createCustomer);
router.get("/:id", CustomerController.getCustomerById);
router.post("/:id/transactions", validateBody(customerTransactionSchema), CustomerController.recordTransaction);

export const customerRoutes = router;

