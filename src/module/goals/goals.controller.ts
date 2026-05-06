import { Context } from "elysia";
import { Goal } from "../../../model/goalModel";
import mongoose from "mongoose";
import type { JWTPayload } from "jose";
import { CreateGoalBodyType, PeriodEnumQueryType } from "./goalsmodel";
import { getPreviousPeriodRange, getStartDate } from "../../../utils/period";

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

// ----------------------------- Get All Goals Summary Controller -----------------------------
/**
 * @api [GET] /api/goals/summary
 * @description get summary of all goals
 * @action admin
 */
export const getAllGoalsSummary = async ({
  set,
  user,
  query,
}: Context<{ query: { period?: PeriodEnumQueryType } }> & UserContext) => {
  // validate user ID
  if (!user.id) {
    set.status = 401;
    return { success: false, error: "Unauthorized" };
  }

  const period = query.period || "last_30_days";
  const startDate = getStartDate(period);
  const previousPeriod = getPreviousPeriodRange(period);

  try {
    // Get all goals for overall stats
    const allGoals = await Goal.find({}).lean();

    // Get goals in current period (created within period)
    const goalsInPeriod = await Goal.find({
      createdAt: { $gte: startDate },
    }).lean();

    // Get goals in previous period for trend calculation
    const goalsInPreviousPeriod = await Goal.find({
      createdAt: { $gte: previousPeriod.start, $lte: previousPeriod.end },
    }).lean();

    // Calculate status breakdown
    const statusBreakdown = {
      total: allGoals.length,
      draft: allGoals.filter((g) => g.goal_status === "not started").length,
      inProgress: allGoals.filter((g) => g.goal_status === "in progress")
        .length,
      completed: allGoals.filter((g) => g.goal_status === "completed").length,
      abandoned: 0, // Not in current schema, defaulting to 0
    };

    // Calculate completion rates
    const overallCompletionRate =
      allGoals.length > 0
        ? (allGoals.filter((g) => g.goal_status === "completed").length /
            allGoals.length) *
          100
        : 0;

    const thisPeriodCompletionRate =
      goalsInPeriod.length > 0
        ? (goalsInPeriod.filter((g) => g.goal_status === "completed").length /
            goalsInPeriod.length) *
          100
        : 0;

    const previousPeriodCompletionRate =
      goalsInPreviousPeriod.length > 0
        ? (goalsInPreviousPeriod.filter((g) => g.goal_status === "completed")
            .length /
            goalsInPreviousPeriod.length) *
          100
        : 0;

    const trend = thisPeriodCompletionRate - previousPeriodCompletionRate;

    // Calculate category breakdown from tags
    // Note: Goal model doesn't have a category field, using tags as categories
    const tagCounts = new Map<string, { count: number; completed: number }>();

    for (const goal of allGoals) {
      const tags = goal.goal_tags || [];
      for (const tag of tags) {
        const current = tagCounts.get(tag) || { count: 0, completed: 0 };
        current.count++;
        if (goal.goal_status === "completed") {
          current.completed++;
        }
        tagCounts.set(tag, current);
      }
    }

    const categoryBreakdown = Array.from(tagCounts.entries())
      .map(([category, data]) => ({
        category: category.toUpperCase(),
        count: data.count,
        completionRate:
          data.count > 0 ? (data.completed / data.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories

    set.status = 200;
    return {
      success: true,
      data: {
        period,
        generatedAt: new Date().toISOString(),
        statusBreakdown,
        completionRate: {
          overall: Number(overallCompletionRate.toFixed(1)),
          thisperiod: Number(thisPeriodCompletionRate.toFixed(1)),
          trend: Number(trend.toFixed(1)),
        },
        categoryBreakdown,
      },
      message: "Goals summary retrieved successfully",
    };
  } catch (err) {
    console.error("Error during fetching goals summary:", err);

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

    if (err instanceof mongoose.Error) {
      set.status = 503;
      return { error: "Database unavailable" };
    }

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
}: Context<{ body: CreateGoalBodyType }> & UserContext) => {
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
    } = body;

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
