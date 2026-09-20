import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Coins,
  QrCode,
  Share2,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Play,
  Pause,
} from 'lucide-react';
import { verifyPublicProduct } from '../services/api';

export default function PublicVerifyScreen({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCraftPins, setShowCraftPins] = useState(false);
  const [activePinId, setActivePinId] = useState(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const togglePlayAudio = (url) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playingAudioUrl === url) {
      setPlayingAudioUrl(null);
    } else {
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingAudioUrl(url);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingAudioUrl(null);
    }
  };

  useEffect(() => {
    let active = true;
    async function fetchVerification() {
      setLoading(true);
      setError(null);
      try {
        const data = await verifyPublicProduct(productId);
        if (active) setProduct(data);
      } catch (err) {
        if (active) {
          if (err.message === 'NOT_FOUND_OR_DRAFT') {
            setError('This item is not a publicly published artisan craft or does not exist. (Draft items are strictly protected and non-discoverable).');
          } else {
            setError(err.message || 'Unable to fetch verification details');
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    if (productId) {
      fetchVerification();
    }
    return () => { active = false; };
  }, [productId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title_en || 'Verified Indigenous Craft',
        text: `Verify authentic Indian handicraft by ${product?.artisan_name} on MoSJE ShilpSetu:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-3" />
        <h3 className="text-base font-bold text-slate-800">MoSJE ShilpSetu Verification</h3>
        <p className="text-xs text-slate-500 mt-1">Verifying cryptographic digital watermark & ONDC listing...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center bg-[#FDFBF7]">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3 shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Unverified or Inactive Item</h3>
        <p className="text-xs text-slate-600 max-w-xs mt-1.5 leading-relaxed">
          {error || 'No published craft dossier found with this identification code.'}
        </p>
        <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 max-w-xs text-left">
          <span className="font-bold">Security Note:</span> Test uploads, image enhancer runs, and unpublished drafts are never exposed to public QR scanners.
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-5 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to ShilpSetu</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <img
            src="/brand_emblem.png"
            alt="MoSJE ShilpSetu"
            className="w-7 h-7 rounded-full border border-amber-400 object-cover shadow-xs"
          />
          <div>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
              <span>ShilpSetu Verified Dossier</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-[9px] text-slate-500 font-medium">
              Ministry of Social Justice & Empowerment, GoI
            </div>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="Share verification certificate"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Certificate Content */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Certificate Card */}
        <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-lg overflow-hidden">
          {/* Top Verification Ribbon */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-2.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black tracking-wider uppercase">
                100% Authentic Indigenous Craft
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
              {product.id}
            </span>
          </div>

          {/* Craft Studio Visual */}
          <div className="relative aspect-square bg-[#FDFBF7] flex items-center justify-center p-6 border-b border-slate-100 overflow-hidden">
            {product.studio_image_url ? (
              <img
                src={product.studio_image_url}
                alt={product.title_en}
                className="max-h-full max-w-full object-contain drop-shadow-xl pointer-events-none"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-xs">
                Craft Photo
              </div>
            )}

            {/* Pins Overlay */}
            {showCraftPins &&
              product.craft_pins &&
              product.craft_pins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePinId(activePinId === pin.id ? null : pin.id);
                  }}
                  style={{
                    left: `${pin.x ?? pin.x_pct ?? 50}%`,
                    top: `${pin.y ?? pin.y_pct ?? 50}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all ${
                    activePinId === pin.id ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-white transition-all ${
                      pin.category === 'craft_detail'
                        ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-white ring-2 ring-amber-300/80 shadow-amber-900/30'
                        : 'bg-gradient-to-tr from-teal-700 to-teal-500 text-white ring-2 ring-teal-300/80 shadow-teal-900/30'
                    }`}
                  >
                    {pin.pin_number}
                  </div>
                </div>
              ))}

            {/* Steganographic GI Seal Badge */}
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 text-emerald-800 text-[10px] font-bold shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Digital GI Seal Protected</span>
            </div>
          </div>

          {/* View Craft Details Disclosure Button & Panel */}
          {product.craft_pins && product.craft_pins.length > 0 && (
            <div className="px-5 pt-3">
              <button
                type="button"
                onClick={() => setShowCraftPins(!showCraftPins)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  showCraftPins
                    ? 'bg-amber-500/10 border-amber-400 text-amber-900'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                {showCraftPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>
                  {showCraftPins
                    ? 'शिल्प विवरण छुपाएं (Hide Craft Details)'
                    : `शिल्प विवरण देखें (View Craft Details - ${product.craft_pins.length})`}
                </span>
              </button>

              {showCraftPins && (
                <div className="mt-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                    <span>कारीगर प्रामाणिकता प्रकटीकरण (Artisan Authenticity Disclosure):</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-bold">
                      {product.craft_pins.length} Points
                    </span>
                  </div>
                  <div className="space-y-2">
                    {product.craft_pins.map((pin) => (
                      <div
                        key={pin.id}
                        onClick={() => setActivePinId(activePinId === pin.id ? null : pin.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                          activePinId === pin.id
                            ? 'bg-white border-amber-400 shadow-xs'
                            : 'bg-white/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 mt-0.5 ${
                                pin.category === 'craft_detail'
                                  ? 'bg-amber-500'
                                  : 'bg-teal-600'
                              }`}
                            >
                              {pin.pin_number}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900">
                                  {pin.short_label_hi || pin.short_label}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                    pin.category === 'craft_detail'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-teal-100 text-teal-800'
                                  }`}
                                >
                                  {pin.category === 'craft_detail' ? 'कारीगरी खूबी' : 'प्राकृतिक भिन्नता'}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                                {pin.full_description_hi || pin.full_description}
                              </p>
                            </div>
                          </div>

                          {pin.audio_url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePlayAudio(pin.audio_url);
                              }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${
                                playingAudioUrl === pin.audio_url
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-100 text-amber-700 hover:bg-amber-100'
                              }`}
                              title="Listen to artisan voice"
                            >
                              {playingAudioUrl === pin.audio_url ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Core Craft Dossier */}
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                <span>{product.craft_category || 'Traditional Craft'}</span>
                <span>•</span>
                <span>{product.technique || 'Handmade'}</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">
                {product.title_hi || product.title_en}
              </h1>
              {product.title_en && product.title_hi && (
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {product.title_en}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {product.description_hi || product.description_en}
            </p>

            {/* Artisan Credential Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {product.artisan_name ? product.artisan_name.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <span>{product.artisan_name || 'Master Artisan'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>PIN {product.cluster_pin || 'India'}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {product.beneficiary_id || 'NBCFDC'}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shrink-0">
                Verified
              </span>
            </div>

            {/* Statutory Fair Living Wage Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-700" />
                  <span>Fair Living-Wage Guaranteed</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  ₹120/hr floor
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                100% of proceeds from this listing directly reach the artisan's verified bank account without intermediary commission cuts.
              </p>
            </div>

            {/* Price & ONDC Direct Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fair Market Price</span>
                <div className="text-2xl font-black text-slate-900">
                  ₹{product.b2c_price || product.gem_price || '—'}
                </div>
              </div>

              <a
                href={product.ondc_buy_url}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center"
              >
                <span>Buy via ONDC</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* QR Code Verification Seal Card */}
        {product.qr_code_url && (
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
            <img
              src={product.qr_code_url}
              alt="Verified QR Code"
              className="w-20 h-20 rounded-xl border border-slate-100 shadow-xs object-contain"
            />
            <div className="flex-1 text-xs">
              <h4 className="font-extrabold text-slate-900 mb-0.5">Scannable Authenticity Seal</h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                Scan with any smartphone camera to inspect government beneficiary certification and provenance.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
