import {
  GetAllServiceController,
  GetServiceByTitleController,
} from "@/Controllers/service.controller";
import express from "express";

export const serviceRouter = express.Router();

serviceRouter.get("/services", GetAllServiceController);
serviceRouter.get("/services/search", GetServiceByTitleController);
