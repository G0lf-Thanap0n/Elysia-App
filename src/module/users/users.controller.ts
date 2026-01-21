import { Context } from "elysia";
import { User } from "../../../model/userModel";
import { jwt } from "../../../utils/jwt";

// ----------------------------- SIGNUP CONTROLLER -----------------------------
/**
 * @api [POST] /api/users/signup
 * @description Create a new user account
 * @action public
 */
interface SignupBody {
  user_email: string;
  user_password: string;
  user_username: string;
  user_name: string;
  user_lastname: string;
}

export const signupUser = async ({
  body,
  set,
}: Context<{ body: SignupBody }>) => {
  try {
    // validate body
    if (!body) throw new Error("No body provided");

    const {
      user_email,
      user_password,
      user_username,
      user_name,
      user_lastname,
    } = body;

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
      user_username,
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
        user_username: newUser.user_username,
        user_email: newUser.user_email,
      },
      message: "Created user successfully",
    };
  } catch (err) {
    console.error("Error during signup:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- GET ALL USERS CONTROLLER -----------------------------
/**
 * @api [GET] /api/users
 * @description Get all users
 * @action admin
 */
export const getAllUsers = async ({ set }: Context) => {
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
};

// ----------------------------- GET USER BY ID CONTROLLER -----------------------------
/**
 * @api [GET] /api/users/:id
 * @description Get a single user
 * @action public
 */
export const getUserById = async ({ params, set }: Context) => {
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
};

// ----------------------------- LOGIN CONTROLLER -----------------------------
/**
 * @api [POST] /api/users/login
 * @description Login a user
 * @cookie Stateful access_token cookie
 * @action public
 */
interface LoginBody {
  user_email: string;
  user_password: string;
}

export const loginUser = async ({
  body,
  set,
  cookie: { access_token },
}: Context<{ body: LoginBody }>) => {
  try {
    // Check body
    if (!body) return "Nobody provided";

    const { user_email, user_password } = body;

    if (!user_email || !user_password) {
      return "Email and Password are required";
    }

    // Check user by email
    const user = await User.findOne({ user_email });
    if (!user) {
      set.status = 401;
      return { error: "Invalid email" };
    }

    // Check password
    const isMatch = await user.matchPassword(user_password);
    if (!isMatch) {
      set.status = 401;
      throw new Error("Invalid password");
    }

    // Generate token
    const accessToken = await jwt.sign({
      data: { id: user._id },
      exp: "15m",
    });

    // Set cookie stateful for production
    // access_token.set({
    //   value: accessToken,
    //   httpOnly: true,
    //   maxAge: 15 * 60 * 1000,
    //   secure: true,
    //   sameSite: "none",
    //   path: "/",
    // });

    // Set cookie stateful for testing in localhost
    access_token.set({
      value: accessToken,
      httpOnly: false,
      maxAge: 15 * 60 * 1000,
      secure: true,
      sameSite: "lax",
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
        user_username: user.user_username,
        user_email: user.user_email,
      },
      message: "Login successfully (Cookie set!)",
    };
  } catch (err) {
    console.error("Error during login:", err);

    set.status = 500;
    return { Error: "Internal Server error" };
  }
};

// ----------------------------- UPDATE USER CONTROLLER -----------------------------
/**
 * @api [POST] /api/users/update/:id
 * @description Update a single user by id
 * @action public
 */
interface UpdateUserBody {
  user_name?: string;
  user_lastname?: string;
  user_username?: string;
  user_email?: string;
}

export const updateUser = async ({
  params,
  body,
  set,
}: Context<{ body: UpdateUserBody }>) => {
  try {
    const { id } = params;
    const { user_name, user_lastname, user_username, user_email } = body;

    const user = await User.findById(id);

    // check if user exists
    if (!user) {
      set.status = 404;
      return { status: "error", message: "User not found" };
    }

    // check for body
    if (!body) {
      return { status: "error", message: "No body provided" };
    }

    // update user details
    user.user_name = user_name || user.user_name;
    user.user_lastname = user_lastname || user.user_lastname;
    user.user_username = user_username || user.user_username;
    user.user_email = user_email || user.user_email;
    const updatedUser = await user.save();

    if (!updatedUser) {
      set.status = 400;
      return { status: "error", message: "User update failed" };
    }

    // return updated user
    set.status = 200;
    return {
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    };
  } catch (err) {
    console.error("Error during updating user:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};
// ----------------------------- LOGOUT CONTROLLER -----------------------------
/**
 * @api [POST] /api/users/logout
 * @description Logout a user
 * @action public
 */
export const logoutUser = async ({
  set,
  cookie: { access_token },
}: Context) => {
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
};

// ----------------------------- DELETE USER CONTROLLER -----------------------------
/**
 * @api [DELETE] /api/users/deleted/:id
 * @description Delete a single user
 * @action public
 */
export const deleteUser = async ({ params, set }: Context) => {
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
};
