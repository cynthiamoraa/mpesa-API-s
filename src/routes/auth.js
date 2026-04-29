import { Router } from "express";
import { getAccessToken } from "../middleware/mpesaAuth.js";

const router = Router();

router.get("/token", async (req, res) => {

  try {
    const token = await getAccessToken();
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

export default router;
