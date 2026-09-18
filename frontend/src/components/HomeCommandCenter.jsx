import React from 'react';
import {
  Camera,
  Mic,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Volume2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

export default function HomeCommandCenter() {
  const { setCurrentStep, speakVoice, language } = useArtisan();

  const handleEarningsAudio = () => {
    const text = language === 'hi'
      ? 'आपकी इस महीने की सीधी कमाई अठारह हज़ार चार सौ पचास रुपये है, जो बिचौलियों से अड़तीस प्रतिशत अधिक है!'
      : 'Your monthly direct net earnings are ₹18,450, 38% higher than middleman sales!';
    speakVoice(text, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  return (
    <div className="p-4 space-y-5 pb-24 select-none">
      {/* 1. Welcome & Direct Daily Earnings Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#2B4491] to-[#156A57] text-white p-5 shadow-xl">
        {/* Subtle Decorative Pattern */}
        <div className="absolute -right-6 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

        {/* Top Identity Row */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/artisan_shanti_devi.png"
              alt="Shanti Devi"
              className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold text-amber-300">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  NBCFDC #8492
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-[9px] font-bold">
                  सत्यापित
                </span>
              </div>

              <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-1">
                <span>नमस्ते, शांति देवी</span>
              </h2>
            </div>
          </div>

          <button
            onClick={handleEarningsAudio}
            aria-label="Listen to monthly earnings aloud"
            className="w-10 h-10 rounded-full bg-white text-[#1E3A8A] flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer shrink-0 mt-1"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Central Earnings Metric */}
        <div className="mt-4 pt-3 relative z-10 border-t border-white/10 flex flex-col gap-1">
          <span className="text-xs text-blue-200 font-medium">
            इस महीने की कुल सीधी कमाई (Monthly Net)
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-black text-white tracking-tight">
              ₹18,450
            </span>
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              सीधे बैंक खाते में जमा
            </span>
          </div>

          {/* Trend Pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md self-start text-white text-[11px] font-bold">
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>+38% मुनाफ़ा (बिचौलियों से सीधे ONDC पर बचत)</span>
          </div>
        </div>
      </section>

      {/* 2. HERO 3-TAP ACTION TRIGGER AREA (Massive Touch Targets >= 60px) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#C85A32] rounded-full" />
            <h3 className="text-base font-extrabold text-slate-900">
              तुरंत नया सामान जोड़ें <span className="text-xs font-normal text-slate-500">(1-टैप एक्शन)</span>
            </h3>
          </div>
          <span className="text-[10px] text-[#C85A32] font-bold bg-[#FFDBCF] px-2.5 py-0.5 rounded-full">
            सुपर-फ़ास्ट
          </span>
        </div>

        {/* Dual Touch Islands */}
        <div className="grid grid-cols-2 gap-3">
          {/* Option A: Snap Craft Photo */}
          <button
            onClick={() => setCurrentStep(1)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#C85A32] to-[#BF542C] text-white p-4 shadow-md hover:shadow-lg flex flex-col justify-between text-left h-[200px] active:scale-[0.97] transition-all cursor-pointer border border-[#E06D44]"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDBCF] text-[#390C00] text-[10px] font-extrabold">
                AI स्टूडियो
              </span>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="text-xl font-black text-white leading-tight">
                फोटो लें
              </div>
              <div className="text-xs font-bold text-amber-200">
                Snap Craft
              </div>
              <p className="text-[10px] text-white/90 mt-1 line-clamp-1">
                पृष्ठभूमि खुद हट जाएगी
              </p>
            </div>

            <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div className="w-2/3 h-full bg-amber-300 rounded-full" />
            </div>
          </button>

          {/* Option B: Voice Describe FAB */}
          <button
            onClick={() => setCurrentStep(2)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#D97706] to-[#B45309] text-white p-4 shadow-md hover:shadow-lg flex flex-col justify-between text-left h-[200px] active:scale-[0.97] transition-all cursor-pointer border border-amber-500"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="w-12 h-12 rounded-full bg-white text-[#825100] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 text-[#825100]" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                लाइव माइक
              </span>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="text-xl font-black text-white leading-tight">
                बोलकर बताएं
              </div>
              <div className="text-xs font-bold text-amber-100">
                Hold & Speak
              </div>
              <p className="text-[10px] text-white/90 mt-1 line-clamp-1 font-medium">
                हिन्दी, बुंदेली, मालवी
              </p>
            </div>

            <div className="flex items-end gap-1 h-2 mt-2 px-1">
              <span className="w-1.5 h-2 bg-white/80 rounded-full" />
              <span className="w-1.5 h-3 bg-white rounded-full" />
              <span className="w-1.5 h-1 bg-white/60 rounded-full" />
              <span className="w-1.5 h-3 bg-white rounded-full" />
              <span className="w-1.5 h-2 bg-white/80 rounded-full" />
            </div>
          </button>
        </div>
      </section>

      {/* 3. ARTISAN'S LIVE INVENTORY CAROUSEL */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#4059AA] rounded-full" />
            <h3 className="text-base font-extrabold text-slate-900">
              आपकी लाइव कलाकृतियां <span className="text-xs font-normal text-slate-500">(2 सक्रिय)</span>
            </h3>
          </div>
          <button
            onClick={() => setCurrentStep(3)}
            className="text-xs font-bold text-blue-700 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>सभी देखें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Items Cards */}
        <div className="space-y-2.5">
          {/* Item 1: Chanderi Silk Saree */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3">
            <img
              src="/chanderi_saree.png"
              alt="Chanderi Saree"
              className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">ONDC पर लाइव</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                शाही नीली चंदेरी सिल्क ज़री साड़ी
              </h4>
              <p className="text-xs font-bold text-amber-700">
                ₹3,200 • 18h श्रम
              </p>
            </div>
            <button
              onClick={() => speakVoice('शाही नीली चंदेरी सिल्क साड़ी, असली ज़री का काम, कीमत बत्तीस सौ रुपये, तुरंत बिक्री हेतु उपलब्ध है।', 'hi-IN')}
              className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 hover:bg-amber-100 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Item 2: Gorakhpur Terracotta Handi Pot */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3">
            <img
              src="/terracotta_pot.png"
              alt="Gorakhpur Terracotta"
              className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-blue-700 uppercase">GeM स्वीकृत</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                हस्तनिर्मित गोरखपुर टेराकोटा कलश
              </h4>
              <p className="text-xs font-bold text-amber-700">
                ₹1,150 • 6h श्रम
              </p>
            </div>
            <button
              onClick={() => speakVoice('हस्तनिर्मित गोरखपुर टेराकोटा कलश, प्राकृतिक लाल चिकनी मिट्टी, कीमत ग्यारह सौ पचास रुपये।', 'hi-IN')}
              className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 hover:bg-amber-100 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
