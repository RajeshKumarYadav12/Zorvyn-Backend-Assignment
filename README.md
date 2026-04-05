# 💰 Finance Backend API

## 📌 Project Overview

This project is a backend system for a Finance Dashboard that allows users to manage financial records with role-based access control.

The system supports:

* User authentication (JWT-based)
* Role-based permissions (Admin, Analyst, Viewer)
* Financial records management (CRUD)
* Dashboard analytics (summary, category-wise, monthly trends)
* Advanced features like pagination, search, soft delete, rate limiting, and comprehensive error handling

The goal of this project is to demonstrate clean backend architecture, proper data handling, and scalable API design.

## 🎯 Key Features

- **Authentication & Authorization**: JWT-based login with role-based access control
- **User Management**: Create, update, and manage users (Admin only)
- **Record Management**: Full CRUD operations on financial records with soft delete
- **Search & Filtering**: Search by category/notes, filter by type/category
- **Pagination**: Efficient data retrieval with configurable page/limit
- **Dashboard Analytics**: Aggregated data for insights
- **Validation**: Comprehensive input validation with Joi
- **Error Handling**: Custom error classes and global error middleware
- **Security**: Rate limiting, input sanitization, password hashing
- **Testing**: Unit and integration tests with Jest

---

## ⚙️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js 5.2.1
* **Database**: MongoDB (Mongoose 9.3.3)
* **Authentication**: JWT (jsonwebtoken 9.0.3)
* **Password Hashing**: bcryptjs 3.0.3
* **Input Validation**: Joi 18.1.2
* **CORS**: cors 2.8.6
* **Logging**: Morgan
* **Rate Limiting**: express-rate-limit
* **Testing**: Jest, Supertest
* **Environment**: dotenv 17.4.0

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd finance-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance-db
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Start the server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

### 5. Run tests

```bash
npm test
```

The API will be available at `http://localhost:5000`

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ name, email, password, role? }`
- **Response**: User data + JWT token
- **Roles**: Public (default role: viewer)

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: User data + JWT token

### User Management (Admin Only)

#### Create User
- **POST** `/api/users`
- **Auth**: Bearer token (admin)
- **Body**: `{ name, email, password, role }`

#### Get All Users
- **GET** `/api/users`
- **Auth**: Bearer token (admin)

#### Update User
- **PATCH** `/api/users/:id`
- **Auth**: Bearer token (admin)
- **Body**: `{ role?, isActive? }`

#### Delete User
- **DELETE** `/api/users/:id`
- **Auth**: Bearer token (admin)

### Record Management

#### Create Record
- **POST** `/api/records`
- **Auth**: Bearer token (admin)
- **Body**: `{ amount, type, category, date?, notes? }`

#### Get Records
- **GET** `/api/records`
- **Auth**: Bearer token (admin/analyst/viewer)
- **Query**: `?type=income&category=food&search=keyword&startDate=2026-04-01&endDate=2026-04-30&page=1&limit=10`

#### Get Record by ID
- **GET** `/api/records/:id`
- **Auth**: Bearer token (admin/analyst/viewer)

#### Update Record
- **PATCH** `/api/records/:id`
- **Auth**: Bearer token (admin)
- **Body**: Partial record data

#### Delete Record (Soft)
- **DELETE** `/api/records/:id`
- **Auth**: Bearer token (admin)

### Dashboard Analytics

#### Summary
- **GET** `/api/dashboard/summary`
- **Auth**: Bearer token (admin/analyst)
- **Response**: `{ totalIncome, totalExpense, netBalance }`

#### Category Breakdown
- **GET** `/api/dashboard/categories`
- **Auth**: Bearer token (admin/analyst/viewer)
- **Response**: `[{ category, total }, ...]`

#### Monthly Trends
- **GET** `/api/dashboard/trends`
- **Auth**: Bearer token (admin/analyst/viewer)
- **Response**: `[{ year, month, income, expense }, ...]`

#### Recent Activity
- **GET** `/api/dashboard/recent`
- **Auth**: Bearer token (admin/analyst/viewer)
- **Response**: `{ recent: [ ... ] }`

### Health Check
- **GET** `/health`
- **Response**: Server status and timestamp

---

## 🏗️ Architecture

### Project Structure
```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── utils/                 # JWT, errors
│   ├── validators/            # Joi schemas
│   └── app.js                 # Express app setup
├── tests/                     # Unit/integration tests
├── .env                       # Environment variables
├── jest.config.js            # Test configuration
├── package.json
└── server.js                 # Server entry point
```

### Data Models

#### User
- `name`: String (required, 3-50 chars)
- `email`: String (required, unique, email)
- `password`: String (required, hashed, min 6 chars)
- `role`: Enum (viewer/analyst/admin, default: viewer)
- `isActive`: Boolean (default: true)
- `timestamps`

#### Record
- `amount`: Number (required, positive)
- `type`: Enum (income/expense, required)
- `category`: String (required, 1-50 chars)
- `date`: Date (default: now)
- `notes`: String (optional, max 200 chars)
- `userId`: ObjectId (ref User, required)
- `isDeleted`: Boolean (default: false)
- `timestamps`

### Security Features
- JWT authentication with 24h expiry
- Password hashing with bcrypt
- Rate limiting (100 requests/15min per IP)
- Input validation and sanitization
- Role-based access control
- CORS enabled
- Error messages don't leak sensitive info

---

## 🤔 Assumptions & Design Decisions

1. **Database**: Chose MongoDB for flexibility with financial data; used Mongoose for schema validation
2. **Roles**: Viewer (read-only), Analyst (read + analytics), Admin (full access)
3. **Soft Delete**: Records are marked deleted instead of removed for audit trails
4. **Pagination**: Default 10 items/page, sorted by date desc
5. **Search**: Case-insensitive regex on category and notes
6. **Validation**: Joi for input validation; custom error classes for consistency
7. **Error Handling**: Global middleware catches all errors; operational errors shown to client
8. **Testing**: Jest for unit tests; separate test DB to avoid affecting dev data
9. **Environment**: Separate configs for dev/test/prod

---

## 🧪 Testing

Run tests with:
```bash
npm test
```

Tests include:
- Record CRUD operations
- Authentication middleware
- Input validation
- Error handling

Coverage report generated automatically.

---

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Enable HTTPS

---

## 📈 Future Enhancements

- Add user profile updates
- Implement caching (Redis)
- Add export functionality (CSV/PDF)
- Email notifications
- Advanced analytics (charts, predictions)
- API versioning
- Swagger documentation

---

## 📞 Support

For questions or issues, please check the code comments or create an issue in the repository.

**Note**: This project was built as part of a backend development assignment to demonstrate API design, data modeling, and access control best practices.
```

