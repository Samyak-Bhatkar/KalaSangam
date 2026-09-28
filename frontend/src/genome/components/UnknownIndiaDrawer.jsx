import React from 'react';
import { Compass, Sparkles, X, ChevronRight, Eye, AlertCircle, Award } from 'lucide-react';
import { RARITY_LABELS } from '../utils/constants';

const DID_YOU_KNOW_FACTS = {
  'rogan-art': 'क्या आप जानते हैं? निरोणा की रोगन कला पूरे विश्व में केवल एक ही परिवार द्वारा जीवित रखी गई है। इसमें किसी ब्रश का उपयोग नहीं होता, केवल अरंडी के गाढ़े तेल को धातु की सुई से हवा में घुमाकर बारीक धागों की तरह कपड़े पर बुना जाता है।',
  'tarpa-instrument': 'क्या आप जानते हैं? तारपा वाद्य बजाते समय वादक कभी भी नर्तकों की ओर पीठ नहीं कर सकता। गोल घेरे में घूमते सौ से अधिक वारली नर्तक बिना किसी निर्देश के केवल तारपा की सांसों की गति पर अपनी चाल बदलते हैं।',
  'bohada-festival': 'क्या आप जानते हैं? बोहड़ा उत्सव में पहने जाने वाले 52 मुखौटों में से कुछ का वजन 15 किलोग्राम से अधिक होता है। इन्हें केवल वही कलाकार पहन सकते हैं जिनकी पीढ़ियां तीन सौ वर्षों से यह दायित्व निभाती आ रही हैं।'
};

export default function UnknownIndiaDrawer({
  discoveryElements = [],
  onSelectElement = () => {},
  onClose = () => {}
}) {
  return (
    <div className="w-full md:w-[400px] bg-slate-900/95 backdrop-blur-xl border border-orange-500/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar glow-terracotta">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-orange-500/20 text-orange-300 font-black uppercase tracking-wider">
                  अपरिचित भारत (Unknown India)
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-red-500/20 text-red-300 font-extrabold">
                  दुर्लभता ≥ 4
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                सूक्ष्म-धरोहर अन्वेषण
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

        {/* Highlight Banner */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-red-500/15 to-amber-500/15 border border-orange-500/30 text-xs text-orange-200">
          <div className="flex items-center gap-2 font-bold mb-1">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>विलुप्तप्राय व सूक्ष्म-परंपराओं की खोज:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            मुख्यधारा के पर्यटन से दूर, भारत के दूरस्थ गांवों में आज भी ऐसी अद्भूत कलाएं जीवित हैं जिन्हें देखने का अवसर बहुत कम लोगों को मिलता है।
          </p>
        </div>

        {/* Discovery Elements List */}
        <div className="space-y-3 mb-4">
          <div className="text-[11px] font-black uppercase text-slate-300 tracking-wider">
            पहचानी गई दुर्लभ धरोहरें ({discoveryElements.length})
          </div>

          {discoveryElements.map((el) => {
            const fact = DID_YOU_KNOW_FACTS[el.id] || `${el.name_hi} अत्यंत दुर्लभ स्थानीय परंपरा है जिसे आज भी स्थानीय कारीगर सहेज रहे हैं।`;
            const rarityInfo = RARITY_LABELS[el.rarity || 4];

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el)}
                className="group p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/60 transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-extrabold">
                    {el.place_name}, {el.state}
                  </span>
                  <span className="text-xs font-black text-amber-400">
                    {rarityInfo.stars}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                      {el.name_hi}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {el.name_en}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* Did You Know? Card */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-[11px] text-amber-200/90 leading-relaxed font-normal">
                  <div className="flex items-center gap-1 text-[10px] font-black text-orange-400 uppercase tracking-wider mb-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>क्या आप जानते हैं? (Did You Know?)</span>
                  </div>
                  {fact}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer text-center"
      >
        डिस्कवरी मोड बंद करें
      </button>
    </div>
  );
}
