import React from 'react';
import { GitFork, Sparkles, X, ChevronRight, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { CULTURAL_TYPES } from '../utils/constants';

const RELATION_KIND_LABELS = {
  uses: { label: 'उपयोग करता है (Uses/Accompanies)', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  celebrated_at: { label: 'उत्सव में चित्रित (Celebrated At)', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  related: { label: 'सांस्कृतिक समानता (Cosmological Tie)', color: 'text-sky-400', bg: 'bg-sky-500/20' },
  same_family: { label: 'समान भाषिक/पारिवारिक परंपरा (Same Family)', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  influenced: { label: 'ऐतिहासिक प्रेरणा (Stylistic Influence)', color: 'text-pink-400', bg: 'bg-pink-500/20' }
};

export default function CulturalDNAExplorer({
  originElement = null,
  relations = [],
  onSelectNode = () => {},
  onClose = () => {}
}) {
  if (!originElement) return null;

  const originTypeConfig = CULTURAL_TYPES[originElement.type] || CULTURAL_TYPES.craft;

  return (
    <div className="w-full md:w-[420px] bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar glow-amber">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-black uppercase tracking-wider">
                  सांस्कृतिक जीनोम संबंध
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  <span>हीटमैप सक्रिय</span>
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                Cultural DNA Explorer
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

        {/* Origin Hero Card */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-amber-500/40 shadow-inner">
          <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>मूल सांस्कृतिक केंद्र (Origin Hub):</span>
          </div>
          <h4 className="text-lg font-black text-white">
            {originElement.name_hi}
          </h4>
          <p className="text-xs text-slate-300 font-medium">
            {originElement.name_en} • <span className="text-amber-300">{originElement.place_name}, {originElement.state}</span>
          </p>
          <div className="mt-2 text-[11px] text-slate-400 bg-black/40 p-2 rounded-xl border border-slate-800 leading-relaxed">
            मानचित्र पर सीमाओं के पार बहने वाली सांस्कृतिक समानताएं चमकीले हीटमैप और संबंधों द्वारा दर्शायी गई हैं।
          </div>
        </div>

        {/* Semantic Connection Links */}
        <div className="space-y-3 mb-4">
          <div className="text-[11px] font-black uppercase text-slate-300 tracking-wider flex items-center justify-between">
            <span>संबद्ध परंपराएं ({relations.length} Connections)</span>
            <span className="text-[10px] text-slate-500 font-normal">क्लिक करके केंद्र बदलें</span>
          </div>

          {relations.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              इस परंपरा से जुड़े प्रत्यक्ष संबंध अभी शोध प्रक्रिया में हैं।
            </div>
          ) : (
            relations.map((rel, idx) => {
              const target = rel.targetElement;
              const kindCfg = RELATION_KIND_LABELS[rel.kind] || RELATION_KIND_LABELS.related;
              const targetTypeCfg = CULTURAL_TYPES[target.type] || CULTURAL_TYPES.craft;
              const weightPercent = Math.round((rel.weight || 0.8) * 100);

              return (
                <div
                  key={idx}
                  onClick={() => onSelectNode(target)}
                  className="group p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/60 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${kindCfg.bg} ${kindCfg.color}`}>
                      {kindCfg.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {weightPercent}% सादृश्य
                      </span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full"
                          style={{ width: `${weightPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {target.name_hi}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {target.name_en} ({target.place_name}, {target.state})
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  {/* Why Related Rationale */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-normal bg-black/20 p-2 rounded-xl">
                    <span className="font-bold text-amber-300">संबंध का कारण: </span>
                    {rel.rationale}
                  </div>

                  {/* Source */}
                  <div className="mt-1 text-[9px] text-slate-500 italic truncate">
                    स्रोत: {rel.source}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer text-center"
      >
        एक्सप्लोरर बंद करें व मुख्य मानचित्र पर लौटें
      </button>
    </div>
  );
}
