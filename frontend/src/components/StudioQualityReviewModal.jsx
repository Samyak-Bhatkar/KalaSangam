import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  ThumbsUp,
  Camera,
  ArrowRight,
  Sun,
  Moon,
  Crop,
  Layers,
  Activity,
  Check,
  Loader2
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import { enhanceImage } from '../services/api';

export default function StudioQualityReviewModal({
  isOpen,
  onClose,
  rawPhotoBase64,
  qualityResult,
  onRetake,
  onCompleteAngle,
}) {
  const {
    language,
    speakVoice,
    activeAngleIndex,
    setActiveAngleIndex,
    anglePhotos,
    saveAnglePhoto,
    setCurrentStep,
  } = useArtisan();

  // Review states: 'checking' | 'failed' | 'enhancing' | 'enhanced'
  const [reviewState, setReviewState] = useState('checking');
  const [enhancedResult, setEnhancedResult] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementPhase, setEnhancementPhase] = useState(0);

  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // Active angle info
  const currentAngle = anglePhotos[activeAngleIndex] || anglePhotos[0];

  // Evaluate quality result when modal opens or qualityResult updates
  useEffect(() => {
    if (!isOpen) return;

    if (!qualityResult) {
      setReviewState('checking');
      return;
    }

    if (qualityResult.passed) {
      setReviewState('enhancing');
      // Speak celebratory prompt
      const prompt = language === 'hi' ? qualityResult.voice_prompt_hi : qualityResult.voice_prompt_en;
      speakVoice(prompt, language === 'hi' ? 'hi-IN' : 'en-IN');
      // Start studio enhancement pipeline
      triggerEnhancement(rawPhotoBase64);
    } else {
      setReviewState('failed');
      // Speak corrective voice prompt
      const prompt = language === 'hi' ? qualityResult.voice_prompt_hi : qualityResult.voice_prompt_en;
      speakVoice(prompt, language === 'hi' ? 'hi-IN' : 'en-IN');
    }
  }, [isOpen, qualityResult, rawPhotoBase64]);

  // Autonomous cloud studio enhancement pipeline
  const triggerEnhancement = async (base64Img) => {
    setIsEnhancing(true);
    setEnhancementPhase(1);

    const phaseTimer1 = setTimeout(() => setEnhancementPhase(2), 700);
    const phaseTimer2 = setTimeout(() => setEnhancementPhase(3), 1400);

    try {
      const res = await enhanceImage({ imageBase64: base64Img });
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      setEnhancementPhase(4);

      setTimeout(() => {
        setEnhancedResult(res);
        setReviewState('enhanced');
        setIsEnhancing(false);

        // Save into active angle
        saveAnglePhoto(activeAngleIndex, {
          rawBase64: base64Img,
          studioBase64: res.processed_base64 || res.studio_url,
          quality: qualityResult,
        });

        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate([60, 40, 60]);
      }, 500);
    } catch (err) {
      console.warn('Enhancement error, using fallback studio render:', err);
      setReviewState('enhanced');
      setIsEnhancing(false);
    }
  };

  // Slider dragging handlers
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) handleMove(e.clientX);
  };

  // Move to next angle or advance to Step 2
  const handleAcceptAndNext = () => {
    if (activeAngleIndex < anglePhotos.length - 1) {
      const nextIdx = activeAngleIndex + 1;
      setActiveAngleIndex(nextIdx);
      onClose();
      // Prompt user for next angle
      const nextAngleTitle = language === 'hi' ? anglePhotos[nextIdx].title_hi : anglePhotos[nextIdx].title_en;
      const nextVoice = language === 'hi'
        ? `बहुत अच्छा! अब ${nextAngleTitle} की फोटो लें।`
        : `Great! Now snap the ${nextAngleTitle}.`;
      speakVoice(nextVoice, language === 'hi' ? 'hi-IN' : 'en-IN');
      if (onCompleteAngle) onCompleteAngle(nextIdx);
    } else {
      // Completed all 3 angles! Advance to Step 2: Voice
      onClose();
      setCurrentStep(2);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-[400px] bg-slate-900 border border-slate-700/80 rounded-[32px] overflow-hidden shadow-2xl flex flex-col text-white">

        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black tracking-wider uppercase text-amber-300">
              {language === 'hi' ? 'एआई फोटो स्टूडियो जांच' : 'AI Photo Studio Check'}
            </span>
          </div>
          <div className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15">
            {language === 'hi' ? currentAngle.title_hi : currentAngle.title_en} ({activeAngleIndex + 1}/3)
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STATE 1: FAILED QUALITY GATE (Clear Icon-first Dominant Issue)  */}
        {/* ------------------------------------------------------------- */}
        {reviewState === 'failed' && (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            {/* Giant Visual Dominant Issue Icon */}
            <div className="relative w-24 h-24 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
              {qualityResult?.dominant_issue === 'blurry' && (
                <Activity className="w-12 h-12 text-rose-400 animate-pulse" />
              )}
              {qualityResult?.dominant_issue === 'cut_off' && (
                <Crop className="w-12 h-12 text-rose-400 animate-bounce" />
              )}
              {qualityResult?.dominant_issue === 'too_dark' && (
                <Moon className="w-12 h-12 text-amber-400" />
              )}
              {qualityResult?.dominant_issue === 'too_bright' && (
                <Sun className="w-12 h-12 text-yellow-400 animate-spin" />
              )}
              {qualityResult?.dominant_issue === 'cluttered' && (
                <Layers className="w-12 h-12 text-amber-400" />
              )}
              {!['blurry', 'cut_off', 'too_dark', 'too_bright', 'cluttered'].includes(qualityResult?.dominant_issue) && (
                <AlertTriangle className="w-12 h-12 text-amber-400" />
              )}
            </div>

            {/* Localized Dominant Issue Voice & Prompt */}
            <div className="space-y-1.5 max-w-[280px]">
              <h3 className="text-lg font-black text-white">
                {qualityResult?.dominant_issue === 'blurry' && (language === 'hi' ? 'फोटो धुंधली है' : 'Camera Shake / Blur')}
                {qualityResult?.dominant_issue === 'cut_off' && (language === 'hi' ? 'शिल्प कट रहा है' : 'Craft Cut Off')}
                {qualityResult?.dominant_issue === 'too_dark' && (language === 'hi' ? 'रोशनी बहुत कम है' : 'Too Dark')}
                {qualityResult?.dominant_issue === 'too_bright' && (language === 'hi' ? 'रोशनी बहुत तेज़ है' : 'Direct Glare')}
                {qualityResult?.dominant_issue === 'cluttered' && (language === 'hi' ? 'पीछे सामान दिख रहा है' : 'Busy Background')}
              </h3>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {language === 'hi' ? qualityResult?.voice_prompt_hi : qualityResult?.voice_prompt_en}
              </p>
            </div>

            {/* Audio Replay Pill */}
            <button
              onClick={() => {
                const p = language === 'hi' ? qualityResult?.voice_prompt_hi : qualityResult?.voice_prompt_en;
                speakVoice(p, language === 'hi' ? 'hi-IN' : 'en-IN');
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'निर्देश सुनें' : 'Listen Hint'}</span>
            </button>

            {/* Action Buttons: Big Retake Button + Override */}
            <div className="w-full pt-2 space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onRetake();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <Camera className="w-5 h-5 text-slate-950" />
                <span>{language === 'hi' ? 'दोबारा फोटो लें (लाइव गाइड)' : 'Retake with Live Guidance'}</span>
              </button>

              <button
                onClick={() => {
                  triggerEnhancement(rawPhotoBase64);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold border border-white/15 cursor-pointer transition-all active:scale-95"
              >
                {language === 'hi' ? 'फिर भी यह फोटो इस्तेमाल करें' : 'Continue Anyway'}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 2: ENHANCING PROGRESS ANIMATION (Cloud 4-Phase Step)      */}
        {/* ------------------------------------------------------------- */}
        {reviewState === 'enhancing' && (
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative w-28 h-28 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-3 w-full max-w-[260px]">
              <h3 className="text-base font-black text-white">
                {language === 'hi' ? 'एआई स्टूडियो रूपांतरण जारी है...' : 'AI Studio Transforming...'}
              </h3>

              {/* 4 Step Progress Indicators */}
              <div className="space-y-1.5 text-left text-xs text-slate-300 font-semibold bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className={`flex items-center gap-2 ${enhancementPhase >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {enhancementPhase > 1 ? <Check className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{language === 'hi' ? 'बैकग्राउंड हटाया जा रहा है' : 'Background Removal'}</span>
                </div>
                <div className={`flex items-center gap-2 ${enhancementPhase >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {enhancementPhase > 2 ? <Check className="w-3.5 h-3.5" /> : enhancementPhase === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                  <span>{language === 'hi' ? '6500K प्राकृतिक प्रकाश संतुलन' : '6500K Daylight Balance'}</span>
                </div>
                <div className={`flex items-center gap-2 ${enhancementPhase >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {enhancementPhase > 3 ? <Check className="w-3.5 h-3.5" /> : enhancementPhase === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                  <span>{language === 'hi' ? 'टेबल शैडो व 10% पैडिंग' : 'Contact Shadow Synthesis'}</span>
                </div>
                <div className={`flex items-center gap-2 ${enhancementPhase >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {enhancementPhase === 4 ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                  <span>{language === 'hi' ? 'ई-कॉमर्स 4K कैनवास' : 'E-Commerce Studio Ready'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 3: ENHANCED BEFORE/AFTER COMPARISON SLIDER & ACTIONS     */}
        {/* ------------------------------------------------------------- */}
        {reviewState === 'enhanced' && (
          <div className="flex flex-col">
            {/* Interactive Before / After Split Slider */}
            <div
              ref={containerRef}
              onMouseDown={() => (isDragging.current = true)}
              onMouseUp={() => (isDragging.current = false)}
              onMouseLeave={() => (isDragging.current = false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full aspect-square max-h-[320px] bg-slate-950 overflow-hidden select-none cursor-ew-resize border-b border-slate-800"
            >
              {/* Clean Studio Enhanced Image (Base Layer) */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#F8F9FA]">
                <img
                  src={enhancedResult?.processed_base64 || enhancedResult?.studio_url || rawPhotoBase64}
                  alt="Enhanced Studio Output"
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-black shadow-md flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>{language === 'hi' ? '4K एआई स्टूडियो' : 'AI Studio'}</span>
                </div>
              </div>

              {/* Raw Workshop Photo (Top Clipped Layer) */}
              <div
                style={{ width: `${sliderPosition}%` }}
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 bg-slate-900 shadow-2xl transition-[width] duration-75"
              >
                <div className="relative w-full h-full min-w-[320px] flex items-center justify-center">
                  <img
                    src={rawPhotoBase64}
                    alt="Raw Workshop Capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/90 border border-amber-500/50 text-amber-300 text-[10px] font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{language === 'hi' ? 'कच्चा फोटो' : 'Raw Capture'}</span>
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div
                style={{ left: `${sliderPosition}%` }}
                className="absolute inset-y-0 -ml-4 flex items-center justify-center pointer-events-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-950 shadow-xl flex items-center justify-center text-slate-950">
                  <Sliders className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Multi-Angle Mini Gallery Strip */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-around">
              {anglePhotos.map((ang, idx) => {
                const isCurrent = idx === activeAngleIndex;
                const isCaptured = Boolean(ang.studioBase64 || (idx === activeAngleIndex && enhancedResult));
                return (
                  <div
                    key={ang.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                        : isCaptured
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}
                  >
                    {isCaptured ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[8px]">
                        {idx + 1}
                      </span>
                    )}
                    <span>{language === 'hi' ? ang.title_hi.split(' ')[0] : ang.title_en.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions: Big Thumbs-Up (Keep & Next Angle) or Retake */}
            <div className="p-4 bg-slate-900 flex items-center gap-3">
              {/* Retake this angle */}
              <button
                onClick={() => {
                  onClose();
                  onRetake();
                }}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'दोबारा लें' : 'Retake'}</span>
              </button>

              {/* Big Thumbs-up / Accept */}
              <button
                onClick={handleAcceptAndNext}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <ThumbsUp className="w-4 h-4 text-slate-950" />
                <span>
                  {activeAngleIndex < anglePhotos.length - 1
                    ? (language === 'hi' ? 'स्वीकार करें & अगला एंगल लें' : 'Accept & Shoot Next Angle')
                    : (language === 'hi' ? 'स्वीकार करें & आगे बढ़ें' : 'Accept & Proceed')}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
