# Role Dashboards Frontend Architecture

The frontend application uses React Router DOM to split the application into role-specific views. This ensures that users only download and execute JavaScript pertinent to their specific permissions, while also simplifying the UI logic per role.

## Top-Level Dashboards

Under the `aus_intranet/login/src/assets/components/` directory, there are distinct folder structures for each major Role:

* **StudentDashboard:** A read-only view focused on consuming Announcements and Timetables.
* **FacultyDashboard:** Focused on creating Announcements for students and uploading teaching materials.
* **HodPage:** Expanded tools to manage Departmental equipment, faculty, and broad announcements.
* **DeanPage / Asso.Deanpage:** University-wide announcements and high-level structural oversight.
* **Admin:** System configuration, user creation, category management, and full oversight.

## Common Architecture within a Dashboard

Each of the role pages above generally acts as a layout wrapper for the underlying `features/`.

```javascript
// Example structure of a Dashboard Wrapper
import Sidebar from '../features/Sidebar/Sidebar';
import ContentArea from '../render-content/ContentArea';

function HodDashboardWrapper() {
  return (
    <div className="flex h-screen">
      <Sidebar role="HOD" />
      <div className="flex-grow scrollable-content">
        <ContentArea />
      </div>
    </div>
  );
}
```

## The Content Renderer

The `render-content/` directory contains dynamic components that inspect the current UI state (e.g., "User clicked 'Announcements'") and conditionally render the appropriate feature component inside the main viewport of the dashboard.
