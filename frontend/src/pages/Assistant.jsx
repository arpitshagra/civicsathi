// Feature 1 — AI Civic Assistant. POST /api/chat
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { ChatAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import ConfidenceBadge from "../components/ConfidenceBadge";

export default function Assistant() {
  // message input state
  const [message, setMessage] = useState("");
  // tracks conversation thread ID to maintain state across turns
  const [chatId, setChatId] = useState(null);
  
  // hooks up the custom API runner for sending messages
  const { data, loading, error, run } = useApi(ChatAPI.send);

  // Triggers assistant answer generation
  const ask = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;
    const res = await run({ message, chatId });
    // Save chatId returned from backend to persist conversation thread
    if (res?.chatId) setChatId(res.chatId);
  };

  // Static prompt suggestions displayed inside welcome card
  const suggestions = [
    {
      icon: "article",
      title: "Renew Passport",
      desc: "What are the steps to renew an expired passport?",
    },
    {
      icon: "currency_rupee",
      title: "PM Kisan Scheme",
      desc: "Check eligibility for PM Kisan Samman Nidhi.",
    },
    {
      icon: "pending_actions",
      title: "Track Application",
      desc: "Status of grievance ID #GRV-2023-892",
    },
    {
      icon: "file_copy",
      title: "Aadhaar Update",
      desc: "Required documents to change address.",
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-screen relative bg-surface-container-lowest">
      {/* Subtle Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Header */}
      <div className="px-8 py-6 border-b border-outline-variant/20 bg-surface/50 backdrop-blur-md z-10 flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Administrative Assistant</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Ask questions about schemes, processes, or track your applications.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-tertiary-container ai-pulse"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">System Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth" id="chat-container">
        {/* Welcome Message */}
        <div className="flex gap-4 max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined" data-icon="smart_toy">smart_toy</span>
          </div>
          <div className="bg-surface glass-panel rounded-2xl rounded-tl-none p-5 shadow-sm border border-outline-variant/20 w-full">
            <p className="font-body-md text-body-md text-on-background mb-4">Hello. I am the CivicSathi Administrative AI. How can I assist you with government services today?</p>
            {/* Suggested Prompts Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {suggestions.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setMessage(s.desc)}
                  className="text-left p-3 rounded-xl border border-outline-variant/30 hover:border-primary hover:bg-surface-container-low transition-colors group flex items-start gap-3"
                >
                  <span className="material-symbols-outlined text-primary/70 group-hover:text-primary mt-0.5" data-icon={s.icon}>{s.icon}</span>
                  <div>
                    <span className="block font-label-md text-label-md text-on-surface font-semibold">{s.title}</span>
                    <span className="block font-label-sm text-label-sm text-on-surface-variant mt-1">{s.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State (Thinking) */}
        {loading && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined ai-pulse" data-icon="smart_toy">smart_toy</span>
            </div>
            <div className="bg-surface glass-panel rounded-2xl rounded-tl-none p-4 shadow-sm border border-outline-variant/20 flex items-center gap-2">
              <Loader label="Thinking…" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <ErrorBanner message={error} />
          </div>
        )}

        {/* AI Response (Complex Structure) */}
        {data && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined" data-icon="smart_toy">smart_toy</span>
            </div>
            <div className="bg-surface glass-panel rounded-2xl rounded-tl-none p-6 shadow-md border-t-4 border-t-primary w-full relative overflow-hidden">
              {/* AI Insight Gradient Border Effect (Subtle) */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary-container to-primary"></div>

              {/* Confidence Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" data-icon="auto_awesome">auto_awesome</span>
                  <span className="font-label-md text-label-md font-bold text-primary">Verified Administrative Procedure</span>
                </div>
                <ConfidenceBadge value={data.confidence} />
              </div>

              {/* Summary */}
              {data.answer && (
                <p className="font-body-md text-body-md text-on-background mb-6 leading-relaxed whitespace-pre-line">
                  {data.answer}
                </p>
              )}

              {/* Bento Grid for Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Required Documents */}
                {data.requiredDocuments?.length > 0 && (
                  <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-sm">
                    <h3 className="font-label-md text-label-md font-bold text-on-background mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary" data-icon="folder_open">folder_open</span>
                      Required Documents
                    </h3>
                    <ul className="space-y-2">
                      {data.requiredDocuments.map((doc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-tertiary-container text-[18px] mt-0.5" data-icon="check">check</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Time & Cost */}
                {data.processingTime && (
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-label-md text-label-md font-bold text-on-background mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" data-icon="schedule">schedule</span>
                        Processing Time
                      </h3>
                      <p className="font-body-md text-body-md font-bold text-primary">{data.processingTime}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Process Steps */}
              {data.steps?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-label-md text-label-md font-bold text-on-background mb-4">Application Process</h3>
                  <ol className="space-y-3">
                    {data.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm font-bold shrink-0 shadow-sm">{i + 1}</div>
                        <span className="font-body-md text-body-md text-on-surface-variant pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Official Portals */}
              {data.officialPortals?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-outline-variant/20">
                  {data.officialPortals.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]" data-icon="open_in_new">open_in_new</span>
                      {p.name || p.url}
                    </a>
                  ))}
                </div>
              )}

              {/* Uncertainty Note */}
              {data.uncertaintyNote && (
                <div className="mt-6 pt-4 border-t border-outline-variant/20">
                  <p className="bg-error-container text-on-error-container rounded-lg px-4 py-3 font-body-sm text-body-sm flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] mt-0.5" data-icon="warning">warning</span>
                    <span>{data.uncertaintyNote}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spacer for input area */}
        <div className="h-24"></div>
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest to-transparent z-20">
        <form onSubmit={ask} className="max-w-4xl mx-auto relative">
          <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-2 flex items-end gap-2 glass-panel">
            <button type="button" className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-colors shrink-0">
              <span className="material-symbols-outlined" data-icon="attach_file">attach_file</span>
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                // Submit form when hitting Enter key without the Shift key pressed
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(e);
                }
              }}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[48px] py-3 px-2 text-body-md font-body-md text-on-background placeholder:text-on-surface-variant/50"
              placeholder="Ask about administrative procedures, track applications..."
              rows="1"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="p-3 bg-primary text-on-primary hover:bg-primary/90 rounded-xl transition-colors shrink-0 shadow-sm mb-0.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined" data-icon="send">send</span>
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="font-label-sm text-[10px] text-on-surface-variant">CivicSathi AI can make mistakes. Always verify critical information on official government portals.</span>
          </div>
        </form>
      </div>
    </main>
  );
}
