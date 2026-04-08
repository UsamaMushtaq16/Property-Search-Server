# Property Search API

## 1. Overview

A production-quality REST API that lets users query a UK property dataset using **natural language**. A user submits a plain-English query such as _"brownfield sites over 5 acres in the Midlands under £2m"_ and the API:

1. Sends the query to **Anthropic Claude** (`claude-sonnet-4-20250514`) which returns a structured JSON filter object.
2. Builds a **parameterised SQL query** against a PostgreSQL `properties` table.
3. Returns the matching properties.

**Tech choices:** Node.js 20 + TypeScript (strict), Express 5, PostgreSQL via `pg` (raw SQL), Zod for request validation, `swagger-jsdoc` + `swagger-ui-express` for API docs.

---

## 2. Architecture Decisions

| Decision | Rationale |
|---|---|
| **Raw SQL over ORM** | Full control over query shape; parameterised `$N` placeholders prevent SQL injection without ORM overhead or learning curve |
| **Anthropic Claude for NLP** | State-of-the-art language understanding; few-shot prompting in the system prompt reliably produces structured JSON |
| **Mock LLM fallback** | When `ANTHROPIC_API_KEY` is absent the service uses regex/keyword matching so the app fully functions for demo/testing without a paid key |
| **Zod validation** | Schema-first validation at the HTTP boundary; errors are serialised as structured JSON with field-level detail |
| **Express error handler** | Centralised error surface; stack traces suppressed in production via `NODE_ENV` check |

---

## 3. Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Steps

```bash
# Clone
git clone <repo-url>
cd property-search-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DB credentials and (optionally) ANTHROPIC_API_KEY
```

### Environment Variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` or `production` |
| `PORT` | `3000` | HTTP port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `property_search` | Database name |
| `DB_USER` | `postgres` | DB user |
| `DB_PASSWORD` | `password` | DB password |
| `ANTHROPIC_API_KEY` | _(optional)_ | If omitted, mock parser is used |

### Create the database

```sql
CREATE DATABASE property_search;
```

---

## 4. Running Migrations

```bash
npm run migrate
```

This runs all SQL files in `/migrations` in order, skipping already-applied ones. Creates the `properties` table and seeds 15 sample properties.

---

## 5. Running Locally

```bash
npm run dev
```

Server starts at `http://localhost:3000` with hot-reload via nodemon + ts-node.

Visit `http://localhost:3000/` — you should see a JSON response confirming the server is alive:

```json
{
  "success": true,
  "message": "Property Search API is running on port 3000",
  "version": "1.0.0",
  "environment": "development",
  "endpoints": {
    "docs":   "/api-docs",
    "health": "/api/v1/health",
    "search": "POST /api/v1/properties/search",
    "list":   "GET  /api/v1/properties",
    "byId":   "GET  /api/v1/properties/:id"
  }
}
```

---

## 6. Building for Production

```bash
npm run build   # compiles TypeScript → /dist
npm start       # runs node dist/app.js
```

No `ts-node` in production — the compiled JavaScript in `/dist` is used directly.

---

## 7. API Reference

> Replace `{BASE_URL}` with `http://localhost:3000` when running locally, or your Vercel deployment URL (e.g. `https://property-search-api-xyz.vercel.app`) when deployed.

### GET / — Server status

```bash
curl {BASE_URL}/
```

### POST /api/v1/properties/search — Natural language search

```bash
curl -X POST {BASE_URL}/api/v1/properties/search \
  -H "Content-Type: application/json" \
  -d '{"query": "brownfield sites over 5 acres in the Midlands under £2m"}'
```

### GET /api/v1/properties — List all (with optional filters)

```bash
curl "{BASE_URL}/api/v1/properties?site_type=brownfield&region=Midlands&min_acres=5"
```

### GET /api/v1/properties/:id — Get by ID

```bash
curl {BASE_URL}/api/v1/properties/1
```

### GET /api/v1/health — Health check

```bash
curl {BASE_URL}/api/v1/health
```

---

## 8. Swagger

Interactive API docs at: **`{BASE_URL}/api-docs`**

- Locally: **http://localhost:3000/api-docs**
- On Vercel: **https://property-search-api-xyz.vercel.app/api-docs**

---

## 9. Assumptions & Trade-offs

- **No pagination** — all results returned. With more time: cursor-based pagination.
- **No authentication** — API is open. Production: add JWT/API key middleware.
- **Simple NLP** — LLM extracts criteria but doesn't rank by relevance. With more time: vector embeddings + pgvector for semantic similarity search.
- **Connection pooling** — default max 10 connections. With more time: configurable via env, plus PgBouncer in front.
- **No rate limiting** — would add `express-rate-limit` in production.
- **Price stored as pence** — avoids floating-point issues; straightforward conversion.

---

## 10. Example Queries

| Natural Language Query | Parsed Criteria |
|---|---|
| `"brownfield sites over 5 acres in the Midlands under £2m"` | `site_type=brownfield, min_acres=5, region=Midlands, max_price=200000000` |
| `"greenfield land between 10 and 20 acres in Yorkshire"` | `site_type=greenfield, min_acres=10, max_acres=20, region=Yorkshire` |
| `"commercial sites in London over £5m"` | `site_type=commercial, region=London, min_price=500000000` |
| `"all residential land in the South East under £4m"` | `site_type=residential, region=South East, max_price=400000000` |
| `"any property under £500k"` | `max_price=50000000` |
