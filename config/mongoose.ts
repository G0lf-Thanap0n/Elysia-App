import { Elysia } from "elysia";
import mongoose from "mongoose";

// Create a plugin to connect to MongoDB using Mongoose
export const mongoosesPlugin =
  (uri = Bun.env.MONGO_URI) =>
  (app: Elysia) => {
    if (!uri)
      throw new Error("missing MONGO_URI in env or Mongodb connection uri");

    mongoose.connection.on("connected", () => {
      console.log("✅ connect to MongoDB database ");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ connect to MongoDB database error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB database disconnected");
    });

    return app
      .onStart(async () => {
        console.log("🔄 Connecting to MongoDB...");
        try {
          const conn = await mongoose.connect(uri);
          console.log("✅ mongoose.connect resolved:", conn.connection.name);
        } catch (err) {
          console.error("Initial MongoDB connection error:", err);
          throw err;
        }
      })
      .onStop(async () => {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
      });
  };
