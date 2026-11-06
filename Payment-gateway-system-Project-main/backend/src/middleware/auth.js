const { pool } = require("../db");

const authenticateMerchant = async (req, res, next) => {
  try {
    const apiKey = req.header("X-Api-Key");
    const apiSecret = req.header("X-Api-Secret");

    // Missing headers
    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials"
        }
      });
    }

    // Validate against DB
    const result = await pool.query(
      `
      SELECT id, name, email, api_key
      FROM merchants
      WHERE api_key = $1
        AND api_secret = $2
        AND is_active = true
      `,
      [apiKey, apiSecret]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials"
        }
      });
    }

    // Attach merchant to request
    req.merchant = result.rows[0];
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Authentication failed"
      }
    });
  }
};

module.exports = { authenticateMerchant };
