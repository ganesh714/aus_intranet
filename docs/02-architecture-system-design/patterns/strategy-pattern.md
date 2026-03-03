# Strategy Pattern

The **Strategy Pattern** is utilized to dynamically alter the behavior of an algorithm at runtime depending on the context. In this system, it governs the complex logic for fetching customized feeds, specifically **Announcements**.

## The Problem
When a user hits `GET /announcements`, the server must return a feed tailored to them. 
* An `Admin` should see announcements targeted to `"All"`, their specific role, or themselves.
* A `Faculty` member also needs to see announcements targeted specifically to their department (`SubRole`), as well as global faculty announcements.
* A `Student` faces the most complex logic: they need announcements for `"All"`, their department, their department + their specific batch year, and `"All"` + their specific batch year.

Writing this as a massive `if/else` block inside the `announcementController` or `AnnouncementService` would create a tangled, unmaintainable mess of MongoDB `$or` queries.

## The Solution
We define a family of algorithms (Strategies) that share a common interface. 

1. **`DefaultStrategy`**: The baseline query logic (used for Admin, Dean, HOD). Matches `All` and exact user roles.
2. **`FacultyStrategy`**: Inherits from `DefaultStrategy`, appending logic to match the user's `SubRole`.
3. **`StudentStrategy`**: Inherits from `DefaultStrategy`, appending the complex multidimensional matching logic for `SubRole` AND `batch`.

### `AnnouncementContext`
The `AnnouncementContext` class acts as the orchestrator. When the controller asks for announcements, it passes the user's role and subRole to the Context. The Context dynamically chooses the correct Strategy object (via a factory method paradigm) and executes `fetchAnnouncements(userId)`. 

### Benefits
* **Isolation of logic:** If student announcement rules change, only `StudentStrategy` is modified.
* **Extensibility:** Adding a new role with distinct viewing permissions requires only the creation of an `OfficersStrategy`, rather than editing existing core functions.
