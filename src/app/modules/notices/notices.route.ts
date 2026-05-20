import { Router } from "express";
import auth from "../../middlewares/auth";
import { NoticeController } from "./notices.controller";

const router = Router();

router.get("/", NoticeController.getAllNotices);
router.get("/:id", NoticeController.getNoticeById);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  NoticeController.createNotice
);

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  NoticeController.updateNotice
);

router.delete(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  NoticeController.deleteNotice
);

export const NoticeRoutes = router;
