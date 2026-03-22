import jwt from "jsonwebtoken";
import { randomBytes, createHash, timingSafeEqual } from "crypto";

export interface ClaimsProps {
  userId: number;
  email: string;
  role: string;
  name: string;
  avatar?: string | undefined;
}

const HashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const GenerateAccessToken = (claims: ClaimsProps) => {
  return jwt.sign(claims, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: "2m",
  });
};

export const GenerateRefreshToken = () => {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = HashToken(token);

  return { token, tokenHash };
};

export const ValidateRefreshToken = (
  providedToken: string,
  storedToken: string
): boolean => {
  const providedHash = Buffer.from(HashToken(providedToken), "hex");
  const storedHash = Buffer.from(storedToken, "hex");

  if (providedHash.length !== storedHash.length) return false;

  return timingSafeEqual(providedHash, storedHash);
};

export const ValidateAccessToken = (
  token: string,
  options?: { ignoreExpiration?: boolean }
): ClaimsProps | string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET! as string, {
      algorithms: ["HS256"],
      ignoreExpiration: options?.ignoreExpiration ?? false,
    });

    return decoded as ClaimsProps;
  } catch (error) {
    console.error(error);
    return null;
  }
};
