# Auth & User API Contracts

This document outlines the API contracts for user authentication and management handled by `authController.js` and `userController.js`. It explicitly describes the expected shapes of the request body and server response.

## Authentication Routes

### `POST /api/auth/register`
Register a new user in the system.
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "user@aditya.edu.in",
  "password": "strongPassword123",
  "role": "Student" // Valid roles: Student, Faculty, HOD, Dean, Admin
}
```
**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64bcde...",
    "email": "user@aditya.edu.in",
    "role": "Student"
  }
}
```
**Error Response (400 Bad Request):**
```json
{
  "message": "Email already exists"
}
```

### `POST /api/auth/login`
Authenticate a user and generate a JSON Web Token.
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "user@aditya.edu.in",
  "password": "strongPassword123"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64bcde...",
    "email": "user@aditya.edu.in",
    "role": "Student"
  }
}
```
**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid password"
}
```

## User Management Routes

### `GET /api/users/me`
Retrieve the currently logged-in user's profile details.
**Headers:** `Authorization: Bearer <token>`
**Success Response (200 OK):**
```json
{
  "id": "64bcde...",
  "email": "user@aditya.edu.in",
  "role": "Student",
  "profile": {
    "firstName": "Siva",
    "lastName": "Ganesh",
    "department": "CSE"
  }
}
```
**Error Response (404 Not Found):**
```json
{
  "message": "User not found"
}
```
