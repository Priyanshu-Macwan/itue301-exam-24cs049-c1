# ITUE301 Exam Project - Gym & Fitness Class Management System

**Student Roll**: 24CS049  
**Batch**: C1  
**Repository**: `itue301-exam-24cs049-c1`

A full-stack Gym & Fitness Class Management Web Application built with **Node.js, Express, MongoDB (Mongoose with auto In-Memory fallback), and React (Vite)** featuring modern glassmorphic aesthetics.

---

## 📁 Folder Structure

```
itue301-exam-24cs049-c1/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrainerCard.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ClassesPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   └── AdminPanel.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
│
├── backend/
│   ├── models/
│   │   ├── Member.js
│   │   ├── Trainer.js
│   │   └── ClassBooking.js
│   │
│   ├── middleware/
│   │   ├── authGuard.js
│   │   ├── requestLogger.js
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── trainerRoutes.js
│   │   └── bookingRoutes.js
│   │
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev # Starts Express server on port 5000 with In-Memory MongoDB fallback
```

> **Note**: The backend automatically seeds sample trainers, fitness classes, and demo accounts (`member@fitness.com` and `admin@fitness.com`) upon startup.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev # Starts React app on http://localhost:3000
```

---

## 🔑 Demo Account Credentials

Use the **Quick Demo Login** buttons on the Login page or manually enter:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Member** | `member@fitness.com` | `password123` | Book fitness classes, view schedule, cancel reservations |
| **Admin** | `admin@fitness.com` | `admin123` | Manage trainers, create class schedules, cancel classes, admin portal |

---

## 🌐 API Endpoints Table

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create a member or admin account
- `POST /api/auth/login`: Authenticate and receive JWT token
- `GET /api/auth/me`: Get current authenticated user profile (Protected)

### Trainers (`/api/trainers`)
- `GET /api/trainers`: Fetch trainers (Public, optional `?specialization=` filter)
- `GET /api/trainers/:id`: Fetch single trainer details
- `POST /api/trainers`: Add new trainer (Admin Only)
- `PUT /api/trainers/:id`: Update trainer profile (Admin Only)
- `DELETE /api/trainers/:id`: Remove trainer (Admin Only)

### Class Bookings (`/api/bookings`)
- `GET /api/bookings/classes`: Retrieve available fitness classes (Public, optional `?category=` filter)
- `POST /api/bookings/classes`: Publish new fitness class (Admin Only)
- `POST /api/bookings/book`: Reserve a spot in a fitness class (Protected Member)
- `GET /api/bookings/my-bookings`: Retrieve logged in member's active bookings (Protected Member)
- `DELETE /api/bookings/:id`: Cancel booking (Member cancels their spot; Admin cancels entire class)

---

## 🛡️ Key Middlewares

1. **`requestLogger.js`**: Logs all incoming HTTP requests with verb, URL, status code, and response time.
2. **`authGuard.js`**:
   - `protect`: Validates `Authorization: Bearer <jwt_token>` header.
   - `adminOnly`: Restricts route access to users with `role === 'admin'`.
3. **`errorHandler.js`**: Centralized error middleware providing clean JSON error responses for invalid ObjectIDs, duplicate emails, and validation failures.
