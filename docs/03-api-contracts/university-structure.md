# University Structure — API Contracts

> **Covers:** School Programs, levels (UG/PG), and SubRoles (Departments). These define the "skeleton" of the university used for user registration and content targeting.

---

## 🏛️ School Programs

Programs are top-level academic offerings (e.g., B.Tech, MBA) belonging to a specific School.

### `POST /add-program`

Define a new academic program.

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "school": "School of Engineering",
  "level": "UG",
  "program": "B.Tech",
  "duration": 4,
  "departments": [
    { "name": "CSE", "subRoleRef": "64aabb..." },
    { "name": "ECE", "subRoleRef": "64ccdd..." }
  ]
}
```

---

### `GET /all-programs`

Fetch all defined programs across all schools.

**Success (200 OK):**

```json
{
  "programs": [
    {
      "_id": "67abcd...",
      "school": "School of Engineering",
      "program": "B.Tech",
      "level": "UG",
      "duration": 4,
      "departments": [...]
    }
  ]
}
```

---

### `PUT /update-program/:id` | `DELETE /delete-program/:id`

Standard CRUD operations for programs.

---

## 🔑 SubRoles (Departments)

SubRoles are the "Departments" or "Branches" in the system. They are used to group users and filter content.

### `GET /all-subroles`

Fetch every department defined in the system.

**Success (200 OK):**

```json
{
  "subRoles": [
    {
      "_id": "64aabb...",
      "displayName": "Computer Science and Engineering",
      "code": "CSE",
      "role": "Student"
    }
  ]
}
```

---

### `POST /add-subrole`

Create a new department or sub-role category.

**Request Body:**

```json
{
  "displayName": "Information Technology",
  "code": "IT",
  "role": "Student"
}
```

---

### `GET /subroles/:role`

Fetch sub-roles specific to a main role (e.g., all departments for `Faculty`).

**URL Example:** `GET /subroles/Faculty`

**Success (200 OK):**

```json
{
  "subRoles": [
    {
      "_id": "64aabb...",
      "displayName": "CSE",
      "code": "CSE",
      "name": "Computer Science and Engineering",
      "allowedRoles": ["Student", "Faculty", "HOD"]
    }
  ]
}
```

---

### `DELETE /delete-subrole/:id`

Delete a department. Admin only.

> [!CAUTION]
> Deleting a SubRole does not cascade-delete Users assigned to it. Those users will have a dangling `subRole` reference. Always re-assign or delete users before deleting a SubRole.

**Success (200 OK):** `{ "message": "SubRole deleted" }`
