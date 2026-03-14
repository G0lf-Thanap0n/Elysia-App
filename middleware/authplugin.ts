import Elysia from "elysia";
import { jwt } from "../utils/jwt";

export const authplugin = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async ({ headers, set }) => {
    const token = headers.authorization?.split(" ")[1];

    if (!token) {
      set.status = 401;
      throw new Error("No token provided");
    }

    try {
      const payload = await jwt.verify(token);
      return { user: payload };
    } catch (err) {
      set.status = 401;
      throw new Error("Invalid token or expired token");
    }
  },
);
