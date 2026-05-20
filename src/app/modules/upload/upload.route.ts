import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import auth from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "easn",
  api_key: process.env.CLOUDINARY_API_KEY || "286827267933883",
  api_secret: process.env.CLOUDINARY_API_SECRET || "T00P4-EQdLAAQtdhOZBpVYKNjeQ",
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post(
  "/image",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN", "TEACHER"),
  upload.single("image"),
  catchAsync(async (req: any, res) => {
    if (!req.file) {
      throw new AppError(400, "Please upload an image file!");
    }

    // Convert buffer to base64 data URI
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: "easn_uploads",
      resource_type: "auto",
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadResult.secure_url,
      },
    });
  })
);

export const UploadRoutes = router;
