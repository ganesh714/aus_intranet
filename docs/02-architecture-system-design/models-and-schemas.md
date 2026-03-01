# Models and Schemas

This document outlines the core Mongoose schemas that make up the Aditya University Intranet database architecture. Understanding these relationships is key to working efficiently on the backend.

## Core Entities

### 1. `User` (`models/User.js`)
The central entity for authentication and Role-Based Access Control (RBAC).
* **Fields:** `email`, `password` (hashed), `role` (Student, Faculty, HOD, Dean, Admin), `profile` (embedded details).
* **Relations:** One-to-one with `SubRole` (optional).
* **Pattern:** Uses Mongoose pre-save hooks to hash passwords before saving.

### 2. `SubRole` (`models/SubRole.js`)
Defines more granular permissions beyond the primary role (e.g., a Faculty member who is also a "Placement Coordinator").
* **Fields:** `name`, `permissions` (array of action strings).
* **Relations:** Linked to a `User` via `ObjectId`.

## Content Management Entities

### 3. `Pdf` & `Material` (`models/Pdf.js`, `models/Material.js`)
Handles the metadata for uploaded documents in the Document Management System.
* **Fields:** `title`, `description`, `category`, `uploadedBy` (ObjectId), `fileUrl` (Drive link or Local path).
* **Pattern:** Often interacts with the `StorageAdapter` to handle the actual binary file upload, while storing only the reference string in MongoDB.

### 4. `DriveItem` (`models/DriveItem.js`)
A more abstracted representation for managing hierarchical folders and files within the application's internal "Drive" view.

## Announcements & Events Entities

### 5. `Announcement` (`models/Announcement.js`)
System-wide or targeted broadcasts.
* **Fields:** `title`, `content`, `targetRoles` (e.g., `["Student", "Faculty"]`), `targetDepartments`, `author` (ObjectId).

### 6. `Workshop` & `Timetable` (`models/Workshop.js`, `models/Timetable.js`)
Specifically structured entities for managing scheduling.
* **Workshop Fields:** `title`, `date`, `speaker`, `venue`, `registrationLink`.
* **Timetable Fields:** `department`, `year`, `semester`, `scheduleData`.

## Tracking Entities

### 7. `Achievement` (`models/Achievement.js`)
Tracks accolades for students or faculty to display on the dashboard or public feeds.
* **Fields:** `title`, `description`, `dateAwarded`, `recipient` (ObjectId).
