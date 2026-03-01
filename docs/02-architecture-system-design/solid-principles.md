# SOLID Principles

This is where you protect the integrity of your code. If you've spent time separating your routes from your controllers, and your controllers from your services, document that boundary here.

* **Single Responsibility:** Explain that `routes/` only handle HTTP traffic, `controllers/` parse requests, and `services/` contain the actual business logic.
* **Dependency Inversion:** Explain how the controllers interact with `StorageAdapter` interfaces rather than hardcoding Google Drive or Local Storage directly.
