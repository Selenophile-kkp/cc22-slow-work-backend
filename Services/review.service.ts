import { prisma } from "@/lib/prisma";
import type { CreateReviewProps } from "@/types/review.types";

export const CreateReviewService = async ({
  clientId,
  orderId,
  rating,
  comment,
}: CreateReviewProps) => {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) return { error: "ORDER_NOT_FOUND" };
    if (order.client_id !== clientId) return { error: "FORBIDDEN" };
    if (order.status !== "COMPLETED") return { error: "ORDER_NOT_COMPLETED" };

    const existing = await prisma.review.findUnique({
      where: { orders_id: orderId },
    });

    if (existing) return { error: "ALREADY_REVIEWED" };

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          orders_id: orderId,
          user_id: clientId,
          freelancer_profile_id: order.freelancer_profile_id,
          rating,
          ...(comment !== undefined && { comment }),
        },
      });

      const aggregate = await tx.review.aggregate({
        where: { freelancer_profile_id: order.freelancer_profile_id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.freelancer_profile.update({
        where: { id: order.freelancer_profile_id },
        data: {
          avg_rating: aggregate._avg.rating ?? 0,
          total_review: aggregate._count.rating,
        },
      });

      return newReview;
    });

    return { data: review };
  } catch (error) {
    console.error(error);
    return { error: "INTERNAL_ERROR" };
  }
};

export const GetFreelancerReviewsService = async (
  freelancerProfileId: number
) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: { id: freelancerProfileId },
    });

    if (!profile) return { error: "PROFILE_NOT_FOUND" };

    const reviews = await prisma.review.findMany({
      where: { freelancer_profile_id: freelancerProfileId },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        client: {
          select: { name: true, avatar_url: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return { data: reviews };
  } catch (error) {
    console.error(error);
    return { error: "INTERNAL_ERROR" };
  }
};
