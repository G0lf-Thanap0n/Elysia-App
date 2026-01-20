import { Elysia, t } from "elysia";
import { User } from "../../../model/userModel";
import { AuthCookie, LoginBody, SignupBody } from "./users.model";
import {
  getAllUsers,
  getUserById,
  signupUser,
  loginUser,
  deleteUser,
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

  // ----------------------------- LOGOUT ROUTE -----------------------------
  /**
   * @route /api/users/logout
   * @description Logout a user
   * @action public
   */
  .post(
    "/logout",
    async ({ set, cookie: { access_token } }) => {
      try {
        //Remove cookie
        access_token.remove();

        set.status = 200;
        return { Message: "Logout successful (cookie removed!)" };
      } catch (err) {
        console.error("Error during logout:", err);
        set.status = 500;
        return { error: "Internal Server error" };
      }
    },
    {
      cookie: AuthCookie,
    },
  )

  // ----------------------------- DELETE USER ROUTE -----------------------------
  /**
   * @route /api/users/deleted/:id
   * @description Delete a single user
   * @action public
   */
  .delete("/deleted/:id", deleteUser);
//   const { id } = params;
//   try {
//     const deleted = await User.findByIdAndDelete(id);

//     if (!deleted) {
//       set.status = 404;
//       return { Error: "User not found" };
//     }

//     set.status = 200;
//     return { Message: "user deleted successfully" };
//   } catch (err) {
//     console.error("Error during logout:", err);

//     set.status = 500;
//     return { error: "Internal Server error" };
//   }
// });
