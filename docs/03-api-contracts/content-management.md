# Content Management API Contracts

This document outlines the API contracts for announcements, secure materials, and generic drive files managed by `announcementController.js`, `materialController.js`, and `driveController.js`.

## Announcements

### `POST /api/announcements`
Create a new targeted announcement broadcast.
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Required Roles:** Faculty, HOD, Dean, Admin
**Body:**
```json
{
  "title": "Hackathon 2026 Registration",
  "content": "Please register by Friday...",
  "targetRoles": ["Student"],
  "targetDepartments": ["CSE", "IT"]
}
```
**Success Response (201 Created):**
```json
{
  "message": "Announcement created successfully",
  "announcement": {
    "id": "64bcde...",
    "title": "Hackathon 2026 Registration"
  }
}
```

### `GET /api/announcements`
Fetch announcements visible to the currently authenticated user's role and department.
**Headers:** `Authorization: Bearer <token>`
**Success Response (200 OK):**
```json
[
  {
    "id": "64bcde...",
    "title": "Hackathon 2026 Registration",
    "content": "Please register by Friday...",
    "author": { "name": "Dean Admin" },
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
]
```

## Secure Document Materials

### `POST /api/materials/upload`
Upload a secure material or PDF. Usually requires interacting with the Storage Adapter.
**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
**Required Roles:** Faculty, HOD, Dean, Admin
**Body Form-Data:**
* `file`: (Binary File Data, restricted to PDF/Docx)
* `title`: "Week 1 Algorithms"
* `description`: "Introductory lecture notes"
* `category`: "Teaching Materials"
* `department`: "CSE"

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Material uploaded successfully",
  "data": { 
     "id": "65abcf...",
     "title": "Week 1 Algorithms",
     "fileUrl": "https://drive.google.com/uc?id=XYZ..."
  }
}
```
**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid file format. Only PDF files are allowed."
}
```
