import type { Request, Response } from "express";
import { EditUserService, GetUserService } from "@/Services/user.service";

export const GetUserController = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await GetUserService(userId);

  if (!user) return res.status(404).json("User not found.");

  return res.status(200).json(user);
};

export const EditUerController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const data = req.body;

    const update = await EditUserService(userId, data);

    if (!update)
      return res.status(500).json("An error occured while editing a profile.");

    return res.status(201).json(update);
  } catch (error) {
    console.error(error);
    return res.json("Please, try again later.");
  }
};
