# Routing Map

The Aditya University Intranet Portal leverages `react-router-dom` to manage Client-Side Routing.

## Core Setup (`App.jsx`)

The routing is fundamentally controlled by the `App.jsx` component, which acts as the supreme gatekeeper. It utilizes conditional rendering based on the user's logged-in status and role to protect private routes.

### Public Routes
* `/` -> `Homepage`: The landing and marketing page accessible without auth.
* `/LoginForm` -> `LoginForm`: The login portal.
* `/reset-password` -> `ResetPassword`: Self-service password recovery flow.
* `/developers` -> `Developers`: Information page about the engineering team.

### Protected Role-Based Routes
These routes only mount if `isLoggedIn == true` and the `userRole` exactly matches the requirement.

* `/hod-page` -> `HodPage` (for HODs)
* `/dean-page` -> `DeanPage` (for Deans)
* `/asso.dean-page` -> `Adeanpage` (for Associate Deans)
* `/officers-page` -> `OfficersPage` (for Officers)
* `/admin-page` -> `Adminpage` (for Admins)
* `/manage-subroles` -> `SubRoleManager` (Admin-only sub-route)
* `/faculty-page` -> `FacultyDashboard` (for Faculty)
* `/student-page` -> `StudentDashboard` (for Students)

### The Catch-All (`*`)
Any invalid or unauthorized route falls into a "Catch-All" wildcard route (`*`).
This route uses a `<Navigate>` component driven by a `getNavigatePath(role, subRole)` helper function. It determines where to push the user to prevent them from getting stuck on a blank page if they type a bad URL or trigger a restricted route. If they are not logged in, it pushes them to `/`.
