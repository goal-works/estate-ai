import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology" };

const formulas = [
  ["Effective rental income", "Monthly rent × 12 × (1 − vacancy rate)"],
  ["NOI", "Effective rental income − annual operating expenses"],
  ["Cap rate", "NOI ÷ purchase price"],
  ["Monthly cash flow", "(NOI − annual debt service) ÷ 12"],
  ["Cash-on-cash return", "Annual cash flow ÷ down payment and closing costs"],
  ["DSCR", "NOI ÷ annual debt service"],
  ["Break-even occupancy", "Operating expenses and debt service ÷ gross scheduled rent"],
] as const;

export default function MethodologyPage() {
  return (
    <main className="main">
      <div className="page-head"><div><p className="eyebrow">Calculation methodology</p><h1>Authoritative numbers stay deterministic.</h1><p className="lede">EstateAI calculates business-critical outputs in explicit application code. The explanatory brief receives those known values and cannot alter them.</p></div></div>
      <div className="notice"><span><strong>Scope</strong> — Educational synthetic analysis only; not financial, legal, tax, appraisal, or investment advice.</span></div>
      <div className="split" style={{ marginTop: 18 }}>
        <section className="section" style={{ margin: 0 }}><div className="section-head"><h2>Core formulas</h2></div><div className="section-body"><div className="compare-list">{formulas.map(([label, formula]) => <div className="compare-row" key={label}><strong>{label}</strong><span className="mono muted">{formula}</span></div>)}</div></div></section>
        <section className="section" style={{ margin: 0 }}><div className="section-head"><h2>Generative boundary</h2></div><div className="section-body"><p className="lede" style={{ margin: 0 }}>The V1 brief runs in deterministic demo mode. It receives only the selected property, displayed assumptions, scenario name, and calculated outputs.</p><div className="compare-list"><div className="compare-row"><span>May explain supplied metrics</span><strong className="positive">Yes</strong></div><div className="compare-row"><span>May invent market facts</span><strong className="negative">No</strong></div><div className="compare-row"><span>May replace calculations</span><strong className="negative">No</strong></div><div className="compare-row"><span>May claim financial advice</span><strong className="negative">No</strong></div></div></div></section>
      </div>
    </main>
  );
}
