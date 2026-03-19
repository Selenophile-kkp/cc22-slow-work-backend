import { RegisterService } from "@/Services/auth.service";
import type { Request, Response } from "express";

export const RegisterController = async (req: Request, res: Response) => {
  const { email, password, name, avatar_url } = req.body;

  return res.status(201).json(
    await RegisterService({
      email,
      password,
      name,
      ...(avatar_url !== undefined && { avatar_url }),
    })
  );
};

export const LoginController = async (req: Request, res: Response) => {
  const { name, age } = req.body;

  return res.status(201).json({
    message: "Login successfully!",
    name,
    age,
  });
};
