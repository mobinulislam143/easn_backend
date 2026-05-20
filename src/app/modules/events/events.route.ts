import { Router } from "express";
import auth from "../../middlewares/auth";
import { EventController } from "./events.controller";

const router = Router();

router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getEventById);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.createEvent
);

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.updateEvent
);

router.delete(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.deleteEvent
);

router.post(
  "/:id/rsvp",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.rsvpEvent
);

router.post(
  "/:id/reminder",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.sendBatchReminder
);

export const EventRoutes = router;
