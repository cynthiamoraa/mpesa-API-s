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
  const raw = `${shortCode}${passkey}${timestamp}`;
  return Buffer.from(raw).toString("base64");
}

async function initiateStkPush(req, res) {
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
      Amount: Math.round(amount), // whole numbers only
      PartyA: phone, // e.g. 254712345678
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

module.exports = { initiateStkPush };

async function handleStkCallback(req, res) {
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
    // Payment SUCCESS — extract details
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

    // TODO: Update your database here
    // await Order.update({ status: 'paid', ...paymentData }, { where: { checkoutRequestId: CheckoutRequestID } });
  } else {
    // Payment FAILED or cancelled
    console.log(`Payment failed: ${ResultDesc} (code: ${ResultCode})`);
    // TODO: Update order status to 'failed' or 'cancelled'
  }

  // Always return 200 — M-Pesa does not retry on error responses
  res.json({ ResultCode: 0, ResultDesc: "Success" });
}

module.exports = { initiateStkPush, handleStkCallback };