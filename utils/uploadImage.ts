import { cloudinary } from "../config/cloudinary";

// ----------Upload Image----------
export const uploadImage = async (
  file: File,
  folder = "smart-goal/avatar",
): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataURI = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
};

// ----------Delete Old Image in Cloudinary----------
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public ID from the image URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1676268601/smart-goal/avatar/user-avatar.png
    const splitUrl = imageUrl.split("/upload/")[1];
    const publicId = splitUrl.replace(/v\d+\//, "").replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err);
  }
};
