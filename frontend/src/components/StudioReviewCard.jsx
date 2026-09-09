import React, { useState, useRef } from 'react';
import { Sparkles, Award, ShieldCheck, Sliders, Check } from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

export default function StudioReviewCard() {
  const {
    rawImageUrl,
    rawImageBase64,
    studioImageBase64,
    studioImageUrl,
    catalogData,
    selectedPreset,
    language
  } = useArtisan();

  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 percentage
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const rawSrc = rawImageBase64 || rawImageUrl || selectedPreset?.raw_image_url || selectedPreset?.sample_image_url || '/terracotta_pot_raw.png';
  const studioSrc = studioImageBase64 || studioImageUrl || selectedPreset?.clean_image_url || '/terracotta_pot_clean.png';

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Banner with Badges */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {language === 'hi' ? 'एआई स्टूडियो रूपांतरण' : 'Autonomous AI Studio'}
          </span>
        </div>

        {/* GI Tag / MoSJE Badge */}
        {catalogData?.gi_tag_eligible && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-bold text-amber-300">
            <Award className="w-3.5 h-3.5" />
            <span>GI Certified</span>
          </div>
        )}
      </div>

      {/* Interactive Before / After Split Slider */}
      <div
        ref={containerRef}
        onMouseDown={() => (isDragging.current = true)}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-square max-h-[340px] bg-slate-950 overflow-hidden select-none cursor-ew-resize"
      >
        {/* Under layer: Clean Studio Enhanced Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#F8F9FA]">
          <img
            src={studioSrc}
            alt="Clean AI Studio Output"
            className="w-full h-full object-contain p-2"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'hi' ? 'स्वच्छ 4K स्टूडियो' : 'Clean Studio Output'}</span>
          </div>
        </div>

        {/* Top clipped layer: Blurry / Inaccurate Raw Workshop Photo */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 bg-slate-900 shadow-2xl transition-[width] duration-75"
        >
          <div className="relative w-full h-full min-w-[340px] flex items-center justify-center">
            <img
              src={rawSrc}
              alt="Raw Blurry Workshop Capture"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/95 border border-amber-500/50 text-amber-300 text-[10px] font-semibold shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{language === 'hi' ? 'कच्ची / धुंधली तस्वीर' : 'Raw Capture (Blurry)'}</span>
            </div>
          </div>
        </div>

        {/* Divider Handle Knob */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute inset-y-0 -ml-4 flex items-center justify-center pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-950 shadow-xl flex items-center justify-center text-slate-950">
            <Sliders className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Enhancement summary chips */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-around text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {language === 'hi' ? 'डीब्लर व शार्पनिंग' : 'AI Deblur & Clarity'}
        </span>
        <span className="flex items-center gap-1 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {language === 'hi' ? 'स्वच्छ बैकग्राउंड' : 'Clean Studio BG'}
        </span>
        <span className="flex items-center gap-1 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {language === 'hi' ? '6500K लाइटिंग' : '6500K Lighting'}
        </span>
      </div>
    </div>
  );
}
