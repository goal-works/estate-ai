"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002/api";

export function ScenarioBuilder({ propertyId, baseVacancy }: Readonly<{ propertyId: string; baseVacancy: string }>) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage("");
    const data = new FormData(form);
    const response = await fetch(`${API_URL}/properties/${propertyId}/scenarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        type: "custom",
        rent_adjustment_rate: Number(data.get("rent_adjustment_rate")),
        vacancy_rate: Number(data.get("vacancy_rate")),
        expense_adjustment_rate: Number(data.get("expense_adjustment_rate")),
        appreciation_rate: Number(data.get("appreciation_rate")),
      }),
    });
    if (response.ok) {
      setMessage("Scenario created and calculated.");
      form.reset();
      router.refresh();
    } else {
      setMessage(response.status === 409 ? "Use a unique scenario name." : "Review the scenario assumptions.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit}>
      <div className="input-grid compact">
        <div className="field"><label htmlFor="scenario-name">Scenario name</label><input id="scenario-name" name="name" required /></div>
        <div className="field"><label htmlFor="rent-adjustment">Rent change %</label><input defaultValue="0" id="rent-adjustment" name="rent_adjustment_rate" step="0.1" type="number" /></div>
        <div className="field"><label htmlFor="scenario-vacancy">Vacancy %</label><input defaultValue={baseVacancy} id="scenario-vacancy" min="0" name="vacancy_rate" step="0.1" type="number" /></div>
        <div className="field"><label htmlFor="expense-adjustment">Expense change %</label><input defaultValue="0" id="expense-adjustment" name="expense_adjustment_rate" step="0.1" type="number" /></div>
        <div className="field"><label htmlFor="appreciation">Appreciation %</label><input defaultValue="3" id="appreciation" name="appreciation_rate" step="0.1" type="number" /></div>
      </div>
      <button className="button" disabled={pending} style={{ marginTop: 14 }} type="submit">{pending ? "Creating…" : "Create custom scenario"}</button>
      {message ? <p className="muted" role="status">{message}</p> : null}
    </form>
  );
}
