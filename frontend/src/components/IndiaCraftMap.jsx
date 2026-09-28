import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Compass,
  CheckCircle2,
  Users,
  Award,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { INDIA_VIEWBOX, INDIA_STATES_PATHS } from '../data/indiaMapData';
import { CRAFT_CLUSTERS, ANCHOR_STATE_IDS } from '../data/craftClusters';
import TechniqueLineageBadge from './TechniqueLineageBadge';

export default function IndiaCraftMap({
  products = [],
  onSelectProduct = () => {}
}) {
  const [clusters, setClusters] = useState(CRAFT_CLUSTERS);
  const [selectedStateId, setSelectedStateId] = useState('up'); // Default select UP (Gorakhpur Terracotta) for instant rich view
  const [hoveredStateId, setHoveredStateId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  // Optional backend sync: try fetching from backend endpoint if available, but never block or fail offline
  useEffect(() => {
    let isMounted = true;
    async function syncBackendClusters() {
      try {
        const res = await fetch('/api/v1/storefront/map-clusters');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.clusters) {
            setClusters(data.clusters);
          }
        }
      } catch (e) {
        // Offline or endpoint absent; perfectly fine, local CRAFT_CLUSTERS is already active
      }
    }
    syncBackendClusters();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleStateClick = (stateId) => {
    if (ANCHOR_STATE_IDS.includes(stateId)) {
      setSelectedStateId((prev) => (prev === stateId ? null : stateId));
    }
  };

  const selectedCluster = selectedStateId ? clusters[selectedStateId] : null;
  const hoveredCluster = hoveredStateId ? clusters[hoveredStateId] : null;

  // Filter products matching selected cluster
  const matchingProducts = selectedCluster
    ? products.filter((p) => {
        const text = (
          (p.title_en || '') + ' ' +
          (p.title_hi || '') + ' ' +
          (p.description_en || '') + ' ' +
          (p.description_hi || '') + ' ' +
          (p.beneficiary_id || '') + ' ' +
          (p.gi_tag_name || '') + ' ' +
          (p.craft_category || '')
        ).toLowerCase();

        return selectedCluster.keywords.some((k) => text.includes(k.toLowerCase())) ||
               (selectedCluster.stateCode && text.includes(`-${selectedCluster.stateCode.toLowerCase()}-`));
      })
    : [];

  return (
    <div className="w-full bg-[#0D1527] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-2">
      {/* Map Control / Cultural Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#172036] via-[#1E2A4A] to-[#172036] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-black text-white tracking-wide">
                डिजिटल शिल्प मानचित्र
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                8 मुख्य सांस्कृतिक क्लस्टर
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              मानचित्र में किसी भी राज्य पर क्लिक करके क्षेत्रीय हस्तशिल्प परंपरा व प्रामाणिक उत्पाद देखें
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#F59E0B] shadow-xs inline-block" />
            <span className="text-slate-200 font-semibold">सक्रिय क्लस्टर</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#1E293B] border border-slate-700 inline-block" />
            <span className="text-slate-400">आगामी क्लस्टर</span>
          </div>
        </div>
      </div>

      {/* Main Map + Dossier Workspace */}
      <div className="flex flex-col lg:flex-row min-h-[560px]">
        {/* SVG Map Section */}
        <div
          ref={mapContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredStateId(null)}
          className="relative flex-1 p-4 md:p-6 flex items-center justify-center bg-[#0B1120] select-none overflow-hidden"
          onClick={(e) => {
            // Deselect if clicking directly on background
            if (e.target.tagName === 'svg' || e.target === mapContainerRef.current) {
              setSelectedStateId(null);
            }
          }}
        >
          {/* Subtle Grid Canvas Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38BDF8 0.75px, transparent 0.75px)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            viewBox={INDIA_VIEWBOX}
            className="w-full max-w-[540px] max-h-[580px] h-auto drop-shadow-2xl transition-transform duration-300"
            aria-label="Interactive India Craft Map"
          >
            <defs>
              {/* Selected Glow Filter */}
              <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {INDIA_STATES_PATHS.map((state) => {
              const sid = state.id;
              const isAnchor = ANCHOR_STATE_IDS.includes(sid);
              const isSelected = selectedStateId === sid;
              const isHovered = hoveredStateId === sid;

              let fill = '#161F33'; // Default inactive slate
              let stroke = '#2A364F';
              let strokeWidth = '0.7';
              let filter = 'none';
              let opacity = 0.85;

              if (isAnchor) {
                fill = '#D97736'; // Warm terracotta
                stroke = '#FED7AA';
                strokeWidth = '1.2';
                opacity = 1.0;

                if (isHovered) {
                  fill = '#FBBF24'; // Radiant bright amber
                  stroke = '#FFFFFF';
                  strokeWidth = '1.8';
                  filter = 'url(#activeGlow)';
                }

                if (isSelected) {
                  fill = '#EA580C'; // Vivid deep orange-terracotta
                  stroke = '#38BDF8'; // Glowing cyan highlight border
                  strokeWidth = '2.4';
                  filter = 'url(#activeGlow)';
                }
              }

              return (
                <path
                  key={sid}
                  id={sid}
                  d={state.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  filter={filter}
                  className={`transition-colors duration-200 ${
                    isAnchor ? 'cursor-pointer hover:opacity-100' : 'cursor-default'
                  }`}
                  onMouseEnter={() => setHoveredStateId(sid)}
                  onMouseLeave={() => setHoveredStateId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStateClick(sid);
                  }}
                />
              );
            })}
          </svg>

          {/* Quick Floating Selector Pills on Map Corner */}
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-900/85 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60 max-w-sm">
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>सत्यापित शिल्प राज्य (त्वरित चयन):</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {ANCHOR_STATE_IDS.map((sid) => {
                const c = clusters[sid];
                const active = selectedStateId === sid;
                return (
                  <button
                    key={sid}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStateId(sid);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {c.name_hi || c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floating Hover Tooltip */}
          {hoveredStateId && (
            <div
              className="absolute z-50 pointer-events-none transition-all duration-75"
              style={{
                left: `${Math.min(tooltipPos.x + 12, 320)}px`,
                top: `${Math.max(tooltipPos.y - 20, 20)}px`
              }}
            >
              {hoveredCluster ? (
                <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/50 p-2.5 rounded-xl shadow-xl min-w-[190px] text-left">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
                    <span className="text-xs font-black text-amber-300">
                      {hoveredCluster.name_hi}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-extrabold">
                      {hoveredCluster.name}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between text-slate-300">
                      <span>प्रमाणित कारीगर:</span>
                      <span className="font-bold text-white">{hoveredCluster.totalArtisans}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>सक्रिय GI शिल्प:</span>
                      <span className="font-bold text-emerald-400">{hoveredCluster.activeGICrafts}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-800 text-[9px] text-slate-400 italic">
                    क्लिक करके पूरा शिल्प विवरण देखें ↗
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-lg shadow-lg text-[10px] text-slate-300">
                  <span className="font-bold text-white">
                    {INDIA_STATES_PATHS.find((s) => s.id === hoveredStateId)?.name || hoveredStateId}
                  </span>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    आगामी क्लस्टर ऑनबोर्डिंग
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Regional Craft Dossier Panel (Beside/Below Map) */}
        <div className="w-full lg:w-[380px] bg-[#121A2D] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between p-5">
          {selectedCluster ? (
            <div className="flex flex-col h-full">
              {/* Dossier Top Bar */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>क्षेत्रीय शिल्प डॉसियर (Regional Dossier)</span>
                  </div>
                  <h4 className="text-xl font-black text-white">
                    {selectedCluster.name_hi}
                    <span className="text-xs font-normal text-slate-400 block">
                      {selectedCluster.name} ({selectedCluster.stateCode})
                    </span>
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedStateId(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="डॉसियर बंद करें"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Beneficiary Community & Stats */}
              <div className="my-3 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    लक्षित लाभार्थी समुदाय (MoSJE Beneficiary)
                  </div>
                  <div className="text-xs font-extrabold text-amber-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{selectedCluster.community}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="text-[10px] text-slate-400">सत्यापित कारीगर</div>
                    <div className="text-lg font-black text-white">{selectedCluster.totalArtisans}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="text-[10px] text-slate-400">सक्रिय GI शिल्प</div>
                    <div className="text-lg font-black text-emerald-400">{selectedCluster.activeGICrafts}</div>
                  </div>
                </div>
              </div>

              {/* Registered Crafts List */}
              <div className="mb-3">
                <div className="text-[11px] font-black uppercase text-slate-300 tracking-wider mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>प्रमाणित पारंपरिक शिल्प (Registered Crafts)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCluster.crafts.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cultural Context Narrative */}
              <div className="mb-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  सांस्कृतिक व ऐतिहासिक परंपरा (Tradition & Heritage)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {selectedCluster.description}
                </p>
              </div>

              {/* Filtered Products from Live Storefront */}
              <div className="flex-1 overflow-y-auto">
                <div className="text-[11px] font-black uppercase text-slate-300 tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>इस क्लस्टर के लाइव उत्पाद</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {matchingProducts.length} उपलब्ध
                  </span>
                </div>

                {matchingProducts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700/80 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                      इस क्लस्टर से अभी कोई लाइव उत्पाद सूचीबद्ध नहीं है।
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      गाँव समन्वयक द्वारा ऑनबोर्डिंग एवं AI सत्यापन प्रक्रियाधीन है।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {matchingProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onSelectProduct(p)}
                        className="group flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer"
                      >
                        <img
                          src={p.studio_image_url || p.raw_image_url || '/placeholder_craft.png'}
                          alt={p.title_en || 'Product'}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                            {p.title_hi || p.title_en}
                          </h5>
                          <div className="my-0.5">
                            <TechniqueLineageBadge product={p} variant="compact" />
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.artisan_name || 'प्रमाणित कारीगर'}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs font-black text-amber-400">
                              ₹{p.fair_price_b2c_inr || p.b2c_price || p.price || p.suggested_price || p.expected_price_inr || '480'}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              ONDC Live
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Compass className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-base font-bold text-slate-200">
                राज्य का चयन करें
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                मानचित्र पर हाइलाइट किए गए किसी भी रंगीन राज्य पर क्लिक करके उस क्षेत्र की सांस्कृतिक विरासत और कारीगर देखें।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
