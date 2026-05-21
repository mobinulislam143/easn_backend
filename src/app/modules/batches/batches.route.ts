import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BatchController } from "./batches.controller";
import { BatchValidation } from "./batches.validation";

const router = Router();

router.get("/", BatchController.getAllBatches);
router.get("/:year", BatchController.getBatchByYear);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(BatchValidation.createBatchSchema),
  BatchController.createBatch
);

router.put(
  "/:year",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(BatchValidation.updateBatchSchema),
  BatchController.updateBatch
);

router.delete(
  "/:year",
  auth("SUPER_ADMIN"),
  BatchController.deleteBatch
);

export const BatchRoutes = router;
