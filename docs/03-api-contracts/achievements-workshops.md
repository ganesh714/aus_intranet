# Achievements and Events API Contracts

This document details the API contracts for the achievement feeds and workshop event schedules managed by `achievementController.js` and `workshopController.js`.

## Achievements

### `POST /api/achievements`
Log a new accolade or achievement for a student or faculty member.
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Required Roles:** HOD, Dean, Admin
**Body:**
```json
{
  "title": "First Place in Codevita",
  "description": "Secured global rank 150 mapping to...",
  "recipientType": "Student",
  "recipientId": "64bcde...",
  "dateAwarded": "2026-02-15T00:00:00.000Z"
}
```
**Success Response (201 Created):**
```json
{
  "message": "Achievement added successfully",
  "achievement": {
    "id": "65cdef...",
    "title": "First Place in Codevita"
  }
}
```

### `GET /api/achievements`
Fetch a paginated list of achievements for the global feed.
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:** `?limit=10&page=1`
**Success Response (200 OK):**
```json
{
  "total": 45,
  "page": 1,
  "achievements": [
    {
      "id": "65cdef...",
      "title": "First Place in Codevita",
      "recipient": { "name": "Veeranna" }
    }
  ]
}
```

## Workshops and Events

### `POST /add-workshop`
Add a new workshop record for a faculty member.
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "userId": "FAC001",
  "academicYear": "2024-2025",
  "activityName": "AI Workflow Workshop",
  "startDate": "2026-03-01",
  "endDate": "2026-03-02",
  "resourcePerson": "Dr. Smith",
  "professionalBody": "IEEE",
  "studentCount": 150,
  "contactHours": 5
}
```
**Success Response (201 Created):**
```json
{
  "message": "Workshop added successfully",
  "workshop": { "_id": "66abcd...", "activityName": "AI Workflow Workshop", "..." : "..." }
}
```

### `GET /get-workshops`
Fetch workshops with optional filters.
**Query Parameters:** `?userId=FAC001&dept=CSE&academicYear=2024-2025`
**Success Response (200 OK):**
```json
{
  "workshops": [
    {
      "_id": "66abcd...",
      "academicYear": "2024-2025",
      "activityName": "AI Workflow Workshop",
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": "2026-03-02T00:00:00.000Z",
      "resourcePerson": "Dr. Smith",
      "professionalBody": "IEEE",
      "studentCount": 150,
      "contactHours": 5
    }
  ]
}
```

### `PUT /update-workshop/:id`
Update an existing workshop by its MongoDB `_id`.
**Body:** Any subset of workshop fields.
**Success Response (200 OK):**
```json
{
  "message": "Workshop updated",
  "workshop": { "..." : "..." }
}
```

### `DELETE /delete-workshop/:id`
Delete a workshop by its MongoDB `_id`.
**Success Response (200 OK):**
```json
{
  "message": "Workshop deleted"
}
```

