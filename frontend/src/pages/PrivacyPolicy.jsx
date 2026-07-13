import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/civicsathi-logo.png";

export default function PrivacyPolicy() {
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
              {language === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {language === "hi" ? "अंतिम अद्यतन: जुलाई 2026" : "Last updated: July 2026"}
            </p>
          </div>

          <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">1. Introduction / परिचय</h2>
              <p>
                {language === "hi"
                  ? "सिविकसाथी एआई आपके व्यक्तिगत डेटा की गोपनीयता और सुरक्षा के लिए प्रतिबद्ध है। यह नीति बताती है कि जब आप हमारी नागरिक सहायक सेवा का उपयोग करते हैं तो हम आपकी जानकारी को कैसे एकत्र, उपयोग और साझा करते हैं।"
                  : "CivicSathi AI is committed to protecting the privacy and security of your personal data. This privacy policy describes how we collect, use, and safeguard your information when you utilize our civic assistant services."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">2. Data We Collect / एकत्रित डेटा</h2>
              <p>
                {language === "hi"
                  ? "हम सेवा प्रदान करने के लिए केवल आवश्यक जानकारी एकत्र करते हैं: आपका प्रोफ़ाइल विवरण (आयु, राज्य, वार्षिक आय, आदि) योजनाओं की पात्रता की गणना करने के लिए, और आपकी चैट क्वेरीज़ को सहेजने के लिए।"
                  : "We only collect data necessary to provide our services: your basic profile parameters (such as age, state, annual income, occupation) to check scheme eligibility, and chat query logs that you save to your dashboard."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">3. AI Processing Disclaimer / एआई प्रसंस्करण अस्वीकरण</h2>
              <p>
                {language === "hi"
                  ? "हम आपके सवालों के जवाब देने के लिए सुरक्षित तृतीय-पक्ष एआई मॉडल (ग्रोक एपीआई) का उपयोग करते हैं। हम व्यक्तिगत रूप से पहचान योग्य जानकारी (जैसे आधार संख्या या फ़ोन नंबर) को एआई एपीआई में नहीं भेजते हैं। कृपया अपनी चैट में संवेदनशील व्यक्तिगत जानकारी साझा न करें।"
                  : "We leverage third-party AI interfaces (Groq APIs) to generate administrative recommendations. No personally identifiable credentials (such as Aadhaar or PAN details) are transmitted to third-party language models. Please refrain from submitting highly sensitive keys in chat text inputs."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">4. Data Security / डेटा सुरक्षा</h2>
              <p>
                {language === "hi"
                  ? "आपका लॉगिन क्रेडेंशियल फायरबेस प्रमाणीकरण द्वारा प्रबंधित किया जाता है और आपका सहेजा गया डेटा सुरक्षित रूप से गूगल क्लाउड फायरस्टोर पर संग्रहीत किया जाता है।"
                  : "All user authentication sessions are authenticated via Firebase Admin protocols, and your saved checklists, notifications, and municipal complaint records are securely retained on Google Cloud Firestore."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-md font-bold text-on-surface">5. User Control & Deletion / उपयोगकर्ता नियंत्रण</h2>
              <p>
                {language === "hi"
                  ? "आपको अपने प्रोफ़ाइल विवरण को बदलने या अपने खाते और सहेजे गए डेटा को स्थायी रूप से हटाने का पूरा अधिकार है। आप इसे सीधे प्रोफ़ाइल सेटिंग्स से कर सकते हैं।"
                  : "You maintain full autonomy to modify your convenience parameters or permanently erase your user profile and chat histories. These actions can be performed directly from the User Profile Settings screen."}
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
