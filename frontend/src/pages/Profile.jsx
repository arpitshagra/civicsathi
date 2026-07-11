import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ProfileAPI } from "../lib/endpoints";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

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

export default function Profile() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
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

  const [langPreference, setLangPreference] = useState(language);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync profile data into local form state
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        state: profile.state || "",
        district: profile.district || "",
        city: profile.city || "",
        pincode: profile.pincode || "",
        education: profile.education || "",
        occupation: profile.occupation || "",
        annualIncome: profile.annualIncome || "",
        category: profile.category || "",
        disability: profile.disability || "No",
        interests: profile.interests || []
      });
      setLangPreference(language);
    }
  }, [profile, language]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccessMsg(null);
    // Reset form values to profile details
    if (profile) {
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        state: profile.state || "",
        district: profile.district || "",
        city: profile.city || "",
        pincode: profile.pincode || "",
        education: profile.education || "",
        occupation: profile.occupation || "",
        annualIncome: profile.annualIncome || "",
        category: profile.category || "",
        disability: profile.disability || "No",
        interests: profile.interests || []
      });
      setLangPreference(language);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (!form.name?.trim()) {
        throw new Error("Full name is required.");
      }
      
      // Save profile to database
      await ProfileAPI.update(form);
      
      // Save language preference globally
      if (langPreference !== language) {
        changeLanguage(langPreference);
      }
      
      await refreshProfile();
      setSuccessMsg("Profile saved successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest) => {
    if (!isEditing) return;
    setForm((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const completion = profile?.profileCompletion ?? 0;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-lg">
      
      {/* Upper Profile Header Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        
        {/* User Card */}
        <div className="glass-card rounded-xl p-md lg:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-md">
          <div className="relative group">
            {profile?.photoURL ? (
              <img
                alt="User Profile Picture"
                className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-sm"
                src={profile.photoURL}
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-surface shadow-sm bg-surface-container-high flex items-center justify-center text-primary">
                {profile?.name ? (
                  <span className="font-display-md text-display-md">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[64px]">account_circle</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {profile?.name || "Your Name"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {profile?.email || ""}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
              <span className="inline-flex items-center gap-1 bg-primary-container/20 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Verified Citizen
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-tertiary">dashboard_customize</span>
                Onboarding Level: {completion}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={logout}
              className="w-full sm:w-auto px-5 py-2 bg-surface border border-outline-variant text-error rounded-lg font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-colors active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        {/* AI personalization Quick stats */}
        <div className="ai-glass-card rounded-xl p-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">Personalized AI Status</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              {completion === 100
                ? "Your profile details are fully active. The AI Civic Assistant, Eligibility matches, and Complaints forms are fully personalized based on your background."
                : `Your profile details are ${completion}% complete. Fill in location, occupation, and financial brackets to unlock precise AI scheme eligibility recommendations.`}
            </p>
          </div>
          <div className="mt-4">
            {completion < 100 && (
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-primary h-full" style={{ width: `${completion}%` }} />
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Personalization Index</span>
              <span className="font-semibold">{completion}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Form Panel */}
      <div className="glass-card rounded-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_outline</span>
            <h2 className="font-headline-md text-headline-md text-on-background font-bold">Citizen Settings</h2>
          </div>
          
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-all duration-200 active:scale-95 shadow-sm flex items-center gap-1.5 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
        {successMsg && (
          <div className="p-4 bg-tertiary-container/10 text-tertiary border border-tertiary/20 rounded-lg text-left font-label-md text-label-md flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              1. Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.name || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Email Address</label>
                <div className="w-full h-[48px] bg-surface-container-low flex items-center px-4 rounded-lg font-body-md text-outline cursor-not-allowed border border-outline-variant/20">
                  {form.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.phone || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  ) : (
                    <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                      {form.dob || <span className="text-outline">Not specified</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block font-label-md text-label-md text-on-surface-variant">Gender</label>
                  {isEditing ? (
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                      {form.gender || <span className="text-outline">Not specified</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              2. Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Maharashtra"
                  />
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.state || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">District</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Pune"
                  />
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.district || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">City / Village</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Pune City"
                  />
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.city || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">PIN Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. 411005"
                    maxLength={6}
                  />
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.pincode || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 & 4: Education & Occupation */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              3. Education & Occupation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Education</label>
                {isEditing ? (
                  <select
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Select Education</option>
                    {EDUCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.education || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Occupation</label>
                {isEditing ? (
                  <select
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Select Occupation</option>
                    {OCCUPATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.occupation || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Financial Information & Disability */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              4. Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Annual Family Income</label>
                {isEditing ? (
                  <select
                    value={form.annualIncome}
                    onChange={(e) => setForm({ ...form, annualIncome: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Select Income Bracket</option>
                    {INCOME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.annualIncome || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Social Category</label>
                {isEditing ? (
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.category || <span className="text-outline">Not specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">Disability (Divyangjan)</label>
                {isEditing ? (
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
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {form.disability || "No"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Interests */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              5. Interests
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {INTEREST_OPTIONS.map((opt) => {
                const isSelected = form.interests.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleInterest(opt)}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 border ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary font-semibold shadow-sm"
                        : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                    } ${!isEditing ? "opacity-90 cursor-default" : "cursor-pointer"}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 7: Language Preference */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              6. Language Preference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface-variant">System Language</label>
                {isEditing ? (
                  <select
                    value={langPreference}
                    onChange={(e) => setLangPreference(e.target.value)}
                    className="w-full h-[48px] rounded-lg border border-outline-variant bg-surface px-4 font-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                ) : (
                  <div className="w-full h-[48px] border border-transparent bg-surface-container-lowest flex items-center px-4 rounded-lg font-body-md text-on-background border border-outline-variant/10">
                    {language === "hi" ? "Hindi (हिन्दी)" : "English (EN)"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-surface border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors active:scale-95 flex items-center gap-1"
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-colors active:scale-95 flex items-center gap-1 shadow-sm font-semibold"
                disabled={saving}
              >
                {saving ? (
                  <Loader label="Saving..." />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </div>

    </main>
  );
}
