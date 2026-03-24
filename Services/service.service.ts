import type { ServiceStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type {
  CreateServiceProps,
  UpdateServiceProps,
} from "@/types/service.types";

export const GetAllServicesService = async () => {
  try {
    const services = await prisma.service.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: {
          select: { name: true, slug: true, icon_url: true },
        },
        freelancer_profile: {
          select: {
            user: {
              select: { name: true, avatar_url: true },
            },
            avg_rating: true,
            total_review: true,
          },
        },
      },
    });

    return services;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const GetServiceByIdService = async (id: number) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        delivery_days: true,
        cover_image_url: true,
        status: true,
        category: { select: { name: true, slug: true } },
        freelancer_profile: {
          select: {
            id: true,
            avg_rating: true,
            total_review: true,
            tagline: true,
            user: { select: { name: true, avatar_url: true } },
          },
        },
      },
    });

    return service;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const GetMyServicesService = async (userId: number) => {
  try {
    const service = await prisma.service.findMany({
      where: {
        freelancer_profile_id: userId,
      },
    });

    return service;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const CreateMyServicesService = async ({
  userId,
  data,
}: CreateServiceProps) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return null;

    const service = await prisma.service.create({
      data: {
        freelancer_profile_id: profile.id,
        category_id: data.categoryId,
        title: data.title,
        price: data.price,
        delivery_days: data.deliveryDays,
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.image !== undefined && { cover_image_url: data.image }),
      },
    });

    return service;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const UpdateMyServiceService = async ({
  userId,
  serviceId,
  data,
}: UpdateServiceProps) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return null;

    const existing = await prisma.service.findFirst({
      where: { id: serviceId, freelancer_profile_id: profile.id },
    });

    if (!existing) return null;

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.categoryId !== undefined && { category_id: data.categoryId }),
        ...(data.deliveryDays !== undefined && {
          delivery_days: data.deliveryDays,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.image !== undefined && { cover_image_url: data.image }),
        ...(data.price !== undefined && { price: data.price }),
      },
    });

    return service;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const UpdateMyServiceStatusService = async ({
  userId,
  serviceId,
  status,
}: {
  userId: number;
  serviceId: number;
  status: ServiceStatus;
}) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return null;

    const existing = await prisma.service.findFirst({
      where: { id: serviceId, freelancer_profile_id: profile.id },
    });

    if (!existing) return null;

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: { status },
    });

    return service;
  } catch (error) {
    console.error(error);
    return null;
  }
};
