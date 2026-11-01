import { Router } from "express";
import { MerchantController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { updateMerchantProfileSchema } from "../validations";

const router = Router();

router.get("/profile", MerchantController.getProfile);
router.put("/profile", validateBody(updateMerchantProfileSchema), MerchantController.updateProfile);

export const merchantRoutes = router;

