# SaaS Subscription Management API

A proof-of-concept (PoC) backend API for managing SaaS subscription lifecycle, including plans management, customer subscriptions, simulated payments, and webhook event handling with retry logic.

## Features

- **Plans Management**: Pre-seeded Free, Pro, and Enterprise plans with configurable features
- **Subscription Lifecycle**: Create, activate, cancel, and expire subscriptions
- **Fake Payment System**: Simulated checkout with success/failure scenarios
- **Invoice Generation**: Automatic invoice creation on payment
- **Webhook Simulator**: Event-driven webhook system with:
  - Idempotency support
  - Exponential backoff retry logic
  - BullMQ queue-based processing

## Tech Stack

| Technology | Purpose |
|------------|---------|
| NestJS | Backend framework |
| TypeScript | Type-safe development |
| Prisma | ORM and database migrations |
| PostgreSQL | Primary database |
| Redis | Queue storage (BullMQ) |
| BullMQ | Background job processing |
| Swagger | API documentation |
| Jest | Testing framework |
| Docker | Containerization |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Running with Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd mini-saas-subscription-backend

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start PostgreSQL and Redis (via Docker)
docker compose up db redis -d

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run start:dev
```

## API Endpoints

### Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/plans` | List all available plans |
| GET | `/api/v1/plans/:id` | Get plan details |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/subscriptions` | Create a new subscription |
| GET | `/api/v1/subscriptions/me` | Get current user's subscription |
| POST | `/api/v1/subscriptions/:id/cancel` | Cancel a subscription |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/checkout` | Process payment (fake) |
| GET | `/api/v1/payments/invoices/:subscriptionId` | Get invoices |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks/provider` | Receive webhook (simulated) |
| GET | `/api/v1/webhooks/events` | List all webhook events |
| GET | `/api/v1/webhooks/events/pending` | List pending events |

## Usage Example

### 1. Get Available Plans

```bash
curl http://localhost:3000/api/v1/plans
```

### 2. Create a Subscription

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "planId": "<plan-id-from-step-1>"
  }'
```

### 3. Process Payment

```bash
curl -X POST http://localhost:3000/api/v1/payments/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "<subscription-id-from-step-2>"
  }'
```

### 4. Simulate Payment Failure

```bash
curl -X POST http://localhost:3000/api/v1/payments/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "<subscription-id>",
    "simulateFailure": true
  }'
```

### 5. Get Current Subscription

```bash
curl http://localhost:3000/api/v1/subscriptions/me \
  -H "x-user-id: user_123"
```

### 6. Cancel Subscription

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions/<subscription-id>/cancel
```

## Data Model

```
Plan
├── id (UUID)
├── name (unique)
├── price (decimal)
├── interval (monthly/yearly)
└── features (JSON array)

Customer
├── id (UUID)
├── userId (unique, external reference)
├── email
└── name

Subscription
├── id (UUID)
├── customerId -> Customer
├── planId -> Plan
├── status (pending/active/canceled/expired)
├── currentPeriodEnd (datetime)
└── canceledAt (datetime, nullable)

Invoice
├── id (UUID)
├── subscriptionId -> Subscription
├── amount (decimal)
├── status (pending/paid/failed)
└── paidAt (datetime, nullable)

WebhookEvent
├── id (UUID)
├── type (e.g., subscription.created)
├── payload (JSON)
├── status (pending/delivered/failed)
├── attempts (integer)
├── nextRetryAt (datetime, nullable)
└── deliveredAt (datetime, nullable)
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── prisma/                 # Prisma service
├── plans/                  # Plans module
├── customers/              # Customers module
├── subscriptions/          # Subscriptions module
├── payments/               # Payments module
└── webhooks/               # Webhooks module
    ├── webhooks.service.ts
    ├── webhook.processor.ts  # BullMQ worker
    └── webhook.producer.ts   # Queue producer

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data

docker/
├── Dockerfile
└── compose.yml
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |
| `WEBHOOK_ENDPOINT_URL` | Webhook delivery URL | - |

## License

MIT
