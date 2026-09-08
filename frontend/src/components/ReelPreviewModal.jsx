import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Share2, Download, Sparkles, QrCode } from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { generateMarketingReel } from '../services/api';

export default function ReelPreviewModal() {
  const {
    activeModal,
    setActiveModal,
    studioImageBase64,
    rawImageUrl,
    catalogData,
    selectedPreset,
    pricingData,
    language
  } = useArtisan();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reelData, setReelData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  if (activeModal !== 'reel' || !catalogData) {
    return null;
  }

  const title = language === 'hi' ? catalogData.title_hi : catalogData.title_en;
  const story = language === 'hi' ? catalogData.description_hi : catalogData.description_en;
  const artisanName = selectedPreset?.artisan_name || 'Ramesh Kumar';
  const cluster = selectedPreset?.artisan_community || 'MoSJE Handicraft Cluster';

  // Request reel from backend on open
  useEffect(() => {
    let cancelled = false;
    async function loadReel() {
      setIsGenerating(true);
      try {
        const res = await generateMarketingReel({
          productId: selectedPreset?.id || 'CRAFT-001',
          title: catalogData.title_en,
          studioImageBase64: studioImageBase64 || rawImageUrl,
          storyText: story,
          artisanName,
          craftCluster: cluster,
        });
        if (!cancelled) {
          setReelData(res);
        }
      } catch (err) {
        console.warn('Reel backend fallback:', err);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }
    loadReel();
    return () => { cancelled = true; };
  }, []);

  // 15s Timer Progress Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Loop 15s reel
        }
        return prev + (100 / (15 * 10)); // 10 updates per sec
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this 100% authentic handcrafted ${title} by ${artisanName} on ONDC! Direct-from-artisan fair wage certified: https://shilpsetu.gov.in/item/${selectedPreset?.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
              AI Reel Storyteller (9:16)
            </span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 15-Second Vertical Video Viewport (9:16 Ratio) */}
        <div className="relative flex-1 aspect-[9/16] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          {/* Background Ambient Audio */}
          <audio
            ref={audioRef}
            src="/audio/ambient_folk.wav"
            autoPlay
            loop
            muted={isMuted}
          />

          {/* Animated Ken Burns Canvas Layer */}
          <div
            style={{
              transform: `scale(${1.0 + (progress / 100) * 0.18}) translateY(-${(progress / 100) * 20}px)`,
              transition: 'transform 0.1s linear',
            }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            <img
              src={studioImageBase64 || rawImageUrl}
              alt="Craft Hero"
              className="max-h-[62%] object-contain drop-shadow-2xl"
            />
          </div>

          {/* Top Progress Bar for 15s Duration */}
          <div className="absolute top-2 inset-x-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
            />
          </div>

          {/* MoSJE ShilpSetu Header Badge */}
          <div className="absolute top-5 inset-x-4 flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-300">
                MoSJE ShilpSetu
              </span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Bottom-Third Frosted Typography Card & ONDC QR Code */}
          <div className="absolute bottom-4 inset-x-3 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-amber-400/30 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Handcrafted by {artisanName}
                </div>
                <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {story}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-400">
                    ₹{pricingData?.b2c_price}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Fair Wage Certified
                  </span>
                </div>
              </div>

              {/* Dynamic ONDC QR Code */}
              <div className="w-18 h-18 p-1.5 rounded-xl bg-white flex flex-col items-center justify-center shrink-0 shadow-lg">
                <QrCode className="w-12 h-12 text-slate-950" />
                <span className="text-[8px] font-extrabold text-slate-950 tracking-tighter uppercase">
                  ONDC Buy
                </span>
              </div>
            </div>
          </div>

          {/* Central Play/Pause Tap Overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-transparent opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full bg-slate-950/70 backdrop-blur-md flex items-center justify-center text-white">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </div>
          </button>
        </div>

        {/* Bottom Social Share Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Status</span>
          </button>

          {reelData?.reel_url && (
            <a
              href={reelData.reel_url}
              download="artisan_reel.mp4"
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>MP4</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
