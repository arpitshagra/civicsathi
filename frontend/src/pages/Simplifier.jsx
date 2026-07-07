// Feature 4 — Government Notification Simplifier. POST /api/simplify
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { SimplifyAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import ConfidenceBadge from "../components/ConfidenceBadge";

export default function Simplifier() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const { data, loading, error, run } = useApi(SimplifyAPI.run);

  const submit = (e) => {
    e.preventDefault();
    if (text.trim().length >= 10) run({ text });
  };

  const copyResult = async () => {
    if (!data) return;
    const parts = [
      data.summary,
      data.keyPoints?.length
        ? "Key Points:\n" + data.keyPoints.map((p) => `• ${p}`).join("\n")
        : "",
      data.importantDates?.length
        ? "Important Dates:\n" +
          data.importantDates.map((d) => `• ${d.label || "Date"}: ${d.date}`).join("\n")
        : "",
      data.citizenActions?.length
        ? "Action Items:\n" + data.citizenActions.map((a, i) => `${i + 1}. ${a}`).join("\n")
        : "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(parts.join("\n\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    /* Main Content Canvas — Layout provides the fixed sidebar; md:pl-64 dropped */
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-gutter lg:py-lg flex flex-col gap-lg">
      {/* Header Section */}
      <section className="flex flex-col gap-2 md:mt-0 mt-4">
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight hidden md:block">
          AI Assistant
        </h1>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
          Government Notification Simplifier
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Paste complex legal or administrative language below. CivicSathi will translate it into
          clear, actionable steps.
        </p>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Input Area (Left Col on Desktop) */}
        <section className="lg:col-span-7 flex flex-col gap-md">
          <form
            onSubmit={submit}
            className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden h-full"
          >
            {/* Decorative subtle background */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            ></div>
            <label
              className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2"
              htmlFor="notice-input"
            >
              <span className="material-symbols-outlined text-primary text-xl">content_paste</span>
              Paste Notification Text
            </label>
            <textarea
              id="notice-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
              className="w-full flex-1 min-h-[300px] p-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface resize-y shadow-inner transition-colors"
              placeholder="Example: 'In pursuance of sub-section (1) of section 4 of the said Act, the Authority hereby notifies that all applicants must submit Form 16B in triplicate on or before the 15th of the ensuing month...'"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {text.length} / 5000 characters
              </span>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-on-primary font-label-md text-label-md font-semibold py-3 px-6 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Simplify
              </button>
            </div>
          </form>
        </section>

        {/* Output Area (Right Col on Desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-md">
          {/* Loading */}
          {loading && (
            <div className="ai-border rounded-xl p-6 flex items-center justify-center shadow-md min-h-[300px]">
              <Loader label="Simplifying…" />
            </div>
          )}

          {/* Error */}
          {!loading && error && <ErrorBanner message={error} />}

          {/* Empty state */}
          {!loading && !error && !data && (
            <div className="ai-border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 shadow-md min-h-[300px]">
              <span className="material-symbols-outlined text-primary text-5xl">psychology</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">AI Summary</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                Paste a notification and hit Simplify. Your plain-language summary will appear here.
              </p>
            </div>
          )}

          {/* AI Output Card (Bento Style) — rendered only when data exists */}
          {!loading && data && (
            <div className="ai-border rounded-xl p-6 flex flex-col gap-6 relative shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-2 text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    psychology
                  </span>
                  <h3 className="font-headline-md text-headline-md">AI Summary</h3>
                </div>
                <ConfidenceBadge value={data.confidence} />
              </div>

              {/* Summary Content */}
              <div className="flex flex-col gap-4">
                {/* The Gist */}
                <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant/20">
                  <h4 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">
                    The Gist
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">
                    {data.summary}
                  </p>
                </div>

                {/* Key Points */}
                {data.keyPoints?.length > 0 && (
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">key</span> Key Points
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {data.keyPoints.map((point, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                            check_circle
                          </span>
                          <span className="font-body-md text-body-md text-on-surface">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Important Dates (stat-card grid) */}
                {data.importantDates?.length > 0 && (
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">event</span> Important
                      Dates
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.importantDates.map((d, i) => (
                        <div
                          key={i}
                          className="bg-inverse-on-surface p-4 rounded-lg flex flex-col gap-2"
                        >
                          <span className="material-symbols-outlined text-primary">
                            calendar_month
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {d.label || "Date"}
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {d.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {data.citizenActions?.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">checklist</span>{" "}
                      Citizen Action Items
                    </h4>
                    <ol className="flex flex-col gap-3">
                      {data.citizenActions.map((action, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                            {i + 1}
                          </div>
                          <span className="font-body-md text-body-md text-on-surface">{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={copyResult}
                  className="flex-1 border border-outline text-on-surface font-label-md text-label-md py-2 px-4 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>{" "}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  className="flex-1 border border-outline text-on-surface font-label-md text-label-md py-2 px-4 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span> Share
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
