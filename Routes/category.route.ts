import {
  GetCategoryBySlugController,
  GetCategoryController,
} from "@/Controllers/category.controller";
import express from "express";

export const categoryRouter = express.Router();

categoryRouter.get("/category", GetCategoryController);
categoryRouter.get("/categories/search", GetCategoryBySlugController);
