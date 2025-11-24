const express = require("express");
const dotenv = require("dotenv");
const transactionRoutes = require("./routes/transaction");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/transactions", transactionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
