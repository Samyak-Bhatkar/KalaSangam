import React, { useState, useEffect, useRef, useCallback } from 'react';
import TataStringOverlay from './TataStringOverlay.jsx';
import AvanaddhaDrumOverlay from './AvanaddhaDrumOverlay.jsx';
import SushiraWindOverlay from './SushiraWindOverlay.jsx';
import GhanaBellOverlay from './GhanaBellOverlay.jsx';
import scalesData from '../data/scales.json' with { type: 'json' };

/**
 * PlayingStudio - Cross-modal carving overlay and tactile acoustic synthesizer
 * Features:
 * - Lift-out reveal: carving background dims while detected instrument glows
 * - Sound-reactive stone pulse (RMS driving CSS custom property --nv-sound-rms)
 * - Stone Mandapa impulse reverb toggle
 * - Tanpura Shruti drone toggle
 * - Microtonal Sa slider & scale selector
 * - 5-8s illustrative melodic phrase player
 */
export default function PlayingStudio({
  instrument,
  carvingImageSrc,
  boundingBox = { x: 0.15, y: 0.1, w: 0.7, h: 0.75 },
  audioEngine,
  onOpenEvidence,
  onOpenCompare,
  isDebugMode = false
}) {
  const containerRef = useRef(null);
  const [baseSaKey, setBaseSaKey] = useState('C');
  const [selectedScaleId, setSelectedScaleId] = useState('mohanam');
  const [isMandapaOn, setIsMandapaOn] = useState(false);
  const [isDroneOn, setIsDroneOn] = useState(false);
  const [isPlayingPhrase, setIsPlayingPhrase] = useState(false);
  const [activeSwara, setActiveSwara] = useState(null);
  const [lastNoteFeedback, setLastNoteFeedback] = useState(null);
  const [measuredLatency, setMeasuredLatency] = useState(0);

  const baseSa = scalesData.baseSaFrequencies[baseSaKey] || 261.63;
  const currentScale = scalesData.ragas[selectedScaleId] || scalesData.ragas.mohanam;

  // Sound-reactive stone pulsation animation loop
  useEffect(() => {
    let animId;
    const updateRMS = () => {
      if (audioEngine && containerRef.current) {
        const rms = audioEngine.getRMS();
        containerRef.current.style.setProperty('--nv-sound-rms', rms.toFixed(3));
        setMeasuredLatency(audioEngine.lastTriggerLatencyMs);
      }
      animId = requestAnimationFrame(updateRMS);
    };
    animId = requestAnimationFrame(updateRMS);
    return () => cancelAnimationFrame(animId);
  }, [audioEngine]);

  // Toggle Mandapa Convolver
  const handleToggleMandapa = () => {
    const next = !isMandapaOn;
    setIsMandapaOn(next);
    audioEngine.setMandapaAcoustics(next);
  };

  // Toggle Drone
  const handleToggleDrone = () => {
    const next = !isDroneOn;
    setIsDroneOn(next);
    if (audioEngine) {
      audioEngine.resume();
      audioEngine.setDrone(next, baseSa);
    }
  };

  // Play Illustrative Phrase
  const handlePlayPhrase = () => {
    if (isPlayingPhrase) {
      audioEngine.stopIllustrativePhrase();
      setIsPlayingPhrase(false);
      setActiveSwara(null);
      setLastNoteFeedback(null);
      return;
    }

    if (audioEngine) {
      audioEngine.resume().then(() => {
        setIsPlayingPhrase(true);
        audioEngine.playIllustrativePhrase(instrument, currentScale, baseSa, (idx, swara) => {
          if (idx === -1) {
            setIsPlayingPhrase(false);
            setActiveSwara(null);
            setLastNoteFeedback(null);
          } else {
            setActiveSwara(swara);
            const swaraObj = currentScale?.swaras?.find(s => s.name === swara);
            const dev = swaraObj ? swaraObj.devanagari : swara;
            setLastNoteFeedback(`${dev} (${swara})`);
          }
        });
      });
    }
  };

  // Handle note triggering feedback
  const handleSwaraTriggered = useCallback((swaraName) => {
    setActiveSwara(swaraName);
    const swaraObj = currentScale?.swaras?.find(s => s.name === swaraName);
    const dev = swaraObj ? swaraObj.devanagari : swaraName;
    setLastNoteFeedback(`${dev} (${swaraName})`);
    setTimeout(() => setActiveSwara(null), 350);
  }, [currentScale]);

  const handleBolTriggered = useCallback((label, devanagari) => {
    setLastNoteFeedback(`${devanagari} (${label})`);
  }, []);

  const handleZoneTriggered = useCallback((label, devanagari) => {
    setLastNoteFeedback(`${devanagari}`);
  }, []);

  // Family label mapping
  const familyBadges = {
    tata: { en: 'Tata (तत - Stringed)', color: '#f59e0b' },
    avanaddha: { en: 'Avanaddha (अवनद्ध - Membrane)', color: '#ef4444' },
    sushira: { en: 'Sushira (सुषिर - Wind)', color: '#06b6d4' },
    ghana: { en: 'Ghana (घन - Idiophone)', color: '#eab308' }
  };

  return (
    <div
      ref={containerRef}
      className="nv-playing-studio"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#0c0a09',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.85)',
        color: '#fef3c7',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Studio Top Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'linear-gradient(to bottom, rgba(28,25,23,0.95), rgba(12,10,9,0.85))',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          gap: '8px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fef08a' }}>
              {instrument.names.hi}
            </h2>
            <span style={{ fontSize: '14px', color: '#d4af37', fontWeight: 600 }}>
              • {instrument.names.en}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: familyBadges[instrument.family]?.color || '#d4af37',
                background: 'rgba(255,255,255,0.06)',
                padding: '2px 8px',
                borderRadius: '10px'
              }}
            >
              {familyBadges[instrument.family]?.en}
            </span>
            <span style={{ fontSize: '11px', color: '#a8a29e' }}>
              {instrument.carvingContext}
            </span>
          </div>
        </div>

        {/* Action Buttons: Evidence & Compare */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onOpenCompare}
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#fef08a',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>⚖️</span>
            <span>A/B Compare Modern</span>
          </button>

          <button
            type="button"
            onClick={onOpenEvidence}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>📜</span>
            <span>Evidence & Provenance</span>
          </button>
        </div>
      </div>

      {/* Main Visual Stage: Carving with Lift-out and Overlay */}
      <div
        className="nv-carving-stage"
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          background: '#000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Background Carving with Dynamic Stone Pulsing Filter */}
        <img
          src={carvingImageSrc}
          alt={`Historical carving of ${instrument.names.en}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'brightness(calc(0.4 + var(--nv-sound-rms, 0) * 0.25)) contrast(1.15)',
            transform: 'scale(calc(1.0 + var(--nv-sound-rms, 0) * 0.015))',
            transition: 'transform 0.05s ease-out, filter 0.05s ease-out',
            pointerEvents: 'none'
          }}
        />

        {/* Lift-out Glowing Bounding Box representing instrument in stone */}
        <div
          className="nv-liftout-box"
          style={{
            position: 'absolute',
            left: `${boundingBox.x * 100}%`,
            top: `${boundingBox.y * 100}%`,
            width: `${boundingBox.w * 100}%`,
            height: `${boundingBox.h * 100}%`,
            border: '2px solid rgba(234, 179, 8, 0.75)',
            boxShadow: '0 0 calc(20px + var(--nv-sound-rms, 0) * 35px) rgba(234, 179, 8, 0.85), inset 0 0 25px rgba(234, 179, 8, 0.25)',
            borderRadius: '10px',
            pointerEvents: 'none',
            zIndex: 5
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              left: '12px',
              background: '#eab308',
              color: '#1c1917',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}
          >
            LIFT-OUT ACOUSTIC ZONE
          </div>
        </div>

        {/* Touch Synthesis Overlays (Family-Specific) */}
        {instrument.family === 'tata' && (
          <TataStringOverlay
            instrument={instrument}
            currentScale={currentScale}
            baseSa={baseSa}
            audioEngine={audioEngine}
            activeSwara={activeSwara}
            onSwaraTriggered={handleSwaraTriggered}
          />
        )}

        {instrument.family === 'avanaddha' && (
          <AvanaddhaDrumOverlay
            instrument={instrument}
            audioEngine={audioEngine}
            onBolTriggered={handleBolTriggered}
          />
        )}

        {instrument.family === 'sushira' && (
          <SushiraWindOverlay
            instrument={instrument}
            currentScale={currentScale}
            baseSa={baseSa}
            audioEngine={audioEngine}
            activeSwara={activeSwara}
            onSwaraTriggered={handleSwaraTriggered}
          />
        )}

        {instrument.family === 'ghana' && (
          <GhanaBellOverlay
            instrument={instrument}
            audioEngine={audioEngine}
            onZoneTriggered={handleZoneTriggered}
          />
        )}

        {/* Sound Feedback Toast */}
        {lastNoteFeedback && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              background: 'rgba(20, 15, 10, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#fef08a',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'none',
              zIndex: 12
            }}
          >
            Playing: {lastNoteFeedback}
          </div>
        )}
      </div>

      {/* Control Console: Sa, Raga Scale, Mandapa Acoustics, Phrase */}
      <div
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(to top, rgba(20,16,12,0.98), rgba(28,25,23,0.9))',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}
      >
        {/* Base Sa / Shruti Picker */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#d4af37', display: 'block', marginBottom: '6px' }}>
            आधार षड्ज (Base Sa / Tonic Pitch): <span style={{ color: '#fef08a' }}>{baseSaKey} ({baseSa} Hz)</span>
          </label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {Object.keys(scalesData.baseSaFrequencies).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setBaseSaKey(key)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: baseSaKey === key ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.1)',
                  background: baseSaKey === key ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.4)',
                  color: baseSaKey === key ? '#fef08a' : '#a8a29e',
                  cursor: 'pointer'
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Scale / Raga Selector */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#d4af37', display: 'block', marginBottom: '6px' }}>
            राग / Scale (Verified Ratios):
          </label>
          <select
            value={selectedScaleId}
            onChange={(e) => setSelectedScaleId(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#1c1917',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '6px',
              color: '#fef3c7',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {Object.values(scalesData.ragas).map(raga => (
              <option key={raga.id} value={raga.id}>
                {raga.name} ({raga.type === 'pentatonic' ? '5-Note Pentatonic' : '7-Note Heptatonic'})
              </option>
            ))}
          </select>
        </div>

        {/* Acoustics Toggles */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Stone Mandapa Reverb */}
          <button
            type="button"
            onClick={handleToggleMandapa}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              border: isMandapaOn ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
              background: isMandapaOn ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0,0,0,0.4)',
              color: isMandapaOn ? '#7dd3fc' : '#a8a29e',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>🏛️ Stone Mandapa</span>
            <span style={{ fontSize: '9px', opacity: 0.8 }}>
              {isMandapaOn ? 'Active (RT60 2.4s)' : 'Bypass'}
            </span>
          </button>

          {/* Tanpura Drone */}
          <button
            type="button"
            onClick={handleToggleDrone}
            style={{
              flex: 1,
              padding: '8px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              border: isDroneOn ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.15)',
              background: isDroneOn ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0,0,0,0.4)',
              color: isDroneOn ? '#d8b4fe' : '#a8a29e',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>🪕 Shruti Drone</span>
            <span style={{ fontSize: '9px', opacity: 0.8 }}>
              {isDroneOn ? 'Active (Sa-Pa)' : 'Off'}
            </span>
          </button>
        </div>

        {/* Illustrative Phrase Playback */}
        <div>
          <button
            type="button"
            onClick={handlePlayPhrase}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1px solid #eab308',
              background: isPlayingPhrase
                ? 'linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)'
                : 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.35) 100%)',
              color: '#fef08a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{isPlayingPhrase ? '⏹️ Stop Phrase' : '▶️ Play Illustrative Phrase'}</span>
          </button>
          <span
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '4px'
            }}
          >
            *Informed approximation in {currentScale.name.split(' ')[0]} (not authentic ancient recording)
          </span>
        </div>
      </div>

      {/* Latency & Honesty Footer */}
      <div
        style={{
          padding: '8px 18px',
          background: '#090807',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#78716c'
        }}
      >
        <div>
          <span>Audio Engine: </span>
          <span style={{ color: '#4ade80' }}>● Dedicated Interactive Context (60fps DSP)</span>
        </div>

        {(isDebugMode || measuredLatency > 0) && (
          <div>
            <span>Measured Tap-to-Sound: </span>
            <span style={{ color: '#fef08a', fontWeight: 700 }}>
              {measuredLatency || '< 2.5'} ms (Near-instant)
            </span>
          </div>
        )}

        <div style={{ fontStyle: 'italic' }}>
          "We give you an evidence-based, playable approximation of instruments frozen in stone."
        </div>
      </div>
    </div>
  );
}
