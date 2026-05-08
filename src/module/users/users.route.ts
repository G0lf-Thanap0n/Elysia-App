import { Elysia, status, t } from "elysia";
import {
  AuthCookie,
  LoginBody,
  SignupBody,
  UpdateUserBody,
} from "./usersmodel";
import {
  getAllUsers,
  getUserById,
  signupUser,
  updateUser,
  loginUser,
  deleteUser,
  logoutUser,
} from "./users.controller";
import { success } from "better-auth/*";

export const userRoute = new Elysia({ prefix: "/api/users" })

  // ----------------------------- SIGNUP ROUTE -----------------------------
  /**
   * @route /api/users/signup
   * @description Create a new user account
   * @action public
   */
  .post("/signup", signupUser, {
    body: SignupBody,
    detail: {
      summary: "Signup a new user",
      description: "Create a new user account",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        description: "User signup data payload",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "user_name",
                "user_lastname",
                "user_username",
                "user_email",
                "user_password",
              ],
              properties: {
                user_name: {
                  type: "string",
                  description: "The user's first name",
                  example: "John",
                },
                user_lastname: {
                  type: "string",
                  description: "The user's last name",
                  example: "Doe",
                },
                user_username: {
                  type: "string",
                  description: "The user's username",
                  example: "johndoe",
                },
                user_email: {
                  type: "string",
                  description: "The user's email address",
                  example: "johndoe@example.com",
                },
                user_password: {
                  type: "string",
                  description: "The user's password",
                  example: "123securepassword",
                },
              },
            },
            example: {
              user_name: "John",
              user_lastname: "Doe",
              user_username: "johndoe",
              user_email: "johndoe@example.com",
              user_password: "123securepassword",
            },
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: {
                        type: "string",
                        example: "your_access_token",
                      },
                    },
                  },
                  user: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      user_name: { type: "string", example: "John" },
                      user_lastname: { type: "string", example: "Doe" },
                      user_username: { type: "string", example: "johndoe" },
                      user_email: {
                        type: "string",
                        example: "johndoe@example.com",
                      },
                      user_status: {
                        type: "boolean",
                        example: true,
                      },
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
        400: { description: "Bad Request - Invalid data" },
        401: { description: "Unauthorized - Missing or invalid token" },
        403: { description: "Forbidden - Insufficient permissions" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database error" },
      },
    },
  })
  // ----------------------------- GET ALL USERS ROUTE -----------------------------
  /**
   * @route /api/users
   * @description Get all users
   * @action admin
   */
  .get("/", getAllUsers, {
    detail: {
      summary: "Get all users",
      description: "Get all users",
      tags: ["Users"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Successful response with an array of users",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: {
                    type: "string",
                    example: "Users fetched sucessfully",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                          example: "507f1f77bcf86cd799439011",
                        },
                        user_name: { type: "string", example: "John" },
                        user_lastname: { type: "string", example: "Doe" },
                        user_username: { type: "string", example: "johndoe" },
                        user_email: {
                          type: "string",
                          example: "johndoe@example.com",
                        },
                        user_role: { type: "string", example: "user" },
                        user_iamge: {
                          type: "string",
                          example: "https://example.com/profile.jpg",
                        },
                        user_active: { type: "boolean", example: "true" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized - Missing or invalid token" },
        403: { description: "Forbidden - Insufficient permissions" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- GET USER BY ID ROUTE -----------------------------
  /**
   * @route /api/users/:id
   * @description Get a single user
   * @action public
   */
  .get("/:id", getUserById, {
    detail: {
      summary: "Get user by ID",
      description: "Get a single user by their unique identifier",
      tags: ["Users"],
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
          description: "Successful response with the user data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: {
                    type: "string",
                    example: "User fetched successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      user_name: { type: "string", example: "John" },
                      user_lastname: { type: "string", example: "Doe" },
                      user_username: { type: "string", example: "johndoe" },
                      user_email: {
                        type: "string",
                        example: "johndoe@example.com",
                      },
                      user_role: { type: "string", example: "user" },
                      user_iamge: {
                        type: "string",
                        example: "https://example.com/profile.jpg",
                      },
                      user_active: { type: "boolean", example: "true" },
                      user_goals: {
                        type: "array",
                        items: {
                          type: "string",
                          example: [
                            "677f1f77bcf86cd395048104",
                            "677f1f77bcf86cd395048105",
                          ],
                        },
                      },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized - Missing or invalid token" },
        403: { description: "Forbidden - Insufficient permissions" },
        404: { description: "Not Found - User not found" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- LOGIN ROUTE -----------------------------
  /**
   * @route /api/users/login
   * @description Login a user
   * @cookie Stateful access_token cookie
   * @action public
   */
  .post("/login", loginUser, {
    cookie: AuthCookie,
    body: LoginBody,
    detail: {
      summary: "Login a user",
      description: "Login a user with their email and password",
      tags: ["Users"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        description: "User login data payload",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["user_email", "user_password"],
              properties: {
                user_email: {
                  type: "string",
                  description: "The user's email address",
                  example: "johndoe@example.com",
                },
                user_password: {
                  type: "string",
                  description: "The user's password",
                  example: "123securepassword",
                },
              },
            },
            example: {
              user_email: "johndoe@example.com",
              user_password: "123securepassword",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successful response with the user data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "number", example: 200 },
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: {
                        type: "string",
                        example: "your_access_token",
                      },
                    },
                  },
                  user: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      user_name: { type: "string", example: "John" },
                      user_lastname: { type: "string", example: "Doe" },
                      user_username: { type: "string", example: "johndoe" },
                      user_email: {
                        type: "string",
                        example: "johndoe@example.com",
                      },
                      user_status: {
                        type: "boolean",
                        example: true,
                      },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Login successfully (Cookie set!)",
                  },
                },
              },
            },
          },
        },
        400: { description: "Bad Request - Invalid data" },
        401: { description: "Unauthorized - Missing or invalid token" },
        403: { description: "Forbidden - Insufficient permissions" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- UPDATE USER ROUTE -----------------------------
  /**
   * @api [PATCH] /api/users/update/:id
   * @description Update a single user by id
   * @action public
   */
  .patch("/update/:id", updateUser, {
    body: UpdateUserBody,
    type: "formData",
    detail: {
      summary: "Update user profile",
      description:
        "Update a user's profile details including name, username, email, and optional profile image. All fields are optional - only provided fields will be updated. Supports image upload in JPEG or PNG format (max 5MB). Send null for user_image to remove existing profile picture.",
      tags: ["Users"],
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
            "Unique MongoDB ObjectId of the user to update (24-character hexadecimal string)",
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
          "User profile update payload with optional fields (FormData format for image support)",
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                user_name: {
                  type: "string",
                  description: "User's first name (1-50 characters)",
                  minLength: 1,
                  maxLength: 50,
                  example: "Jane",
                },
                user_lastname: {
                  type: "string",
                  description: "User's last name (1-50 characters)",
                  minLength: 1,
                  maxLength: 50,
                  example: "Smith",
                },
                user_username: {
                  type: "string",
                  description: "Unique username for the user (1-50 characters)",
                  minLength: 1,
                  maxLength: 50,
                  example: "janesmith",
                },
                user_email: {
                  type: "string",
                  format: "email",
                  description: "User's email address",
                  example: "jane.smith@example.com",
                },
                user_image: {
                  type: "string",
                  format: "binary",
                  description:
                    "User's profile image (JPEG or PNG, max 5MB). Send as null to delete existing image.",
                  contentMediaType: "image/jpeg, image/png",
                },
              },
            },
            example: {
              user_name: "Jane",
              user_lastname: "Smith",
              user_username: "janesmith",
              user_email: "jane.smith@example.com",
            },
          },
        },
      },
      responses: {
        200: {
          description: "User profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                    description: "Response status indicator",
                  },
                  message: {
                    type: "string",
                    example: "User updated successfully",
                    description: "Success message",
                  },
                  data: {
                    type: "object",
                    description: "Complete updated user object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "507f1f77bcf86cd799439011",
                      },
                      user_name: {
                        type: "string",
                        example: "Jane",
                      },
                      user_lastname: {
                        type: "string",
                        example: "Smith",
                      },
                      user_username: {
                        type: "string",
                        example: "janesmith",
                      },
                      user_email: {
                        type: "string",
                        example: "janesmith@example.com",
                      },
                      user_image: {
                        type: "string",
                        example: "https://example.com/images/user123.jpg",
                        nullable: true,
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                      },
                      updatedAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Bad Request - Invalid input data (invalid email format, file too large, unsupported image type)",
        },
        401: {
          description:
            "Unauthorized - Missing, invalid, or expired authentication token",
        },
        403: {
          description:
            "Forbidden - Insufficient permissions to update this user",
        },
        404: {
          description:
            "Not Found - User with specified ID does not exist in the database",
        },
        500: {
          description: "Internal Server Error - Unexpected error during update",
        },
        503: {
          description:
            "Service Unavailable - Database connection error or image upload service unavailable",
        },
      },
    },
  })

  // ----------------------------- LOGOUT ROUTE -----------------------------
  /**
   * @route /api/users/logout
   * @description Logout a user
   * @action public
   */
  .post("/logout", logoutUser, {
    cookie: AuthCookie,
    detail: {
      summary: "Logout a user",
      description: "Logout a user by clearing their access token cookie",
      tags: ["Users"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Successful response with the message",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  Message: {
                    type: "string",
                    example: "Logout successful (cookie removed!)",
                  },
                },
              },
            },
          },
        },
        400: { description: "Bad Request - Invalid data" },
        401: { description: "Unauthorized - Missing or invalid token" },
        403: { description: "Forbidden - Insufficient permissions" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  })

  // ----------------------------- DELETE USER ROUTE -----------------------------
  /**
   * @route /api/users/deleted/:id
   * @description Delete a single user
   * @action public
   */
  .delete("/deleted/:id", deleteUser, {
    detail: {
      summary: "Delete a single user by id",
      description: "Delete a single user by id",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          description:
            "Unique identifier of the user to delete (MongoDB ObjectId format)",
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
          description: "Successful response with the deleted user data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  Message: {
                    type: "string",
                    example: "User deleted successfully",
                  },
                },
              },
            },
          },
        },
        400: { description: "Bad Request - Invalid data" },
        401: { description: "Unauthorized - Missing or invalid token" },
        403: { description: "Forbidden - Insufficient permissions" },
        404: { description: "Not Found - User not found" },
        500: { description: "Internal Server Error" },
        503: { description: "Service Unavailable - Database connection error" },
      },
    },
  });
