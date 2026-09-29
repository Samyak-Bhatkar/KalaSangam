import React, { useState, useEffect, useCallback } from 'react';
import ScanViewfinder from './components/ScanViewfinder.jsx';
import PlayingStudio from './components/PlayingStudio.jsx';
import EvidenceProvenanceDrawer from './components/EvidenceProvenanceDrawer.jsx';
import DescendantCompareModal from './components/DescendantCompareModal.jsx';
import JudgeDemoOverlay from './components/JudgeDemoOverlay.jsx';
import { getNaadAudioEngine } from './audio/NaadAudioEngine.js';
import { DEMO_CARVINGS } from './vision/demoCarvings.js';
import instruments from './data/instruments.json' with { type: 'json' };

/**
 * NaadErrorBoundary - Strict Failure Isolation
 * Prevents any internal Web Audio or rendering error from affecting the host app.
 */
export class NaadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Naad-Virasat ErrorBoundary caught an exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '30px',
            margin: '20px auto',
            maxWidth: '600px',
            background: '#1c1610',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            color: '#fef3c7',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <h3 style={{ color: '#f87171', margin: '0 0 10px 0' }}>
            नाद विरासत (Naad-Virasat) Safe Recovery Mode
          </h3>
          <p style={{ fontSize: '13px', color: '#a8a29e' }}>
            An unexpected error occurred in the acoustic synthesis module. The main ShilpSetu application remains fully operational.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#eab308',
              color: '#000',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Restart Naad-Virasat
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * NaadVirasatContainer - Feature Root Container
 */
export default function NaadVirasatContainer() {
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('scan'); // 'scan' | 'studio'
  const [activeSession, setActiveSession] = useState(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const audioEngine = getNaadAudioEngine();

  // Check URL params and feature flag on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') === '1') {
        startJudgeDemo();
      }
      if (urlParams.get('debug') === '1') {
        setIsDebugMode(true);
      }
      if (localStorage.getItem('nv_enabled') === 'false') {
        setFeatureEnabled(false);
      }
    }

    // AudioContext unlock on first user gesture (using capture: true to bypass stopPropagation)
    const unlockAudio = () => {
      audioEngine.resume();
      window.removeEventListener('click', unlockAudio, true);
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
    };
    window.addEventListener('click', unlockAudio, true);
    window.addEventListener('pointerdown', unlockAudio, true);
    window.addEventListener('touchstart', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);

    return () => {
      window.removeEventListener('click', unlockAudio, true);
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
      audioEngine.stopAll();
    };
  }, [audioEngine]);

  // Start Judge Demo Mode
  const startJudgeDemo = useCallback(() => {
    const belurDemo = DEMO_CARVINGS[0];
    const vinaInstrument = instruments.find(i => i.id === 'ekatantri-vina') || instruments[0];

    setActiveSession({
      instrument: vinaInstrument,
      carvingImageSrc: belurDemo.imageSrc,
      boundingBox: belurDemo.boundingBox,
      confidence: belurDemo.confidence,
      rationale: belurDemo.rationale
    });
    setViewMode('studio');
    setIsJudgeDemoOpen(true);
  }, []);

  // Handle stage events from Judge Demo
  const handleJudgeStepChange = useCallback((action) => {
    if (action === 'open_compare') {
      setIsCompareOpen(true);
      setIsEvidenceOpen(false);
    } else if (action === 'open_evidence') {
      setIsCompareOpen(false);
      setIsEvidenceOpen(true);
    }
  }, []);

  // Scan Complete callback
  const handleScanComplete = (scannedData) => {
    setActiveSession(scannedData);
    setViewMode('studio');
  };

  if (!featureEnabled) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#a8a29e' }}>
        <h3>Naad-Virasat is currently disabled via feature flag.</h3>
        <button
          type="button"
          onClick={() => { localStorage.removeItem('nv_enabled'); setFeatureEnabled(true); }}
          style={{ background: '#eab308', color: '#000', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
        >
          Enable Feature
        </button>
      </div>
    );
  }

  return (
    <NaadErrorBoundary>
      <div
        className="nv-feature-root"
        style={{
          minHeight: '85vh',
          padding: '16px 12px 60px 12px',
          background: 'radial-gradient(ellipse at 50% 10%, #1e1710 0%, #0d0a07 100%)',
          color: '#fef3c7',
          boxSizing: 'border-box'
        }}
      >
        {/* Navigation Bar / Top Bar */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto 16px auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {viewMode === 'studio' && (
            <button
              type="button"
              onClick={() => {
                audioEngine.stopAll();
                setViewMode('scan');
                setIsJudgeDemoOpen(false);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fef08a',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>←</span>
              <span>Scan / Select Another Carving</span>
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={startJudgeDemo}
              style={{
                background: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
                color: '#1c1917',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 10px rgba(234, 179, 8, 0.4)'
              }}
            >
              <span>⭐</span>
              <span>Judge Demo (90s)</span>
            </button>
          </div>
        </div>

        {/* View Mode: Viewfinder vs Studio */}
        {viewMode === 'scan' ? (
          <ScanViewfinder onScanComplete={handleScanComplete} />
        ) : (
          activeSession && (
            <PlayingStudio
              instrument={activeSession.instrument}
              carvingImageSrc={activeSession.carvingImageSrc}
              boundingBox={activeSession.boundingBox}
              audioEngine={audioEngine}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onOpenCompare={() => setIsCompareOpen(true)}
              isDebugMode={isDebugMode}
            />
          )
        )}

        {/* Evidence & Provenance Drawer */}
        <EvidenceProvenanceDrawer
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          instrument={activeSession?.instrument}
          confidence={activeSession?.confidence}
          carvingContext={activeSession?.rationale}
        />

        {/* Descendant Comparison Modal */}
        <DescendantCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          instrument={activeSession?.instrument}
          audioEngine={audioEngine}
        />

        {/* Judge Demo Scripted Overlay */}
        <JudgeDemoOverlay
          isOpen={isJudgeDemoOpen}
          onClose={() => {
            setIsJudgeDemoOpen(false);
            audioEngine.stopIllustrativePhrase();
          }}
          onStepChange={handleJudgeStepChange}
          audioEngine={audioEngine}
        />
      </div>
    </NaadErrorBoundary>
  );
}
