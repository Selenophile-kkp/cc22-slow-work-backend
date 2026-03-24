import { prisma } from "@/lib/prisma";

export const GetCategoryService = async () => {
  try {
    const category = await prisma.category.findMany();

    return category;
  } catch (error) {}
};

export const SearchCategoryBySlugService = async (slug: string) => {
  try {
    const results = await prisma.category.findMany({
      where: {
        slug: {
          contains: slug,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon_url: true,
      },
      take: 10,
    });

    return results;
  } catch (error) {
    console.error(error);
    return null;
  }
};
