import React, { useState } from "react";
import { ChakraBackground } from "../components/gateway/ChakraBackground";
import { SovereignHeader } from "../components/gateway/SovereignHeader";
import { HeroGateway } from "../components/gateway/HeroGateway";
import { SovereignFooter } from "../components/gateway/SovereignFooter";

export default function Landing() {
  const [language, setLanguage] = useState("en");
  const [replayCounter, setReplayCounter] = useState(0);

  const handleReplay = () => {
    setReplayCounter((c) => c + 1);
  };

  return (
    <div className="relative w-screen selection:bg-[#fc6018] selection:text-white bg-[#f9f9ff] text-[#111c2d] flex flex-col justify-between h-screen max-h-screen overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 h-1 flex w-full pointer-events-none">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-[#FFFFFF]"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      <SovereignHeader
        language={language}
        onLanguageChange={setLanguage}
        onReplayAnimation={handleReplay}
      />

      <div className="relative flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
        <ChakraBackground />
        <HeroGateway
          language={language}
          onBeginOnboarding={() => {}}
          replayCounter={replayCounter}
        />
      </div>

      <SovereignFooter language={language} />
    </div>
  );
}
