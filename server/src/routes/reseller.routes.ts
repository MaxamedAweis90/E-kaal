import { Router } from "express";
import { ResellerController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { resellerTransactionSchema } from "../validations";

const router = Router();

router.get("/providers", ResellerController.getProviders);
router.post("/transact", validateBody(resellerTransactionSchema), ResellerController.transact);
router.get("/history", ResellerController.listHistory);

export const resellerRoutes = router;
