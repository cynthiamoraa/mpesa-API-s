import { Router } from "express";
import { getAccessToken } from "../middleware/mpesaAuth.js";

const router = Router();
console.log("🧩 auth.js LOADEDdd");

router.get("/token", async (req, res) => {
  console.log("/api/mpesa/auth/token HIT");
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
