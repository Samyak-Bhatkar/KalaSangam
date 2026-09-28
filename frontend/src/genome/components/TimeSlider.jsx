import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, ChevronLeft, ChevronRight, X, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

const SNAPSHOTS = [1200, 1500, 1800, 1947, 2026];
const ERA_NAMES = {
  1200: { title_hi: '1200 ई. - मंदिर कथाकार युग', title_en: 'Temple Kathakar Era', tag: 'प्राचीन काल' },
  1500: { title_hi: '1500 ई. - वैष्णव भक्ति आंदोलन', title_en: 'Bhakti Raas-Leela Era', tag: 'मध्यकाल' },
  1800: { title_hi: '1800 ई. - अवध नवाब राजदरबार', title_en: 'Awadh Court & Lucknow Gharana', tag: 'दरबारी काल' },
  1947: { title_hi: '1947 ई. - स्वतंत्र भारत राष्ट्रीय रंगमंच', title_en: 'National Theatres & Academies', tag: 'आधुनिक काल' },
  2026: { title_hi: '2026 ई. - डिजिटल धरोहर व वैश्विक विस्तार', title_en: 'Global Living Heritage & AI', tag: 'वर्तमान' }
};

export default function TimeSlider({
  timelineEvents = [],
  onSelectEvent = () => {},
  onClose = () => {}
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeEvent = timelineEvents[activeIndex] || timelineEvents[0];

  useEffect(() => {
    if (activeEvent) {
      onSelectEvent(activeEvent);
    }
  }, [activeIndex, activeEvent]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % timelineEvents.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timelineEvents.length]);

  if (!activeEvent) return null;

  const era = ERA_NAMES[activeEvent.snapshot] || { title_hi: `${activeEvent.snapshot}`, title_en: '', tag: '' };

  return (
    <div className="w-full md:w-[450px] bg-slate-900/95 backdrop-blur-xl border border-purple-500/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar glow-cyan">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-black uppercase tracking-wider">
                स्थानिक-कालिक समयरेखा (Spatial-Temporal Slider)
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                कथक का ऐतिहासिक सफर (1200 - 2026)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Stepper Pills */}
        <div className="my-4">
          <div className="flex items-center justify-between gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {timelineEvents.map((evt, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={evt.snapshot}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveIndex(idx);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md scale-105 ring-1 ring-purple-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {evt.snapshot === 2026 ? 'Today' : evt.snapshot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Snapshot Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-500/30 shadow-inner space-y-3 mb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
              {era.tag} • {activeEvent.snapshot} CE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold flex items-center gap-1 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span>सत्यापित प्रमाण {Math.round(activeEvent.confidence * 100)}%</span>
            </span>
          </div>

          <div>
            <h4 className="text-lg font-black text-white">
              {era.title_hi}
            </h4>
            <h5 className="text-xs font-semibold text-slate-400">
              {era.title_en}
            </h5>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-black/40 p-2 rounded-xl border border-slate-800">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="font-semibold">{activeEvent.place}</span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-normal bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {activeEvent.event}
          </p>

          <div className="text-[10px] text-slate-500 italic pt-1 truncate">
            ऐतिहासिक संदर्भ: {activeEvent.source}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            setIsPlaying(false);
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : timelineEvents.length - 1));
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-black shadow-lg transition-all cursor-pointer active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>ऑटो-प्ले रोकें (Pause Era Tour)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>ऐतिहासिक यात्रा शुरू करें (Auto-Play Eras)</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            setActiveIndex((prev) => (prev + 1) % timelineEvents.length);
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
