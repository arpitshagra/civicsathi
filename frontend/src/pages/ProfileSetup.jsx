import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ProfileAPI } from "../lib/endpoints";
import logo from "../assets/civicsathi-logo.png";
import Loader from "../components/Loader";

const EDUCATION_OPTIONS = [
  "No School",
  "10th",
  "12th",
  "Diploma",
  "Graduate",
  "Postgraduate",
  "PhD"
];

const OCCUPATION_OPTIONS = [
  "Student",
  "Government Employee",
  "Private Employee",
  "Business",
  "Farmer",
  "Self-employed",
  "Homemaker",
  "Senior Citizen",
  "Unemployed"
];

const INCOME_OPTIONS = [
  "Less than ₹2.5 Lakh",
  "₹2.5–5 Lakh",
  "₹5–10 Lakh",
  "Above ₹10 Lakh"
];

const CATEGORY_OPTIONS = ["General", "OBC", "SC", "ST", "EWS"];

const INTEREST_OPTIONS = [
  "Government Schemes",
  "Education",
  "Jobs",
  "Scholarships",
  "Healthcare",
  "Agriculture",
  "Business",
  "Women Welfare",
  "Pension",
  "Housing",
  "Skill Development"
];

export default function ProfileSetup() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const {
    language,
    changeLanguage,
    theme,
    changeTheme,
    fontSize,
    changeFontSize,
  } = useLanguage();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    education: "",
    occupation: "",
    annualIncome: "",
    category: "",
    disability: "No",
    interests: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form from auth and existing profile on load
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: profile?.name || user.displayName || "",
        email: profile?.email || user.email || "",
        phone: profile?.phone || "",
        dob: profile?.dob || "",
        gender: profile?.gender || "",
        state: profile?.state || "",
        district: profile?.district || "",
        city: profile?.city || "",
        pincode: profile?.pincode || "",
        education: profile?.education || "",
        occupation: profile?.occupation || "",
        annualIncome: profile?.annualIncome || "",
        category: profile?.category || "",
        disability: profile?.disability || "No",
        interests: profile?.interests || []
      }));
    }
  }, [user, profile]);

  // If profile is already fully complete, we don't block them, but let them setup if they want.
  // Wait, if they arrived here, let them do it.

  // Calculate completion percentage
  const calculateCompletion = () => {
    let percentage = 0;
    if (form.name?.trim()) percentage += 10;
    if (form.dob) percentage += 10;
    if (form.state?.trim()) percentage += 5;
    if (form.district?.trim()) percentage += 5;
    if (form.city?.trim()) percentage += 5;
    if (form.pincode?.trim()) percentage += 5;
    if (form.education) percentage += 10;
    if (form.occupation) percentage += 10;
    if (form.annualIncome) percentage += 15;
    if (form.category) percentage += 10;
    if (form.interests && form.interests.length > 0) percentage += 15;
    return percentage;
  };

  const percentage = calculateCompletion();

  // Helper to toggle interest chips
  const toggleInterest = (interest) => {
    setForm((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async (isSkipping = false) => {
    setSaving(true);
    setError(null);
    try {
      // If skipping, we just submit the current form as is.
      // The backend will calculate percentage and store it.
      await ProfileAPI.save(form);
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-headline-md text-[20px] text-on-background font-semibold border-b border-outline-variant/30 pb-2">
              Step 1: Convenience Preferences
            </h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
              Set your default interface options. You can change these later at any time from Settings.
            </p>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">Language Preference</label>
              <div className="flex gap-4">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी (Hindi)" }
                ].map((opt) => (
                  <label key={opt.code} className="flex items-center gap-2 cursor-pointer text-on-surface">
                    <input
                      type="radio"
                      name="langPref"
                      value={opt.code}
                      checked={language === opt.code}
                      onChange={() => changeLanguage(opt.code)}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                    />
                    <span className="font-body-md text-body-md">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">Visual Theme</label>
              <div className="flex gap-4">
                {[
                  { code: "light", label: "Light Mode", icon: "light_mode" },
                  { code: "dark", label: "Dark Mode", icon: "dark_mode" }
                ].map((opt) => (
                  <label key={opt.code} className="flex items-center gap-2 cursor-pointer text-on-surface">
                    <input
                      type="radio"
                      name="themePref"
                      value={opt.code}
                      checked={theme === opt.code}
                      onChange={() => changeTheme(opt.code)}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                    />
                    <span className="font-body-md text-body-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Font Size Selection */}
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">Text Size</label>
              <div className="flex gap-4">
                {[
                  { size: "small", label: "Small" },
                  { size: "normal", label: "Normal" },
                  { size: "large", label: "Large" },
                  { size: "xlarge", label: "Extra Large" }
                ].map((opt) => (
                  <label key={opt.size} className="flex items-center gap-2 cursor-pointer text-on-surface">
                    <input
                      type="radio"
                      name="fontSizePref"
                      value={opt.size}
                      checked={fontSize === opt.size}
                      onChange={() => changeFontSize(opt.size)}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                    />
                    <span className="font-body-md text-body-md">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-headline-md text-[20px] text-on-background font-semibold border-b border-outline-variant/30 pb-2">
              Step 2: Basic Information
            </h3>
            
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant">Email (Read-only)</label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface-container-low px-4 font-body-md text-outline cursor-not-allowed outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Gender</label>
              <div className="flex gap-4">
                {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-on-surface">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                    />
                    <span className="font-body-md text-body-md">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-headline-md text-[20px] text-on-background font-semibold border-b border-outline-variant/30 pb-2">
              Step 2: Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="e.g. Maharashtra"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">District</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="e.g. Pune"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">City / Village</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="e.g. Shivajinagar"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">PIN Code</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="e.g. 411005"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-headline-md text-[20px] text-on-background font-semibold border-b border-outline-variant/30 pb-2">
              Step 3: Education & Occupation
            </h3>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant">Highest Education</label>
              <select
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              >
                <option value="">Select Education Level</option>
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant">Primary Occupation</label>
              <select
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              >
                <option value="">Select Occupation</option>
                {OCCUPATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-headline-md text-[20px] text-on-background font-semibold border-b border-outline-variant/30 pb-2">
              Step 4: Financial Information & Category
            </h3>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Annual Family Income</label>
              <div className="grid grid-cols-2 gap-3">
                {INCOME_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-all hover:bg-surface-container-low ${
                      form.annualIncome === opt
                        ? "border-primary bg-primary-container/20 text-primary font-semibold"
                        : "border-outline-variant text-on-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="annualIncome"
                      value={opt}
                      checked={form.annualIncome === opt}
                      onChange={(e) => setForm({ ...form, annualIncome: e.target.value })}
                      className="sr-only"
                    />
                    <span className="font-body-md text-body-md">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Social Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Disability (Divyangjan)</label>
                <div className="flex gap-4 h-[48px] items-center">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-on-surface">
                      <input
                        type="radio"
                        name="disability"
                        value={opt}
                        checked={form.disability === opt}
                        onChange={(e) => setForm({ ...form, disability: e.target.value })}
                        className="w-4 h-4 text-primary focus:ring-primary border-outline-variant"
                      />
                      <span className="font-body-md text-body-md">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-headline-md text-[20px] text-on-background font-semibold border-b border-outline-variant/30 pb-2">
              Step 6: Select Your Interests
            </h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Select key focus areas for government schemes, scholarships, and updates you want to track.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 border ${
                      selected
                        ? "bg-primary text-on-primary border-primary shadow-sm scale-105"
                        : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background p-6">
        <Loader label="Saving your profile settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-background text-on-background relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed-dim/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary-fixed/10 blur-[80px] pointer-events-none" />

      <main className="w-full max-w-[600px] z-10">
        <div className="glass-card rounded-xl p-6 md:p-8 flex flex-col space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="CivicSathi Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary">Complete Your Profile</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                This helps us personalize government schemes and AI recommendations.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-label-md font-label-md text-on-surface-variant">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Onboarding Progress
              </span>
              <span className="font-semibold text-primary">{percentage}% Complete</span>
            </div>
            
            <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden border border-outline-variant/30">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            <div className="font-label-sm text-label-sm text-outline flex items-center gap-1 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/10">
              <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
              <span>
                Calculated completion: name (10%), dob (10%), location (20%), education (10%), occupation (10%), income (15%), category (10%), interests (15%)
              </span>
            </div>
          </div>

          {error && (
            <div className="w-full p-4 bg-error-container text-on-error-container border border-error/20 rounded-lg text-left font-label-md text-label-md flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-error shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Render Active Step Form */}
          <div className="min-h-[260px]">{renderStep()}</div>

          {/* Step Actions */}
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-6">
            <button
              onClick={() => handleSave(true)}
              className="text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md active:scale-95 py-2"
            >
              Skip for now
            </button>

            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-surface border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors active:scale-95 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
              )}

              {step < 6 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-colors active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSave(false)}
                  className="px-6 py-2.5 bg-tertiary text-on-tertiary rounded-lg font-label-md text-label-md hover:bg-tertiary/95 transition-colors active:scale-95 flex items-center gap-1 shadow-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Finish Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
