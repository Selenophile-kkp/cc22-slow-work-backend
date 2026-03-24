import {
  CreateOrderService,
  GetIncomingOrdersService,
  GetMyOrdersService,
  GetOrderByIdService,
  UpdateOrderStatusService,
} from "@/Services/order.service";
import type { Request, Response } from "express";

export const CreateOrderController = async (req: Request, res: Response) => {
  try {
    const clientId = req.user!.userId;
    const { serviceId, note } = req.body;

    if (!serviceId || isNaN(Number(serviceId)))
      return res
        .status(400)
        .json({ message: "serviceId is required and must be a number." });

    const result = await CreateOrderService({
      clientId,
      serviceId: Number(serviceId),
      note,
    });

    if (result.error === "SERVICE_NOT_FOUND")
      return res.status(404).json({ message: "Service not found." });

    if (result.error === "SERVICE_UNAVAILABLE")
      return res
        .status(409)
        .json({ message: "This service is not currently available." });

    if (result.error === "INTERNAL_ERROR")
      return res.status(500).json({ message: "Internal server error." });

    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const GetMyOrdersController = async (req: Request, res: Response) => {
  try {
    const clientId = req.user!.userId;

    const orders = await GetMyOrdersService(clientId);

    if (!orders)
      return res.status(500).json({ message: "Internal server error." });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const GetIncomingOrdersController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId;

    const result = await GetIncomingOrdersService(userId);

    if (result.error === "PROFILE_NOT_FOUND")
      return res.status(404).json({ message: "Freelancer profile not found." });

    if (result.error === "INTERNAL_ERROR")
      return res.status(500).json({ message: "Internal server error." });

    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const GetOrderByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orderId = Number(req.params.id);

    if (isNaN(orderId))
      return res.status(400).json({ message: "Invalid order ID." });

    const result = await GetOrderByIdService(userId, orderId);

    if (result.error === "NOT_FOUND")
      return res.status(404).json({ message: "Order not found." });

    if (result.error === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "You do not have access to this order." });

    if (result.error === "INTERNAL_ERROR")
      return res.status(500).json({ message: "Internal server error." });

    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const UpdateOrderStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId))
      return res.status(400).json({ message: "Invalid order ID." });

    const validStatuses = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];

    if (!status || !validStatuses.includes(status))
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}.`,
      });

    const result = await UpdateOrderStatusService(userId, orderId, status);

    if (result.error === "NOT_FOUND")
      return res.status(404).json({ message: "Order not found." });

    if (result.error === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "You do not have access to this order." });

    if (result.error === "ORDER_LOCKED")
      return res
        .status(409)
        .json({ message: "This order is already completed or cancelled." });

    if (result.error === "CLIENT_NOT_ALLOWED")
      return res.status(403).json({
        message: "Clients can only cancel an order while it is still pending.",
      });

    if (result.error === "INVALID_TRANSITION")
      return res
        .status(409)
        .json({ message: "This status transition is not allowed." });

    if (result.error === "INTERNAL_ERROR")
      return res.status(500).json({ message: "Internal server error." });

    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
