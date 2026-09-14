import React from 'react';


export const SovereignFooter = ({ language }) => {
  return (
    <footer className="relative z-20 w-full border-t border-[#002244]/10 bg-white/95 backdrop-blur-md py-3 px-6 sm:px-10 shadow-[0_-1px_6px_rgba(0,34,68,0.03)] font-sans-jakarta">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm sm:text-base text-[#002244]/85">
        {/* Left Side: Role-Based Access, Smart Case Search, Complete Audit Trail */}
        <div className="flex items-center space-x-4 sm:space-x-6 font-semibold">
          <span className="flex items-center space-x-1.5 text-[#002244]">
            <span className="material-symbols-outlined text-base sm:text-lg text-[#002244]">shield</span>
            <span>{language === 'hi' ? 'भूमिका-आधारित पहुंच' : 'Role-Based Access'}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center space-x-1.5 text-[#fc6018]">
            <span className="material-symbols-outlined text-base sm:text-lg text-[#fc6018]">search</span>
            <span>{language === 'hi' ? 'स्मार्ट केस खोज' : 'Smart Case Search'}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center space-x-1.5 text-emerald-800">
            <span className="material-symbols-outlined text-base sm:text-lg text-emerald-700">assignment</span>
            <span>{language === 'hi' ? 'पूर्ण ऑडिट ट्रेल' : 'Complete Audit Trail'}</span>
          </span>
        </div>

        {/* Right Side: © 2026 Anveshak • Secure Digital Justice Platform */}
        <div className="text-sm sm:text-base text-gray-500 flex items-center space-x-2 font-medium">
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
