import Elysia from "elysia";
import { Goal } from "../../model/goalModel";

const goalController = new Elysia({ prefix: "/api/goals" }).get("/", () =>
  Goal.find()
);
