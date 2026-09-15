import React, { useState } from 'react';
import { OnboardingData, Language } from '../types';

interface JusticeTerminalViewProps {
  onboardingData: OnboardingData;
  language: Language;
  onReturnHome: () => void;
  onOpenDocketSearch: () => void;
}

export const JusticeTerminalView: React.FC<JusticeTerminalViewProps> = ({
  onboardingData,
  language,
  onReturnHome,
  onOpenDocketSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'live_cases' | 'interoperability'>('grid');

  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 font-sans-jakarta space-y-6">
      {/* Top Welcome Ribbon */}
      <div className="bg-white/95 border border-[#002244]/15 rounded-2xl p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,34,68,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002244] to-[#001C3A] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-2xl text-amber-300">
              verified_user
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#001C3A] font-serif-merriweather">
                {onboardingData.fullName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-300">
                Sovereign Node Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {onboardingData.courtJurisdiction} • {onboardingData.idNumber} • {onboardingData.state}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenDocketSearch}
            className="px-3.5 py-2 rounded-xl bg-[#fc6018] hover:bg-[#e65100] text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">travel_explore</span>
            <span>CNR Docket Lookup</span>
          </button>
          <button
            onClick={onReturnHome}
            className="px-3.5 py-2 rounded-xl border border-[#002244]/20 text-[#002244] hover:bg-slate-100 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span>{language === 'hi' ? 'मुख्य द्वार' : 'Main Gateway'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#002244]/10 pb-2">
        <button
          onClick={() => setActiveTab('grid')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'grid'
              ? 'bg-[#002244] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#002244]'
          }`}
        >
          {language === 'hi' ? 'एकीकृत ग्रिड स्थिति' : 'Integrated Grid Status'}
        </button>
        <button
          onClick={() => setActiveTab('live_cases')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'live_cases'
              ? 'bg-[#002244] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#002244]'
          }`}
        >
          {language === 'hi' ? 'सक्रिय केस डॉकेट्स' : 'Active Case Dockets'}
        </button>
        <button
          onClick={() => setActiveTab('interoperability')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'interoperability'
              ? 'bg-[#002244] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#002244]'
          }`}
        >
          {language === 'hi' ? 'आईसीजेएस 4-पिलर इंटरऑपरेबिलिटी' : 'ICJS 4-Pillar Pipeline'}
        </button>
      </div>

      {/* Content Panes */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Supreme & High Courts Tier */}
          <div className="bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#001C3A] uppercase tracking-wide">
                Apex & High Courts
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div className="text-2xl font-black text-[#002244]">26 / 26 Nodes</div>
            <div className="text-xs text-gray-500">
              Supreme Court of India & 25 High Court Principal Benches linked in real-time.
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
              <span>Latency: 4.2ms</span>
              <span>100% Synced</span>
            </div>
          </div>

          {/* Card 2: District & Subordinate Judiciary */}
          <div className="bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#001C3A] uppercase tracking-wide">
                Subordinate Judiciary
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-black text-[#002244]">19,842 Courts</div>
            <div className="text-xs text-gray-500">
              Pan-India District & Taluka Court Complexes with e-Filing 3.0 enabled.
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
              <span>Live e-Hearings: 42,910</span>
              <span>Online Today</span>
            </div>
          </div>

          {/* Card 3: Law Enforcement & Forensic Labs */}
          <div className="bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#001C3A] uppercase tracking-wide">
                CCTNS & Forensics Pipeline
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-black text-[#002244]">16,400+ Police Stns</div>
            <div className="text-xs text-gray-500">
              Direct digital charge-sheet & e-FIR transfer to competent Magistrates.
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
              <span>FSL Reports Synced: 99.4%</span>
              <span>Certified</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'live_cases' && (
        <div className="bg-white/95 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#001C3A]">
              Current Cause List & Virtual Courtroom Allocations
            </h3>
            <span className="text-xs text-[#fc6018] font-bold">
              Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#002244]">
                  DLHC01-008291-2025
                </span>
                <div className="text-xs font-bold text-gray-800 mt-0.5">
                  Union of India v. National Cyber Infrastructure Corp
                </div>
                <div className="text-[11px] text-gray-500">
                  Item No. 14 • Court Room 3 (Hon'ble Bench-IV) • Stage: Final Arguments
                </div>
              </div>
              <button
                onClick={onOpenDocketSearch}
                className="px-3 py-1.5 rounded-lg bg-[#002244] text-white text-xs font-bold hover:bg-[#001C3A] cursor-pointer"
              >
                Inspect Docket
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#002244]">
                  MHCC02-019482-2024
                </span>
                <div className="text-xs font-bold text-gray-800 mt-0.5">
                  State of Maharashtra v. Forensic Analytics Consortium
                </div>
                <div className="text-[11px] text-gray-500">
                  Item No. 22 • Virtual VC Room 7 • Stage: Cross-Examination
                </div>
              </div>
              <button
                onClick={onOpenDocketSearch}
                className="px-3 py-1.5 rounded-lg bg-[#002244] text-white text-xs font-bold hover:bg-[#001C3A] cursor-pointer"
              >
                Inspect Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interoperability' && (
        <div className="bg-white/95 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#001C3A]">
            Inter-Operable Criminal Justice System (ICJS) Pillars
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-1.5">
              <span className="material-symbols-outlined text-2xl text-[#fc6018]">
                shield
              </span>
              <div className="text-xs font-bold text-[#001C3A]">1. Police (CCTNS)</div>
              <div className="text-[10px] text-gray-500">
                e-FIRs & Charge-sheets instantly linked with e-Courts.
              </div>
            </div>
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
              <span className="material-symbols-outlined text-2xl text-[#002244]">
                account_balance
              </span>
              <div className="text-xs font-bold text-[#001C3A]">2. e-Courts</div>
              <div className="text-[10px] text-gray-500">
                Seamless judicial orders, digital warrants, summons pipeline.
              </div>
            </div>
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <span className="material-symbols-outlined text-2xl text-emerald-700">
                lock
              </span>
              <div className="text-xs font-bold text-[#001C3A]">3. e-Prisons</div>
              <div className="text-[10px] text-gray-500">
                Under-trial inmate tracking & virtual remand hearing integration.
              </div>
            </div>
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
              <span className="material-symbols-outlined text-2xl text-amber-600">
                biotech
              </span>
              <div className="text-xs font-bold text-[#001C3A]">4. e-Forensics</div>
              <div className="text-[10px] text-gray-500">
                Tamper-proof digital custody & FSL examination reports.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
