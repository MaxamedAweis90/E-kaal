import { Router } from "express";
import { dashboardRoutes } from "./dashboard.routes";
import { customerRoutes } from "./customer.routes";
import { vendorRoutes } from "./vendor.routes";
import { productRoutes } from "./product.routes";
import { resellerRoutes } from "./reseller.routes";
import { broadcastRoutes } from "./broadcast.routes";
import { subscriptionRoutes } from "./subscription.routes";
import { merchantRoutes } from "./merchant.routes";

const apiV1Router = Router();

apiV1Router.use("/dashboard", dashboardRoutes);
apiV1Router.use("/customers", customerRoutes);
apiV1Router.use("/vendors", vendorRoutes);
apiV1Router.use("/products", productRoutes);
apiV1Router.use("/reseller", resellerRoutes);
apiV1Router.use("/broadcasts", broadcastRoutes);
apiV1Router.use("/subscriptions", subscriptionRoutes);
apiV1Router.use("/merchants", merchantRoutes);

export { apiV1Router };
export default apiV1Router;

