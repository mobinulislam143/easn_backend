import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../errors/AppError";
import prisma from "../helpers/prisma";
import catchAsync from "../utils/catchAsync";

// Extend express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; email: string; role: string };
    }
  }
}

const auth = (...roles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(401, "You are not authorized to access this resource!");
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "MyEasnSecret"
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(401, "Invalid token or access expired!");
    }

    const { id, role } = decoded;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new AppError(404, "User account was not found or has been deleted!");
    }

    // Role check
    if (roles.length && !roles.includes(role)) {
      throw new AppError(403, "You do not have permission to perform this action!");
    }

    req.user = decoded as any;
    next();
  });
};

export default auth;
