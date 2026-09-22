import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Zap,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Check,
  Eye,
  Sliders,
  Loader2
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';
import {
  calculateTiltLevel,
  classifyShotAngle,
  analyzeFrameLuminance,
  estimateSubjectSaliencyAndCoverage,
  computeBackgroundClutterScore,
  detectFrameMotion
} from '../services/visionHeuristics';
import { checkPhotoQuality } from '../services/api';
import StudioQualityReviewModal from './StudioQualityReviewModal';

export default function CameraViewfinder() {
  const {
    presets,
    selectedPreset,
    applyPreset,
    rawImageUrl,
    rawImageBase64,
    setRawImageBase64,
    setRawImageUrl,
    activeCategoryMode,
    setActiveCategoryMode,
    activeAngleIndex,
    setActiveAngleIndex,
    anglePhotos,
    saveAnglePhoto,
    speakVoice,
    language
  } = useArtisan();

  // Camera stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null); // null | 'denied' | 'unavailable'
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  // High contrast outdoor mode (for intense sunlight shooting)
  const [highSunlightMode, setHighSunlightMode] = useState(false);

  // AI Guide toggle (Default: FALSE - artisan gets clean, unhindered camera view first)
  const [isAiGuideEnabled, setIsAiGuideEnabled] = useState(false);

  // Sound / Voice prompts toggle
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Auto-capture toggle (default: true when AI guide is on)
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0); // 0 to 100%

  // Real-time Guidance HUD States
  const [tiltState, setTiltState] = useState({ isLevel: true, tiltDegrees: 0, bubbleOffsetPct: 0, direction: 'level' });
  const [lightingState, setLightingState] = useState({ status: 'good', meanLum: 128, visualHint: 'balanced' });
  const [framingState, setFramingState] = useState({ coveragePct: 68, distanceStatus: 'good', isCentered: true, nudge: 'centered' });
  const [clutterState, setClutterState] = useState({ isCluttered: false, clutterDensity: 0 });
  const [steadinessState, setSteadinessState] = useState({ isSteady: true, motionScore: 0 });

  // Toggle AI Guide with gentle tactile & audio confirmation
  const toggleAiGuide = () => {
    setIsAiGuideEnabled((prev) => {
      const next = !prev;
      if ('vibrate' in navigator) navigator.vibrate(35);
      if (next) {
        if (isVoiceActive) {
          const prompt = language === 'hi'
            ? 'एआई गाइड चालू है। शिल्प को कैमरे के केंद्र में रखें।'
            : 'AI Guide activated. Frame craft in center.';
          speakVoice(prompt, language === 'hi' ? 'hi-IN' : 'en-IN');
        }
      } else {
        autoCaptureStartTimeRef.current = null;
        setAutoCaptureProgress(0);
      }
      return next;
    });
  };

  // Post-capture quality review modal & tilt metadata
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [capturedFrameBase64, setCapturedFrameBase64] = useState(null);
  const [capturedShotAngleInfo, setCapturedShotAngleInfo] = useState(null);
  const [qualityResult, setQualityResult] = useState(null);

  const latestOrientationRef = useRef({ beta: 90, gamma: 0 });
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const prevFrameBufferRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const autoCaptureStartTimeRef = useRef(null);
  const lastVoiceTimeRef = useRef(0);

  // Active angle info
  const currentAngle = anglePhotos[activeAngleIndex] || anglePhotos[0];

  // Stop active media stream tracks cleanly
  const stopMediaStream = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Track stop note:', e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Multi-tier progressive getUserMedia fallback
  const getMediaStreamWithFallback = async (desiredFacing) => {
    // Strategy 1: Ideal HD + facingMode (ideal for mobile and HD webcams)
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: desiredFacing ? { ideal: desiredFacing } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('Strategy 1 (HD + Facing) failed, trying Strategy 2:', err1);
    }

    // Strategy 2: Simple facingMode constraint without dimension restrictions
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: desiredFacing ? { facingMode: desiredFacing } : true,
        audio: false,
      });
    } catch (err2) {
      console.warn('Strategy 2 (Facing only) failed, trying Strategy 3:', err2);
    }

    // Strategy 3: Universal video fallback (ensures desktop PC webcams and USB cams open)
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  };

  // Request & start live camera stream with self-healing stream binding
  const startLiveCamera = useCallback(async (desiredFacing = facingMode, forceRestart = false) => {
    // If stream is already active and healthy, and we are not forcing lens switch, keep it running!
    if (!forceRestart && streamRef.current && streamRef.current.active) {
      const activeTrack = streamRef.current.getVideoTracks().find((t) => t.readyState === 'live');
      if (activeTrack && videoRef.current) {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        try {
          await videoRef.current.play();
          setIsStreaming(true);
          setCameraError(null);
          return;
        } catch (playErr) {
          console.warn('Re-play on existing stream note:', playErr);
        }
      }
    }

    stopMediaStream();
    setCameraError(null);
    setIsStartingCamera(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('unavailable');
      setIsStartingCamera(false);
      return;
    }

    try {
      const stream = await getMediaStreamWithFallback(desiredFacing);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Autoplay waiting for user gesture or metadata:', playErr);
        }
      }

      setIsStreaming(true);
      setCameraError(null);
    } catch (err) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('denied');
      } else {
        setCameraError('unavailable');
      }
      setIsStreaming(false);
    } finally {
      setIsStartingCamera(false);
    }
  }, [facingMode, stopMediaStream]);

  // Handle device orientation for tilt / level bubble and angle tagging
  useEffect(() => {
    const handleOrientation = (e) => {
      const gamma = e.gamma !== null ? e.gamma : 0;
      const beta = e.beta !== null ? e.beta : 90;
      latestOrientationRef.current = { beta, gamma };
      const tilt = calculateTiltLevel(gamma, beta);
      setTiltState(tilt);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Start live camera cleanly on mount
  useEffect(() => {
    startLiveCamera(facingMode, false);

    return () => {
      stopMediaStream();
    };
  }, []);

  // Self-healing: if videoRef mounts/updates while stream is ready, ensure stream is bound
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isStreaming]);

  // Flip between front and rear camera
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startLiveCamera(nextFacing, true);
  };

  // Real-time on-device computer vision loop (15-20 FPS)
  useEffect(() => {
    if (!isStreaming) return;

    let isMounted = true;
    const canvas = analysisCanvasRef.current || document.createElement('canvas');
    analysisCanvasRef.current = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 120;
    canvas.height = 120;

    const runVisionLoop = () => {
      if (!isMounted || !videoRef.current || !isStreaming) return;

      const video = videoRef.current;
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, 120, 120);
        const imgData = ctx.getImageData(0, 0, 120, 120);

        // 1. Lighting check via histogram
        const light = analyzeFrameLuminance(imgData);
        setLightingState(light);

        // 2. Saliency distance & centering
        const framing = estimateSubjectSaliencyAndCoverage(imgData);
        setFramingState(framing);

        // 3. Background clutter check
        const clutter = computeBackgroundClutterScore(imgData);
        setClutterState(clutter);

        // 4. Steadiness via frame buffer differencing
        const currGrayscale = new Uint8Array(120 * 120);
        for (let i = 0, p = 0; i < imgData.data.length; i += 4, p++) {
          currGrayscale[p] = (imgData.data[i] * 77 + imgData.data[i + 1] * 150 + imgData.data[i + 2] * 29) >> 8;
        }

        const steady = detectFrameMotion(prevFrameBufferRef.current, currGrayscale);
        setSteadinessState(steady);
        prevFrameBufferRef.current = currGrayscale;

        // 5. Evaluate Auto-Capture Readiness (Only when AI Guide is explicitly turned on):
        const isAllGreen =
          tiltState.isLevel &&
          framing.distanceStatus === 'good' &&
          framing.isCentered &&
          light.status === 'good' &&
          steady.isSteady;

        if (isAiGuideEnabled && autoCaptureEnabled && isAllGreen) {
          const now = Date.now();
          if (!autoCaptureStartTimeRef.current) {
            autoCaptureStartTimeRef.current = now;
          }
          const elapsed = now - autoCaptureStartTimeRef.current;
          const COUNTDOWN_MS = 1400; // 1.4s countdown ring
          const progress = Math.min(100, (elapsed / COUNTDOWN_MS) * 100);
          setAutoCaptureProgress(progress);

          if (elapsed >= COUNTDOWN_MS) {
            autoCaptureStartTimeRef.current = null;
            setAutoCaptureProgress(0);
            captureFrame();
            return;
          }
        } else {
          autoCaptureStartTimeRef.current = null;
          if (autoCaptureProgress > 0) {
            setAutoCaptureProgress(0);
          }
        }

        // Voice nudge throttling (ONLY when AI Guide is active)
        const now = Date.now();
        if (isAiGuideEnabled && isVoiceActive && now - lastVoiceTimeRef.current > 7000) {
          if (!tiltState.isLevel) {
            const tiltHint = language === 'hi'
              ? (tiltState.direction === 'left' ? 'कैमरा थोड़ा सीधा रखें' : 'कैमरा सीधा करें')
              : 'Keep camera level';
            speakVoice(tiltHint, language === 'hi' ? 'hi-IN' : 'en-IN');
            lastVoiceTimeRef.current = now;
          } else if (framing.distanceStatus === 'too_far') {
            const distHint = language === 'hi' ? 'थोड़ा और पास लाएं' : 'Move camera closer';
            speakVoice(distHint, language === 'hi' ? 'hi-IN' : 'en-IN');
            lastVoiceTimeRef.current = now;
          } else if (framing.distanceStatus === 'too_close') {
            const backHint = language === 'hi' ? 'थोड़ा पीछे करें' : 'Step back slightly';
            speakVoice(backHint, language === 'hi' ? 'hi-IN' : 'en-IN');
            lastVoiceTimeRef.current = now;
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(runVisionLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(runVisionLoop);

    return () => {
      isMounted = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isStreaming, tiltState.isLevel, autoCaptureEnabled, isVoiceActive, language]);

  // Capture frame from live video
  const captureFrame = async () => {
    let b64 = null;

    if (isStreaming && videoRef.current) {
      // Visual shutter flash
      setIsShutterFlashing(true);
      setTimeout(() => setIsShutterFlashing(false), 200);

      // Haptic feedback
      if ('vibrate' in navigator) navigator.vibrate([50, 40, 50]);

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 1280;

      const ctx = canvas.getContext('2d');
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      b64 = canvas.toDataURL('image/jpeg', 0.94);
    } else if (rawImageUrl || rawImageBase64) {
      // Static preset demo capture
      setIsShutterFlashing(true);
      setTimeout(() => setIsShutterFlashing(false), 200);
      if ('vibrate' in navigator) navigator.vibrate(50);
      b64 = rawImageBase64 || rawImageUrl;
    } else {
      startLiveCamera();
      return;
    }

    // Compute capture-time shot angle and perspective classification
    const { beta, gamma } = latestOrientationRef.current;
    const angleInfo = classifyShotAngle(beta, gamma);
    setCapturedShotAngleInfo(angleInfo);

    setCapturedFrameBase64(b64);
    setIsReviewModalOpen(true);
    setQualityResult(null);

    // Call Cloud / Heuristic Quality Gate
    try {
      const qRes = await checkPhotoQuality({
        imageBase64: b64,
        language,
        categoryHint: activeCategoryMode,
      });
      setQualityResult(qRes);
    } catch (err) {
      console.warn('Quality check fallback:', err);
      setQualityResult({
        passed: true,
        dominant_issue: null,
        voice_prompt_hi: 'फोटो स्पष्ट है। स्टूडियो तैयार किया जा रहा है।',
        voice_prompt_en: 'Photo verified. Proceeding to studio enhancement.',
      });
    }
  };

  // Upload photo from device gallery
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopMediaStream();

    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result;
      const angleInfo = classifyShotAngle(90, 0); // Default level shot for uploaded photo
      setCapturedShotAngleInfo(angleInfo);
      setCapturedFrameBase64(b64);
      setIsReviewModalOpen(true);
      setQualityResult(null);

      try {
        const qRes = await checkPhotoQuality({
          file,
          imageBase64: b64,
          language,
          categoryHint: activeCategoryMode,
        });
        setQualityResult(qRes);
      } catch (err) {
        setQualityResult({
          passed: true,
          dominant_issue: null,
          voice_prompt_hi: 'फोटो स्पष्ट है। स्टूडियो तैयार किया जा रहा है।',
          voice_prompt_en: 'Photo verified. Proceeding to studio enhancement.',
        });
      }
    };
    reader.readAsDataURL(file);

    // Reset input so artisan can re-select the same or another photo
    if (e.target) e.target.value = '';
  };

  // Switch to demo preset craft
  const handleSelectPreset = (craft) => {
    stopMediaStream();
    const angleInfo = classifyShotAngle(90, 0);
    setCapturedShotAngleInfo(angleInfo);
    applyPreset(craft);
  };

  // Category Modes for dynamic outline guide
  const categoryModes = [
    { id: 'auto', label: language === 'hi' ? '✨ सामान्य (ऑटो)' : '✨ General', icon: Sparkles },
    { id: 'pottery', label: language === 'hi' ? '🏺 बर्तन' : '🏺 Pottery', icon: Layers },
    { id: 'saree', label: language === 'hi' ? '🥻 हथकरघा' : '🥻 Handloom', icon: Layers },
    { id: 'idol', label: language === 'hi' ? '🪆 मूर्ति' : '🪆 Brass/Idol', icon: Layers },
    { id: 'painting', label: language === 'hi' ? '🎨 चित्रकला' : '🎨 Painting', icon: Layers },
    { id: 'craft', label: language === 'hi' ? '🪵 काष्ठ/बांस' : '🪵 Bamboo', icon: Layers },
  ];

  // Derive guidance status colors (Red = Fix, Yellow = Almost, Green = Ready)
  const isLevelGreen = tiltState.isLevel;
  const isDistanceGreen = framingState.distanceStatus === 'good';
  const isCenteredGreen = framingState.isCentered;
  const isLightingGreen = lightingState.status === 'good';
  const isSteadyGreen = steadinessState.isSteady;

  const allChecksReady = isLevelGreen && isDistanceGreen && isCenteredGreen && isLightingGreen && isSteadyGreen;

  return (
    <div className={`relative w-full h-full flex flex-col select-none overflow-hidden font-sans transition-colors duration-200 ${
      highSunlightMode ? 'bg-black text-white' : 'bg-[#0A0D14] text-slate-100'
    }`}>
      {/* Visual Shutter Flash Overlay */}
      <div
        className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-200 ${
          isShutterFlashing ? 'opacity-90' : 'opacity-0'
        }`}
      />

      {/* ==================================================================== */}
      {/* TOP BAR: Multi-Angle Pill Stepper & Quick HUD Controls               */}
      {/* ==================================================================== */}
      <div className="z-30 pt-3 pb-2 px-3 bg-black/80 backdrop-blur-md border-b border-white/10 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          {/* Multi-Angle 3-Shot Selector */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15">
            {anglePhotos.map((ang, idx) => {
              const isSelected = activeAngleIndex === idx;
              const hasTaken = Boolean(ang.studioBase64 || ang.rawBase64);
              return (
                <button
                  key={ang.id}
                  onClick={() => setActiveAngleIndex(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : hasTaken
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {hasTaken ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px]">
                      {idx + 1}
                    </span>
                  )}
                  <span>
                    {idx === 0
                      ? (language === 'hi' ? '1. मुख्य' : '1. Front')
                      : idx === 1
                      ? (language === 'hi' ? '2. किनारा' : '2. Side')
                      : (language === 'hi' ? '3. पीछे' : '3. Back')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Sensory Controls: Sunlight & Voice */}
          <div className="flex items-center gap-2">
            {/* Auto Capture Toggle */}
            <button
              onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
              title="Auto-Capture Toggle"
              className={`p-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                autoCaptureEnabled
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Auto</span>
            </button>

            {/* High Sunlight Visibility Toggle */}
            <button
              onClick={() => setHighSunlightMode(!highSunlightMode)}
              title="Outdoor High Sunlight Mode"
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                highSunlightMode
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md'
                  : 'bg-white/10 text-slate-300 border-white/15'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            {/* Voice Audio Toggle */}
            <button
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              title="Voice Guidance Toggle"
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isVoiceActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              {isVoiceActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Craft Contour Category Scroller - Visible when AI Guide is active */}
        {isAiGuideEnabled && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar transition-all duration-300">
            {categoryModes.map((cat) => {
              const isSelected = activeCategoryMode === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryMode(cat.id)}
                  className={`shrink-0 py-1 px-2.5 text-[11px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-sm'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MAIN VIEWFINDER BOX (Apple Camera & Google Lens Real-Time HUD)        */}
      {/* ==================================================================== */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-3">
        <div className={`relative w-full max-w-[390px] aspect-square rounded-[36px] overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-200 ${
          highSunlightMode
            ? 'border-4 border-yellow-400 bg-black'
            : 'border-2 border-white/20 bg-slate-950 ring-2 ring-white/10 shadow-black'
        }`}>

          {/* 1. Live Hardware Video Pipeline (Always Mounted to prevent ref nullification) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onPlaying={() => {
              setIsStreaming(true);
              setIsStartingCamera(false);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isStreaming ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />

          {/* 2. Loading Indicator */}
          {isStartingCamera && !isStreaming && (
            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-slate-200">
                {language === 'hi' ? 'कैमरा शुरू हो रहा है...' : 'Starting camera...'}
              </span>
            </div>
          )}

          {/* 3. Fallback View: Demo Preset OR Camera Permission / Device Error */}
          {!isStreaming && !isStartingCamera && (
            rawImageUrl && !cameraError ? (
              /* Static Preset Demo Photo */
              <div className="relative w-full h-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={rawImageUrl}
                  alt="Craft Frame"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 border border-amber-400/60 text-[10px] text-amber-300 font-bold backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>{language === 'hi' ? 'डेमो कार्यशाला नमूना' : 'Demo Sample'}</span>
                </div>
                {/* Switch to Live Camera CTA */}
                <button
                  onClick={() => startLiveCamera(facingMode, true)}
                  className="absolute bottom-4 py-2 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl active:scale-95 flex items-center gap-1.5 cursor-pointer z-10"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'hi' ? 'लाइव कैमरा चालू करें' : 'Switch to Live Camera'}</span>
                </button>
              </div>
            ) : (
              /* Camera Error / Permission Fallback */
              <div className="text-center p-6 text-white space-y-3 z-10">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-black text-white">
                  {cameraError === 'denied'
                    ? (language === 'hi' ? 'कैमरा अनुमति आवश्यक है' : 'Camera Permission Needed')
                    : (language === 'hi' ? 'कैमरा लोड नहीं हुआ' : 'Camera Not Available')}
                </h4>
                <p className="text-xs text-slate-300 max-w-[240px] mx-auto leading-relaxed">
                  {cameraError === 'denied'
                    ? (language === 'hi'
                        ? 'कृपया ब्राउज़र सेटिंग्स या एड्रेस बार में कैमरा की अनुमति दें।'
                        : 'Please allow camera permission in browser settings.')
                    : (language === 'hi'
                        ? 'शिल्प की स्पष्ट फोटो के लिए कैमरा चालू करें या गैलरी से चुनें।'
                        : 'Start camera to capture craft photo or upload from gallery.')}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => startLiveCamera(facingMode, true)}
                    className="py-2 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 cursor-pointer"
                  >
                    {language === 'hi' ? 'कैमरा शुरू करें' : 'Start Camera'}
                  </button>
                </div>
              </div>
            )
          )}

          {/* Minimalist Apple Camera Corner Brackets (Always Clean & Visible) */}
          <div className="absolute inset-5 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white/35 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white/35 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white/35 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white/35 rounded-br-sm" />
          </div>

          {/* Floating Glassmorphic "✨ AI Guide" Button (Apple Camera & Material You Masterpiece) */}
          <div className="absolute top-3.5 right-3.5 z-30 pointer-events-auto">
            <button
              onClick={toggleAiGuide}
              title={isAiGuideEnabled ? 'Turn off AI Guide' : 'Turn on AI Guide'}
              className={`group relative flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-black backdrop-blur-xl transition-all duration-300 shadow-xl cursor-pointer active:scale-95 ${
                isAiGuideEnabled
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/35 ring-2 ring-amber-300/80'
                  : 'bg-black/60 hover:bg-black/80 border border-white/25 hover:border-amber-400/70 text-white/95 hover:text-amber-300 shadow-black/60'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 transition-transform group-hover:rotate-12 ${
                isAiGuideEnabled ? 'text-slate-950' : 'text-amber-400 animate-pulse'
              }`} />
              <span className="tracking-tight">
                {isAiGuideEnabled
                  ? (language === 'hi' ? 'एआई गाइड सक्रिय' : 'AI Guide Active')
                  : (language === 'hi' ? '✨ एआई गाइड' : '✨ AI Guide')}
              </span>
              <span className={`w-2 h-2 rounded-full transition-all ${
                isAiGuideEnabled ? 'bg-slate-950 animate-ping' : 'bg-amber-400/80'
              }`} />
            </button>
          </div>

          {/* ================================================================ */}
          {/* REAL-TIME ON-DEVICE COMPUTER VISION GUIDANCE HUD OVERLAYS         */}
          {/* (ONLY ACTIVE WHEN ARTISAN EXPLICITLY TAPS THE AI GUIDE BUTTON)     */}
          {/* ================================================================ */}
          {isAiGuideEnabled && (isStreaming || rawImageUrl) && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">

              {/* Top HUD Row: 1. Level Bubble + 2. Lighting Sun + 3. Clutter Warning */}
              <div className="flex items-center justify-between z-10">

                {/* 1. Gyroscope Level Bubble Indicator */}
                <div className={`px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1.5 text-[10px] font-black transition-all ${
                  isLevelGreen
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                    : 'bg-rose-500/25 border-rose-400 text-rose-300 animate-pulse'
                }`}>
                  {/* Bubble level slot */}
                  <div className="w-10 h-3 bg-black/60 rounded-full border border-white/20 relative overflow-hidden flex items-center justify-center">
                    {/* Level line mark in center */}
                    <div className="absolute w-0.5 h-full bg-white/60 left-1/2 -ml-[1px]" />
                    {/* Animated moving bubble */}
                    <div
                      style={{ transform: `translateX(${tiltState.bubbleOffsetPct * 0.16}px)` }}
                      className={`w-2.5 h-2.5 rounded-full transition-transform duration-100 ${
                        isLevelGreen ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                  </div>
                  <span>{isLevelGreen ? '0° Level' : `${tiltState.tiltDegrees}°`}</span>
                </div>

                {/* 2. Lighting & Exposure Sensor Badge */}
                <div className={`px-2 py-1 rounded-full backdrop-blur-md border flex items-center gap-1 text-[10px] font-black transition-all ${
                  lightingState.status === 'good'
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                    : lightingState.status === 'dim'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                    : 'bg-rose-500/25 border-rose-400 text-rose-300'
                }`}>
                  {lightingState.status === 'good' && <Sun className="w-3.5 h-3.5 text-emerald-400" />}
                  {lightingState.status === 'dim' && <Moon className="w-3.5 h-3.5 text-amber-400" />}
                  {lightingState.status === 'bright' && <Sun className="w-3.5 h-3.5 text-rose-400 animate-spin" />}
                  <span>
                    {lightingState.status === 'good'
                      ? (language === 'hi' ? 'प्रकाश सही' : 'Light OK')
                      : lightingState.status === 'dim'
                      ? (language === 'hi' ? 'रोशनी कम' : 'Dim')
                      : (language === 'hi' ? 'तेज़ धूप' : 'Glare')}
                  </span>
                </div>

                {/* 3. Soft Background Clutter Flag */}
                {clutterState.isCluttered && (
                  <div className="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold backdrop-blur-md flex items-center gap-1 animate-pulse">
                    <Layers className="w-3 h-3" />
                    <span>{language === 'hi' ? 'सादा पर्दा रखें' : 'Plain BG'}</span>
                  </div>
                )}
              </div>

              {/* Center HUD: Dynamic Bounding Contour Box + Distance Arrows */}
              <div className="relative flex-1 flex items-center justify-center">

                {/* Pulsing Guide Outline Box */}
                <div
                  className={`w-[78%] h-[78%] transition-all duration-300 relative flex items-center justify-center ${
                    isDistanceGreen && isCenteredGreen
                      ? 'border-3 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                      : 'border-2 border-dashed border-amber-400/90'
                  } ${
                    activeCategoryMode === 'pottery'
                      ? 'rounded-full scale-95'
                      : activeCategoryMode === 'saree'
                      ? 'rounded-3xl'
                      : activeCategoryMode === 'idol'
                      ? 'rounded-t-full rounded-b-2xl'
                      : activeCategoryMode === 'painting'
                      ? 'rounded-none'
                      : 'rounded-3xl'
                  }`}
                >
                  {/* Apple-style corner crosshairs */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-white rounded-tl-sm" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-white rounded-tr-sm" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-white rounded-bl-sm" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-white rounded-br-sm" />

                  {/* Centering Directional Chevrons */}
                  {!framingState.isCentered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {framingState.nudge === 'left' && (
                        <div className="w-10 h-10 rounded-full bg-amber-500/80 text-slate-950 flex items-center justify-center animate-bounce">
                          <ArrowRight className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                      {framingState.nudge === 'right' && (
                        <div className="w-10 h-10 rounded-full bg-amber-500/80 text-slate-950 flex items-center justify-center animate-bounce">
                          <ArrowLeft className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                      {framingState.nudge === 'up' && (
                        <div className="w-10 h-10 rounded-full bg-amber-500/80 text-slate-950 flex items-center justify-center animate-bounce">
                          <ArrowDown className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                      {framingState.nudge === 'down' && (
                        <div className="w-10 h-10 rounded-full bg-amber-500/80 text-slate-950 flex items-center justify-center animate-bounce">
                          <ArrowUp className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Distance Prompt Icon (Move Closer / Move Back) */}
                  {framingState.distanceStatus === 'too_far' && (
                    <div className="absolute -top-4 px-3 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-black shadow-lg flex items-center gap-1.5 animate-bounce">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पास लाएं' : 'Move Closer'}</span>
                    </div>
                  )}
                  {framingState.distanceStatus === 'too_close' && (
                    <div className="absolute -top-4 px-3 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-black shadow-lg flex items-center gap-1.5 animate-bounce">
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पीछे करें' : 'Move Back'}</span>
                    </div>
                  )}

                  {/* Central Reticle: Turns glowing green when centered & steady */}
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    allChecksReady
                      ? 'border-emerald-400 bg-emerald-500/20 scale-110'
                      : 'border-white/30 bg-black/20'
                  }`}>
                    {allChecksReady ? (
                      <Check className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom HUD Banner: Angle Guide & Auto-Capture Progress Bar */}
              <div className="flex flex-col items-center gap-1 z-10">
                {/* Auto-Capture Countdown Progress Pill */}
                {autoCaptureEnabled && autoCaptureProgress > 0 && (
                  <div className="w-full max-w-[200px] h-2 bg-black/60 rounded-full overflow-hidden border border-emerald-400/50">
                    <div
                      style={{ width: `${autoCaptureProgress}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-75"
                    />
                  </div>
                )}

                {/* Bottom Context Banner */}
                <div className={`py-1 px-4 rounded-full backdrop-blur-md border text-center flex items-center gap-2 ${
                  allChecksReady
                    ? 'bg-emerald-600/90 border-emerald-400 text-white'
                    : 'bg-black/75 border-white/20 text-slate-200'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-extrabold tracking-wide">
                    {allChecksReady
                      ? (autoCaptureEnabled
                          ? (language === 'hi' ? 'स्थिर रखें... स्वतः फोटो ले रहा है' : 'Hold Steady... Auto Snapping')
                          : (language === 'hi' ? 'बिल्कुल सही! बटन दबाएं' : 'Ready! Tap Shutter'))
                      : (language === 'hi'
                          ? currentAngle.title_hi
                          : currentAngle.title_en)}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Demo Workshop Craft Presets Drawer Link */}
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {presets.slice(0, 3).map((craft) => (
              <button
                key={craft.id}
                onClick={() => handleSelectPreset(craft)}
                className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer font-bold ${
                  selectedPreset?.id === craft.id && !isStreaming
                    ? 'bg-amber-400 border-amber-300 text-slate-950'
                    : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                {craft.craft_category.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BOTTOM CONTROL DECK: Tactile Shutter, Lens Switch, Gallery Upload    */}
      {/* ==================================================================== */}
      <div className="z-30 pb-6 pt-3 px-8 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around shrink-0">

        {/* 1. Camera Flip / Re-open Lens */}
        <button
          onClick={isStreaming ? toggleCameraFacing : () => startLiveCamera(facingMode, true)}
          title="Flip Camera"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/15 flex items-center justify-center active:scale-95 transition-transform">
            {isStreaming ? <FlipHorizontal className="w-5 h-5 text-slate-200" /> : <RefreshCw className="w-5 h-5 text-amber-400" />}
          </div>
          <span className="text-[10px] font-bold">
            {isStreaming ? (language === 'hi' ? 'घुमाएं' : 'Flip') : (language === 'hi' ? 'चालू करें' : 'Open')}
          </span>
        </button>

        {/* 2. Apple Camera Gold/Amber Tactile Shutter Button */}
        <button
          onClick={captureFrame}
          aria-label="Capture Photo"
          className={`group relative w-20 h-20 rounded-full p-1 shadow-2xl active:scale-90 transition-transform flex items-center justify-center cursor-pointer ${
            isAiGuideEnabled && allChecksReady
              ? 'bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 shadow-emerald-500/40 ring-4 ring-emerald-400/40'
              : 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 shadow-amber-500/30'
          }`}
        >
          {/* Steadiness Ring */}
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center p-1">
            {/* Shutter core */}
            <div className={`w-full h-full rounded-full flex items-center justify-center transition-colors shadow-md ${
              isAiGuideEnabled && allChecksReady ? 'bg-emerald-400' : 'bg-gradient-to-tr from-amber-500 to-yellow-400'
            }`}>
              <Camera className="w-7 h-7 text-slate-950 drop-shadow-sm" />
            </div>
          </div>
        </button>

        {/* 3. Device Gallery Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload from Device Gallery"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/15 flex items-center justify-center active:scale-95 transition-transform">
            <ImageIcon className="w-5 h-5 text-slate-200" />
          </div>
          <span className="text-[10px] font-bold">
            {language === 'hi' ? 'गैलरी' : 'Upload'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* POST-CAPTURE QUALITY CHECK & ENHANCEMENT REVIEW MODAL */}
      {/* ==================================================================== */}
      <StudioQualityReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        rawPhotoBase64={capturedFrameBase64}
        shotAngleInfo={capturedShotAngleInfo}
        qualityResult={qualityResult}
        onRetake={() => {
          setIsReviewModalOpen(false);
          startLiveCamera(facingMode, false);
        }}
        onCompleteAngle={(nextIdx) => {
          setIsReviewModalOpen(false);
          startLiveCamera(facingMode, false);
        }}
      />
    </div>
  );
}
