import React, { useState } from 'react';
import {
  X,
  Fingerprint,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Lock,
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { embedDigitalGIWatermark, verifyDigitalGIWatermark } from '../services/api';

export default function DigitalGIWatermarkModal() {
  const {
    activeModal,
    setActiveModal,
    studioImageBase64,
    rawImageUrl,
    selectedPreset,
    language
  } = useArtisan();

  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [embedStatus, setEmbedStatus] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (activeModal !== 'watermark') {
    return null;
  }

  const beneficiaryId = selectedPreset?.beneficiary_id || 'MoSJE-849201';
  const clusterPin = selectedPreset?.cluster_pin || '473446';
  const giSerial = selectedPreset?.gi_tag_serial || 'GI-0078';
  const imgSrc = watermarkedImage || studioImageBase64 || rawImageUrl;

  const handleEmbedWatermark = async () => {
    setIsProcessing(true);
    setVerifyResult(null);
    try {
      const res = await embedDigitalGIWatermark({
        imageBase64: studioImageBase64 || rawImageUrl,
        beneficiaryId,
        clusterPin,
        giTagSerial: giSerial,
      });
      setWatermarkedImage(res.watermarked_image_base64);
      setEmbedStatus(res);
    } catch (err) {
      alert('Watermark embed error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyWatermark = async (testClean = false) => {
    setIsProcessing(true);
    try {
      const targetImg = testClean ? (rawImageUrl || studioImageBase64) : (watermarkedImage || studioImageBase64);
      const res = await verifyDigitalGIWatermark({
        imageBase64: targetImg,
      });
      setVerifyResult(res);
    } catch (err) {
      alert('Verification error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                Digital GI Steganography
              </div>
              <div className="text-[10px] text-slate-400">
                Anti-Counterfeit Frequency Watermark
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
          {/* Visual Image Preview with Frequency Grid Overlay */}
          <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            <img
              src={imgSrc}
              alt="Craft Craft"
              className="w-full h-full object-contain p-2"
            />
            {/* DCT 8x8 Grid simulation overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/40 text-[10px] text-purple-300 font-mono flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>DCT 2D Middle-Frequency Luminance (Y)</span>
            </div>
          </div>

          {/* Steganographic 64-Bit Payload Inspector */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Protected Artisan Identifier Payload:</span>
              <span className="text-purple-400 font-mono">64-Bit DCT</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">Beneficiary ID</span>
                <span className="text-xs font-bold text-white">{beneficiaryId}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">Cluster PIN</span>
                <span className="text-xs font-bold text-white">{clusterPin}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">GI Tag Serial</span>
                <span className="text-xs font-bold text-amber-400">{giSerial}</span>
              </div>
            </div>
          </div>

          {/* Embed / Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleEmbedWatermark}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Embedding...' : 'Embed DCT Watermark'}</span>
            </button>

            <button
              onClick={() => handleVerifyWatermark(false)}
              disabled={isProcessing}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4 text-purple-400" />
              <span>Verify</span>
            </button>
          </div>

          {/* Embed Success Message */}
          {embedStatus && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Watermark successfully embedded into frequency coefficients! Imperceptible to eye.</span>
            </div>
          )}

          {/* Verification Result Banner */}
          {verifyResult && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-xl ${
                verifyResult.is_authentic
                  ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-100'
                  : 'bg-red-950/80 border-red-500/70 text-red-100'
              }`}
            >
              {verifyResult.is_authentic ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldX className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1 text-xs">
                <div className="font-extrabold uppercase tracking-wider text-[11px]">
                  {verifyResult.is_authentic ? 'Authentic MoSJE Indigenous Craft Verified' : 'Unverified or Counterfeit Copy'}
                </div>
                <p className="leading-relaxed">{verifyResult.status_message}</p>
                {verifyResult.is_authentic && (
                  <div className="pt-1 font-mono text-[10px] text-emerald-300">
                    Beneficiary: {verifyResult.beneficiary_id} | Cluster: {verifyResult.cluster_pin}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
