# Multi-Tenant Workflow App

A multi-tenant workflow and approval system that supports configurable workflows, approvals, concurrency safety, and auditability.  
The frontend is intentionally minimal and exists primarily to validate backend functionality.

## Tech Stack

### Client
- React
- TypeScript

### Server
- Express.js
- TypeScript
- Prisma ORM

### Database
- PostgreSQL

### Server Environment COnfigurations
DATABASE_URL="postgresql://postgres:root@localhost:5432/multi-tenant-workflow-db"
PORT=3000
NODE_ENV=development
JWT_SECRET=Gftr566778gh
JWT_EXPIRES_IN=1h

---

# Run Application with Docker (Recommended)

The application is fully containerized and can be started using Docker Compose.

### Prerequisites
- Docker installed
- Docker Compose installed

### Start the application

Run the following command from the project root:

```bash
docker compose up --build
```

This will start **3 containers**:

1. **Client Container** → React frontend application  
2. **Server Container** → Express backend API  
3. **Database Container** → PostgreSQL database  

### Included Setup

The Docker setup is fully configured to:

- Install dependencies
- Run database migrations
- Seed demo data
- Start all services automatically

Once started:

- Client application: `http://localhost:5173`
- Server API: `http://localhost:3000`

---

# Demo Accounts

Use the following accounts to test different user roles:

| Role | Email | Password |
|------|------|------|
| Admin | ben@example.com | password123 |
| Approver | joe@example.com | password123 |
| Member | jos@example.com | password123 |
| Viewer | stuart@example.com | password123 |

---

# Run Application Without Docker

If you want to run both applications manually on your local machine:

---

## Server Setup

Navigate to server folder:

```bash
cd server
```

Run Prisma setup commands:

```bash
npx prisma format
npx prisma generate
npx prisma db push
npx prisma migrate reset
```

Install dependencies:

```bash
npm install
```

Start server:

```bash
npm run dev
```

Server runs at:

```text
http://localhost:3000
```

---

## Client Setup

Navigate to client folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start client:

```bash
npm run dev
```

Client runs at:

```text
http://localhost:5173
```

---

# Features

- Multi-tenant architecture
- Role-based access control
- Workflow approvals
- Audit logs
- Prisma ORM integration
- Seeded demo data
- Dockerized environment
- Frontend for validating backend workflows

---

# Notes

- The project includes preconfigured database migrations and seed data.
- Docker setup is the recommended way to run the application.
- The frontend is intentionally lightweight and focuses on testing backend workflow functionality.