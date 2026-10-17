# 🎙️ PodcastHub - Real-time Podcasting & Billing Platform

PodcastHub is a modern, full-stack, real-time audio podcasting and subscription platform. It allows hosts to create live audio rooms with dynamic speaking/listening roles, features real-time chat powered by WebSockets, and offers premium subscriptions integrated with Stripe billing and automated cron jobs.

---

## 🏗️ System Architecture

The following diagram illustrates how the frontend components, backend server, database, and external cloud services interact with one another:

```mermaid
graph TD
    subgraph Frontend [React Application - Port 3001]
        UI["React UI (Tailwind CSS)"]
        Redux["Redux State Management"]
        RTC_SDK["Agora RTC SDK NG"]
        SIO_Client["Socket.io Client"]
        Stripe_JS["Stripe JS & Elements"]
    end

    subgraph Backend [Express Node Server - Port 3000]
        API["Express Routing & Controllers"]
        Auth["JWT Authenticator Middleware"]
        SocketIO["Socket.io Server Instance"]
        AgoraToken["Agora RTC Token Generator"]
        StripeController["Stripe Billing & Webhooks"]
        CronJob["Node-cron Expiry Checkers"]
    end

    subgraph External [External Cloud Services]
        Stripe["Stripe Billing Gateway"]
        Agora["Agora RTC Audio Cloud"]
        Mailtrap["Mailtrap SMTP (Email Sandbox)"]
        MongoDB["MongoDB Atlas Database"]
    end

    UI -->|HTTP / REST| API
    UI -->|RTC Token Requests| AgoraToken
    RTC_SDK <-->|Real-time Audio Channels| Agora
    SIO_Client <-->|WebSockets (Chat & Activity)| SocketIO
    Stripe_JS <-->|Secure Card Tokenization| Stripe
    
    API -->|Auth Validation| Auth
    API -->|Read/Write Operations| MongoDB
    StripeController <-->|Create Sessions / Sync Subscriptions| Stripe
    Stripe -->|Webhooks| API
    CronJob -->|Automated Sub Expirations| MongoDB
    API -->|SMTP Transactional Emails| Mailtrap
```

---

## ✨ Core Features

*   **🎙️ Real-time Audio Rooms (Agora RTC):** 
    *   Dynamic roles including **Moderator** (full control), **Speaker** (can talk), and **Listener** (receives audio streams).
    *   On-demand token generation with cryptographic signatures for safe channel joins.
    *   Agora Cloud Recording integration to store and review past podcast sessions.
*   **💬 Interactive Real-time Chat (Socket.io):**
    *   Auth-secured WebSockets checking JWT on handshake.
    *   Typing indicators, participant join/leave notifications, and room-specific message history stored directly in MongoDB.
*   **💳 Subscription & Plans (Stripe Billing):**
    *   Multi-tier plans with billing intervals.
    *   Secure Stripe Checkout redirection and Customer Portal billing management.
    *   Stripe Webhooks endpoint using signature verification to keep MongoDB subscription entries synchronized in real-time.
    *   Automated Node-cron schedulers running daily to invalidate expired memberships.
*   **🔒 Secure JWT Authentication:**
    *   Cookies/Header-based token extraction.
    *   Bcrypt-hashed password verification.
    *   SMTP Mailer integration (Nodemailer) for transactional alerts and registration verifications.

---

## 🛠️ Tech Stack

### Frontend
*   **React 18** (SPA framework)
*   **React Router DOM v6** (Protected & layout routes)
*   **Redux Toolkit** (Global state management)
*   **Tailwind CSS** & **Headless UI** (Responsive layouts, transitions, and overlays)
*   **Agora RTC SDK NG** (Real-time WebRTC audio clients)
*   **Socket.io Client** (WebSocket connections)
*   **Stripe SDK / Elements** (Credit card tokenization)
*   **React Hook Form** (Form validations)
*   **React Hot Toast** (Toast notifications)

### Backend
*   **Node.js** & **Express** (ESM Modules, Express v5)
*   **MongoDB** & **Mongoose** (Object-Document Mapper)
*   **Socket.io Server** (WebSocket listener)
*   **Agora Access Token** (RTC token service)
*   **Stripe NodeJS** (Subscription & customer operations)
*   **Node-cron** (Scheduler)
*   **Nodemailer** (SMTP integration)

---

## 📂 Project Directory Structure

```
podcast/
├── backend/                  # Node.js backend server
│   ├── config/               # Database configurations and constants
│   ├── controllers/          # Business logic controllers (users, sessions, payments)
│   ├── cron/                 # Node-cron jobs for subscriptions
│   ├── database/             # MongoDB connection scripts
│   ├── middleware/           # Auth and error middlewares
│   ├── models/               # Mongoose Schema definitions
│   ├── routes/               # API route definitions
│   ├── socket/               # Socket.io listeners & auth handler
│   ├── uploads/              # Staged local file/avatar uploads
│   ├── index.js              # Server entry point
│   ├── package.json          # Backend npm dependencies
│   └── POSTMAN_TEST_GUIDE.md # API routes verification manual
└── frontend/                 # React frontend application
    ├── public/               # Static assets
    ├── src/
    │   ├── components/       # UI Components (Auth, Layout, Rooms)
    │   ├── context/          # React contexts
    │   ├── pages/            # View pages (Login, Dashboard, Room)
    │   ├── services/         # Axios API connection endpoints
    │   ├── App.jsx           # Routing wrapper
    │   └── index.js          # App entry point
    └── package.json          # Frontend npm dependencies
```

