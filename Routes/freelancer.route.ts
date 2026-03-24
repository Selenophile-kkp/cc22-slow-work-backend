import express from "express";
import { VerifyUser, RequireRole } from "@/Middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import {
  CreateSkillController,
  DeleteSkillController,
  EditFreelancerController,
  GetFreelancerController,
} from "@/Controllers/freelancer.controller";

export const freelancerRouter = express.Router();

freelancerRouter.get("/freelancer/:id", GetFreelancerController);
freelancerRouter.patch(
  "/freelancer/me",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  EditFreelancerController
);
freelancerRouter.post(
  "/freelancer/me/skill",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  CreateSkillController
);
freelancerRouter.delete(
  "/freelancer/me/skill/:id",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  DeleteSkillController
);
