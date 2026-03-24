import { prisma } from "@/lib/prisma";

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

export const GetServiceByTitleService = async (query: string) => {
  try {
    const results = await prisma.service.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        delivery_days: true,
        cover_image_url: true,
        category: {
          select: { name: true, slug: true },
        },
        freelancer_profile: {
          select: {
            avg_rating: true,
            total_review: true,
            user: {
              select: { name: true, avatar_url: true },
            },
          },
        },
      },
      take: 10,
      orderBy: {
        created_at: "desc",
      },
    });

    return results;
  } catch (error) {
    console.error(error);
    return null;
  }
};
