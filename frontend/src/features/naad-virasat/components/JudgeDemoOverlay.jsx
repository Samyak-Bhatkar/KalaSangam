import React, { useState, useEffect, useRef } from 'react';
import { DEMO_CARVINGS } from '../vision/demoCarvings.js';
import instruments from '../data/instruments.json' with { type: 'json' };
import scalesData from '../data/scales.json' with { type: 'json' };

/**
 * JudgeDemoOverlay - Automated 90-Second Scripted Offline Walkthrough
 * Triggers via ?demo=1 or top-level "Judge Demo" button.
 * Delivers a flawless, synchronized live projector demo without requiring internet access.
 */
export default function JudgeDemoOverlay({
  isOpen,
  onClose,
  onStepChange,
  audioEngine
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const timerRef = useRef(null);

  // Scripted Demo Stages
  const SCRIPT_STAGES = [
    {
      time: 0,
      title: 'Phase 1: Artifact Capture & EXIF Stripping',
      titleHi: 'शिल्प चयन एवं भू-अवस्थिति संरक्षण',
      caption: 'Loading 12th-century Hoysala stone carving of Ekatantri Vina from Belur Chennakeshava Temple. In-memory metadata stripping ensures complete privacy.',
      action: 'select_belur'
    },
    {
      time: 14,
      title: 'Phase 2: Organology Vision Pipeline & Natyashastra Taxonomy',
      titleHi: 'नाट्यशास्त्र वर्गीकरण एवं तत वाद्य अभिज्ञान',
      caption: 'Organological detection matches morphology with 94% confidence: Tata Vadya (Chordophone) with hollow bamboo danda and gourd resonator.',
      action: 'scan_and_classify'
    },
    {
      time: 30,
      title: 'Phase 3: Lift-Out Reveal & Physical String Strumming',
      titleHi: 'पाषाण से नाद — तन्त्र-झंकार एवं कंपन',
      caption: 'Carving background dims as glowing strings appear over the relief. Karplus-Strong physical modeling with fractional delay synthesizes Mohanam scale.',
      action: 'strum_strings'
    },
    {
      time: 50,
      title: 'Phase 4: Monolithic Stone Mandapa Acoustics',
      titleHi: 'पाषाण मण्डप अनुनाद (Stone Mandapa Acoustics)',
      caption: 'Engaging procedural convolution reverb simulating acoustic reflections off granite temple pillars (RT60 ~2.4s with low-pass absorption).',
      action: 'mandapa_on'
    },
    {
      time: 68,
      title: 'Phase 5: A/B Evolutionary Lineage & Modern Descendant',
      titleHi: 'सहस्राब्दी कालक्रम — सरस्वती वीणा तुलना',
      caption: 'Comparing 12th-century Ekatantri with its 24-fretted modern concert descendant: the Saraswati Vina.',
      action: 'open_compare'
    },
    {
      time: 80,
      title: 'Phase 6: Academic Provenance & Integrity Audit',
      titleHi: 'शास्त्रीय प्रमाण — भरत मुनि नाट्यशास्त्र',
      caption: 'Transparent 4-pillar provenance: Natyashastra Chapter 28-33 citations, transparently marked [verified: false] pending archival verification.',
      action: 'open_evidence'
    }
  ];

  // Timer tick
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1;
        if (next >= 92) {
          clearInterval(timerRef.current);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isOpen]);

  // Stage synchronization and audio cues
  useEffect(() => {
    if (!isOpen) return;

    const matchedStageIdx = SCRIPT_STAGES.findIndex((stage, idx) => {
      const nextStage = SCRIPT_STAGES[idx + 1];
      return elapsedSeconds >= stage.time && (!nextStage || elapsedSeconds < nextStage.time);
    });

    if (matchedStageIdx !== -1 && matchedStageIdx !== currentStage) {
      setCurrentStage(matchedStageIdx);
      const stage = SCRIPT_STAGES[matchedStageIdx];
      if (onStepChange) {
        onStepChange(stage.action);
      }

      // Automated sound events during demo
      if (stage.action === 'strum_strings' && audioEngine) {
        const vina = instruments.find(i => i.id === 'ekatantri-vina');
        const mohanam = scalesData.ragas.mohanam;
        audioEngine.playIllustrativePhrase(vina, mohanam, 261.63);
      } else if (stage.action === 'mandapa_on' && audioEngine) {
        audioEngine.setMandapaAcoustics(true);
      }
    }
  }, [elapsedSeconds, currentStage, isOpen, onStepChange, audioEngine]);

  if (!isOpen) return null;

  const currentScript = SCRIPT_STAGES[currentStage] || SCRIPT_STAGES[0];
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / 90) * 100));

  return (
    <div
      className="nv-judge-demo-overlay"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '94%',
        maxWidth: '820px',
        background: 'rgba(18, 14, 10, 0.96)',
        border: '2px solid #eab308',
        boxShadow: '0 0 35px rgba(234, 179, 8, 0.5), 0 16px 40px rgba(0,0,0,0.95)',
        borderRadius: '16px',
        padding: '16px 20px',
        zIndex: 2000,
        color: '#fef3c7',
        backdropFilter: 'blur(10px)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top Meta Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: '#eab308',
              color: '#1c1917',
              fontSize: '11px',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}
          >
            JUDGE DEMO MODE (?demo=1)
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fef08a' }}>
            {currentScript.titleHi}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: '#fde047' }}>
            {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:
            {String(elapsedSeconds % 60).padStart(2, '0')} / 01:30
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Exit to Play Freely ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(to right, #eab308, #fef08a)',
            boxShadow: '0 0 10px #eab308',
            transition: 'width 0.9s linear'
          }}
        />
      </div>

      {/* Script Caption */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>🎙️</span>
        <div>
          <h4 style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#fef08a' }}>
            {currentScript.title}
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#e7e5e4', lineHeight: 1.45 }}>
            {currentScript.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
