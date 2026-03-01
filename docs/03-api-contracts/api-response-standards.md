# Standardized API Response Contracts

To prevent discrepancies between JSON payloads (e.g., one controller sending `{ success: false }` while another sends `{ error: "msg" }`), this application utilizes a global response standard enforced via `verify_api_response.js`.

All frontend Axios interceptors and data-mapping functions are built assuming this standard payload shape.

## Standard Success Response (2xx)

Any controller functioning correctly MUST wrap its output data in the standard success format.

```json
{
  "success": true,
  "message": "A human-readable message indicating what went right (optional)",
  "data": {
    // The actual requested payload (an object, an array, a string, etc.)
    "id": "123",
    "status": "active"
  }
}
```

## Standard Error Response (4xx, 5xx)

If a route fails validation, hits a database exception, or catches a domain error, the controller MUST return the standard error structure. The frontend relies on parsing `error.response.data.message` to show toast notifications to the user.

```json
{
  "success": false,
  "message": "A human-readable string defining the exact failure.",
  "errorDetails": {
    // Optional parameter meant strictly for developer debugging.
    // e.g., Mongoose Validation errors, stack traces (only if NODE_ENV=development)
    "field": "email",
    "issue": "is required"
  }
}
```

## How it works in the Backend

Instead of calling `res.status(200).json(...)` directly with random formats, controllers should utilize standard utility functions (if provided) or strictly mimic the above JSON schema to respect the frontend's contract.
