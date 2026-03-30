import express from "express";
import {
  EditUerController,
  GetUserController,
} from "@/Controllers/user.controller";
import { VerifyUser, RequireRole } from "@/Middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";

const userRouter = express.Router();

userRouter.get(
  "/user/me",
  VerifyUser,
  RequireRole(Role.CLIENT, Role.FREELANCER),
  GetUserController
);
userRouter.patch(
  "/user/update",
  VerifyUser,
  RequireRole(Role.CLIENT, Role.FREELANCER),
  EditUerController
);

export default userRouter;
