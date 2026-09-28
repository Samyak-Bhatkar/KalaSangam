import React, { useState } from 'react';
import { Layers, X, Info, GitFork, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getTechniqueTag } from '../utils/getTechniqueTag';

export default function TechniqueLineageBadge({
  product,
  technique: directTechnique,
  variant = 'compact', // 'compact' | 'detail'
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);

  // If a direct technique object is provided, use it; otherwise compute from product
  const technique = directTechnique || (product ? getTechniqueTag(product) : null);

  // If no matching technique exists, render NOTHING (zero gap, invisible)
  if (!technique) {
    return null;
  }

  // Handle click on badge without triggering parent card click
  const handleBadgeClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // ─── 1. COMPACT VARIANT (For Grid Cards & Map Dossier Listings) ───────────
  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={handleBadgeClick}
          title="पारंपरिक शिल्प वंश (Click to view craft technique lineage)"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-[#C85A32] hover:text-[#9C3818] border border-amber-300/80 text-[9.5px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 text-left"
        >
          <GitFork className="w-2.5 h-2.5 rotate-180 text-amber-600 shrink-0" />
          <span className="truncate max-w-[150px]">{technique.name}</span>
        </button>

        {/* Small floating popover */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 bottom-full mb-1.5 z-50 w-64 p-3 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl border border-amber-500/40 shadow-2xl animate-in zoom-in-95 duration-150 text-left select-none"
            >
              <div className="flex items-start justify-between gap-1 pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <GitFork className="w-3.5 h-3.5 rotate-180 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    पारंपरिक शिल्प वंश
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-4 h-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="mt-2 space-y-1.5">
                <div>
                  <h6 className="text-xs font-black text-amber-200">
                    {technique.name}
                  </h6>
                  {technique.name_hi && (
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {technique.name_hi}
                    </span>
                  )}
                </div>

                <div className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  वंश: {technique.lineage}
                </div>

                <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
                  {technique.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── 2. DETAIL VARIANT (For Product Detail Modal & Dossier Cards) ───────────
  return (
    <div className={`p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-left ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-[#C85A32] flex items-center justify-center shrink-0">
            <GitFork className="w-3.5 h-3.5 rotate-180" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <span>पारंपरिक शिल्प वंश (Craft Family Tree)</span>
            </div>
            <h5 className="text-xs font-black text-slate-900">
              {technique.name}
            </h5>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-bold">
            {technique.lineage}
          </span>
          <button
            type="button"
            className="p-1 text-slate-500 hover:text-slate-800"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Lineage Narrative */}
      {isOpen && (
        <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-150">
          <p className="font-normal text-[11px] text-slate-700">
            {technique.description}
          </p>
          <div className="mt-2 text-[9.5px] text-amber-800/80 font-medium italic">
            संरक्षित पारंपरिक तकनीक • भारत सरकार सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE)
          </div>
        </div>
      )}
    </div>
  );
}
