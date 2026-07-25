# MIVA University Maintenance Platform

A full-stack web application designed to digitize and manage the maintenance complaint handling system for MIVA Open University.

## 🚀 Features

- **Role-Based Access Control**: Separate, secure workflows for Students/Staff, Maintenance Officers, and Administrators.
- **Service Requests**: Users can submit maintenance requests and attach photographic evidence.
- **Assignment & Tracking**: Administrators can assign incoming requests to specific maintenance officers.
- **Audit Logs**: Every status change is tracked for accountability.
- **Secure File Storage**: Evidence photos are uploaded directly to Cloudflare R2 (S3-compatible).

## 🛠 Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS v4 + Radix UI (shadcn-style).
- **Backend**: Python (FastAPI) + SQLAlchemy ORM (asyncpg) + Alembic for migrations.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker & Docker Compose (Local & Production via Dokploy).

## 📦 Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+)

## ⚙️ Setup & Installation

### 1. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Update the `.env` file with your secure `SECRET_KEY` and your Cloudflare R2 credentials.

### 2. Start the Docker Stack
This will spin up the PostgreSQL database and the FastAPI backend, and also start the frontend container (if mapped in your compose file).
```bash
docker-compose up -d --build
```
*Note: The backend API runs on `http://localhost:5000` internally (mapped to your configured exposed port), and the frontend on `http://localhost:5173`.*

### 3. Run Migrations & Seed Database
Initialize the database schema and populate the default roles and categories:
```bash
docker-compose run --rm backend alembic upgrade head
docker-compose run --rm backend python seed.py
```

### 4. Frontend Local Development (Optional)
If you prefer running the frontend locally outside of Docker for faster HMR:
```bash
cd frontend
npm install
npm run dev
```

## 📚 API Documentation

Once the backend is running, you can explore the interactive OpenAPI documentation (Swagger UI) at:
- `http://localhost:<YOUR_BACKEND_PORT>/docs`

## 👥 User Roles

1. **Student/Staff**: Can submit new maintenance requests and track the status of their own requests.
2. **Maintenance Officer**: Can view requests assigned to them and update their progress.
3. **Administrator**: Can view all system requests, manage user accounts, and assign maintenance officers to tasks.

## 📝 License
© 2026 Ebubechukwu David Ibeh | M.I.T 8333 | Facilities Management Application
