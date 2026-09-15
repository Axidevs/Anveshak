import React, { useState } from 'react';
import { CaseDocket, Language } from '../types';

interface DocketSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const sampleDockets: CaseDocket[] = [
  {
    cnrNumber: 'DLHC01-008291-2025',
    caseTitle: 'Union of India v. National Cyber Infrastructure Corp',
    courtName: 'High Court of Delhi • Bench-IV',
    stage: 'Arguments & Final Order Hearing',
    nextHearing: '24 Sep 2026',
    coram: 'Hon’ble Justice S. K. Kaul & Hon’ble Justice R. V. Sharma',
    firNumber: 'FIR-402/2024 Special Cell Lodhi Colony',
    policeStation: 'Special Cyber Crime Cell, New Delhi',
  },
  {
    cnrNumber: 'MHCC02-019482-2024',
    caseTitle: 'State of Maharashtra v. Forensic Analytics Consortium',
    courtName: 'High Court of Judicature at Bombay',
    stage: 'Cross-Examination of Forensic Expert (Digital Forensics)',
    nextHearing: '28 Sep 2026',
    coram: 'Hon’ble Justice Pradeep Nandrajog',
    firNumber: 'CR-882/2024 BKC Cyber PS',
    policeStation: 'BKC Cyber Police Station, Mumbai',
  },
  {
    cnrNumber: 'KA01-049182-2025',
    caseTitle: 'Digital India Trust v. Tech Telecommunications Ltd',
    courtName: 'High Court of Karnataka, Bengaluru Bench',
    stage: 'Compliance Report Submission',
    nextHearing: '02 Oct 2026',
    coram: 'Hon’ble Chief Justice N. V. Anjaria',
    firNumber: 'N/A (Civil Writ Petition)',
    policeStation: 'N/A',
  },
];

export const DocketSearchModal: React.FC<DocketSearchModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedDocket, setSelectedDocket] = useState<CaseDocket | null>(
    sampleDockets[0]
  );

  if (!isOpen) return null;

  const filteredDockets = sampleDockets.filter(
    (d) =>
      d.cnrNumber.toLowerCase().includes(query.toLowerCase()) ||
      d.caseTitle.toLowerCase().includes(query.toLowerCase()) ||
      d.courtName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#001C3A]/60 backdrop-blur-md font-sans-jakarta">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#002244]/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Sovereign bar */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-[#fc6018] text-2xl">
              travel_explore
            </span>
            <div>
              <h3 className="text-base font-bold text-[#001C3A] font-serif-merriweather">
                {language === 'hi'
                  ? 'अखिल भारतीय सीएनआर डॉकेट खोज'
                  : 'Pan-India CNR Docket Search'}
              </h3>
              <p className="text-[11px] text-gray-500">
                19,800+ Courts • Integrated Case Information System (eCourts)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Search input bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-xl">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by 16-Digit CNR Number, Party Name, or FIR..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#fc6018] focus:ring-1 focus:ring-[#fc6018]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2 text-[11px] text-gray-500">
            <span className="font-semibold text-[#002244]">Sample CNRs:</span>
            {sampleDockets.map((d) => (
              <button
                key={d.cnrNumber}
                onClick={() => {
                  setQuery(d.cnrNumber);
                  setSelectedDocket(d);
                }}
                className="text-xs text-[#fc6018] hover:underline font-mono"
              >
                {d.cnrNumber.slice(0, 10)}...
              </button>
            ))}
          </div>
        </div>

        {/* Docket Details View */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {selectedDocket ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-[#002244] text-white font-mono text-[11px] font-bold">
                    {selectedDocket.cnrNumber}
                  </span>
                  <h4 className="text-sm font-bold text-[#001C3A] mt-2">
                    {selectedDocket.caseTitle}
                  </h4>
                  <p className="text-xs text-[#fc6018] font-semibold mt-0.5">
                    {selectedDocket.courtName}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold shrink-0">
                  Live Docket
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">
                    Stage of Case:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedDocket.stage}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">
                    Next Date of Hearing:
                  </span>
                  <span className="font-bold text-[#E65100]">
                    {selectedDocket.nextHearing}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-gray-400 block text-[10px] uppercase">
                    Coram / Hon'ble Bench:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedDocket.coram}
                  </span>
                </div>
                {selectedDocket.firNumber && (
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase">
                      Associated CCTNS Police FIR:
                    </span>
                    <span className="font-mono text-gray-700">
                      {selectedDocket.firNumber} ({selectedDocket.policeStation})
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => alert(`Certified order for ${selectedDocket.cnrNumber} downloaded.`)}
                  className="px-3 py-1.5 rounded-lg bg-[#002244] text-white text-xs font-bold hover:bg-[#001C3A] flex items-center space-x-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Certified Digital Order Copy</span>
                </button>
                <button
                  onClick={() => alert(`Virtual Courtroom link copied.`)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-gray-700 text-xs font-semibold hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  <span>Virtual Court Link</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No matching court dockets found.
            </div>
          )}

          <div className="text-xs text-gray-500">
            <span className="font-bold text-[#002244]">Matched Case Records:</span>
            <div className="mt-2 space-y-1.5">
              {filteredDockets.map((d) => (
                <div
                  key={d.cnrNumber}
                  onClick={() => setSelectedDocket(d)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedDocket?.cnrNumber === d.cnrNumber
                      ? 'bg-amber-50/70 border-[#fc6018]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold text-[#001C3A]">
                      {d.cnrNumber}
                    </span>
                    <span className="text-[10px] text-gray-400">{d.nextHearing}</span>
                  </div>
                  <div className="text-xs text-gray-700 truncate font-medium">
                    {d.caseTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
