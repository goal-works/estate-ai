import type { Metadata } from "next";
import Link from "next/link";

import { InvestmentCalculator } from "@/components/investment-calculator";
import { PropertyVisual } from "@/components/property-visual";
import { SaveButton } from "@/components/save-button";
import { ScenarioBuilder } from "@/components/scenario-builder";
import { getBrief, getProperty, money, percent } from "@/lib/api";

type PageProps = Readonly<{ params: Promise<{ slug: string }> }>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  return { title: property.name, description: `Synthetic investment analysis for ${property.name}.` };
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getProperty(slug);
  const brief = await getBrief(property.id);
  const cashFlow = Number(property.financials.monthly_cash_flow);

  return (
    <main className="main">
      <div className="notice" style={{ marginBottom: 18 }}><span><strong>Synthetic property</strong> — This is original demo data, not a listing or investment opportunity.</span><span>Verify every assumption independently</span></div>
      <section className="detail-hero">
        <div className="hero-copy">
          <div>
            <p className="eyebrow">{property.property_type} / {property.city}</p>
            <h1>{property.name}</h1>
            <p className="lede">{property.address} · {property.region}</p>
            <p className="hero-price">{money(property.price)}</p>
          </div>
          <div>
            <div className="hero-facts"><span>{property.beds} beds</span><span>{property.baths} baths</span><span>{property.area_sqft.toLocaleString()} ft²</span><span>Built {property.year_built}</span></div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}><SaveButton initialSaved={property.is_favorite} propertyId={property.id} /><Link className="button primary" href={`/compare?ids=${property.id}`}>Compare</Link></div>
          </div>
        </div>
        <PropertyVisual index={property.name.length} label={property.name} />
      </section>

      <div className="metric-grid">
        <div className="metric"><p className="metric-label">Estimated rent</p><p className="metric-value">{money(property.monthly_rent)}</p><p className="metric-foot">supplied monthly assumption</p></div>
        <div className="metric"><p className="metric-label">Cap rate</p><p className="metric-value">{percent(property.financials.cap_rate)}</p><p className="metric-foot">NOI ÷ purchase price</p></div>
        <div className="metric"><p className="metric-label">Cash-on-cash</p><p className="metric-value">{percent(property.financials.cash_on_cash_return)}</p><p className="metric-foot">annual cash flow ÷ cash invested</p></div>
        <div className="metric"><p className="metric-label">Monthly cash flow</p><p className={`metric-value ${cashFlow >= 0 ? "positive" : "negative"}`}>{money(property.financials.monthly_cash_flow)}</p><p className="metric-foot">after modeled debt service</p></div>
      </div>

      <section className="section">
        <div className="section-head"><h2>Property overview</h2><span className="eyebrow">Structured demo record</span></div>
        <div className="section-body split"><p className="lede" style={{ margin: 0 }}>{property.description}</p><div><h3>{property.neighborhood.label}</h3><div className="compare-list"><div className="compare-row"><span>Walkability index</span><strong>{property.neighborhood.walkability_index}/100</strong></div><div className="compare-row"><span>Transit index</span><strong>{property.neighborhood.transit_index}/100</strong></div></div>{property.neighborhood.notes.map((note) => <p className="muted" key={note}>{note}</p>)}</div></div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Investment calculator</h2><span className="eyebrow">Deterministic outputs</span></div>
        <div className="section-body"><InvestmentCalculator initialFinancials={property.financials} initialInputs={property.finance_inputs} propertyId={property.id} /><p className="disclaimer">These outputs are deterministic calculations from the displayed assumptions. They are not a valuation, forecast, or financial advice.</p></div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Scenario comparison</h2><span className="eyebrow">Conservative / base / optimistic / custom</span></div>
        <div className="section-body">
          <div className="table-wrap"><table><thead><tr><th>Scenario</th><th>Rent</th><th>Vacancy</th><th>Cash flow</th><th>Cap rate</th><th>Cash-on-cash</th><th>Year 5 value</th></tr></thead><tbody>{property.scenarios.map((scenario) => <tr key={scenario.id}><td><strong>{scenario.name}</strong></td><td>{money(scenario.adjusted_inputs.monthly_rent)}</td><td>{Number(scenario.assumptions.vacancy_rate).toFixed(1)}%</td><td>{money(scenario.financials.monthly_cash_flow)}</td><td>{percent(scenario.financials.cap_rate)}</td><td>{percent(scenario.financials.cash_on_cash_return)}</td><td>{money(scenario.projected_value_year_5)}</td></tr>)}</tbody></table></div>
          <div style={{ marginTop: 24 }}><h3 style={{ marginBottom: 14 }}>Create a scenario</h3><ScenarioBuilder baseVacancy={property.finance_inputs.vacancy_rate} propertyId={property.id} /></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Structured investment brief</h2><span className="eyebrow">Deterministic demo mode</span></div>
        <div className="section-body brief">
          <div><p className="brief-summary">{brief.investment_summary}</p><p className="disclaimer">{brief.overall_assessment}</p></div>
          <div className="brief-grid"><BriefBlock items={brief.strengths} title="Strengths" /><BriefBlock items={brief.risks} title="Risks" /><BriefBlock items={brief.financial_observations} title="Financial observations" /><BriefBlock items={brief.questions_to_investigate} title="Questions to investigate" /></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Synthetic comparables</h2><span className="eyebrow">No scraped listings</span></div>
        <div className="table-wrap"><table><thead><tr><th>Comparable</th><th>Distance</th><th>Price</th><th>Rent</th><th>Beds / baths</th><th>Area</th></tr></thead><tbody>{property.comparables.map((comparable) => <tr key={comparable.id}><td>{comparable.label}</td><td>{comparable.distance_miles} mi</td><td>{money(comparable.price)}</td><td>{money(comparable.monthly_rent)}</td><td>{comparable.beds} / {comparable.baths}</td><td>{comparable.area_sqft.toLocaleString()} ft²</td></tr>)}</tbody></table></div>
      </section>
    </main>
  );
}

function BriefBlock({ title, items }: Readonly<{ title: string; items: string[] }>) {
  return <section className="brief-block"><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
