import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/civicsathi-logo.png";

export default function ContactSupport() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

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
        <div className="max-w-xl mx-auto bg-white dark:bg-surface-container rounded-2xl border border-outline-variant/60 p-8 shadow-xl space-y-6">
          <div className="border-b border-surface-variant/40 pb-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-background">
              {language === "hi" ? "सहायता से संपर्क करें" : "Contact Support"}
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {language === "hi"
                ? "क्या आपके पास प्रश्न हैं? हमें संदेश भेजें और हम जल्द ही उत्तर देंगे।"
                : "Have questions or need assistance? Drop us a message below."}
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl text-center space-y-4 animate-fade-in">
              <span className="material-symbols-outlined text-primary text-[48px] animate-bounce">check_circle</span>
              <h2 className="text-lg font-bold text-on-surface">
                {language === "hi" ? "संदेश सफलतापूर्वक भेजा गया!" : "Message Sent Successfully!"}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {language === "hi"
                  ? "आपका समर्थन अनुरोध दर्ज कर लिया गया है। हमारा प्रतिनिधि २४ घंटे के भीतर आपसे संपर्क करेगा।"
                  : "Thank you for reaching out. A CivicSathi representative will respond to your registered email address within 24 hours."}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                {language === "hi" ? "दूसरा संदेश भेजें" : "Send another message"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  {language === "hi" ? "आपका नाम" : "Your Name"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "hi" ? "जैसे: अमित कुमार" : "e.g., Amit Kumar"}
                  className="w-full bg-surface dark:bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-on-surface"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  {language === "hi" ? "ईमेल पता" : "Email Address"} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., amit@example.com"
                  className="w-full bg-surface dark:bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-on-surface"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  {language === "hi" ? "विषय" : "Subject"}
                </label>
                <input
                  type="text"
                  placeholder={language === "hi" ? "संक्षिप्त विषय" : "Brief topic"}
                  className="w-full bg-surface dark:bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-on-surface"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  {language === "hi" ? "आपका संदेश" : "Message"} *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder={language === "hi" ? "अपनी क्वेरी यहाँ लिखें..." : "Type details of your request here..."}
                  className="w-full bg-surface dark:bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-on-surface resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-semibold py-2.5 rounded-lg text-sm hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow"
              >
                {language === "hi" ? "संदेश भेजें" : "Submit Ticket"}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-surface-container-lowest border-t border-outline-variant/35 py-6 text-center text-xs text-on-surface-variant">
        &copy; 2026 CivicSathi AI. Crafted by Arpit Sharma. All rights reserved.
      </footer>
    </div>
  );
}
