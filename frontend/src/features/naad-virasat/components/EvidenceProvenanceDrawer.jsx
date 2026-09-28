import React from 'react';

/**
 * EvidenceProvenanceDrawer - Academic Credibility Panel
 * Displays 4-Pillar Transparent Reconstruction:
 * 1. What the carving shows
 * 2. What classical texts say (Title-level citations, marked verified: false)
 * 3. What we approximate (Physical DSP models)
 * 4. Organological status & confidence level
 */
export default function EvidenceProvenanceDrawer({
  isOpen,
  onClose,
  instrument,
  confidence = 0.85,
  carvingContext
}) {
  if (!isOpen || !instrument) return null;

  const statusBadges = {
    living: { text: 'जीवन्त परम्परा (Living Tradition)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
    rare: { text: 'दुर्लभ (Rare Heritage)', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' },
    revived: { text: 'पुनरुत्थित (Revived Reconstruction)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    uncertain: { text: 'अनिश्चित (Uncertain Status)', color: '#a8a29e', bg: 'rgba(168, 162, 158, 0.15)' }
  };

  const evidenceLevelBadges = {
    well_documented: { text: 'सुप्रमाणित (Well Documented)', color: '#4ade80' },
    partial: { text: 'आंशिक प्रमाण (Partial Evidence)', color: '#fb923c' },
    speculative: { text: 'अनुमानित (Speculative Reconstruction)', color: '#f87171' }
  };

  const statusInfo = statusBadges[instrument.status] || statusBadges.uncertain;
  const evidenceInfo = evidenceLevelBadges[instrument.evidenceLevel] || evidenceLevelBadges.partial;

  return (
    <div
      className="nv-drawer-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
    >
      <div
        className="nv-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(180deg, #1c1610 0%, #120e0a 100%)',
          borderLeft: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.9)',
          padding: '24px',
          overflowY: 'auto',
          color: '#fef3c7',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>📜</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
                प्रमाण व प्रामाणिकता (Evidence & Provenance)
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#d4af37' }}>
              {instrument.names.hi} • {instrument.names.en}
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close Evidence Panel"
          >
            ✕
          </button>
        </div>

        {/* Academic Honesty Banner */}
        <div
          style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '12px',
            lineHeight: '1.5',
            color: '#fef08a'
          }}
        >
          <strong>Academic Integrity Notice:</strong> We do not claim to resurrect the exact audio vibrations
          from 900 years ago. We provide an evidence-based, organological physical synthesis approximation
          calibrated against classical temple iconography and musicological texts.
        </div>

        {/* Status & Confidence Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}
          >
            <span style={{ fontSize: '11px', color: '#a8a29e', display: 'block' }}>
              Organological Status
            </span>
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: statusInfo.color,
                background: statusInfo.bg,
                padding: '2px 8px',
                borderRadius: '6px'
              }}
            >
              {statusInfo.text}
            </span>
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '10px 12px'
            }}
          >
            <span style={{ fontSize: '11px', color: '#a8a29e', display: 'block' }}>
              Evidence Level & Match
            </span>
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: evidenceInfo.color
              }}
            >
              {evidenceInfo.text} ({Math.round(confidence * 100)}% match)
            </span>
          </div>
        </div>

        {/* 4 Pillars of Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Pillar 1: Carving */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '14px'
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏛️</span>
              <span>1. What the Carving Shows (शिल्प साक्ष्य)</span>
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#e7e5e4', lineHeight: 1.5 }}>
              {carvingContext || instrument.carvingContext}
            </p>
            <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#d4af37' }}>
              Historical Era: {instrument.era}
            </span>
          </div>

          {/* Pillar 2: Texts */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '14px'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📖</span>
              <span>2. What Classical Treatises Say (शास्त्र ग्रन्थ प्रमाण)</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {instrument.sources.map((src, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #eab308'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fef3c7' }}>
                    {src.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>
                    {src.authorOrInstitution} • ({src.kind})
                  </div>
                  <div style={{ fontSize: '10px', color: '#f87171', marginTop: '3px', fontStyle: 'italic' }}>
                    [Pending Archival Verification (verified: {String(src.verified)})]
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 3: Mathematical Approximation */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '14px'
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔬</span>
              <span>3. What We Mathematically Approximate (ध्वनि प्रतिरूप)</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#d6d3d1', lineHeight: '1.6' }}>
              <li>
                <strong>Synthesis Method:</strong> {instrument.synth?.type || 'Physical modeling'}
              </li>
              <li>
                <strong>Natyashastra Taxonomy:</strong> {instrument.family.toUpperCase()} (
                {instrument.family === 'tata' ? 'तत - Chordophone'
                  : instrument.family === 'avanaddha' ? 'अवनद्ध - Membranophone'
                  : instrument.family === 'sushira' ? 'सुषिर - Aerophone'
                  : 'घन - Idiophone'})
              </li>
              <li>
                <strong>Acoustic Resonance:</strong> Procedural granite stone mandapa convolver with RT60 decay simulation.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#eab308',
              color: '#1c1917',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close Provenance Panel
          </button>
        </div>
      </div>
    </div>
  );
}
