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
  const raw = `${shortCode}${passkey}${timestamp}`;
  return Buffer.from(raw).toString("base64");
}

export async function initiateStkPush(req, res) {
  try {
    const { phone, amount, accountRef, description } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "phone and amount are required" });
    }

    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    const shortCode = process.env.BUSINESS_SHORT_CODE;

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: accountRef || "Payment",
      TransactionDesc: description || "Payment",
    };

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      message: response.data.CustomerMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
}

export async function handleStkCallback(req, res) {
  const callbackData = req.body?.Body?.stkCallback;

  if (!callbackData) {
    return res.status(400).json({ error: "Invalid callback payload" });
  }

  const {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata,
  } = callbackData;

  console.log("STK Callback received:", {
    MerchantRequestID,
    ResultCode,
    ResultDesc,
  });

  if (ResultCode === 0) {
    const items = CallbackMetadata?.Item || [];
    const get = (name) => items.find((i) => i.Name === name)?.Value;

    const paymentData = {
      amount: get("Amount"),
      mpesaReceiptNumber: get("MpesaReceiptNumber"),
      transactionDate: get("TransactionDate"),
      phoneNumber: get("PhoneNumber"),
      checkoutRequestId: CheckoutRequestID,
    };

    console.log("Payment successful:", paymentData);

    // TODO: Save/update DB
  } else {
    console.log(`Payment failed: ${ResultDesc} (code: ${ResultCode})`);
  }

  res.json({ ResultCode: 0, ResultDesc: "Success" });
}
