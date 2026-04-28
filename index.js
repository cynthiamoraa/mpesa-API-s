require("dotenv").config();
import express, { json } from "express";
const app = express();

app.use(json());

import authRoutes from "./src/routes/auth";
import stkRoutes from "./src/routes/stkpush";
import c2bRoutes from "./src/routes/c2b";
import queryRoutes from "./src/routes/query";

app.use("/api/mpesa/auth", authRoutes);
app.use("/api/mpesa/stk", stkRoutes);
app.use("/api/mpesa/c2b", c2bRoutes);
app.use("/api/mpesa/query", queryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`M-Pesa integration running on port ${process.env.PORT}`);
});
