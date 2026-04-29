import axios from "axios";
import { getAccessToken, BASE_URL } from "../middleware/mpesaAuth.js";

export async function registerUrls(req, res) {
  try {
    const token = await getAccessToken();

    const payload = {
      ShortCode: process.env.BUSINESS_SHORT_CODE,
      ResponseType: "Completed",
      ConfirmationURL: process.env.CONFIRMATION_URL,
      ValidationURL: process.env.VALIDATION_URL,
    };

    const response = await axios.post(
      `${BASE_URL}/mpesa/c2b/v2/registerurl`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
}

export async function handleValidation(req, res) {
  const { TransID, MSISDN, TransAmount, BillRefNumber } = req.body;

  console.log("Validation request:", {
    TransID,
    MSISDN,
    TransAmount,
    BillRefNumber,
  });

  // 🔍 Replace with real validation logic
  const isValid = true;

  if (isValid) {
    return res.json({ ResultCode: "0", ResultDesc: "Accepted" });
  } else {
    return res.json({ ResultCode: "C2B00012", ResultDesc: "Rejected" });
  }
}

export async function handleConfirmation(req, res) {
  const {
    TransID,
    TransAmount,
    MSISDN,
    BillRefNumber,
    TransTime,
    BusinessShortCode,
  } = req.body;

  console.log("Payment confirmed:", {
    transactionId: TransID,
    amount: TransAmount,
    phone: MSISDN,
    reference: BillRefNumber,
    time: TransTime,
  });

  // 🧠 This is where your real power is:
  // Save to DB, trigger business logic, etc.

  res.json({ ResultCode: 0, ResultDesc: "Success" });
}
