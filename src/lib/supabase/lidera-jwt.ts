import * as jose from "jose";

/**
 * Builds a JWT signed with Lidera's secret so the Lidera Supabase client
 * accepts it and RLS sees auth.uid() = userId (Adventure user id).
 */
export async function createLideraBridgeToken(userId: string): Promise<string> {
  const secret = process.env.LIDERA_SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("LIDERA_SUPABASE_JWT_SECRET is not set");
  }

  const encodedSecret = new TextEncoder().encode(secret);
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const iat = Math.floor(Date.now() / 1000);

  const token = await new jose.SignJWT({
    role: "authenticated",
    aal: "authenticated",
  })
    .setSubject(userId)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setAudience("authenticated")
    .setIssuer("lidera-bridge")
    .sign(encodedSecret);

  return token;
}
