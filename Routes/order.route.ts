import express from "express";
import { RequireRole, VerifyUser } from "@/Middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import {
  CreateOrderController,
  GetIncomingOrdersController,
  GetMyOrdersController,
  GetOrderByIdController,
  UpdateOrderStatusController,
} from "@/Controllers/order.controller";

export const orderRouter = express.Router();

orderRouter.post(
  "/orders",
  VerifyUser,
  RequireRole(Role.CLIENT),
  CreateOrderController
);
orderRouter.get(
  "/orders/me",
  VerifyUser,
  RequireRole(Role.CLIENT),
  GetMyOrdersController
);
orderRouter.get(
  "/orders/incoming",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  GetIncomingOrdersController
);
orderRouter.patch(
  "/orders/:id/status",
  VerifyUser,
  RequireRole(Role.CLIENT, Role.FREELANCER),
  UpdateOrderStatusController
);
orderRouter.get(
  "/orders/:id",
  VerifyUser,
  RequireRole(Role.CLIENT, Role.FREELANCER),
  GetOrderByIdController
);
