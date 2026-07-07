// Feature 3 — Document Checklist Generator. POST /api/checklist
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { ChecklistAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import ConfidenceBadge from "../components/ConfidenceBadge";

const PRESETS = [
  { label: "Passport", icon: "flight_takeoff" },
  { label: "Driving Licence", icon: "drive_eta" },
  { label: "PAN", icon: "credit_card" },
  { label: "Birth Certificate", icon: "child_care" },
];

export default function Checklist() {
  const [service, setService] = useState("");
  const { data, loading, error, run } = useApi(ChecklistAPI.generate);
  const { run: save } = useApi(ChecklistAPI.save);

  const submit = (e) => {
    e.preventDefault();
    if (service.trim()) run({ service });
  };

  return (
    <main className="pt-[88px] pb-[96px] md:pb-lg px-margin-mobile md:pr-margin-desktop w-full max-w-[1536px] mx-auto min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="mb-lg">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Document Checklist Generator</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">Instantly generate precise, up-to-date document requirements for any Indian government service. Powered by CivicSathi AI.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter flex-1">
        {/* Left Column: Input & Presets */}
        <div className="lg:col-span-5 flex flex-col gap-md">
          {/* Search Input Card */}
          <div className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">search</span>
              Find Service
            </h2>
            <form onSubmit={submit} className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">assignment</span>
              </div>
              <input
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md placeholder-outline text-on-surface shadow-sm"
                placeholder="e.g., New Passport, Domicile Certificate..."
                type="text"
              />
              <button type="submit" className="absolute inset-y-2 right-2 px-4 bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary-container transition-colors active:scale-95">
                Generate
              </button>
            </form>
          </div>
          {/* Presets Bento */}
          <div>
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Quick Select</h3>
            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((preset) => {
                const active = service === preset.label;
                return (
                  <button
                    key={preset.label}
                    onClick={() => { setService(preset.label); run({ service: preset.label }); }}
                    className={
                      "bg-surface rounded-lg border border-outline-variant/30 p-4 flex flex-col items-start gap-3 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-primary/40 transition-all text-left group" +
                      (active ? " ring-2 ring-primary/20 bg-primary/5" : "")
                    }
                  >
                    <div className={
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors" +
                      (active ? " bg-primary shadow-sm" : " bg-surface-container-high group-hover:bg-primary-container")
                    }>
                      <span className={
                        "material-symbols-outlined" +
                        (active ? " text-on-primary" : " text-on-surface-variant group-hover:text-primary")
                      }>{preset.icon}</span>
                    </div>
                    <span className={
                      "font-label-md text-label-md font-semibold" +
                      (active ? " text-primary" : " text-on-surface")
                    }>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* Right Column: Results Canvas */}
        <div className="lg:col-span-7">
          {loading && (
            <div className="flex items-center justify-center h-full min-h-[240px]">
              <Loader label="Building checklist…" />
            </div>
          )}

          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} />
            </div>
          )}

          {data && (
            /* Generated Checklist Result Card (Glassmorphism & AI styling) */
            <div className="ai-gradient-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-surface/90 backdrop-blur-md overflow-hidden flex flex-col h-full relative">
              {/* AI Badge & Header */}
              <div className="ai-tint-bg p-6 border-b border-outline-variant/20 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 bg-surface-container-lowest border border-primary/20 rounded-full px-3 py-1 shadow-sm w-max">
                    <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
                    <span className="font-label-sm text-label-sm text-primary">AI Verified Checklist</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <ConfidenceBadge value={data.confidence} />
                    <button
                      onClick={() => save({ service: data.service, checklist: data })}
                      className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                      Save
                    </button>
                  </div>
                </div>
                <div>
                  <h2 className="font-display-lg text-headline-lg text-on-surface mb-1">{data.service}</h2>
                </div>
                {/* Info Pills */}
                {data.processingTime && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md border border-outline-variant/30">
                      <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">{data.processingTime}</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Checklist Content */}
              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
                {/* Required Documents Section */}
                {data.requiredDocuments?.length > 0 && (
                  <section>
                    <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-error">asterisk</span>
                      Mandatory Documents
                    </h3>
                    <div className="flex flex-col gap-3">
                      {data.requiredDocuments.map((doc, i) => (
                        <div key={i} className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 flex gap-4 items-start shadow-sm hover:border-primary/30 transition-colors">
                          <div className="mt-0.5">
                            <div className="w-5 h-5 rounded border border-outline flex items-center justify-center bg-surface cursor-pointer hover:border-primary"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{doc}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Optional Documents Section */}
                {data.optionalDocuments?.length > 0 && (
                  <section>
                    <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-outline">add_circle</span>
                      Optional Documents
                    </h3>
                    <div className="flex flex-col gap-3">
                      {data.optionalDocuments.map((doc, i) => (
                        <div key={i} className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 flex gap-4 items-start shadow-sm hover:border-primary/30 transition-colors">
                          <div className="mt-0.5">
                            <div className="w-5 h-5 rounded border border-outline flex items-center justify-center bg-surface cursor-pointer hover:border-primary"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{doc}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* AI Insights Grid (Bento style) */}
                {(data.commonRejectionReasons?.length > 0 || data.tips?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rejection Reasons */}
                    {data.commonRejectionReasons?.length > 0 && (
                      <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="font-label-md text-label-md text-error flex items-center gap-2 font-bold">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          Common Rejection Reasons
                        </h4>
                        <ul className="font-body-sm text-label-sm text-on-surface-variant space-y-2">
                          {data.commonRejectionReasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[14px] text-error mt-0.5">close</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Helpful Tips */}
                    {data.tips?.length > 0 && (
                      <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="font-label-md text-label-md text-tertiary flex items-center gap-2 font-bold">
                          <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                          Pro Tips
                        </h4>
                        <ul className="font-body-sm text-label-sm text-on-surface-variant space-y-2">
                          {data.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[14px] text-tertiary mt-0.5">check</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action footer */}
                {data.officialWebsite && (
                  <div className="mt-auto pt-6 border-t border-outline-variant/20 flex justify-between items-center">
                    <a
                      className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1"
                      href={data.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit Official Portal
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
