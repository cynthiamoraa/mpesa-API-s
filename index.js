import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./src/routes/auth.js";
import stkRoutes from "./src/routes/stkpush.js";
import c2bRoutes from "./src/routes/c2b.js";
import queryRoutes from "./src/routes/query.js";

const app = express();

app.use(express.json());
console.log("INDEX ENV:", process.env.MPESA_ENV);

app.use("/api/mpesa/auth", authRoutes);
// app.use("/api/mpesa/stk", stkRoutes);
// app.use("/api/mpesa/c2b", c2bRoutes);
// app.use("/api/mpesa/query", queryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`M-Pesa integration running on port ${process.env.PORT}`);
});
