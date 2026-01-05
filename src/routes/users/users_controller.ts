import { Elysia, t } from "elysia";
import { User } from "../../../model/userModel";
import { jwt } from "../../../utils/jwt";
import { AuthCookie, LoginBody, SignupBody } from "./users_schema";

const userRoute = new Elysia({ prefix: "/api/users" })
  // ----------------------------- SIGNUP ROUTE -----------------------------
  /**
   * @api [POST] /api/users/signup
   * @description Create a new user account
   * @action public
   */
  .post(
    "/signup",
    async ({ body, set }) => {
      try {
        // validate body
        if (!body) throw new Error("No body provided");

        const { user_email, user_password, user_name, user_lastname } = body;

        // check if user already exists
        const userExists = await User.findOne({ user_email });
        if (userExists) {
          set.status = 409;
          return { error: "Email already registered" };
        }

        // create new user
        const newUser = await User.create({
          user_name,
          user_lastname,
          user_email,
          user_password,
        });

        // check if user creation was successful
        if (!newUser) {
          set.status = 400;
          throw new Error("User creation failed");
        }

        // Generate token
        const accessToken = await jwt.sign({
          data: { id: newUser._id },
          exp: "15m",
        });

        // respond with user data and token successfully
        set.status = 201;
        return {
          success: true,
          data: { accessToken },
          user: {
            id: newUser._id,
            user_name: newUser.user_name,
            user_lastname: newUser.user_lastname,
            user_email: newUser.user_email,
          },
          message: "Created user successfully",
        };
      } catch (err) {
        console.error("Error during signup:", err);

        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      body: SignupBody,
    }
  )

  // ----------------------------- GET ALL USERS ROUTE -----------------------------
  /**
   * @api [GET] /api/users/
   * @description Get all users
   * @action admin
   */
  .get("/", async ({ set }) => {
    const users = await User.find().select("-user_password");
    try {
      if (!users || users.length === 0) {
        set.status = 404;
        return { error: "No users found" };
      }

      // Return users
      set.status = 200;
      return {
        status: "success",
        message: "Users fetched successfully",
        data: users,
      };
    } catch (err) {
      console.error("Error during fetching users:", err);

      set.status = 500;
      return { error: "Internal Server Error" };
    }
  })

  // ----------------------------- GET USER BY ID ROUTE -----------------------------
  /**
   * @api [GET] /api/users/:id
   * @description Get a single user
   * @action public
   */
  .get("/:id", async ({ params, set }) => {
    const { id } = params;
    try {
      // Find user by ID
      const user = await User.findById(id).select("-user_password");
      if (!user) {
        set.status = 404;
        return { error: "User not found" };
      }

      set.status = 200;
      return {
        status: "success",
        message: "User fetched successfully",
        data: user,
      };
    } catch (err) {
      console.error("Error during fetching user:", err);

      set.status = 500;
      return { error: "Internal Server Error" };
    }
  })

  // ----------------------------- LOGIN ROUTE -----------------------------
  /**
   * @api [POST] /api/users/login
   * @description Login a user
   * @cookie Stateful access_token cookie
   * @action public
   */
  .post(
    "/login",
    async ({ body, set, cookie: { access_token } }) => {
      try {
        // Check body
        if (!body) throw new Error("Nobody provided");

        const { user_email, user_password } = body;

        if (!user_email || !user_password) {
          throw new Error("Email and Password are required");
        }

        // Check user by email
        const user = await User.findOne({ user_email });
        if (!user) {
          set.status = 401;
          throw new Error("Invalid email address");
        }

        // Check password
        const isMatch = await user.matchPassword(user_password);
        if (!isMatch) {
          set.status = 401;
          throw new Error("Invalid password");
        }

        // Generate token
        const accessToken = jwt.sign({
          data: { id: user._id },
          exp: "15m",
        });

        // Set cookie stateful
        access_token.set({
          value: accessToken,
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
          secure: true,
          sameSite: "none",
          path: "/",
        });

        set.status = 200;
        return {
          status: set.status,
          success: true,
          data: { accessToken },
          user: {
            id: user._id,
            user_name: user.user_name,
            user_lastname: user.user_lastname,
            user_email: user.user_email,
          },
          message: "Login successfully (Cookie set!)",
        };
      } catch (err) {
        console.error("Error during login:", err);

        set.status = 500;
        return { Error: "Internal Server error" };
      }
    },
    {
      cookie: AuthCookie,
      body: LoginBody,
    }
  )

  // ----------------------------- LOGOUT ROUTE -----------------------------
  /**
   * @api [POST] /api/users/logout
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
    }
  )

  // ----------------------------- DELETE USER ROUTE -----------------------------
  /**
   * @api [DELETE] /api/users/deleted/:id
   * @description Delete a single user
   * @action public
   */
  .delete("/deleted/:id", async ({ params, set }) => {
    const { id } = params;
    try {
      const deleted = await User.findByIdAndDelete(id);

      if (!deleted) {
        set.status = 404;
        return { Error: "User not found" };
      }

      set.status = 200;
      return { Message: "user deleted successfully" };
    } catch (err) {
      console.error("Error during logout:", err);

      set.status = 500;
      return { error: "Internal Server error" };
    }
  });
