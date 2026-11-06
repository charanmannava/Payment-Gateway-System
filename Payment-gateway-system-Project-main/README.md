# 💳 Payment Gateway with Multi-Method Processing and Hosted Checkout

A full-stack payment gateway system that emulates real-world platforms like Razorpay or Stripe. This project allows merchants to create payment orders via secure APIs and enables customers to complete payments using a hosted checkout page with UPI and Card payment methods.

The system is fully dockerized, follows proper payment lifecycle management, and includes a merchant dashboard for monitoring transactions.


---
## 🚀 Features

* 🔐 **Merchant authentication** using API Key & API Secret
* 🧾 **Order creation** and management
* 💳 **Multi-method payments** (UPI & Card)
* 🧠 **Payment state machine**: processing → success / failed
* 🌐 **Hosted checkout page** (public access)
* 📊 **Merchant dashboard** with real-time stats
* 📦 **Fully dockerized** setup using Docker Compose
* 🧪 **Deterministic test mode** for evaluation

## 🛠️ Tech Stack

### Backend
* Node.js
* Express.js
* PostgreSQL

### Frontend
* React (Vite)
* Axios
* React Router

### Infrastructure
* Docker
* Docker Compose

## 📂 Project Structure

```text
payment-gateway-system-project/
├── backend/            # Node.js API
├── frontend/           # Merchant dashboard (React)
├── checkout-page/      # Hosted checkout (React)
├── docker-compose.yml
├── .env.example
└── README.md

```

## ⚙️ Setup & Installation

### 1️⃣ Prerequisites

* Docker & Docker Compose installed

### 2️⃣ Clone the Repository

```bash
git clone <your-github-repo-url>
cd payment-gateway-system-project

```

### 3️⃣ Environment Variables

Create a `.env` file using `.env.example`:

```env
DATABASE_URL=postgresql://gateway_user:gateway_pass@postgres:5432/payment_gateway
PORT=8000

TEST_MODE=false
TEST_PAYMENT_SUCCESS=true
TEST_PROCESSING_DELAY=1000

```

### 4️⃣ Run the Application

```bash
docker compose up -d --build

```

All services will start with a single command.

## 🌐 Application URLs

| Service | URL |
| --- | --- |
| **Backend API** | `http://localhost:8000` |
| **Health Check** | `http://localhost:8000/health` |
| **Merchant Dashboard** | `http://localhost:3000` |
| **Checkout Page** | `http://localhost:3001/checkout?order_id=ORDER_ID` |

## 🔐 Test Merchant Credentials (Auto-Seeded)

These credentials are automatically created on startup:

* **API Key:** `key_test_abc123`
* **API Secret:** `secret_test_xyz789`
* **Email:** `test@example.com`

## 🔄 Payment Flow Overview

1. **Merchant** creates an order via API.
2. **Customer** is redirected to hosted checkout.
3. **Payment** is created with status `processing`.
4. **Backend** processes payment logic.
5. **Status** updated to `success` or `failed`.
6. **Dashboard** reflects transaction in real time.

## 🧪 Testing Strategy

* **API testing** using Postman.
* **Validation testing** for UPI, card number (Luhn), and expiry.
* **Test mode** for deterministic outcomes.
* **End-to-end testing** via checkout → dashboard flow.

## 📈 Scalability Considerations

If scaled to high throughput:

* Async payment processing with **message queues** (e.g., RabbitMQ or Kafka).
* **Horizontal scaling** of API services.
* Database **indexing, partitioning, and read replicas**.
* **Redis caching** for frequent reads.
## 📸 Screenshots

### Health Check
![Health Check](screenshots/health-check.png)

### Hosted Checkout
![Checkout](screenshots/checkout-page.png)

### Payment Success
![Success](screenshots/payment-success.png)

### Merchant Dashboard
![Dashboard](screenshots/dashboard.png)

---

## 🙌 Conclusion

This project demonstrates a real-world fintech system with secure APIs, payment validation, state management, and full-stack integration. It reflects production-level design principles used in modern payment gateways.

## 📬 Author

**Charan Mannava**
Full-Stack Developer | Fintech & Backend Enthusiast
