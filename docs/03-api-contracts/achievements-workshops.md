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

### `POST /api/workshops`
Schedule a new workshop or departmental event.
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
**Required Roles:** Faculty, HOD, Dean, Admin
**Body:**
```json
{
  "title": "React Advanced Masterclass",
  "date": "2026-04-10T10:00:00.000Z",
  "speaker": "Siva Ganesh",
  "venue": "Lab 3",
  "registrationLink": "https://forms.gle/..."
}
```
**Success Response (201 Created):**
```json
{
  "message": "Workshop scheduled successfully",
  "workshop": {
    "id": "66abcd...",
    "title": "React Advanced Masterclass"
  }
}
```
