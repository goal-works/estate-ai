import type { Metadata } from "next";
import Link from "next/link";

import { PropertyCard } from "@/components/property-card";
import { SyntheticMap } from "@/components/synthetic-map";
import { getProperties } from "@/lib/api";

export const metadata: Metadata = { title: "Synthetic property discovery" };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function selected(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function DiscoveryPage({ searchParams }: Readonly<{ searchParams: SearchParams }>) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["city", "property_type", "min_price", "max_price", "min_beds"] as const) {
    const value = selected(params, key);
    if (value) query.set(key, value);
  }
  const properties = await getProperties(query.toString());

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <p className="eyebrow">Property intelligence / deterministic analysis</p>
          <h1>Compare assumptions, not listing hype.</h1>
          <p className="lede">Browse original synthetic properties, inspect deterministic returns, test scenarios, and generate explanations from structured values only.</p>
        </div>
        <Link className="button" href="/methodology">Review methodology</Link>
      </div>
      <div className="notice"><span><strong>Demo dataset</strong> — Every property, address, neighborhood, comparable, and metric is synthetic.</span><span>Not financial advice</span></div>

      <form className="filters">
        <div className="field"><label htmlFor="city">City</label><select defaultValue={selected(params, "city")} id="city" name="city"><option value="">All synthetic cities</option><option>Northbank</option><option>Cedar Vale</option><option>Harbor Point</option></select></div>
        <div className="field"><label htmlFor="property_type">Property type</label><select defaultValue={selected(params, "property_type")} id="property_type" name="property_type"><option value="">All types</option><option>Single Family</option><option>Condo</option><option>Duplex</option><option>Triplex</option><option>Townhome</option></select></div>
        <div className="field"><label htmlFor="min_price">Minimum price</label><input defaultValue={selected(params, "min_price")} id="min_price" min="0" name="min_price" type="number" /></div>
        <div className="field"><label htmlFor="max_price">Maximum price</label><input defaultValue={selected(params, "max_price")} id="max_price" min="0" name="max_price" type="number" /></div>
        <div className="field"><label htmlFor="min_beds">Minimum beds</label><select defaultValue={selected(params, "min_beds")} id="min_beds" name="min_beds"><option value="">Any</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></div>
        <button className="button primary" type="submit">Apply filters</button>
      </form>

      <div className="discovery">
        <section className="listing-panel">
          <div className="listing-head"><h2>Modeled properties</h2><p>{properties.length} results</p></div>
          {properties.length ? <div className="property-list">{properties.map((property, index) => <PropertyCard index={index} key={property.id} property={property} />)}</div> : <p className="empty">No synthetic properties match these assumptions.</p>}
        </section>
        <SyntheticMap properties={properties} />
      </div>
    </main>
  );
}
