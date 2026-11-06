const { pool } = require("./db");

const createTablesAndSeed = async () => {
  try {
    console.log("⏳ Initializing database...");

    /* ---------------- MERCHANTS ---------------- */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        api_key VARCHAR(64) UNIQUE NOT NULL,
        api_secret VARCHAR(64) NOT NULL,
        webhook_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ---------------- ORDERS ---------------- */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        amount INTEGER NOT NULL CHECK (amount >= 100),
        currency VARCHAR(3) DEFAULT 'INR',
        receipt VARCHAR(255),
        notes JSONB,
        status VARCHAR(20) DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ---------------- PAYMENTS ---------------- */
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'processing',
        vpa VARCHAR(255),
        card_network VARCHAR(20),
        card_last4 VARCHAR(4),
        error_code VARCHAR(50),
        error_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ---------------- INDEXES ---------------- */
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_merchant_id
      ON orders(merchant_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_order_id
      ON payments(order_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status
      ON payments(status);
    `);

    /* ---------------- SEED TEST MERCHANT ---------------- */
    const testMerchant = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Merchant",
      email: "test@example.com",
      apiKey: "key_test_abc123",
      apiSecret: "secret_test_xyz789"
    };

    const existing = await pool.query(
      "SELECT id FROM merchants WHERE email = $1",
      [testMerchant.email]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `
        INSERT INTO merchants (
          id, name, email, api_key, api_secret
        ) VALUES ($1, $2, $3, $4, $5)
        `,
        [
          testMerchant.id,
          testMerchant.name,
          testMerchant.email,
          testMerchant.apiKey,
          testMerchant.apiSecret
        ]
      );

      console.log("✅ Test merchant seeded");
    } else {
      console.log("ℹ️ Test merchant already exists, skipping seed");
    }

    console.log("✅ Database ready");
  } catch (error) {
    console.error("❌ Database initialization failed", error);
    process.exit(1);
  }
};

module.exports = { createTablesAndSeed };
