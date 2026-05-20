import { Router } from "express";
import auth from "../../middlewares/auth";
import { FeedbackController } from "./feedback.controller";
import jwt from "jsonwebtoken";

const router = Router();

// Optional auth helper to check if a token exists for feedback submission
const optionalAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "MyEasnSecret");
      req.user = decoded;
    } catch (e) {
      // ignore token error, treat as anonymous
    }
  }
  next();
};

router.post("/contact", FeedbackController.createContactMessage);

router.get(
  "/contact",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  FeedbackController.getContactMessages
);

router.post(
  "/contact/:id/resolve",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  FeedbackController.resolveContactMessage
);

router.post("/", optionalAuth, FeedbackController.submitFeedback);

router.get(
  "/",
  auth("SUPER_ADMIN"),
  FeedbackController.getAllFeedbacks
);

export const FeedbackRoutes = router;
