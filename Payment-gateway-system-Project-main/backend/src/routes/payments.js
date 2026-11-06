const generatePaymentId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 16; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `pay_${random}`;
};
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { authenticateMerchant } = require("../middleware/auth");
const {
  isValidVPA,
  isValidCardNumber,
  detectCardNetwork,
  isValidExpiry
} = require("../services/validation");
const { processPayment } = require("../services/paymentProcessor");
/**
 * POST /api/v1/payments/public
 * Public checkout payment
 */
/**
 * GET /api/v1/payments
 * List all payments for authenticated merchant (Dashboard + Transactions)
 */
router.get("/", authenticateMerchant, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        created_at
      FROM payments
      WHERE merchant_id = $1
      ORDER BY created_at DESC
      `,
      [req.merchant.id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("List payments error:", error);
    return res.status(500).json({
      error: {
        code: "PAYMENT_FAILED",
        description: "Could not fetch payments"
      }
    });
  }
});

router.post("/public", async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;

    if (!order_id || !method) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "Invalid payment request"
        }
      });
    }

    // Fetch order + merchant (NO AUTH)
    const orderResult = await pool.query(
      `
      SELECT o.*, m.id AS merchant_id
      FROM orders o
      JOIN merchants m ON o.merchant_id = m.id
      WHERE o.id = $1
      `,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = orderResult.rows[0];

    /* ---- METHOD VALIDATION (same as before) ---- */

    let cardNetwork = null;
    let cardLast4 = null;
    let paymentVPA = null;

    if (method === "upi") {
      if (!isValidVPA(vpa)) {
        return res.status(400).json({
          error: { code: "INVALID_VPA", description: "VPA format invalid" }
        });
      }
      paymentVPA = vpa;
    } else if (method === "card") {
      if (
        !card ||
        !card.number ||
        !card.expiry_month ||
        !card.expiry_year ||
        !card.cvv ||
        !card.holder_name
      ) {
        return res.status(400).json({
          error: { code: "INVALID_CARD", description: "Card validation failed" }
        });
      }

      if (!isValidCardNumber(card.number)) {
        return res.status(400).json({
          error: { code: "INVALID_CARD", description: "Card validation failed" }
        });
      }

      if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({
          error: { code: "EXPIRED_CARD", description: "Card expiry date invalid" }
        });
      }

      cardNetwork = detectCardNetwork(card.number);
      cardLast4 = card.number.replace(/[\s-]/g, "").slice(-4);
    } else {
      return res.status(400).json({
        error: { code: "BAD_REQUEST_ERROR", description: "Invalid payment method" }
      });
    }

    /* ---- CREATE PAYMENT ---- */

    let paymentId;
    do {
      paymentId = generatePaymentId();
      const check = await pool.query(
        "SELECT id FROM payments WHERE id = $1",
        [paymentId]
      );
      if (check.rows.length === 0) break;
    } while (true);

    await pool.query(
      `
      INSERT INTO payments (
        id, order_id, merchant_id, amount, currency,
        method, status, vpa, card_network, card_last4
      )
      VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$9)
      `,
      [
        paymentId,
        order.id,
        order.merchant_id,
        order.amount,
        order.currency,
        method,
        paymentVPA,
        cardNetwork,
        cardLast4
      ]
    );

    /* ---- PROCESS PAYMENT ---- */

    const result = await processPayment({ method });

    if (result.status === "success") {
      await pool.query(
        "UPDATE payments SET status='success', updated_at=CURRENT_TIMESTAMP WHERE id=$1",
        [paymentId]
      );
    } else {
      await pool.query(
        `
        UPDATE payments
        SET status='failed',
            error_code=$1,
            error_description=$2,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=$3
        `,
        [result.error_code, result.error_description, paymentId]
      );
    }

    return res.status(201).json({
      id: paymentId,
      status: result.status
    });
  } catch (err) {
    console.error("Public payment error:", err);
    return res.status(500).json({
      error: {
        code: "PAYMENT_FAILED",
        description: "Payment processing failed"
      }
    });
  }
});

/**
 * POST /api/v1/payments
 */
router.post("/", authenticateMerchant, async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;

    if (!order_id || !method) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "Invalid payment request"
        }
      });
    }

    // Fetch order
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND merchant_id = $2",
      [order_id, req.merchant.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = orderResult.rows[0];

    /* ----------- METHOD VALIDATION ----------- */

    let cardNetwork = null;
    let cardLast4 = null;
    let paymentVPA = null;

    if (method === "upi") {
      if (!isValidVPA(vpa)) {
        return res.status(400).json({
          error: {
            code: "INVALID_VPA",
            description: "VPA format invalid"
          }
        });
      }
      paymentVPA = vpa;
    } else if (method === "card") {
      if (
        !card ||
        !card.number ||
        !card.expiry_month ||
        !card.expiry_year ||
        !card.cvv ||
        !card.holder_name
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_CARD",
            description: "Card validation failed"
          }
        });
      }

      if (!isValidCardNumber(card.number)) {
        return res.status(400).json({
          error: {
            code: "INVALID_CARD",
            description: "Card validation failed"
          }
        });
      }

      if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({
          error: {
            code: "EXPIRED_CARD",
            description: "Card expiry date invalid"
          }
        });
      }

      cardNetwork = detectCardNetwork(card.number);
      cardLast4 = card.number.replace(/[\s-]/g, "").slice(-4);
    } else {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "Invalid payment method"
        }
      });
    }

    /* ----------- CREATE PAYMENT ----------- */

    let paymentId;
    let exists = true;

    while (exists) {
      paymentId = generatePaymentId();
      const check = await pool.query(
        "SELECT id FROM payments WHERE id = $1",
        [paymentId]
      );
      exists = check.rows.length > 0;
    }

    await pool.query(
      `
      INSERT INTO payments (
        id, order_id, merchant_id, amount, currency,
        method, status, vpa, card_network, card_last4
      ) VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$9)
      `,
      [
        paymentId,
        order.id,
        req.merchant.id,
        order.amount,
        order.currency,
        method,
        paymentVPA,
        cardNetwork,
        cardLast4
      ]
    );

    /* ----------- PROCESS PAYMENT ----------- */

    const result = await processPayment({ method });

    if (result.status === "success") {
      await pool.query(
        `
        UPDATE payments
        SET status = 'success', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [paymentId]
      );
    } else {
      await pool.query(
        `
        UPDATE payments
        SET status = 'failed',
            error_code = $1,
            error_description = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        `,
        [result.error_code, result.error_description, paymentId]
      );
    }

    /* ----------- RESPONSE ----------- */

    const response = {
      id: paymentId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      method,
      status: result.status,
      created_at: new Date().toISOString()
    };

    if (method === "upi") response.vpa = paymentVPA;
    if (method === "card") {
      response.card_network = cardNetwork;
      response.card_last4 = cardLast4;
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      error: {
        code: "PAYMENT_FAILED",
        description: "Payment processing failed"
      }
    });
  }
});

/**
 * GET /api/v1/payments/:payment_id
 */
router.get("/:payment_id", authenticateMerchant, async (req, res) => {
  try {
    const { payment_id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM payments
      WHERE id = $1 AND merchant_id = $2
      `,
      [payment_id, req.merchant.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Payment not found"
        }
      });
    }

    const p = result.rows[0];

    const response = {
      id: p.id,
      order_id: p.order_id,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at
    };

    if (p.method === "upi") response.vpa = p.vpa;
    if (p.method === "card") {
      response.card_network = p.card_network;
      response.card_last4 = p.card_last4;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Fetch payment error:", error);
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Payment not found"
      }
    });
  }
});

module.exports = router;
