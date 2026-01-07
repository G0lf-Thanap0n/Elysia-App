import { t } from "elysia";

// ----------------------------- Body Schemas for SIGNUP ROUTE  -----------------------------

export const SignupBody = t.Object({
  user_name: t.String({ minLength: 1, maxLength: 50 }),
  user_lastname: t.String({ minLength: 1, maxLength: 50 }),
  user_username: t.String({ minLength: 1, maxLength: 50 }),
  user_email: t.String({ format: "email" }),
  user_password: t.String({ minLength: 6, maxLength: 50 }),
});

// export const SignupBody = t.Object({
//   user_name: t.String().minLength(1).maxLength(50),
//   user_lastname: t.String().minLength(1).maxLength(50),
//   user_email: t.String().email(),
//   user_password: t.String().password().minLength(6).maxLength(50),
// });

export type SignupBodyType = typeof SignupBody.static;

// ----------------------------- Body Schemas for LOGIN ROUTE  -----------------------------

export const LoginBody = t.Object({
  user_email: t.String({ format: "email" }),
  user_password: t.String({ minLength: 6, maxLength: 50 }),
});

export type LoginBodyType = typeof LoginBody.static;

// ----------------------------- Cookie Schema  -----------------------------

// export const AuthCookie = t.Object({
//   access_token: t.Cookie(t.String(), {
//     httpOnly: true, // HTTP only cookie
//     secure: true, // Secure cookie
//     sameSite: "none", // Allow cross-site requests
//     maxAge: 15 * 60 * 1000, // 15 minutes
//     path: "/",
//   }),
// });

export const AuthCookie = t.Object({
  access_token: t.Optional(t.String()),
});

export type AuthCookieType = typeof AuthCookie.static;
