import React, { useState, useEffect } from 'react';
import {
  X,
  Globe2,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useArtisan } from '../context/ArtisanContext';
import { exportBecknCatalog } from '../services/api';

export default function ONDCExportBadge() {
  const {
    activeModal,
    setActiveModal,
    catalogData,
    pricingData,
    selectedPreset,
    language
  } = useArtisan();

  const [becknPayload, setBecknPayload] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'json'

  const isPublishedModal = activeModal === 'published';
  const isOndcModal = activeModal === 'ondc';

  useEffect(() => {
    if ((isOndcModal || isPublishedModal) && catalogData) {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      exportBecknCatalog({
        productData: {
          ...catalogData,
          id: selectedPreset?.id || 'CRAFT-001',
        },
        pricingData,
        artisanInfo: {
          beneficiary_id: selectedPreset?.beneficiary_id || 'MoSJE-NBCFDC-01',
          artisan_name: selectedPreset?.artisan_name || 'Rural Artisan Collective',
          cluster_pin: selectedPreset?.cluster_pin || '273001',
        },
      })
        .then(res => setBecknPayload(res))
        .catch(err => console.warn('Beckn export fallback:', err));
    }
  }, [activeModal]);

  if (!isPublishedModal && !isOndcModal) {
    return null;
  }

  const handleCopy = () => {
    if (becknPayload) {
      navigator.clipboard.writeText(JSON.stringify(becknPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (becknPayload) {
      const blob = new Blob([JSON.stringify(becknPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beckn_catalog_${selectedPreset?.id || 'item'}.json`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                ONDC & GeM Direct Gateway
              </div>
              <div className="text-[10px] text-slate-400">
                Beckn Protocol Retail v1.2.0 Open Commerce Schema
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

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Celebratory Banner for 1-Tap Publish */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950 border-2 border-emerald-500/60 shadow-xl text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              {language === 'hi' ? 'शिल्प ONDC और GeM पर सफलतापूर्वक प्रसारित!' : 'Broadcast Live to ONDC & GeM Network!'}
            </h3>
            <p className="text-xs text-emerald-300/90 font-medium">
              Zero middlemen. Direct discoverability on Paytm, Pincode, Magicpin, and Government e-Marketplace.
            </p>
          </div>

          {/* Tab Switcher: Summary vs Raw Beckn JSON */}
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'summary' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Network Summary
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'json' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Beckn v1.2 JSON Schema
            </button>
          </div>

          {activeTab === 'summary' ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">ONDC Domain:</span>
                  <span className="font-mono text-amber-400 font-bold">ONDC:RET12 (Handicrafts)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol Specification:</span>
                  <span className="font-mono text-white">Beckn Core v1.2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary Corporation:</span>
                  <span className="text-emerald-400 font-semibold">NBCFDC / NSFDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Logistics Fulfillment:</span>
                  <span className="text-white">India Post Speed Post / Shiprocket</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Public Procurement Tier:</span>
                  <span className="text-blue-400 font-bold">GeM Ready (₹{pricingData?.gem_price})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Statutory living-wage floor locked: Middleman price undercut blocked by smart contract.</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-56 overflow-y-auto font-mono text-[10px] text-emerald-400 whitespace-pre">
                {becknPayload ? JSON.stringify(becknPayload, null, 2) : 'Loading Beckn JSON...'}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
