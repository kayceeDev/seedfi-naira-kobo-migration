# Naira.Kobo to Kobo Migration Project

A production-ready Express.js application demonstrating safe migration from decimal naira.kobo format to integer kobo-only format using Prisma ORM.

## Problem Statement

Storing monetary values as decimals (50.60 for ₦50.60) can lead to precision issues. This project demonstrates migrating to storing amounts in kobo only (5060 for ₦50.60) without data loss.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd naira-kobo-migration
```

### 2. Install Dependencies

```bash
npm install
```

### 1. Start PostgreSQL with Docker

```bash
# Pull PostgreSQL image
docker pull postgres:15-alpine

# Run PostgreSQL container
docker run --name postgres-naira \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=root \
  -e POSTGRES_DB=seedfi \
  -p 3357:5432 \ 
  -d postgres:15-alpine

# Verify it's running
docker ps

# Check logs
docker logs postgres-naira
```

#### Alternative: Using Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres-naira
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: 
      seedfi
    ports:
      - "3357:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 3. Start PostgreSQL Database

```bash
docker-compose up -d
```

Verify the container is running:

```bash
docker ps
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:3357/seedfi?schema=public"
PORT=3000
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev
```

This will create the database schema and tables.

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Start the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

```bash
GET http://localhost:3000/health
```

### Create Transaction

```bash
POST http://localhost:3000/api/transactions
Content-Type: application/json

{
  "amount": 50.60,
  "description": "Lunch"
}
```

### Get All Transactions

```bash
GET http://localhost:3000/api/transactions
```

### Get Transaction Statistics

```bash
GET http://localhost:3000/api/transactions/stats
```

## Project Structure

```
naira-kobo-migration/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── index.js               # Express server
│   ├── routes/
│   │   └── transaction.js    # Transaction routes
│   └── scripts/
│       └── migrate-to-kobo.js # Data migration script
├── docker-compose.yml         # PostgreSQL configuration
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Testing the Application

### 1. Create a test transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.50, "description": "Test transaction"}'
```

### 2. Retrieve all transactions

```bash
curl http://localhost:3000/api/transactions
```

### 3. Check statistics

```bash
curl http://localhost:3000/api/transactions/stats
```

## Stopping the Application

### Stop the Node.js server

Press `Ctrl + C` in the terminal where the app is running.

### Stop the PostgreSQL container

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## Troubleshooting

### Cannot connect to database

**Check if PostgreSQL container is running:**

```bash
docker ps
```

**Restart the container:**

```bash
docker restart postgres-naira
```

**View container logs:**

```bash
docker logs postgres-naira
```

### Port 5432 is already in use

If you have another PostgreSQL instance running, modify `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Change host port to 5433
```

Then update your `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/naira_migration?schema=public"
```

### Prisma Client errors

Regenerate the Prisma Client:

```bash
npx prisma generate
```

### Migration errors

Reset the database (WARNING: This deletes all data):

```bash
npx prisma migrate reset
```

## Technologies Used

- **Backend:** Node.js, Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL 15
- **Containerization:** Docker

## License

MIT