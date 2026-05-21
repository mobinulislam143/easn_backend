import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "../../generated/prisma";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();

export default prisma;
