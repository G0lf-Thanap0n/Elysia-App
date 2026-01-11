import { Elysia } from "elysia";
import { mongoosesPlugin } from "../config/mongoose";
import { cors } from "@elysiajs/cors";
import cookie from "@elysiajs/cookie";
import { rateLimit } from "elysia-rate-limit";
import { userRoute } from "./routes/users/users_controller";
import { auth } from "../utils/auth";

const app = new Elysia()
  .use(
    rateLimit({
      scoping: "global", // global rate limiting
      duration: 60 * 1000, // 1 minute
      max: 120, // limit 120 requests
      errorResponse: new Response(
        JSON.stringify({ status: "error", message: "rate-limit reached" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      ),
    })
  )
  .use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ], // frontend dev servers

      // Methods allowed for CORS
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

      // Headers Frontend can send allowed for CORS
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
      ],

      // allow Cookies/JWT Credentials
      credentials: true,

      // Preflight cache duration in 1 hour
      maxAge: 60 * 60,

      // Allow headers exposed to the frontend
      exposeHeaders: [
        "Content-Length",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
      ],
    })
  )
  .use(
    cookie({
      secret: Bun.env.COOKIE_SECRET,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: true,
    })
  )
  .use(mongoosesPlugin())

  // .mount("/api/auth", auth.handler)
  .all("/api/auth/*", (context) => auth.handler(context.request))

  .use(userRoute)

  .get("/", () => "Hello Elysia with Bun! 🚀")
  .listen(Bun.env.PORT || 3030);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
