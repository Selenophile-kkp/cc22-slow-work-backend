import { ServiceStatus } from "@/generated/prisma/enums";
import {
  CreateMyServicesService,
  GetAllServicesService,
  GetMyServicesService,
  GetServiceByIdService,
  UpdateMyServiceService,
  UpdateMyServiceStatusService,
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

export const GetServiceByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID." });

    const service = await GetServiceByIdService(id);

    if (!service)
      return res.status(404).json({ message: "Service not found." });

    return res.status(200).json(service);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const GetMyServicesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const service = await GetMyServicesService(userId);

    return res.status(200).json(service);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const CreateMyServicesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId;

    const { title, price, deliveryDays, categoryId, description, image } =
      req.body;

    if (!title || !price || !deliveryDays || !categoryId)
      return res.status(400).json({
        message: "title, price, deliveryDays, and categoryId are required.",
      });

    const service = await CreateMyServicesService({
      userId,
      data: { title, price, deliveryDays, categoryId, description, image },
    });

    if (!service)
      return res.status(404).json({ message: "Freelancer profile not found." });

    return res.status(201).json(service);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const UpdateMyServiceController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const serviceId = Number(req.params.id);

    if (isNaN(serviceId))
      return res.status(400).json({ message: "Invalid service ID." });

    const { title, price, deliveryDays, categoryId, description, image } =
      req.body;

    const service = await UpdateMyServiceService({
      userId,
      serviceId,
      data: { title, price, deliveryDays, categoryId, description, image },
    });

    if (!service)
      return res
        .status(404)
        .json({ message: "Service not found or unauthorized." });

    return res.status(200).json(service);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const UpdateMyServiceStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const serviceId = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(serviceId))
      return res.status(400).json({ message: "Invalid service ID." });

    const validStatuses = Object.values(ServiceStatus);
    if (!status || !validStatuses.includes(status))
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}.`,
      });

    const service = await UpdateMyServiceStatusService({
      userId,
      serviceId,
      status,
    });

    if (!service)
      return res
        .status(404)
        .json({ message: "Service not found or unauthorized." });

    return res.status(200).json(service);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
