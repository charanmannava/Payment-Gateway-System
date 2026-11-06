/**
 * Payment Processing Engine
 * Handles synchronous payment simulation
 */

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const processPayment = async ({ method }) => {
  const isTestMode = process.env.TEST_MODE === "true";

  let delay;
  let success;

  if (isTestMode) {
    // TEST MODE (Deterministic)
    delay = process.env.TEST_PROCESSING_DELAY
      ? parseInt(process.env.TEST_PROCESSING_DELAY, 10)
      : 1000;

    success =
      process.env.TEST_PAYMENT_SUCCESS !== "false";
  } else {
    // PRODUCTION MODE (Random)
    const min = parseInt(process.env.PROCESSING_DELAY_MIN || 5000, 10);
    const max = parseInt(process.env.PROCESSING_DELAY_MAX || 10000, 10);

    delay = Math.floor(Math.random() * (max - min + 1)) + min;

    const successRate =
      method === "upi"
        ? parseFloat(process.env.UPI_SUCCESS_RATE || 0.9)
        : parseFloat(process.env.CARD_SUCCESS_RATE || 0.95);

    success = Math.random() < successRate;
  }

  // Simulate the bank delay
  await sleep(delay);

  if (success) {
    return {
      status: "success"
    };
  }

  return {
    status: "failed",
    error_code: "PAYMENT_FAILED",
    error_description: "Payment processing failed"
  };
};

module.exports = { processPayment };
