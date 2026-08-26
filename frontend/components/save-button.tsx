"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002/api";

export function SaveButton({ propertyId, initialSaved }: Readonly<{ propertyId: string; initialSaved: boolean }>) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function update() {
    setPending(true);
    const response = await fetch(`${API_URL}/properties/${propertyId}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saved: !saved }),
    });
    if (response.ok) setSaved(!saved);
    setPending(false);
  }

  return <button className="button" disabled={pending} onClick={update} type="button">{pending ? "Saving…" : saved ? "Saved ✓" : "Save property"}</button>;
}
