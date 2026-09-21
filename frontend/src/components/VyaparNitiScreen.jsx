import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import {
  fetchVisualComps,
  fetchKarigarBazaarIndex,
  simulatePriceImpact,
  fetchVyaparNitiAnalysis,
  applyCraftPrice
} from '../services/api';

export default function VyaparNitiScreen({ onBack, productId = 'CRAFT-NBCFDC-002' }) {
  const { language, speakVoice } = useArtisan();

  // State Management
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [visualComps, setVisualComps] = useState([]);
  const [bazaarIndex, setBazaarIndex] = useState(null);
  const [statutoryFloor, setStatutoryFloor] = useState(320);
  const [candidatePrice, setCandidatePrice] = useState(360);
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Debounce ref for slider simulation calls
  const debounceTimerRef = useRef(null);

  // Initial Load: Fetch full 3-signal intelligence payload
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchVyaparNitiAnalysis({ productId, category: 'Terracotta & Clay Art' });
        if (!isMounted) return;
        if (res && res.analysis) {
          const a = res.analysis;
          setAnalysisData(a);
          setVisualComps(a.visual_comps || []);
          setBazaarIndex(a.karigar_bazaar_index);
          const floor = a.statutory_floor || 320;
          setStatutoryFloor(floor);
          const initialPrice = Math.max(floor, a.suggested_price || 360);
          setCandidatePrice(initialPrice);
          setSimulation(a.default_simulation);
        }
      } catch (err) {
        console.warn('Failed to load Vyapar-Niti analysis:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [productId]);

  // Handle Price Slider Change with Hard Statutory Floor Guard
  const handleSliderChange = (e) => {
    const rawVal = parseFloat(e.target.value);
    // Inviolable Living-Wage Floor Lower Bound
    const boundedVal = Math.max(statutoryFloor, rawVal);
    setCandidatePrice(boundedVal);

    // Debounce backend simulation call
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      setIsSimulating(true);
      try {
        const simRes = await simulatePriceImpact({
          candidatePrice: boundedVal,
          statutoryFloor,
          category: analysisData?.craft_category || 'Terracotta & Clay Art',
          productId
        });
        if (simRes && simRes.simulation) {
          setSimulation(simRes.simulation);
        }
      } catch (err) {
        console.warn('Live price simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 150);
  };

  // Hindi TTS Audio Readout
  const handleVoiceReadout = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = simulation?.voice_narration_hi || (
      `यदि आप ₹${candidatePrice} कीमत निर्धारित करते हैं, तो अनुमानित महीने की बिक्री ${simulation?.estimated_monthly_sales || 8} पीस होगी, जिससे लगभग ₹${simulation?.estimated_monthly_income || (candidatePrice * 8)} की आमदनी होगी। यह आपकी न्यूनतम लागत ₹${statutoryFloor} से सुरक्षित है।`
    );

    setIsSpeaking(true);
    speakVoice(textToSpeak, 'hi-IN', () => {
      setIsSpeaking(false);
    });
  };

  // Commit Price to Product Listing
  const handleApplyPrice = async () => {
    setIsApplying(true);
    try {
      await applyCraftPrice({ productId, price: candidatePrice });
      setApplySuccess(true);
      if (speakVoice) {
        speakVoice(
          `कीमत ₹${candidatePrice} सफलतापूर्वक आपके शिल्प पर लागू कर दी गई है।`,
          'hi-IN'
        );
      }
      setTimeout(() => {
        if (onBack) onBack();
      }, 1500);
    } catch (err) {
      console.error('Failed to apply price:', err);
      alert('कीमत लागू करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#07242B] text-slate-100 font-sans pb-16 animate-fadeIn select-none">
      {/* ==================================================================== */}
      {/* TOP APP BAR / NAVIGATION HEADER                                      */}
      {/* ==================================================================== */}
      <div className="sticky top-0 z-30 bg-[#07242B]/95 backdrop-blur-md border-b border-teal-800/40 px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-teal-900/40 hover:bg-teal-900/70 border border-teal-700/50 px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? 'डैशबोर्ड' : 'Back'}</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h1 className="text-sm font-black text-white tracking-tight">
              व्यापार-नीति (Vyapar-Niti)
            </h1>
          </div>
          <p className="text-[10px] text-teal-300/80 font-medium">
            कारीगर व्यक्तिगत बाज़ार डेटा विश्लेषक
          </p>
        </div>

        <button
          onClick={handleVoiceReadout}
          aria-label="Listen to pricing intelligence audio"
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300/60 animate-pulse'
              : 'bg-teal-900/60 text-amber-300 hover:bg-teal-800/80 border border-teal-700/50'
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* ==================================================================== */}
        {/* SECTION A: PRODUCT DOSSIER SUMMARY                                  */}
        {/* ==================================================================== */}
        <div className="p-3.5 rounded-2xl bg-[#0B3944] border border-teal-700/40 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-teal-500/30 shrink-0">
              <img
                src="/terracotta_pot.png"
                alt="Gorakhpur Terracotta Handi Pot"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/terracotta_pot_raw.png'; }}
              />
              <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-slate-950 text-[8px] font-black text-center py-0.5 uppercase">
                GI क्राफ्ट
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400">
                मिट्टी व टेराकोटा शिल्प • गोरखपुर क्लस्टर
              </span>
              <h2 className="text-sm font-bold text-white leading-snug truncate">
                हस्तनिर्मित गोरखपुर टेराकोटा पारंपरिक कलश व हांडी
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-teal-200 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  वैधानिक मजदूरी सीमा: ₹{statutoryFloor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION B: SIGNAL 1 — समान शिल्प (VISUAL COMP ENGINE)              */}
        {/* ==================================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                समान शिल्प (Similar Reference Crafts)
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-teal-300/80">
              CLIP विज़न समानता
            </span>
          </div>
          <p className="text-[11px] text-teal-200/70 px-1 -mt-1 leading-tight">
            बाज़ार में बिके वास्तविक तुलनीय शिल्पों का दृश्य विश्लेषण:
          </p>

          {/* Horizontal Scroll of Visual Comps */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
            {visualComps.length > 0 ? (
              visualComps.map((comp) => (
                <div
                  key={comp.id}
                  className="w-40 shrink-0 p-2.5 rounded-2xl bg-[#0C3E4A] border border-teal-700/50 shadow-md flex flex-col justify-between hover:border-cyan-400/60 transition-all"
                >
                  <div>
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-950 border border-teal-800/60 mb-2">
                      <img
                        src={comp.image_url || '/terracotta_pot.png'}
                        alt={comp.title_en}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/terracotta_pot.png'; }}
                      />
                      <span className="absolute top-1 right-1 bg-cyan-500/90 backdrop-blur-xs text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                        {comp.similarity_percent || 90}% मेल
                      </span>
                    </div>
                    <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                      {comp.title_hi || comp.title_en}
                    </h4>
                    <p className="text-[9px] text-teal-300/80 truncate mt-0.5">
                      📍 {comp.region}
                    </p>
                  </div>

                  {/* Pricing Grounding Signal */}
                  <div className="mt-2.5 pt-2 border-t border-teal-800/60 flex items-center justify-between">
                    <span className="text-[9px] text-teal-300 font-medium">
                      इनकी कीमत थी:
                    </span>
                    <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                      ₹{comp.price}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-6 text-center text-xs text-teal-300/60">
                तुलनीय संदर्भ शिल्प लोड हो रहे हैं...
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION C: SIGNAL 2 — कारीगर बाज़ार सूचकांक (FIRST-PARTY NETWORK)  */}
        {/* ==================================================================== */}
        <div className="p-3.5 rounded-2xl bg-[#0A3641] border border-teal-700/50 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                कारीगर बाज़ार सूचकांक (Network Average)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              ShilpSetu सत्यापित
            </span>
          </div>

          {/* Pricing Aggregations */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-800/60">
              <div className="text-[10px] text-teal-300 font-medium">
                नेटवर्क औसत कीमत
              </div>
              <div className="text-lg font-black text-white">
                ₹{bazaarIndex?.network_average_price || 380}
              </div>
              <div className="text-[9px] text-teal-400">
                मध्यम भाव: ₹{bazaarIndex?.network_median_price || 390}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-800/60">
              <div className="text-[10px] text-amber-300 font-medium">
                संयुक्त संतुलित सुझाव
              </div>
              <div className="text-lg font-black text-amber-300">
                ₹{bazaarIndex?.blended_suggested_price || 358}
              </div>
              <div className="text-[9px] text-amber-200/80">
                सीमा: {bazaarIndex?.suggested_price_range || '₹340 – ₹410'}
              </div>
            </div>
          </div>

          {/* Transparent Honest Confidence & Limited Sample-Size Caveat */}
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-100 leading-tight">
              <span className="font-bold text-amber-200">
                {bazaarIndex?.confidence_hi || 'प्रारंभिक बीज आंकड़े (सीमित डेटा)'}:{' '}
              </span>
              <span>
                {bazaarIndex?.caveat_hi ||
                  'सीमित आंकड़ों पर आधारित (4 नमूने) — जैसे-जैसे अधिक कारीगर जुड़ेंगे, यह अधिक सटीक होगा।'}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION D: SIGNAL 3 — मूल्य सिम्युलेटर ("WHAT-IF" ENGINE)          */}
        {/* ==================================================================== */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0E4957] to-[#09323C] border border-teal-600/50 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                इंटरएक्टिव मूल्य सिम्युलेटर (What-If Simulator)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
              मांग लोच (Elasticity)
            </span>
          </div>

          <p className="text-[11px] text-teal-200/80 leading-tight">
            स्लाइडर घुमाकर देखें कि अलग-अलग कीमत पर मासिक बिक्री और आमदनी पर क्या असर पड़ेगा:
          </p>

          {/* Current Candidate Price Readout */}
          <div className="text-center py-1">
            <div className="text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
              चयनित प्रस्तावित कीमत (Candidate Price)
            </div>
            <div className="text-3xl font-black text-amber-300 tracking-tight drop-shadow-sm mt-0.5">
              ₹{candidatePrice}
            </div>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-teal-950/70 text-[10px] font-bold text-teal-200 border border-teal-700/60">
              {simulation?.conversion_demand_level || 'संतुलित बाज़ार मांग (Balanced)'}
            </div>
          </div>

          {/* Price Slider with Visually Blocked Floor Track */}
          <div className="space-y-1.5 pt-1">
            <div className="relative w-full">
              {/* Blocked Track Zone Warning Overlay */}
              <div className="flex items-center justify-between text-[9px] text-teal-300 font-bold px-1 mb-1">
                <span className="text-rose-400 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  अमान्य (घाटा क्षेत्र): &lt; ₹{statutoryFloor}
                </span>
                <span className="text-teal-200 font-medium">
                  अधिकतम: ₹800
                </span>
              </div>

              {/* Slider Track with Visually Blocked Red Zone */}
              <div className="relative w-full h-8 flex items-center">
                {/* Visual indicator of statutory floor barrier */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-2.5 bg-rose-500/30 rounded-l-full border-r-2 border-rose-400"
                  style={{ width: `${Math.min(100, Math.max(0, ((statutoryFloor - 250) / (800 - 250)) * 100))}%` }}
                />

                <input
                  type="range"
                  min={statutoryFloor}
                  max={800}
                  step={10}
                  value={candidatePrice}
                  onChange={handleSliderChange}
                  className="w-full h-2.5 bg-teal-950/90 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-teal-300/80 px-1">
                <span className="font-extrabold text-amber-300">
                  न्यूनतम सीमा: ₹{statutoryFloor}
                </span>
                <span>सुझाव: ₹{bazaarIndex?.blended_suggested_price || 358}</span>
                <span>प्रीमियम: ₹650+</span>
              </div>
            </div>
          </div>

          {/* Simulation Output Cards: Est. Sales & Est. Income */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Metric 1: Monthly Sales */}
            <div className="p-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 text-center shadow-inner">
              <div className="w-8 h-8 mx-auto mb-1 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-[10px] text-cyan-200 font-medium">
                अनुमानित मासिक बिक्री
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {simulation?.estimated_monthly_sales || 8}{' '}
                <span className="text-xs font-semibold text-cyan-300">पीस</span>
              </div>
              <div className="text-[9px] text-cyan-300/70 mt-0.5">
                प्रति माह संभावित ऑर्डर
              </div>
            </div>

            {/* Metric 2: Monthly Income */}
            <div className="p-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 text-center shadow-inner">
              <div className="w-8 h-8 mx-auto mb-1 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-[10px] text-amber-200 font-medium">
                अनुमानित मासिक आमदनी
              </div>
              <div className="text-2xl font-black text-amber-300 mt-0.5">
                ₹{simulation?.estimated_monthly_income?.toLocaleString('en-IN') || (candidatePrice * 8).toLocaleString('en-IN')}
              </div>
              <div className="text-[9px] text-emerald-300 mt-0.5 font-bold">
                शुद्ध लाभ: ₹{simulation?.estimated_net_profit?.toLocaleString('en-IN') || ((candidatePrice - 144) * 8).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Voice Listen Button for Simulator */}
          <button
            onClick={handleVoiceReadout}
            className="w-full py-2 px-3 rounded-xl bg-teal-950/80 hover:bg-teal-950 border border-teal-700/60 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-amber-400' : ''}`} />
            <span>
              {isSpeaking ? 'आवाज रोकें (Stop Narration)' : '🔊 यह परिणाम हिन्दी में सुनें (Listen in Hindi)'}
            </span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* SECTION E: COMMIT ACTION — यह कीमत लागू करें                         */}
        {/* ==================================================================== */}
        <div className="pt-2">
          {applySuccess ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-center space-y-1 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="text-sm font-black text-white">
                कीमत ₹{candidatePrice} सफलतापूर्वक लागू कर दी गई!
              </div>
              <div className="text-xs text-emerald-200">
                डैशबोर्ड पर वापस लौट रहे हैं...
              </div>
            </div>
          ) : (
            <button
              onClick={handleApplyPrice}
              disabled={isApplying}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>
                {isApplying ? 'लागू हो रहा है...' : `यह कीमत लागू करें (Apply ₹${candidatePrice})`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
