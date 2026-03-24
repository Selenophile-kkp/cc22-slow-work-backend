import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { CreateOrderProps } from "@/types/order.types";

export const CreateOrderService = async ({
  clientId,
  serviceId,
  note,
}: CreateOrderProps) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) return { error: "SERVICE_NOT_FOUND" };
    if (service.status !== "ACTIVE") return { error: "SERVICE_UNAVAILABLE" };

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + service.delivery_days);

    const order = await prisma.orders.create({
      data: {
        service_id: serviceId,
        client_id: clientId,
        freelancer_profile_id: service.freelancer_profile_id,
        price_at_order: service.price,
        due_date: dueDate,
        ...(note !== undefined && { note }),
      },
      include: {
        service: {
          select: {
            title: true,
            cover_image_url: true,
            delivery_days: true,
          },
        },
        freelancer_profile: {
          select: {
            user: { select: { name: true, avatar_url: true } },
          },
        },
      },
    });

    return { data: order };
  } catch (error) {
    console.error(error);
    return { error: "INTERNAL_ERROR" };
  }
};

export const GetMyOrdersService = async (clientId: number) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { client_id: clientId },
      include: {
        service: {
          select: {
            title: true,
            cover_image_url: true,
            delivery_days: true,
            category: { select: { name: true, slug: true } },
          },
        },
        freelancer_profile: {
          select: {
            user: { select: { name: true, avatar_url: true } },
            avg_rating: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return orders;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const GetIncomingOrdersService = async (userId: number) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return { error: "PROFILE_NOT_FOUND" };

    const orders = await prisma.orders.findMany({
      where: { freelancer_profile_id: profile.id },
      include: {
        service: {
          select: {
            title: true,
            cover_image_url: true,
            category: { select: { name: true, slug: true } },
          },
        },
        client: {
          select: {
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return { data: orders };
  } catch (error) {
    console.error(error);
    return { error: "INTERNAL_ERROR" };
  }
};

export const GetOrderByIdService = async (userId: number, orderId: number) => {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: {
            title: true,
            description: true,
            cover_image_url: true,
            delivery_days: true,
            category: { select: { name: true, slug: true } },
          },
        },
        client: {
          select: { name: true, avatar_url: true },
        },
        freelancer_profile: {
          select: {
            user: { select: { name: true, avatar_url: true } },
            avg_rating: true,
            total_review: true,
          },
        },
        reviews: true,
      },
    });

    if (!order) return { error: "NOT_FOUND" };

    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
    });

    const isClient = order.client_id === userId;
    const isFreelancer = profile && order.freelancer_profile_id === profile.id;

    if (!isClient && !isFreelancer) return { error: "FORBIDDEN" };

    return { data: order };
  } catch (error) {
    console.error(error);
    return { error: "INTERNAL_ERROR" };
  }
};

export const UpdateOrderStatusService = async (
  userId: number,
  orderId: number,
  status: OrderStatus
) => {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) return { error: "NOT_FOUND" };

    if (order.status === "COMPLETED" || order.status === "CANCELLED")
      return { error: "ORDER_LOCKED" };

    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
    });

    const isClient = order.client_id === userId;
    const isFreelancer = profile && order.freelancer_profile_id === profile.id;

    if (!isClient && !isFreelancer) return { error: "FORBIDDEN" };

    if (isClient) {
      if (order.status !== "PENDING" || status !== "CANCELLED")
        return { error: "CLIENT_NOT_ALLOWED" };
    }

    if (isFreelancer) {
      const allowedTransitions: Record<string, OrderStatus[]> = {
        PENDING: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      };

      const allowed = allowedTransitions[order.status] ?? [];
      if (!allowed.includes(status)) return { error: "INVALID_TRANSITION" };
    }

    const updated = await prisma.orders.update({
      where: { id: orderId },
      data: { status },
    });

    return { data: updated };
  } catch (error) {
    console.error(error);
    return { error: "INTERNAL_ERROR" };
  }
};
