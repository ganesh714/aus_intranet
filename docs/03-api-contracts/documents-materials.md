# Documents & Materials API Contracts

Drive routes, PDF routes, Material routes.

## Example Route Contract

### POST /api/materials/upload
**Headers:** `Authorization: Bearer <token>`
**Body:** FormData (file, category, description)
**Success Response (201):**
```json
{
  "success": true,
  "data": { "fileId": "123", "url": "..." }
}
```
**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid file format. Only PDFs allowed."
}
```
