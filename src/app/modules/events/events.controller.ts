import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EventService } from "./events.service";

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getAllEvents();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Events retrieved successfully",
    data: result,
  });
});

const getEventById = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getEventById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event details retrieved successfully",
    data: result,
  });
});

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.createEvent(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.updateEvent(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  await EventService.deleteEvent(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event deleted successfully",
    data: null,
  });
});

const rsvpEvent = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await EventService.rsvpEvent(req.user!.id, req.params.id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: status === "JOINED" ? "You joined this event!" : "RSVP updated to not attending.",
    data: result,
  });
});

const sendBatchReminder = catchAsync(async (req: Request, res: Response) => {
  const { batchYear } = req.body;
  const result = await EventService.sendBatchReminder(req.params.id, batchYear);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Successfully sent email reminders to ${result.recipientsCount} students in batch ${batchYear}!`,
    data: result,
  });
});

export const EventController = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  sendBatchReminder,
};
