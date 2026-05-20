import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FeedbackService } from "./feedback.service";

const createContactMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.createContactMessage(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Contact message sent successfully",
    data: result,
  });
});

const resolveContactMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.resolveContactMessage(req.params.id, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact request marked as resolved",
    data: result,
  });
});

const getContactMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getContactMessages();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact requests retrieved successfully",
    data: result,
  });
});

const submitFeedback = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user ? req.user.id : null;
  const result = await FeedbackService.submitFeedback(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Feedback submitted successfully. Thank you!",
    data: result,
  });
});

const getAllFeedbacks = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getAllFeedbacks();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedbacks list retrieved successfully",
    data: result,
  });
});

export const FeedbackController = {
  createContactMessage,
  resolveContactMessage,
  getContactMessages,
  submitFeedback,
  getAllFeedbacks,
};
