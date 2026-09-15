import React from 'react';
import { Language } from '../types';

interface SovereignFooterProps {
  language: Language;
}

export const SovereignFooter: React.FC<SovereignFooterProps> = ({ language }) => {
  return (
    <footer className="relative z-20 w-full border-t border-[#002244]/10 bg-white/95 backdrop-blur-md py-1.5 px-4 sm:px-8 shadow-[0_-1px_6px_rgba(0,34,68,0.03)] font-sans-jakarta">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#002244]/85">
        {/* Left Side: Role-Based Access, Smart Case Search, Complete Audit Trail */}
        <div className="flex items-center space-x-2.5 sm:space-x-4 font-semibold">
          <span className="flex items-center space-x-1 text-[#002244]">
            <span className="material-symbols-outlined text-xs text-[#002244]">shield</span>
            <span>{language === 'hi' ? 'भूमिका-आधारित पहुंच' : 'Role-Based Access'}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center space-x-1 text-[#fc6018]">
            <span className="material-symbols-outlined text-xs text-[#fc6018]">search</span>
            <span>{language === 'hi' ? 'स्मार्ट केस सर्च' : 'Smart Case Search'}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center space-x-1 text-emerald-800">
            <span className="material-symbols-outlined text-xs text-emerald-700">assignment</span>
            <span>{language === 'hi' ? 'पूर्ण ऑडिट ट्रेल' : 'Complete Audit Trail'}</span>
          </span>
        </div>

        {/* Right Side: © 2026 Anveshak • Secure Digital Justice Platform */}
        <div className="text-[10px] sm:text-[11px] text-gray-500 flex items-center space-x-1.5 font-medium">
          <span className="text-[#001C3A] font-bold">© 2026 Anveshak</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#43474e]">
            {language === 'hi'
              ? 'सुरक्षित डिजिटल न्याय मंच'
              : 'Secure Digital Justice Platform'}
          </span>
        </div>
      </div>
    </footer>
  );
};
