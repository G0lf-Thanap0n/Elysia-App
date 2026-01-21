import { Elysia, t } from "elysia";
import {
  AuthCookie,
  LoginBody,
  SignupBody,
  UpdateUserBody,
} from "./users.model";
import {
  getAllUsers,
  getUserById,
  signupUser,
  updateUser,
  loginUser,
  deleteUser,
  logoutUser,
} from "./users.controller";

export const userRoute = new Elysia({ prefix: "/api/users" })
  // ----------------------------- SIGNUP ROUTE -----------------------------
  /**
   * @route /api/users/signup
   * @description Create a new user account
   * @action public
   */
  .post("/signup", signupUser, {
    body: SignupBody,
  })

  // ----------------------------- GET ALL USERS ROUTE -----------------------------
  /**
   * @route /api/users
   * @description Get all users
   * @action admin
   */
  .get("/", getAllUsers)

  // ----------------------------- GET USER BY ID ROUTE -----------------------------
  /**
   * @route /api/users/:id
   * @description Get a single user
   * @action public
   */
  .get("/:id", getUserById)

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
  })

  // ----------------------------- UPDATE USER CONTROLLER -----------------------------
  /**
   * @api [PATCH] /api/users/update/:id
   * @description Update a single user by id
   * @action public
   */
  .patch("/update/:id", updateUser, { body: UpdateUserBody })

  // ----------------------------- LOGOUT ROUTE -----------------------------
  /**
   * @route /api/users/logout
   * @description Logout a user
   * @action public
   */
  .post("/logout", logoutUser, {
    cookie: AuthCookie,
  })

  // ----------------------------- DELETE USER ROUTE -----------------------------
  /**
   * @route /api/users/deleted/:id
   * @description Delete a single user
   * @action public
   */
  .delete("/deleted/:id", deleteUser);
