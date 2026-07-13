import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/civicsathi-logo.png";

export default function TermsOfService() {
  const { language } = useLanguage();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md hero-gradient">
      {/* Floating capsule header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 bg-surface/85 dark:bg-surface-container/85 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center px-6 py-3 w-full">
          <div className="flex items-center gap-3">
            <img alt="CivicSathi AI Logo" className="h-9 w-9 rounded-lg object-contain" src={logo} />
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">CivicSathi AI</span>
          </div>
          <Link to="/" className="text-primary hover:text-primary-container font-label-md text-label-md flex items-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">home</span>
            {language === "hi" ? "मुख्य पृष्ठ" : "Back to Home"}
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-16 px-gutter md:px-margin-desktop">
        <div className="max-w-3xl mx-auto bg-white dark:bg-surface-container rounded-2xl border border-outline-variant/60 p-8 shadow-xl space-y-6">
          <div className="border-b border-surface-variant/40 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-background">
              {language === "hi" ? "सेवा की शर्तें" : "Terms of Service"}
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {language === "hi" ? "अंतिम अद्यतन: जुलाई 2026" : "Last updated: July 2026"}
            </p>
          </div>

          <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">1. Acceptance of Terms / शर्तों की स्वीकृति</h2>
              <p>
                {language === "hi"
                  ? "सिविकसाथी एआई का उपयोग करके, आप इन शर्तों से सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवा का उपयोग न करें।"
                  : "By accessing or using CivicSathi AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">2. Scope of Service / सेवा का दायरा</h2>
              <p>
                {language === "hi"
                  ? "सिविकसाथी एआई एक स्वतंत्र एआई-संचालित नागरिक सहायक है। यह किसी भी सरकारी संगठन का प्रतिनिधित्व नहीं करता है और न ही आधिकारिक सरकारी आवेदन जमा करने का साधन प्रदान करता है। यह केवल जानकारी एकत्र करने और समझने में मदद करता है।"
                  : "CivicSathi AI is an independent, AI-powered civic guide. It does not represent any government agency, nor does it submit official applications on your behalf. Its goal is strictly informational—helping you find and understand scheme requirements."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">3. AI Content Accuracy / सामग्री की सटीकता</h2>
              <p>
                {language === "hi"
                  ? "यद्यपि हमारा एआई उच्च सटीकता के साथ परिणाम देने का प्रयास करता है, फिर भी सरकारी नियम और योजनाएं अक्सर बदलती रहती हैं। हम हमेशा किसी भी दस्तावेज या योजना की आधिकारिक पोर्टल पर पुष्टि करने की सलाह देते हैं।"
                  : "While our model tries to provide accurate steps and checklists, administrative rules and benefits change frequently. We strongly advise users to verify any information on official government portals before applying."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">4. User Accounts / उपयोगकर्ता खाते</h2>
              <p>
                {language === "hi"
                  ? "आप अपने प्रोफ़ाइल मापदंडों में सही जानकारी देने के लिए ज़िम्मेदार हैं ताकि हम आपको सही पात्रता परिणाम दिखा सकें। अनाधिकृत गतिविधियों के लिए अपने खाते का उपयोग न करें।"
                  : "You are responsible for providing accurate profile details to ensure high-fidelity eligibility rankings. You must not use our service for any unauthorized or illegal activity."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">5. Modification of Terms / शर्तों में संशोधन</h2>
              <p>
                {language === "hi"
                  ? "हम किसी भी समय इन शर्तों को संशोधित कर सकते हैं। सेवा का निरंतर उपयोग नई शर्तों की स्वीकृति माना जाएगा।"
                  : "We reserve the right to modify these terms at any time. Continued use of the platform after updates indicates your consent to the updated terms."}
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-lowest border-t border-outline-variant/35 py-6 text-center text-xs text-on-surface-variant">
        &copy; 2026 CivicSathi AI. Crafted by Arpit Sharma. All rights reserved.
      </footer>
    </div>
  );
}
