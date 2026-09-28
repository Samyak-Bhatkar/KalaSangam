import React from 'react';
import { Sparkles, RotateCcw, Database, PlayCircle, KeyRound, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { CULTURAL_TYPES } from '../utils/constants';

export const DEMO_SCENES = [
  { key: '1', title: '1. अखिल भारतीय सांस्कृतिक स्तर', desc: 'All 10 Cultural Layers Overview' },
  { key: '2', title: '2. प्रामाणिक डॉसियर', desc: 'Warli Painting Dossier & Metadata' },
  { key: '3', title: '3. सांस्कृतिक जीनोम व हीटमैप', desc: 'Cultural DNA & Similarity Heatmap' },
  { key: '4', title: '4. मौखिक लोककथा व वाचन', desc: 'Story Map with Web Speech Narration' },
  { key: '5', title: '5. स्थानिक-कालिक समयरेखा', desc: 'Kathak 1200-2026 Temporal Slider' },
  { key: '6', title: '6. अपरिचित भारत (दुर्लभता ≥ 4)', desc: 'Unknown India Discovery Mode' },
  { key: '7', title: '7. क्यूरेटेड सांस्कृतिक यात्रा', desc: 'Mumbai-Nashik-Sambhajinagar Route' }
];

export default function DemoControlBar({
  isDemoActive = false,
  activeScene = '1',
  onTriggerScene = () => {},
  onReset = () => {},
  onOpenSources = () => {}
}) {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-30 select-none">
      {/* Title & Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-terracotta flex items-center justify-center text-slate-950 font-black shadow-md">
          <Sparkles className="w-4 h-4 fill-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white tracking-wide">
              भारत सांस्कृतिक जीनोम (Bharat Cultural Genome)
            </h1>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
              SIH 2026 • PS 26197
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            स्थानिक सांस्कृतिक स्तर, संबंध, लोककथाएं व ऐतिहासिक समयरेखा
          </p>
        </div>
      </div>

      {/* Demo Scene Quick Keys (1-7) */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <span className="text-[10px] font-black uppercase text-amber-400 px-1.5 flex items-center gap-1">
          <KeyRound className="w-3 h-3" />
          <span>डेमो दृश्य (1-7):</span>
        </span>
        {DEMO_SCENES.map((scene) => {
          const isActive = activeScene === scene.key;
          return (
            <button
              key={scene.key}
              onClick={() => onTriggerScene(scene.key)}
              title={`${scene.title}: ${scene.desc}`}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="font-mono">{scene.key}</span>
            </button>
          );
        })}
      </div>

      {/* Action Controls: Reset & Sources */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSources}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>डेटा व स्रोत (Sources)</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          title="Reset map view and active overlays"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>रीसेट (Reset)</span>
        </button>
      </div>
    </header>
  );
}

export function DataSourcesModal({
  isOpen = false,
  onClose = () => {},
  elements = [],
  relations = [],
  stories = [],
  timelineEvents = []
}) {
  if (!isOpen) return null;

  // Aggregate stats per type
  const typeCounts = {};
  elements.forEach((el) => {
    typeCounts[el.type] = (typeCounts[el.type] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  सांस्कृतिक जीनोम डेटाबेस व सत्यापन स्रोत
                </h3>
                <p className="text-xs text-slate-400">
                  Data & Verified Sources Registry • SIH 2026 (Heritage & Culture)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Counts Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">सांस्कृतिक इकाइयाँ</div>
              <div className="text-xl font-black text-amber-400">{elements.length}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">संबंध (Relations)</div>
              <div className="text-xl font-black text-cyan-400">{relations.length}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">मौखिक कथाएं</div>
              <div className="text-xl font-black text-teal-400">{stories.length}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">समयरेखा पड़ाव</div>
              <div className="text-xl font-black text-purple-400">{timelineEvents.length}</div>
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
            <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
              इकाई-वार प्रामाणिक संदर्भ सूची (Itemized Sources)
            </div>

            {elements.map((el) => (
              <div key={el.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-white">
                    {el.name_hi} ({el.name_en})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {el.type}
                  </span>
                </div>
                <div className="space-y-1 mt-1.5">
                  {el.sources && el.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-[11px] text-sky-400 hover:text-sky-300 group"
                    >
                      <span className="truncate pr-2">🔗 {s.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
