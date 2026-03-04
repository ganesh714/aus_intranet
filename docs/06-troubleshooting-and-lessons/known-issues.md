# Known Issues & Technical Debt

> This document tracks **confirmed bugs**, **known limitations**, and **technical debt**. If you hit one of these issues, this is the first place to check. If you fix one, mark it as ✅ Resolved.

---

## 🔴 Critical Issues

---

### KI-001 — Passwords Stored in Plain Text

**Status:** 🔴 Open  
**Severity:** Critical (Security)  
**File:** `backend/models/User.js`, `backend/services/AuthService.js`

**Problem:**  
The `password` field in the `User` schema is a plain text `String`. `AuthService.login()` compares passwords with `if (user.password !== password)` — a direct string comparison. Anyone with read access to the MongoDB database can see every user's password.

**Fix needed:**

```javascript
// In AuthService.register():
const bcrypt = require("bcrypt");
const hashedPassword = await bcrypt.hash(password, 12);
// Store hashedPassword instead of plain password

// In AuthService.login():
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) throw new Error("Invalid credentials!");
```

---

### KI-002 — Open CORS Policy

**Status:** 🔴 Open  
**Severity:** High (Security)  
**File:** `backend/server.js`

**Problem:**  
`app.use(cors())` is called with **no configuration**, which means any website on the internet can make requests to the API.

**Fix needed:**

```javascript
app.use(
  cors({
    origin: ["http://localhost", "http://intranet.adityauniversity.in"],
    credentials: true,
  }),
);
```

---

## 🟠 Bugs

---

### KI-003 — Duplicate `$or` Key Bug in Audience Filtering

**Status:** 🟠 Open  
**Severity:** Medium (Incorrect data displayed)  
**Files:** `backend/services/MaterialService.js` (~line 80), `backend/routes/dashboardRoutes.js`

**Problem:**  
JavaScript objects cannot have duplicate keys. When the audience query builds a filter like:

```javascript
// ❌ WRONG — second $or silently overwrites the first
const query = {
  $or: [...subRoleConditions],
  $or: [...batchConditions], // This overwrites the one above!
};
```

MongoDB receives only the **last** `$or` array. Materials visible to students of a specific batch from a specific department may be incorrectly excluded or included.

**Fix needed:**  
Merge all conditions into a single `$or` array:

```javascript
// ✅ CORRECT
const query = {
  $or: [...subRoleConditions, ...batchConditions],
};
```

---

### KI-004 — `MONGO_URI` vs `MONGODB_URI` Naming Inconsistency

**Status:** 🟠 Open  
**Severity:** Medium (Blocks new dev setup)  
**File:** `backend/server.js`, `docs/01-setup-and-onboarding/env-variables.md` (now fixed in docs)

**Problem:**  
`server.js` reads `process.env.MONGODB_URI`. Some older internal docs and notes referred to `MONGO_URI`. A new developer following old notes or copy-pasting an old `.env` will get a silent connection failure where Mongoose tries to connect to `undefined`.

**Symptom:** `MongooseError: The `uri`parameter to`openUri()` must be a string, got "undefined".`

**Fix:** Always use `MONGODB_URI` (with `DB` in the middle). The `env-variables.md` doc has been updated to reflect the correct name.

---

### KI-005 — SubRole Resolution Duplicated Across 6+ Files

**Status:** 🟠 Open  
**Severity:** Low (Maintainability)  
**Files:** `announcementController.js`, `materialController.js`, `timetableController.js`, `dashboardRoutes.js`, `AuthService.js`, `UserService.js`

**Problem:**  
The logic `SubRole.findOne({ $or: [{ name }, { code }, { displayName }] })` to resolve a department string to an ObjectId is copy-pasted in 6+ places. If the SubRole schema changes, this must be updated everywhere.

**Fix needed:**  
Create a shared utility:

```javascript
// backend/utils/resolveSubRole.js
const SubRole = require("../models/SubRole");

async function resolveSubRole(identifier) {
  if (!identifier) return null;
  return await SubRole.findOne({
    $or: [
      { name: identifier },
      { code: identifier },
      { displayName: identifier },
    ],
  });
}
module.exports = resolveSubRole;
```

---

## 🟡 Limitations (By Design)

---

### KI-006 — Dashboard Stats Logic Not in Controller/Service

**Status:** 🟡 By Design (Technical Debt)  
**File:** `backend/routes/dashboardRoutes.js`

**Problem:**  
All stats calculation logic lives inline in the route handler, performing 5–8 DB queries directly. This violates the Controller → Service pattern used everywhere else.

**Impact:** Harder to unit test, harder to modify. No architectural problem in production.

**Planned fix:** Extract to `controllers/dashboardController.js` + `services/DashboardService.js`.

---

### KI-007 — No Pagination on GET Endpoints

**Status:** 🟡 Known Limitation  
**Files:** `achievementController.js`, `materialController.js`, `announcementController.js`

**Problem:**  
Fetch-all endpoints return every matching document with no page/limit enforcement at the DB layer (only a `limit` param on achievements). As data grows, these queries will become slow.

**Workaround:** Use the `limit` param where available. Watch DB query times in production logs.

---

### KI-008 — `pinnedTimetables` Max Not Enforced at DB Level

**Status:** 🟡 Known Limitation  
**File:** `backend/services/UserService.js`

**Problem:**  
The 3-timetable pin limit is enforced in JavaScript code only. A bulk DB operation bypassing the service could insert more than 3. No Mongoose validator prevents it.
