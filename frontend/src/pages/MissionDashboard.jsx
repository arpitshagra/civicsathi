import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { CivicPathAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

export default function MissionDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: mission, run: loadMission, loading, error, setData: setMission } = useApi(
    useCallback(() => CivicPathAPI.get(id), [id])
  );

  const { run: updateMission } = useApi((payload) => CivicPathAPI.update(id, payload));
  const { run: deleteMission } = useApi(() => CivicPathAPI.remove(id));

  const [expandedStep, setExpandedStep] = useState(null);
  const [successOverlay, setSuccessOverlay] = useState(false);

  useEffect(() => {
    loadMission();
  }, [loadMission]);

  // Check if overlay should show (if progress hits 100%)
  useEffect(() => {
    if (mission && mission.progress === 100) {
      setSuccessOverlay(true);
    }
  }, [mission]);

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center p-6">
        <Loader label="Loading your CivicPath mission details..." />
      </main>
    );
  }

  if (error || !mission) {
    return (
      <main className="flex-grow max-w-2xl mx-auto p-6">
        <ErrorBanner message={error || "Failed to load mission details."} />
        <Link to="/civicpath" className="mt-4 inline-block text-primary hover:underline">
          &larr; Back to Goals
        </Link>
      </main>
    );
  }

  const steps = mission.steps || [];
  const documents = mission.documents || []; // array of uploaded/available document names
  const reminders = mission.reminders || [];
  const recommendations = mission.recommendations || [];

  // Helper: check if a step is locked
  const isStepLocked = (step) => {
    if (!step.prerequisites || step.prerequisites.length === 0) return false;
    // Step is locked if any prerequisite step is not "Completed"
    return step.prerequisites.some((prereqId) => {
      const prereqStep = steps.find((s) => s.id === prereqId);
      return !prereqStep || prereqStep.status !== "Completed";
    });
  };

  // Helper: get prerequisite titles for display
  const getPrerequisiteTitles = (prereqIds) => {
    return prereqIds
      .map((pid) => {
        const step = steps.find((s) => s.id === pid);
        return step ? step.title : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Handler: Update a step's status
  const handleStepStatusChange = async (stepId, newStatus) => {
    const updatedSteps = steps.map((s) => {
      if (s.id === stepId) {
        return { ...s, status: newStatus };
      }
      return s;
    });

    // Recalculate progress
    const completedCount = updatedSteps.filter((s) => s.status === "Completed").length;
    const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    const payload = {
      steps: updatedSteps,
      progress
    };

    // Optimistic UI update
    setMission((prev) => ({ ...prev, ...payload }));

    try {
      await updateMission(payload);
    } catch (err) {
      console.error("Failed to update step status:", err);
      // Reload on failure
      loadMission();
    }
  };

  // Handler: Mock upload a document
  const handleDocUpload = async (docName) => {
    if (documents.includes(docName)) return;

    const updatedDocs = [...documents, docName];
    const payload = { documents: updatedDocs };

    // Optimistic update
    setMission((prev) => ({ ...prev, documents: updatedDocs }));

    try {
      await updateMission(payload);
    } catch (err) {
      console.error("Failed to upload document:", err);
      loadMission();
    }
  };

  // Handler: Delete mission
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this mission? This cannot be undone.")) {
      try {
        await deleteMission();
        navigate("/civicpath");
      } catch (err) {
        console.error("Failed to delete mission:", err);
      }
    }
  };

  // Get all unique document types required across all steps
  const requiredDocsAll = Array.from(
    new Set(steps.flatMap((s) => s.requiredDocuments || []))
  );

  // Today's Checklist items: Unlocked, and Not Started or In Progress
  const todaysTasks = steps.filter((s) => !isStepLocked(s) && s.status !== "Completed");

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-md relative">
      
      {/* Success Confetti overlay */}
      {successOverlay && (
        <div className="fixed inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="glass-card max-w-md w-full p-8 text-center rounded-2xl border border-primary/20 space-y-6 relative shadow-2xl">
            <div className="w-20 h-20 bg-tertiary-container/30 rounded-full flex items-center justify-center mx-auto text-tertiary animate-bounce">
              <span className="material-symbols-outlined text-[48px]">workspace_premium</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-display-lg text-display-lg text-on-background font-bold">🎉 Congratulations!</h2>
              <h3 className="font-headline-md text-headline-md text-primary font-bold">Mission Completed</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Your mission <span className="font-semibold text-on-surface">"{mission.missionName}"</span> has been successfully accomplished!
              </p>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Completed In</span>
                  <span className="text-lg font-bold text-primary">{mission.estimatedTime}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Overall Cost</span>
                  <span className="text-lg font-bold text-primary">{mission.estimatedCost}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/civicpath"
                className="flex-1 py-3 border border-outline-variant hover:bg-surface-container-high rounded-xl font-label-md text-label-md text-on-surface transition-colors text-center active:scale-95"
              >
                Back to Goals
              </Link>
              <button
                onClick={() => setSuccessOverlay(false)}
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/95 transition-colors active:scale-95 font-semibold shadow-md"
              >
                View Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/civicpath"
            className="text-on-surface hover:text-primary transition-colors p-2 hover:bg-surface-container-high rounded-full shrink-0"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              CivicPath Roadmap
            </span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:font-headline-lg text-on-surface font-bold">
              {mission.missionName}
            </h1>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-error/30 text-error hover:bg-error-container hover:text-on-error-container rounded-lg font-label-md text-label-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 align-self-start md:align-self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          Abandon Mission
        </button>
      </div>

      {/* Mission Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Difficulty", value: mission.difficulty, color: "text-primary", icon: "offline_bolt" },
          { label: "Estimated Duration", value: mission.estimatedTime, color: "text-tertiary", icon: "calendar_today" },
          { label: "Estimated Cost", value: mission.estimatedCost, color: "text-secondary", icon: "payments" },
          { label: "Gov Benefits Claimable", value: mission.potentialBenefits, color: "text-success text-green-600", icon: "redeem" }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card rounded-xl p-4 flex items-center gap-3 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <span className="block text-xs text-on-surface-variant font-medium">{stat.label}</span>
              <span className={`text-base font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Interactive Steps List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Progress Tracker Panel */}
          <div className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex justify-between items-center text-label-md font-label-md text-on-surface-variant font-bold">
              <span>Overall Progress</span>
              <span className="text-primary font-bold">{mission.progress}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden border border-outline-variant/20">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${mission.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant font-medium pt-1">
              <span>{steps.filter((s) => s.status === "Completed").length} Steps Completed</span>
              <span>{steps.filter((s) => s.status !== "Completed").length} Steps Remaining</span>
            </div>
          </div>

          {/* Interactive Steps Nodes */}
          <div className="glass-card rounded-xl p-6 border border-outline-variant/30 space-y-6 relative">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary">alt_route</span>
              <h3 className="font-headline-md text-headline-md text-on-background font-bold">Interactive Roadmap Nodes</h3>
            </div>

            <div className="space-y-4">
              {steps.map((step, idx) => {
                const locked = isStepLocked(step);
                const expanded = expandedStep === step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`border rounded-xl transition-all duration-300 overflow-hidden bg-surface ${
                      locked
                        ? "border-outline-variant/20 bg-surface-container-lowest/50 opacity-80"
                        : expanded
                        ? "border-primary shadow-sm bg-surface-lowest"
                        : "border-outline-variant/30 hover:border-outline hover:shadow-xs"
                    }`}
                  >
                    
                    {/* Node Header Row */}
                    <div
                      onClick={() => !locked && setExpandedStep(expanded ? null : step.id)}
                      className={`p-4 flex items-center justify-between gap-4 select-none ${
                        locked ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Icon Indicator */}
                        <div className="shrink-0 flex items-center justify-center">
                          {locked ? (
                            <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                          ) : step.status === "Completed" ? (
                            <span className="material-symbols-outlined text-green-500 font-bold text-[22px]">check_circle</span>
                          ) : step.status === "In Progress" ? (
                            <span className="material-symbols-outlined text-primary text-[22px]">pending</span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-outline-variant"></span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className={`font-label-md text-label-md font-bold truncate ${
                            locked ? "text-outline" : "text-on-surface"
                          }`}>
                            {step.title}
                          </h4>
                          {locked && (
                            <span className="block text-[10px] text-error font-medium">
                              🔒 Locked: Requires {getPrerequisiteTitles(step.prerequisites)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {step.estimatedCost !== "₹0" && (
                          <span className="text-xs font-semibold bg-surface-container-high px-2.5 py-1 rounded text-on-surface-variant">
                            {step.estimatedCost}
                          </span>
                        )}
                        {!locked && (
                          <span className="material-symbols-outlined text-outline transition-transform duration-200">
                            {expanded ? "expand_less" : "expand_more"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Node Expanded Details */}
                    {expanded && !locked && (
                      <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/30 space-y-4 font-body-md text-body-md text-on-surface animate-fadeIn">
                        
                        <p className="text-sm leading-relaxed">{step.description}</p>
                        
                        <div className="bg-surface-container-low rounded-lg p-3 space-y-2 border border-outline-variant/10 text-xs">
                          <div>
                            <span className="font-semibold text-on-surface-variant">Why Required: </span>
                            <span className="text-on-surface">{step.whyRequired}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-outline-variant/10">
                            <div>
                              <span className="font-semibold text-on-surface-variant">Duration: </span>
                              <span>{step.estimatedTime}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-on-surface-variant">Cost: </span>
                              <span>{step.estimatedCost}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-on-surface-variant">Department: </span>
                              <span>{step.department}</span>
                            </div>
                          </div>
                        </div>

                        {/* Documents needed for this step */}
                        {step.requiredDocuments?.length > 0 && (
                          <div className="space-y-2">
                            <span className="block font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                              Required Documents
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {step.requiredDocuments.map((doc, dIdx) => {
                                const hasDoc = documents.includes(doc);
                                return (
                                  <span
                                    key={dIdx}
                                    className={`px-3 py-1.5 border rounded-full text-xs font-medium flex items-center gap-1 ${
                                      hasDoc
                                        ? "bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200"
                                        : "bg-surface border-outline-variant"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {hasDoc ? "verified" : "description"}
                                    </span>
                                    {doc}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Step action buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
                          {step.officialWebsite ? (
                            <a
                              href={step.officialWebsite}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                            >
                              Official Portal Link
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                          ) : (
                            <div />
                          )}

                          <div className="flex gap-2 w-full sm:w-auto">
                            {step.status !== "Completed" ? (
                              <>
                                {step.status !== "In Progress" && (
                                  <button
                                    onClick={() => handleStepStatusChange(step.id, "In Progress")}
                                    className="flex-1 sm:flex-none px-4 py-2 border border-primary text-primary hover:bg-primary-container/20 rounded-lg text-xs font-semibold active:scale-95"
                                  >
                                    Start Step
                                  </button>
                                )}
                                <button
                                  onClick={() => handleStepStatusChange(step.id, "Completed")}
                                  className="flex-1 sm:flex-none px-4 py-2 bg-primary text-on-primary rounded-lg text-xs hover:bg-primary/95 font-semibold shadow-sm active:scale-95"
                                >
                                  Complete Step
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleStepStatusChange(step.id, "Not Started")}
                                className="w-full sm:w-auto px-4 py-2 border border-outline-variant text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg text-xs font-semibold active:scale-95"
                              >
                                Re-open Step
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendations panel */}
          {recommendations.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <h3 className="font-headline-md text-headline-md text-on-background font-bold">Personalized AI Scheme Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-outline-variant/20 bg-surface-lowest relative overflow-hidden group hover:shadow-xs transition-shadow"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-container"></div>
                    <h4 className="font-label-md text-label-md font-bold text-primary mb-2 flex items-center justify-between">
                      {rec.name}
                      <span className="bg-primary/10 text-primary text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded">
                        Matched
                      </span>
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant text-xs leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Vault, Today Tasks, Reminders */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Today's Tasks checklist */}
          <div className="glass-card rounded-xl p-5 border border-outline-variant/30 space-y-4">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold border-b border-outline-variant/20 pb-2">
              Today's Tasks
            </h3>
            
            {todaysTasks.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant text-xs flex items-center gap-1.5 bg-surface-container-high/10 p-3 rounded-lg border border-outline-variant/10">
                <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
                All unlocked steps completed for today!
              </p>
            ) : (
              <div className="space-y-3">
                {todaysTasks.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-start gap-3 p-3 bg-surface border border-outline-variant/20 rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={t.status === "Completed"}
                      onChange={() => handleStepStatusChange(t.id, "Completed")}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <span className="block font-label-md text-label-md font-bold text-on-surface text-sm truncate">
                        {t.title}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant">
                        Status: {t.status === "In Progress" ? "In Progress" : "Not Started"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Document Vault Uploads */}
          <div className="glass-card rounded-xl p-5 border border-outline-variant/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-primary">folder_shared</span>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                Document Vault
              </h3>
            </div>

            {requiredDocsAll.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant text-xs">No documents required.</p>
            ) : (
              <div className="space-y-3 font-body-md text-body-md text-on-surface">
                {requiredDocsAll.map((doc, idx) => {
                  const available = documents.includes(doc);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-surface border border-outline-variant/20 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-medium text-on-surface truncate pr-2">{doc}</span>
                      
                      {available ? (
                        <span className="text-green-600 font-bold bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded flex items-center gap-0.5 shrink-0 border border-green-200">
                          <span className="material-symbols-outlined text-[14px]">done</span>
                          Available
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDocUpload(doc)}
                          className="px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded font-semibold transition-colors shrink-0 flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                          Upload
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Smart Reminders list */}
          {reminders.length > 0 && (
            <div className="glass-card rounded-xl p-5 border border-outline-variant/30 space-y-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold border-b border-outline-variant/20 pb-2">
                Smart Reminders
              </h3>
              <div className="space-y-3">
                {reminders.map((rem, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-950/30 rounded-lg flex items-start gap-2.5 text-xs text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px] text-yellow-600 shrink-0 mt-0.5">warning</span>
                    <div>
                      <span className="block font-semibold">{rem.title}</span>
                      <span className="block text-[10px] text-on-surface-variant">Due: {rem.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </main>
  );
}
