import { jwtVerify } from "jose";
import { UnauthorizedError } from "./utils/exceptions";

// Edge runtime compatible version of verifyToken (no DI dependencies)
export async function verifyToken(
  token: string,
): Promise<{ email: string; isAdmin: boolean }> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new UnauthorizedError("JWT_SECRET not configured");
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { email: string; isAdmin: boolean };
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}