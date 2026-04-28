const express = require("express");
const router = express.Router();
const {
  registerUrls,
  handleValidation,
  handleConfirmation,
} = require("../controllers/c2bController");

router.post("/register", registerUrls);
router.post("/validate", handleValidation);
router.post("/confirm", handleConfirmation);

module.exports = router;
