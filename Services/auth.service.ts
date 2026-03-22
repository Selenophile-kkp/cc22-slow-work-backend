import type { LoginProps, RegisterProps } from "@/types/auth.types";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  GenerateAccessToken,
  GenerateRefreshToken,
  ValidateRefreshToken,
  type ClaimsProps,
} from "./jwt.service";

const SixMonths = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 180);

export const RegisterService = async ({
  email,
  password,
  name,
  avatar_url,
}: RegisterProps) => {
  try {
    const findUser = await prisma.user.findFirst({
      where: { email },
    });

    if (findUser) return null;

    const hashPw = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPw,
        name,
        ...(avatar_url !== undefined && { avatar_url }),
        joined_at: new Date(),
      },
    });

    return newUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const LoginService = async ({ email, password }: LoginProps) => {
  try {
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!findUser) return null;

    const comparePw = await bcrypt.compare(password, findUser.password!);
    if (!comparePw) return null;

    const claims: ClaimsProps = {
      email: findUser.email,
      name: findUser.name,
      avatar: findUser.avatar_url || undefined,
      role: findUser.role,
      userId: findUser.id,
    };

    const accessToken = GenerateAccessToken(claims);
    const { token: refreshTokenRaw, tokenHash } = GenerateRefreshToken();

    await prisma.refresh_token.upsert({
      where: { user_id: findUser.id },
      update: {
        token: tokenHash,
        expires_at: SixMonths(),
      },
      create: {
        user_id: findUser.id,
        expires_at: SixMonths(),
        token: tokenHash,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const RefreshTokenService = async (
  userId: number,
  providedToken: string
) => {
  try {
    const findUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!findUser) return null;

    const existingToken = await prisma.refresh_token.findFirst({
      where: { user_id: userId },
    });

    if (!existingToken) return null;

    if (new Date(existingToken.expires_at).getTime() <= Date.now()) {
      await prisma.refresh_token.delete({
        where: { user_id: userId },
      });
      return null;
    }

    const isValid = ValidateRefreshToken(providedToken, existingToken.token);
    if (!isValid) return null;

    const claims: ClaimsProps = {
      email: findUser.email,
      name: findUser.name,
      avatar: findUser.avatar_url || undefined,
      role: findUser.role,
      userId: findUser.id,
    };

    const accessToken = GenerateAccessToken(claims);
    const { token: newRefreshTokenRaw, tokenHash: newTokenHash } =
      GenerateRefreshToken();

    await prisma.refresh_token.update({
      where: { user_id: findUser.id },
      data: {
        token: newTokenHash,
        expires_at: SixMonths(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenRaw,
    };
  } catch (error) {
    console.error("Refresh token error: ", error);
    return null;
  }
};

// Oauth
export const GoogleCallbackService = async (claims: ClaimsProps) => {
  const accessToken = GenerateAccessToken({
    email: claims.email,
    userId: claims.userId,
    name: claims.name,
    role: claims.role,
  });
  const refreshToken = GenerateRefreshToken();

  await prisma.refresh_token.upsert({
    where: {
      user_id: claims.userId,
    },
    update: {
      token: refreshToken.tokenHash,
      expires_at: SixMonths(),
    },
    create: {
      user_id: claims.userId,
      token: refreshToken.tokenHash,
      expires_at: SixMonths(),
    },
  });

  return {
    redirect: `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken.token}`,
  };
};
