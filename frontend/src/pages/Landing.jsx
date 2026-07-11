import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/civicsathi-logo.png";
import { useLanguage } from "../context/LanguageContext";

const SIMULATIONS = {
  en: {
    passport: {
      query: "How do I apply for a fresh passport?",
      answer: "Applying for an Indian Passport requires online registration on the Passport Seva portal. You will need to upload address proof and date of birth proof, then schedule an in-person appointment at your nearest PSK/POPSK for biometric verification.",
      steps: [
        "Register on the official Passport Seva Online Portal.",
        "Fill out the online application form and pay the ₹1,500 fee.",
        "Book an appointment at the nearest Passport Seva Kendra (PSK).",
        "Attend the appointment with original documents.",
        "Police verification will be initiated at your permanent address."
      ],
      docs: ["Aadhaar Card", "Electricity Bill (Address Proof)", "10th Class Marksheet (Non-ECR Proof)", "Birth Certificate"],
      time: "15-20 Days",
      portal: { name: "Passport Seva Portal", url: "https://www.passportindia.gov.in" },
      confidence: 98
    },
    kisan: {
      query: "Am I eligible for PM-Kisan and how to register?",
      answer: "PM-Kisan is a central sector scheme providing income support of ₹6,000 per year to all landholding farmer families. You are eligible if you own cultivable land and are not an income tax payer or government employee.",
      steps: [
        "Visit PM-Kisan portal and click 'New Farmer Registration'.",
        "Enter your Aadhaar number, mobile number, and select your state.",
        "Fill in landholding details (survey number, Khasra number, area).",
        "Upload land documents, Aadhaar copy, and bank passbook.",
        "Submit. Local authorities will verify and release installments."
      ],
      docs: ["Land Registration Documents", "Aadhaar Card", "Bank Passbook", "Mobile linked with Aadhaar"],
      time: "30-45 Days (Approval)",
      portal: { name: "PM-Kisan Portal", url: "https://pmkisan.gov.in" },
      confidence: 95
    },
    complaint: {
      query: "Report a massive pothole on the main road in my sector.",
      answer: "Filing a civic complaint for public road repairs requires routing to your local Municipal Corporation. I've classified this under public works and mapped it to your local Ward Officer for fast-track resolution.",
      steps: [
        "Select 'Pothole/Road Repair' under Public Works.",
        "Upload a geo-tagged image of the road damage.",
        "Confirm municipal department and Ward number.",
        "Submit complaint to receive the grievance tracking ID.",
        "Track updates. Municipal SLA is 72 hours for critical roads."
      ],
      docs: ["Pothole Location/Ward No.", "Photo of Road Damage", "Contact Details"],
      time: "3 Days (SLA)",
      portal: { name: "CPGRAMS / Local Ward Portal", url: "https://pgportal.gov.in" },
      confidence: 92
    }
  },
  hi: {
    passport: {
      query: "मैं नए पासपोर्ट के लिए कैसे आवेदन करूं?",
      answer: "भारतीय पासपोर्ट के लिए आवेदन करने के लिए पासपोर्ट सेवा पोर्टल पर ऑनलाइन पंजीकरण आवश्यक है। आपको पते का प्रमाण और जन्म तिथि का प्रमाण अपलोड करना होगा, फिर बायोमेट्रिक सत्यापन के लिए अपने नजदीकी पीएसके/पीओपीएसके में अपॉइंटमेंट शेड्यूल करना होगा।",
      steps: [
        "आधिकारिक पासपोर्ट सेवा ऑनलाइन पोर्टल पर पंजीकरण करें।",
        "ऑनलाइन आवेदन पत्र भरें और ₹1,500 शुल्क का भुगतान करें।",
        "नजदीकी पासपोर्ट सेवा केंद्र (PSK) पर अपॉइंटमेंट बुक करें।",
        "मूल दस्तावेजों के साथ अपॉइंटमेंट में शामिल हों।",
        "आपके स्थायी पते पर पुलिस सत्यापन शुरू किया जाएगा।"
      ],
      docs: ["आधार कार्ड", "बिजली बिल (पते का प्रमाण)", "10वीं कक्षा की मार्कशीट (गैर-ईसीआर प्रमाण)", "जन्म प्रमाण पत्र"],
      time: "15-20 दिन",
      portal: { name: "पासपोर्ट सेवा पोर्टल", url: "https://www.passportindia.gov.in" },
      confidence: 98
    },
    kisan: {
      query: "क्या मैं पीएम-किसान के लिए पात्र हूं और पंजीकरण कैसे करूं?",
      answer: "पीएम-किसान एक केंद्रीय योजना है जो सभी भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 की आय सहायता प्रदान करती है। आप पात्र हैं यदि आपके पास कृषि योग्य भूमि है और आप आयकरदाता या सरकारी कर्मचारी नहीं हैं।",
      steps: [
        "पीएम-किसान पोर्टल पर जाएं और 'नया किसान पंजीकरण' पर क्लिक करें।",
        "अपना आधार नंबर, मोबाइल नंबर दर्ज करें और अपना राज्य चुनें।",
        "भूमि जोत का विवरण (सर्वेक्षण संख्या, खसरा संख्या, क्षेत्रफल) भरें।",
        "भूमि दस्तावेज, आधार कॉपी और बैंक पासबुक अपलोड करें।",
        "सबमिट करें। स्थानीय अधिकारी सत्यापन करेंगे और किस्तें जारी करेंगे।"
      ],
      docs: ["भूमि पंजीकरण दस्तावेज", "आधार कार्ड", "बैंक पासबुक", "आधार से लिंक मोबाइल नंबर"],
      time: "30-45 दिन (स्वीकृति)",
      portal: { name: "पीएम-किसान पोर्टल", url: "https://pmkisan.gov.in" },
      confidence: 95
    },
    complaint: {
      query: "मेरे सेक्टर की मुख्य सड़क पर एक बड़े गड्ढे की शिकायत दर्ज करें।",
      answer: "सड़क मरम्मत के लिए नागरिक शिकायत दर्ज करने के लिए इसे आपके स्थानीय नगर निगम को भेजना आवश्यक है। मैंने इसे लोक निर्माण के अंतर्गत वर्गीकृत किया है और त्वरित समाधान के लिए इसे आपके स्थानीय वार्ड अधिकारी को भेज दिया है।",
      steps: [
        "लोक निर्माण के अंतर्गत 'गड्ढा/सड़क मरम्मत' का चयन करें।",
        "सड़क क्षति की जियो-टैग की गई तस्वीर अपलोड करें।",
        "नगर निगम विभाग और वार्ड संख्या की पुष्टि करें।",
        "ट्रैकिंग आईडी प्राप्त करने के लिए शिकायत दर्ज करें।",
        "अपडेट ट्रैक करें। मुख्य सड़कों के लिए नगर निगम का समय 72 घंटे है।"
      ],
      docs: ["गड्ढे का स्थान/वार्ड नंबर", "सड़क क्षति की फोटो", "संपर्क विवरण"],
      time: "3 दिन (एसएलए)",
      portal: { name: "पीजीपोर्टल / स्थानीय वार्ड पोर्टल", url: "https://pgportal.gov.in" },
      confidence: 92
    }
  }
};

