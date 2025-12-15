import { Elysia, t } from "elysia";
import { User } from "../../model/userModel";
import { jwt } from "../../utils/jwt";

const userRoute = new Elysia({ prefix: "/api/users" }).post(
  "/signup",
  async ({ body, set }) => {
    // validate body
    // if (!body) throw new Error("No body provided");

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
    // if (!newUser) {
    //   set.status = 400;
    //   throw new Error("User creation failed");
    // }

    // generate token
    const accessToken = await jwt.sign({
      data: { id: newUser._id },
      exp: "15m",
    });

    // respond with user data and token successfully
    set.status = 201;
    return {
      status: set.status,
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
  },
  {
    body: t.Object({
      user_name: t.String().min(1).max(50),
      user_lastname: t.String().min(1).max(50),
      user_email: t.String().email(),
      user_password: t.String().password().min(6).max(50),
    }),
  }
);
