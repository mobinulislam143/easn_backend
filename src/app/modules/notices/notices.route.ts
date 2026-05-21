import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { NoticeController } from "./notices.controller";
import { NoticeValidation } from "./notices.validation";

const router = Router();

router.get("/", NoticeController.getAllNotices);
router.get("/:id", NoticeController.getNoticeById);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(NoticeValidation.createNoticeSchema),
  NoticeController.createNotice
);

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(NoticeValidation.updateNoticeSchema),
  NoticeController.updateNotice
);

router.delete(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  NoticeController.deleteNotice
);

export const NoticeRoutes = router;