export default function Landing() {
  const { language, changeLanguage, t } = useLanguage();
  // Tracks active simulation demo key ('passport', 'kisan', 'complaint')
  const [activeSim, setActiveSim] = useState("passport");
  // Holds output string loaded by typewriter effect
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const typingTimerRef = useRef(null);

  const activeLangSimulations = SIMULATIONS[language] || SIMULATIONS.en;
  const currentSimData = activeLangSimulations[activeSim] || SIMULATIONS.en[activeSim];

  // Typewriter effect simulation to mock interactive AI response generation on the landing page
  useEffect(() => {
    // Clear previous timers before starting new type cycle
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    setTypedText("");
    setIsTyping(true);
    setShowResult(false);

    const targetText = currentSimData.answer;
    let index = 0;
    
    // Quick delay before starting to type
    const delayStart = setTimeout(() => {
      typingTimerRef.current = setInterval(() => {
        if (index < targetText.length) {
          setTypedText((prev) => prev + targetText.charAt(index));
          index++;
        } else {
          clearInterval(typingTimerRef.current);
          setIsTyping(false);
          setShowResult(true);
        }
      }, 15); // Fast typing speed
    }, 400);

    return () => {
      clearTimeout(delayStart);
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [activeSim, language, currentSimData.answer]);

  // Performs smooth window scrolling transitions down to targeted sections
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/50 shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              alt="CivicSathi AI Logo"
              className="h-9 w-9 rounded-lg object-contain"
              src={logo}
            />
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">CivicSathi AI</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <button onClick={() => scrollToSection("features")} className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">{t("features")}</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">{t("howItWorks")}</button>
            <button onClick={() => scrollToSection("testimonials")} className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">{t("citizenStories")}</button>
          </nav>
          <div className="flex items-center gap-4">
            {/* Language toggle — header level */}
            <div className="flex items-center bg-surface-container-high p-1 rounded-lg">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === "en" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("hi")}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === "hi" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                हिं
              </button>
            </div>
            
            <Link to="/login" className="text-primary font-label-md text-label-md hover:text-primary-container transition-colors px-3 py-2 rounded-md hover:bg-surface-container-low">{t("signIn")}</Link>
            <Link to="/login" className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all shadow-md hover:shadow-lg transform active:scale-95">{t("getStarted")}</Link>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-[72px]">
        {/* Hero Section */}
        <section className="hero-gradient relative pt-xl pb-xl px-gutter md:px-margin-desktop overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003d9b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="max-w-5xl mx-auto text-center z-10 space-y-md relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/60 text-primary font-label-sm text-label-sm mb-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              {t("introducingTitle")}
            </div>
            
            <h1 className="font-display-lg text-display-lg text-on-background tracking-tight leading-[1.1] max-w-4xl mx-auto">
              {t("heroTitleLine1")} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary-container">
                {t("heroTitleLine2")}
              </span>
            </h1>
            
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed pt-2">
              {t("heroSubtext")}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
              <Link to="/login" className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all shadow-md hover:shadow-lg transform active:scale-95 flex items-center justify-center gap-2">
                {t("startForFree")}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <button onClick={() => scrollToSection("interactive-demo")} className="w-full sm:w-auto bg-white text-primary border border-outline-variant px-8 py-3.5 rounded-lg font-label-md text-label-md hover:bg-surface-container-low hover:border-outline transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                {t("tryLiveDemo")}
              </button>
            </div>
            
            <p className="font-label-sm text-label-sm text-on-surface-variant/80 pt-2">
              {t("heroBottomNotes")}
            </p>
          </div>

          {/* Interactive Playground / Live Preview Container */}
          <div id="interactive-demo" className="mt-xl w-full max-w-5xl z-10 relative scroll-mt-24">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-secondary-container/30 rounded-2xl blur-xl opacity-85"></div>
            
            <div className="ai-glass-card rounded-2xl border border-white/60 relative overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
              {/* Header Tab Panel */}
              <div className="border-b border-surface-variant/60 bg-surface-container/40 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[28px] ai-pulse">smart_toy</span>
                  <div>
                    <h3 className="font-headline-md text-[16px] text-on-surface font-semibold">{t("sandboxTitle")}</h3>
                    <p className="text-xs text-on-surface-variant">{t("sandboxSubtitle")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveSim("passport")}
                    className={`px-4 py-2 rounded-lg font-label-md text-xs transition-all ${
                      activeSim === "passport"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant/80"
                    }`}
                  >
                    {language === "hi" ? "नया पासपोर्ट" : "Fresh Passport"}
                  </button>
                  <button
                    onClick={() => setActiveSim("kisan")}
                    className={`px-4 py-2 rounded-lg font-label-md text-xs transition-all ${
                      activeSim === "kisan"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant/80"
                    }`}
                  >
                    {language === "hi" ? "पीएम-किसान योजना" : "PM-Kisan Scheme"}
                  </button>
                  <button
                    onClick={() => setActiveSim("complaint")}
                    className={`px-4 py-2 rounded-lg font-label-md text-xs transition-all ${
                      activeSim === "complaint"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant/80"
                    }`}
                  >
                    {language === "hi" ? "सड़क के गड्ढे की शिकायत" : "Road Pothole Complaint"}
                  </button>
                </div>
              </div>

              {/* Chat Simulation Area */}
              <div className="flex-grow p-6 flex flex-col justify-between gap-6">
                <div className="space-y-6">
                  {/* User Question */}
                  <div className="flex gap-4 justify-end">
                    <div className="bg-primary/10 text-primary border border-primary/20 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-sm">
                      <p className="text-sm font-medium">{currentSimData.query}</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {language === "hi" ? "आप" : "You"}
                    </div>
                  </div>

                  {/* AI Response Stream */}
                  <div className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary font-bold text-sm shrink-0 border border-secondary-container/50">
                      {language === "hi" ? "एआई" : "AI"}
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none border border-outline-variant/60 p-5 max-w-[85%] shadow-sm space-y-4">
                      {/* Typing indicator or Typewriter body */}
                      <div>
                        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                          {typedText}
                          {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse">|</span>}
                        </p>
                      </div>

                      {/* Structured Details Box - Shows only after typing completes */}
                      {showResult && (
                        <div className="pt-4 border-t border-surface-variant/50 space-y-4 animate-fade-in">
                          {/* Stepper Steps */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">{t("sandboxRequiredActionPlan")}</h4>
                            <ol className="space-y-2.5">
                              {currentSimData.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-3 text-xs text-on-surface-variant">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                                    {idx + 1}
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Document Checklist Snippet */}
                          <div className="space-y-2 bg-surface-container-low rounded-xl p-4 border border-outline-variant/50">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">check_box</span>
                              {t("sandboxDocChecklist")}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {currentSimData.docs.map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant">
                                  <span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
                                  <span>{doc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Portal & Timelines Banner */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-on-surface">{t("sandboxOfficialPortal")}</span>
                              <a
                                href={currentSimData.portal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-0.5"
                              >
                                {currentSimData.portal.name}
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                              </a>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 bg-surface-container-high rounded-full font-medium text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {currentSimData.time}
                              </span>
                              <span className="px-2.5 py-1 bg-tertiary-container/10 text-tertiary border border-tertiary-container/30 rounded-full font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">bolt</span>
                                {currentSimData.confidence}% {language === "hi" ? "सटीकता" : "Match"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Input box */}
                <div className="border-t border-surface-variant/40 pt-4 flex gap-2">
                  <div className="flex-grow bg-white border border-outline-variant/60 rounded-xl px-4 py-3 text-xs text-on-surface-variant/80 flex items-center gap-2 shadow-inner">
                    <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                    <span>{t("sandboxInputText")}</span>
                  </div>
                  <Link to="/login" className="bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-label-md hover:bg-primary-container shadow-md flex items-center gap-1.5 shrink-0 transition-colors">
                    <span>{t("sandboxButtonTryQuery")}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Bento Section */}
        <section id="features" className="py-xl px-gutter md:px-margin-desktop bg-surface-container-lowest border-t border-b border-surface-variant/30 scroll-mt-12">
          <div className="max-w-7xl mx-auto space-y-xl">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-headline-lg text-headline-lg text-on-background tracking-tight">
                {t("featuresTitle")}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {t("featuresSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Feature 1: AI Civic Assistant (Large 3-col) */}
              <div className="md:col-span-3 bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl inline-block">
                    <span className="material-symbols-outlined text-[28px]">chat</span>
                  </div>
                  <h3 className="font-headline-md text-on-surface">{t("assistant")}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {language === "hi" 
                      ? "किसी भी केंद्रीय या राज्य स्तर की नागरिक प्रक्रियाओं के बारे में सहजता से बातचीत करें। बिना किसी तकनीकी जटिलता के समय सीमा, शुल्क और आवश्यकताओं की जानकारी प्राप्त करें।"
                      : "Have natural conversations about any central or state level civic procedures. Gets details on timelines, fees, and requirements with zero jargon."
                    }
                  </p>
                </div>
                <div className="pt-6 border-t border-surface-variant/50 mt-6 flex justify-between items-center">
                  <span className="text-xs font-semibold text-primary">{language === "hi" ? "विस्तृत बातचीत" : "Detailed Conversations"}</span>
                  <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded">{language === "hi" ? "सक्रिय" : "Active"}</span>
                </div>
              </div>

              {/* Feature 2: Scheme Eligibility Finder (Large 3-col) */}
              <div className="md:col-span-3 bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="space-y-4">
                  <div className="p-3 bg-secondary-container/10 text-secondary-container rounded-xl inline-block">
                    <span className="material-symbols-outlined text-[28px]">explore</span>
                  </div>
                  <h3 className="font-headline-md text-on-surface">{t("schemes")}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {language === "hi"
                      ? "अपने प्रोफाइल पैरामीटर—आयु, राज्य, व्यवसाय, आय स्तर और लिंग दर्ज करें और तुरंत उन पात्र केंद्रीय और राज्य सरकारी योजनाओं की सूची प्राप्त करें जो आपके लिए सबसे उपयुक्त हैं।"
                      : "Input your profile parameters—age, state, occupation, income level, and gender—to instantly receive a ranked list of eligible central and state government schemes."
                    }
                  </p>
                </div>
                <div className="pt-6 border-t border-surface-variant/50 mt-6 flex justify-between items-center">
                  <span className="text-xs font-semibold text-secondary-container">{language === "hi" ? "प्रोफ़ाइल-आधारित मिलान" : "Profile-based Matching"}</span>
                  <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded">{language === "hi" ? "उच्च सटीकता" : "High Match Accuracy"}</span>
                </div>
              </div>

              {/* Feature 3: Document Checklist (Medium 2-col) */}
              <div className="md:col-span-2 bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="p-3 bg-tertiary-container/10 text-tertiary-container rounded-xl inline-block">
                    <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
                  </div>
                  <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">{t("checklist")}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {language === "hi"
                      ? "आवेदन अस्वीकृत होने से बचने के लिए सेवा-विशिष्ट चेकलिस्ट बनाएं। जानें कि कौन से दस्तावेज़ अनिवार्य हैं।"
                      : "Generate service-specific checklists to prevent application rejection. Knows which docs are mandatory and matches rules."
                    }
                  </p>
                </div>
                <div className="pt-4 border-t border-surface-variant/40 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-tertiary-container">{language === "hi" ? "कार्रवाई योग्य सूची" : "Actionable Checklist"}</span>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_right_alt</span>
                </div>
              </div>

              {/* Feature 4: Notification Simplifier (Medium 2-col) */}
              <div className="md:col-span-2 bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl inline-block">
                    <span className="material-symbols-outlined text-[28px]">translate</span>
                  </div>
                  <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">{t("simplify")}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {language === "hi"
                      ? "महत्वपूर्ण समय सीमा, नियमों और आवश्यक कार्रवाइयों को अलग करने के लिए घने सरकारी आदेश या आधिकारिक पीडीएफ नोटिफिकेशन पेस्ट करें।"
                      : "Paste long, dense government orders or official PDF notifications to isolate critical deadlines, rules, and required actions."
                    }
                  </p>
                </div>
                <div className="pt-4 border-t border-surface-variant/40 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-primary">{language === "hi" ? "सरल भाषा में सारांश" : "Plain-Language Summary"}</span>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_right_alt</span>
                </div>
              </div>

              {/* Feature 5: Complaint Generator (Medium 2-col) */}
              <div className="md:col-span-2 bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="p-3 bg-error-container/20 text-error rounded-xl inline-block">
                    <span className="material-symbols-outlined text-[28px]">report_problem</span>
                  </div>
                  <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">{t("complaint")}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {language === "hi"
                      ? "किसी नागरिक समस्या का वर्णन करें या फ़ोटो अपलोड करें। एआई इसे सही विभाग और वार्ड अधिकारी को मैप करता है।"
                      : "Describe a civic issue or upload a photo. The AI maps it to the correct municipal department, priorities, and drafts a grievance body."
                    }
                  </p>
                </div>
                <div className="pt-4 border-t border-surface-variant/40 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-error">{language === "hi" ? "विभाग मैपिंग" : "Department Mapping"}</span>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_right_alt</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-xl px-gutter md:px-margin-desktop bg-background scroll-mt-12">
          <div className="max-w-5xl mx-auto space-y-xl">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-headline-lg text-headline-lg text-on-background tracking-tight">
                {t("howItWorksTitle")}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("howItWorksSubtitle")}
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="relative">
              {/* Stepper connecting line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-outline-variant/50 hidden md:block md:left-1/2 md:-ml-[1px]"></div>
              
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center gap-gutter relative">
                  <div className="flex-1 md:text-right hidden md:block">
                    <h3 className="font-headline-md text-[18px] text-primary">{t("step1Title")}</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm ml-auto mt-1">
                      {t("step1Desc")}
                    </p>
                  </div>
                  <div className="z-10 h-14 w-14 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                    1
                  </div>
                  <div className="flex-1 md:hidden">
                    <h3 className="font-headline-md text-[18px] text-primary">{t("step1Title")}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {t("step1Desc")}
                    </p>
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-center gap-gutter relative">
                  <div className="flex-1 hidden md:block"></div>
                  <div className="z-10 h-14 w-14 rounded-full bg-secondary-container/10 border-4 border-background flex items-center justify-center text-secondary font-bold text-lg shadow-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline-md text-[18px] text-secondary">{t("step2Title")}</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                      {t("step2Desc")}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-center gap-gutter relative">
                  <div className="flex-1 md:text-right hidden md:block">
                    <h3 className="font-headline-md text-[18px] text-tertiary">{t("step3Title")}</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm ml-auto mt-1">
                      {t("step3Desc")}
                    </p>
                  </div>
                  <div className="z-10 h-14 w-14 rounded-full bg-tertiary-container/10 border-4 border-background flex items-center justify-center text-tertiary font-bold text-lg shadow-sm">
                    3
                  </div>
                  <div className="flex-1 md:hidden">
                    <h3 className="font-headline-md text-[18px] text-tertiary">{t("step3Title")}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {t("step3Desc")}
                    </p>
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col md:flex-row items-center gap-gutter relative">
                  <div className="flex-1 hidden md:block"></div>
                  <div className="z-10 h-14 w-14 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline-md text-[18px] text-primary">{t("step4Title")}</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                      {t("step4Desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Statistics */}
        <section className="py-lg bg-primary text-on-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center relative z-10">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-fixed">{t("stats1Val")}</p>
              <p className="text-xs uppercase tracking-wider text-on-primary-container">{t("stats1Label")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-fixed">{t("stats2Val")}</p>
              <p className="text-xs uppercase tracking-wider text-on-primary-container">{t("stats2Label")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-fixed">{t("stats3Val")}</p>
              <p className="text-xs uppercase tracking-wider text-on-primary-container">{t("stats3Label")}</p>
            </div>
          </div>
        </section>

        {/* Personas / Testimonials Section */}
        <section id="testimonials" className="py-xl px-gutter md:px-margin-desktop bg-surface-container-lowest scroll-mt-12">
          <div className="max-w-6xl mx-auto space-y-xl">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-headline-lg text-headline-lg text-on-background tracking-tight">
                {t("testimonialsTitle")}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("testimonialsSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Persona 1 */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                <p className="font-body-md text-on-surface-variant italic leading-relaxed">
                  {language === "hi"
                    ? "\"मैं विदेश में पढ़ाई के लिए नए पासपोर्ट के लिए आवेदन करना चाहती थी। आधिकारिक वेबसाइट के निर्देश बहुत जटिल लग रहे थे। सिविकसाथी ने छात्रों के लिए मान्य पते के प्रमाणों की सूची दी और मुझे अपॉइंटमेंट पोर्टल का सीधा लिंक प्रदान किया। मेरे कई दिनों की रिसर्च बच गई।\""
                    : "\"I wanted to apply for a fresh passport to study abroad. The official website instructions felt so complicated. CivicSathi listed exactly which forms of address proof were valid for students and gave me a direct link to the booking portal. Saved me days of research.\""
                  }
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    PN
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">{language === "hi" ? "प्रिया नायर" : "Priya Nair"}</h4>
                    <p className="text-xs text-on-surface-variant">{language === "hi" ? "छात्रा · नई दिल्ली" : "Student · New Delhi"}</p>
                  </div>
                </div>
              </div>

              {/* Persona 2 */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                <p className="font-body-md text-on-surface-variant italic leading-relaxed">
                  {language === "hi"
                    ? "\"एक सेवानिवृत्त शिक्षिका के रूप में, बार-बार सरकारी समाचार खोजना थका देने वाला काम था। सिविकसाथी ने वरिष्ठ नागरिकों की स्वास्थ्य योजनाओं को सरल बनाया, सेकंडों में मेरी पात्रता की गणना की, और उन प्रमाणपत्रों को चिह्नित किया जो मुझे केंद्र में लाने आवश्यक थे।\""
                    : "\"As a retired teacher, searching through government updates was tiring. CivicSathi simplified the new senior citizen healthcare schemes, calculated my eligibility in seconds, and flagged the certificates I needed to bring to the center.\""
                  }
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-secondary-container/20 text-secondary-container flex items-center justify-center font-bold text-sm">
                    SD
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">{language === "hi" ? "सुनीता देशमुख" : "Sunita Deshmukh"}</h4>
                    <p className="text-xs text-on-surface-variant">{language === "hi" ? "सेवानिवृत्त शिक्षिका · पुणे" : "Retired Teacher · Pune"}</p>
                  </div>
                </div>
              </div>

              {/* Persona 3 */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                <p className="font-body-md text-on-surface-variant italic leading-relaxed">
                  {language === "hi"
                    ? "\"हमारे पड़ोस में कचरा जमा होने की बड़ी समस्या थी। मुझे नहीं पता था कि कौन सा विभाग इसे संभालता है। मैंने सिविकसाथी पर फोटो अपलोड किया, इसने शिकायत का मसौदा तैयार किया और सीधे वार्ड अधिकारी को भेज दिया। यह ४८ घंटों के भीतर साफ हो गया।\""
                    : "\"There was a major garbage accumulation issue in our neighborhood. I didn't know which municipal desk handled waste management. I uploaded a photo on CivicSathi, and it automatically generated the complaint text and directed it to the correct ward officer. It got cleaned up within 48 hours.\""
                  }
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-tertiary-container/10 text-tertiary-container flex items-center justify-center font-bold text-sm">
                    AS
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">{language === "hi" ? "अमित सेन" : "Amit Sen"}</h4>
                    <p className="text-xs text-on-surface-variant">{language === "hi" ? "सक्रिय निवासी · कोलकाता" : "Active Resident · Kolkata"}</p>
                  </div>
                </div>
              </div>

              {/* Persona 4 */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                <p className="font-body-md text-on-surface-variant italic leading-relaxed">
                  {language === "hi"
                    ? "\"ताल्लुका कार्यालय के चक्कर काटे बिना मैंने अपनी कृषि योजनाओं के विकल्पों को समझा। दस्तावेज़ चेकलिस्ट ने मुझे बताया कि पंजीकरण करने से पहले मेरा भूमि रिकॉर्ड सर्वेक्षण नंबर आवश्यक था। मराठी/हिंदी में यह अत्यंत सहायक था।\""
                    : "\"Understood my agricultural scheme options without going to the taluka office multiple times. The checklist feature told me that my land record survey number was necessary before registering. Very helpful in Marathi.\""
                  }
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    RP
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">{language === "hi" ? "रमेश पटेल" : "Ramesh Patel"}</h4>
                    <p className="text-xs text-on-surface-variant">{language === "hi" ? "किसान · गुजरात" : "Farmer · Gujarat"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-xl px-gutter md:px-margin-desktop bg-background text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#003d9b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="max-w-4xl mx-auto z-10 space-y-lg relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/10 to-secondary-container/10 rounded-2xl blur-xl"></div>
            <div className="glass-card rounded-2xl p-md border border-white/60 relative overflow-hidden shadow-xl space-y-md py-xl px-md max-w-3xl mx-auto">
              <h2 className="font-display-lg text-headline-lg font-bold text-on-background tracking-tight">
                {t("ctaTitle")}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
                {t("ctaDesc")}
              </p>
              <div className="pt-sm flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login" className="bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all shadow-md transform active:scale-95 flex items-center justify-center gap-2">
                  {t("getStarted")}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <button onClick={() => scrollToSection("features")} className="bg-white text-primary border border-outline-variant px-8 py-3.5 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-all transform active:scale-95">
                  {t("seeFeatures")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-variant py-md px-gutter mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              alt="CivicSathi Logo"
              className="h-6 w-6 rounded object-contain grayscale opacity-60"
              src={logo}
            />
            <span className="font-label-sm text-label-sm text-on-surface-variant">&copy; 2026 CivicSathi AI. Crafted by Arpit Sharma. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
