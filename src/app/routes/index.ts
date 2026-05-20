import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { StudentRoutes as StdRoutes } from "../modules/students/students.route";
import { TeacherRoutes } from "../modules/teachers/teachers.route";
import { BatchRoutes } from "../modules/batches/batches.route";
import { AlumniRoutes } from "../modules/alumni/alumni.route";
import { EventRoutes } from "../modules/events/events.route";
import { BlogRoutes } from "../modules/blogs/blogs.route";
import { NoticeRoutes } from "../modules/notices/notices.route";
import { CommentRoutes } from "../modules/comments/comments.route";
import { GalleryRoutes } from "../modules/gallery/gallery.route";
import { FeedbackRoutes } from "../modules/feedback/feedback.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/students", route: StdRoutes },
  { path: "/teachers", route: TeacherRoutes },
  { path: "/batches", route: BatchRoutes },
  { path: "/alumni", route: AlumniRoutes },
  { path: "/events", route: EventRoutes },
  { path: "/blogs", route: BlogRoutes },
  { path: "/notices", route: NoticeRoutes },
  { path: "/comments", route: CommentRoutes },
  { path: "/gallery", route: GalleryRoutes },
  { path: "/feedback", route: FeedbackRoutes },
  { path: "/dashboard", route: DashboardRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
