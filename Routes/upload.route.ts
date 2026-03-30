import express from "express";
import { VerifyUser, RequireRole } from "@/Middlewares/auth.middleware";
import { upload } from "@/Middlewares/upload.middleware";
import { UploadServiceImageController } from "@/Controllers/upload.controller";
import { Role } from "@/generated/prisma/enums";
import { UploadAvatarController } from "@/Controllers/upload-avatar.controller";

export const uploadRouter = express.Router();

uploadRouter.post(
  "/upload/service-image",
  VerifyUser,
  RequireRole(Role.FREELANCER),
  upload.single("image"),
  UploadServiceImageController
);

uploadRouter.post(
  "/upload/avatar",
  VerifyUser,
  upload.single("image"),
  UploadAvatarController
);
