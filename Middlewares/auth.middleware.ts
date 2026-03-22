import type { NextFunction, Request, Response } from "express";
import { ValidateAccessToken } from "@/Services/jwt.service";

export const VerifyUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json("Authorization failed. No access token.");

  const decoded = ValidateAccessToken(token);

  if (!decoded || typeof decoded === "string")
    return res.status(401).json("Could not verify token.");

  req.user = decoded;
  next();
};

export const RequireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json("Forbidden. Insufficient role.");
    next();
  };
};
