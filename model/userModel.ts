import { Document, model, Schema } from "mongoose";

interface User {
  user_name: string;
  user_lastname: string;
  user_username: string;
  user_email: string;
  user_password: string;
  user_role: "User" | "Admin";
  user_image?: string | null;
}

interface UserDoc extends User, Document {
  matchPassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
  {
    user_name: { type: String, required: true, trim: true },
    user_lastname: { type: String, required: true, trim: true },
    user_username: { type: String, default: "", unique: true, trim: true },
    user_email: { type: String, required: true, unique: true, trim: true },
    user_password: { type: String, required: true },
    user_role: { type: String, enum: ["User", "Admin"], default: "User" },
    user_image: { type: String, default: null },
  },
  { timestamps: true }
);

// Method to compare password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await Bun.password.verify(enteredPassword, this.user_password);
};

// Hash password before saving with Bun
userSchema.pre("save", async function () {
  if (!this.isModified("user_password")) return;
  this.user_password = await Bun.password.hash(this.user_password, {
    algorithm: "bcrypt",
    cost: 10,
  });
});

export const User = model<UserDoc>("User", userSchema, "users");
