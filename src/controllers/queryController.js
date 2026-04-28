const axios = require("axios");
const { getAccessToken, BASE_URL } = require("../middleware/mpesaAuth");

function generateTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

function generatePassword(timestamp) {
  const shortCode = process.env.BUSINESS_SHORT_CODE;
  const passkey = process.env.PASSKEY;
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
}

async function queryStkStatus(req, res) {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: "checkoutRequestId is required" });
    }

    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const payload = {
      BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;

    // ResultCode 0 = success, 1032 = cancelled by user, others = failure
    const status =
      result.ResultCode === "0"
        ? "paid"
        : result.ResultCode === "1032"
        ? "cancelled"
        : "failed";

    res.json({
      success: true,
      status,
      resultCode: result.ResultCode,
      resultDesc: result.ResultDesc,
      merchantRequestId: result.MerchantRequestID,
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
}

module.exports = { queryStkStatus };
