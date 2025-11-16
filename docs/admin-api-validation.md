# Admin API Validation (Zod)

This repo uses Zod v4 to validate incoming API request bodies for admin endpoints under `app/api/admin`.

Endpoints validated:
- `POST /api/admin/categories` and `PUT /api/admin/categories/:id` — validated with `categorySchema`.
- `POST /api/admin/subcategories` and `PUT /api/admin/subcategories/:id` — validated with `subcategorySchema`.
- `POST /api/admin/currencies` and `PUT /api/admin/currencies/:id` — validated with `currencySchema`.
- `POST /api/admin/products` and `PUT /api/admin/products/:id` — validated with `productSchema`.
- `POST /api/admin/media` — alt field validated with `mediaAltSchema`.

If a request body fails validation the route returns HTTP 400 with `error: 'Invalid input'` and `issues` array describing the validation failures.

Example error response:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid input",
  "issues": [ /* zod issues array */ ]
}
```

Testing locally
1. Create a category (valid payload):

```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test","description":"stuff"}'
```

2. Create a product with invalid body will return a 400:

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{}'
```

Notes
- We currently validate the entire payload as expected by the server (not partial updates). If you want to support partial updates, the `*UpdateSchema` can be adjusted to make fields optional.
- Some endpoints allow paths or IDs for subcategories; the server resolves `subcategoryId` if a slug is passed. If it can't find a subcategory returns 400.
