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

Browser tests require a completed production frontend build. Playwright starts an isolated SQLite API on port 8002 and the production frontend on port 3002, then stops both:

```bash
cd frontend
npm run test:e2e
```

The 15-test browser suite covers discovery, filtering, MapLibre markers, detail evidence, recalculation, custom scenarios, saved state, comparison, three responsive widths, and Axe checks across five primary routes. The 15 backend tests cover formulas, persistence-backed API workflows, constrained briefs, CORS, and invalid input boundaries.
