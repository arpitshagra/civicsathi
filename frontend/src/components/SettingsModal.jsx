import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function SettingsModal() {
  const {
    language,
    changeLanguage,
    theme,
    changeTheme,
    fontSize,
    changeFontSize,
    isSettingsOpen,
    closeSettings,
    t,
  } = useLanguage();

  const navigate = useNavigate();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
      {/* Settings Panel Card */}
      <div className="w-full max-w-md bg-surface dark:bg-surface-container border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low dark:bg-surface-container-high/40">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings</span>
            {t("settingsTitle")}
          </h3>
          <button
            onClick={closeSettings}
            className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Language Toggle */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              {t("changeLanguage") || "App Language"}
            </label>
            <div className="flex items-center gap-2 bg-surface-container-high dark:bg-surface-container-highest p-1 rounded-lg">
              <button
                onClick={() => changeLanguage("en")}
                className={`flex-1 py-2 px-4 rounded-md font-label-md text-label-md transition-all ${
                  language === "en"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface dark:hover:bg-surface-container-low"
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage("hi")}
                className={`flex-1 py-2 px-4 rounded-md font-label-md text-label-md transition-all ${
                  language === "hi"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface dark:hover:bg-surface-container-low"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              {t("themeLabel")}
            </label>
            <div className="flex items-center gap-2 bg-surface-container-high dark:bg-surface-container-highest p-1 rounded-lg">
              <button
                onClick={() => changeTheme("light")}
                className={`flex-1 py-2 px-4 rounded-md font-label-md text-label-md transition-all flex items-center justify-center gap-2 ${
                  theme === "light"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface dark:hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
                {t("lightMode")}
              </button>
              <button
                onClick={() => changeTheme("dark")}
                className={`flex-1 py-2 px-4 rounded-md font-label-md text-label-md transition-all flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface dark:hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                {t("darkMode")}
              </button>
            </div>
          </div>

          {/* Font Size Toggle */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              {t("fontSizeLabel")}
            </label>
            <div className="grid grid-cols-4 gap-2 bg-surface-container-high dark:bg-surface-container-highest p-1 rounded-lg">
              {[
                { size: "small", labelKey: "fontSizeSmall", fallback: "Small" },
                { size: "normal", labelKey: "fontSizeNormal", fallback: "Normal" },
                { size: "large", labelKey: "fontSizeLarge", fallback: "Large" },
                { size: "xlarge", labelKey: "fontSizeXLarge", fallback: "Extra" },
              ].map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => changeFontSize(opt.size)}
                  className={`py-2 px-1 text-center rounded-md font-label-sm text-[12px] font-semibold transition-all ${
                    fontSize === opt.size
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface dark:hover:bg-surface-container-low"
                  }`}
                >
                  {t(opt.labelKey) || opt.fallback}
                </button>
              ))}
            </div>
          </div>

          {/* Setup Profile Wizard Link */}
          <div className="mt-2 border-t border-outline-variant/20 pt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                closeSettings();
                navigate("/profile/setup");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg font-label-md text-label-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
              {language === "hi" ? "प्रोफ़ाइल ऑनबोर्डिंग विज़ार्ड खोलें" : "Open Profile Onboarding Wizard"}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-surface-container-low dark:bg-surface-container-high/40 border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={closeSettings}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-all shadow-sm active:scale-95"
          >
            {t("closeBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
