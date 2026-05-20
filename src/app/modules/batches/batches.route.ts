import { Router } from "express";
import auth from "../../middlewares/auth";
import { BatchController } from "./batches.controller";

const router = Router();

router.get("/", BatchController.getAllBatches);
router.get("/:year", BatchController.getBatchByYear);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  BatchController.createBatch
);

router.put(
  "/:year",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  BatchController.updateBatch
);

export const BatchRoutes = router;
