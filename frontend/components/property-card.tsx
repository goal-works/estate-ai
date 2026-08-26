import Link from "next/link";

import { PropertyVisual } from "@/components/property-visual";
import { money, percent, type PropertySummary } from "@/lib/api";

export function PropertyCard({ property, index }: Readonly<{ property: PropertySummary; index: number }>) {
  return (
    <article className="property-card">
      <Link href={`/properties/${property.slug}`}>
        <PropertyVisual index={index} label={property.name} />
        <div className="card-body">
          <h3>{property.name}</h3>
          <p className="card-location">{property.address} · {property.city}</p>
          <div className="card-facts">
            <span>{property.beds} beds</span><span>{property.baths} baths</span><span>{property.area_sqft.toLocaleString()} ft²</span>
          </div>
          <div className="card-metrics">
            <div className="metric-small"><span>Price</span><strong>{money(property.price)}</strong></div>
            <div className="metric-small"><span>Cap rate</span><strong>{percent(property.financials.cap_rate)}</strong></div>
          </div>
        </div>
      </Link>
    </article>
  );
}
