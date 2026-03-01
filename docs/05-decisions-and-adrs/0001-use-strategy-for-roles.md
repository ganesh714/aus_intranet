# 0001: Use Strategy Pattern for Roles

* **Date:** 2026-03-01
* **Status:** Accepted

## Context
Our system has 5 primary roles (Student, Faculty, HOD, Dean, Admin). The rules for what each role can see or do regarding Announcements and Document creation are wildly different. 

If we handle this with `if/else` or `switch` statements inside the controllers, files like `announcementController.js` will grow to thousands of lines and become impossible to test.

## Decision
We implemented the **Strategy Design Pattern** under `aus_intranet/backend/strategies/`.

Instead of checking `if (user.role === 'Student') { ... }`, the controller utilizes a `StrategyContext` which instantiates the correct class (e.g., `FacultyStrategy` or `DeanStrategy`). Each strategy class must conform to a defined interface indicating what functions it must implement (e.g., `getVisibleAnnouncements()`, `canUploadToCategory()`).

## Consequences
* **Pros:** 
  * Massive reduction in Cyclomatic Complexity inside the controllers.
  * Adding a new role (e.g., 'Alumni') in the future simply means creating an `AlumniStrategy.js` class; we do not have to modify the core `User.js` model or `authController.js` logic extensively.
  * Easily testable in isolation.
* **Cons:** 
  * slight overhead in the initial mental model for junior developers onboarding to the project.
