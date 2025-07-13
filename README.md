# Finance Tracker App

A full-stack personal finance tracker with authentication (email/password & Google OAuth), dashboard analytics, transaction management, device/session management, profile editing, dark mode, and email notifications.

---

## Features

- **User Authentication**
  - Register and login with email/password (with robust email validation)
  - Login with Google (OAuth)
  - JWT-based session management
  - Email notification on every login (via SendGrid)
- **Dashboard**
  - View total balance, budget, income, expenses, and savings rate
  - Visual charts for trends and category spending
  - Recent transactions list
- **Transactions**
  - Add, edit, and delete transactions (income/expense)
  - Upload and view receipt images
  - Export transactions as CSV
- **Profile Management**
  - Update name, email, and profile photo
  - Change password
  - Delete account
- **Device/Session Management**
  - View all active sessions/devices
  - Log out from other devices
- **Settings**
  - Toggle dark/light theme
  - Export all data as CSV
- **Responsive UI**
  - Modern, mobile-friendly design with Tailwind CSS
- **Security**
  - Passwords hashed with bcrypt
  - All protected routes require JWT
  - Sessions stored in MongoDB (via connect-mongo)
- **Notifications**
  - Email notifications for logins (via SendGrid)
  - Toast notifications for all major actions

---

## Tech Stack

- **Frontend:** React, React Router, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose, Passport.js, JWT, Multer, Nodemailer, SendGrid, connect-mongo

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nidhisoni01/finance-tracker.git
cd finance-tracker
```

---

### 2. Setup the Backend

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your MongoDB URI, JWT secret, Google OAuth, and SendGrid API key
npm install
npm start
```

**.env example:**
```
MONGODB_URI=mongodb://localhost:27017/finance_app
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SENDGRID_API_KEY=your_sendgrid_api_key
```
- For Google OAuth, set up credentials in Google Cloud Console.
- For SendGrid, verify your sender email and use your API key.

---

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
npm start
```
- The frontend runs on [http://localhost:3000](http://localhost:3000) and proxies API requests to the backend.

---

## Usage

- **Register** with a valid email and password, or use Google login.
- **Login** to access your dashboard.
- **Add transactions** (income/expense), upload receipts, and view analytics.
- **Edit your profile** and change your password.
- **Manage devices** in Settings (log out from other sessions).
- **Export your data** as CSV.
- **Switch between dark and light mode** in Settings.

---

## Dependencies

### Backend

- express
- mongoose
- cors
- dotenv
- bcrypt
- jsonwebtoken
- passport
- passport-google-oauth20
- express-session
- connect-mongo
- multer
- nodemailer
- sendgrid

Install all with:
```bash
npm install
```

### Frontend

- react
- react-dom
- react-router-dom
- tailwindcss
- recharts
- axios
- react-easy-crop
- @headlessui/react

Install all with:
```bash
npm install
```

---

## Environment Variables

**Backend (`backend/.env`):**
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT signing
- `SESSION_SECRET` — Secret for express-session
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — For Google OAuth
- `SENDGRID_API_KEY` — For email notifications

**Frontend (`frontend/.env`):**
- Not required unless you want to override the API base URL.

---

## How to Use

1. **Start the backend:**  
   `cd backend && npm start`
2. **Start the frontend:**  
   `cd frontend && npm start`
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**
4. **Register or login.**
5. **Explore all features from the dashboard and settings.**

---

## Notes

- All protected API routes require `Authorization: Bearer <token>` header.
- For file uploads, use `profilePhoto` as the form-data key.
- Email notifications are sent via SendGrid from your verified sender address.
- Device/session management is available in Settings.

---

## License

MIT 
