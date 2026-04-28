const express = require("express");
const router = express.Router();
const { getAccessToken } = require("../middleware/mpesaAuth");

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

module.exports = router;
