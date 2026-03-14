import { Context } from "elysia";
import { Goal } from "../../../model/goalModel";
import mongoose from "mongoose";
import type { JWTPayload } from "jose";
import { CreateGoalBodyType } from "./goalsmodel";

// User context type from auth middleware
type UserContext = { user: JWTPayload & { id?: string } };

// ----------------------------- Get All Goals Controller -----------------------------
/**
 * @api [GET] /api/goals
 * @description get all goals
 * @action admin
 */
export const getAllGoals = async ({
  set,
  user,
  query,
}: Context & UserContext) => {
  // pagination params
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  try {
    // find all goals
    const [goals, total] = await Promise.all([
      Goal.find({ user_id: user.id })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Goal.countDocuments({ user_id: user.id }),
    ]);

    if (goals.length === 0) {
      set.status = 404;
      return { success: false, message: "No goals found" };
    }

    set.status = 200;
    return {
      success: true,
      data: goals,
      message: "Goals retrieved successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    console.error("Error during fetching goals:", err);

    if (err instanceof mongoose.Error) {
      set.status = 503;
      return { error: "Database unavailable" };
    }

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- Get Goal By ID Controller -----------------------------
/**
 * @api [GET] /api/goals/:id
 * @description get goal by id
 * @action public
 */
export const getGoalById = async ({ params, set }: Context) => {
  const { id } = params;
  try {
    // find goal by id
    const goal = await Goal.findById(id);

    // check if goal exists
    if (!goal) {
      set.status = 404;
      return { error: "Goal not found" };
    }

    set.status = 200;
    return {
      success: true,
      data: goal,
      message: "Goal retrieved successfully",
    };
  } catch (err) {
    console.error("Error during fetching goal:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- Goal Create Controller -----------------------------
/**
 * @api [POST] /api/goals/create
 * @description create goal
 * @action authenticated
 */
export const createGoal = async ({
  body,
  set,
  user,
}: Context & UserContext) => {
  try {
    // Verify user is authenticated
    if (!user?.id) {
      set.status = 401;
      return { error: "Unauthorized - User not authenticated" };
    }

    const {
      goal_title,
      goal_description,
      goal_smart,
      goal_status = "not started",
      goal_tags = [],
      goal_isPublic = false,
    } = body as CreateGoalBodyType;

    const createdGoal = await Goal.create({
      goal_title,
      goal_description,
      goal_smart,
      goal_status,
      user_id: user.id,
      goal_tags,
      goal_isPublic,
    });

    set.status = 201;
    return {
      success: true,
      data: createdGoal,
      message: "Goal created successfully",
    };
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      set.status = 400;
      return { error: "Invalid data", details: err.message };
    }

    if (err instanceof mongoose.Error) {
      set.status = 503;
      return { error: "Database unavailable" };
    }

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- Update Goal By ID Controller -----------------------------
/**
 * @api [PATCH] /api/goals/:id
 * @description update goal by id
 * @action public
 */
interface UpdateGoalBody {
  goal_title?: string;
  goal_description?: string;
  goal_smart?: {
    smart_specific?: string;
    smart_measurable?: string;
    smart_achievable?: string;
    smart_relevant?: string;
    smart_timeBound?: string;
  };
  goal_status?: "not started" | "in progress" | "completed";
  goal_tags?: string[];
  goal_isPublic?: boolean;
}

export const updateGoalById = async ({
  params,
  body,
  set,
}: Context<{ body: UpdateGoalBody }>) => {
  try {
    const { id } = params;
    const {
      goal_title,
      goal_description,
      goal_smart,
      goal_status,
      goal_tags,
      goal_isPublic,
    } = body;

    const goal = await Goal.findById(id);

    // check if goal exists
    if (!goal) {
      set.status = 404;
      return { error: "Goal not found" };
    }

    if (!body) {
      set.status = 400;
      return { error: "No data provided for update" };
    }

    //update goal details
    goal.goal_title = goal_title || goal.goal_title;
    goal.goal_description = goal_description || goal.goal_description;

    // Handle goal_smart object merge properly
    if (goal_smart) {
      goal.goal_smart = {
        smart_specific:
          goal_smart.smart_specific || goal.goal_smart.smart_specific,
        smart_measurable:
          goal_smart.smart_measurable || goal.goal_smart.smart_measurable,
        smart_achievable:
          goal_smart.smart_achievable || goal.goal_smart.smart_achievable,
        smart_relevant:
          goal_smart.smart_relevant || goal.goal_smart.smart_relevant,
        smart_timeBound:
          goal_smart.smart_timeBound || goal.goal_smart.smart_timeBound,
      };
    }

    goal.goal_status = goal_status || goal.goal_status;
    goal.goal_tags = goal_tags || goal.goal_tags;
    goal.goal_isPublic =
      goal_isPublic !== undefined ? goal_isPublic : goal.goal_isPublic;

    const updatedGoal = await goal.save();

    if (!updatedGoal) {
      set.status = 400;
      return { status: "error", message: "Goal update failed" };
    }

    set.status = 200;
    return {
      success: "success",
      message: "Goal updated successfully",
      data: updatedGoal,
    };
  } catch (err) {
    console.error("Error during updating goal:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- Delete Goal By ID Controller -----------------------------
/**
 * @api [DELETE] /api/goals/:id
 * @description delete goal by id
 * @action public
 */
export const deleteGoalById = async ({ params, set }: Context) => {
  const { id } = params;
  try {
    const goal = await Goal.findByIdAndDelete(id);
    set.status = 200;
    return {
      success: true,
      data: goal,
      message: "Goal deleted successfully",
    };
  } catch (err) {
    console.error("Error during deleting goal:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};
