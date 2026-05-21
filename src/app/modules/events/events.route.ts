import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { EventController } from "./events.controller";
import { EventValidation } from "./events.validation";

const router = Router();

router.get("/", EventController.getAllEvents);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(EventValidation.createEventSchema),
  EventController.createEvent
);

router.get(
  "/:id/participants",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.getEventParticipants
);

router.get(
  "/:id/reminder-stats",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  EventController.getEventReminderStats
);

router.get("/:id", EventController.getEventById);

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(EventValidation.updateEventSchema),
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
  validateRequest(EventValidation.rsvpEventSchema),
  EventController.rsvpEvent
);

router.post(
  "/:id/reminder",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(EventValidation.sendReminderSchema),
  EventController.sendBatchReminder
);

export const EventRoutes = router;
