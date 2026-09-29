import React, { useState } from 'react';
import { Route, MapPin, ChevronRight, X, Sparkles, Navigation, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CURATED_JOURNEY = {
  id: 'maharashtra-golden-heritage',
  title_en: 'Maharashtra Living Heritage Trail',
  title_hi: 'महाराष्ट्र जीवंत धरोहर मार्ग',
  distance: '340 km',
  duration: '3 Days / 2 Nights',
  stops: [
    {
      id: 'mumbai',
      city: 'Mumbai',
      city_hi: 'मुंबई',
      theme: 'कोली लोकगीत व ईस्ट इंडियन विरासत',
      theme_en: 'Coastal Koli Music & East Indian Culinary Heritage',
      lat: 19.0760,
      lng: 72.8777,
      elements: ['koli_songs', 'east_indian_khuddi_curry'],
      highlights: 'माहिम व वरली कोलीवाडा के ब्रास बैंड लोकगीत, ऐतिहासिक ईस्ट इंडियन खुड्डी करी परंपरा'
    },
    {
      id: 'nashik',
      city: 'Western Maharashtra & Konkan',
      city_hi: 'पश्चिम महाराष्ट्र व कोंकण',
      theme: 'मिसळ परंपरा व सावंतवाड़ी काष्ठकला',
      theme_en: 'Spicy Misal Soul & Sawantwadi Woodcraft',
      lat: 16.7050,
      lng: 74.2433,
      elements: ['misal_pav', 'sawantwadi_wooden_craft'],
      highlights: 'कोल्हापुरी व पुणेरी तीखी तर्री मिसळ पाव, सावंतवाड़ी के हाथ से रंगे पारंपरिक लकड़ी के खिलौने'
    },
    {
      id: 'sambhajinagar',
      city: 'Chhatrapati Sambhajinagar',
      city_hi: 'छत्रपति संभाजीनगर (पैठण)',
      theme: 'एलोरा शैलकृत गुफाएं व शाही पैठणी',
      theme_en: 'Monolithic Cave Wonders, Himroo & Royal Paithani',
      lat: 20.0258,
      lng: 75.1780,
      elements: ['ellora_caves', 'paithani_sari', 'himroo'],
      highlights: 'आकाश से नीचे तराशा गया कैलाश मंदिर, प्रतिष्ठान की स्वर्ण-ज़री पैठणी साड़ी व ऐतिहासिक हिमरू वस्त्र'
    }
  ]
};

export default function JourneyPlanner({
  activeStopIndex = 0,
  onSelectStop = () => {},
  onClose = () => {}
}) {
  return (
    <div className="w-full md:w-[420px] bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar glow-cyan">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-black uppercase tracking-wider">
                क्यूरेटेड सांस्कृतिक यात्रा (Heritage Trail)
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                {CURATED_JOURNEY.title_hi}
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

        {/* Trail Info Bar */}
        <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">मार्ग:</span>
            <span className="font-extrabold text-white">मुंबई → नासिक → संभाजीनगर</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold block">{CURATED_JOURNEY.distance}</span>
            <span className="text-[10px] text-slate-300">{CURATED_JOURNEY.duration}</span>
          </div>
        </div>

        {/* Trail Stops List */}
        <div className="space-y-3 mb-4">
          <div className="text-[11px] font-black uppercase text-slate-300 tracking-wider">
            यात्रा पड़ाव (3 Heritage Stops)
          </div>

          {CURATED_JOURNEY.stops.map((stop, idx) => {
            const isCurrent = activeStopIndex === idx;

            return (
              <div
                key={stop.id}
                onClick={() => onSelectStop(idx, stop)}
                className={`group p-3.5 rounded-2xl border transition-all cursor-pointer shadow-md ${
                  isCurrent
                    ? 'bg-slate-950 border-emerald-400 ring-1 ring-emerald-400/50 scale-[1.02]'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-black text-white">
                      {stop.city_hi}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold">
                    {stop.theme}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium ml-7 mb-1">
                  {stop.city} ({stop.theme_en})
                </p>

                <p className="text-[11px] text-slate-400 ml-7 leading-relaxed bg-black/30 p-2 rounded-xl border border-slate-800/60">
                  {stop.highlights}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer text-center"
      >
        यात्रा मार्ग बंद करें
      </button>
    </div>
  );
}
