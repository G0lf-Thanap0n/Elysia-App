import Elysia from "elysia";
import { Goal } from "../../../model/goalModel";

const goalRoute = new Elysia({ prefix: "/api/goals" }).get("/", () =>
  Goal.find()
);
