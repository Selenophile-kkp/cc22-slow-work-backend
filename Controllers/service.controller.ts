import {
  GetAllServicesService,
  GetServiceByTitleService,
} from "@/Services/service.service";
import type { Request, Response } from "express";

export const GetAllServiceController = async (req: Request, res: Response) => {
  try {
    const services = await GetAllServicesService();

    return res.status(200).json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const GetServiceByTitleController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim() === "")
      return res.status(400).json({ message: "Query param 'q' is required." });

    const results = await GetServiceByTitleService(query.trim());

    if (!results)
      return res.status(500).json({ message: "Internal server error." });

    return res.status(200).json(results);
  } catch (error) {}
};
