import { prisma } from "@/lib/prisma";
import type { DataProps } from "@/types/user.types";

export const GetUserService = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        role: true,
        joined_at: true,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const EditUserService = async (userId: number, data: DataProps) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) return null;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatar_url !== undefined && {
          avatar_url: data.avatar_url,
        }),
      },
    });

    return {
      message: "Updated successfully!",
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
