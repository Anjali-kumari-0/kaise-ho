import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    // ❗ check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // 🟢 upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chat-app", // optional but recommended
    });

    // 🟢 delete local file (VERY IMPORTANT)
    fs.unlinkSync(req.file.path);

    // 🟢 response
    return res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};