# Component Hierarchy

The `aus_intranet/frontend/src/assets/components/features/` directory houses the modular, reusable pieces of UI that are shared across different Role Dashboards.

## Feature Breakdown

### 1. `Sidebar`
The collapsible navigation menu. It accepts props (like `role` or `permissions`) to conditionally render links (e.g., hiding the "User Management" link from non-admins).

### 2. `Announcements`
Components for reading, creating, editing, and deleting (CRUD) broadcast messages.
* `AnnouncementFeed`: The scrolling list of messages.
* `CreateAnnouncementForm`: The form utilized by Faculty+ to target specific roles/departments with a new message.


### 4. `IQAC Sub-Modules (Workshops, Guest Lectures, Industrial Visits, FDP/PDP, FDP/STTP Outside)`
Handles various departmental faculty events and reporting. All sub-modules follow the identical architectural pattern:
* `[Feature]Manager`: Faculty-facing CRUD form for adding, editing, and deleting records.
* `HOD[Feature]Manager`: HOD view with:
  * **Overview Tab:** Dynamically filterable table to view all department records by academic year + Excel Report Generation.
  * **Access Control Tab:** UI for mapping which specific faculty members are authorized to add/edit records within that module (grants specific boolean flags like `canManageWorkshops` or `canManageGuestLectures`).

### 5. `Syllabus`
Located in `features/Syllabus`. Used by Admin/Officers to manage academic syllabi.
* `SyllabusManager`: Comprehensive form to select School, level, program, branch, and batch before uploading or deleting syllabus PDFs.

---

## 🏗️ Admin & Infrastructure Components

Located in `components/Admin`. These are restricted to users with the `Admin` role.

### 1. `SchoolProgramManager`
A master-data management UI for defining the University's schools and programs (e.g., adding "B.Tech" to "School of Engineering").

### 2. `SubRoleManager`
Allows administrators to define and manage "Sub-Roles" (Departments) like CSE, ECE, etc., which are then linked to users and school programs.

## State Management Approach

While tools like Redux exist, for this application's initial scale, state is primarily managed via:
* **Context API:** For truly global state, such as the `AuthContext` (who is logged in, their token, their roles).
* **Local Component State (`useState`):** For UI-specific toggles (e.g., "Is the modal open?").
* **Server State:** Handled directly via Axios fetch requests within `useEffect` hooks, triggering re-renders upon receiving data arrays from the backend.

## Coding Standards: Absolute Import Aliasing

To avoid "relative path hell" (e.g., `import Sidebar from '../../../features/Sidebar'`), the frontend `vite.config.js` is configured with an absolute path alias where `@` maps strictly to the `src/` directory.

**Always use the `@` alias for internal imports:**

```javascript
// ❌ BAD (Fragile if the current file moves)
import AnnouncementFeed from '../../features/Announcements/AnnouncementFeed';

// ✅ GOOD (Absolute and clean)
import AnnouncementFeed from '@/assets/components/features/Announcements/AnnouncementFeed';
```
