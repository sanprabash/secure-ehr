# 🏥 Secure EHR — Smart Healthcare Record System

A secure, web-based Electronic Health Record system that enables patients to store, manage, and share medical records digitally with role-based access control and AES-256-CBC encryption.

![CI/CD](https://github.com/sanprabash/secure-ehr/actions/workflows/ci.yml/badge.svg)

---

## 📋 Overview

Secure EHR is a full-stack web application developed as a final year project for PUSL3190 at the University of Plymouth (RMIT Sri Lanka). The system provides three role-based portals for patients, doctors, and administrators.

---

## ✨ Features

### Patient Portal
- Upload and manage medical records
- AES-256-CBC file encryption before storage
- Grant and revoke doctor access via consent management
- View who accessed each record (audit trail)
- Real-time notifications
- Delete account and records

### Doctor Portal
- View patients who have granted consent
- Add clinical notes and prescriptions
- Decrypt and view patient files
- Real-time notifications

### Admin Portal
- Add and remove doctors
- Auto-generate temporary passwords
- Send login credentials via email
- View system statistics

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Encryption | AES-256-CBC |
| Authentication | JWT |
| Email | Nodemailer + Gmail |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |

---

## 🔒 Security Features

- AES-256-CBC encryption for all uploaded files
- JWT-based authentication with role-based access control
- Consent-based doctor access — patients control who sees their data
- Full access audit logging
- Bcrypt password hashing
- Sri Lanka Data Protection Act 2022 compliant

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Installation

**Backend:**
```bash
cd backend
npm install
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create a `.env` file in the `backend` folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
AES_SECRET_KEY=your_aes_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

---

## 🧪 Testing

```bash
cd backend
npm test
```

18 automated tests covering Authentication, Patient, Doctor and Notification APIs.

---

## 📱 Mobile Application

A companion React Native mobile app is available at [SecureEHR-Mobile](https://github.com/sanprabash/SecureEHR-Mobile).

---

## 👤 Author

**Sandaru Pathirana**
Student ID: 10952985
University: University of Plymouth
Campus: NSBM Green University, Sri Lanka
Supervisor: Ms. Pavithra Subhashini