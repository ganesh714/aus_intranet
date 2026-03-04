# Component Hierarchy

The `aus_intranet/login/src/assets/components/features/` directory houses the modular, reusable pieces of UI that are shared across different Role Dashboards.

## Feature Breakdown

### 1. `Sidebar`
The collapsible navigation menu. It accepts props (like `role` or `permissions`) to conditionally render links (e.g., hiding the "User Management" link from non-admins).

### 2. `Announcements`
Components for reading, creating, editing, and deleting (CRUD) broadcast messages.
* `AnnouncementFeed`: The scrolling list of messages.
* `CreateAnnouncementForm`: The form utilized by Faculty+ to target specific roles/departments with a new message.


### 4. `Workshops`
Handles workshop event records and department-level reporting.
* `WorkshopManager`: Faculty-facing CRUD form for adding, editing, and deleting workshop records. Includes fields for academic year, activity name, dates, resource person, professional body, student count, and contact hours.
* `HODWorkshopManager`: HOD view with Overview (dynamically filterable table by academic year of all department workshops + Excel report generation) and Access Control (grant/revoke `canManageWorkshops` permission to faculty).

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
