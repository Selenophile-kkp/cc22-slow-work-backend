import express from "express";
import { RequireRole, VerifyUser } from "@/Middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import {
  CreateReviewController,
  GetFreelancerReviewsController,
} from "@/Controllers/review.controller";

export const reviewRouter = express.Router();

reviewRouter.post(
  "/reviews",
  VerifyUser,
  RequireRole(Role.CLIENT),
  CreateReviewController
);
reviewRouter.get(
  "/reviews/freelancer/:freelancerProfileId",
  GetFreelancerReviewsController
);
