import React from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BookOpen,
  GitFork,
  Clock,
  ShoppingBag,
  Award,
  Layers
} from 'lucide-react';
import { CULTURAL_TYPES, RARITY_LABELS } from '../utils/constants';

export default function ElementDossier({
  element = null,
  onClose = () => {},
  onOpenDNA = () => {},
  onOpenStory = () => {},
  onOpenTimeline = () => {},
  onOpenCommerce = () => {},
  hasStory = false,
  hasTimeline = false,
  hasCommerce = false
}) {
  if (!element) return null;

  const typeConfig = CULTURAL_TYPES[element.type] || CULTURAL_TYPES.craft;
  const rarityInfo = RARITY_LABELS[element.rarity || 1] || RARITY_LABELS[1];

  return (
    <div className="w-full md:w-[380px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar transition-all">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border}`}>
                {typeConfig.name_hi} • {element.type.toUpperCase()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {element.precision || 'Town'}
              </span>
            </div>
            <h3 className="text-xl font-black text-white leading-tight">
              {element.name_hi}
            </h3>
            <h4 className="text-xs font-semibold text-slate-400 mt-0.5">
              {element.name_en}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close Dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location & Metadata Bar */}
        <div className="my-3 space-y-2">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">
              {element.place_name}, {element.district}, {element.state}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="text-[10px] text-slate-400 font-medium">दुर्लभता स्तर (Rarity)</div>
              <div className={`font-black mt-0.5 text-sm ${rarityInfo.color}`}>
                {rarityInfo.stars}
              </div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">
                {rarityInfo.label_hi}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="text-[10px] text-slate-400 font-medium">दस्तावेजीकरण स्थिति</div>
              <div className="font-black text-emerald-400 mt-0.5 capitalize text-xs flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{element.documentation_status} Verified</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                विश्वसनीयता: {Math.round((element.confidence || 0.95) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Descriptions (Hindi & English) */}
        <div className="space-y-2 mb-4">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>सांस्कृतिक विवरण (Cultural Heritage Context)</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {element.description_hi}
            </p>
            <div className="my-2 border-t border-slate-800/60" />
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              {element.description_en}
            </p>
          </div>
        </div>

        {/* Interactive Feature Action Triggers */}
        <div className="space-y-1.5 mb-4">
          {/* Cultural DNA Explorer */}
          <button
            onClick={() => onOpenDNA(element)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>सांस्कृतिक संबंध देखें (Cultural DNA Explorer)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/30 text-amber-200 font-extrabold">
              हीटमैप ↗
            </span>
          </button>

          {/* Story Map */}
          {hasStory && (
            <button
              onClick={() => onOpenStory(element)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>लोकगाथा व मौखिक कथा सुनें (Story Map)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/30 text-teal-200 font-extrabold">
                कथा ↗
              </span>
            </button>
          )}

          {/* Timeline Event (Kathak) */}
          {hasTimeline && (
            <button
              onClick={() => onOpenTimeline(element)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" />
                <span>ऐतिहासिक समयरेखा (1200 - 2026 Timeline)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/30 text-purple-200 font-extrabold">
                समयरेखा ↗
              </span>
            </button>
          )}

          {/* Commerce Hook */}
          {hasCommerce && (
            <button
              onClick={() => onOpenCommerce(element)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>कारीगर परंपरा का समर्थन करें (Support Tradition)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 font-extrabold">
                शिल्पसेतु ↗
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Verified Sources Citation Section */}
      <div className="pt-3 border-t border-slate-800">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>सत्यापित प्रामाणिक स्रोत (Verified Sources)</span>
        </div>
        <div className="space-y-1">
          {element.sources && element.sources.map((src, idx) => (
            <a
              key={idx}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/60 text-[10px] text-sky-400 hover:text-sky-300 transition-colors group"
            >
              <span className="truncate pr-2 font-medium">{src.title}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
