# 🎓 Aditya University Intranet Portal

A centralized digital hub designed for **Aditya University** to streamline communication and resource sharing between Students, Faculty, HODs, Deans, and Administrative Officers. This application facilitates secure document management, role-based announcements, and university-wide updates.

---

## 📚 Global Documentation Repository

This system relies on strictly enforced design patterns. For a comprehensive guide to this project's architecture, setup, API contracts, and development patterns, please refer to the `docs/` directory.

If you are joining the team or returning after a break, start here:

- **1. Setup & Onboarding**
  - [Local Environment Setup](./docs/01-setup-and-onboarding/local-env-setup.md)
  - [Environment Variables Guide](./docs/01-setup-and-onboarding/env-variables.md)
  - [Git Collaboration Workflow](./docs/01-setup-and-onboarding/git-workflow.md)

- **2. Architecture & System Design**
  - [MERN High-Level Design](./docs/02-architecture-system-design/high-level-design.md)
  - [System Models & Mongoose Schemas](./docs/02-architecture-system-design/models-and-schemas.md)
  - [SOLID Principles Enforcement](./docs/02-architecture-system-design/solid-principles.md)
  - Patterns: [Strategy](./docs/02-architecture-system-design/patterns/strategy-pattern.md) | [Adapter](./docs/02-architecture-system-design/patterns/adapter-pattern.md) | [Factory](./docs/02-architecture-system-design/patterns/factory-pattern.md)

- **3. API Contracts (Backend to Frontend)**
  - [Global API Response Standard](./docs/03-api-contracts/api-response-standards.md)
  - [Authentication & User Endpoints](./docs/03-api-contracts/auth-and-users.md)
  - [Content Management (Materials & Announcements)](./docs/03-api-contracts/content-management.md)
  - [Achievements & Event Workshops Endpoints](./docs/03-api-contracts/achievements-workshops.md)

- **4. Frontend UI (React + Vite)**
  > **Note on Folder Structure:** The `login/` directory contains the *complete* React frontend application (encompassing all role dashboards and views), not just the authentication portal.
  - [Role Dashboards Layout Architecture](./docs/04-frontend-ui/role-dashboards.md)
  - [Reusable Component Hierarchy](./docs/04-frontend-ui/component-hierarchy.md)
  - [Global State Management](./docs/04-frontend-ui/state-management.md)
  - [Router Definition Map](./docs/04-frontend-ui/routing-map.md)

- **5. Architecture Decision Records (ADRs)**
  - [0001: Implementing Strategy Pattern for Overloaded Roles](./docs/05-decisions-and-adrs/0001-use-strategy-for-roles.md)
  - [0002: Google Drive Authentication Wrapper](./docs/05-decisions-and-adrs/0002-google-drive-integration.md)
  - [ADR Template](./docs/05-decisions-and-adrs/template.md)

- **6. Troubleshooting & Post-Mortems**
  - [Common Errors (MongoDB, Multer, JWT issues)](./docs/06-troubleshooting-and-lessons/common-errors.md)
  - [Post-Mortem: Fixing Upload Timeouts](./docs/06-troubleshooting-and-lessons/post-mortems/fixing-drive-upload-timeout.md)

---

> **Note:** This repository is built to scale. When adding a new feature (`Achievement`, `DriveItem`, etc.) or modifying a controller, you are strictly required to update the corresponding document or draft a new Architecture Decision Record (ADR) detailing the schema and pattern shifts.
