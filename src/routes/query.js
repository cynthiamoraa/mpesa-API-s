const express = require("express");
const router = express.Router();
const { queryStkStatus } = require("../controllers/queryController");

router.post("/status", queryStkStatus);

module.exports = router;
