import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CommentController } from "./comments.controller";
import { CommentValidation } from "./comments.validation";

const router = Router();

router.post(
  "/",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(CommentValidation.addCommentSchema),
  CommentController.addComment
);

router.delete(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  CommentController.deleteComment
);

export const CommentRoutes = router;
