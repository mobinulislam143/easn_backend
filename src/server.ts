import { Server } from "http";
import app from "./app";
import dotenv from "dotenv";

// Load Environment variables
dotenv.config();

const port = process.env.PORT || 3990;
let server: Server;

async function main() {
  try {
    server = app.listen(port, () => {
      console.log(`[Server]: EASN Backend running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the backend server:", error);
    process.exit(1);
  }
}

main();

// Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection detected! Shutting down server...", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception detected! Shutting down server...", error);
  process.exit(1);
});
