import React, { useState, useEffect, useCallback } from 'react';

/**
 * GhanaBellOverlay - Idiophone Surface (Ghanta Bell & Manjira Cymbals)
 * Tap to strike, strike location shifts partial spectra, natural prolonged ring-out.
 */
export default function GhanaBellOverlay({
  instrument,
  audioEngine,
  onZoneTriggered
}) {
  const isManjira = instrument.id === 'manjira';
  const [activeZone, setActiveZone] = useState(null);
  const [rippleActive, setRippleActive] = useState(false);

  const zones = isManjira
    ? [
        { id: 'clink', label: 'Open Clink', devanagari: 'मुक्त झंकार', isMuffled: false },
        { id: 'mute', label: 'Muffled Stroke', devanagari: 'मुद्रित प्रहार', isMuffled: true }
      ]
    : [
        { id: 'rim', label: 'Edge Strike (High Partial)', devanagari: 'तार घोष', pitchShift: 1.0 },
        { id: 'waist', label: 'Body Strike (Resonant Core)', devanagari: 'मध्य घोष', pitchShift: 0.8 },
        { id: 'lip', label: 'Clapper Swell (Humtone)', devanagari: 'गम्भीर अनुनाद', pitchShift: 0.52 }
      ];

  const handleStrike = useCallback((zone, velocity = 0.85) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(isManjira ? 12 : 35);
      } catch {}
    }

    const baseFreq = instrument.synth?.baseFreq || 587.33;
    const freq = baseFreq * (zone.pitchShift || 1.0);

    if (audioEngine) {
      audioEngine.resume();
      audioEngine.triggerInstrument(instrument, {
        frequency: freq,
        isMuffled: zone.isMuffled || false,
        velocity
      });
    }

    setActiveZone(zone.id);
    setRippleActive(true);
    if (onZoneTriggered) {
      onZoneTriggered(zone.label, zone.devanagari);
    }

    setTimeout(() => setActiveZone(null), 180);
    setTimeout(() => setRippleActive(false), 900);
  }, [audioEngine, instrument, isManjira, onZoneTriggered]);

  // Keyboard bindings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === '1' || key === 'z' || key === 'a') {
        if (zones[0]) handleStrike(zones[0]);
      } else if (key === '2' || key === 'x' || key === 's') {
        if (zones[1]) handleStrike(zones[1]);
      } else if (key === '3' || key === 'c' || key === 'd') {
        if (zones[2]) handleStrike(zones[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStrike, zones]);

  return (
    <div
      className="nv-bell-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: isManjira ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 10
      }}
    >
      {zones.map((zone, idx) => {
        const isActive = activeZone === zone.id;
        const keyHint = ['1 / A', '2 / S', '3 / D'][idx];

        return (
          <button
            key={zone.id}
            type="button"
            onClick={() => handleStrike(zone)}
            className="nv-bell-strike-button"
            aria-label={`${zone.label} (${zone.devanagari}), Key ${keyHint}`}
            style={{
              position: 'relative',
              width: isManjira ? '120px' : '180px',
              height: isManjira ? '120px' : '64px',
              borderRadius: isManjira ? '50%' : '14px',
              background: isActive
                ? 'radial-gradient(circle, #fef08a 0%, #ca8a04 100%)'
                : 'linear-gradient(135deg, rgba(50, 40, 25, 0.9) 0%, rgba(20, 15, 10, 0.95) 100%)',
              border: isActive ? '3px solid #fff' : '2px solid rgba(212, 175, 55, 0.5)',
              boxShadow: isActive
                ? '0 0 35px rgba(254, 240, 138, 0.8), inset 0 0 15px #eab308'
                : '0 6px 18px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: isActive ? 'scale(0.96)' : 'scale(1)',
              transition: 'all 0.1s ease',
              backdropFilter: 'blur(6px)'
            }}
          >
            {/* Golden Acoustic Wave Ring */}
            {rippleActive && isActive && (
              <span
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  borderRadius: isManjira ? '50%' : '20px',
                  border: '2px solid #fde047',
                  animation: 'nvBellRipple 0.8s ease-out forwards',
                  pointerEvents: 'none'
                }}
              />
            )}

            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: isActive ? '#1c1917' : '#fef08a'
              }}
            >
              {zone.devanagari}
            </span>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isActive ? '#451a03' : '#d4af37'
              }}
            >
              {zone.label}
            </span>

            <span
              style={{
                fontSize: '9px',
                color: isActive ? '#78350f' : '#9ca3af',
                marginTop: '2px'
              }}
            >
              Key {keyHint}
            </span>
          </button>
        );
      })}

      <style>{`
        @keyframes nvBellRipple {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
