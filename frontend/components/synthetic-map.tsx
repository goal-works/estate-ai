"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import { useRouter } from "next/navigation";

import type { PropertySummary } from "@/lib/api";

const syntheticStyle: StyleSpecification = {
  version: 8,
  sources: {
    districts: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-1, -1], [0, -1], [0, 0.15], [-1, 0.15], [-1, -1]]] } },
          { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[0, -1], [1, -1], [1, 0.25], [0, 0.15], [0, -1]]] } },
          { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-1, 0.15], [0, 0.15], [1, 0.25], [1, 1], [-1, 1], [-1, 0.15]]] } },
        ],
      },
    },
    roads: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-1, -0.45], [-0.35, -0.1], [0.25, 0.3], [1, 0.58]] } },
          { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-0.7, 1], [-0.3, 0.3], [0.15, -0.2], [0.6, -1]] } },
          { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[-1, 0.55], [-0.2, 0.43], [0.4, 0.05], [1, -0.2]] } },
        ],
      },
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#dce3d4" } },
    { id: "district-fill", type: "fill", source: "districts", paint: { "fill-color": ["match", ["id"], 0, "#c7d9c4", 1, "#d9d4ba", "#c9d9d2"], "fill-opacity": 0.78 } },
    { id: "district-line", type: "line", source: "districts", paint: { "line-color": "#9bab98", "line-width": 2 } },
    { id: "roads-shadow", type: "line", source: "roads", paint: { "line-color": "#a9a48d", "line-width": 9 } },
    { id: "roads", type: "line", source: "roads", paint: { "line-color": "#f7f3e8", "line-width": 5 } },
  ],
};

export function SyntheticMap({ properties }: Readonly<{ properties: PropertySummary[] }>) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!container.current || map.current) return;
    const instance = new maplibregl.Map({
      container: container.current,
      style: syntheticStyle,
      center: [0, 0],
      zoom: 8.4,
      attributionControl: false,
      cooperativeGestures: true,
    });
    instance.fitBounds([[-1, -1], [1, 1]], { padding: 70, animate: false });
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    for (const property of properties) {
      const marker = document.createElement("button");
      marker.className = "map-marker";
      marker.type = "button";
      marker.textContent = `${Math.round(Number(property.price) / 1000)}k`;
      marker.setAttribute("aria-label", `${property.name}, ${moneyLabel(property.price)}`);
      marker.addEventListener("click", () => {
        router.push(`/properties/${property.slug}`);
      });
      new maplibregl.Marker({ element: marker })
        .setLngLat([property.longitude, property.latitude])
        .addTo(instance);
    }
    map.current = instance;
    return () => {
      instance.remove();
      map.current = null;
    };
  }, [properties, router]);

  return (
    <div className="map-shell">
      <div className="map" ref={container} aria-label="Synthetic district map with property markers" />
      <div className="map-overlay"><span>Original demo geography</span><span>No real listings or market claims</span></div>
    </div>
  );
}

function moneyLabel(value: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}
