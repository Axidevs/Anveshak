import React from 'react';
import { Language } from '../types';

interface SovereignHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onReplayAnimation?: () => void;
  onOpenDocketSearch?: () => void;
}

export const SovereignHeader: React.FC<SovereignHeaderProps> = ({
  language,
  onLanguageChange,
}) => {
  return (
    <header className="relative z-20 w-full py-2.5 sm:py-3 px-4 sm:px-8 lg:px-12 flex items-center justify-between border-b border-[#002244]/10 backdrop-blur-md bg-white/85 shadow-[0_2px_12px_rgba(0,34,68,0.04)]">
      {/* Ministry & Sovereign Branding */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#E65100] uppercase font-sans-jakarta">
              भारत सरकार
            </span>
            <span className="text-gray-300 text-xs font-light">|</span>
            <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#001C3A] uppercase font-sans-jakarta">
              GOVERNMENT OF INDIA
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-[#43474e] font-medium tracking-wide">
            {language === 'hi'
              ? 'गृह मंत्रालय • भारत सरकार'
              : 'गृह मंत्रालय • Ministry of Home Affairs'}
          </span>
        </div>
      </div>

      {/* Security Accreditation & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4 text-xs font-sans-jakarta">
        {/* GIGW Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="font-semibold tracking-wide text-[11px] uppercase">
            GIGW 3.0 • 256-BIT SSL SECURE
          </span>
        </div>

        {/* Bilingual Switcher */}
        <div className="flex items-center space-x-1 bg-slate-50 border border-[#002244]/15 px-2.5 py-1 rounded-full shadow-xs">
          <button
            onClick={() => onLanguageChange('en')}
            className={`text-xs px-1.5 py-0.5 rounded font-bold transition-colors ${
              language === 'en'
                ? 'text-[#002244] bg-white shadow-xs'
                : 'text-[#43474e] hover:text-[#fc6018]'
            }`}
          >
            English
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`text-xs px-1.5 py-0.5 rounded font-bold transition-colors ${
              language === 'hi'
                ? 'text-[#fc6018] bg-white shadow-xs'
                : 'text-[#43474e] hover:text-[#fc6018]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>
    </header>
  );
};
