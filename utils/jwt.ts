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
    .setProtectedHeader({ alg: "HS256" }) //Algorithm HS256 for signing the token
    .setIssuedAt() // set the time stamp if token is issued
    .setExpirationTime(exp) // set the expiration time for the token
    .sign(secret);

export const verify = async (jwt: string) =>
  (await jose.jwtVerify(jwt, secret)).payload;

export const jwt = {
  sign,
  verify,
};
