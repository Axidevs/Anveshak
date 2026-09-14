import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { MapPin, AlertTriangle, TrendingUp, Filter, X } from 'lucide-react';

const geoUrl = "/india.topo.json";

const crimeHotspots = [
  { id: 1,  city: 'Delhi',       lon: 77.2090, lat: 28.6139, crimes: 12847, type: 'Cyber Crime',      severity: 'critical', trend: '+12%', pop: '32M' },
  { id: 2,  city: 'Mumbai',      lon: 72.8777, lat: 19.0760, crimes: 9823,  type: 'Financial Fraud',  severity: 'critical', trend: '+8%',  pop: '21M' },
  { id: 3,  city: 'Bengaluru',   lon: 77.5946, lat: 12.9716, crimes: 7456,  type: 'IT Crime',         severity: 'high',     trend: '+15%', pop: '13M' },
  { id: 4,  city: 'Kolkata',     lon: 88.3639, lat: 22.5726, crimes: 6234,  type: 'Theft',            severity: 'high',     trend: '-3%',  pop: '15M' },
  { id: 5,  city: 'Chennai',     lon: 80.2707, lat: 13.0827, crimes: 5678,  type: 'Robbery',          severity: 'high',     trend: '+5%',  pop: '11M' },
  { id: 6,  city: 'Hyderabad',   lon: 78.4867, lat: 17.3850, crimes: 5123,  type: 'Drug Crime',       severity: 'high',     trend: '+20%', pop: '10M' },
  { id: 7,  city: 'Pune',        lon: 73.8567, lat: 18.5204, crimes: 4567,  type: 'Assault',          severity: 'medium',   trend: '-2%',  pop: '7M'  },
  { id: 8,  city: 'Ahmedabad',   lon: 72.5714, lat: 23.0225, crimes: 3890,  type: 'Property Crime',   severity: 'medium',   trend: '+4%',  pop: '8M'  },
  { id: 9,  city: 'Jaipur',      lon: 75.7873, lat: 26.9124, crimes: 3456,  type: 'Fraud',            severity: 'medium',   trend: '+7%',  pop: '4M'  },
  { id: 10, city: 'Lucknow',     lon: 80.9462, lat: 26.8467, crimes: 3210,  type: 'Violence',         severity: 'medium',   trend: '-1%',  pop: '4M'  },
  { id: 11, city: 'Guwahati',    lon: 91.7362, lat: 26.1445, crimes: 1890,  type: 'Trafficking',      severity: 'high',     trend: '+10%', pop: '1M'  },
  { id: 12, city: 'Chandigarh',  lon: 76.7794, lat: 30.7333, crimes: 1456,  type: 'Cyber Crime',      severity: 'low',      trend: '-5%',  pop: '1M'  },
  { id: 13, city: 'Kochi',       lon: 76.2711, lat:  9.9312, crimes: 1234,  type: 'Fraud',            severity: 'low',      trend: '-2%',  pop: '3M'  },
  { id: 14, city: 'Patna',       lon: 85.1376, lat: 25.5941, crimes: 2456,  type: 'Assault',          severity: 'medium',   trend: '+3%',  pop: '2M'  },
  { id: 15, city: 'Bhopal',      lon: 77.4126, lat: 23.2599, crimes: 1980,  type: 'Theft',            severity: 'low',      trend: '-4%',  pop: '2M'  },
  { id: 16, city: 'Nagpur',      lon: 79.0882, lat: 21.1458, crimes: 2200,  type: 'Drug Crime',       severity: 'medium',   trend: '+6%',  pop: '3M'  },
  { id: 17, city: 'Srinagar',    lon: 74.7973, lat: 34.0837, crimes: 980,   type: 'Militancy',        severity: 'high',     trend: '+2%',  pop: '1.2M'},
  { id: 18, city: 'Amritsar',    lon: 74.8723, lat: 31.6340, crimes: 1100,  type: 'Drug Trafficking', severity: 'medium',   trend: '+8%',  pop: '1.2M'},
  { id: 19, city: 'Varanasi',    lon: 82.9962, lat: 25.3176, crimes: 1750,  type: 'Violence',         severity: 'medium',   trend: '+4%',  pop: '1.5M'},
  { id: 20, city: 'Visakhapatnam', lon: 83.2185, lat: 17.6868, crimes: 2100, type: 'Port Crime',     severity: 'medium',   trend: '+9%',  pop: '2M'  },
];

