# 🎓 Aditya University Intranet Portal

A centralized digital hub designed for **Aditya University** to streamline communication and resource sharing between Students, Faculty, HODs, Deans, and Administrative Officers. This application facilitates secure document management, role-based announcements, and university-wide updates.

---

## 📑 Table of Contents

* [✨ Key Features](https://www.google.com/search?q=%23-key-features)
* [🛠 Tech Stack](https://www.google.com/search?q=%23-tech-stack)
* [📂 Project Structure](https://www.google.com/search?q=%23-project-structure)
* [🚀 Getting Started (Installation)](https://www.google.com/search?q=%23-getting-started-installation)
* [Prerequisites](https://www.google.com/search?q=%231-prerequisites)
* [Backend Setup](https://www.google.com/search?q=%232-backend-setup)
* [Frontend Setup](https://www.google.com/search?q=%233-frontend-setup)


* [⚙️ Configuration (.env)](https://www.google.com/search?q=%23%25EF%25B8%258F-configuration-env)
* [💻 Development Workflow](https://www.google.com/search?q=%23-development-workflow)
* [🔐 Role-Based Access Control (RBAC)](https://www.google.com/search?q=%23-role-based-access-control-rbac)
* [🛣 Roadmap](https://www.google.com/search?q=%23-roadmap)

---

## ✨ Key Features

### 🔐 Authentication & Security

* **Secure Login/Register:** Role-based authentication using Email/Password.
* **Password Management:** Self-service password reset and change password functionality.
* **Session Management:** Secure session handling with `sessionStorage`.

### 📄 Document Management System (DMS)

* **PDF Uploads:** Authorized roles (Faculty+) can upload PDFs to specific categories (e.g., "Time Table", "Dept. Equipment").
* **Dynamic Categorization:** Files are automatically grouped by Category and Subcategory.
* **Integrated Viewer:** View PDFs directly within the application via a modal overlay without downloading.
* **Search:** Real-time search filtering for documents.

### 📢 Announcement System

* **Targeted Broadcasts:** Send announcements to specific roles (e.g., Dean  HODs) or specific departments (e.g., HOD  CSE Dept).
* **Live Ticker:** Scrolling news ticker for the latest high-priority updates.
* **Attachment Support:** Attach circulars or notices (PDFs) to announcements.
* **History:** Users can view a history of announcements they have sent.

### 👤 User Dashboard

* **Role-Specific Views:** Custom dashboards for Students, Faculty, HODs, Deans, and Admin.
* **Sidebar Navigation:** Collapsible menu for easy access to Dashboard, Announcements, and Folders.

---

## 🛠 Tech Stack

### **Frontend (Client)**

* **Core:** [React.js](https://react.dev/) (v18)
* **Build Tool:** [Vite](https://vitejs.dev/) (Fast HMR & Build)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + Custom CSS
* **Routing:** React Router DOM (v6)
* **HTTP Client:** Axios
* **PDF Handling:** `pdfjs-dist`
* **Icons:** React Icons & FontAwesome

### **Backend (Server)**

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **File Handling:** Multer (for PDF uploads)

---

## 📂 Project Structure

A clean, modular architecture separating UI features from core logic.

```text
Aditya-Intranet/
├── models/                  # Database Schemas (Backend)
│   ├── User.js              # User authentication & role validation
│   ├── Pdf.js               # Document metadata
│   ├── Announcement.js      # Broadcast messages
│   └── Achievement.js       # Student/Faculty achievements
│
├── src/
│   ├── assets/
│   │   ├── components/
│   │   │   ├── Content/     # Main Controller Component
│   │   │   ├── features/    # Modular Feature Components
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Announcements/
│   │   │   │   └── Documents/
│   │   │   ├── LoginForm/   # Auth Screens
│   │   │   ├── images/      # Static Assets (Logos, Banners)
│   │   │   └── ...          # Other page wrappers (HodPage, DeanPage)
│   │   └── ...
│   ├── main.jsx             # React Entry Point
│   └── App.jsx              # Main Router Configuration
│
├── uploads/                 # Storage for uploaded PDFs (Ignored by Git)
├── .gitignore               # git configuration
├── package.json             # Frontend Dependencies
├── tailwind.config.js       # Tailwind Styling Config
└── vite.config.js           # Vite Configuration (Port 80)

```

---

## 🚀 Getting Started (Installation)

Follow these steps to set up the project from scratch.

### 1. Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
* [Git](https://git-scm.com/)

### 2. Backend Setup

*Since the backend logic (server.js) resides in the same repo or a parallel folder:*

1. Navigate to the root directory.
2. Install backend dependencies (if `package.json` for backend exists) or ensure you have:
```bash
npm install express mongoose cors multer dotenv nodemon

```


3. Start the backend server (typically runs on Port `5001`):
```bash
node server.js
# OR if using nodemon
npm run server

```


*Ensure MongoDB is running locally or connection string is set.*

### 3. Frontend Setup

1. Install frontend dependencies:
```bash
npm install

```


2. Start the development server:
```bash
npm run dev

```


3. Access the app at:
* **Local:** `http://localhost:5173` (or port defined in terminal)
* **Network:** `http://<YOUR_IP_ADDRESS>:80` (Configured in `vite.config.js`)



---

## ⚙️ Configuration (.env)

Create a `.env` file in your backend root directory to manage sensitive variables. **Do not commit this file.**

```env
# Backend Configuration
PORT=5001
MONGO_URI=mongodb://localhost:27017/aditya_intranet
JWT_SECRET=your_super_secret_key_here

# Frontend Configuration (if applicable)
VITE_API_BASE_URL=http://localhost:5001

```

---

## 💻 Development Workflow

We use **Git** for version control. Follow this workflow for adding new features.

### 1. Branching Strategy

Never push directly to `main`. Always create a new branch for your work.

* **Main Branch:** `main` (Production-ready code)
* **Development Branch:** `intranet-v0` (Current active development)

### 2. Common Commands

**Start a new feature:**

```bash
git checkout -b feature-name  # e.g., feature-announcement-edit

```

**Save your progress:**

```bash
git add .
git commit -m "Added ability to edit announcements"

```

**Upload to GitHub:**

```bash
git push -u origin feature-name

```

---

## 🔐 Role-Based Access Control (RBAC)

The system strictly validates user roles.

| Role | Permissions |
| --- | --- |
| **Student** | View Dashboard, View Announcements (Student-targeted), View Teaching Materials, View Time Tables. |
| **Faculty** | Upload Materials, Send Announcements to Students, View Dept Docs. |
| **HOD** | Manage Dept Equipment Docs, Send Announcements to Faculty/Students, View all Dept Docs. |
| **Dean** | Broadcast to HODs/Faculty, Manage Research/IQAC Docs. |
| **Admin** | Full System Access, Create/Edit Categories, User Management. |

---

## 🛣 Roadmap

* [x] **v0.1:** Core Authentication, PDF Uploads, Basic Announcements.
* [ ] **v0.2:** Edit/Delete Announcements, Profile Picture Uploads.
* [ ] **v0.3:** Achievement Module (Student/Faculty rewards).
* [ ] **v1.0:** Mobile Responsive UI improvements & Dark Mode.
