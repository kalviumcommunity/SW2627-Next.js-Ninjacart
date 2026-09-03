## 👥 Team Members

| Member             | Role             | Technical Strength |
| ------------------ | ---------------- | ------------------ |
| **Jovab Sabu**     | 🎯 Project Admin | `MERN` · `Git` . `Vercel`    |
| **Kasyap Reji**    | Team Member      | `MERN` · `Git`     |
| **Amrutha Suresh** | Team Member      | `MERN` · `Git`     |

---

## 🤝 Working Agreements

| Area                        | Our Agreement                                    |
| --------------------------- | ------------------------------------------------ |
| 🔍 **PR Review Turnaround** | PRs should be reviewed **within the same day**   |
| 🚧 **Handling Blockers**    | Ping teammates on **WhatsApp / Slack** first     |
| 🗣️ **Standup Format**      | **One person reports** for the entire team       |
| 💬 **Primary Team Channel** | **G-Chat**                                       |
| 🎯 **Sprint Commitment**    | We will try to **end PRs by the end of the day** |

---

## 🛠️ Local Development & Environment Setup

### Quick Start
```bash
# 1. Install dependencies across backend & frontend
npm run install:all

# 2. Configure Backend Environment
cp backend/.env.example backend/.env

# Update backend/.env with your local PostgreSQL credentials:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ninjacart?schema=public"
# JWT_SECRET="your_secure_dev_jwt_secret"

# 3. Apply Prisma Migrations & Seed Data
npm run prisma:migrate
npm run seed

# 4. Run both Backend and Frontend concurrently
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:3000`

---

### 🚀 Team Commitment

> **"Keep the PRs moving, communicate blockers early, and aim to close our work by the end of each day."**