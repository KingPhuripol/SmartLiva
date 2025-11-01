import React from "react";
import { useLanguage } from "../contexts/LanguageContextSimple";

interface LanguageSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  showLabels = true,
}) => {
  const { currentLanguage, setLanguage, t, isTranslating } = useLanguage();

  const handleLanguageChange = (lang: "th" | "en" | "de") => {
    setLanguage(lang);
    // Trigger page refresh to apply translations
    window.location.reload();
  };

  return (
    <div className={`language-switcher ${className}`}>
      {showLabels && (
        <span className="language-label">{t("lang.select")}:</span>
      )}

      <div className="language-buttons">
        <button
          onClick={() => handleLanguageChange("en")}
          className={`language-btn ${currentLanguage === "en" ? "active" : ""}`}
          disabled={isTranslating}
        >
          <span className="flag">🇺🇸</span>
          {showLabels && <span className="text">English</span>}
        </button>

        <button
          onClick={() => handleLanguageChange("th")}
          className={`language-btn ${currentLanguage === "th" ? "active" : ""}`}
          disabled={isTranslating}
        >
          <span className="flag">🇹🇭</span>
          {showLabels && <span className="text">ไทย</span>}
        </button>

        <button
          onClick={() => handleLanguageChange("de")}
          className={`language-btn ${currentLanguage === "de" ? "active" : ""}`}
          disabled={isTranslating}
        >
          <span className="flag">🇩🇪</span>
          {showLabels && <span className="text">Deutsch</span>}
        </button>
      </div>

      {isTranslating && (
        <div className="translating-indicator">
          <span className="spinner">⟳</span>
          <span>{t("common.translating")}</span>
        </div>
      )}

      <style jsx>{`
        .language-switcher {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .language-label {
          font-size: 14px;
          color: #666;
          margin-right: 8px;
        }

        .language-buttons {
          display: flex;
          gap: 4px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .language-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .language-btn:hover {
          background: #f5f5f5;
        }

        .language-btn.active {
          background: #2563eb;
          color: white;
        }

        .language-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .flag {
          font-size: 16px;
        }

        .text {
          font-weight: 500;
        }

        .translating-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #666;
          margin-left: 8px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Compact mode */
        .language-switcher.compact .language-buttons {
          border-radius: 6px;
        }

        .language-switcher.compact .language-btn {
          padding: 6px 8px;
          font-size: 12px;
        }

        .language-switcher.compact .flag {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
