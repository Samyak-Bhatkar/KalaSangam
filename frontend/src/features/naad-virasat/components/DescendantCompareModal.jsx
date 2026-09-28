import React, { useState } from 'react';

/**
 * DescendantCompareModal - A/B Evolution Comparison with Era Timeline
 * Compares ancient stone carving instrument with its modern surviving descendant.
 */
export default function DescendantCompareModal({
  isOpen,
  onClose,
  instrument,
  audioEngine
}) {
  const [playingAOrB, setPlayingAOrB] = useState(null);

  if (!isOpen || !instrument) return null;

  // A/B Audio triggers
  const handlePlayAncient = () => {
    setPlayingAOrB('ancient');
    audioEngine.triggerInstrument(instrument, {
      frequency: 261.63,
      velocity: 0.85
    });
    setTimeout(() => setPlayingAOrB(null), 1200);
  };

  const handlePlayModern = () => {
    setPlayingAOrB('modern');
    // Modern descendant: brighter, higher damping, contemporary tone
    audioEngine.triggerInstrument(instrument, {
      frequency: 261.63,
      velocity: 0.95,
      pluckPoint: 0.12 // struck closer to bridge for brighter modern attack
    });
    setTimeout(() => setPlayingAOrB(null), 1200);
  };

  return (
    <div
      className="nv-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="nv-compare-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '740px',
          background: 'linear-gradient(150deg, #1c1610 0%, #0f0c08 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
          padding: '24px',
          color: '#fef3c7',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
              ⚖️ कालक्रम व आधुनिक रूप (Evolutionary Lineage)
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#d4af37' }}>
              Tracing the morphological evolution across 1,000 years of living tradition
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}
        >
          {/* Side A: Ancient Carved Form */}
          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#eab308',
                  background: 'rgba(234, 179, 8, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                ANCIENT SCULPTURAL FORM (प्राचीन रूप)
              </span>
              <h3 style={{ margin: '10px 0 4px 0', fontSize: '16px', color: '#fef08a' }}>
                {instrument.names.hi}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#a8a29e' }}>
                {instrument.era}
              </p>
              <p style={{ fontSize: '12px', color: '#d6d3d1', marginTop: '10px', lineHeight: '1.5' }}>
                {instrument.carvingContext}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayAncient}
              style={{
                marginTop: '14px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '8px',
                border: playingAOrB === 'ancient' ? '2px solid #eab308' : '1px solid rgba(212, 175, 55, 0.4)',
                background: playingAOrB === 'ancient' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(0,0,0,0.4)',
                color: '#fef08a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{playingAOrB === 'ancient' ? '🔊 Playing...' : '▶️ Play Ancient Approximation'}</span>
            </button>
          </div>

          {/* Side B: Modern Descendant */}
          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                MODERN DESCENDANT (समकालीन रूप)
              </span>
              <h3 style={{ margin: '10px 0 4px 0', fontSize: '16px', color: '#7dd3fc' }}>
                {instrument.modernDescendantName}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#a8a29e' }}>
                Contemporary Concert Stage (वर्तमान शास्त्रीय मंच)
              </p>
              <p style={{ fontSize: '12px', color: '#d6d3d1', marginTop: '10px', lineHeight: '1.5' }}>
                {instrument.comparisonRationale}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayModern}
              style={{
                marginTop: '14px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '8px',
                border: playingAOrB === 'modern' ? '2px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.4)',
                background: playingAOrB === 'modern' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(0,0,0,0.4)',
                color: '#7dd3fc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{playingAOrB === 'modern' ? '🔊 Playing...' : '▶️ Play Modern Descendant'}</span>
            </button>
          </div>
        </div>

        {/* 3-Step Era Progression Timeline */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            padding: '14px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#d4af37', marginBottom: '10px' }}>
            Historical Milestones (विकास यात्रा):
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            {/* Step 1 */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308', margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fef08a' }}>Temple Relief</div>
              <div style={{ fontSize: '10px', color: '#a8a29e' }}>Single danda tube</div>
            </div>

            <div style={{ flex: 1, height: '2px', background: 'rgba(212, 175, 55, 0.4)', margin: '0 8px' }} />

            {/* Step 2 */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fcd34d' }}>Medieval Treatise</div>
              <div style={{ fontSize: '10px', color: '#a8a29e' }}>Fret stabilization</div>
            </div>

            <div style={{ flex: 1, height: '2px', background: 'rgba(212, 175, 55, 0.4)', margin: '0 8px' }} />

            {/* Step 3 */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8', margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7dd3fc' }}>Modern Concert</div>
              <div style={{ fontSize: '10px', color: '#a8a29e' }}>Fixed 24 frets & drone</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
