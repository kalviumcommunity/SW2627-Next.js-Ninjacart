# Ninjacart Backend

Express.js REST API with Prisma ORM and PostgreSQL for the Ninjacart Produce Catalogue System.

---

## 🚀 Getting Started & Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v22+
- **PostgreSQL**: v14+ running locally (or via Docker)
- **npm**: v9+

---

### 2. Environment Configuration (`.env`)

Backend requires environment variables to connect to PostgreSQL and sign JWT auth tokens.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your local PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/ninjacart?schema=public"
   JWT_SECRET="your_secure_random_jwt_secret_key"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   FRONTEND_URL="http://localhost:3000"
   ```

> 💡 **Tip:** If running PostgreSQL locally with default settings on macOS/Linux/Windows, the database URL is typically:  
> `postgresql://postgres:postgres@localhost:5432/ninjacart?schema=public`

---

### 3. Install Dependencies
```bash
npm install
```

---

### 4. Database Setup & Migrations

Generate Prisma Client and apply database schema migrations:
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate

# (Optional) Seed the database with sample produce and test accounts
npm run seed
```

---

### 5. Running the Backend Server
```bash
# Development mode with hot-reload (Nodemon)
npm run dev

# Production start
npm start
```
The server will start on `http://localhost:5000`.  
Health check endpoint: `http://localhost:5000/api/health`.

---

### 6. Running Tests
```bash
# Run all backend test suites
npm test

# Run specific suites
npm run test:catalogue
npm run test:filter
npm run test:concurrency
```
