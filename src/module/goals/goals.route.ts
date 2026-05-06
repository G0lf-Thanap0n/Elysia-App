import Elysia, { t } from "elysia";
import {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoalById,
  deleteGoalById,
  getAllGoalsSummary,
} from "./goals.controller";
import { CreateGoalBody, PeriodEnumQuery, UpdateGoalBody } from "./goalsmodel";
import { authplugin } from "../../../middleware/authplugin";

export const goalRoute = new Elysia({ prefix: "/api/goals" })
  .use(authplugin)
  // ----------------------------- GET ALL GOALS ROUTE -----------------------------
  /**
   * @route /api/goals
   * @description Retrieve all goals with pagination support
   * @action admin
   */
  .get("/", getAllGoals, {
    detail: {
      summary: "Get all goals",
      description:
        "Retrieve a paginated list of all goals in the system. Requires authentication.",
      tags: ["Goals"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number for pagination (starts from 1)",
          required: false,
          example: 1,
          schema: {
            type: "number",
            default: 1,
            minimum: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Number of goals per page",
          required: false,
          example: 10,
          schema: {
            type: "number",
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
      ],
      responses: {
        200: {
          description: "Successfully retrieved all goals with pagination info",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                          example: "507f1f77bcf86cd799439011",
                        },
                        goal_title: {
                          type: "string",
                          example: "Complete Marathon",
                        },
                        goal_description: {
                          type: "string",
                          example: "Run a full marathon",
                        },
                        goal_status: {
                          type: "string",
                          enum: ["not started", "in progress", "completed"],
                        },
                        goal_smart: { type: "object" },
                        goal_tags: { type: "array", items: { type: "string" } },
                        goal_isPublic: { type: "boolean" },
                        user_id: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Goals retrieved successfully",
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      total: { type: "number", example: 25 },
                      page: { type: "number", example: 1 },
                      limit: { type: "number", example: 10 },
                      totalPages: { type: "number", example: 3 },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Invalid or missing authentication token",
        },
        403: { description: "Forbidden - Insufficient permissions" },
        404: { description: "Not Found - No goals found for this user" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- GET ALL GOAL SUMMARY ROUTE -----------------------------
  /**
   * @route /api/goals/summary
   * @description Retrieve summary of all goals
   * @action admin
   */
  .get("/summary", getAllGoalsSummary, {
    query: t.Object({
      period: t.Optional(PeriodEnumQuery),
    }),
    detail: {
      summary: "Get goals summary",
      description:
        "Retrieve comprehensive summary statistics of all goals including status breakdown, completion rates, trends, and category analysis. Supports filtering by time period for trend analysis.",
      tags: ["Goals"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "period",
          in: "query",
          description:
            "Time period for summary analysis (defaults to last_30_days)",
          required: false,
          example: "last_30_days",
          schema: {
            type: "string",
            enum: ["today", "last_7_days", "last_30_days", "last_year"],
            default: "last_30_days",
          },
        },
      ],
      responses: {
        200: {
          description: "Successfully retrieved goals summary with statistics",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      period: {
                        type: "string",
                        enum: [
                          "today",
                          "last_7_days",
                          "last_30_days",
                          "last_year",
                        ],
                        description: "The requested analysis period",
                        example: "last_30_days",
                      },
                      generatedAt: {
                        type: "string",
                        format: "date-time",
                        description:
                          "ISO 8601 timestamp when the summary was generated",
                        example: "2026-05-07T10:30:00.000Z",
                      },
                      statusBreakdown: {
                        type: "object",
                        description:
                          "Breakdown of goals by their current status",
                        properties: {
                          total: {
                            type: "number",
                            description: "Total number of goals",
                            example: 15,
                          },
                          draft: {
                            type: "number",
                            description:
                              "Number of goals with status 'not started'",
                            example: 4,
                          },
                          inProgress: {
                            type: "number",
                            description:
                              "Number of goals with status 'in progress'",
                            example: 8,
                          },
                          completed: {
                            type: "number",
                            description:
                              "Number of goals with status 'completed'",
                            example: 3,
                          },
                          abandoned: {
                            type: "number",
                            description:
                              "Number of abandoned goals (reserved for future use)",
                            example: 0,
                          },
                        },
                      },
                      completionRate: {
                        type: "object",
                        description: "Goal completion metrics and trends",
                        properties: {
                          overall: {
                            type: "number",
                            description:
                              "Overall completion percentage across all goals (0-100)",
                            example: 20.0,
                          },
                          thisperiod: {
                            type: "number",
                            description:
                              "Completion percentage for goals in the current period (0-100)",
                            example: 25.0,
                          },
                          trend: {
                            type: "number",
                            description:
                              "Percentage point change in completion rate compared to previous period (can be positive or negative)",
                            example: 5.0,
                          },
                        },
                      },
                      categoryBreakdown: {
                        type: "array",
                        description:
                          "Top 5 categories based on goal tags with completion statistics",
                        items: {
                          type: "object",
                          properties: {
                            category: {
                              type: "string",
                              description:
                                "Category name (uppercased from goal tags)",
                              example: "FITNESS",
                            },
                            count: {
                              type: "number",
                              description: "Number of goals in this category",
                              example: 6,
                            },
                            completionRate: {
                              type: "number",
                              description:
                                "Percentage of completed goals in this category (0-100)",
                              example: 33.3,
                            },
                          },
                        },
                        example: [
                          {
                            category: "FITNESS",
                            count: 6,
                            completionRate: 33.3,
                          },
                          {
                            category: "LEARNING",
                            count: 5,
                            completionRate: 20.0,
                          },
                          {
                            category: "HEALTH",
                            count: 4,
                            completionRate: 25.0,
                          },
                        ],
                      },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Goals summary retrieved successfully",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid authentication token",
        },
        403: {
          description: "Forbidden - Insufficient permissions to view summary",
        },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- GET GOALS BY ID ROUTE -----------------------------
  /**
   * @route /api/goals/:id
   * @description Get a specific goal by id
   * @action public
   */
  .get("/:id", getGoalById, {
    detail: {
      summary: "Get goal by ID",
      description: "Retrieve a specific goal by its unique identifier",
      tags: ["Goals"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          description: "Unique identifier of the goal",
          required: true,
          example: "507f1f77bcf86cd799439011",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
          },
        },
      ],
      responses: {
        200: {
          description: "Successfully retrieved the goal",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      goal_title: {
                        type: "string",
                        example: "Learn TypeScript",
                      },
                      goal_description: {
                        type: "string",
                        example:
                          "Master TypeScript fundamentals and advanced concepts",
                      },
                      goal_status: {
                        type: "string",
                        enum: ["not started", "in progress", "completed"],
                        example: "in progress",
                      },
                      goal_smart: {
                        type: "object",
                        properties: {
                          smart_specific: { type: "string" },
                          smart_measurable: { type: "string" },
                          smart_achievable: { type: "string" },
                          smart_relevant: { type: "string" },
                          smart_timeBound: { type: "string" },
                        },
                      },
                      goal_tags: {
                        type: "array",
                        items: { type: "string" },
                        example: ["programming", "learning"],
                      },
                      goal_isPublic: { type: "boolean", example: true },
                      user_id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439012",
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-29T10:30:00Z",
                      },
                      updatedAt: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-29T15:45:00Z",
                      },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Goal retrieved successfully",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid authentication token",
        },
        403: {
          description:
            "Forbidden - You do not have permission to view this goal",
        },
        404: {
          description: "Not Found - Goal with specified ID does not exist",
        },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- CREATE GOAL ROUTE -----------------------------
  /**
   * @route /api/goals/create
   * @description Create a new goal with SMART criteria
   * @action authenticated
   */
  .post("/create", createGoal, {
    body: CreateGoalBody,
    detail: {
      summary: "Create a new goal",
      description: "Create a new goal with the provided data",
      tags: ["Goals"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        description: "Goal creation payload with required and optional fields",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["goal_title", "goal_smart"],
              properties: {
                goal_title: {
                  type: "string",
                  description: "The main title or name of the goal (required)",
                  example: "Complete a 10K run",
                },
                goal_description: {
                  type: "string",
                  description:
                    "Detailed description explaining the goal (optional)",
                  example: "Run 10 kilometers without stopping in under 1 hour",
                },
                goal_smart: {
                  type: "object",
                  description:
                    "SMART criteria breakdown (all required when creating)",
                  required: [
                    "smart_specific",
                    "smart_measurable",
                    "smart_achievable",
                    "smart_relevant",
                    "smart_timeBound",
                  ],
                  properties: {
                    smart_specific: {
                      type: "string",
                      description: "What exactly will be accomplished",
                      example: "Run 10 km distance",
                    },
                    smart_measurable: {
                      type: "string",
                      description: "How progress will be measured",
                      example:
                        "Complete 10 km in under 60 minutes using GPS tracking",
                    },
                    smart_achievable: {
                      type: "string",
                      description: "How to achieve this goal realistically",
                      example:
                        "Train 4 times per week for 8 weeks with progressive distance increase",
                    },
                    smart_relevant: {
                      type: "string",
                      description: "Why this goal matters",
                      example:
                        "Improve cardiovascular fitness and build endurance",
                    },
                    smart_timeBound: {
                      type: "string",
                      description: "Specific deadline or timeframe",
                      example: "Complete by August 31, 2026",
                    },
                  },
                },
                goal_status: {
                  type: "string",
                  enum: ["not started", "in progress", "completed"],
                  description:
                    "Initial status of the goal (optional, defaults to 'not started')",
                  example: "not started",
                },
                goal_tags: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Tags for categorizing and organizing the goal (optional)",
                  example: ["fitness", "health", "running"],
                },
                goal_isPublic: {
                  type: "boolean",
                  description:
                    "Whether the goal is publicly visible (optional, defaults to false)",
                  example: false,
                },
              },
            },
            example: {
              goal_title: "Complete a 10K run",
              goal_description:
                "Run 10 kilometers without stopping in under 1 hour",
              goal_smart: {
                smart_specific: "Run 10 km distance",
                smart_measurable:
                  "Complete 10 km in under 60 minutes using GPS tracking",
                smart_achievable: "Train 4 times per week for 8 weeks",
                smart_relevant: "Improve cardiovascular fitness and endurance",
                smart_timeBound: "Complete by August 31, 2026",
              },
              goal_status: "not started",
              goal_tags: ["fitness", "health"],
              goal_isPublic: false,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Goal created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      goal_title: { type: "string" },
                      goal_description: { type: "string" },
                      goal_status: { type: "string" },
                      goal_smart: { type: "object" },
                      goal_tags: { type: "array", items: { type: "string" } },
                      goal_isPublic: { type: "boolean" },
                      user_id: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Goal created successfully",
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Bad Request - Missing required fields or invalid SMART criteria format",
        },
        401: {
          description: "Unauthorized - Missing or invalid authentication token",
        },
        403: {
          description:
            "Forbidden - User does not have permission to create goals",
        },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- UPDATE GOAL ROUTE -----------------------------
  /**
   * @route /api/goals/update/:id
   * @description Update an existing goal with partial or full updates
   * @action public
   */
  .patch("/update/:id", updateGoalById, {
    body: UpdateGoalBody,
    detail: {
      summary: "Update goal by ID",
      description:
        "Update one or more fields of an existing goal. All fields in the request body are optional, allowing partial updates. Only the provided fields will be updated; other fields remain unchanged. Supports updating title, description, SMART criteria, status, tags, and visibility.",
      tags: ["Goals"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          description:
            "Unique identifier of the goal to update (MongoDB ObjectId format)",
          required: true,
          example: "507f1f77bcf86cd799439011",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
          },
        },
      ],
      requestBody: {
        required: true,
        description:
          "Goal update payload - all fields are optional for partial updates",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                goal_title: {
                  type: "string",
                  description: "Updated goal title (optional)",
                  example: "Complete a Half Marathon",
                },
                goal_description: {
                  type: "string",
                  description: "Updated description (optional)",
                  example: "Run 21.1 kilometers in under 2 hours",
                },
                goal_smart: {
                  type: "object",
                  description:
                    "Update SMART criteria (all properties optional)",
                  properties: {
                    smart_specific: { type: "string" },
                    smart_measurable: { type: "string" },
                    smart_achievable: { type: "string" },
                    smart_relevant: { type: "string" },
                    smart_timeBound: { type: "string" },
                  },
                },
                goal_status: {
                  type: "string",
                  enum: ["not started", "in progress", "completed"],
                  description: "Update goal status (optional)",
                  example: "in progress",
                },
                goal_tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Update tags array (optional)",
                  example: ["fitness", "running"],
                },
                goal_isPublic: {
                  type: "boolean",
                  description: "Update visibility status (optional)",
                  example: true,
                },
              },
            },
            example: {
              goal_status: "in progress",
              goal_smart: {
                smart_timeBound: "By June 30, 2026",
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Goal updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "string", example: "success" },
                  data: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      goal_title: { type: "string" },
                      goal_description: { type: "string" },
                      goal_status: { type: "string" },
                      goal_smart: { type: "object" },
                      goal_tags: { type: "array", items: { type: "string" } },
                      goal_isPublic: { type: "boolean" },
                      user_id: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Goal updated successfully",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request - Invalid data format or missing goal ID",
        },
        401: {
          description: "Unauthorized - Missing or invalid authentication token",
        },
        403: {
          description:
            "Forbidden - You do not have permission to update this goal",
        },
        404: {
          description: "Not Found - Goal with specified ID does not exist",
        },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- DELETE GOAL ROUTE -----------------------------
  /**
   * @route /api/goals/delete/:id
   * @description Permanently delete a goal by its ID
   * @action public
   */
  .delete("/delete/:id", deleteGoalById, {
    detail: {
      summary: "Delete goal by ID",
      description:
        "Permanently delete a goal and all its associated data including history, comments, and attachments. This action is irreversible and cannot be undone. Only the goal owner or administrators can delete a goal.",
      tags: ["Goals"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          description:
            "Unique identifier of the goal to delete (MongoDB ObjectId format)",
          required: true,
          example: "507f1f77bcf86cd799439011",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
          },
        },
      ],
      responses: {
        200: {
          description:
            "Goal deleted successfully - returns the deleted goal data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    description: "The deleted goal object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      goal_title: { type: "string" },
                      goal_description: { type: "string" },
                      goal_status: { type: "string" },
                      goal_smart: { type: "object" },
                      goal_tags: { type: "array", items: { type: "string" } },
                      goal_isPublic: { type: "boolean" },
                      user_id: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Goal deleted successfully",
                  },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized - Missing or invalid authentication token. You must be logged in to delete a goal.",
        },
        403: {
          description:
            "Forbidden - You do not have permission to delete this goal. Only the owner or administrators can delete it.",
        },
        404: {
          description:
            "Not Found - Goal with specified ID does not exist or has already been deleted.",
        },
        500: {
          description:
            "Internal Server Error - An unexpected error occurred while deleting the goal.",
        },
        503: {
          description:
            "Service Unavailable - Database connection error or service is temporarily unavailable.",
        },
      },
    },
  });
