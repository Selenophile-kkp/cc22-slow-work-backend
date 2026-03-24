import {
  CreateSkillsService,
  DeleteSkillService,
  EditFreelancerService,
  GetFreelancerService,
} from "@/Services/freelancer.service";
import type { Request, Response } from "express";

export const GetFreelancerController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID." });

    const profile = await GetFreelancerService({ id });

    if (!profile) return res.status(404).json("No such profile existed.");

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error.");
  }
};

export const EditFreelancerController = async (req: Request, res: Response) => {
  try {
    const { bio, location, tagline } = req.body;
    const userId = req.user!.userId;

    const profile = await EditFreelancerService({
      userId,
      data: {
        bio,
        location,
        tagline,
      },
    });

    if (!profile) return res.json("An error occured");

    return res.status(201).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error.");
  }
};

export const CreateSkillController = async (req: Request, res: Response) => {
  try {
    const { skills } = req.body;
    const userId = req.user!.userId;

    if (!Array.isArray(skills) || skills.length === 0)
      return res
        .status(400)
        .json({ message: "skills must be a non-empty array." });

    const result = await CreateSkillsService({ userId, data: skills });

    if (!result)
      return res.status(404).json({ message: "Freelancer profile not found." });

    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error.");
  }
};

export const DeleteSkillController = async (req: Request, res: Response) => {
  try {
    const skillId = Number(req.params.id);
    const deleteSkill = await DeleteSkillService({ skillId });

    if (!deleteSkill) return res.status(404).json("An error occurred!");

    return res.status(200).json(deleteSkill);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error!!!");
  }
};
