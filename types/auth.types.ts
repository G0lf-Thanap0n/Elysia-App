import { Context } from "elysia";
import { UserRole } from "../utils/jwt";

export type AuthUser = { id: string; role: UserRole };

export type AuthContext = Context & { user: AuthUser };
