import { prisma } from "@/lib/prisma";
import {
  DeleteUserService,
  GoogleCallbackService,
  LoginService,
  RefreshTokenService,
  RegisterService,
} from "@/Services/auth.service";
import { ValidateAccessToken } from "@/Services/jwt.service";
import type { Request, Response } from "express";

const refreshTokenCookies = "refresh-token";
const accessTokenCookies = "access-token";

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
  path: "/",
});

const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
  path: "/",
});

export const RegisterController = async (req: Request, res: Response) => {
  const { email, password, name, avatar_url, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Validate roles, only accepts if these matched.
  const validRoles = ["CLIENT", "FREELANCER"];
  const resolvedRole: "CLIENT" | "FREELANCER" =
    role && validRoles.includes(role) ? role : "CLIENT";

  const result = await RegisterService({
    email,
    password,
    name,
    role: resolvedRole,
    ...(avatar_url !== undefined && { avatar_url }),
  });

  if (!result) {
    return res.status(409).json({ message: "Email is already in use." });
  }

  const { password: _pw, ...safeUser } = result as typeof result & {
    password?: string;
  };

  return res.status(201).json(safeUser);
};

export const LoginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password." });
  }

  const result = await LoginService({ email, password });

  if (!result) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const { accessToken, refreshToken } = result;

  res.cookie(accessTokenCookies, accessToken, getAccessTokenCookieOptions());
  res.cookie(refreshTokenCookies, refreshToken, getRefreshCookieOptions());

  return res.status(200).json({ accessToken });
};

export const RefreshTokenController = async (req: Request, res: Response) => {
  const providedToken = req.cookies?.[refreshTokenCookies];

  if (!providedToken) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization header." });
  }

  const expiredAccessToken = authHeader.split(" ")[1];

  const decoded = ValidateAccessToken(expiredAccessToken!, {
    ignoreExpiration: true,
  });

  if (!decoded || typeof decoded === "string") {
    return res.status(401).json({ message: "Invalid access token." });
  }

  const userId = decoded.userId as number;

  const result = await RefreshTokenService(userId, providedToken);

  if (!result) {
    res.clearCookie(refreshTokenCookies, { path: "/" });
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token." });
  }

  const { accessToken, refreshToken } = result;

  res.cookie(refreshTokenCookies, refreshToken, getRefreshCookieOptions());

  return res.status(200).json({ accessToken });
};

export const LogoutController = async (_req: Request, res: Response) => {
  res.clearCookie(refreshTokenCookies, { path: "/" });
  res.clearCookie(accessTokenCookies, { path: "/" });
  return res.status(200).json({ message: "Logged out successfully." });
};

// Oauth
export const GoogleCallbackController = async (req: Request, res: Response) => {
  const dbUser = req.user as unknown as {
    id: number;
    email: string;
    name: string;
    role: string;
    avatar_url: string | null;
  };

  if (!dbUser) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }

  const result = await GoogleCallbackService({
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as "CLIENT" | "FREELANCER",
  });

  return res.redirect(result.redirect);
};

export const DeleteUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await DeleteUserService(userId);

    if (!result.success) {
      return res
        .status(500)
        .json({ message: "Failed to delete account. Please try again." });
    }

    res.clearCookie("refresh-token", { path: "/" });

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
