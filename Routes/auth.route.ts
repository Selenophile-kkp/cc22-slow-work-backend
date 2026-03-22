import express from "express";
import {
  GoogleCallbackController,
  LoginController,
  LogoutController,
  RefreshTokenController,
  RegisterController,
} from "@/Controllers/auth.controller";
import passport from "passport";
import { VerifyUser } from "@/Middlewares/auth.middleware";

const router = express.Router();

router.post("/auth/register", RegisterController);
router.post("/auth/login", LoginController);

router.post("/auth/refresh", VerifyUser, RefreshTokenController);
router.post("/auth/logout", VerifyUser, LogoutController);

// Oauth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  GoogleCallbackController
);

export default router;
