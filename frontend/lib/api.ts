const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002/api";

export type Financials = {
  loan_amount: string;
  monthly_mortgage_payment: string;
  gross_scheduled_rent: string;
  effective_rental_income: string;
  annual_operating_expenses: string;
  net_operating_income: string;
  annual_debt_service: string;
  monthly_cash_flow: string;
  cap_rate: string;
  cash_on_cash_return: string;
  dscr: string;
  break_even_occupancy: string;
  cash_invested: string;
};

export type FinanceInputs = {
  purchase_price: string;
  down_payment: string;
  annual_interest_rate: string;
  loan_term_years: number;
  closing_costs: string;
  monthly_rent: string;
  vacancy_rate: string;
  annual_property_tax: string;
  annual_insurance: string;
  monthly_maintenance: string;
  management_fee_rate: string;
  monthly_hoa: string;
};

export type PropertySummary = {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  property_type: string;
  price: string;
  beds: number;
  baths: number;
  area_sqft: number;
  latitude: number;
  longitude: number;
  monthly_rent: string;
  is_favorite: boolean;
  financials: Financials;
};

export type Scenario = {
  id: string;
  name: string;
  type: string;
  assumptions: {
    rent_adjustment_rate: string;
    vacancy_rate: string;
    expense_adjustment_rate: string;
    appreciation_rate: string;
  };
  adjusted_inputs: FinanceInputs;
  financials: Financials;
  projected_value_year_5: string;
};

export type PropertyDetail = PropertySummary & {
  description: string;
  year_built: number;
  neighborhood: {
    label: string;
    walkability_index: number;
    transit_index: number;
    notes: string[];
  };
  finance_inputs: FinanceInputs;
  comparables: {
    id: string;
    label: string;
    distance_miles: string;
    price: string;
    monthly_rent: string;
    beds: number;
    baths: number;
    area_sqft: number;
  }[];
  scenarios: Scenario[];
};

export type Brief = {
  mode: string;
  source: string;
  scenario: string;
  investment_summary: string;
  strengths: string[];
  risks: string[];
  financial_observations: string[];
  questions_to_investigate: string[];
  overall_assessment: string;
};

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`EstateAI API returned ${response.status} for ${path}`);
  return response.json() as Promise<T>;
}

export function getProperties(query = "") {
  return get<PropertySummary[]>(`/properties${query ? `?${query}` : ""}`);
}

export function getProperty(slug: string) {
  return get<PropertyDetail>(`/properties/${slug}`);
}

export function compareProperties(ids: string[]) {
  const query = new URLSearchParams();
  ids.forEach((id) => query.append("ids", id));
  return get<{ properties: PropertyDetail[]; synthetic_data: boolean; disclaimer: string }>(
    `/properties/compare?${query}`,
  );
}

export async function getBrief(propertyId: string, scenarioId?: string): Promise<Brief> {
  const query = scenarioId ? `?scenario_id=${encodeURIComponent(scenarioId)}` : "";
  const response = await fetch(`${API_URL}/properties/${propertyId}/brief${query}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`EstateAI brief API returned ${response.status}`);
  return response.json() as Promise<Brief>;
}

export function money(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function percent(value: string | number): string {
  return `${(Number(value) * 100).toFixed(2)}%`;
}
