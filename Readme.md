# Delivery Management System

A full-stack web application for managing delivery orders with real-time tracking, role-based access control, and automated stage updates.

## 🌐 Live Demo

- **Frontend:** [https://delivery-management-system-git-main-2232defs-projects.vercel.app/](https://delivery-management-system-git-main-2232defs-projects.vercel.app/)
- **Backend:** [https://dms-backend-3h2p.onrender.com](https://dms-backend-3h2p.onrender.com)

## 🚀 Features

- **Role-Based Access**: Distinct dashboards for **Buyers**, **Sellers**, and **Admins**.
- **Real-Time Updates**: Instant status changes and notifications using **Socket.io**.
- **Order Management**: Full lifecycle tracking from "Order Placed" to "Delivered".
- **Secure Authentication**: Custom JWT authentication with HTTP-Only cookies.
- **Admin Analytics**: View system statistics, active orders, and assign users.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose)
- **Real-Time**: Socket.io

---

## ⚙️ Installation & Setup

### 1. Prerequisites

- Node.js (v16+)
- MongoDB (Atlas URI)

### 2. Server Setup (Backend)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` folder:
    ```env
    PORT=8000
    MONGO_URI=mongodb+srv://dev07:gohikumarsingh@cluster0.rsmkamu.mongodb.net/?appName=Cluster0
    JWT_SECRET=your_secret_key
    NODE_ENV=development
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    _Server runs on http://localhost:8000_

### 3. Client Setup (Frontend)

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    _Client runs on http://localhost:5173_

---

## 📖 Usage Guide

To test the full application flow, follow these steps:

1.  **Register Users**:

    - Go to `/register` and create three separate accounts with different roles:
      - **Buyer** (e.g., `buyer@test.com`)
      - **Seller** (e.g., `seller@test.com`)
      - **Admin** (e.g., `admin@test.com`)

2.  **Create an Order (Buyer)**:

    - Login as **Buyer**.
    - Click "Create New Order", add items, and submit.
    - You will see the order status as "Order Placed".

3.  **Assign Seller (Admin)**:

    - Login as **Admin**.
    - Find the new order in the list.
    - Click "Assign Seller" and select the Seller account you created.

4.  **Process Order (Seller)**:

    - Login as **Seller**.
    - You will see the assigned order.
    - Click "Next Stage" to move the order through stages (Processing -> Packed -> Shipped -> etc.).

5.  **Track Progress**:
    - Switch back to the **Buyer** dashboard to see the progress bar update in real-time!

---

## ⚠️ Test Credentials

If registration is not working or you want to test quickly, use these pre-configured accounts:

| Role       | Email               | Password |
| ---------- | ------------------- | -------- |
| **Admin**  | `aa@example.com`    | `11`     |
| **Seller** | `aa1@example.com`   | `22`     |
| **Buyer**  | `Alena@example.com` | `word`   |
