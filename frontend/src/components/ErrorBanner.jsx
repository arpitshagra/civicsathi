export default function ErrorBanner({ message }) {
  // If no error message exists, do not render any banner wrapper
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 rounded-lg border border-error/20 bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container"
      role="alert"
    >
      <span className="material-symbols-outlined text-[20px] text-error shrink-0">error</span>
      <span>{message}</span>
    </div>
  );
}
