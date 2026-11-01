import { Router } from "express";
import { BroadcastController } from "../controllers";
import { validateBody } from "../middleware/validate";
import { broadcastMessageSchema } from "../validations";

const router = Router();

router.post("/send", validateBody(broadcastMessageSchema), BroadcastController.sendBroadcast);
router.get("/logs", BroadcastController.listLogs);

export const broadcastRoutes = router;

