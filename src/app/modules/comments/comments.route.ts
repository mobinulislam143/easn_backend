import { Router } from "express";
import auth from "../../middlewares/auth";
import { CommentController } from "./comments.controller";

const router = Router();

router.post(
  "/",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  CommentController.addComment
);

router.delete(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  CommentController.deleteComment
);

export const CommentRoutes = router;
