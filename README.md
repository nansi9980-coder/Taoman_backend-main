# Taoman Backend

A NestJS-based backend application with Prisma ORM for Neon PostgreSQL and Resend for email sending.

## Features

- NestJS framework
- Prisma ORM with Neon PostgreSQL
- Email sending with Resend
- OTP functionality

## Installation

```bash
$ npm install
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
RESEND_API_KEY="your_resend_api_key"
```

- Get the `DATABASE_URL` from your Neon PostgreSQL project.
- Get the `RESEND_API_KEY` from your Resend account.

## Database Setup

1. Define your models in `prisma/schema.prisma`.
2. Run Prisma commands:

```bash
$ npx prisma generate
$ npx prisma db push
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user (body: {email, password})
- `POST /auth/login` - Login (body: {email, password})
- `POST /auth/send-otp` - Send OTP to email (body: {email})

### Clients (Admin - JWT required)
- `GET /clients` - Get all clients
- `GET /clients/:id` - Get client by ID
- `POST /clients` - Create client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Quotes
- `POST /quotes/submit` - Submit quote from public site (body: {title, description?, clientEmail, clientName, clientPhone?})
- `GET /quotes` - Get all quotes (admin)
- `GET /quotes/:id` - Get quote by ID (admin)
- `POST /quotes` - Create quote (admin)
- `PUT /quotes/:id` - Update quote (admin)
- `DELETE /quotes/:id` - Delete quote (admin)

### Content
- `GET /content/public` - Get published content (public)
- `GET /content/public/:slug` - Get content by slug (public)
- `GET /content` - Get all content (admin)
- `POST /content` - Create content (admin)
- `PUT /content/:id` - Update content (admin)
- `DELETE /content/:id` - Delete content (admin)

### Jobs
- `GET /jobs/public` - Get published jobs (public)
- `GET /jobs` - Get all jobs (admin)
- `GET /jobs/:id` - Get job by ID
- `POST /jobs` - Create job (admin)
- `PUT /jobs/:id` - Update job (admin)
- `DELETE /jobs/:id` - Delete job (admin)

### Investments (Admin - JWT required)
- `GET /investments` - Get all investments
- `GET /investments/:id` - Get investment by ID
- `POST /investments` - Create investment
- `PUT /investments/:id` - Update investment
- `DELETE /investments/:id` - Delete investment

### Messages (Admin - JWT required)
- `GET /messages` - Get all messages for user
- `GET /messages/sent` - Get sent messages
- `POST /messages` - Send message
- `PUT /messages/:id/read` - Mark message as read

### Users (Admin - JWT required)
- `GET /users` - Get all users

### Dashboard (Admin - JWT required)
- `GET /dashboard/stats` - Get dashboard statistics

All admin endpoints require JWT token in Authorization header: `Bearer <token>`

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Fill in your database URL (Neon PostgreSQL)
   - Set JWT_SECRET
   - Configure Resend API key and from email

3. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the server:**
   ```bash
   npm run start:dev
   ```

## Frontend Integration

- **CORS enabled** for origins: http://localhost:3000, http://localhost:5173, http://localhost:4173
- Use JWT tokens for authenticated requests
- Public endpoints for site vitrine: `/content/public`, `/jobs/public`, `/quotes/submit`
- Admin can modify content via `/content` which can be displayed on the site vitrine

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## License

Unlicensed