# Local Environment Setup

Welcome to the **Aditya University Intranet Portal**! This guide walks you through setting up the complete MERN stack on your local machine.

## Prerequisites

Ensure you have the following installed on your local machine:
1. **Node.js** (v16.x or higher)
2. **MongoDB** (Local instance or MongoDB Atlas URI)
3. **Git**
4. **npm** (Node Package Manager)

## Step 1: Clone the Repository

Clone the project to your local directory and checkout the active development branch.

```bash
git clone <repository-url>
cd aus_intranet
git checkout intranet-v3
```

## Step 2: Backend Setup (Express.js)

The backend handles API requests, database interactions, and business logic.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   * Create a `.env` file in the `backend/` directory.
   * See [Environment Variables Guide](./env-variables.md) for the required keys.
4. **Start the backend server:**
   ```bash
   npm run start
   # Or for development with auto-restart:
   npm run dev
   ```
   *The server should now be running on `http://localhost:5001/`.*

## Step 3: Database Seeding (The "Cold Start")

If you are starting with a fresh, empty MongoDB instance, you must seed the database to create the default roles and the initial Admin account.

1. **Run the seed script:**
   ```bash
   # Make sure you are in the backend directory
   npm run seed
   ```
2. **Note:** If a seed script has not been configured yet, you must manually inject the first User document with `role: "Admin"` using MongoDB Compass or `mongosh` so you can log into the frontend application.

## Step 4: Frontend Setup (React + Vite)

The frontend is built with React and Vite for fast Hot Module Replacement (HMR).

1. **Navigate to the frontend directory:**
   Open a new terminal window/tab:
   ```bash
   cd login
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   *The application should now be accessible at `http://localhost:5173/`.*

## Step 5: Verify the Setup

1. Open your browser and navigate to `http://localhost:5173/`.
2. You should see the login screen.
3. Ensure no CORS errors appear in the browser console when attempting to log in or interact with the backend.
