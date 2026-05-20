import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerStudent(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Registration successful. Please wait for administrator approval.",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  // Set refresh token cookie
  res.cookie("refreshToken", result.refreshToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful!",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body.email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset link sent to your email.",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset successful! You can now log in.",
    data: null,
  });
});

export const AuthController = {
  registerStudent,
  loginUser,
  forgotPassword,
  resetPassword,
};
