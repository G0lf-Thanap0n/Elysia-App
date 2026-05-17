// middleware/adminGuard.ts
import Elysia from "elysia";
import { authplugin } from "./authplugin";

export const adminGuard = new Elysia({ name: "adminGuard" })
  .use(authplugin)
  .onBeforeHandle({ as: "scoped" }, ({ set, user }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    if (user.role !== "Admin") {
      set.status = 403;
      return { error: "Forbidden - Admins only" };
    }
    return {};
  });
