# Policy Management System

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
   - [Backend](#backend)
   - [Frontend](#frontend)
5. [Configuration](#configuration)
6. [Database Setup](#database-setup)
7. [Available Scripts](#available-scripts)
   - [Backend Scripts](#backend-scripts)
   - [Frontend Scripts](#frontend-scripts)
8. [Testing](#testing)
9. [Best Practices](#best-practices)
10. [API Endpoints](#api-endpoints)
11. [License](#license)

## Introduction

This repository contains a full-stack Policy Management System.
- **Backend**: Node.js + Express + Sequelize + MySQL
- **Frontend**: React (v18.2.0) + Material UI

Users can create, list, move (reorder), edit, and delete rules with pagination, filtering, and drag‑and‑drop reordering using a decimal‑based index.

## Tech Stack

- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: MySQL
- **Frontend**: React 18.2.0, Material UI, react-beautiful-dnd
- **Testing**:
  - Backend: Jest & Supertest
  - Frontend: React Testing Library & Jest

## Prerequisites

- **Node.js** v18.x or higher
- **npm** v8.x or higher
- **MySQL** server (locally or remote)

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

- Runs the server in development mode (with nodemon).
- Default port: **4000**
- Open: `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm start
```

- Starts the React development server.
- Default port: **3000**
- Open: `http://localhost:3000`

## Configuration

1. Copy `.env.example` to `.env` in both `backend/` and `frontend/`.
2. Configure the following variables in `backend/.env`:
   ```dotenv
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=policy_manager
   PORT=4000
   ```
3. (Optional) In `frontend/.env`:
   ```dotenv
   REACT_APP_API_URL=http://localhost:4000/api
   ```

## Database Setup

1. Create the database:
   ```sql
   CREATE DATABASE policy_manager;
   ```


## Available Scripts

### Backend Scripts

- **`npm run dev`**: Start development server with nodemon
- **`npm test`**: Run backend unit & integration tests
- **`npm run migrate`**: Execute database migrations


### Frontend Scripts

- **`npm start`**: Start React development server
- **`npm run build`**: Build production bundle

## Testing

- **Backend**: Uses Jest & Supertest for E2E and unit tests.

Run all tests:

```bash
# Backend tests
cd backend
npm test
```

## Best Practices

- **Environment Variables**: Store secrets in `.env` and never commit them.
- **Project Structure**:
  - `controllers/`, `services/`, `models/`, `routes/` in backend
  - `components/`, `hooks/`, `utils/` in frontend
- **Validation & Error Handling**: Validate all inputs using middleware (e.g., Joi) and return consistent error responses.
- **Code Style**: Use ESLint and Prettier to enforce consistency.
- **Security**:
  - Use parameterized queries via Sequelize to prevent SQL injection.
  - Enable CORS with strict origins.
  - Use HTTPS in production and secure cookies.
- **Performance**:
  - Implement pagination, sorting, and filtering at the database level.
  - Use decimal‑based indexing for efficient drag‑and‑drop reordering.
  - Cache frequent reads where appropriate (e.g., Redis).
- **Testing**: Write unit tests for business logic and integration tests for API endpoints.
- **Logging & Monitoring**: Centralize logs (e.g., Winston) and integrate health checks.

## API Endpoints

### Rules

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/rules`            | List rules (with pagination, filter, search) |
| POST   | `/api/rules`            | Create a new rule          |
| PATCH  | `/api/rules/:id/move`   | Move (reorder) a rule      |
| PATCH  | `/api/rules/:id`        | Edit a rule                |
| DELETE | `/api/rules/:id`        | Delete a rule              |

#### Example: Create Rule

```bash
curl -X POST http://localhost:4000/api/rules \
  -H "Content-Type: application/json" \
  -d '{  
    "name": "Allow From A",  
    "action": "Allow",  
    "sources": [{ "name": "Client A", "email": "a@example.com" }],  
    "destinations": [{ "name": "Server X", "address": "192.168.1.10" }]  
}'
```

#### Example: Move Rule

```bash
curl -X PATCH http://localhost:4000/api/rules/1/move \
  -H "Content-Type: application/json" \
  -d '{ "newIndex": 2 }'
```

## License

This project is licensed under the MIT License.
