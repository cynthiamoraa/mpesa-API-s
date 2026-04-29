import express from "express";
import { queryStkStatus } from "../controllers/queryController.js";

const router = express.Router();


router.post("/status", queryStkStatus);

export default router;
