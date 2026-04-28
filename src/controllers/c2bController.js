const axios = require("axios");
const { getAccessToken, BASE_URL } = require("../middleware/mpesaAuth");

async function registerUrls(req, res) {
  try {
    const token = await getAccessToken();

    const payload = {
      ShortCode: process.env.BUSINESS_SHORT_CODE,
      ResponseType: "Completed", // or 'Cancelled' — what happens if validation URL unreachable
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

async function handleValidation(req, res) {
  const { TransID, MSISDN, TransAmount, BillRefNumber } = req.body;

  console.log("Validation request:", {
    TransID,
    MSISDN,
    TransAmount,
    BillRefNumber,
  });

  // Add your validation logic here
  // e.g. check if BillRefNumber is a valid account in your DB
  const isValid = true; // replace with real logic

  if (isValid) {
    res.json({ ResultCode: "0", ResultDesc: "Accepted" });
  } else {
    res.json({ ResultCode: "C2B00012", ResultDesc: "Rejected" });
  }
}

async function handleConfirmation(req, res) {
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

  // TODO: Save to your database here
  // await Payment.create({ transactionId: TransID, amount: TransAmount, ... });

  // Always respond with success — M-Pesa does not retry if you return an error
  res.json({ ResultCode: 0, ResultDesc: "Success" });
}

module.exports = { registerUrls, handleValidation, handleConfirmation };
