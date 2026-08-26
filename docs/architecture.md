# Architecture

EstateAI separates authoritative numeric calculations from optional narrative explanation.

```text
Next.js discovery, property, scenario, saved, and comparison UI
                           │
                           ▼
                  FastAPI domain API
                     │           │
                     │           └── structured-data-only demo brief
                     ▼
         deterministic finance and scenario service
                     │
                     ▼
        PostgreSQL / SQLite direct local mode
```

## Deterministic calculation boundary

Mortgage payment, operating expenses, effective rental income, NOI, cap rate, monthly cash flow, cash-on-cash return, DSCR, break-even occupancy, and five-year scenario value are pure Decimal-based Python functions. Each output is derived from displayed inputs and rounded explicitly. The explanatory layer receives those outputs; it cannot replace or modify them.

## Structured brief boundary

V1 uses deterministic demo mode so no model key is required. The service receives only the selected synthetic property, selected scenario, known assumptions, and calculated outputs. Its strengths and risks are threshold-based observations, and every response includes a non-advice statement.

## Data model

- `Property` stores the original synthetic record and default assumptions.
- `Comparable` stores original synthetic comparison records.
- `Scenario` stores conservative, base, optimistic, or custom adjustments.
- Saved selection state is a local demo-workspace property flag; no user identity is claimed.

Coordinates remain simple numeric columns in V1 because the product runs a small offline synthetic map with no spatial query requirement. PostgreSQL is production-shaped persistence; PostGIS is deferred until measured features require geographic indexing.

## Deliberate constraints

- No scraped listings or external market claims.
- No authoritative valuation, forecast, or financial-advice language.
- MapLibre renders an offline original demo geography rather than depending on a third-party tile service.
- Authentication, multi-user saved sets, real market integrations, and model-provider calls are outside V1.
