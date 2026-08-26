const colors = ["#315f4d", "#8b5c42", "#42677a", "#626849", "#7d4e50", "#43655f"];

export function PropertyVisual({
  index = 0,
  label,
}: Readonly<{ index?: number; label: string }>) {
  return (
    <div
      className="property-visual"
      role="img"
      aria-label={`Abstract illustration for the synthetic ${label} property`}
      style={{ "--visual-color": colors[index % colors.length] } as React.CSSProperties}
    >
      <span className="visual-badge">Synthetic property</span>
    </div>
  );
}
