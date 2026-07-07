// Feature 2 — Scheme Eligibility Finder. POST /api/schemes
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { SchemesAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import ConfidenceBadge from "../components/ConfidenceBadge";

const EMPTY = {
  age: "",
  state: "",
  occupation: "",
  education: "",
  annualIncome: "",
  gender: "",
};

export default function SchemeFinder() {
  const [form, setForm] = useState(EMPTY);
  const { data, loading, error, run } = useApi(SchemesAPI.find);
  const { run: save } = useApi(SchemesAPI.save);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    run({
      ...form,
      age: Number(form.age),
      annualIncome: Number(form.annualIncome),
    });
  };

  return (
    <main className="flex-1 w-full">
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md md:py-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-lg">
          <div>
            <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background mb-2">Find Your Schemes</h2>
            <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-2xl">
              Our AI analyzes your demographic and professional profile to instantly identify government programs, subsidies, and benefits you are legally entitled to claim.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-background rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors shadow-sm">
              <span className="material-symbols-outlined">history</span>
              Past Searches
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: The Form Panel (Glassmorphism) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-md shadow-sm border border-outline-variant">
              <div className="flex items-center gap-3 mb-6 border-b border-surface-variant pb-4">
                <span className="material-symbols-outlined text-primary">person_search</span>
                <h3 className="font-headline-md text-headline-md text-on-background">Eligibility Profile</h3>
              </div>
              <form className="space-y-6" onSubmit={submit}>
                {/* Field Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Age</label>
                    <input
                      className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="e.g. 34"
                      type="number"
                      value={form.age}
                      onChange={set("age")}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Gender</label>
                    <select
                      className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      value={form.gender}
                      onChange={set("gender")}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                {/* Field Row 2 */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">State of Residence</label>
                  <input
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="e.g. Maharashtra"
                    value={form.state}
                    onChange={set("state")}
                  />
                </div>
                {/* Field Row 3 */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Primary Occupation</label>
                  <input
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="e.g. Farmer / Agriculture"
                    value={form.occupation}
                    onChange={set("occupation")}
                  />
                </div>
                {/* Field Row 4 */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Highest Education</label>
                  <input
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="e.g. Graduate"
                    value={form.education}
                    onChange={set("education")}
                  />
                </div>
                {/* Field Row 5 */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Annual Household Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                    <input
                      className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface pl-8 pr-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="0.00"
                      type="number"
                      value={form.annualIncome}
                      onChange={set("annualIncome")}
                    />
                  </div>
                </div>
                <button
                  className="w-full h-[48px] bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:scale-[0.98] transition-transform shadow-md flex justify-center items-center gap-2 mt-4"
                  type="submit"
                >
                  <span className="material-symbols-outlined">magic_button</span>
                  Analyze Eligibility
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Results Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {loading && <Loader label="Finding schemes…" />}
            <ErrorBanner message={error} />

            {data && (
              <>
                {/* AI Summary Card (Tonal Layer) */}
                {data.disclaimer && (
                  <div className="ai-summary-border rounded-xl shadow-md">
                    <div className="ai-summary-bg p-md flex gap-4">
                      <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>robot_2</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md font-bold text-primary mb-1">AI Analysis Complete</h4>
                        <p className="font-body-md text-body-md text-on-surface-variant">{data.disclaimer}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result Cards */}
                <div className="space-y-4">
                  {data.schemes?.length === 0 && (
                    <p className="font-body-md text-body-md text-on-surface-variant">No schemes found for this profile.</p>
                  )}
                  {data.schemes?.map((s, i) => (
                    <div key={i} className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      {/* Decorative top border indicator */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-container"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ConfidenceBadge value={s.confidence} />
                          </div>
                          <h3 className="font-headline-md text-[20px] font-bold text-on-background">{s.name}</h3>
                        </div>
                        <button
                          onClick={() => save({ scheme: s, profileSnapshot: form })}
                          className="text-outline hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
                          title="Save scheme"
                        >
                          <span className="material-symbols-outlined">bookmark_add</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Benefits</h4>
                          {s.benefits?.length ? (
                            <ul className="font-body-md text-body-md text-on-background font-medium list-disc pl-5 space-y-1">
                              {s.benefits.map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          ) : null}
                        </div>
                        <div>
                          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Why Eligible?</h4>
                          <p className="font-body-md text-body-md text-on-background">{s.whyEligible}</p>
                        </div>
                      </div>
                      {s.requiredDocuments?.length ? (
                        <div className="bg-surface-container-low rounded-lg p-4 mb-6">
                          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Required Documents</h4>
                          <div className="flex flex-wrap gap-2">
                            {s.requiredDocuments.map((doc, di) => (
                              <span key={di} className="px-3 py-1.5 bg-surface border border-outline-variant rounded-full font-label-sm text-label-sm text-on-surface flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-outline">description</span> {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {s.applicationProcess?.length ? (
                        <div className="bg-surface-container-low rounded-lg p-4 mb-6">
                          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Application Process</h4>
                          <ol className="font-body-md text-body-md text-on-background list-decimal pl-5 space-y-1">
                            {s.applicationProcess.map((step, si) => <li key={si}>{step}</li>)}
                          </ol>
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between border-t border-surface-variant pt-4 mt-4">
                        {s.officialWebsite ? (
                          <a className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1" href={s.officialWebsite} target="_blank" rel="noreferrer">
                            Official Website
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </a>
                        ) : <span />}
                        <button
                          onClick={() => save({ scheme: s, profileSnapshot: form })}
                          className="px-5 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:scale-[0.98] transition-transform shadow-sm"
                        >
                          Save Scheme
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
