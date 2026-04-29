import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const BASE_URL =
  process.env.MPESA_ENV === "sandbox"
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";

let cachedToken = null;
let tokenExpiry = null;

export async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
  )
    .toString("base64")
    .trim();

  const url = `${BASE_URL}/oauth/v1/generate`;
  
  const response = await axios.get(url, {
    params: {
      grant_type: "client_credentials",
    },
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  cachedToken = response.data.access_token;
  tokenExpiry = now + 3500 * 1000;

  return cachedToken;
}
