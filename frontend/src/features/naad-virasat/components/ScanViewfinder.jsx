import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DEMO_CARVINGS } from '../vision/demoCarvings.js';
import { preprocessCarvingImage, analyzeCarving } from '../vision/visionAdapter.js';
import instruments from '../data/instruments.json' with { type: 'json' };

/**
 * ScanViewfinder - Entry Viewfinder & Scanning Flow
 * Three modes:
 * 1. "Scan a carving" (Live device camera with permission fallback)
 * 2. "Upload photo" (File input with EXIF-stripping canvas normalization)
 * 3. "Try a demo carving" (Curated offline gallery of 8 temple carvings)
 */
export default function ScanViewfinder({ onScanComplete }) {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'upload' | 'camera'
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please use file upload or the demo gallery.');
    }
  };

  // Capture frame from live video
  const handleCaptureCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      stopCamera();
      processImageBlob(blob);
    }, 'image/jpeg', 0.9);
  };

  // Process uploaded or captured blob
  const processImageBlob = async (blob) => {
    try {
      setIsScanning(true);
      setScanProgressText('Stripping EXIF/GPS metadata & normalizing image...');
      const preprocessed = await preprocessCarvingImage(blob);
      setPreviewImage(preprocessed.dataUrl);

      setScanProgressText('Analyzing carving morphology via temple art organology...');
      const result = await analyzeCarving(preprocessed.dataUrl, preprocessed.base64);

      setAnalysisResult(result);
      if (result.candidates && result.candidates.length > 0) {
        setSelectedCandidateId(result.candidates[0].instrumentId);
      }
    } catch (err) {
      console.error('Scanning error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle demo carving selection
  const handleSelectDemoCarving = async (demo) => {
    setIsScanning(true);
    setScanProgressText('Loading curated temple carving...');
    setPreviewImage(demo.imageSrc);

    setTimeout(async () => {
      const result = await analyzeCarving(demo.imageSrc, '', demo.id);
      setAnalysisResult(result);
      setSelectedCandidateId(demo.instrumentId);
      setIsScanning(false);
    }, 400);
  };

  // Proceed into Playing Studio
  const handleConfirmAndPlay = () => {
    if (!analysisResult || !selectedCandidateId) return;
    const matchedCandidate = analysisResult.candidates.find(c => c.instrumentId === selectedCandidateId)
      || analysisResult.candidates[0];
    const instrumentObj = instruments.find(i => i.id === selectedCandidateId)
      || instruments[0];

    onScanComplete({
      instrument: instrumentObj,
      carvingImageSrc: previewImage,
      boundingBox: matchedCandidate.box,
      confidence: matchedCandidate.confidence,
      rationale: matchedCandidate.rationale
    });
  };

  return (
    <div
      className="nv-scan-viewfinder"
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px',
        background: 'linear-gradient(145deg, #14100c 0%, #1c1610 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
        color: '#fef3c7',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header & Tagline */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '28px' }}>🪕</span>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fef08a', letterSpacing: '0.02em' }}>
            नाद विरासत (Naad-Virasat)
          </h1>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#d4af37', fontStyle: 'italic' }}>
          "We don't resurrect lost sounds. We give you an evidence-based, playable approximation of instruments frozen in stone."
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}
      >
        <button
          type="button"
          onClick={() => { setActiveTab('demo'); stopCamera(); setAnalysisResult(null); }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '8px',
            border: activeTab === 'demo' ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.15)',
            background: activeTab === 'demo' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.4)',
            color: activeTab === 'demo' ? '#fef08a' : '#a8a29e',
            cursor: 'pointer'
          }}
        >
          🏛️ Try Demo Carvings (Offline)
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('upload'); stopCamera(); setAnalysisResult(null); }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '8px',
            border: activeTab === 'upload' ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.15)',
            background: activeTab === 'upload' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.4)',
            color: activeTab === 'upload' ? '#fef08a' : '#a8a29e',
            cursor: 'pointer'
          }}
        >
          📤 Upload Carving Photo
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('camera'); startCamera(); setAnalysisResult(null); }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '8px',
            border: activeTab === 'camera' ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.15)',
            background: activeTab === 'camera' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.4)',
            color: activeTab === 'camera' ? '#fef08a' : '#a8a29e',
            cursor: 'pointer'
          }}
        >
          📷 Scan with Camera
        </button>
      </div>

      {/* Main Viewport Content */}
      {!analysisResult && !isScanning && (
        <div>
          {/* 1. Demo Carvings Gallery */}
          {activeTab === 'demo' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#a8a29e', marginBottom: '14px' }}>
                Select an ancient stone carving relief to detect its organological classification and play its acoustic reconstruction:
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px'
                }}
              >
                {DEMO_CARVINGS.map(demo => (
                  <div
                    key={demo.id}
                    onClick={() => handleSelectDemoCarving(demo)}
                    role="button"
                    tabIndex={0}
                    style={{
                      background: 'rgba(28, 22, 16, 0.7)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '10px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#eab308';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ width: '80px', height: '80px', marginBottom: '8px' }}>
                      <img
                        src={demo.imageSrc}
                        alt={demo.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#fef08a' }}>
                      {demo.titleHi}
                    </span>
                    <span style={{ fontSize: '11px', color: '#d4af37', marginTop: '2px' }}>
                      {demo.era}
                    </span>
                    <span style={{ fontSize: '10px', color: '#a8a29e', marginTop: '4px' }}>
                      {demo.temple}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. File Upload Box */}
          {activeTab === 'upload' && (
            <div
              style={{
                border: '2px dashed rgba(212, 175, 55, 0.4)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageBlob(file);
                }}
              />
              <span style={{ fontSize: '42px', display: 'block', marginBottom: '10px' }}>📁</span>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fef08a', margin: '0 0 6px 0' }}>
                Click or drag & drop a photo of a temple carving / sculpture
              </p>
              <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>
                Supports JPG, PNG, WEBP. Privacy: EXIF/GPS automatically stripped in browser.
              </p>
            </div>
          )}

          {/* 3. Live Camera Viewfinder */}
          {activeTab === 'camera' && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '440px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {cameraError ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#f87171' }}>
                  <p style={{ fontWeight: 700 }}>⚠️ {cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    style={{
                      background: '#eab308',
                      color: '#000',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Switch to Photo Upload
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                  />

                  {/* Temple Reticle */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '40px',
                      border: '2px solid rgba(234, 179, 8, 0.65)',
                      borderRadius: '8px',
                      boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#fef08a', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                      Align musical instrument in frame
                    </span>
                  </div>

                  {/* Capture Button */}
                  <div style={{ position: 'absolute', bottom: '16px' }}>
                    <button
                      type="button"
                      onClick={handleCaptureCamera}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#eab308',
                        border: '4px solid #fff',
                        boxShadow: '0 0 18px rgba(0,0,0,0.8)',
                        cursor: 'pointer'
                      }}
                      aria-label="Capture Carving Frame"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scanning Animation Sweep */}
      {isScanning && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#0c0a09',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {previewImage && (
            <img
              src={previewImage}
              alt="Carving to analyze"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.35
              }}
            />
          )}

          {/* Golden Scanning Sweep Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(to right, transparent, #eab308, #fef08a, #eab308, transparent)',
              boxShadow: '0 0 20px #eab308, 0 0 40px #f59e0b',
              animation: 'nvLaserScan 1.6s ease-in-out infinite'
            }}
          />

          <div
            style={{
              zIndex: 5,
              background: 'rgba(0,0,0,0.75)',
              padding: '16px 24px',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fef08a' }}>
              {scanProgressText}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a8a29e' }}>
              Consulting Natyashastra iconographic whitelist...
            </p>
          </div>

          <style>{`
            @keyframes nvLaserScan {
              0% { top: 0%; }
              50% { top: 96%; }
              100% { top: 0%; }
            }
          `}</style>
        </div>
      )}

      {/* Analysis Confirmation & Candidate Picker */}
      {analysisResult && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            {/* Scanned Image Preview with Bounding Box Overlay */}
            <div
              style={{
                position: 'relative',
                height: '280px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#000',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              <img
                src={previewImage}
                alt="Carving with detection"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {/* Bounding Box Glow */}
              {analysisResult.candidates?.[0]?.box && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${analysisResult.candidates[0].box.x * 100}%`,
                    top: `${analysisResult.candidates[0].box.y * 100}%`,
                    width: `${analysisResult.candidates[0].box.w * 100}%`,
                    height: `${analysisResult.candidates[0].box.h * 100}%`,
                    border: '2px solid #eab308',
                    boxShadow: '0 0 16px rgba(234, 179, 8, 0.8), inset 0 0 12px rgba(234, 179, 8, 0.3)',
                    borderRadius: '6px',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>

            {/* Candidate Options & Confidence */}
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6ee7b7',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  marginBottom: '10px'
                }}
              >
                ✓ Iconographic Match Detected
              </span>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#fef08a' }}>
                Select Identified Instrument:
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysisResult.candidates.map((cand, idx) => {
                  const inst = instruments.find(i => i.id === cand.instrumentId) || { names: { en: cand.instrumentId, hi: '' } };
                  const isSelected = selectedCandidateId === cand.instrumentId;
                  const pct = Math.round(cand.confidence * 100);

                  return (
                    <div
                      key={cand.instrumentId}
                      onClick={() => setSelectedCandidateId(cand.instrumentId)}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(234, 179, 8, 0.2)' : 'rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#fef08a' : '#fef3c7' }}>
                          {inst.names.hi} • {inst.names.en}
                        </span>
                        <div style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>
                          {cand.rationale}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: pct >= 80 ? '#4ade80' : pct >= 60 ? '#facc15' : '#9ca3af',
                          background: 'rgba(0,0,0,0.5)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => { setAnalysisResult(null); setPreviewImage(null); }}
              style={{
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                color: '#a8a29e',
                cursor: 'pointer'
              }}
            >
              Scan Another
            </button>

            <button
              type="button"
              onClick={handleConfirmAndPlay}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 800,
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                color: '#1c1917',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)'
              }}
            >
              Lift Out & Enter Playing Studio ➔
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#78716c'
        }}
      >
        <span>🔒</span>
        <span>
          <strong>Privacy Safeguard:</strong> All photos are processed in temporary browser memory.
          EXIF geolocation and camera metadata are stripped immediately via clean Canvas redraw. No personal photos are stored.
        </span>
      </div>
    </div>
  );
}
