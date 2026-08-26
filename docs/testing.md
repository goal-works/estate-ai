# Testing

Backend calculation and API checks:

```bash
uv run ruff check backend
PYTHONPATH=backend uv run pytest
```

Frontend static checks and production build:

```bash
cd frontend
npm run validate
```

With the API running on port 8002 and the production frontend built:

```bash
cd frontend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8002/api npm run test:e2e
```

The 15-test browser suite covers discovery, filtering, MapLibre markers, detail evidence, recalculation, custom scenarios, saved state, comparison, three responsive widths, and Axe checks across five primary routes. The 15 backend tests cover formulas, persistence-backed API workflows, constrained briefs, CORS, and invalid input boundaries.
