export default function Loader({ label = "Working…" }) {
  return (
    <div className="flex items-center gap-2 text-primary" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="font-label-md text-label-md">{label}</span>
    </div>
  );
}
