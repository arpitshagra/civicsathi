// Feature 5 — AI Complaint Generator. POST /api/complaint
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { ComplaintAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import ConfidenceBadge from "../components/ConfidenceBadge";

export default function Complaint() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const { data, loading, error, run } = useApi(ComplaintAPI.generate);
  const { run: save, data: saved } = useApi(ComplaintAPI.save);

  const submit = (e) => {
    e.preventDefault();
    if (description.trim().length >= 5) run({ description, location });
  };

  const priorityTone = {
    High: "bg-error-container text-on-error-container",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-tertiary-container text-on-tertiary",
  };

  return (
    <main className="flex-1 w-full pt-20 md:pt-8 pb-24 md:pb-8 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">AI Complaint Generator</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Describe your issue in plain language. Our AI will structure it into a formal grievance directed to the correct municipal department.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Input Area */}
        <div className="lg:col-span-7 flex flex-col gap-md">
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
            {/* Subtle AI Background tint */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <h3 className="font-headline-md text-headline-lg-mobile md:text-headline-md text-on-surface mb-6 relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_document</span>
              Draft Your Issue
            </h3>
            <form className="relative z-10 flex flex-col gap-6" onSubmit={submit}>
              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="complaint-desc">What is the problem?</label>
                <textarea
                  className="w-full bg-surface rounded-lg border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-on-surface font-body-md text-body-md p-3 resize-none transition-colors shadow-sm"
                  id="complaint-desc"
                  placeholder="e.g., There is a large pothole on Main Street near the post office that has been there for three weeks, damaging cars."
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="complaint-loc">Location details</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                  <input
                    className="w-full bg-surface rounded-lg border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-on-surface font-body-md text-body-md p-3 pl-10 transition-colors shadow-sm"
                    id="complaint-loc"
                    placeholder="Street, Landmark, Ward number..."
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              {/* Image Upload — decorative for v1, not wired */}
              <div className="flex flex-col gap-2">
                <span className="font-label-md text-label-md text-on-surface">Attach Evidence (Optional)</span>
                <button type="button" className="w-full border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-surface hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-display-lg mb-2">add_photo_alternate</span>
                  <p className="font-label-md text-label-md text-on-surface font-medium">Click to upload or drag and drop</p>
                  <p className="font-label-sm text-label-sm text-outline mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </button>
              </div>
              {/* Submit */}
              <button className="mt-4 w-full bg-primary hover:bg-primary-container hover:text-on-primary-container text-on-primary font-label-md text-label-md py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]" type="submit">
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate Formal Complaint
              </button>
            </form>
          </div>
        </div>
        {/* Result Area */}
        <div className="lg:col-span-5 relative" id="result-container">
          {loading && (
            <div className="h-full min-h-[400px] flex items-center justify-center">
              <Loader label="Drafting complaint…" />
            </div>
          )}

          <ErrorBanner message={error} />

          {/* Initial State Placeholder */}
          {!data && !loading && (
            <div className="h-full min-h-[400px] border border-surface-container-high rounded-xl bg-surface-container-lowest/50 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500">
              <span className="material-symbols-outlined text-display-lg text-surface-container-highest mb-4">document_scanner</span>
              <h4 className="font-headline-md text-headline-lg-mobile md:text-headline-md text-on-surface-variant mb-2">Awaiting Input</h4>
              <p className="font-body-md text-body-md text-outline max-w-sm">Fill out the details on the left, and our AI will generate a formal, categorized grievance ready for submission.</p>
            </div>
          )}

          {/* AI Result Card */}
          {data && (
            <div className="glass-panel rounded-xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] ai-glow border border-primary/20">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">robot</span>
                  AI Generated Draft
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center">
                    {data.category}
                  </span>
                  <span className={`font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 ${priorityTone[data.priority] || "bg-surface-container-high text-on-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[16px]">priority_high</span> {data.priority} Priority
                  </span>
                  <ConfidenceBadge value={data.confidence} />
                </div>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Routing Info */}
                {data.department && (
                  <div className="bg-surface-container-low p-4 rounded-lg border border-surface-container-high">
                    <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Routed To</p>
                    <p className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary-container">engineering</span>
                      {data.department}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Category: {data.category}</p>
                  </div>
                )}
                {/* Formal Title */}
                <div>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Subject</p>
                  <p className="font-headline-md text-headline-lg-mobile md:text-headline-md text-on-surface font-semibold leading-tight">
                    {data.title}
                  </p>
                </div>
                {/* Formal Description */}
                <div>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2">Formal Description</p>
                  <div className="prose prose-sm text-on-surface-variant font-body-md text-body-md leading-relaxed bg-surface-bright p-4 rounded-lg border border-outline-variant/30">
                    <p className="whitespace-pre-line">{data.description}</p>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-surface-container-high flex gap-4">
                <button
                  type="button"
                  onClick={() => save({ complaint: data, location })}
                  className="flex-1 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md py-3 rounded-lg transition-colors font-semibold shadow-md flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  {saved ? "Filed" : "File this complaint"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
