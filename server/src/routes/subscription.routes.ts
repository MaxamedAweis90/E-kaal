import { Router } from "express";
import { SubscriptionController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { activateSubscriptionSchema } from "../validations";

const router = Router();

router.post("/activate", validateBody(activateSubscriptionSchema), SubscriptionController.activate);
router.get("/plans", SubscriptionController.getPlans);

export const subscriptionRoutes = router;

