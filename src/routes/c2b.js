import express from "express";
import {
  registerUrls,
  handleValidation,
  handleConfirmation,
} from "../controllers/c2bController.js";

const router = express.Router();

router.post("/register", registerUrls);
router.post("/validate", handleValidation);
router.post("/confirm", handleConfirmation);

export default router;
