import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoURI = Bun.env.BETTER_AUTH_MONGO_URI;
if (!mongoURI) {
  throw new Error("Missing BETTER_AUTH_MONGO_URI in environment variables");
}

const client = new MongoClient(mongoURI);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),

  // Base URL for better-auth of your application
  baseURL: Bun.env.BETTER_AUTH_URL || "http://localhost:3030",

  // Better-auth Email and Password Auth Configuration
  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: Bun.env.GOOGLE_CLIENT_ID as string,
      clientSecret: Bun.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
    facebook: {
      clientId: Bun.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: Bun.env.FACEBOOK_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
});
