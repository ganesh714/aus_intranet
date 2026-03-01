# Component Hierarchy

The `aus_intranet/login/src/assets/components/features/` directory houses the modular, reusable pieces of UI that are shared across different Role Dashboards.

## Feature Breakdown

### 1. `Sidebar`
The collapsible navigation menu. It accepts props (like `role` or `permissions`) to conditionally render links (e.g., hiding the "User Management" link from non-admins).

### 2. `Announcements`
Components for reading, creating, editing, and deleting (CRUD) broadcast messages.
* `AnnouncementFeed`: The scrolling list of messages.
* `CreateAnnouncementForm`: The form utilized by Faculty+ to target specific roles/departments with a new message.

### 3. `Documents`
The core of the Document Management System on the frontend.
* `FolderView`: Renders the hierarchical tree of Categories and Subcategories.
* `DocumentList`: A paginated table or grid of files within a specific folder.
* `UploadModal`: Handles the `FormData` creation and progress bar for uploading an `application/pdf` to the backend storage constraints.
* `PdfViewer`: Integrates `pdfjs-dist` to display the document cleanly inside a modal without forcing a download.

### 4. `Workshops`
Handles events, scheduling, and Timetables.
* `WorkshopList`: A calendar or list view of upcoming tech events.
* `HODWorkshopManager`: Specifically for HODs to approve or schedule new departmental events.

## State Management Approach

While tools like Redux exist, for this application's initial scale, state is primarily managed via:
* **Context API:** For truly global state, such as the `AuthContext` (who is logged in, their token, their roles).
* **Local Component State (`useState`):** For UI-specific toggles (e.g., "Is the modal open?").
* **Server State:** Handled directly via Axios fetch requests within `useEffect` hooks, triggering re-renders upon receiving data arrays from the backend.
