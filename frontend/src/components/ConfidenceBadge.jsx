// Renders an AI confidence score (0..1) as a coloured pill.
export default function ConfidenceBadge({ value }) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  const tone =
    pct >= 75
      ? "bg-green-100 text-green-800"
      : pct >= 50
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      Confidence: {pct}%
    </span>
  );
}
