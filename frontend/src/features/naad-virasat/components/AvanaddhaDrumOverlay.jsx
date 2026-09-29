import React, { useState, useEffect, useCallback } from 'react';

/**
 * AvanaddhaDrumOverlay - Touch/Velocity-Sensitive Drum Surface
 * Derives timbre (center fundamental vs rim overtone) from touch distance to pad center.
 * Renders authentic classical bols/solkattu syllables in Devanagari and Roman.
 */
export default function AvanaddhaDrumOverlay({
  instrument,
  audioEngine,
  onBolTriggered
}) {
  const [activePad, setActivePad] = useState(null);
  const [shockwaves, setShockwaves] = useState([]);

  const pads = instrument.layout?.pads || [
    { id: 'tha', label: 'Tha', devanagari: 'था', type: 'bass', sublabel: 'Left Bass' },
    { id: 'dheem', label: 'Dheem', devanagari: 'धीम्', type: 'tonal', sublabel: 'Center Black Paste' },
    { id: 'nam', label: 'Nam', devanagari: 'नम्', type: 'rim', sublabel: 'Edge Rim' }
  ];

  const triggerPad = useCallback((pad, clickEvent = null) => {
    let velocity = 0.85;
    let strokeType = pad.id;

    if (clickEvent) {
      const rect = clickEvent.currentTarget.getBoundingClientRect();
      const clickX = clickEvent.clientX - rect.left;
      const clickY = clickEvent.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distFromCenter = Math.hypot(clickX - centerX, clickY - centerY);
      const maxRadius = Math.min(rect.width, rect.height) / 2;
      const normalizedDist = Math.min(1.0, distFromCenter / maxRadius);

      // Center vs Rim timbre shift
      if (normalizedDist > 0.65 && pad.type !== 'bass') {
        strokeType = 'rim';
      }

      // Dynamic velocity
      velocity = Math.max(0.4, 1.0 - normalizedDist * 0.3);

      // Create shockwave visual
      const waveId = Date.now() + Math.random();
      setShockwaves(prev => [...prev, { id: waveId, x: clickX, y: clickY, padId: pad.id }]);
      setTimeout(() => {
        setShockwaves(prev => prev.filter(w => w.id !== waveId));
      }, 500);
    }

    // Feature detect haptic vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (pad.type === 'bass') {
          navigator.vibrate([25, 20, 30]);
        } else {
          navigator.vibrate(15);
        }
      } catch {}
    }

    // Trigger audio DSP
    if (audioEngine) {
      audioEngine.resume();
      audioEngine.triggerInstrument(instrument, {
        strokeType,
        velocity
      });
    }

    setActivePad(pad.id);
    if (onBolTriggered) {
      onBolTriggered(pad.label, pad.devanagari);
    }

    setTimeout(() => {
      setActivePad(prev => (prev === pad.id ? null : prev));
    }, 200);
  }, [audioEngine, instrument, onBolTriggered]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'z' || key === '1') {
        if (pads[0]) triggerPad(pads[0]);
      } else if (key === 'x' || key === '2') {
        if (pads[1]) triggerPad(pads[1]);
      } else if (key === 'c' || key === '3') {
        if (pads[2]) triggerPad(pads[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pads, triggerPad]);

  return (
    <div
      className="nv-drum-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '16px',
        gap: '12px',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 10
      }}
    >
      {pads.map((pad, idx) => {
        const isActive = activePad === pad.id;
        const keyHint = ['Z / 1', 'X / 2', 'C / 3'][idx];

        return (
          <div
            key={pad.id}
            className="nv-drum-pad"
            onClick={(e) => triggerPad(pad, e)}
            role="button"
            tabIndex={0}
            aria-label={`Percussion Pad ${idx + 1}: ${pad.label} (${pad.devanagari}), Key ${keyHint}`}
            style={{
              position: 'relative',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: isActive
                ? 'radial-gradient(circle, rgba(234, 179, 8, 0.45) 0%, rgba(20, 15, 10, 0.95) 75%)'
                : 'radial-gradient(circle, rgba(40, 30, 20, 0.85) 0%, rgba(15, 10, 5, 0.95) 80%)',
              border: isActive
                ? '3px solid #eab308'
                : '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: isActive
                ? '0 0 24px rgba(234, 179, 8, 0.8), inset 0 0 16px rgba(234, 179, 8, 0.4)'
                : '0 4px 14px rgba(0, 0, 0, 0.7), inset 0 0 8px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: isActive ? 'scale(0.96)' : 'scale(1)',
              transition: 'transform 0.08s ease, border-color 0.1s ease',
              overflow: 'hidden'
            }}
          >
            {/* Concentric Karanai / Tuning Ring */}
            <div
              style={{
                position: 'absolute',
                width: '55%',
                height: '55%',
                borderRadius: '50%',
                border: '1px dashed rgba(212, 175, 55, 0.35)',
                pointerEvents: 'none'
              }}
            />

            {/* Shockwaves */}
            {shockwaves.filter(w => w.padId === pad.id).map(w => (
              <span
                key={w.id}
                style={{
                  position: 'absolute',
                  left: w.x,
                  top: w.y,
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '2px solid #fef08a',
                  transform: 'translate(-50%, -50%)',
                  animation: 'nvShockwave 0.45s ease-out forwards',
                  pointerEvents: 'none'
                }}
              />
            ))}

            {/* Devanagari Bol */}
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: isActive ? '#fef08a' : '#fef3c7',
                textShadow: '0 2px 6px rgba(0,0,0,0.8)'
              }}
            >
              {pad.devanagari}
            </span>

            {/* Roman Label */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#d4af37',
                letterSpacing: '0.05em'
              }}
            >
              {pad.label}
            </span>

            {/* Key hint */}
            <span
              style={{
                marginTop: '4px',
                fontSize: '9px',
                color: '#9ca3af',
                background: 'rgba(0,0,0,0.5)',
                padding: '1px 4px',
                borderRadius: '3px'
              }}
            >
              {keyHint}
            </span>
          </div>
        );
      })}

      <style>{`
        @keyframes nvShockwave {
          0% { width: 0px; height: 0px; opacity: 1; }
          100% { width: 140px; height: 140px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
