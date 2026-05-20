import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerStudentSchema),
  AuthController.registerStudent
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.loginUser
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword
);

export const AuthRoutes = router;
