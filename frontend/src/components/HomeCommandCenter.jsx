import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Mic,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Volume2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  FileText,
  Trash2,
  Clock,
  ArrowRight,
  PhoneCall,
  Eye,
  Award,
  AlertCircle,
  Activity,
  Check,
  X
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import {
  fetchArtisanTrustScore,
  fetchSellerRealityCheck,
  trackProductView
} from '../services/api';

export default function HomeCommandCenter() {
  const {
    setCurrentStep,
    speakVoice,
    language,
    savedDrafts,
    resumeDraft,
    discardDraft,
    setActiveModal
  } = useArtisan();

  // Carousel State & Refs
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingSlideIndex, setSpeakingSlideIndex] = useState(null);
  const carouselRef = useRef(null);

  // Slide 2: Trust Score State
  const [trustScoreData, setTrustScoreData] = useState({
    score: 620,
    tier_key: 'silver',
    tier_name_hi: 'चांदी स्तर (Silver)',
    tier_name_en: 'Silver Tier',
    credit_limit_inr: 15000,
    next_tier_name_hi: 'स्वर्ण स्तर (Gold)',
    next_tier_name_en: 'Gold Tier',
    points_to_next_tier: 130,
    voice_narration_hi: 'आपका कारीगर भरोसा स्कोर 620 है, चांदी स्तर (Silver)। आपकी आसान माइक्रो-क्रेडिट सीमा ₹15,000 है! अगले स्वर्ण स्तर के लिए 130 अंक बाकी हैं।',
    voice_narration_en: 'Your Karigar Trust Score is 620, Silver Tier. Your micro-credit limit is ₹15,000. You need 130 more points to unlock Gold Tier.',
    recent_events: [
      { id: 'EVT-01', delta: 20, title_hi: '+20: 30 दिनों में 4+ नई कलाकृतियां जोड़ीं', title_en: '+20: Active cataloging bonus (4+ listings)', timestamp: '3 दिन पहले' },
      { id: 'EVT-02', delta: 15, title_hi: '+15: 24 घंटे में समय पर शिपिंग', title_en: '+15: Fast dispatch within 24hrs', timestamp: '5 दिन पहले' },
      { id: 'EVT-03', delta: 10, title_hi: '+10: 5-स्टार खरीदार संतुष्टि', title_en: '+10: 5-star verified buyer review', timestamp: '1 सप्ताह पहले' }
    ]
  });
  const [isScoreHistoryOpen, setIsScoreHistoryOpen] = useState(false);

  // Slide 3: Reality Check State
  const [realityCheckData, setRealityCheckData] = useState({
    views_this_week: 214,
    sales_this_week: 0,
    diagnosis_hi: 'बहुत लोग देख रहे हैं पर खरीद नहीं रहे — कीमत जांचें',
    diagnosis_en: 'Many people are viewing but not buying — check your price',
    price_floor_inr: 320.0,
    current_product_price_inr: 450.0,
    ai_suggested_price_inr: 390.0,
    is_rare_item: true,
    rare_benchmark_range_inr: '₹800–₹1,200',
    voice_narration_hi: 'इस हफ्ते 214 खरीदारों ने आपका शिल्प देखा, पर कोई बिक्री नहीं हुई। बहुत लोग देख रहे हैं पर खरीद नहीं रहे — कीमत जांचें। आपकी न्यूनतम उचित लागत ₹320 है, और AI का सुझाव ₹390 है।',
    voice_narration_en: '214 buyers viewed your craft this week with zero sales. Many people are viewing but not buying — check your price. Your fair living-wage floor is ₹320, and the AI suggests adjusting to ₹390.'
  });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [appliedPriceSuccess, setAppliedPriceSuccess] = useState(false);

  // Fetch Live Cockpit Data on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadCockpitData() {
      try {
        const [scoreRes, realityRes] = await Promise.all([
          fetchArtisanTrustScore('ART-NBCFDC-8492'),
          fetchSellerRealityCheck('ART-NBCFDC-8492', 'CRAFT-NBCFDC-002')
        ]);
        if (isMounted) {
          if (scoreRes && scoreRes.score) setTrustScoreData(scoreRes);
          if (realityRes && realityRes.views_this_week !== undefined) setRealityCheckData(realityRes);
        }
      } catch (err) {
        console.warn('Using seeded data for cockpit:', err);
      }
    }
    loadCockpitData();
    return () => { isMounted = false; };
  }, []);

  // Smooth Carousel Scroll Handler
  const scrollToSlide = (index) => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      });
      setActiveSlideIndex(index);
    }
  };

  const handleCarouselScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth || 1;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex >= 0 && newIndex <= 2 && newIndex !== activeSlideIndex) {
      setActiveSlideIndex(newIndex);
    }
  };

  // Auto-advance Carousel every 7.5 seconds ONLY when not paused, modal closed, and NOT speaking
  // Once the speaker finishes speaking, speakingSlideIndex resets to null and timer starts fresh
  useEffect(() => {
    if (isPaused || showPriceModal || speakingSlideIndex !== null) return;
    const interval = setInterval(() => {
      const nextIndex = (activeSlideIndex + 1) % 3;
      scrollToSlide(nextIndex);
    }, 7500);
    return () => clearInterval(interval);
  }, [activeSlideIndex, isPaused, showPriceModal, speakingSlideIndex]);

  // If user manually swipes away from the speaking slide, stop the audio cleanly
  useEffect(() => {
    if (speakingSlideIndex !== null && speakingSlideIndex !== activeSlideIndex) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingSlideIndex(null);
    }
  }, [activeSlideIndex, speakingSlideIndex]);

  // Clean up ongoing speech if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Unified Voice Readout with Auto-Advance Freeze
  const speakSlideAudio = (slideIdx, text, langCode = 'hi-IN') => {
    // If clicking on currently active speech, toggle it off
    if (speakingSlideIndex === slideIdx) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingSlideIndex(null);
      return;
    }

    setSpeakingSlideIndex(slideIdx);
    speakVoice(text, langCode, () => {
      // Audio speech completed: release lock so the auto-advance timer starts fresh
      setSpeakingSlideIndex(null);
    });
  };

  const handleApplyPriceSuggestion = () => {
    setAppliedPriceSuccess(true);
    const msg = language === 'hi'
      ? 'सफलतापूर्वक नई कीमत ₹390 लागू कर दी गई है! आपकी कमाई सुरक्षित है।'
      : 'Successfully updated price to ₹390! Living wage is secured.';
    speakVoice(msg, language === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => {
      setShowPriceModal(false);
      setAppliedPriceSuccess(false);
    }, 1800);
  };

  return (
    <div className="p-4 space-y-5 pb-24 select-none">
      {/* 1. HORIZONTALLY SWIPEABLE HERO COCKPIT CAROUSEL */}
      <section className="relative">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth rounded-3xl gap-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {/* SLIDE 1: EARNINGS & TRUST STATUS (Preserved Exactly) */}
          <div className="min-w-full shrink-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#2B4491] to-[#156A57] text-white p-5 shadow-xl min-h-[220px] flex flex-col justify-between">
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
                onClick={() => speakSlideAudio(
                  0,
                  language === 'hi'
                    ? 'आपकी इस महीने की सीधी कमाई अठारह हज़ार चार सौ पचास रुपये है, जो बिचौलियों से अड़तीस प्रतिशत अधिक है!'
                    : 'Your monthly direct net earnings are ₹18,450, 38% higher than middleman sales!',
                  language === 'hi' ? 'hi-IN' : 'en-IN'
                )}
                aria-label="Listen to monthly earnings aloud"
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer shrink-0 mt-1 ${
                  speakingSlideIndex === 0
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-white/60 animate-pulse scale-105'
                    : 'bg-white text-[#1E3A8A] hover:bg-slate-50'
                }`}
              >
                <Volume2 className={`w-5 h-5 ${speakingSlideIndex === 0 ? 'animate-bounce' : ''}`} />
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  सीधे बैंक खाते में जमा
                </span>
              </div>

              {/* Trend Pill */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md self-start text-white text-[11px] font-bold">
                <TrendingUp className="w-4 h-4 text-amber-300" />
                <span>+38% मुनाफ़ा (बिचौलियों से सीधे ONDC पर बचत)</span>
              </div>
            </div>
          </div>

          {/* SLIDE 2: KARIGAR TRUST SCORECARD (Micro-Credit Score) */}
          <div className="min-w-full shrink-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#451A03] to-[#78350F] text-white p-5 shadow-xl min-h-[220px] flex flex-col justify-between">
            {/* Subtle Decorative Pattern */}
            <div className="absolute -right-6 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

            {/* Top Identity Row */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shadow-md shrink-0">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold text-amber-300">
                      कारीगर साख
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200/25 border border-slate-300/40 text-slate-100 text-[10px] font-extrabold tracking-wide">
                      {trustScoreData.tier_name_hi}
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                    कारीगर भरोसा स्कोर (CIBIL)
                  </h2>
                </div>
              </div>

              <button
                onClick={() => speakSlideAudio(
                  1,
                  language === 'hi'
                    ? (trustScoreData.voice_narration_hi || 'आपका भरोसा स्कोर 620 है, चांदी स्तर। आपकी क्रेडिट सीमा ₹15,000 है!')
                    : (trustScoreData.voice_narration_en || 'Your trust score is 620, Silver Tier. Your micro-credit limit is ₹15,000!'),
                  language === 'hi' ? 'hi-IN' : 'en-IN'
                )}
                aria-label="Listen to trust score aloud"
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer shrink-0 mt-1 ${
                  speakingSlideIndex === 1
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-white/60 animate-pulse scale-105'
                    : 'bg-white text-[#78350F] hover:bg-slate-50'
                }`}
              >
                <Volume2 className={`w-5 h-5 ${speakingSlideIndex === 1 ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            {/* Central Score Metric */}
            <div className="mt-3 pt-2 relative z-10 border-t border-white/10 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {trustScoreData.score}
                  </span>
                  <span className="text-xs text-amber-200 font-bold">
                    / 850 CIBIL
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-black shadow-xs">
                  क्रेडिट सीमा: ₹{trustScoreData.credit_limit_inr.toLocaleString()}
                </span>
              </div>

              {/* Progress to Next Tier */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-100 font-medium">
                  <span>अगला स्तर: {trustScoreData.next_tier_name_hi}</span>
                  <span className="font-bold text-amber-300">
                    +{trustScoreData.points_to_next_tier} अंक बाकी
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(10, ((trustScoreData.score - 300) / 550) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Expandable Why Changed Accordion */}
              <div className="mt-1">
                <button
                  onClick={() => setIsScoreHistoryOpen(!isScoreHistoryOpen)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>क्यों बदला? (स्कोर इतिहास)</span>
                  {isScoreHistoryOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isScoreHistoryOpen && (
                  <div className="mt-2 space-y-1.5 bg-black/25 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 text-[10px] animate-fadeIn">
                    {trustScoreData.recent_events?.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between gap-2 text-slate-100">
                        <span className="font-medium truncate">{ev.title_hi}</span>
                        <span className="font-bold text-emerald-300 shrink-0">{ev.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLIDE 3: PRICE REALITY CHECK & CONVERSION COCKPIT */}
          <div className="min-w-full shrink-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#042F2E] via-[#0E4957] to-[#164E63] text-white p-5 shadow-xl min-h-[220px] flex flex-col justify-between">
            {/* Subtle Decorative Pattern */}
            <div className="absolute -right-6 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

            {/* Top Identity Row */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-md shrink-0">
                  <Activity className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold text-cyan-300">
                      सेलर एनालिटिक्स
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 text-[9px] font-bold">
                      कीमत संतुलन
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                    प्राइस रियलिटी चेक (बाज़ार मांग)
                  </h2>
                </div>
              </div>

              <button
                onClick={() => speakSlideAudio(
                  2,
                  language === 'hi'
                    ? (realityCheckData.voice_narration_hi || 'इस हफ्ते 214 लोगों ने देखा पर कोई बिक्री नहीं हुई। बहुत लोग देख रहे हैं पर खरीद नहीं रहे — AI कीमत सुझाव लें।')
                    : (realityCheckData.voice_narration_en || '214 views this week with zero sales. Many people are viewing but not buying — check your price.'),
                  language === 'hi' ? 'hi-IN' : 'en-IN'
                )}
                aria-label="Listen to price reality check aloud"
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer shrink-0 mt-1 ${
                  speakingSlideIndex === 2
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-white/60 animate-pulse scale-105'
                    : 'bg-white text-[#0E4957] hover:bg-slate-50'
                }`}
              >
                <Volume2 className={`w-5 h-5 ${speakingSlideIndex === 2 ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            {/* Two Side-by-Side Stat Blocks */}
            <div className="mt-3 pt-2 relative z-10 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-black text-white leading-tight">
                      {realityCheckData.views_this_week}
                    </div>
                    <div className="text-[10px] text-cyan-200 font-medium truncate">
                      हफ्ते के व्यूज
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-black text-white leading-tight">
                      {realityCheckData.sales_this_week}
                    </div>
                    <div className="text-[10px] text-amber-200 font-medium truncate">
                      हफ्ते की बिक्री
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Diagnosis Alert Bar */}
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="text-[10px] text-white font-bold truncate">
                    {realityCheckData.diagnosis_hi}
                  </span>
                </div>
                <button
                  onClick={() => setShowPriceModal(true)}
                  className="px-2 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>AI सुझाव</span>
                </button>
              </div>

              {/* Living Wage Guardrail Note */}
              <div className="flex items-center justify-between text-[10px] text-cyan-100 px-0.5">
                <span>न्यूनतम उचित कीमत: ₹{realityCheckData.price_floor_inr}</span>
                <span className="text-amber-200 font-semibold">दुर्लभ शिल्प: {realityCheckData.rare_benchmark_range_inr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pagination Dots */}
        <div className="flex items-center justify-center gap-2 pt-2.5 pb-0.5">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlideIndex === idx
                  ? 'w-7 bg-amber-500 shadow-sm shadow-amber-500/50'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* AI PRICE SUGGESTION INTERACTIVE MODAL */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-200">
            <button
              onClick={() => setShowPriceModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-cyan-800 font-extrabold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI डायनामिक कीमत सुझाव</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              व्यूज अधिक हैं पर बिक्री नहीं हो रही। AI ने उचित पारिश्रमिक के आधार पर यह सुझाव दिया है:
            </p>

            <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>वर्तमान निर्धारित मूल्य:</span>
                <span className="font-bold text-slate-900 line-through">₹450</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>सांविधिक न्यूनतम लागत (Wage Floor):</span>
                <span className="font-bold">₹320</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-extrabold text-slate-900">AI अनुशंसित मूल्य:</span>
                <span className="text-xl font-black text-amber-600">₹390</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium bg-amber-50 text-amber-800 p-2 rounded-xl border border-amber-200">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>अपेक्षित रूपांतरण: +45% बिक्री संभावना (लागत से ₹70 सुरक्षित लाभ)</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setShowPriceModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleApplyPriceSuggestion}
                disabled={appliedPriceSuccess}
                className="flex-1 py-2.5 rounded-2xl bg-[#0E4957] hover:bg-[#0A3D36] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer disabled:opacity-70"
              >
                {appliedPriceSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>लागू हो गया!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>मूल्य लागू करें (₹390)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


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

        {/* Option C: Zero-Smartphone Conversational Voice-IVR Keypad Simulator */}
        <button
          onClick={() => setActiveModal('ivr')}
          className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#122216] text-white p-4 shadow-lg hover:shadow-xl flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer border border-emerald-500/40"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-black text-white">
                  कला-वाणी IVR (Zero-Smartphone Tier)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-500/30 uppercase tracking-wide">
                  कीपैड फोन सिम्युलेटर
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                बिना इंटरनेट या कैमरा • 1800-208-SHILP पर कॉल करके आवाज से लिस्ट करें
              </p>
              <div className="flex items-center gap-2 mt-1 text-[9px] text-emerald-400 font-semibold font-mono">
                <span>Bhashini ASR</span>
                <span>•</span>
                <span>DTMF 1/2/3</span>
                <span>•</span>
                <span>समन्वयक SMS</span>
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>


      </section>

      {/* 2.5 DRAFTS DOCK: UNPUBLISHED CRAFTS (LAZY AUTO-CLEANUP IN 24H) */}
      {savedDrafts && savedDrafts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>अधूरे ड्राफ्ट</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {savedDrafts.length}
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>24 घंटे में स्वतः साफ़</span>
            </div>
          </div>

          <div className="space-y-2">
            {savedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {draft.studio_image_url || draft.raw_image_url ? (
                      <img
                        src={draft.studio_image_url || draft.raw_image_url}
                        alt="Draft"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {draft.title_hi || draft.title_en || 'अप्रकाशित कलाकृति'}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-amber-800">
                        ₹{draft.b2c_price || '—'}
                      </span>
                      <span className="text-[9px] text-slate-400">•</span>
                      <span className="text-[9px] text-amber-700 font-medium">
                        सुरक्षित ड्राफ्ट
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => discardDraft(draft.id)}
                    title="हटाएं (Discard draft)"
                    className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => resumeDraft(draft)}
                    className="py-1.5 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>जारी रखें</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
