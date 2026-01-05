import { t } from "elysia";

// Body schema for user signup route
export const SignupBody = t.Object({
  user_name: t.String().min(1).max(50),
  user_lastname: t.String().min(1).max(50),
  user_email: t.String().email(),
  user_password: t.String().password().min(6).max(50),
});

export type SignupBodyType = typeof SignupBody.static;

// Body schema for user login route
export const LoginBody = t.Object({
  user_email: t.String().email(),
  user_password: t.String().Password(),
});

export type LoginBodyType = typeof LoginBody.static;

// Cookie schema
export const AuthCookie = t.Object({
  access_token: t.Cookie(t.String(), {
    httpOnly: true, // HTTP only cookie
    secure: true, // Secure cookie
    sameSite: "none", // Allow cross-site requests
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  }),
});

export type AuthCookieType = typeof AuthCookie.static;
