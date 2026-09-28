import React from 'react';
import { CULTURAL_TYPES } from '../utils/constants';
import {
  Hammer,
  Scissors,
  Footprints,
  Music,
  Radio,
  Landmark,
  Utensils,
  Sparkles,
  Languages,
  BookOpen,
  CheckSquare,
  Square
} from 'lucide-react';

const ICON_MAP = {
  Hammer,
  Scissors,
  Footprints,
  Music,
  Radio,
  Landmark,
  Utensils,
  Sparkles,
  Languages,
  BookOpen
};

export default function LayerToggles({
  activeTypes = new Set(),
  onToggleType = () => {},
  onSelectAll = () => {},
  onClearAll = () => {},
  elementCounts = {}
}) {
  const typeKeys = Object.keys(CULTURAL_TYPES);
  const allSelected = typeKeys.every((t) => activeTypes.has(t));

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 max-w-full">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black text-white tracking-wide uppercase">
            सांस्कृतिक स्तर (Cultural Layers)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={allSelected ? onClearAll : onSelectAll}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {allSelected ? <Square className="w-3 h-3 text-slate-400" /> : <CheckSquare className="w-3 h-3 text-amber-400" />}
            <span>{allSelected ? 'सभी हटाएं' : 'सभी चुनें'}</span>
          </button>
        </div>
      </div>

      {/* Layer Chips */}
      <div className="flex flex-wrap gap-1.5 max-h-[140px] md:max-h-none overflow-y-auto custom-scrollbar">
        {typeKeys.map((typeKey) => {
          const cfg = CULTURAL_TYPES[typeKey];
          const active = activeTypes.has(typeKey);
          const count = elementCounts[typeKey] || 0;
          const IconComponent = ICON_MAP[cfg.icon] || Sparkles;

          return (
            <button
              key={typeKey}
              onClick={() => onToggleType(typeKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                active
                  ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-xs font-black scale-100`
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: active ? cfg.color : '#94A3B8' }} />
              <div className="text-left flex items-baseline gap-1">
                <span>{cfg.name_hi}</span>
                <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
                  ({cfg.name_en.split(' ')[0]})
                </span>
              </div>
              <span className={`text-[10px] px-1 rounded-full font-mono ${active ? 'bg-black/30' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
