import { Context } from "elysia";
import { User } from "../../../model/userModel";
import { jwt } from "../../../utils/jwt";
import {
  LoginBodyType,
  SignupBodyType,
  UpdateUserBodyType,
} from "./usersmodel";
import { deleteImage, uploadImage } from "../../../utils/uploadImage";
import { AuthContext } from "../../../types/auth.types";

// ----------------------------- SIGNUP CONTROLLER -----------------------------
/**
 * @api [POST] /api/users/signup
 * @description Create a new user account
 * @action public
 */

export const signupUser = async ({
  body,
  set,
}: Context<{ body: SignupBodyType }>) => {
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

    // check if user creation was failed
    if (!newUser) {
      set.status = 400;
      throw new Error("User creation failed");
    }

    // Generate token
    const accessToken = await jwt.sign({
      data: { id: newUser._id.toString(), role: newUser.user_role },
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
        user_active: newUser.user_active,
      },
      message: "Created user successfully",
    };
  } catch (err) {
    console.error("Error during signup:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- GET ALL USERS CONTROLLER (Maybe feat pagination🛠)-----------------------------
/**
 * @api [GET] /api/users
 * @description Get all users
 * @action admin
 */
export const getAllUsers = async ({ set, query }: Context) => {
  try {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-user_password").skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    // Return users
    set.status = 200;
    return {
      status: "success",
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
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
    const user = await User.findById(id).select("-user_password").lean();
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

export const loginUser = async ({
  body,
  set,
  cookie: { access_token },
}: Context<{ body: LoginBodyType }>) => {
  try {
    // Check body
    if (!body) {
      set.status = 400;
      return { error: "No body provided" };
    }

    // Destructure email and password from body
    const { user_email, user_password } = body;

    // Find user by email
    const user = await User.findOne({ user_email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(user_password))) {
      set.status = 401;
      return { error: "Invalid email or password" };
    }

    // Generate token
    const accessToken = await jwt.sign({
      data: { id: user._id.toString(), role: user.user_role },
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

    // Set user active status to true in DB
    user.user_active = true;
    await user.save();

    set.status = 200;
    return {
      success: true,
      data: { accessToken },
      user: {
        id: user._id,
        user_name: user.user_name,
        user_lastname: user.user_lastname,
        user_username: user.user_username,
        user_email: user.user_email,
        user_active: user.user_active,
      },
      message: "Login successfully (Cookie set!)",
    };
  } catch (err) {
    console.error("Error during login:", err);

    set.status = 500;
    return { error: "Internal Server Error" };
  }
};

// ----------------------------- UPDATE USER CONTROLLER -----------------------------
/**
 * @api [PATCH] /api/users/update/:id
 * @description Update a single user by id
 * @action public
 */

export const updateUser = async ({
  params,
  body,
  set,
  user,
}: AuthContext & { body: UpdateUserBodyType }) => {
  try {
    const { id } = params;
    const { user_name, user_lastname, user_username, user_email, user_image } =
      body;

    // check for body
    if (!body) {
      return { status: "error", message: "No body provided" };
    }

    // Check user is owner of the profile or admin
    if (id !== user.id && user.role !== "Admin") {
      set.status = 403;
      return { error: "Forbidden: You can only update your own profile" };
    }

    const currentuser = await User.findById(id).select(
      "-user_role -user_active -user_password -user_goals",
    );

    // check if user exists
    if (!currentuser) {
      set.status = 404;
      return { status: "error", message: "User not found" };
    }

    // check for image
    if (user_image instanceof File) {
      // delete old image
      if (currentuser.user_image) {
        await deleteImage(currentuser.user_image);
      }
      // upload new image
      currentuser.user_image = await uploadImage(user_image);
    } else if (user_image === null) {
      // send null to delete image
      if (currentuser.user_image) {
        await deleteImage(currentuser.user_image);
      }
      // set user image to null in DB
      currentuser.user_image = null;
    }

    // update user details
    currentuser.user_name = user_name ?? currentuser.user_name;
    currentuser.user_lastname = user_lastname ?? currentuser.user_lastname;
    currentuser.user_username = user_username ?? currentuser.user_username;
    currentuser.user_email = user_email ?? currentuser.user_email;

    // save updated user
    const updatedUser = await currentuser.save();

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
}: AuthContext) => {
  try {
    const user = await User.findOne({ user_active: true });
    if (!user) {
      set.status = 404;
      return { error: "No active user found" };
    }

    // Remove cookie
    access_token.remove();

    // Set user active status to false in DB
    user.user_active = false;
    await user.save();

    set.status = 200;
    return {
      message: "Logout successful (cookie removed!)",
      user_active: user.user_active,
    };
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
export const deleteUser = async ({ params, set }: AuthContext) => {
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
