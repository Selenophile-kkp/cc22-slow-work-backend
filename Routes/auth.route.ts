import express from "express";
import {
  DeleteUserController,
  GoogleCallbackController,
  LoginController,
  LogoutController,
  RefreshTokenController,
  RegisterController,
} from "@/Controllers/auth.controller";
import passport from "passport";
import { RequireRole, VerifyUser } from "@/Middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";

const router = express.Router();

router.post("/auth/register", RegisterController);
router.post("/auth/login", LoginController);

router.post("/auth/refresh", RefreshTokenController);
router.post("/auth/logout", LogoutController);

// Oauth
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  GoogleCallbackController
);

router.delete(
  "/user/me",
  VerifyUser,
  RequireRole(Role.CLIENT, Role.FREELANCER),
  DeleteUserController
);

export default router;
