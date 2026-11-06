
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { pool } = require("./db");
const { createTablesAndSeed } = require("./seed");
const { authenticateMerchant } = require("./middleware/auth");
const healthRoute = require("./routes/health");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

/**
 * Health check 
 */


app.use("/health", healthRoute);

app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
/**
 * 🔐 TEST AUTH ROUTE
 */
app.get("/api/protected", authenticateMerchant, (req, res) => {
  res.json({
    message: "Authenticated",
    merchant: req.merchant
  });
});

(async () => {
  await createTablesAndSeed();

  app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);
  });
})();
