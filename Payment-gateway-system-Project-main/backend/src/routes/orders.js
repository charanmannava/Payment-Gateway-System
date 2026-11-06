const generateOrderId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 16; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `order_${random}`;
};
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { authenticateMerchant } = require("../middleware/auth");

/**
 * POST /api/v1/orders
 */
router.post("/", authenticateMerchant, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    // Validation
    if (!amount || !Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "amount must be at least 100"
        }
      });
    }

    let orderId;
    let exists = true;

    // Ensure unique order ID
    while (exists) {
      orderId = generateOrderId();
      const check = await pool.query(
        "SELECT id FROM orders WHERE id = $1",
        [orderId]
      );
      exists = check.rows.length > 0;
    }

    const result = await pool.query(
      `
      INSERT INTO orders (
        id, merchant_id, amount, currency, receipt, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        orderId,
        req.merchant.id,
        amount,
        currency,
        receipt || null,
        notes || null
      ]
    );

    const order = result.rows[0];

    return res.status(201).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "Unable to create order"
      }
    });
  }
});

/**
 * GET /api/v1/orders/:order_id
 */
router.get("/:order_id", authenticateMerchant, async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1 AND merchant_id = $2
      `,
      [order_id, req.merchant.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = result.rows[0];

    return res.status(200).json({
      id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes || {},
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }
});
/**
 * GET /api/v1/orders/:order_id/public
 * Public endpoint for checkout page
 */
router.get("/:order_id/public", async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `
      SELECT id, amount, currency, status
      FROM orders
      WHERE id = $1
      `,
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = result.rows[0];

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
  } catch (error) {
    console.error("Public order fetch error:", error);
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }
});

module.exports = router;
