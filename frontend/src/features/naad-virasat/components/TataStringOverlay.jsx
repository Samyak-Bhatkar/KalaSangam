import React, { useState, useRef, useEffect, useCallback } from 'react';
import { checkSegmentIntersection } from '../audio/AudioTester.js';

/**
 * TataStringOverlay - Interactive Plucked String Surface
 * Supports tap-to-pluck, swipe-to-strum (segment intersection),
 * damped vibration physics, multi-touch, and keyboard bindings.
 */
export default function TataStringOverlay({
  instrument,
  currentScale,
  baseSa,
  audioEngine,
  activeSwara,
  onSwaraTriggered
}) {
  const containerRef = useRef(null);
  const pointerPosRef = useRef(null);
  const [vibratingStrings, setVibratingStrings] = useState({});

  const swaras = currentScale?.swaras || [];
  const numStrings = Math.min(swaras.length, instrument.layout?.numStrings || 5);
  const displayedSwaras = swaras.slice(0, numStrings);

  // Trigger vibration animation on string
  const triggerStringVibration = useCallback((index, freq, velocity = 0.8) => {
    // Feature detect haptics (Android Chrome / supported browsers)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(Math.min(25, Math.round(velocity * 20)));
      } catch {}
    }

    // Audio trigger
    audioEngine.triggerInstrument(instrument, {
      frequency: freq,
      velocity,
      pluckPoint: 0.22
    });

    if (onSwaraTriggered) {
      onSwaraTriggered(displayedSwaras[index]?.name);
    }

    setVibratingStrings(prev => ({
      ...prev,
      [index]: { amplitude: velocity * 14, timestamp: Date.now() }
    }));

    setTimeout(() => {
      setVibratingStrings(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }, 450);
  }, [audioEngine, displayedSwaras, instrument, onSwaraTriggered]);

  // Pointer move / strum detection
  const handlePointerDown = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerPosRef.current = { x, y, time: performance.now() };
  };

  const handlePointerMove = (e) => {
    if (!pointerPosRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;
    const currTime = performance.now();

    const dt = Math.max(1, currTime - pointerPosRef.current.time);
    const dist = Math.hypot(currX - pointerPosRef.current.x, currY - pointerPosRef.current.y);
    const speed = dist / dt; // pixels per ms
    const velocity = Math.min(1.0, Math.max(0.3, speed * 0.8));

    const p1 = { x: pointerPosRef.current.x, y: pointerPosRef.current.y };
    const p2 = { x: currX, y: currY };

    // Check intersection with each vertical string segment
    displayedSwaras.forEach((swara, idx) => {
      const stringX = (rect.width / (numStrings + 1)) * (idx + 1);
      const q1 = { x: stringX, y: 0 };
      const q2 = { x: stringX, y: rect.height };

      if (checkSegmentIntersection(p1, p2, q1, q2)) {
        const freq = baseSa * swara.ratio;
        triggerStringVibration(idx, freq, velocity);
      }
    });

    pointerPosRef.current = { x: currX, y: currY, time: currTime };
  };

  const handlePointerUp = () => {
    pointerPosRef.current = null;
  };

  // Keyboard shortcut support (Home-row: A, S, D, F, G, H, J)
  useEffect(() => {
    const keyMap = ['a', 's', 'd', 'f', 'g', 'h', 'j'];
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const keyIdx = keyMap.indexOf(e.key.toLowerCase());
      if (keyIdx !== -1 && keyIdx < displayedSwaras.length) {
        e.preventDefault();
        const swara = displayedSwaras[keyIdx];
        triggerStringVibration(keyIdx, baseSa * swara.ratio, 0.85);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedSwaras, baseSa, triggerStringVibration]);

  return (
    <div
      ref={containerRef}
      className="nv-string-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'crosshair',
        zIndex: 10
      }}
    >
      {displayedSwaras.map((swara, idx) => {
        const vib = vibratingStrings[idx];
        const isCurrentlyActive = activeSwara === swara.name || !!vib;
        const keyHint = ['A', 'S', 'D', 'F', 'G', 'H', 'J'][idx];

        return (
          <div
            key={swara.name}
            className="nv-string-lane"
            onClick={(e) => {
              e.stopPropagation();
              triggerStringVibration(idx, baseSa * swara.ratio, 0.85);
            }}
            role="button"
            tabIndex={0}
            aria-label={`String ${idx + 1}: ${swara.name} (${swara.devanagari}), Key ${keyHint}`}
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              cursor: 'pointer'
            }}
          >
            {/* Top Swara Label */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isCurrentlyActive ? '#fef08a' : '#d4af37',
                background: 'rgba(20, 15, 10, 0.75)',
                border: isCurrentlyActive ? '1px solid #eab308' : '1px solid rgba(212, 175, 55, 0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.15s ease',
                transform: isCurrentlyActive ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {swara.devanagari}
            </div>

            {/* Glowing Physical String */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: isCurrentlyActive ? '3px' : '2px',
                background: isCurrentlyActive
                  ? 'linear-gradient(to bottom, #fef08a, #f59e0b, #fef08a)'
                  : 'linear-gradient(to bottom, rgba(212,175,55,0.4), rgba(212,175,55,0.85), rgba(212,175,55,0.4))',
                boxShadow: isCurrentlyActive
                  ? '0 0 12px #eab308, 0 0 24px rgba(245, 158, 11, 0.8)'
                  : '0 0 4px rgba(212, 175, 55, 0.3)',
                transform: `translateX(-50%) ${vib ? `translateX(${Math.sin((Date.now() - vib.timestamp) * 0.1) * vib.amplitude}px)` : ''}`,
                transition: vib ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
                pointerEvents: 'none'
              }}
            />

            {/* Bottom Western + Key Label */}
            <div
              style={{
                fontSize: '10px',
                color: '#fef3c7',
                background: 'rgba(15, 10, 5, 0.8)',
                padding: '2px 5px',
                borderRadius: '3px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}
            >
              <span>{swara.name}</span>
              <kbd style={{
                background: '#374151',
                padding: '1px 3px',
                borderRadius: '2px',
                fontSize: '9px',
                color: '#9ca3af'
              }}>{keyHint}</kbd>
            </div>
          </div>
        );
      })}
    </div>
  );
}
