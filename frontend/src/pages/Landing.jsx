import { Link } from "react-router-dom";
import logo from "../assets/civicsathi-logo.png";

export default function Landing() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-surface-variant">
        <div className="flex justify-between items-center px-6 py-3 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              alt="CivicSathi AI Logo"
              className="h-8 w-8 rounded-md object-contain"
              src={logo}
            />
            <span className="font-headline-md text-headline-md font-bold text-primary">CivicSathi AI</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#features">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">How it Works</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-primary font-label-md text-label-md hover:text-primary-container transition-colors">Sign In</Link>
            <Link to="/login" className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm transform hover:scale-[0.98]">Get Started</Link>
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="flex-grow pt-[72px]">
        {/* Hero Section */}
        <section className="hero-gradient relative pt-xl pb-xl px-gutter md:px-margin-desktop overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003d9b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="max-w-4xl mx-auto text-center z-10 space-y-lg relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-primary font-label-sm text-label-sm mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              Introducing CivicSathi 2.0
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background tracking-tight">
              Your AI Companion for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-container">Indian Civic Services</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Navigate government bureaucracy with effortless authority. CivicSathi translates complex procedures into simple, actionable steps using advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-sm">
              <Link to="/login" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all shadow-md transform hover:scale-[0.98] flex items-center justify-center gap-2">
                Get Started Free
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <button onClick={scrollToFeatures} className="bg-surface text-primary border border-outline-variant px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all transform hover:scale-[0.98] flex items-center justify-center gap-2">
                Learn More
              </button>
            </div>
          </div>
          {/* Hero Dashboard Mockup (Bento/Glass) */}
          <section id="features" aria-label="Features" className="mt-xl w-full max-w-5xl z-10 relative scroll-mt-24">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary-container/20 rounded-xl blur-xl"></div>
            <div className="glass-card rounded-xl p-md border border-white/60 relative overflow-hidden flex flex-col md:flex-row gap-gutter">
              {/* Left Panel: AI Summary */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <span className="font-headline-md text-headline-md text-on-surface">AI Assistant</span>
                </div>
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary-container"></div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-3">
                    "Based on your profile, you are eligible for the PM Kisan Yojana. I've prepared a checklist of 3 documents needed."
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm rounded">High Match</span>
                  </div>
                </div>
              </div>
              {/* Right Panel: Feature Snippets */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-surface-variant flex flex-col items-start gap-2">
                  <div className="p-2 bg-primary-container text-on-primary-container rounded-md">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">Document Vault</span>
                  <span className="text-xs text-on-surface-variant">3 pending updates</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-surface-variant flex flex-col items-start gap-2">
                  <div className="p-2 bg-secondary-container text-on-secondary-container rounded-md">
                    <span className="material-symbols-outlined">notifications</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">Alerts</span>
                  <span className="text-xs text-on-surface-variant">Deadline approaching</span>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <footer className="bg-surface-container-lowest border-t border-surface-variant py-md px-gutter mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              alt="CivicSathi Logo"
              className="h-6 w-6 rounded object-contain grayscale opacity-60"
              src={logo}
            />
            <span className="font-label-sm text-label-sm text-on-surface-variant">&copy; 2026 CivicSathi AI. Crafted by Arpit Sharma.</span>
          </div>
          <div className="flex gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </>
  );
}
