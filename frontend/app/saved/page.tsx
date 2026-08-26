import type { Metadata } from "next";

import { PropertyCard } from "@/components/property-card";
import { getProperties } from "@/lib/api";

export const metadata: Metadata = { title: "Saved selections" };

export default async function SavedPage() {
  const properties = await getProperties("favorites=true");
  return (
    <main className="main">
      <div className="page-head"><div><p className="eyebrow">Saved selections</p><h1>Keep a focused review set.</h1><p className="lede">Saved state belongs to this local demo workspace and never implies ownership, availability, or a real listing.</p></div></div>
      <div className="notice"><span><strong>Local demo state</strong> — Use each property detail page to add or remove a saved selection.</span><span>{properties.length} saved</span></div>
      {properties.length ? <div className="property-list" style={{ marginTop: 22 }}>{properties.map((property, index) => <PropertyCard index={index} key={property.id} property={property} />)}</div> : <p className="empty">No properties are saved in this demo workspace.</p>}
    </main>
  );
}