const SEV = {
  critical: { dot: '#dc2626', glow: 'rgba(220,38,38,0.4)',   label: 'bg-red-100 text-red-800',    ring: '#dc2626' },
  high:     { dot: '#ea580c', glow: 'rgba(234,88,12,0.4)',  label: 'bg-orange-100 text-orange-800', ring: '#ea580c' },
  medium:   { dot: '#ca8a04', glow: 'rgba(202,138,4,0.3)',   label: 'bg-yellow-100 text-yellow-800', ring: '#ca8a04' },
  low:      { dot: '#f59e0b', glow: 'rgba(245,158,11,0.3)', label: 'bg-amber-50 text-amber-700', ring: '#f59e0b' },
};

const dotRadius = { critical: 6, high: 5, medium: 4.5, low: 4 };

export default function IndiaMap() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All'
    ? crimeHotspots
    : crimeHotspots.filter(h => h.severity === filter.toLowerCase());

  const activeCity = selected ?? hovered;

  return (
    <div className="w-full">
      {/* Filter strip */}
      <div className="flex flex-wrap items-center gap-2 mb-4 px-2">
        <Filter className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-semibold text-gray-500 mr-1">Filter:</span>
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-violet-600 text-white border-violet-600 shadow'
                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
            }`}
          >
            {f}
          </button>
        ))}
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── MAP ── */}
        <div className="lg:col-span-2 relative glass-card rounded-3xl p-4 overflow-hidden border border-violet-100 shadow-xl bg-white/40 flex items-center justify-center min-h-[500px]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1050,
              center: [80.5, 23.5]
            }}
            width={800}
            height={700}
            className="w-full max-w-2xl h-auto"
            style={{ width: "100%", height: "auto" }}
          >
            <defs>
              <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="dropShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" floodColor="#5b21b6" />
              </filter>
            </defs>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo, index) => {
                  const isEven = index % 2 === 0;
                  // Light orange and light green theme
                  const fill = isEven ? "#fff7ed" : "#f0fdf4"; // orange-50 : green-50
                  const hoverFill = isEven ? "#ffedd5" : "#dcfce7"; // orange-100 : green-100
                  const stroke = isEven ? "#fdba74" : "#86efac"; // orange-300 : green-300

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={1}
                      style={{
                        default: { outline: 'none', filter: 'url(#dropShadow)' },
                        hover: { fill: hoverFill, outline: 'none', transition: 'all 250ms' },
                        pressed: { fill: stroke, outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* ── City markers ── */}
              {visible.map((spot) => {
                const col = SEV[spot.severity];
                const r = dotRadius[spot.severity];
                const isActive = activeCity?.id === spot.id;

                return (
                  <Marker
                    key={spot.id}
                    coordinates={[spot.lon, spot.lat]}
                    onMouseEnter={() => setHovered(spot)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(s => s?.id === spot.id ? null : spot)}
                    style={{
                      default: { outline: "none", cursor: 'pointer' },
                      hover: { outline: "none", cursor: 'pointer' },
                      pressed: { outline: "none" },
                    }}
                  >
                    <g className="city-marker">
                      {/* Pulse Ring */}
                      <circle
                        r={r * 3}
                        fill={col.glow}
                        className="pulse-anim"
                        style={{
                          transformOrigin: 'center',
                          transformBox: 'fill-box'
                        }}
                      />
                      {/* Outer Ring */}
                      <circle
                        r={isActive ? r * 1.8 : r * 1.5}
                        fill="none"
                        stroke={col.ring}
                        strokeWidth={0.5}
                        opacity={0.8}
                      />
                      {/* Core Dot */}
                      <circle
                        r={isActive ? r * 1.2 : r}
                        fill={col.dot}
                        stroke="white"
                        strokeWidth={1}
                        filter="url(#dotGlow)"
                      />
                      {/* Label */}
                      <text
                        textAnchor="middle"
                        y={-r - 5}
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: isActive ? "8px" : "6px",
                          fontWeight: isActive ? "800" : "600",
                          fill: "#1e293b",
                          paintOrder: "stroke",
                          stroke: "#ffffff",
                          strokeWidth: "2px",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          pointerEvents: "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {spot.city}
                      </text>
                    </g>
                  </Marker>
                );
              })}
          </ComposableMap>
          
          <style>{`
            @keyframes pulseMarker {
              0%   { opacity: 0.8; transform: scale(1);   }
              50%  { opacity: 0.2; transform: scale(1.6); }
              100% { opacity: 0.8; transform: scale(1);   }
            }
            .pulse-anim {
              animation: pulseMarker 2s ease-in-out infinite;
            }
          `}</style>
        </div>

        {/* ── SIDE PANEL ── */}
        <div className="space-y-4">
          {/* Active city detail */}
          {activeCity ? (
            <div
              className="rounded-2xl p-5 border-l-4 bg-white/80 backdrop-blur shadow-lg border-y border-r border-violet-100"
              style={{ borderLeftColor: SEV[activeCity.severity].dot }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-gray-800">{activeCity.city}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SEV[activeCity.severity].label} uppercase tracking-wide`}>
                    {activeCity.severity}
                  </span>
                </div>
                <MapPin className="w-5 h-5 mt-1" style={{ color: SEV[activeCity.severity].dot }} />
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Reported Cases', activeCity.crimes.toLocaleString('en-IN')],
                  ['Top Crime Type', activeCity.type],
                  ['YoY Trend', activeCity.trend],
                  ['Population', activeCity.pop],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-semibold ${label === 'YoY Trend' ? (val.startsWith('+') ? 'text-red-600' : 'text-green-600') : 'text-gray-800'}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-5 bg-white/80 backdrop-blur shadow border border-violet-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-500" /> Click a dot to inspect
              </h4>
              <p className="text-xs text-gray-400">Hover or click any city marker on the map to view crime statistics.</p>
            </div>
          )}

          {/* Severity Legend */}
          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur shadow border border-violet-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Severity Index</h4>
            <div className="space-y-2.5">
              {[
                { level: 'Critical', key: 'critical', range: '> 8K cases' },
                { level: 'High',     key: 'high',     range: '5–8K cases' },
                { level: 'Medium',   key: 'medium',   range: '2–5K cases' },
                { level: 'Low',      key: 'low',      range: '< 2K cases' },
              ].map(({ level, key, range }) => (
                <div key={key} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: SEV[key].dot }} />
                  <span className="text-xs font-medium text-gray-700 flex-1">{level}</span>
                  <span className="text-[10px] text-gray-400">{range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Hotspots */}
          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur shadow border border-violet-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Top Hotspots
            </h4>
            <div className="space-y-1.5">
              {[...crimeHotspots]
                .sort((a, b) => b.crimes - a.crimes)
                .slice(0, 5)
                .map((spot, i) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelected(s => s?.id === spot.id ? null : spot)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-violet-50 transition-colors text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SEV[spot.severity].dot }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-800 block">{spot.city}</span>
                      <span className="text-[10px] text-gray-400">{spot.type}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{(spot.crimes / 1000).toFixed(1)}K</span>
                  </button>
                ))}
            </div>
          </div>

          {/* National Overview */}
          <div className="rounded-2xl p-5 bg-white/80 backdrop-blur shadow border border-violet-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" /> National Overview
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: '74.5K', label: 'Total Cases',   color: 'text-violet-700' },
                { val: '+8.4%', label: 'YoY Change',    color: 'text-red-600'    },
                { val: '68%',   label: 'Resolution',    color: 'text-green-600'  },
                { val: '20',    label: 'Hotspot Cities', color: 'text-amber-600' },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center p-2 rounded-xl bg-gray-50">
                  <p className={`text-lg font-bold ${color}`}>{val}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
