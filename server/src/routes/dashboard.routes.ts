import { Router } from "express";
import { DashboardController } from "../controllers";

const router = Router();

router.get("/overview", DashboardController.getOverview);

export const dashboardRoutes = router;

