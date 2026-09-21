import React, { useState } from 'react';
import {
  X,
  Shield,
  Volume2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Send,
  Sparkles,
  Building,
  Check
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { negotiateB2B } from '../services/api';

export default function BargainGuard() {
  const {
    activeModal,
    setActiveModal,
    pricingData,
    catalogData,
    selectedPreset,
    speakVoice,
    language
  } = useArtisan();

  const [buyerOffer, setBuyerOffer] = useState(
    pricingData ? Math.round(pricingData.base_cost * 0.85) : 220
  );
  const [quantity, setQuantity] = useState(100);
  const [negotiationResult, setNegotiationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [counterSent, setCounterSent] = useState(false);

  if (activeModal !== 'bargain') {
    return null;
  }

  const baseCost = pricingData?.base_cost || 668;

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    setIsEvaluating(true);
    setCounterSent(false);

    try {
      const res = await negotiateB2B({
        productId: selectedPreset?.id || 'CRAFT-001',
        buyerOfferInr: buyerOffer,
        quantity,
        baseCostInr: baseCost,
        craftCategory: catalogData?.craft_category || 'Handicraft',
        b2cPriceInr: pricingData.b2c_price,
      });
      setNegotiationResult(res);

      // Trigger Hindi audio alert to artisan
      if (res.artisan_audio_explanation_hi) {
        speakVoice(res.artisan_audio_explanation_hi, 'hi-IN');
      }
    } catch (err) {
      console.error('Negotiation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApproveCounter = () => {
    setCounterSent(true);
    speakVoice('काउंटर-ऑफर व्यापारी को आधिकारिक संदेश के रूप में भेज दिया गया है।', 'hi-IN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Bargain Guard AI
              </div>
              <div className="text-[10px] text-slate-400">
                Autonomous B2B Middleman Protection
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Statutory Direct Cost Baseline Reminder */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Direct Cost Floor (No Margin)
              </span>
              <div className="text-xl font-extrabold text-white">
                ₹{baseCost.toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-normal">/unit</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Standard Wholesale B2B
              </span>
              <div className="text-xl font-extrabold text-amber-400">
                ₹{pricingData.b2b_price.toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-normal">/unit</span>
              </div>
            </div>
          </div>

          {/* Wholesale Offer Simulation Form */}
          <form onSubmit={handleEvaluate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Buyer Offer (INR/pc)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={buyerOffer}
                    onChange={(e) => setBuyerOffer(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 pl-7 pr-3 text-sm font-bold rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Bulk Quantity (Units)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full py-2 px-3 text-sm font-bold rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{isEvaluating ? 'Analyzing Fair Wage Impact...' : 'Evaluate Wholesale Inquiry'}</span>
            </button>
          </form>

          {/* Result Card when evaluated */}
          {negotiationResult && (
            <div className="space-y-4 pt-2">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-xl ${
                  negotiationResult.verdict === 'REJECT_AND_COUNTER'
                    ? 'bg-red-950/80 border-red-500/70 text-red-100'
                    : 'bg-emerald-950/80 border-emerald-500/70 text-emerald-100'
                }`}
              >
                {negotiationResult.verdict === 'REJECT_AND_COUNTER' ? (
                  <TrendingDown className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      {negotiationResult.verdict === 'REJECT_AND_COUNTER'
                        ? 'Lowball Offer Flagged (Reject & Counter)'
                        : 'Profitable Bulk Offer (Approved)'}
                    </span>
                    <button
                      onClick={() => speakVoice(negotiationResult.artisan_audio_explanation_hi, 'hi-IN')}
                      className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center text-amber-300 hover:bg-black/60"
                      title="Replay audio alert"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed font-medium">
                    {negotiationResult.artisan_audio_explanation_hi}
                  </p>
                </div>
              </div>

              {/* Proposed Corporate Counter-Offer */}
              {negotiationResult.verdict === 'REJECT_AND_COUNTER' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Recommended Counter Rate
                    </span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ₹{negotiationResult.counter_offer_inr}/unit
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed">
                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">
                      Professional B2B Counter-Offer (English):
                    </div>
                    "{negotiationResult.counter_message_en}"
                  </div>

                  {counterSent ? (
                    <div className="py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Counter-Offer Dispatched to Wholesaler!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveCounter}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Approve & Send Counter-Offer (Tap to Confirm)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
