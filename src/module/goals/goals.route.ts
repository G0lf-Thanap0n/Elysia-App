import Elysia from "elysia";
import {
  deleteGoalById,
  getAllGoals,
  getGoalById,
  goalCreate,
  updateGoalById,
} from "./goals.controller";
import { GoalBody, UpdateGoalBody } from "./goalsmodel";

export const goalRoute = new Elysia({ prefix: "/api/goals" })

  // ----------------------------- GET ALL GOALS ROUTE -----------------------------
  /**
   * @route /api/goals
   * @description Get all goals
   * @action admin
   */
  .get("/", getAllGoals)

  // ----------------------------- GET GOALS BY ID ROUTE -----------------------------
  /**
   * @route /api/goals/:id
   * @description Get goal by id
   * @action public
   */
  .get("/:id", getGoalById)

  // ----------------------------- CREATE GOAL ROUTE -----------------------------
  /**
   * @route /api/goals/create
   * @description Create goal
   * @action public
   */
  .post("/create", goalCreate, {
    body: GoalBody,
  })

  // ----------------------------- UPDATE GOAL ROUTE -----------------------------
  /**
   * @route /api/goals/update/:id
   * @description Update goal
   * @action public
   */
  .patch("/update/:id", updateGoalById, {
    body: UpdateGoalBody,
  })

  // ----------------------------- DELETE GOAL ROUTE -----------------------------
  /**
   * @route /api/goals/delete/:id
   * @description Delete goal
   * @action public
   */
  .delete("/delete/:id", deleteGoalById);
