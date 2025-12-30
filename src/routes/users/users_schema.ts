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

// Body schema for user logout route
export const LogoutBody = t.Object({});

export type LogoutBodyType = typeof LogoutBody.static;
