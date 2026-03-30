import {
  CreateMyServicesController,
  GetAllServiceController,
  GetMyServicesController,
  GetServiceByIdController,
  SearchServicesController,
  UpdateMyServiceController,
  UpdateMyServiceStatusController,
} from "@/Controllers/service.controller";
import { Role } from "@/generated/prisma/enums";
import { RequireRole, VerifyUser } from "@/Middlewares/auth.middleware";
import express from "express";

export const serviceRouter = express.Router();

serviceRouter.get("/services", GetAllServiceController);
serviceRouter.get("/services/search", SearchServicesController);
serviceRouter.get("/services/:id", GetServiceByIdController);
serviceRouter.get(
  "/services/me",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  GetMyServicesController
);
serviceRouter.post(
  "/services",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  CreateMyServicesController
);
serviceRouter.put(
  "/services/:id",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  UpdateMyServiceController
);
serviceRouter.patch(
  "/services/:id/status",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  UpdateMyServiceStatusController
);
