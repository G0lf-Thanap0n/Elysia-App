import * as jose from "jose";

const secret = new TextEncoder().encode(Bun.env.JWT_SECRET || "secret");
if (!secret) {
  throw new Error("Missing JWT_SECRET");
}

type JWT = {
  data: jose.JWTPayload;
  exp?: string | number;
};

export const sign = async ({ data, exp = "7d" }: JWT) =>
  await new jose.SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);

export const verify = async (jwt: string) =>
  (await jose.jwtVerify(jwt, secret)).payload;

export const jwt = {
  sign,
  verify,
};
