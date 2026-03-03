# SOLID Principles in the Backend

The backend of the Aditya University Intranet Portal adheres to SOLID design principles to ensure maintainability, scalability, and loose coupling, especially as the system grows.

## 1. Single Responsibility Principle (SRP)
Each class or module in the system has only one reason to change. We enforce strict boundaries between layers:
* **Routes (`routes/`):** Solely responsible for defining HTTP methods and endpoint paths.
* **Controllers (`controllers/`):** Responsible only for parsing incoming requests (`req.body`, `req.files`), delegating work, and formatting the outgoing HTTP responses.
* **Services (`services/`):** Contain the actual core business logic (e.g., matching audiences, database transactions).

## 2. Open/Closed Principle (OCP)
System components are open for extension but closed for modification. 
* **Example:** The `StorageService` can easily support new storage types (like AWS S3) by adding an `S3Adapter` class that implements the `StorageAdapter` interface, without modifying the existing `StorageService` logic or any controller that depends on it.

## 3. Liskov Substitution Principle (LSP)
Objects of a superclass shall be replaceable with objects of its subclasses without breaking the application.
* **Example:** Both `StudentStrategy` and `FacultyStrategy` inherit from `DefaultStrategy`. The `AnnouncementContext` can execute `fetchAnnouncements()` on any of them, trusting they adhere to the expected input and return an array of announcements.

## 4. Interface Segregation Principle (ISP)
Clients should not be forced to depend upon interfaces that they do not use.
* **Example:** The `StorageAdapter` base class outlines only the essentially required methods (`saveFile`, `deleteFile`, `getFileStream`, `copyFile`). Both Google Drive and Local Storage adapters implement precisely these, avoiding bloated interfaces.

## 5. Dependency Inversion Principle (DIP)
High-level modules (Controllers, Services) should not depend on low-level modules (e.g., Google Drive API directly). Both should depend on abstractions.
* **Example:** The `materialController` does not import `google.drive`. Instead, it calls `storageService.saveFile()`. The `storageService` dynamically determines whether to use the `GoogleDriveAdapter` or `LocalStorageAdapter` based on environment variables. The controller remains entirely decoupled from the physical storage mechanism.
