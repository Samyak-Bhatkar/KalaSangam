import React, { useState } from 'react';
import {
  Coins,
  Scale,
  Clock,
  AlertTriangle,
  Volume2,
  Building2,
  Store,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Tag,
  Briefcase
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

export default function PricingCard() {
  const {
    catalogData,
    pricingData,
    updatePricing,
    speakVoice,
    language
  } = useArtisan();

  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState(false);
  const [expectedInput, setExpectedInput] = useState('');

  if (!catalogData || !pricingData) {
    return null;
  }

  const handleExpectedPriceSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(expectedInput);
    if (!isNaN(val)) {
      updatePricing(
        catalogData.estimated_hours,
        catalogData.raw_material_cost_estimate_inr,
        val
      );
    }
  };

  const playListingAudio = () => {
    const text = language === 'hi'
      ? `${catalogData.title_hi}। अनुशंसित उचित मूल्य ₹${pricingData.b2c_price} है। इसमें ${catalogData.estimated_hours} घंटे का श्रम शामिल है।`
      : `${catalogData.title_en}. Fair living-wage price is ₹${pricingData.b2c_price}. Includes ${catalogData.estimated_hours} hours of artisan labor.`;
    speakVoice(text, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
      {/* Title Header with Speaker Playback */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider">
              {catalogData.craft_category}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {catalogData.technique}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white leading-snug">
            {language === 'hi' ? catalogData.title_hi : catalogData.title_en}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi' ? catalogData.title_en : catalogData.title_hi}
          </p>
        </div>

        {/* Audio Speaker Playback Button */}
        <button
          onClick={playListingAudio}
          aria-label="Listen to title and price"
          className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer shadow-lg"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Living-Wage Recommended Price Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>{language === 'hi' ? 'उचित जीवन-यापन मूल्य (B2C)' : 'Statutory Fair Wage Price'}</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              ₹{pricingData.b2c_price.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
              +{pricingData.margin_percentage}% profit over statutory direct cost
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">
              {language === 'hi' ? 'अनुमानित श्रम समय' : 'Labor Invested'}
            </div>
            <div className="text-lg font-bold text-amber-400 flex items-center justify-end gap-1">
              <Clock className="w-4 h-4" />
              <span>{pricingData.labor_hours} hrs</span>
            </div>
            <div className="text-[10px] text-slate-400">
              @ ₹{pricingData.fair_wage_rate}/hr floor
            </div>
          </div>
        </div>
      </div>

      {/* Underpricing Guard Warning Banner (if triggered) */}
      {pricingData.is_underpriced && (
        <div className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500/80 text-red-200 text-xs shadow-lg animate-pulse flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-red-300 uppercase tracking-wider text-[11px]">
              {language === 'hi' ? 'कम कीमत की चेतावनी (Underpricing Guard)' : 'Statutory Underpricing Warning'}
            </div>
            <p className="text-xs leading-relaxed">
              {language === 'hi'
                ? pricingData.underprice_warning_msg_hi
                : pricingData.underprice_warning_msg_en}
            </p>
          </div>
        </div>
      )}

      {/* Multi-Channel Pricing Tiers (B2C, Wholesale B2B, GeM) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Store className="w-3 h-3 text-emerald-400" />
            <span>Retail B2C</span>
          </div>
          <div className="text-base font-extrabold text-emerald-400 mt-1">
            ₹{pricingData.b2c_price.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] text-slate-500">Consumer</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Briefcase className="w-3 h-3 text-amber-400" />
            <span>B2B Bulk</span>
          </div>
          <div className="text-base font-extrabold text-amber-400 mt-1">
            ₹{pricingData.b2b_price.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] text-slate-500">Min 10 units</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Building2 className="w-3 h-3 text-blue-400" />
            <span>GeM Tender</span>
          </div>
          <div className="text-base font-extrabold text-blue-400 mt-1">
            ₹{pricingData.gem_price.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] text-slate-500">+15% Public Tender</div>
        </div>
      </div>

      {/* Collapsible Statutory Formula Breakdown */}
      <div className="rounded-xl border border-slate-800/80 overflow-hidden">
        <button
          onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
          className="w-full py-2.5 px-3.5 bg-slate-950/50 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'MoSJE वैधानिक मूल्य निर्धारण सूत्र देखें' : 'View MoSJE Living-Wage Formula'}</span>
          </span>
          {showFormulaBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulaBreakdown && (
          <div className="p-3.5 bg-slate-950/90 text-xs text-slate-300 space-y-2 border-t border-slate-800 font-mono">
            <div className="flex justify-between pb-1 border-b border-slate-800">
              <span className="text-slate-400">Raw Material (C_raw):</span>
              <span className="font-bold text-white">₹{pricingData.raw_cost}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-800">
              <span className="text-slate-400">Artisan Labor ({pricingData.labor_hours}h × ₹120):</span>
              <span className="font-bold text-emerald-400">₹{pricingData.labor_cost}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-800">
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

      {/* Expected Price Guard Test Input (Allows simulating underpricing alerts) */}
      <form onSubmit={handleExpectedPriceSubmit} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder={language === 'hi' ? 'अपनी अनुमानित कीमत दर्ज करें (जैसे ₹500)' : 'Test expected price (e.g. 500)'}
            value={expectedInput}
            onChange={(e) => setExpectedInput(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold shrink-0 cursor-pointer"
        >
          Check Guard
        </button>
      </form>

      {/* Materials Identified Tags */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Tag className="w-3 h-3 text-amber-400" />
          <span>{language === 'hi' ? 'पहचाने गए प्राकृतिक घटक:' : 'Identified Materials:'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {catalogData.materials_used.map((mat, i) => (
            <span
              key={i}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300"
            >
              {mat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
