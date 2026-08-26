# Development

## Requirements

- Python 3.12+
- Node.js 22+
- uv (recommended)
- Docker Compose only for the container workflow

## Direct local workflow

```bash
uv sync --all-groups
PYTHONPATH=backend uv run uvicorn estateai_server.main:app --reload --port 8002
```

In another terminal:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://127.0.0.1:8002/api npm run dev
```

Open `http://localhost:3002`. The API creates a local SQLite schema and idempotently seeds six original properties, eighteen comparables, and three scenarios per property.

## Container workflow

```bash
docker compose up --build
```

The container workflow uses PostgreSQL and exposes the API on 8002 and frontend on 3002.

## Data integrity

All seeded addresses, cities, neighborhoods, comparables, and metrics are synthetic. Do not replace them with scraped or private data without verifying provenance, permission, and product claims.