### 4. Run the server

```bash
npm run dev
```

Server will run at:

```
http://localhost:5000
```

---

## 🔐 Authentication

All protected routes require a JWT token:

```
Authorization: Bearer <token>
```

---

## 👥 Role-Based Access

| Role    | Permissions                        |
| ------- | ---------------------------------- |
| Admin   | Full access (users + records CRUD) |
| Analyst | View records + dashboard analytics |
| Viewer  | View records only                  |

---

## 📦 API Endpoints

### 🔑 Auth Routes

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |

---

### 👤 User Management (Admin Only)

| Method | Endpoint       | Description        |
| ------ | -------------- | ------------------ |
| POST   | /api/users     | Create user        |
| GET    | /api/users     | Get all users      |
| PATCH  | /api/users/:id | Update role/status |
| DELETE | /api/users/:id | Delete user        |

---

### 💰 Records

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | /api/records     | Create record (Admin)   |
| GET    | /api/records     | Get records (All roles) |
| GET    | /api/records/:id | Get single record       |
| PATCH  | /api/records/:id | Update record (Admin)   |
| DELETE | /api/records/:id | Soft delete (Admin)     |

---

### 🔍 Query Parameters (Records)

* `type=income|expense`
* `category=...`
* `search=keyword`
* `page=1`
* `limit=10`

---

### 📊 Dashboard APIs

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | /api/dashboard/summary    | Total income, expense, balance |
| GET    | /api/dashboard/categories | Category-wise totals           |
| GET    | /api/dashboard/trends     | Monthly trends                 |

---

## 📊 Features Implemented

### ✅ Core Features

* User authentication (JWT)
* Role-based access control
* Financial records CRUD
* Dashboard analytics

### 🚀 Advanced Features

* Pagination
* Search (category + notes)
* Soft delete (records)
* Logging (Morgan)

---

## ⚠️ Validation & Error Handling

* Joi validation for all inputs
* Proper HTTP status codes:

  * 400 → Bad Request
  * 401 → Unauthorized
  * 403 → Forbidden
  * 404 → Not Found
  * 500 → Server Error

---

## 🧠 Assumptions

* New users are assigned "viewer" role by default
* Only admins can manage users and records
* Each user can only access their own financial data
* Soft delete is used for records instead of permanent deletion

---

## 📁 Project Structure

```
src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── validators/
 ├── utils/
 ├── config/
 └── app.js
```

---

## 🧪 Testing

* APIs tested using Postman
* Supports all CRUD and dashboard operations

---

## 📌 Notes

This project focuses on clean backend design, modular structure, and maintainable code rather than production-scale deployment.

---

## 🙌 Author

Lalit Sharma
