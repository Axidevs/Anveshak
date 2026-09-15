/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChakraBackground } from './components/ChakraBackground';
import { SovereignHeader } from './components/SovereignHeader';
import { HeroGateway } from './components/HeroGateway';
import { OnboardingModal } from './components/OnboardingModal';
import { DocketSearchModal } from './components/DocketSearchModal';
import { JusticeTerminalView } from './components/JusticeTerminalView';
import { SovereignFooter } from './components/SovereignFooter';
import { Language, OnboardingData } from './types';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDocketSearchOpen, setIsDocketSearchOpen] = useState<boolean>(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [currentView, setCurrentView] = useState<'gateway' | 'terminal'>('gateway');
  const [replayCounter, setReplayCounter] = useState<number>(0);

  const handleReplay = () => {
    setCurrentView('gateway');
    setReplayCounter((c) => c + 1);
  };

  const handleBeginOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const handleOnboardingCompleted = (data: OnboardingData) => {
    setOnboardingData(data);
    setCurrentView('terminal');
  };

  return (
    <div
      className={`relative w-screen selection:bg-[#fc6018] selection:text-white bg-[#f9f9ff] text-[#111c2d] flex flex-col justify-between ${
        currentView === 'gateway' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'
      }`}
    >
      {/* Top Sovereign Tricolor Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 flex w-full pointer-events-none">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-[#FFFFFF]"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Sovereign Header */}
      <SovereignHeader
        language={language}
        onLanguageChange={setLanguage}
        onReplayAnimation={handleReplay}
        onOpenDocketSearch={() => setIsDocketSearchOpen(true)}
      />

      {/* Main View Area - strictly between header and footer */}
      {currentView === 'gateway' ? (
        <div className="relative flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
          {/* Background with smoothly rotating clockwise 24-spoke Ashoka Chakra & ambient tricolor lights */}
          <ChakraBackground />

          <HeroGateway
            language={language}
            onBeginOnboarding={handleBeginOnboarding}
            onOpenDocketSearch={() => setIsDocketSearchOpen(true)}
            replayCounter={replayCounter}
          />
        </div>
      ) : (
        onboardingData && (
          <div className="relative flex-1 w-full min-h-0 overflow-y-auto">
            <ChakraBackground />
            <JusticeTerminalView
              onboardingData={onboardingData}
              language={language}
              onReturnHome={() => setCurrentView('gateway')}
              onOpenDocketSearch={() => setIsDocketSearchOpen(true)}
            />
          </div>
        )
      )}

      {/* Sovereign Accreditation Footer */}
      <SovereignFooter language={language} />

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        language={language}
        onCompleted={handleOnboardingCompleted}
      />

      <DocketSearchModal
        isOpen={isDocketSearchOpen}
        onClose={() => setIsDocketSearchOpen(false)}
        language={language}
      />
    </div>
  );
}
