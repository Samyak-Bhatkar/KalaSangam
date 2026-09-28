import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, ExternalLink, ShieldCheck, Heart, Sparkles, ChevronRight, Award } from 'lucide-react';

const FALLBACK_CRAFT_PRODUCTS = {
  'warli-painting': [
    {
      id: 'prod-warli-1',
      title_en: 'Authentic Rice-Paste Warli Tarpa Circle Canvas',
      title_hi: 'हस्तनिर्मित वारली तारपा नृत्य कैनवास',
      artisan_name: 'Shanti Devi Varlikar',
      community: 'Dahanu Tribal Collective (NBCFDC)',
      price: 1850,
      image: '/placeholder_craft.png',
      gi_tag_name: 'Warli Painting (GI #166)',
      making_hours: 18,
      is_gi_certified: true
    }
  ],
  'gorakhpur-terracotta': [
    {
      id: 'prod-terracotta-1',
      title_en: 'Hand-Sculpted Gorakhpur Terracotta Elephant Bell',
      title_hi: 'पारंपरिक गोरखपुर टेराकोटा हाथी घंटी',
      artisan_name: 'Rameshwar Prajapati',
      community: 'Gorakhpur Kumhar Sangh (NBCFDC)',
      price: 680,
      image: '/placeholder_craft.png',
      gi_tag_name: 'Gorakhpur Terracotta (GI #687)',
      making_hours: 8,
      is_gi_certified: true
    }
  ],
  'chanderi-silk': [
    {
      id: 'prod-chanderi-1',
      title_en: 'Pure Chanderi Silk Zari Saree',
      title_hi: 'शुद्ध चंदेरी रेशमी ज़री साड़ी',
      artisan_name: 'Kallu Ram Koli',
      community: 'Chanderi Bunkar Vikas Samiti (NSFDC)',
      price: 5400,
      image: '/placeholder_craft.png',
      gi_tag_name: 'Chanderi Fabric (GI #7)',
      making_hours: 48,
      is_gi_certified: true
    }
  ],
  'paithani-saree': [
    {
      id: 'prod-paithani-1',
      title_en: 'Royal Yeola Paithani Pure Gold Zari Pallu',
      title_hi: 'शाही पैठणी शुद्ध स्वर्ण ज़री पल्लू साड़ी',
      artisan_name: 'Narayan Shinde',
      community: 'Paithan Traditional Weavers Guild',
      price: 14500,
      image: '/placeholder_craft.png',
      gi_tag_name: 'Paithani Saree (GI #17)',
      making_hours: 96,
      is_gi_certified: true
    }
  ]
};

export default function CommerceHookModal({
  element = null,
  onClose = () => {}
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!element) return;

    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/storefront/products');
        if (res.ok) {
          const data = await res.json();
          const items = data.products || data || [];
          const keyword = (element.name_en || '').toLowerCase().split(' ')[0];
          const matched = items.filter((p) => {
            const txt = JSON.stringify(p).toLowerCase();
            return txt.includes(keyword) || (element.id && txt.includes(element.id));
          });
          if (isMounted && matched.length > 0) {
            setProducts(matched);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback to offline fixtures
      }

      if (isMounted) {
        setProducts(FALLBACK_CRAFT_PRODUCTS[element.id] || FALLBACK_CRAFT_PRODUCTS['warli-painting']);
        setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [element]);

  if (!element) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden glow-cyan max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Top Bar */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black uppercase tracking-wider">
                  शिल्पसेतु बाजार संपर्क (Direct Market Linkage)
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  कारीगर परंपरा का समर्थन करें
                </h3>
                <h4 className="text-xs font-semibold text-slate-400">
                  {element.name_hi} ({element.name_en})
                </h4>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Statutory Fair Living Wage Banner */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% प्रत्यक्ष कारीगर लाभांश • मध्यस्थ-मुक्त ONDC नेटवर्क</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">
              ₹120/घंटा न्यूनतम मजदूरी
            </span>
          </div>

          {/* Products List */}
          <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar">
            {products.map((p, idx) => (
              <div
                key={p.id || idx}
                className="group p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={p.studio_image_url || p.raw_image_url || p.image || '/placeholder_craft.png'}
                      alt={p.title_en || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {p.title_hi || p.title_en}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      कारीगर: <span className="text-slate-200 font-semibold">{p.artisan_name || 'प्रमाणित बुनकर'}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                        {p.gi_tag_name || 'GI Tagged Authentic'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block">न्यायसंगत मूल्य:</span>
                    <span className="text-base font-black text-amber-400">
                      ₹{p.fair_price_b2c_inr || p.b2c_price || p.price || 1200}
                    </span>
                  </div>
                  <a
                    href={`/?view=storefront&product=${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <span>खरीदें (ONDC)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>शिल्पसेतु AI • सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
          >
            वापस मानचित्र पर जाएं
          </button>
        </div>
      </div>
    </div>
  );
}
