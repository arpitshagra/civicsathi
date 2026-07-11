import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { CivicPathAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

const PRESET_GOALS = [
  { id: "restaurant", title: "Open a Restaurant", icon: "restaurant", text: "🍽 Open Restaurant" },
  { id: "business", title: "Start a Business", icon: "business_center", text: "🏢 Start Business" },
  { id: "home", title: "Buy My First Home", icon: "home", text: "🏠 Buy a Home" },
  { id: "study", title: "Study Abroad", icon: "school", text: "🎓 Study Abroad" },
  { id: "farmer", title: "Become a Farmer", icon: "agriculture", text: "🚜 Farmer" },
  { id: "ev", title: "Buy an EV / Vehicle", icon: "electric_car", text: "🚗 Buy EV" },
  { id: "passport", title: "Apply for Passport", icon: "flight_takeoff", text: "✈ Passport" },
  { id: "marriage", title: "Register Marriage", icon: "favorite", text: "💍 Marriage" },
  { id: "factory", title: "Build a Factory", icon: "factory", text: "🏭 Build Factory" }
];

export default function CivicPath() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState("");
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState("select"); // "select" | "questions" | "loading"
  const [loadingMsg, setLoadingMsg] = useState("");

  const { data: missions, run: loadMissions, loading: loadingMissions } = useApi(CivicPathAPI.list);
  const { run: getQuestions, loading: loadingQuestions, error: errorQuestions } = useApi(CivicPathAPI.questions);
  const { run: generateRoadmap, error: errorGenerate } = useApi(CivicPathAPI.generate);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleSelectPreset = async (presetTitle) => {
    setGoal(presetTitle);
    await fetchQuestions(presetTitle);
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    await fetchQuestions(goal);
  };

  const fetchQuestions = async (targetGoal) => {
    try {
      setStep("questions");
      const res = await getQuestions({ goal: targetGoal });
      if (res && res.questions) {
        setQuestions(res.questions);
        const initialAnswers = {};
        res.questions.forEach((q) => {
          initialAnswers[q.id] = "";
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerChange = (id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setStep("loading");
    setLoadingMsg("Initializing regulatory AI engines...");

    const messages = [
      "Analyzing federal & state legal requirements...",
      "Mapping required licenses and certificates...",
      "Calculating cost structures & processing time...",
      "Structuring timeline dependencies...",
      "Matching with relevant subsidy programs..."
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingMsg(messages[msgIdx]);
        msgIdx++;
      }
    }, 2500);

    try {
      const res = await generateRoadmap({ goal, answers });
      clearInterval(interval);
      if (res && res.id) {
        navigate(`/civicpath/mission/${res.id}`);
      } else {
        setStep("questions");
      }
    } catch (err) {
      clearInterval(interval);
      setStep("questions");
    }
  };

  const renderSelectStep = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Hero Tagline */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background font-bold">
            CivicPath AI
          </h2>
          <p className="font-headline-md text-headline-md text-primary font-medium">
            Tell us your goal. We'll build your complete government roadmap.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            From licenses and tax registration to subsidies and documents: discover every step required by Indian local, state, and central governments.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleGoalSubmit} className="glass-panel ambient-shadow rounded-full flex items-center p-2 pl-6 pr-3 focus-within:ring-2 ring-primary transition-all">
            <span className="material-symbols-outlined text-outline mr-3">explore</span>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline-variant py-3 outline-none"
              placeholder="e.g. 'I want to open a cafe in Bangalore' or 'Buy first EV'..."
              required
            />
            <button
              type="submit"
              className="bg-primary text-on-primary rounded-full w-12 h-12 flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Presets Grid */}
        <div className="space-y-4">
          <h3 className="font-headline-md text-headline-md text-on-background text-center">Common Goals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {PRESET_GOALS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.title)}
                className="glass-panel rounded-xl p-5 hover-scale flex flex-col items-center justify-center text-center gap-3 border border-outline-variant/30 text-on-surface group hover:border-primary transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
                  <span className="material-symbols-outlined text-[24px]">{preset.icon}</span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-sm truncate w-full">{preset.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Missions */}
        {missions && missions.length > 0 && (
          <div className="pt-6 border-t border-outline-variant/20 space-y-4">
            <h3 className="font-headline-md text-headline-md text-on-background">Your Active Missions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((m) => (
                <Link
                  key={m.id}
                  to={`/civicpath/mission/${m.id}`}
                  className="glass-panel rounded-xl p-5 border border-outline-variant/30 flex items-center justify-between hover:border-primary transition-colors hover:shadow-sm"
                >
                  <div className="space-y-1 flex-1 pr-4">
                    <h4 className="font-label-md text-label-md font-bold text-on-surface truncate">
                      {m.missionName}
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant text-xs truncate">
                      Goal: {m.goal}
                    </p>
                    <div className="flex gap-4 pt-2 items-center">
                      <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${m.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-primary">{m.progress}%</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">arrow_forward_ios</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionsStep = () => {
    if (loadingQuestions) {
      return <Loader label="AI is generating customization questions..." />;
    }

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
          <button
            onClick={() => setStep("select")}
            className="text-on-surface hover:text-primary transition-colors p-2 hover:bg-surface-container-high rounded-full"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-background">Roadmap Personalization</h2>
            <p className="text-xs text-on-surface-variant font-medium">Goal: "{goal}"</p>
          </div>
        </div>

        {errorQuestions && <ErrorBanner message={errorQuestions} />}

        {questions && (
          <form onSubmit={handleGenerate} className="glass-panel rounded-xl p-6 md:p-8 space-y-6 border border-outline-variant/30">
            {questions.map((q) => (
              <div key={q.id} className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">
                  {q.label}
                </label>
                {q.type === "select" ? (
                  <select
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    required
                  >
                    <option value="">Select option</option>
                    {q.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={q.type === "number" ? "number" : "text"}
                    value={answers[q.id] || ""}
                    placeholder={q.placeholder || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                )}
              </div>
            ))}

            {errorGenerate && <ErrorBanner message={errorGenerate} />}

            <button
              type="submit"
              className="w-full h-[48px] bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:scale-[0.98] transition-transform shadow-md flex justify-center items-center gap-2 font-bold mt-4"
            >
              <span className="material-symbols-outlined">magic_button</span>
              Build Interactive Roadmap
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderLoadingStep = () => {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center text-primary relative">
          <span className="material-symbols-outlined text-[48px] animate-spin">autorenew</span>
          <span className="material-symbols-outlined text-[32px] absolute text-tertiary">explore</span>
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="font-headline-md text-headline-md text-on-background font-bold">Creating Your CivicPath</h3>
          <p className="font-body-md text-body-md text-primary font-semibold">{loadingMsg}</p>
          <p className="text-xs text-on-surface-variant">Please do not close this window. This can take up to a minute.</p>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      {step === "select" && renderSelectStep()}
      {step === "questions" && renderQuestionsStep()}
      {step === "loading" && renderLoadingStep()}
    </main>
  );
}
