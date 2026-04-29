import dotenv from "dotenv";
import express from "express";
import authRoutes from "./src/routes/auth.js";
import stkRoutes from "./src/routes/stkpush.js";
import c2bRoutes from "./src/routes/c2b.js";
import queryRoutes from "./src/routes/query.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/mpesa/auth", authRoutes);
app.use("/api/mpesa/stk", stkRoutes);
app.use("/api/mpesa/c2b", c2bRoutes);
app.use("/api/mpesa/query", queryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`M-Pesa integration running on port ${process.env.PORT}`);
});
