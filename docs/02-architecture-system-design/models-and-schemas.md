# Models and Schemas

This document outlines the core Mongoose schemas that make up the Aditya University Intranet database architecture. Understanding these relationships is key to working efficiently on the backend.

## Core Entities

### 1. `User` (`models/User.js`)
The central entity for authentication and Role-Based Access Control (RBAC).
* **Fields:** 
  * `username` & `id` (unique string, not MongoDB ObjectId)
  * `password` (stored in plain text)
  * `role` (Strictly enum: `Student`, `Officers`, `Dean`, `Asso.Dean`, `HOD`, `Faculty`, `Admin`)
  * `batch` (Required only if role is 'Student'. Represents the student's pass-out year.)
  * `canUploadTimetable` (Boolean)
  * `permissions` (Granular booleans: `approveStudentAchievements`, `approveFacultyAchievements`, `canManageWorkshops`)
* **Relations:** One-to-one with `SubRole` (optional), and an array of `pinnedTimetables` referencing the `Timetable` model.
* **Pattern:** Validates explicitly against defined Enum roles.

### 2. `SubRole` (`models/SubRole.js`)
Serves as an organizational unit or department linkage (e.g., "Computer Science and Engineering" or "Registrar") applied to users.
* **Fields:** 
  * `name` (String, e.g. "Computer Science and Engineering")
  * `code` (Unique uppercase string, e.g. "CSE", "REG")
  * `displayName` (String, e.g. "CSE", to display in UI)
  * `allowedRoles` (Array of enums: `Student`, `Faculty`, `HOD`, `Asso.Dean`, `Dean`, `Officers`)
* **Relations:** The `User` model references `SubRole` via `ObjectId`.

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
