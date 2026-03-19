import type { RegisterProps } from "@/types/auth.types";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const RegisterService = async ({
  email,
  password,
  name,
  avatar_url,
}: RegisterProps) => {
  try {
    const findUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (findUser) return null;
    const hashPw = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPw,
        name,
        ...(avatar_url !== undefined && { avatar_url }),
      },
    });

    return newUser;
  } catch (error) {
    console.error(error);
  }
};
