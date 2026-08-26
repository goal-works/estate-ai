import type { Metadata } from "next";

import { compareProperties, getProperties, money, percent } from "@/lib/api";

export const metadata: Metadata = { title: "Property comparison" };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ComparePage({ searchParams }: Readonly<{ searchParams: SearchParams }>) {
  const [params, summaries] = await Promise.all([searchParams, getProperties()]);
  const requested = Array.isArray(params.ids) ? params.ids : typeof params.ids === "string" ? [params.ids] : [];
  const selected = [...new Set(requested)];
  for (const property of summaries) {
    if (selected.length >= 3) break;
    if (!selected.includes(property.id)) selected.push(property.id);
  }
  const comparison = selected.length >= 2 ? await compareProperties(selected.slice(0, 3)) : null;

  return (
    <main className="main">
      <div className="page-head"><div><p className="eyebrow">Side-by-side analysis</p><h1>Compare the same questions.</h1><p className="lede">Review price, modeled income, returns, debt coverage, and assumptions across two or three synthetic properties.</p></div></div>
      <div className="notice"><span><strong>Synthetic comparison</strong> — Values are original demo assumptions, not market data.</span><span>Not financial advice</span></div>
      <form className="filters" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
        {[0, 1, 2].map((index) => <div className="field" key={index}><label htmlFor={`compare-${index}`}>Property {index + 1}</label><select defaultValue={selected[index]} id={`compare-${index}`} name="ids">{summaries.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></div>)}
        <button className="button primary" type="submit">Compare</button>
      </form>
      {comparison ? (
        <section className="compare-grid">
          {comparison.properties.map((property, index) => (
            <article className="compare-column" key={property.id}>
              <p className="eyebrow">Property {index + 1}</p><h2>{property.name}</h2><p className="muted">{property.city} · {property.property_type}</p>
              <div className="compare-list">
                <CompareRow label="Price" value={money(property.price)} />
                <CompareRow label="Monthly rent" value={money(property.monthly_rent)} />
                <CompareRow label="Monthly cash flow" value={money(property.financials.monthly_cash_flow)} />
                <CompareRow label="NOI" value={money(property.financials.net_operating_income)} />
                <CompareRow label="Cap rate" value={percent(property.financials.cap_rate)} />
                <CompareRow label="Cash-on-cash" value={percent(property.financials.cash_on_cash_return)} />
                <CompareRow label="DSCR" value={`${Number(property.financials.dscr).toFixed(2)}×`} />
                <CompareRow label="Break-even occupancy" value={percent(property.financials.break_even_occupancy)} />
              </div>
            </article>
          ))}
        </section>
      ) : <p className="empty">Select at least two properties.</p>}
    </main>
  );
}

function CompareRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return <div className="compare-row"><span className="muted">{label}</span><strong className="mono">{value}</strong></div>;
}
