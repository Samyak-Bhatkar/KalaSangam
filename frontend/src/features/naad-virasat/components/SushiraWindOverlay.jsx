import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * SushiraWindOverlay - Aerophone Controller
 * Venu Flute: Press-and-hold with continuous slide along swara ribbon (smooth gamaka portamento).
 * Shankha: Sacred swelling blow with sacred spiral visual feedback.
 */
export default function SushiraWindOverlay({
  instrument,
  currentScale,
  baseSa,
  audioEngine,
  activeSwara,
  onSwaraTriggered
}) {
  const isShankha = instrument.id === 'shankha';
  const ribbonRef = useRef(null);
  const isBlowingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteName, setCurrentNoteName] = useState(null);

  const swaras = currentScale?.swaras || [];

  // Start blowing wind instrument
  const startBlow = useCallback((freq, name = '') => {
    isBlowingRef.current = true;
    setIsPlaying(true);
    setCurrentNoteName(name);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(isShankha ? 40 : 18); } catch {}
    }

    audioEngine.triggerInstrument(instrument, {
      frequency: freq,
      velocity: 0.85
    });

    if (onSwaraTriggered && name) {
      onSwaraTriggered(name);
    }
  }, [audioEngine, instrument, isShankha, onSwaraTriggered]);

  // Slide pitch while blowing
  const slideBlow = useCallback((freq, name = '') => {
    if (!isBlowingRef.current) return;
    audioEngine.slideWind(freq);
    setCurrentNoteName(name);
    if (onSwaraTriggered && name) {
      onSwaraTriggered(name);
    }
  }, [audioEngine, onSwaraTriggered]);

  // Stop blowing
  const stopBlow = useCallback(() => {
    if (!isBlowingRef.current) return;
    isBlowingRef.current = false;
    setIsPlaying(false);
    audioEngine.stopWind();
  }, [audioEngine]);

  // Ribbon Pointer interactions for Venu
  const handleRibbonPointerDown = (e) => {
    const rect = ribbonRef.current?.getBoundingClientRect();
    if (!rect || swaras.length === 0) return;
    const clickY = e.clientY - rect.top;
    const progress = Math.max(0, Math.min(1, 1 - (clickY / rect.height)));
    const swaraIdx = Math.min(swaras.length - 1, Math.floor(progress * swaras.length));
    const swara = swaras[swaraIdx];
    startBlow(baseSa * swara.ratio, swara.name);
  };

  const handleRibbonPointerMove = (e) => {
    if (!isBlowingRef.current) return;
    const rect = ribbonRef.current?.getBoundingClientRect();
    if (!rect || swaras.length === 0) return;
    const clickY = e.clientY - rect.top;
    const progress = Math.max(0, Math.min(1, 1 - (clickY / rect.height)));

    // Continuous frequency interpolation
    const swaraIdx = Math.min(swaras.length - 1, Math.floor(progress * swaras.length));
    const swara = swaras[swaraIdx];
    const interpolatedRatio = 1.0 + progress;
    slideBlow(baseSa * interpolatedRatio, swara.name);
  };

  // Keyboard controls
  useEffect(() => {
    const keyMap = ['a', 's', 'd', 'f', 'g', 'h'];
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (isShankha && e.code === 'Space' && !isBlowingRef.current) {
        e.preventDefault();
        startBlow(220.0, 'Shankha');
      } else {
        const idx = keyMap.indexOf(e.key.toLowerCase());
        if (idx !== -1 && idx < swaras.length && !isBlowingRef.current) {
          e.preventDefault();
          const swara = swaras[idx];
          startBlow(baseSa * swara.ratio, swara.name);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (isShankha && e.code === 'Space') {
        stopBlow();
      } else {
        const idx = keyMap.indexOf(e.key.toLowerCase());
        if (idx !== -1) {
          stopBlow();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [baseSa, isShankha, startBlow, stopBlow, swaras]);

  if (isShankha) {
    return (
      <div
        className="nv-shankha-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          userSelect: 'none',
          zIndex: 10
        }}
      >
        <button
          type="button"
          onPointerDown={() => startBlow(220.0, 'Shankha')}
          onPointerUp={stopBlow}
          onPointerLeave={stopBlow}
          aria-label="Blow Sacred Shankha (Press and Hold or Press Space)"
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: isPlaying
              ? 'radial-gradient(circle, #fde047 0%, #ca8a04 50%, #1c1917 100%)'
              : 'radial-gradient(circle, #44403c 0%, #1c1917 80%)',
            border: isPlaying ? '3px solid #fef08a' : '2px solid rgba(212, 175, 55, 0.4)',
            boxShadow: isPlaying
              ? '0 0 40px rgba(253, 224, 71, 0.8), inset 0 0 20px rgba(254, 240, 138, 0.8)'
              : '0 8px 24px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transform: isPlaying ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ fontSize: '32px' }}>🐚</span>
          <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '4px', color: '#fef3c7' }}>
            {isPlaying ? 'नाद प्रस्फुटन...' : 'Press & Hold'}
          </span>
          <span style={{ fontSize: '10px', color: '#d4af37' }}>
            Hold Spacebar
          </span>
        </button>
      </div>
    );
  }

  // Venu Flute Vertical Ribbon
  return (
    <div
      ref={ribbonRef}
      className="nv-flute-ribbon"
      onPointerDown={handleRibbonPointerDown}
      onPointerMove={handleRibbonPointerMove}
      onPointerUp={stopBlow}
      onPointerLeave={stopBlow}
      style={{
        position: 'absolute',
        top: '16px',
        bottom: '16px',
        right: '24px',
        width: '64px',
        background: 'rgba(25, 20, 15, 0.85)',
        border: '2px solid rgba(212, 175, 55, 0.5)',
        borderRadius: '32px',
        boxShadow: isPlaying ? '0 0 25px rgba(234, 179, 8, 0.6)' : '0 6px 18px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 0',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'ns-resize',
        zIndex: 10
      }}
    >
      {swaras.map((swara, idx) => {
        const isSwaraActive = isPlaying && currentNoteName === swara.name;
        const keyHint = ['A', 'S', 'D', 'F', 'G', 'H'][idx];

        return (
          <div
            key={swara.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Flute Finger Hole */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isSwaraActive
                  ? 'radial-gradient(circle, #fef08a 0%, #eab308 60%)'
                  : 'radial-gradient(circle, #292524 0%, #0c0a09 100%)',
                border: isSwaraActive ? '2px solid #fff' : '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: isSwaraActive ? '0 0 14px #eab308' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: isSwaraActive ? '#1c1917' : '#d4af37'
              }}
            >
              {swara.devanagari.charAt(0)}
            </div>
            <span style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
              {keyHint}
            </span>
          </div>
        );
      })}
    </div>
  );
}
