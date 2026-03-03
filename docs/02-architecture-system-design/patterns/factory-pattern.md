# Factory Pattern

The **Factory Pattern** encapsulates the complex creation logic of objects, ensuring they are instantiated in a valid, consistent state without cluttering the main business logic.

## Usage: `UserFactory`

In the Aditya University Intranet, creating a user involves multiple business rules dependent on their assigned role:
* A `Student` requires a `batch`, but no other role does.
* An `Admin` does not belong to a specific department, so `subRole` must be `null`.
* A `Faculty` member defaults to `canUploadTimetable: false` unless manually overridden.
* The `id` string must always be normalized (uppercase).

If we handled this procedural logic directly inside `AuthService.register()`, the service would become bloated and hard to test.

Instead, we use `UserFactory.create()` (located in `factories/UserFactory.js`). The `AuthService` delegates the raw request payload to the Factory, which processes the rules and returns a properly formulated `User` Mongoose document.

### Benefits
* **Centralized logic:** If the definition of a valid "Student" changes, only the factory is updated.
* **Cleaner services:** `AuthService` focuses solely on validation and database persistence, not data mapping.
