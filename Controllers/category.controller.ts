import {
  GetCategoryService,
  SearchCategoryBySlugService,
} from "@/Services/category.service";
import type { Request, Response } from "express";

export const GetCategoryController = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await GetCategoryService());
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const GetCategoryBySlugController = async (
  req: Request,
  res: Response
) => {
  try {
    const slug = req.query.q as string;

    if (!slug || slug.trim() === "")
      return res.status(400).json({ message: "Query param 'q' is required." });

    const results = await SearchCategoryBySlugService(slug.trim());

    if (!results)
      return res.status(500).json({ message: "Internal server error." });

    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
