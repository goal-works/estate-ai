"use client";

import { useState } from "react";

import { money, percent, type FinanceInputs, type Financials } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002/api";

const fields: { key: keyof FinanceInputs; label: string; step?: string }[] = [
  { key: "purchase_price", label: "Purchase price" },
  { key: "down_payment", label: "Down payment" },
  { key: "annual_interest_rate", label: "Interest rate %", step: "0.01" },
  { key: "loan_term_years", label: "Loan term years" },
  { key: "closing_costs", label: "Closing costs" },
  { key: "monthly_rent", label: "Monthly rent" },
  { key: "vacancy_rate", label: "Vacancy %", step: "0.1" },
  { key: "annual_property_tax", label: "Annual property tax" },
  { key: "annual_insurance", label: "Annual insurance" },
  { key: "monthly_maintenance", label: "Monthly maintenance" },
  { key: "management_fee_rate", label: "Management fee %", step: "0.1" },
  { key: "monthly_hoa", label: "Monthly HOA" },
];

export function InvestmentCalculator({
  propertyId,
  initialInputs,
  initialFinancials,
}: Readonly<{
  propertyId: string;
  initialInputs: FinanceInputs;
  initialFinancials: Financials;
}>) {
  const [inputs, setInputs] = useState(initialInputs);
  const [financials, setFinancials] = useState(initialFinancials);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(`${API_URL}/properties/${propertyId}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    if (response.ok) {
      const data = await response.json() as { financials: Financials };
      setFinancials(data.financials);
    } else {
      setError("Review the assumptions and try again.");
    }
    setPending(false);
  }

  return (
    <div className="split">
      <form onSubmit={calculate}>
        <div className="input-grid">
          {fields.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`calc-${field.key}`}>{field.label}</label>
              <input
                id={`calc-${field.key}`}
                min="0"
                name={field.key}
                onChange={(event) => setInputs({ ...inputs, [field.key]: field.key === "loan_term_years" ? Number(event.target.value) : event.target.value })}
                step={field.step ?? "1"}
                type="number"
                value={inputs[field.key]}
              />
            </div>
          ))}
        </div>
        {error ? <p className="negative">{error}</p> : null}
        <button className="button primary" disabled={pending} style={{ marginTop: 16 }} type="submit">{pending ? "Calculating…" : "Recalculate deterministically"}</button>
      </form>
      <div className="analysis-output" aria-live="polite">
        <div className="metric-small"><span>Mortgage payment</span><strong>{money(financials.monthly_mortgage_payment)}</strong></div>
        <div className="metric-small"><span>Operating expenses / yr</span><strong>{money(financials.annual_operating_expenses)}</strong></div>
        <div className="metric-small"><span>NOI</span><strong>{money(financials.net_operating_income)}</strong></div>
        <div className="metric-small"><span>Monthly cash flow</span><strong>{money(financials.monthly_cash_flow)}</strong></div>
        <div className="metric-small"><span>Cap rate</span><strong>{percent(financials.cap_rate)}</strong></div>
        <div className="metric-small"><span>Cash-on-cash</span><strong>{percent(financials.cash_on_cash_return)}</strong></div>
        <div className="metric-small"><span>DSCR</span><strong>{Number(financials.dscr).toFixed(2)}×</strong></div>
        <div className="metric-small"><span>Break-even occupancy</span><strong>{percent(financials.break_even_occupancy)}</strong></div>
      </div>
    </div>
  );
}