---

## 🚀 Installation & Local Setup

### 📋 Prerequisites
Make sure you have installed:
*   [Node.js](https://nodejs.org/) (v16.x or higher)
*   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas account URI)
*   Stripe Developer Account (test keys)
*   Agora Developer Account (App ID and Certificate)

---

### 💻 1. Configure the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup the `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Fill in the required environment parameters:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/podcasthub
   JWT_SECRET=your_jwt_strong_secret_key
   
   # SMTP mail server credentials (e.g., Mailtrap)
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your_smtp_username
   MAIL_PASSWORD=your_smtp_password
   
   # Frontend URL (for CORS validation)
   FRONTEND_URL=http://localhost:3001
   BASE_URI=http://localhost:3000
   ```
5. Run the backend development server:
   ```bash
   npm run dev
   ```
   The backend server runs at `http://localhost:3000`.

---

### 💻 2. Configure the Frontend

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup the `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Configure your client-side env keys:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api/v1
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Run the frontend development server:
   ```bash
   npm start
   ```
   The web application will automatically open at `http://localhost:3001`.

---

## 📡 REST API Endpoint Overview

| Resource | Method | Endpoint | Auth | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/v1/users/register` | ❌ | Create new user account |
| | `POST` | `/api/v1/users/login` | ❌ | Log in and return JWT token |
| | `GET` | `/api/v1/users/profile` | `JWT` | Retrieve current user detail |
| **Sessions** | `POST` | `/api/v1/sessions` | `JWT` | Host a new podcast session |
| | `GET` | `/api/v1/sessions` | `JWT` | Fetch all active sessions |
| | `POST` | `/api/v1/sessions/:id/join` | `JWT` | Join a session room |
| **Agora** | `POST` | `/api/v1/agora/token` | `JWT` | Generate audio channel token |
| **Chat** | `GET` | `/api/v1/chat/:sessionId` | `JWT` | Fetch session message history |
| **Payments** | `POST` | `/api/v1/payments/checkout` | `JWT` | Create a Stripe Checkout session |
| | `POST` | `/api/v1/webhooks` | ❌ | Stripe Webhook handler (raw body) |
| **Recordings**| `GET` | `/api/v1/recordings/:sessionId`| `JWT` | Fetch session audio recordings |

---

## 🔌 Socket.io Events Reference

During a live audio session, WebSockets facilitate text messaging and participant states. Here is the contract:

### Clients Emitting Events
*   `join-session` (Payload: `sessionId`): Adds the socket connection to the target room namespace. Returns errors if unauthorized.
*   `leave-session` (Payload: `sessionId`): Gracefully exits the room namespace.
*   `send-message` (Payload: `{ sessionId, message, type: 'text' }`): Persists message to MongoDB and broadcasts it to all participants in the session.
*   `typing-start` (Payload: `sessionId`): Broadcasts typing indicators to show other users who is composing a message.
*   `typing-stop` (Payload: `sessionId`): Clears typing status notification.

### Server Broadcasting Events
*   `user-joined` (Payload: `{ userId, userName, timestamp }`): Emitted when a new listener/speaker joins.
*   `user-left` (Payload: `{ userId, userName, timestamp }`): Emitted when a participant exits.
*   `new-message` (Payload: `PopulatedMessageDoc`): Emitted to all room connections upon a successful message commit.
*   `user-typing` (Payload: `{ userId, userName, isTyping }`): Broadcasts typing state to other chatters.
*   `error` (Payload: `{ message }`): Delivers server exceptions to the calling socket.

---

## ⚠️ Important Troubleshooting Notes

### 1. MongoDB Session Participant Role Validation
The Session schema enforces role enums at the database level:
*   **Valid Roles:** `['speaker', 'listener', 'moderator']`
*   **Important Check:** Make sure you do not pass generic terms like `user` or `admin` in the body of `joinSession` requests. Invalid values will trigger database validation errors. Default roles default to `listener`. See [SCHEMA_CONTROLLER_MISMATCH.md](file:///backend/SCHEMA_CONTROLLER_MISMATCH.md) for background details.

### 2. Stripe Webhook Signature Check
*   The Stripe webhooks route (`/api/v1/webhooks`) requires the raw payload request to verify cryptographic signatures.
*   In `backend/index.js`, **always declare `/api/v1/webhooks` before** declaring `app.use(express.json())`. Declaring it afterwards parses the request body as JSON, corrupting signature verification and returning `Webhook Error: Signature verification failed`.

### 3. Local Stripe Webhook Testing
To capture Stripe webhook events locally, download the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/v1/webhooks
```
Then copy the `whsec_...` signing secret into your backend configuration `.env` file under `STRIPE_WEBHOOK_SECRET`.

---

## 📄 License
This codebase is distributed under the MIT License.
