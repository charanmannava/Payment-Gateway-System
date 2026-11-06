/**
 * VPA Validation
 * Pattern: ^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$
 */
const isValidVPA = (vpa) => {
  if (!vpa || typeof vpa !== "string") return false;

  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
};

/**
 * Luhn Algorithm for Card Number Validation
 */
const isValidCardNumber = (cardNumber) => {
  if (!cardNumber) return false;

  // Remove spaces and dashes
  const sanitized = cardNumber.replace(/[\s-]/g, "");

  // Must be digits only and length 13–19
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let shouldDouble = false;

  // Traverse from right to left
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Card Network Detection
 */
const detectCardNetwork = (cardNumber) => {
  if (!cardNumber) return "unknown";

  const sanitized = cardNumber.replace(/[\s-]/g, "");

  if (sanitized.startsWith("4")) return "visa";

  const firstTwo = parseInt(sanitized.slice(0, 2), 10);

  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  if (firstTwo === 34 || firstTwo === 37) return "amex";
  if (
    firstTwo === 60 ||
    firstTwo === 65 ||
    (firstTwo >= 81 && firstTwo <= 89)
  ) {
    return "rupay";
  }

  return "unknown";
};

/**
 * Expiry Date Validation
 * Accepts MM/YY or MM/YYYY
 */
const isValidExpiry = (month, year) => {
  if (!month || !year) return false;

  const mm = parseInt(month, 10);
  let yy = parseInt(year, 10);

  if (isNaN(mm) || isNaN(yy)) return false;
  if (mm < 1 || mm > 12) return false;

  // Convert 2-digit year → 20XX
  if (year.length === 2) {
    yy += 2000;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;

  return true;
};

module.exports = {
  isValidVPA,
  isValidCardNumber,
  detectCardNetwork,
  isValidExpiry
};
