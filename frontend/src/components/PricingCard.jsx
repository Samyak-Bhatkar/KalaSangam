import React, { useState, useEffect, useRef } from 'react';
import {
  Coins,
  Scale,
  Clock,
  AlertTriangle,
  Volume2,
  VolumeX,
  Building2,
  Store,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Tag,
  Briefcase,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  RotateCcw,
  Check,
  Radio
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

/**
 * Authentic Indian Currency Denomination Button
 * Styled with official RBI color palettes for instant zero-literacy visual recognition:
 * - ₹50:  Cyan / Electric Sky Blue
 * - ₹100: Lavender / Soft Purple
 * - ₹200: Warm Orange / Amber
 * - ₹500: Stone Grey / Sage Green
 */
const CURRENCY_NOTES = [
  {
    delta: -50,
    label: '- ₹50',
    subtext: 'कम करें',
    subtextEn: 'Reduce',
    color: 'from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border-rose-400/50 text-white shadow-rose-900/30',
    badge: '₹50'
  },
  {
    delta: 50,
    label: '+ ₹50',
    subtext: 'पचास जोड़ें',
    subtextEn: 'Add ₹50',
    color: 'from-cyan-600 to-teal-700 hover:from-cyan-500 hover:to-teal-600 border-cyan-400/50 text-white shadow-cyan-900/30',
    badge: '₹50'
  },
  {
    delta: 100,
    label: '+ ₹100',
    subtext: 'सौ जोड़ें',
    subtextEn: 'Add ₹100',
    color: 'from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border-purple-400/50 text-white shadow-purple-900/30',
    badge: '₹100'
  },
  {
    delta: 200,
    label: '+ ₹200',
    subtext: 'दो सौ जोड़ें',
    subtextEn: 'Add ₹200',
    color: 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 border-amber-400/50 text-white shadow-amber-900/30',
    badge: '₹200'
  },
  {
    delta: 500,
    label: '+ ₹500',
    subtext: 'पाँच सौ जोड़ें',
    subtextEn: 'Add ₹500',
    color: 'from-emerald-700 to-slate-800 hover:from-emerald-600 hover:to-slate-700 border-emerald-400/50 text-white shadow-emerald-900/30',
    badge: '₹500'
  }
];

export default function PricingCard() {
  const {
    catalogData,
    pricingData,
    updatePricing,
    speakVoice,
    language
  } = useArtisan();

  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const autoPlayedRef = useRef(false);

  if (!catalogData || !pricingData) {
    return null;
  }

  // ── Auto-Play Bilingual Voice Read-Back on Screen Load ─────────────────────
  useEffect(() => {
    if (autoPlayedRef.current) return;
    autoPlayedRef.current = true;

    const timer = setTimeout(() => {
      playFullBreakdownAudio();
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Full Breakdown Voice Read-Back ─────────────────────────────────────────
  const playFullBreakdownAudio = () => {
    setIsSpeaking(true);
    const title = language === 'hi' ? catalogData.title_hi : catalogData.title_en;
    const price = Math.round(pricingData.b2c_price);
    const hours = pricingData.labor_hours;
    const rawCost = Math.round(pricingData.raw_cost);

    const speechText = language === 'hi'
      ? `नमस्ते! आपके शिल्प का शीर्षक है: ${title}। हमारे सिस्टम ने इसका अनुशंसित उचित बिक्री मूल्य ₹${price} तय किया है। इसमें ₹${rawCost} कच्ची सामग्री और ${hours} घंटे की वैधानिक कारीगर मजदूरी शामिल है। यदि आप कीमत बदलना चाहते हैं, तो नीचे दिए गए नोट बटनों को दबाएं, या हरे बटन से इस मूल्य को पक्का करें।`
      : `Hello! Your craft listing is ${title}. Recommended fair living-wage price is ₹${price}. It covers ₹${rawCost} raw materials and ${hours} hours of skilled artisan labor. Tap the currency note buttons below to adjust, or confirm with the green button.`;

    speakVoice(speechText, language === 'hi' ? 'hi-IN' : 'en-IN');

    // Reset speaking visual after estimated reading duration
    const approxDuration = Math.max(3000, speechText.length * 65);
    setTimeout(() => setIsSpeaking(false), approxDuration);
  };

  // ── Tactile Price Adjustment with Immediate Auditory Announcement ─────────
  const handleCurrencyDelta = (delta) => {
    if ('vibrate' in navigator) navigator.vibrate(35);
    setIsApproved(false); // reset approval state on change

    const currentPrice = Math.round(pricingData.b2c_price);
    const newPrice = Math.max(50, currentPrice + delta);

    // Recalculate price in engine
    updatePricing(
      catalogData.estimated_hours,
      catalogData.raw_material_cost_estimate_inr,
      newPrice
    );

    // Auditory feedback: Speak the new amount aloud in Hindi or English
    setIsSpeaking(true);
    const isUnder = newPrice < pricingData.base_cost;
    let announcement = '';

    if (language === 'hi') {
      announcement = `नया मूल्य ₹${newPrice}।`;
      if (isUnder) {
        announcement += ` सावधान! यह आपकी लागत ₹${Math.round(pricingData.base_cost)} से कम है।`;
      }
    } else {
      announcement = `New price is ₹${newPrice}.`;
      if (isUnder) {
        announcement += ` Warning: below fair living wage baseline of ₹${Math.round(pricingData.base_cost)}.`;
      }
    }

    speakVoice(announcement, language === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => setIsSpeaking(false), 2500);
  };

  // ── Reset to Statutory Fair Wage Recommended Price ────────────────────────
  const handleResetToFairPrice = () => {
    if ('vibrate' in navigator) navigator.vibrate([30, 50]);
    setIsApproved(false);
    updatePricing(
      catalogData.estimated_hours,
      catalogData.raw_material_cost_estimate_inr,
      null // resets to algorithm default
    );
    const fairText = language === 'hi'
      ? 'उचित वैधानिक मूल्य पुनः स्थापित किया गया।'
      : 'Reset to statutory fair living wage price.';
    speakVoice(fairText, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  // ── Artisan Confirmation / Approval ───────────────────────────────────────
  const handleConfirmApproval = () => {
    if ('vibrate' in navigator) navigator.vibrate([50, 70, 50]);
    setIsApproved(true);
    setIsSpeaking(true);

    const price = Math.round(pricingData.b2c_price);
    const confirmMsg = language === 'hi'
      ? `बधाई हो! आपका बिक्री मूल्य ₹${price} पक्का कर दिया गया है। आपका उत्पाद अब डिजिटल बाज़ार और ONDC पर जाने के लिए तैयार है!`
      : `Congratulations! Your price of ₹${price} is confirmed. Your listing is ready for ONDC and open digital commerce!`;

    speakVoice(confirmMsg, language === 'hi' ? 'hi-IN' : 'en-IN');
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-4 text-left">
      {/* ── Title Header with Interactive Bilingual Voice Read-Back ──────────── */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 uppercase tracking-wider">
              {catalogData.craft_category}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {catalogData.technique}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
            {language === 'hi' ? catalogData.title_hi : catalogData.title_en}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi' ? catalogData.title_en : catalogData.title_hi}
          </p>
        </div>

        {/* Big Audio Read-Back Button (Apple-style tactile pill) */}
        <button
          onClick={playFullBreakdownAudio}
          aria-label="Listen to pricing breakdown"
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer shadow-lg active:scale-95 ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 border-amber-400 ring-4 ring-amber-400/30 animate-pulse font-black'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 font-bold'
          }`}
        >
          <Volume2 className={`w-5 h-5 shrink-0 ${isSpeaking ? 'animate-bounce' : ''}`} />
          <span className="text-xs hidden sm:inline">
            {isSpeaking ? (language === 'hi' ? 'बोल रहे हैं...' : 'Speaking...') : (language === 'hi' ? 'दोबारा सुनें' : 'Listen')}
          </span>
        </button>
      </div>

      {/* ── Hero Price Card: Live Living-Wage Value & Status ─────────────────── */}
      <div className={`p-4 sm:p-5 rounded-3xl transition-all duration-300 shadow-xl border-2 ${
        pricingData.is_underpriced
          ? 'bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 border-red-500/80 shadow-red-900/40'
          : isApproved
          ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-400 shadow-emerald-900/40'
          : 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/50'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
              <Scale className={`w-4 h-4 ${pricingData.is_underpriced ? 'text-red-400' : 'text-emerald-400'}`} />
              <span className={pricingData.is_underpriced ? 'text-red-300' : 'text-emerald-300'}>
                {language === 'hi' ? 'कारीगर विक्रय मूल्य (B2C Retail)' : 'Artisan Selling Price'}
              </span>
            </div>

            {/* Huge Price Number for Clear Visibility */}
            <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight flex items-baseline gap-1">
              <span>₹{Math.round(pricingData.b2c_price).toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-slate-400">/ नग (piece)</span>
            </div>

            <div className="text-[11px] font-bold mt-1 flex items-center gap-2">
              {pricingData.is_underpriced ? (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {language === 'hi' ? 'लागत से कम (हानि की संभावना)' : 'Below statutory cost floor'}
                </span>
              ) : (
                <span className="text-emerald-400">
                  +{pricingData.margin_percentage}% {language === 'hi' ? 'उचित कारीगर लाभ' : 'artisan margin'}
                </span>
              )}
            </div>
          </div>

          {/* Quick Labor Time Badge */}
          <div className="text-right shrink-0 bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase">
              {language === 'hi' ? 'श्रम समय' : 'Labor'}
            </div>
            <div className="text-base sm:text-lg font-black text-amber-400 flex items-center justify-end gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{pricingData.labor_hours} {language === 'hi' ? 'घंटे' : 'hrs'}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-medium">
              ₹{pricingData.fair_wage_rate}/hr floor
            </div>
          </div>
        </div>
      </div>

      {/* ── Underpricing Guard Warning (Voice Audible Warning) ────────────────── */}
      {pricingData.is_underpriced && (
        <div className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-200 shadow-xl animate-pulse flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-red-300 uppercase tracking-wider text-xs">
                {language === 'hi' ? '⚠️ कम कीमत की चेतावनी (Underpricing Guard)' : '⚠️ Low Price Warning'}
              </p>
              <p className="text-[11px] leading-relaxed text-red-200 font-medium">
                {language === 'hi'
                  ? `यह मूल्य आपकी न्यूनतम लागत ₹${Math.round(pricingData.base_cost)} से कम है! कृपया उचित मजदूरी बनाए रखें।`
                  : `This price is lower than direct production cost of ₹${Math.round(pricingData.base_cost)}. Protect fair artisan wages!`}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetToFairPrice}
            className="px-3 py-1.5 rounded-xl bg-red-800/90 hover:bg-red-700 text-white font-black text-[11px] shrink-0 border border-red-400/60 shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रीसेट करें' : 'Reset'}</span>
          </button>
        </div>
      )}

      {/* ── ZERO-LITERACY TACTILE CURRENCY STEPPER ───────────────────────────── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'कीमत बदलें (नोट दबाकर कम या ज्यादा करें):' : 'Adjust Price (Tap Currency Notes):'}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            1-टैप में बदलें
          </span>
        </div>

        {/* Currency Denomination Stepper Grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {CURRENCY_NOTES.map((note, idx) => (
            <button
              key={idx}
              onClick={() => handleCurrencyDelta(note.delta)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b border shadow-md active:scale-92 cursor-pointer transition-all ${note.color}`}
              title={language === 'hi' ? `${note.label} ${note.subtext}` : `${note.label}`}
            >
              <span className="text-xs sm:text-sm font-black tracking-tight drop-shadow-xs">
                {note.label}
              </span>
              <span className="text-[9px] font-bold text-white/90 truncate max-w-full">
                {language === 'hi' ? note.subtext : note.subtextEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── HUMAN-IN-THE-LOOP ARTISAN CONFIRMATION BUTTON ────────────────────── */}
      <div className="pt-2">
        <button
          onClick={handleConfirmApproval}
          className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm sm:text-base shadow-xl transition-all cursor-pointer active:scale-98 ${
            isApproved
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30 border-2 border-emerald-400'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 border-2 border-emerald-400 shadow-emerald-900/40'
          }`}
        >
          {isApproved ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{language === 'hi' ? `✓ मूल्य स्वीकृत: ₹${Math.round(pricingData.b2c_price)} (बिक्री के लिए तैयार)` : `✓ Price Approved: ₹${Math.round(pricingData.b2c_price)}`}</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{language === 'hi' ? `✓ हाँ, ₹${Math.round(pricingData.b2c_price)} मूल्य पक्का करें (Confirm Price)` : `✓ Confirm ₹${Math.round(pricingData.b2c_price)} Final Price`}</span>
            </>
          )}
        </button>
      </div>

      {/* ── Multi-Channel Pricing Tiers (B2C, Wholesale B2B, GeM) ────────────── */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Store className="w-3 h-3 text-emerald-400" />
            <span>Retail B2C</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-1">
            ₹{Math.round(pricingData.b2c_price).toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] text-slate-500">Consumer</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Briefcase className="w-3 h-3 text-amber-400" />
            <span>B2B Bulk</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-amber-400 mt-1">
            ₹{Math.round(pricingData.b2b_price).toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] text-slate-500">Min 10 units</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Building2 className="w-3 h-3 text-blue-400" />
            <span>GeM Tender</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-blue-400 mt-1">
            ₹{Math.round(pricingData.gem_price).toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] text-slate-500">+15% Public Tender</div>
        </div>
      </div>

      {/* ── Collapsible Statutory MoSJE Formula Breakdown ────────────────────── */}
      <div className="rounded-2xl border border-slate-800/80 overflow-hidden">
        <button
          onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
          className="w-full py-2 px-3.5 bg-slate-950/50 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'MoSJE वैधानिक मूल्य निर्धारण सूत्र देखें' : 'View MoSJE Living-Wage Formula'}</span>
          </span>
          {showFormulaBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showFormulaBreakdown && (
          <div className="p-3 bg-slate-950/90 text-[11px] text-slate-300 space-y-1.5 border-t border-slate-800 font-mono">
            <div className="flex justify-between pb-1 border-b border-slate-800/60">
              <span className="text-slate-400">Raw Material (C_raw):</span>
              <span className="font-bold text-white">₹{pricingData.raw_cost}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-800/60">
              <span className="text-slate-400">Artisan Labor ({pricingData.labor_hours}h × ₹120):</span>
              <span className="font-bold text-emerald-400">₹{pricingData.labor_cost}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-800/60">
              <span className="text-slate-400">Workshop Overhead (10%):</span>
              <span className="font-bold text-white">₹{pricingData.overhead_cost}</span>
            </div>
            <div className="flex justify-between pt-1 text-amber-300 font-bold">
              <span>Direct Cost Baseline:</span>
              <span>₹{pricingData.base_cost}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Materials Identified Tags ────────────────────────────────────────── */}
      {catalogData.materials_used && catalogData.materials_used.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>{language === 'hi' ? 'पहचाने गए प्राकृतिक घटक:' : 'Identified Materials:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {catalogData.materials_used.map((mat, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 font-medium"
              >
                {mat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
