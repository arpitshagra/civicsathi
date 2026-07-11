import { createContext, useContext, useEffect, useState } from "react";
import { getLanguage, setLanguage } from "../lib/apiClient";

const LanguageContext = createContext(null);

const TRANSLATIONS = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    assistant: "AI Assistant",
    schemes: "Scheme Finder",
    checklist: "Doc Checklist",
    simplify: "Simplifier",
    complaint: "Complaint",
    profile: "Profile",
    logout: "Logout",
    administrativeAI: "Administrative AI",

    // Dashboard
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    quickActions: "Quick Actions",
    recentChats: "Recent Chats",
    recentComplaints: "Recent Complaints",
    generalQueries: "General queries",
    checkEligibility: "Check eligibility",
    prepareFiles: "Prepare files",
    draftLetters: "Draft letters",
    decodeNotices: "Decode notices",
    noRecentChats: "No recent chats found.",
    noRecentComplaints: "No recent complaints found.",
    viewAll: "View All",
    chatHistory: "Chat History",
    savedSchemes: "Saved Schemes",
    savedChecklists: "Saved Checklists",
    complaintHistory: "Complaint History",
    dashboardAssistQuery: "How can I assist you today?",
    dashboardAssistSub: "Ask me anything about government schemes, required documents, or drafting an official complaint.",
    dashboardSearchPlaceholder: "e.g. 'Am I eligible for PM-KISAN?' or 'Draft a letter to the municipal corporation...'",
    suggestHousing: "Find housing schemes",
    suggestAadhar: "Aadhaar update checklist",
    suggestWater: "Write water grievance",
    yourActivity: "Your Activity",
    totalChats: "Total Chats",
    totalSavedSchemes: "Saved Schemes",
    totalChecklists: "Checklists",
    totalComplaints: "Complaints",
    recentActivity: "Recent Activity",
    nothingYet: "Nothing yet.",
    aiConversation: "AI conversation",
    draftStatus: "Draft",
    untitledChat: "Untitled chat",
    untitledComplaint: "Untitled complaint",
    justNow: "Just now",
    yesterday: "Yesterday",
    mAgo: "m ago",
    hAgo: "h ago",

    // Landing Header
    signIn: "Sign In",
    getStarted: "Get Started",
    features: "Features",
    howItWorks: "How it Works",
    citizenStories: "Citizen Stories",
    
    // Landing Hero
    introducingTitle: "Introducing CivicSathi 2.0",
    heroTitleLine1: "Navigate Indian Bureaucracy",
    heroTitleLine2: "With Effortless Authority",
    heroSubtext: "CivicSathi translates complex legal rules, department details, and eligibility rules into plain-language guidance. Discover government schemes, prepare document checklists, and generate civic complaints in seconds.",
    startForFree: "Start For Free",
    tryLiveDemo: "Try Live Interactive Demo",
    heroBottomNotes: "Instant AI answers · 100% Secure via Firebase · Official Portal Links Provided",

    // Landing Sandbox
    sandboxTitle: "CivicSathi Live Sandbox",
    sandboxSubtitle: "Simulate structured responses in real-time",
    sandboxInputText: "Click on tabs above to change query simulation...",
    sandboxButtonTryQuery: "Try With Your Query",
    sandboxRequiredActionPlan: "Required Action Plan",
    sandboxDocChecklist: "Document Checklist",
    sandboxOfficialPortal: "Official Portal:",

    // Landing Features
    featuresTitle: "Designed to Simplify Government Interfaces",
    featuresSubtitle: "Gov portals are tedious. We offer five primary features focused on speed, validation, and clarity.",
    
    // Landing Stepper
    howItWorksTitle: "How CivicSathi Assists You",
    howItWorksSubtitle: "From query discovery to submission verification, the workflow is streamlined.",
    step1Title: "1. Create Profile",
    step1Desc: "Set up your profile with basic details like State, Age, Income level, and Occupation. All data is securely locked to your Google login.",
    step2Title: "2. Ask or Upload",
    step2Desc: "Ask questions, query schemes, paste notifications, or write complaint details. Upload geolocated images for road/waste reports.",
    step3Title: "3. AI Structuring & Validation",
    step3Desc: "The engine parses the query against national rule frameworks, flags documents needed, grades confidence, and simplifies complex guidelines.",
    step4Title: "4. Submit & Save",
    step4Desc: "Apply through provided official portal redirect buttons, download custom document checklists, track filed complaint history on your dashboard.",

    // Landing Stats
    stats1Val: "50+",
    stats1Label: "Indian Civic Services Covered",
    stats2Val: "10k+",
    stats2Label: "Citizens Assisted Locally",
    stats3Val: "98.7%",
    stats3Label: "AI Guideline Verification Accuracy",

    // Landing Testimonials
    testimonialsTitle: "Empowering Every Indian Citizen",
    testimonialsSubtitle: "See how different profiles find clarity using CivicSathi AI.",
    
    // Landing CTA
    ctaTitle: "Remove the Confusion from Government Services",
    ctaDesc: "Sign in with Google today to save chats, list eligible schemes, monitor complaint status, and generate custom checklists.",
    seeFeatures: "See Features",
  },
  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    assistant: "एआई सहायक",
    schemes: "योजना खोजक",
    checklist: "दस्तावेज़ चेकलिस्ट",
    simplify: "नोटीफिकेशन सरलीकरण",
    complaint: "शिकायत जनरेटर",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    administrativeAI: "प्रशासनिक एआई",

    // Dashboard
    goodMorning: "शुभ प्रभात",
    goodAfternoon: "नमस्कार (दोपहर)",
    goodEvening: "शुभ संध्या",
    quickActions: "त्वरित कार्रवाई",
    recentChats: "हालिया चैट",
    recentComplaints: "हालिया शिकायतें",
    generalQueries: "सामान्य प्रश्न",
    checkEligibility: "योग्यता जांचें",
    prepareFiles: "दस्तावेज़ तैयार करें",
    draftLetters: "पत्र का मसौदा तैयार करें",
    decodeNotices: "सूचनाओं को समझें",
    noRecentChats: "कोई हालिया चैट नहीं मिली।",
    noRecentComplaints: "कोई हालिया शिकायत नहीं मिली।",
    viewAll: "सभी देखें",
    chatHistory: "चैट इतिहास",
    savedSchemes: "सहेजी गई योजनाएं",
    savedChecklists: "सहेजी गई चेकलिस्ट",
    complaintHistory: "शिकायत इतिहास",
    dashboardAssistQuery: "आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?",
    dashboardAssistSub: "मुझसे सरकारी योजनाओं, आवश्यक दस्तावेजों, या आधिकारिक शिकायत का मसौदा तैयार करने के बारे में कुछ भी पूछें।",
    dashboardSearchPlaceholder: "जैसे: 'क्या मैं पीएम-किसान के लिए पात्र हूँ?' या 'नगर निगम को पत्र का मसौदा तैयार करें...'",
    suggestHousing: "आवास योजनाएं खोजें",
    suggestAadhar: "आधार अपडेट चेकलिस्ट",
    suggestWater: "जल विभाग की शिकायत लिखें",
    yourActivity: "आपकी गतिविधि",
    totalChats: "कुल चैट",
    totalSavedSchemes: "सहेजी गई योजनाएं",
    totalChecklists: "चेकलिस्ट",
    totalComplaints: "शिकायतें",
    recentActivity: "हालिया गतिविधि",
    nothingYet: "अभी तक कुछ नहीं।",
    aiConversation: "एआई बातचीत",
    draftStatus: "मसौदा",
    untitledChat: "बिना शीर्षक की चैट",
    untitledComplaint: "बिना शीर्षक की शिकायत",
    justNow: "अभी-अभी",
    yesterday: "कल",
    mAgo: "मिनट पहले",
    hAgo: "घंटे पहले",

    // Landing Header
    signIn: "लॉग इन करें",
    getStarted: "शुरू करें",
    features: "विशेषताएं",
    howItWorks: "यह कैसे काम करता है",
    citizenStories: "नागरिक कहानियां",

    // Landing Hero
    introducingTitle: "पेश है सिविकसाथी २.०",
    heroTitleLine1: "भारतीय नौकरशाही को समझें",
    heroTitleLine2: "सरलता और अधिकार के साथ",
    heroSubtext: "सिविकसाथी जटिल कानूनी नियमों, विभाग के विवरणों और योग्यता नियमों को सरल भाषा में अनुवादित करता है। सरकारी योजनाओं की खोज करें, दस्तावेज़ों की चेकलिस्ट तैयार करें और सेकंडों में नागरिक शिकायतें दर्ज करें।",
    startForFree: "मुफ़्त में शुरू करें",
    tryLiveDemo: "लाइव डेमो आज़माएं",
    heroBottomNotes: "त्वरित एआई उत्तर · फायरबेस के माध्यम से १००% सुरक्षित · आधिकारिक पोर्टल लिंक प्रदान किए गए",

    // Landing Sandbox
    sandboxTitle: "सिविकसाथी लाइव सैंडबॉक्स",
    sandboxSubtitle: "वास्तविक समय में प्रतिक्रियाओं का अनुभव करें",
    sandboxInputText: "सिम्युलेशन बदलने के लिए ऊपर दिए गए टैब पर क्लिक करें...",
    sandboxButtonTryQuery: "अपनी क्वेरी के साथ आज़माएं",
    sandboxRequiredActionPlan: "आवश्यक कार्य योजना",
    sandboxDocChecklist: "आवश्यक दस्तावेज़ों की सूची",
    sandboxOfficialPortal: "आधिकारिक पोर्टल:",

    // Landing Features
    featuresTitle: "सरकारी इंटरफेस को सरल बनाने के लिए डिज़ाइन किया गया",
    featuresSubtitle: "सरकारी पोर्टल जटिल होते हैं। हम गति, सत्यापन और स्पष्टता पर केंद्रित पांच प्राथमिक सुविधाएं प्रदान करते हैं।",

    // Landing Stepper
    howItWorksTitle: "सिविकसाथी आपकी कैसे मदद करता है",
    howItWorksSubtitle: "प्रश्नों की खोज से लेकर आवेदन जमा करने तक, कार्यप्रवाह पूरी तरह से सरल है।",
    step1Title: "1. प्रोफाइल बनाएं",
    step1Desc: "राज्य, आयु, आय स्तर और व्यवसाय जैसे बुनियादी विवरणों के साथ अपना प्रोफाइल सेट करें। सारा डेटा आपके गूगल लॉगिन से सुरक्षित है।",
    step2Title: "2. पूछें या अपलोड करें",
    step2Desc: "सवाल पूछें, योजनाओं की खोज करें, नोटिफिकेशन पेस्ट करें या शिकायत विवरण लिखें। सड़क/कचरा रिपोर्ट के लिए फ़ोटो अपलोड करें।",
    step3Title: "3. एआई संरचना और सत्यापन",
    step3Desc: "इंजन राष्ट्रीय नियमों के विरुद्ध प्रश्न का विश्लेषण करता है, आवश्यक दस्तावेज़ों को चिह्नित करता है, और जटिल दिशानिर्देशों को सरल बनाता है।",
    step4Title: "4. सबमिट करें और सहेजें",
    step4Desc: "आधिकारिक पोर्टल्स के माध्यम से आवेदन करें, कस्टम दस्तावेज़ों की चेकलिस्ट डाउनलोड करें, अपने डैशबोर्ड पर शिकायतों की निगरानी करें।",

    // Landing Stats
    stats1Val: "५०+",
    stats1Label: "शामिल भारतीय नागरिक सेवाएं",
    stats2Val: "१०,०००+",
    stats2Label: "नागरिकों को स्थानीय सहायता",
    stats3Val: "९८.७%",
    stats3Label: "एआई सत्यापन सटीकता दर",

    // Landing Testimonials
    testimonialsTitle: "हर भारतीय नागरिक को सशक्त बनाना",
    testimonialsSubtitle: "देखें कि कैसे विभिन्न लोग सिविकसाथी एआई का उपयोग करके स्पष्टता पाते हैं।",

    // Landing CTA
    ctaTitle: "सरकारी सेवाओं की उलझन को दूर करें",
    ctaDesc: "चैट सहेजने, पात्र योजनाओं की सूची देखने, शिकायतों की स्थिति जांचने और कस्टम दस्तावेज़ चेकलिस्ट बनाने के लिए आज ही गूगल से लॉगिन करें।",
    seeFeatures: "विशेषताएं देखें",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLangState] = useState(getLanguage());

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setLangState(lang);
    // Dispatch custom event to notify external listeners (like non-reactive fetch layers or simple utils)
    window.dispatchEvent(new Event("languageChanged"));
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
