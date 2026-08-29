# Getting Started

Welcome! This guide will help you set up the Point-Of-Sale backend system on your computer.

## What You'll Need

Before starting, make sure you have these tools installed on your computer.

### Required Software

**Node.js** (version 18 or higher)

**PostgreSQL** (version 16 or higher)

**pnpm** (package manager)

### Optional Software

**Git** (for cloning the repository)

- Download from [git-scm.com](https://git-scm.com/)

**Docker** (for containerized setup)

- Download from [docker.com](https://www.docker.com/)
- Makes setup easier but not required

**Prisma Studio** (included with Prisma)

- Visual database browser
- Automatically available after installation

## Installation

Follow these steps to get your development environment running.

### Step 1: Get the Code

If you have Git installed:

```bash
git clone <your-repository-url>
cd Point-Of-Sale-Backend
```

### Step 2: Enable Corepack

Corepack allows you to use pnpm without installing it globally:

```bash
corepack enable
```

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Set Up Environment Variables

The application needs some configuration to run. Create a file named `.env` in the root folder:

```bash
# Server Settings
PORT=3000
NODE_ENV=development
FRONT_END_ORIGIN=http://localhost:5173

# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/pos_db"
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=pos_db

# Security Keys (change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
COOKIE_SECRET=your-cookie-secret-change-this-in-production
```

### Step 5: Set Up the Database

Make sure PostgreSQL is running on your computer before continuing.

#### Create the Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (in psql)
CREATE DATABASE pos_db;

# Exit psql
\q
```

Or if you prefer, use a GUI tool like pgAdmin to create the database.

#### Generate Prisma Client

This creates the code that talks to your database:

```bash
npx prisma generate
```

You should see "Generated Prisma Client" when it's done.

#### Run Migrations

This creates all the tables in your database:

```bash
npx prisma migrate deploy
```

This applies all migrations and sets up your database structure. You'll see each migration being applied.

> **Alternative for Development**: If you're developing and want to reset everything, use `npx prisma migrate dev` instead.

### Step 6: Seed the Database

Now let's add some initial data. Run these commands **in this exact order**:

#### 1. Seed Permissions (Required First)

```bash
pnpm run permission-seed
```

This creates all the permission records that define what actions can be performed.

#### 2. Seed Roles

```bash
pnpm run seed
```

This creates the Admin and User roles with their permissions.

#### 3. Seed Initial User and Location

```bash
pnpm run user-seed
```

This creates:

- A phone number: `+959123456789`
- A location: "Main Branch" in Yangon, Myanmar
- A user account you can log in with

#### 4. Seed Sample Data (Optional)

```bash
pnpm run data-seed
```

This adds sample data for testing:

You can skip this if you want to add your own data.

### Step 7: Start the Server

Start the development server:

```bash
pnpm run dev
```

You should see:

```
app is listening on port 3000
```

The server is now running!

### Step 8: Test the API

Open your browser and visit:

```
http://localhost:3000/api
```

You should see a JSON response:

```json
{
  "success": true,
  "version": "v1",
  "message": "Hello from API v1"
}
```

Congratulations! Your backend is up and running!

## Alternative Setup: Docker

If you have Docker installed, you can skip most of the manual setup:

```bash
# Start everything with one command (first time)
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

This automatically:

- Creates a PostgreSQL container
- Creates the backend container
- Connects them together
- Runs migrations
- Starts the development server

To stop:

```bash
docker-compose down
```
