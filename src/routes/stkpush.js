import { Router } from "express";
import {
  initiateStkPush,
  handleStkCallback,
} from "../controllers/stkController";

const router = Router();
router.post("/push", initiateStkPush);
router.post("/callback", handleStkCallback); // M-Pesa calls this

export default router;
