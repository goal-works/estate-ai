# EstateAI

Synthetic property intelligence with deterministic investment analysis and structured explanation.

EstateAI is not a listing clone. It demonstrates how a property-analysis product can keep business-critical numeric outputs explicit and testable while limiting its explanatory layer to known structured values.

## Overview

The V1 includes six original synthetic properties, an offline MapLibre discovery experience, property details, deterministic investment calculations, conservative/base/optimistic and custom scenarios, synthetic comparables, saved selections, side-by-side comparison, and a no-key structured demo brief.

Every address, neighborhood, comparable, coordinate, and metric is original demonstration data. Nothing is presented as a real listing, valuation, forecast, or investment opportunity.

## Key capabilities

- filter synthetic properties by city, type, price, bedrooms, cap rate, and saved state;
- browse property markers through a maintainable offline MapLibre map;
- inspect property, neighborhood, comparable, and assumption records;
- calculate mortgage, operating expenses, NOI, cap rate, cash flow, cash-on-cash return, DSCR, and break-even occupancy;
- edit calculator assumptions and receive deterministic results;
- create and compare conservative, base, optimistic, and custom scenarios;
- save local demo selections;
- compare two to four properties through the API and three in the product interface;
- generate a structured-data-only investment brief in deterministic demo mode.

## Architecture

```text
Next.js + MapLibre → FastAPI → PostgreSQL
                         ├── deterministic finance service
                         └── structured demo brief service
```

See [docs/architecture.md](docs/architecture.md) for the calculation/explanation boundary and V1 constraints.

## Quick start

```bash
uv sync --all-groups
PYTHONPATH=backend uv run uvicorn estateai_server.main:app --port 8002
```

In another terminal:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://127.0.0.1:8002/api npm run dev
```

Open `http://localhost:3002`, or use `docker compose up --build` for the PostgreSQL workflow.

## Testing

```bash
uv run ruff check backend
PYTHONPATH=backend uv run pytest
cd frontend && npm run validate
```

After the production frontend build, run `npm run test:e2e` from `frontend`. Playwright manages an isolated SQLite API and the frontend server for the browser and Axe suite. See [docs/testing.md](docs/testing.md).

## Project structure

```text
backend/estateai_server/  FastAPI, persistence, finance, scenarios, briefs
backend/tests/            finance and API contract tests
frontend/                 Next.js and offline MapLibre product
docs/                     architecture, development, and testing notes
```

## Technical decisions and tradeoffs

- Decimal-based deterministic functions own every authoritative numeric output.
- The V1 brief is a transparent deterministic mock, so no model key or invented market context is required.
- PostgreSQL is the production-shaped store; SQLite provides a zero-service local workflow.
- Offline original map geometry avoids tile-provider privacy, uptime, licensing, and screenshot dependencies.
- Spatial indexing, external data providers, multi-user authorization, schema migrations, and live model calls remain roadmap items.

## Contributing and license

No contribution policy or license is claimed yet. Add them only after the repository owner chooses the terms.
