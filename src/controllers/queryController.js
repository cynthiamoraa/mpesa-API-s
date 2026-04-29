import axios from "axios";
import { getAccessToken, BASE_URL } from "../middleware/mpesaAuth.js";

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

export async function queryStkStatus(req, res) {
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

    // Normalize status (API sometimes returns numbers, sometimes strings)
    const code = String(result.ResultCode);

    const status =
      code === "0" ? "paid" : code === "1032" ? "cancelled" : "failed";

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
