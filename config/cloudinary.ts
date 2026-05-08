import { Elysia } from "elysia";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: Bun.env.CLOUDINARY_CLOUD_NAME,
  api_key: Bun.env.CLOUDINARY_API_KEY,
  api_secret: Bun.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryPlugin = new Elysia({ name: "CloudinaryPlugin" })
  .onStart(async () => {
    console.log("🔄 Connecting to Cloudinary...");

    try {
      // Verify Cloudinary connection by pinging the API
      const result = await cloudinary.api.ping();
      if (result.status === "ok") {
        console.log(
          "✅ Cloudinary is connected:",
          Bun.env.CLOUDINARY_CLOUD_NAME,
        );
      }
    } catch (err) {
      console.error("❌ Error connecting to Cloudinary:", err);
      process.exit(1);
    }
  })
  .onStop(async () => {
    console.log("Cloudinary plugin stopped");
  });

export { cloudinary };
