import {
  CreateReviewService,
  GetFreelancerReviewsService,
} from "@/Services/review.service";
import type { Request, Response } from "express";

export const CreateReviewController = async (req: Request, res: Response) => {
  try {
    const clientId = req.user!.userId;
    const { orderId, rating, comment } = req.body;

    if (!orderId || isNaN(Number(orderId)))
      return res
        .status(400)
        .json({ message: "orderId is required and must be a number." });

    if (!rating || isNaN(Number(rating)) || rating < 1 || rating > 5)
      return res
        .status(400)
        .json({ message: "rating is required and must be between 1 and 5." });

    const result = await CreateReviewService({
      clientId,
      orderId: Number(orderId),
      rating: Number(rating),
      comment,
    });

    if (result.error === "ORDER_NOT_FOUND")
      return res.status(404).json({ message: "Order not found." });

    if (result.error === "FORBIDDEN")
      return res
        .status(403)
        .json({ message: "You do not have access to this order." });

    if (result.error === "ORDER_NOT_COMPLETED")
      return res
        .status(409)
        .json({ message: "You can only review a completed order." });

    if (result.error === "ALREADY_REVIEWED")
      return res
        .status(409)
        .json({ message: "You have already reviewed this order." });

    if (result.error === "INTERNAL_ERROR")
      return res.status(500).json({ message: "Internal server error." });

    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const GetFreelancerReviewsController = async (
  req: Request,
  res: Response
) => {
  try {
    const freelancerProfileId = Number(req.params.freelancerProfileId);

    if (isNaN(freelancerProfileId))
      return res
        .status(400)
        .json({ message: "Invalid freelancer profile ID." });

    const result = await GetFreelancerReviewsService(freelancerProfileId);

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
