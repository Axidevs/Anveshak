import React from 'react';


export const EmblemLogo = ({ onClick, className = '' }) => {
  // 24 spokes for emblem inner Ashoka chakra wheel
  const emblemSpokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer select-none transition-transform duration-300 hover:scale-105 flex items-center justify-center ${className}`}
    >
      {/* Exact Emblem Vector matching the user provided graphic: Sovereign Shield, Document with 2 lines, Ashok Chakra, and Saffron/Green Wings */}
      <div className="relative w-20 h-24 sm:w-24 sm:h-28 md:w-26 md:h-30 flex items-center justify-center filter drop-shadow-[0_8px_18px_rgba(0,34,68,0.14)] group-hover:drop-shadow-[0_12px_24px_rgba(0,34,68,0.20)] transition-all duration-300">
        <svg
          fill="none"
          height="100%"
          viewBox="0 0 320 380"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Saffron Wing on Left Flank */}
          <path
            d="M 58 142 C 34 195 36 265 98 308 C 65 272 52 220 58 142 Z"
            fill="#FC6018"
          />

          {/* India Green Wing on Right Flank */}
          <path
            d="M 262 142 C 286 195 284 265 222 308 C 255 272 268 220 262 142 Z"
            fill="#138808"
          />

          {/* Outer Sovereign Hexagonal Shield */}
          <path
            d="M 160 26 L 258 74 L 258 214 C 258 278 208 332 160 352 C 112 332 62 278 62 214 L 62 74 Z"
            fill="#FFFFFF"
            stroke="#002D54"
            strokeLinejoin="round"
            strokeWidth="14"
          />

          {/* Inner Parallel Shield Inset Line */}
          <path
            d="M 160 42 L 242 80 L 242 210 C 242 264 200 314 160 332 C 120 314 78 264 78 210 L 78 80 Z"
            fill="none"
            opacity="0.9"
            stroke="#002D54"
            strokeLinejoin="round"
            strokeWidth="3.2"
          />

          {/* Legal Document with Folded Top-Right Corner */}
          <g transform="translate(160, 150)">
            {/* Paper body */}
            <path
              d="M -46 -60 H 16 L 46 -30 V 58 H -46 Z"
              fill="#EBF3F9"
              stroke="#002D54"
              strokeLinejoin="round"
              strokeWidth="6"
            />
            {/* Dog-ear corner fold */}
            <path
              d="M 16 -60 V -30 H 46"
              fill="#D4E3EF"
              stroke="#002D54"
              strokeLinejoin="round"
              strokeWidth="5"
            />
            {/* Document Horizontal Bar 1 */}
            <line
              stroke="#002D54"
              strokeLinecap="round"
              strokeWidth="6.5"
              x1="-30"
              x2="30"
              y1="-16"
              y2="-16"
            />
            {/* Document Horizontal Bar 2 */}
            <line
              stroke="#002D54"
              strokeLinecap="round"
              strokeWidth="6.5"
              x1="-30"
              x2="30"
              y1="5"
              y2="5"
            />
          </g>

          {/* 24-Spoke Ashok Chakra Wheel Overlapping Document and Shield */}
          <g transform="translate(160, 240)">
            {/* White Disc Base */}
            <circle cx="0" cy="0" fill="#FFFFFF" r="54" stroke="#002D54" strokeWidth="6" />
            {/* Inner Concentric Rim */}
            <circle cx="0" cy="0" fill="none" r="46" stroke="#002D54" strokeDasharray="3 3" strokeWidth="1.8" />
            {/* 24 Spokes */}
            <g fill="#002D54">
              {emblemSpokes.map((deg) => (
                <React.Fragment key={deg}>
                  <polygon
                    points="-1.8,-10 1.8,-10 0.8,-46 -0.8,-46"
                    transform={`rotate(${deg})`}
                  />
                  <circle cx="0" cy="-46" r="1.4" transform={`rotate(${deg})`} />
                </React.Fragment>
              ))}
            </g>
            {/* Center Hub */}
            <circle cx="0" cy="0" fill="#002D54" r="10" />
            <circle cx="0" cy="0" fill="#FFFFFF" r="4" />
          </g>
        </svg>
      </div>
    </div>
  );
};
