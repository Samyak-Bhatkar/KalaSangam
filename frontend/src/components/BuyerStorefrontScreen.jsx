import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  QrCode,
  ExternalLink,
  ChevronRight,
  Search,
  ArrowLeft,
  CheckCircle2,
  LogIn,
  Store,
  Tag,
  Eye,
  EyeOff,
  MapPin,
  Play,
  Pause,
} from 'lucide-react';
import { fetchStorefrontProducts } from '../services/api';

export default function BuyerStorefrontScreen({ onGoToLogin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchStorefrontProducts();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch storefront items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.title_en || '').toLowerCase().includes(q) ||
      (p.title_hi || '').toLowerCase().includes(q) ||
      (p.artisan_name || '').toLowerCase().includes(q) ||
      (p.craft_category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center font-sans select-none">
      <div className="w-full md:max-w-4xl min-h-screen bg-[#FAF9F5] shadow-2xl flex flex-col">
        {/* Top Public Header */}
        <header className="sticky top-0 z-30 px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand_emblem.png"
              alt="ShilpSetu Emblem"
              className="w-9 h-9 rounded-full border border-amber-500/40 object-cover shrink-0 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1">
                  <span>शिल्पसेतु बाज़ार</span>
                  <span className="text-[#C85A32] text-xs font-serif italic">ShilpSetu Live</span>
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  ONDC & GeM Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                भारत के पारंपरिक कारीगरों से सीधे खरीदे गए प्रमाणित हस्तशिल्प
              </p>
            </div>
          </div>

          {/* Login Action to switch back to Artisan/Coordinator */}
          <button
            onClick={onGoToLogin}
            className="py-1.5 px-3 rounded-full bg-[#C85A32] hover:bg-[#B44B24] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>कारीगर / समन्वयक लॉगिन</span>
          </button>
        </header>

        {/* Hero Value Banner */}
        <section className="px-5 py-6 bg-gradient-to-br from-[#1E2A4A] via-[#172036] to-[#0F172A] text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>100% बिचौलिया-मुक्त सीधी खरीद</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                भारत के हाशिए पर स्थित कारीगरों का डिजिटल बाज़ार
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
                शिल्पसेतु AI द्वारा सत्यापित उत्पाद, डिजिटल जीआई (GI) वाटरमार्क एवं प्रामाणिक ब्लॉकचेन क्यूआर कोड के साथ।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 font-black text-xl">
                {products.length}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">लाइव उत्पाद</div>
                <div className="text-[10px] text-slate-300">सीधे ONDC व GeM पर उपलब्ध</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="कलाकृति, कारीगर या श्रेणी खोजें (जैसे: टेराकोटा, चंदेरी, शांति देवी)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs md:text-sm focus:outline-none focus:border-amber-400 backdrop-blur-sm transition-colors"
            />
          </div>
        </section>

        {/* Product Grid */}
        <main className="flex-1 p-5 overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">प्रमाणित उत्पाद लोड हो रहे हैं...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">कोई उत्पाद नहीं मिला</h3>
              <p className="text-xs text-slate-500 mt-1">कृपया कोई अन्य शब्द खोजें</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer active:scale-[0.99]"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={p.studio_image_url || p.raw_image_url || '/placeholder_craft.png'}
                      alt={p.title_en || 'Craft'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{p.craft_category || 'GI Certified'}</span>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase shadow-xs">
                      ONDC Live
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-[#C85A32] transition-colors">
                        {p.title_hi || p.title_en}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {p.title_en}
                      </p>
                      <p className="text-[10px] text-slate-600 line-clamp-2 mt-1.5 font-normal">
                        {p.description_hi || p.description_en}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">कारीगर</span>
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[130px] block">
                          {p.artisan_name || 'शांति देवी'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-semibold block">सीधी कीमत</span>
                        <span className="text-base font-black text-[#C85A32]">
                          ₹{p.price || p.suggested_price || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Authenticity Certificate Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    डिजिटल जीआई प्रामाणिकता प्रमाणपत्र
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedProduct.studio_image_url || selectedProduct.raw_image_url}
                    alt={selectedProduct.title_en}
                    className="w-full h-full object-cover"
                  />

                  {/* Pins Overlay */}
                  {showCraftPins &&
                    selectedProduct.craft_pins &&
                    selectedProduct.craft_pins.map((pin) => (
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
                </div>

                {/* View Craft Details Toggle Button */}
                {selectedProduct.craft_pins && selectedProduct.craft_pins.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowCraftPins(!showCraftPins)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        showCraftPins
                          ? 'bg-amber-500/10 border-amber-400 text-amber-800'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      {showCraftPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>
                        {showCraftPins
                          ? 'शिल्प विवरण छुपाएं (Hide Details)'
                          : `शिल्प विवरण देखें (View Craft Details - ${selectedProduct.craft_pins.length})`}
                      </span>
                    </button>

                    {showCraftPins && (
                      <div className="mt-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                        <span className="text-[11px] font-bold text-amber-900 block">
                          कारीगर द्वारा प्रकटीकरण (Artisan Authenticity & Transparency):
                        </span>
                        <div className="space-y-2">
                          {selectedProduct.craft_pins.map((pin) => (
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

                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {selectedProduct.title_hi || selectedProduct.title_en}
                  </h4>
                  <p className="text-xs text-slate-500">{selectedProduct.title_en}</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">कारीगर पहचान:</span>
                    <span className="font-bold text-slate-900">{selectedProduct.artisan_id || 'NBCFDC #8492'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">शिल्प श्रेणी:</span>
                    <span className="font-bold text-slate-900">{selectedProduct.craft_category || 'हस्तशिल्प'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">तकनीक:</span>
                    <span className="font-bold text-slate-900">{selectedProduct.technique || 'पारंपरिक हस्तकला'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">सीधा लाभ दर:</span>
                    <span className="font-black text-[#C85A32]">₹{selectedProduct.price || selectedProduct.suggested_price}</span>
                  </div>
                </div>

                {selectedProduct.qr_code_base64 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <img
                      src={selectedProduct.qr_code_base64}
                      alt="Verification QR"
                      className="w-16 h-16 rounded-xl border border-slate-300 shrink-0 bg-white p-1"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        स्कैन करके प्रमाणिकता सत्यापित करें
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        शिल्पसेतु क्रिप्टोग्राफिक हैश द्वारा प्रमाणित
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full py-3 rounded-2xl bg-[#1E2A4A] text-white text-xs font-extrabold cursor-pointer hover:bg-slate-900 transition-colors shadow-xs"
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
