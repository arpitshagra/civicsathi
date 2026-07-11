// Renders an AI confidence score (0..1) as a coloured pill.
export default function ConfidenceBadge({ value }) {
  if (value == null) return null;
  // Convert 0..1 floating point score to an integer percentage
  const pct = Math.round(value * 100);
  
  // Set alert tones based on the confidence percentage threshold values
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
