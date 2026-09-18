import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  ChevronDown,
  Layers,
  Upload,
  Info
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

export default function CameraViewfinder() {
  const {
    presets,
    selectedPreset,
    applyPreset,
    rawImageUrl,
    rawImageBase64,
    setRawImageBase64,
    setRawImageUrl,
    setCurrentStep,
    activeCategoryMode,
    setActiveCategoryMode,
    speakVoice,
    language
  } = useArtisan();

  // Camera stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null); // null | 'denied' | 'unavailable'
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop active media stream tracks cleanly
  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Request & start live camera stream
  const startLiveCamera = useCallback(async (desiredFacing = facingMode) => {
    stopMediaStream();
    setCameraError(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('unavailable');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: desiredFacing },
          width: { ideal: 1920, min: 720 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => console.warn('Autoplay prevented:', e));
        };
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
    }
  }, [facingMode, stopMediaStream]);

  // Start live camera automatically on mount / step load
  useEffect(() => {
    startLiveCamera(facingMode);

    // Audio prompt in user's language
    const promptText = language === 'hi'
      ? 'अपने शिल्प को कैमरे के फ्रेम में रखें और नीचे दिए गए पीले बटन को दबाकर फोटो लें।'
      : 'Frame your handcrafted item in the center and tap the shutter button to snap a photo.';
    speakVoice(promptText, language === 'hi' ? 'hi-IN' : 'en-IN');

    // Cleanup tracks on unmount
    return () => {
      stopMediaStream();
    };
  }, []);

  // Flip between front and rear camera
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Capture frame from live video to canvas
  const captureLiveFrame = () => {
    if (!videoRef.current || !isStreaming) return;

    // Trigger visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    // Haptic feedback if supported
    if ('vibrate' in navigator) navigator.vibrate([40, 30, 40]);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 1280;

    const ctx = canvas.getContext('2d');
    // If using front camera, mirror image for natural selfie orientation
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const b64 = canvas.toDataURL('image/jpeg', 0.94);
    setRawImageBase64(b64);
    setRawImageUrl(b64);

    // Stop camera feed after photo is secured
    stopMediaStream();

    // Advance to Step 2: Voice details
    setCurrentStep(2);
  };

  // Handle shutter button click
  const handleShutter = () => {
    if (isStreaming) {
      captureLiveFrame();
      return;
    }

    // If viewing a static demo preset
    if (rawImageUrl || rawImageBase64) {
      setIsShutterFlashing(true);
      setTimeout(() => setIsShutterFlashing(false), 200);
      if ('vibrate' in navigator) navigator.vibrate(50);

      if (!rawImageBase64 && rawImageUrl) {
        fetch(rawImageUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setRawImageBase64(reader.result);
              setCurrentStep(2);
            };
            reader.readAsDataURL(blob);
          })
          .catch(() => setCurrentStep(2));
      } else {
        setCurrentStep(2);
      }
    } else {
      // Prompt user to start camera or select file
      startLiveCamera();
    }
  };

  // Handle local photo upload from device gallery
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      stopMediaStream();
      setRawImageBase64(reader.result);
      setRawImageUrl(reader.result);
      if ('vibrate' in navigator) navigator.vibrate(50);
      setCurrentStep(2);
    };
    reader.readAsDataURL(file);
  };

  // Switch to demo preset (stops live camera for testing)
  const handleSelectPreset = (craft) => {
    stopMediaStream();
    applyPreset(craft);
  };

  // Contour categories with General / Auto-Detect first
  const categoryModes = [
    { id: 'auto', label: language === 'hi' ? '✨ सामान्य (ऑटो)' : '✨ General (Auto)', icon: Sparkles },
    { id: 'pottery', label: language === 'hi' ? '🏺 बर्तन' : '🏺 Pottery', icon: Layers },
    { id: 'saree', label: language === 'hi' ? '🥻 हथकरघा' : '🥻 Handloom', icon: Layers },
    { id: 'idol', label: language === 'hi' ? '🪆 मूर्ति' : '🪆 Brass', icon: Layers },
    { id: 'painting', label: language === 'hi' ? '🎨 चित्रकला' : '🎨 Painting', icon: Layers },
    { id: 'craft', label: language === 'hi' ? '🪵 काष्ठ/बांस' : '🪵 Bamboo', icon: Layers },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#FDFBF7] text-slate-900 select-none overflow-hidden font-sans">
      {/* Visual Shutter Flash Overlay */}
      <div
        className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-200 ${
          isShutterFlashing ? 'opacity-90' : 'opacity-0'
        }`}
      />

      {/* ==================================================================== */}
      {/* TOP HEADER: Step Title & Craft Guidance Pills                         */}
      {/* ==================================================================== */}
      <div className="z-20 pt-3 pb-2 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black shadow-xs">
              1
            </span>
            <span className="text-xs font-extrabold tracking-tight text-slate-900">
              {language === 'hi' ? 'पहला चरण: शिल्प की फोटो लें' : 'Step 1: Capture Craft Photo'}
            </span>
          </div>

          {/* Centering / Alignment Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {activeCategoryMode === 'auto'
                ? (language === 'hi' ? 'एआई स्वतः पहचान' : 'AI Auto-Detect')
                : (language === 'hi' ? 'फ्रेम संतुलित' : 'Aligned in Guide')}
            </span>
          </div>
        </div>

        {/* Category Modes (General / Auto-Detect is First & Prominent) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categoryModes.map((cat) => {
            const isSelected = activeCategoryMode === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryMode(cat.id)}
                className={`shrink-0 py-1 px-3 text-xs font-bold rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN VIEWFINDER BOX (Apple Camera & Google Lens Inspired)             */}
      {/* ==================================================================== */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-[380px] aspect-square rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-slate-950 flex items-center justify-center ring-1 ring-slate-200">
          
          {/* 1. Live Video Stream */}
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : rawImageUrl ? (
            /* 2. Static Preset Demo Photo */
            <div className="relative w-full h-full overflow-hidden bg-slate-900">
              <img
                src={rawImageUrl}
                alt="Craft Frame"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/samples/gorakhpur_terracotta.jpg';
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 border border-amber-400/60 text-[10px] text-amber-300 font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{language === 'hi' ? 'डेमो कार्यशाला नमूना' : 'Demo Workshop Sample'}</span>
              </div>
            </div>
          ) : (
            /* 3. Camera Error / Permission Fallback */
            <div className="text-center p-6 text-white space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {cameraError === 'denied'
                    ? (language === 'hi' ? 'कैमरा अनुमति आवश्यक है' : 'Camera Access Needed')
                    : (language === 'hi' ? 'कैमरा शुरू करें' : 'Start Live Camera')}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-[240px] mx-auto">
                  {cameraError === 'denied'
                    ? (language === 'hi' ? 'ब्राउज़र में कैमरा अनुमति दें या नीचे फोटो अपलोड करें।' : 'Please grant camera permission in browser settings or upload a photo.')
                    : (language === 'hi' ? 'शिल्प की स्पष्ट फोटो खींचने के लिए कैमरा खोलें।' : 'Open camera to capture high-definition photo.')}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1 max-w-[200px] mx-auto">
                <button
                  onClick={() => startLiveCamera()}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {language === 'hi' ? 'कैमरा चालू करें' : 'Open Camera'}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95"
                >
                  {language === 'hi' ? 'गैलरी से चुनें' : 'Upload from Device'}
                </button>
              </div>
            </div>
          )}

          {/* Saliency Framing Overlays & Reticle (Always Visible when Active) */}
          {(isStreaming || rawImageUrl) && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Dynamic Bounding Contour according to selected mode */}
              <div
                className={`w-[82%] h-[82%] border-2 border-dashed border-amber-300/90 transition-all duration-300 flex items-center justify-center ${
                  activeCategoryMode === 'pottery'
                    ? 'rounded-full scale-95'
                    : activeCategoryMode === 'saree'
                    ? 'rounded-3xl border-2'
                    : activeCategoryMode === 'idol'
                    ? 'rounded-t-full rounded-b-2xl'
                    : activeCategoryMode === 'painting'
                    ? 'rounded-none border-3'
                    : 'rounded-2xl'
                }`}
              >
                {/* 4 Apple-style Corner Crosshairs */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-white rounded-tl-sm shadow-xs" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-white rounded-tr-sm shadow-xs" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-white rounded-bl-sm shadow-xs" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-white rounded-br-sm shadow-xs" />

                {/* Central Saliency Aim Reticle */}
                <div className="w-14 h-14 rounded-full border border-amber-300/50 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />
                </div>
              </div>

              {/* Real-time Guidance Banner at bottom of viewfinder */}
              <div className="absolute bottom-3 inset-x-3 py-1.5 px-3 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <p className="text-[11px] font-bold text-white tracking-wide truncate">
                  {activeCategoryMode === 'auto'
                    ? (language === 'hi' ? 'शिल्प को फ्रेम में केंद्रित रखें' : 'Keep craft centered in frame')
                    : selectedPreset?.title_en || 'Frame craft inside outline'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Sample Crafts Toggle Link */}
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowDemoDrawer(!showDemoDrawer)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-full hover:bg-slate-200/60 cursor-pointer"
          >
            <span>{language === 'hi' ? 'डेमो शिल्प नमूने देखें' : 'Or test with demo sample crafts'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showDemoDrawer ? 'rotate-180' : ''}`} />
          </button>

          {/* Expandable Demo Tray */}
          {showDemoDrawer && (
            <div className="mt-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 flex-wrap">
              {presets.map((craft) => (
                <button
                  key={craft.id}
                  onClick={() => handleSelectPreset(craft)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer font-bold ${
                    selectedPreset?.id === craft.id && !isStreaming
                      ? 'bg-amber-100 border-amber-500 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {craft.craft_category.split('&')[0].trim()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BOTTOM CONTROLS BAR: Lens Switcher, Shutter, Gallery Upload          */}
      {/* ==================================================================== */}
      <div className="z-20 pb-7 pt-3 px-8 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around shrink-0 shadow-lg">
        
        {/* Button 1: Switch Camera Lens (Front / Back) or Re-open Camera */}
        <button
          onClick={isStreaming ? toggleCameraFacing : () => startLiveCamera()}
          title={isStreaming ? 'Flip Camera' : 'Start Camera'}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center shadow-xs active:scale-95 transition-transform">
            {isStreaming ? (
              <FlipHorizontal className="w-5 h-5 text-slate-700" />
            ) : (
              <RefreshCw className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <span className="text-[10px] font-bold">
            {isStreaming ? (language === 'hi' ? 'कैमरा घुमाएं' : 'Flip') : (language === 'hi' ? 'लाइव कैमरा' : 'Live')}
          </span>
        </button>

        {/* Button 2: Grand Shutter Button (Tactile Apple Camera / MoSJE Gold Ring) */}
        <button
          onClick={handleShutter}
          aria-label="Capture Photo"
          className="group relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-xl shadow-amber-500/25 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
        >
          {/* Inner ring */}
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center group-hover:bg-amber-50 transition-colors shadow-inner">
            {/* Shutter icon core */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-sm">
              <Camera className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
          </div>
        </button>

        {/* Button 3: Gallery / Device File Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload from Device Gallery"
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center shadow-xs active:scale-95 transition-transform">
            <ImageIcon className="w-5 h-5 text-slate-700" />
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
    </div>
  );
}
