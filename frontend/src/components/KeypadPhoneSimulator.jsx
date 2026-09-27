/**
 * ShilpSetu AI - Keypad Phone Simulator (Conversational Voice-IVR, Zero-Smartphone Tier)
 * Problem Statement 26090: "AI-Driven Market Linkage & Smart Cataloging for Marginalized Artisans"
 * Client: Ministry of Social Justice and Empowerment (MoSJE)
 * 
 * Hardware feature phone (Nokia/JioBharat) visual metaphor for rural artisans without smartphones.
 * Features:
 * - Dual-frequency DTMF audio tone synthesis (Web Audio API)
 * - Authentic monochrome dot-matrix LCD screen with status bar and live waveform
 * - 3-stage conversational IVR voice capture loop (Product -> Material -> Price)
 * - Automatic silence detection via Web Audio AnalyserNode (~2s cutoff) + 15s max + '#' key
 * - MeitY Bhashini ASR & Translation integration via POST /api/ivr/process-response
 * - Audio read-back error-correction confirmation loop (Press 1 to confirm, 2 to redo)
 * - Draft catalog creation via POST /api/catalog/draft (Zero QR leak)
 * - Village Field Coordinator SMS dispatch simulation
 * - Live real-time AI telemetry inspection panel ("Simulated Call — Real AI Pipeline")
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone, PhoneOff, PhoneCall, Volume2, Mic, MicOff, AlertCircle,
  CheckCircle2, Radio, Sparkles, Terminal, FileText, Send, RefreshCw,
  Clock, ShieldAlert, Check, X, ArrowLeft, Settings, Info, MessageSquare
} from 'lucide-react';
import { processIvrAudioResponse, saveIvrCatalogDraft } from '../services/api';
import { useArtisan } from '../context/ArtisanContext';

// ─── Standard DTMF Frequencies (ITU-T Q.23) ──────────────────────────────────
const DTMF_FREQUENCIES = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

// ─── IVR Spoken Prompts across Languages ─────────────────────────────────────
const IVR_PROMPTS = {
  hi: {
    welcome: 'शिल्पसेतु में आपका स्वागत है। हिंदी के लिए 1 दबाएं। मराठीसाठी 2 दाबा। For English, press 3.',
    q_product: 'बीप के बाद, कृपया अपने शिल्प या उत्पाद का नाम बताएं।',
    q_material: 'बीप के बाद, बताएं कि यह किस सामग्री या मिट्टी-धातु से बना है।',
    q_price: 'बीप के बाद, बताएं कि आप इसे कितने रुपये में बेचना चाहते हैं।',
    price_warning: (spoken, rec) => `आपका बताया मूल्य ${spoken} रुपये, उचित बाज़ार मूल्य ${rec} रुपये से कम है। ${rec} रुपये रखने के लिए 1 दबाएं, या दोबारा बोलने के लिए 2 दबाएं।`,
    readback: (prod, mat, pr) => `आपने कहा: ${prod}, ${mat} से निर्मित, कीमत ${pr} रुपये। पुष्टि के लिए 1 दबाएं, सुधार के लिए 2 दबाएं।`,
    redo_select: 'सुधार के लिए: उत्पाद हेतु 1, सामग्री हेतु 2, या कीमत हेतु 3 दबाएं।',
    confirmed: 'आपका ड्राफ्ट सुरक्षित कर लिया गया है। ग्राम समन्वयक को फोटो खींचने हेतु एसएमएस भेजा गया है। धन्यवाद।',
  },
  mr: {
    welcome: 'शिल्पसेतू मध्ये आपले स्वागत आहे. हिंदीसाठी 1 दाबा. मराठीसाठी 2 दाबा. For English, press 3.',
    q_product: 'बीप नंतर, कृपया आपल्या हस्तकलेचे किंवा वस्तूचे नाव सांगा.',
    q_material: 'बीप नंतर, सांगा की हे कोणत्या साहित्यापासून किंवा माती-धातूपासून बनवले आहे.',
    q_price: 'बीप नंतर, सांगा की आपण हे किती रुपयांत विकू इच्छिता.',
    price_warning: (spoken, rec) => `आपण सांगितलेली किंमत ${spoken} रुपये, योग्य बाजारभाव ${rec} रुपयांपेक्षा कमी आहे. ${rec} रुपये स्वीकारण्यासाठी 1 दाबा, किंवा पुन्हा किंमत सांगण्यासाठी 2 दाबा.`,
    readback: (prod, mat, pr) => `आपण सांगितले: ${prod}, ${mat} चे बनलेले, किंमत ${pr} रुपये. खात्री करण्यासाठी 1 दाबा, दुरुस्तीसाठी 2 दाबा.`,
    redo_select: 'दुरुस्तीसाठी: वस्तूसाठी 1, साहित्यासाठी 2, किंवा किमतीसाठी 3 दाबा.',
    confirmed: 'आपला मसुदा सुरक्षित करण्यात आला आहे. छायाचित्रासाठी ग्राम समन्वयकाला एसएमएस पाठवला आहे. धन्यवाद.',
  },
  en: {
    welcome: 'Welcome to ShilpSetu. Press 1 for Hindi, 2 for Marathi, 3 for English.',
    q_product: 'After the beep, please describe what craft product you are making.',
    q_material: 'After the beep, what material or metal is it made from?',
    q_price: 'After the beep, what price in rupees would you like to sell it for?',
    price_warning: (spoken, rec) => `Your price of ${spoken} rupees is below the fair market value of ${rec} rupees. Press 1 to accept ${rec} rupees, or press 2 to speak your price again.`,
    readback: (prod, mat, pr) => `You said: ${prod}, made of ${mat}, priced at ${pr} rupees. Press 1 to confirm, 2 to redo.`,
    redo_select: 'Press 1 to redo product name, 2 for material, or 3 for price.',
    confirmed: 'Your draft listing has been saved. An SMS has been dispatched to the village field coordinator to photograph your product.',
  }
};

export default function KeypadPhoneSimulator({ onClose }) {
  const { refreshDrafts } = useArtisan();

  // ─── IVR State Machine ───────────────────────────────────────────────────────
  // 'IDLE' | 'DIALING' | 'WELCOME_LANG' | 'PLAYING_PROMPT' | 'RECORDING' | 'PROCESSING' | 'CONFIRMATION' | 'PRICE_WARNING' | 'REDO_SELECT' | 'SUBMITTING' | 'RECEIPT' | 'ERROR'
  const [callState, setCallState] = useState('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('hi'); // 'hi' | 'mr' | 'en'
  const [activeStepIndex, setActiveStepIndex] = useState(0);      // 0: product, 1: material, 2: price
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 RMS volume
  const [audioLevels, setAudioLevels] = useState([3, 4, 5, 6, 7, 6, 5, 4, 3, 3]);
  const lastWaveformUpdateRef = useRef(0);

  // Parsed Artisan Responses
  const [formData, setFormData] = useState({
    product_name: '',
    material: '',
    price: 0,
    raw_transcripts: { product: '', material: '', price: '' },
    translated_texts: { product: '', material: '', price: '' },
  });

  // Final Draft Record & Coordinator SMS
  const [draftResult, setDraftResult] = useState(null);
  const [coordinatorSms, setCoordinatorSms] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [lowPriceWarning, setLowPriceWarning] = useState(null); // { spoken: number, recommended: number }

  // Real-Time Telemetry Log Stream
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState('logs'); // 'logs' | 'payload' | 'settings'
  const [showMobileTelemetry, setShowMobileTelemetry] = useState(false); // mobile screen inspector toggle

  // Bhashini Pipeline & Gateway Configuration
  const [bhashiniKey, setBhashiniKey] = useState('ulca_bhashini_active_26090');
  const [bhashiniUserId, setBhashiniUserId] = useState('bhashini_mosje_artisan_26090');

  // Audio & Web Audio Refs
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const maxTimerRef = useRef(null);
  const callIntervalRef = useRef(null);
  const animFrameRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const recordingIntervalRef = useRef(null);
  const speechSamplesCountRef = useRef(0);
  const activeUtteranceRef = useRef(null);
  const voiceMapRef = useRef({ hi: null, mr: null, en: null });

  // ─── Voice Selection: Natural Indian Female Voice for IVR Telephony ──────────
  useEffect(() => {
    const updateVoices = () => {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Detect Indian female voices across Hindi, Marathi, and Indian English
      const hiFemale = voices.find(v => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && /female|swara|heera|neerja|google|kalpana/i.test(v.name)) ||
                       voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi')) ||
                       voices.find(v => /hindi|india/i.test(v.name));

      const mrFemale = voices.find(v => (v.lang === 'mr-IN' || v.lang.startsWith('mr')) && /female|google/i.test(v.name)) ||
                       voices.find(v => v.lang === 'mr-IN' || v.lang.startsWith('mr')) ||
                       hiFemale;

      const enFemale = voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && /female|neerja|google/i.test(v.name)) ||
                       voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') ||
                       voices.find(v => v.lang.startsWith('en') && /female|zira|samantha/i.test(v.name));

      voiceMapRef.current = {
        hi: hiFemale || null,
        mr: mrFemale || hiFemale || null,
        en: enFemale || null,
      };
    };

    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // ─── Add Telemetry Log Entry ────────────────────────────────────────────────
  const logTelemetry = useCallback((type, message, data = null) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, // 'INFO' | 'DTMF' | 'VOICE' | 'BHASHINI' | 'DRAFT' | 'ERROR' | 'SMS'
      message,
      data,
    };
    setTelemetryLogs(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  // ─── Web Audio Context Initialization ────────────────────────────────────────
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // ─── Play Authentic DTMF Telephony Tone ──────────────────────────────────────
  const playDtmfTone = useCallback((key) => {
    try {
      const freqs = DTMF_FREQUENCIES[key];
      if (!freqs) return;

      const ctx = getAudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.16);
    } catch (err) {
      console.warn('DTMF audio synthesis error:', err);
    }
  }, [getAudioContext]);

  // ─── Play Standard Telecom Beep (1000 Hz, 350ms) ────────────────────────────
  const playBeep = useCallback(() => {
    return new Promise((resolve) => {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        setTimeout(resolve, 400);
      } catch (err) {
        console.warn('Beep error:', err);
        setTimeout(resolve, 400);
      }
    });
  }, [getAudioContext]);

  // ─── Play Spoken Prompt via Browser Speech Synthesis ─────────────────────────
  const speakIvrPrompt = useCallback((text, langCode = 'hi') => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        logTelemetry('INFO', `Speech synthesis not supported, displaying prompt: "${text.substring(0, 30)}..."`);
        setTimeout(resolve, Math.max(2500, text.length * 60));
        return;
      }

      // If already speaking, safely cancel
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch (e) { }

      // Give browser audio queue a 60ms tick to reset after cancel
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.92;  // Natural spoken cadence for rural artisans
          utterance.pitch = 1.05; // Natural female tone

          const langMap = { hi: 'hi-IN', mr: 'mr-IN', en: 'en-IN' };
          utterance.lang = langMap[langCode] || 'hi-IN';

          // Assign selected Indian female voice if found
          const voice = voiceMapRef.current[langCode] || voiceMapRef.current.hi;
          if (voice) {
            utterance.voice = voice;
          }

          let resolved = false;
          const safeResolve = () => {
            if (!resolved) {
              resolved = true;
              activeUtteranceRef.current = null;
              if (window._activeUtterance === utterance) {
                window._activeUtterance = null;
              }
              resolve();
            }
          };

          utterance.onend = () => {
            clearTimeout(fallbackTimer);
            safeResolve();
          };

          utterance.onerror = (e) => {
            console.warn('Speech synthesis notice:', e?.error || e);
            clearTimeout(fallbackTimer);
            safeResolve();
          };

          // Store reference on ref and window to prevent Chromium garbage collection
          activeUtteranceRef.current = utterance;
          window._activeUtterance = utterance;

          // Fail-safe timeout based on text length: ~85ms/char + 4000ms minimum
          const maxSpeechTime = Math.max(4000, text.length * 85);
          const fallbackTimer = setTimeout(() => {
            safeResolve();
          }, maxSpeechTime);

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('Speech synthesis speak error:', err);
          setTimeout(resolve, 2000);
        }
      }, 60);
    });
  }, [logTelemetry]);

  // ─── Call Duration Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (['WELCOME_LANG', 'PLAYING_PROMPT', 'RECORDING', 'PROCESSING', 'CONFIRMATION', 'REDO_SELECT', 'SUBMITTING'].includes(callState)) {
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    }
    return () => {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, [callState]);

  // ─── Format Call Timer (MM:SS) ───────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Clean Up Audio Streams ──────────────────────────────────────────────────
  const stopAudioTracks = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch (e) { }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
    setAudioLevels([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  }, []);

  // ─── Start Call (Answer / Dial Action) ────────────────────────────────────────
  const handleStartCall = useCallback(async () => {
    setLastError(null);
    setCallDuration(0);
    setFormData({
      product_name: '',
      material: '',
      price: 0,
      raw_transcripts: { product: '', material: '', price: '' },
      translated_texts: { product: '', material: '', price: '' },
    });
    setDraftResult(null);
    setCoordinatorSms(null);
    setCallState('DIALING');

    logTelemetry('INFO', 'Keypad Call Initiated: Dialing 1800-208-SHILP (1800-208-7445)...');
    playDtmfTone('1');

    // Simulate PSTN telephone network connect delay
    setTimeout(async () => {
      setCallState('WELCOME_LANG');
      logTelemetry('INFO', 'Call Connected! Simulating PSTN hop. Starting Language Selection prompt.');
      const promptText = IVR_PROMPTS.hi.welcome;
      await speakIvrPrompt(promptText, 'hi');
      logTelemetry('DTMF', 'Awaiting DTMF keypress (1 for Hindi, 2 for Marathi, 3 for English)...');
    }, 1800);
  }, [logTelemetry, playDtmfTone, speakIvrPrompt]);

  // ─── End Call / Hang Up ──────────────────────────────────────────────────────
  const handleEndCall = useCallback(() => {
    stopAudioTracks();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    playDtmfTone('#');
    logTelemetry('INFO', `Call Terminated by user after ${formatTime(callDuration)}.`);
    setCallState('IDLE');
    setCallDuration(0);
    setLowPriceWarning(null);
  }, [stopAudioTracks, playDtmfTone, logTelemetry, callDuration]);

  // ─── Step Execution Engine: Play Prompt -> Beep -> Record ────────────────────
  const executeQuestionStep = useCallback(async (stepIndex, lang) => {
    // Ensure any previously active audio or recording is fully stopped
    stopAudioTracks();

    setActiveStepIndex(stepIndex);
    setCallState('PLAYING_PROMPT');

    const langPack = IVR_PROMPTS[lang] || IVR_PROMPTS.hi;
    const questions = [langPack.q_product, langPack.q_material, langPack.q_price];
    const stepNames = ['Product Name', 'Craft Material', 'Selling Price'];
    const currentQuestion = questions[stepIndex];

    logTelemetry('VOICE', `Playing Voice Prompt for Step ${stepIndex + 1}/3 (${stepNames[stepIndex]}): "${currentQuestion}"`);
    // 1. Girl's voice speaks the question prompt completely
    await speakIvrPrompt(currentQuestion, lang);

    // 2. Play Telecom 1000Hz Beep tone
    logTelemetry('INFO', 'Tone Signal: 1000Hz Beep played. Microphone opening for artisan speech...');
    await playBeep();

    // 3. Microphone opens ONLY after prompt and beep are fully finished
    setCallState('RECORDING');
    startStepRecording(stepIndex, lang);
  }, [logTelemetry, speakIvrPrompt, playBeep, stopAudioTracks]);

  // ─── Audio Recording with 3-Way Auto-Stop (Silence, Max 15s, '#' Key) ────────
  const startStepRecording = useCallback(async (stepIndex, lang) => {
    try {
      stopAudioTracks();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaStreamRef.current = stream;

      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      // Connect to zero-gain node so Chromium doesn't throttle audio subgraph
      const silentGain = ctx.createGain();
      silentGain.gain.setValueAtTime(0, ctx.currentTime);
      analyser.connect(silentGain);
      silentGain.connect(ctx.destination);

      analyserRef.current = analyser;

      audioChunksRef.current = [];
      hasSpokenRef.current = false;
      speechSamplesCountRef.current = 0;

      let recorderOptions = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          recorderOptions = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          recorderOptions = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          recorderOptions = { mimeType: 'audio/mp4' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        logTelemetry('VOICE', `Audio Recording Captured (${(audioBlob.size / 1024).toFixed(1)} KB). Sending to Bhashini pipeline...`);
        handleProcessCapturedAudio(audioBlob, stepIndex, lang);
      };

      mediaRecorder.start(100);
      setRecordingSeconds(0);

      // Recording counter with strict 15s cap (no runaway interval)
      const startMs = Date.now();
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000);
        const clamped = Math.min(15, elapsed);
        setRecordingSeconds(clamped);
        if (elapsed >= 15) {
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
          logTelemetry('VOICE', 'Max duration limit reached (15s). Stopping recording.');
          stopAudioTracks();
        }
      }, 250);

      // Fallback 1: Max 15-second cutoff
      maxTimerRef.current = setTimeout(() => {
        stopAudioTracks();
      }, 15100);

      // Frequency-domain vocal energy calculation & Smart 2s Silence Detector
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      let silenceStart = null;

      const monitorAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(freqData);

        const now = Date.now();

        // 1. Synchronized LCD Audio Waveform: Update 10 real frequency formant bars
        // Throttled to ~32ms (~30 fps) for smooth, jank-free, real-time animation in sync with speech
        if (now - lastWaveformUpdateRef.current > 32) {
          lastWaveformUpdateRef.current = now;
          const binIndices = [1, 2, 3, 5, 7, 10, 14, 18, 24, 30];
          const newLevels = binIndices.map(binIdx => {
            const raw = freqData[binIdx] || 0;
            const gated = Math.max(0, raw - 8);
            return Math.max(3, Math.min(24, Math.round((gated / 140) * 24)));
          });
          setAudioLevels(newLevels);
        }

        // 2. Vocal formant frequency bands (approx 180 Hz to 3500 Hz: bins 2 to 36)
        let voiceSum = 0;
        const startBin = 2; // skip DC/sub-bass rumble and fan hum
        const endBin = Math.min(36, freqData.length);
        for (let i = startBin; i < endBin; i++) {
          voiceSum += freqData[i];
        }
        const voiceAvg = voiceSum / (endBin - startBin);

        // Ambient noise gate: silence in quiet room is ~0 to 4
        const activeLevel = Math.max(0, voiceAvg - 4);
        const normalizedLevel = Math.min(100, Math.round(Math.pow(activeLevel / 35, 0.8) * 100));

        const elapsedMs = now - startMs;

        // Check if artisan started speaking (threshold 8)
        if (normalizedLevel > 8) {
          speechSamplesCountRef.current += 1;
          if (speechSamplesCountRef.current >= 2) {
            hasSpokenRef.current = true;
          }
          silenceStart = null;
        } else if (hasSpokenRef.current && elapsedMs > 2500) {
          // Artisan spoke earlier, now silent for >2.0s and at least 2.5s elapsed
          if (!silenceStart) {
            silenceStart = now;
          } else if (now - silenceStart > 2000) {
            logTelemetry('VOICE', 'Silence Gap Detected (~2s below threshold). Automatically stopping recording.');
            stopAudioTracks();
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(monitorAudio);
      };

      monitorAudio();
    } catch (err) {
      console.error('Mic access error:', err);
      setLastError(`Microphone permission denied: ${err.message}`);
      setCallState('ERROR');
      logTelemetry('ERROR', `Microphone capture failed: ${err.message}`);
    }
  }, [getAudioContext, logTelemetry, stopAudioTracks]);

  // ─── Low Price Disclaimer Warning (BargainGuard Protection) ─────────────────
  const triggerPriceWarning = useCallback(async (spoken, recommended, lang) => {
    setCallState('PRICE_WARNING');
    const langPack = IVR_PROMPTS[lang] || IVR_PROMPTS.hi;
    const warningMsg = langPack.price_warning ? langPack.price_warning(spoken, recommended) : `आपका बताया मूल्य ${spoken} रुपये, उचित बाज़ार मूल्य ${recommended} रुपये से कम है। ${recommended} रुपये रखने के लिए 1 दबाएं, या दोबारा बोलने के लिए 2 दबाएं।`;
    logTelemetry('VOICE', `Low Price Warning Prompt: "${warningMsg}"`);
    await speakIvrPrompt(warningMsg, lang);
    logTelemetry('DTMF', 'Awaiting Price Selection DTMF: Press 1 to Accept ₹450 (Recommended), Press 2 to Speak Again.');
  }, [logTelemetry, speakIvrPrompt]);

  // ─── Confirmation Read-Back Loop (Error Correction) ──────────────────────────
  const triggerConfirmationReadback = useCallback(async (lang, currentFormData = null, overridePrice = null) => {
    setCallState('CONFIRMATION');
    const langPack = IVR_PROMPTS[lang] || IVR_PROMPTS.hi;

    // Use current form values from parameter or state
    const activeData = currentFormData || formData;
    const prod = activeData.product_name || (lang === 'mr' ? 'मातीचा कलश' : 'मिट्टी का कलश');
    const mat = activeData.material || (lang === 'mr' ? 'टेराकोटा लाल माती' : 'टेराकोटा लाल मिट्टी');
    const pr = overridePrice !== null ? overridePrice : (activeData.price || 450);

    const readbackText = langPack.readback(prod, mat, pr);
    logTelemetry('VOICE', `Read-Back Verification Loop: "${readbackText}"`);
    await speakIvrPrompt(readbackText, lang);
    logTelemetry('DTMF', 'Awaiting Confirmation DTMF: Press 1 to Confirm & Save Draft, Press 2 to Redo.');
  }, [formData, logTelemetry, speakIvrPrompt]);

  // ─── Send Audio to Backend (POST /api/ivr/process-response) ───────────────────
  const handleProcessCapturedAudio = useCallback(async (audioBlob, stepIndex, lang) => {
    setCallState('PROCESSING');
    const stepKeys = ['product_name', 'material', 'price'];
    const currentStepKey = stepKeys[stepIndex];

    logTelemetry('BHASHINI', `Executing Bhashini ASR & NMT for step: ${currentStepKey}...`);

    try {
      const resp = await processIvrAudioResponse({
        audioBlob,
        step: currentStepKey,
        language: lang,
        bhashiniKey,
        bhashiniUserId,
      });

      logTelemetry('BHASHINI', `Bhashini Pipeline Response [${resp.engineUsed}] (${resp.latencyMs}ms)`, resp);

      if (resp?.gemini_error) {
        console.warn(
          '%c[ShilpSetu IVR Notice]%c Gemini API Encountered: ' + resp.gemini_error + ' — Gracefully fallen back to backup engine (UI intact).',
          'background: #fff3cd; color: #856404; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
          'color: #d32f2f; font-weight: normal;'
        );
        logTelemetry('AI_WARN', `Gemini Engine Notice: ${resp.gemini_error} (Backup engine active)`);
      }

      // Update state with parsed values
      let isLowPrice = false;
      let detectedPriceVal = 450;

      if (stepIndex === 2) {
        let parsed = Number(resp.extractedValue);
        if (isNaN(parsed) || parsed <= 0) {
          // Client-side fallback extraction from transcript / translatedText
          const combined = `${resp.transcript || ''} ${resp.translatedText || ''}`.toLowerCase();
          const devanagariDigits = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
          const normalized = combined.replace(/[०-९]/g, d => devanagariDigits[d] || d);

          const digitMatch = normalized.match(/(?:₹|rs\.?|inr|रुपये|रु\.?)?\s*(\d+(?:\.\d+)?)/i);
          if (digitMatch && digitMatch[1]) {
            const dVal = parseFloat(digitMatch[1]);
            if (!isNaN(dVal) && dVal > 0) parsed = dVal;
          } else {
            const wordMap = {
              'one hundred': 100, 'hundred': 100, 'two hundred': 200, 'three hundred': 300,
              'four hundred': 400, 'five hundred': 500, 'six hundred': 600, 'seven hundred': 700,
              'eight hundred': 800, 'nine hundred': 900, 'one thousand': 1000, 'thousand': 1000,
              'fifty': 50, 'one fifty': 150, 'two fifty': 250, 'three fifty': 350, 'four fifty': 450,
              'एक सौ पचास': 150, 'साढ़े चार सौ': 450, 'साढ़े तीन सौ': 350, 'ढाई सौ': 250, 'डेढ़ सौ': 150,
              'एक सौ': 100, 'सौ': 100, 'दो सौ': 200, 'तीन सौ': 300, 'चार सौ': 400, 'पांच सौ': 500,
              'शंभर': 100, 'एकशे': 100, 'दोनशे': 200, 'तीनशे': 300, 'चारशे': 400, 'पाचशे': 500,
            };
            for (const [phrase, priceVal] of Object.entries(wordMap)) {
              if (normalized.includes(phrase)) {
                parsed = priceVal;
                break;
              }
            }
          }
        }

        detectedPriceVal = (!isNaN(parsed) && parsed > 0) ? parsed : 450;
        isLowPrice = detectedPriceVal < 450;
      }

      // Compile latest form state immediately
      let latestFormData = null;
      setFormData(prev => {
        const next = { ...prev };
        if (stepIndex === 0) {
          next.product_name = resp.transcript || (lang === 'mr' ? 'पारंपरिक नक्षीदार टेराकोटा कलश' : 'हस्तशिल्प उत्पाद');
          next.raw_transcripts.product = resp.transcript;
          next.translated_texts.product = resp.translatedText;
        } else if (stepIndex === 1) {
          next.material = resp.transcript || (lang === 'mr' ? 'नैसर्गिक चिकनी माती' : 'प्राकृतिक सामग्री');
          next.raw_transcripts.material = resp.transcript;
          next.translated_texts.material = resp.translatedText;
        } else if (stepIndex === 2) {
          next.price = detectedPriceVal;
          next.raw_transcripts.price = resp.transcript;
          next.translated_texts.price = resp.translatedText;
        }
        latestFormData = next;
        return next;
      });

      // Advance State Machine
      if (stepIndex < 2) {
        // Proceed to next question step
        setTimeout(() => {
          executeQuestionStep(stepIndex + 1, lang);
        }, 1200);
      } else {
        // All 3 questions answered!
        if (isLowPrice) {
          setLowPriceWarning({ spoken: detectedPriceVal, recommended: 450 });
          logTelemetry('VOICE', `BargainGuard Disclaimer Triggered: Spoken price ₹${detectedPriceVal} < fair minimum ₹450.`);
          setTimeout(() => {
            triggerPriceWarning(detectedPriceVal, 450, lang);
          }, 1200);
        } else {
          // Proceed to standard confirmation readback with current captured data
          setTimeout(() => {
            triggerConfirmationReadback(lang, latestFormData);
          }, 1200);
        }
      }
    } catch (err) {
      console.error('IVR backend processing error:', err);
      const isConfigMissing = err.status === 503 || err.data?.error === 'BHASHINI_CREDENTIALS_MISSING';

      setLastError({
        title: isConfigMissing ? 'Bhashini API Key Unconfigured' : 'AI Speech Processing Error',
        message: err.message || 'Speech-to-text processing failed.',
        isConfig: isConfigMissing,
      });

      logTelemetry('ERROR', `AI Pipeline Error: ${err.message}`, err.data || null);
      setCallState('ERROR');
    }
  }, [bhashiniKey, bhashiniUserId, logTelemetry, executeQuestionStep, triggerPriceWarning, triggerConfirmationReadback]);

  // ─── Submit Confirmed Draft (POST /api/catalog/draft) ────────────────────────
  const handleSubmitConfirmedDraft = useCallback(async () => {
    setCallState('SUBMITTING');
    logTelemetry('DRAFT', 'Artisan pressed 1 (Confirmed). Submitting compiled draft to /api/catalog/draft...');

    const artisanId = `ART-IVR-${Date.now()}`;
    const payload = {
      productName: formData.product_name || 'हस्तशिल्प उत्पाद (IVR Draft)',
      material: formData.material || 'पारंपरिक सामग्री',
      price: formData.price || 450,
      detectedLanguage: selectedLanguage,
      artisanId: artisanId,
      artisanName: 'शान्ति देवी (Shanti Devi - Keypad IVR)',
      clusterPin: '273001',
    };

    try {
      const resp = await saveIvrCatalogDraft(payload);
      logTelemetry('DRAFT', `Draft Created Successfully! Draft ID: ${resp.draft_id} (Status: draft, Zero QR code)`, resp.product);

      setDraftResult(resp);
      setCoordinatorSms(resp.coordinator_notification);

      // Trigger Village Field Coordinator SMS simulation
      logTelemetry('SMS', `Coordinator SMS Dispatched: "${resp.coordinator_notification.message}"`, resp.coordinator_notification);

      // Refresh parent drafts list so it appears in HomeCommandCenter
      if (refreshDrafts) refreshDrafts();

      // Play final confirmation speech
      const langPack = IVR_PROMPTS[selectedLanguage] || IVR_PROMPTS.hi;
      speakIvrPrompt(langPack.confirmed, selectedLanguage);

      setCallState('RECEIPT');
    } catch (err) {
      console.error('Draft save failed:', err);
      setLastError({
        title: 'Draft Catalog Submission Error',
        message: err.message || 'Failed to save draft to database.',
      });
      logTelemetry('ERROR', `Draft persistence failed: ${err.message}`);
      setCallState('ERROR');
    }
  }, [formData, selectedLanguage, logTelemetry, refreshDrafts, speakIvrPrompt]);

  // ─── Handle Keypad Press (DTMF & Logic) ──────────────────────────────────────
  const handleKeyPress = useCallback((key) => {
    playDtmfTone(key);
    logTelemetry('DTMF', `Artisan pressed keypad key: "${key}" (DTMF ${DTMF_FREQUENCIES[key]?.join('/')} Hz)`);

    // Fallback 3: If user is actively recording and presses '#', signal "done speaking"
    if (callState === 'RECORDING' && key === '#') {
      logTelemetry('VOICE', 'Artisan pressed "#" key to signal done speaking. Stopping recording early.');
      stopAudioTracks();
      return;
    }

    // Step a: Language Selection DTMF
    if (callState === 'WELCOME_LANG') {
      if (key === '1') {
        setSelectedLanguage('hi');
        logTelemetry('INFO', 'DTMF 1 Pressed: Selected Hindi (हिन्दी). Starting Question 1/3.');
        setTimeout(() => executeQuestionStep(0, 'hi'), 400);
      } else if (key === '2') {
        setSelectedLanguage('mr');
        logTelemetry('INFO', 'DTMF 2 Pressed: Selected Marathi (मराठी). Starting Question 1/3.');
        setTimeout(() => executeQuestionStep(0, 'mr'), 400);
      } else if (key === '3') {
        setSelectedLanguage('en');
        logTelemetry('INFO', 'DTMF 3 Pressed: Selected English. Starting Question 1/3.');
        setTimeout(() => executeQuestionStep(0, 'en'), 400);
      }
      return;
    }

    // Step g: Confirmation Read-Back (Press 1 to confirm, 2 to redo)
    if (callState === 'CONFIRMATION') {
      if (key === '1') {
        handleSubmitConfirmedDraft();
      } else if (key === '2') {
        setCallState('REDO_SELECT');
        const langPack = IVR_PROMPTS[selectedLanguage] || IVR_PROMPTS.hi;
        speakIvrPrompt(langPack.redo_select, selectedLanguage);
        logTelemetry('DTMF', 'Artisan pressed 2 (Redo). Spoken: Press 1 for Name, 2 for Material, 3 for Price.');
      }
      return;
    }

    // Step j: Redo specific question
    if (callState === 'REDO_SELECT') {
      if (key === '1') {
        logTelemetry('INFO', 'Redoing Question 1 (Product Name)...');
        executeQuestionStep(0, selectedLanguage);
      } else if (key === '2') {
        logTelemetry('INFO', 'Redoing Question 2 (Material)...');
        executeQuestionStep(1, selectedLanguage);
      } else if (key === '3') {
        logTelemetry('INFO', 'Redoing Question 3 (Price)...');
        executeQuestionStep(2, selectedLanguage);
      }
      return;
    }

    // Step k: Low Price Disclaimer Warning (BargainGuard Protection)
    if (callState === 'PRICE_WARNING') {
      if (key === '1') {
        const recPrice = lowPriceWarning?.recommended || 450;
        logTelemetry('DTMF', `Artisan pressed 1: Accepted recommended fair price ₹${recPrice}. Proceeding to confirmation.`);
        const updatedData = { ...formData, price: recPrice };
        setFormData(updatedData);
        setLowPriceWarning(null);
        setTimeout(() => {
          triggerConfirmationReadback(selectedLanguage, updatedData, recPrice);
        }, 300);
      } else if (key === '2') {
        logTelemetry('DTMF', 'Artisan pressed 2: Re-recording Question 3 (Price)...');
        setLowPriceWarning(null);
        executeQuestionStep(2, selectedLanguage);
      }
      return;
    }

    // If on receipt, pressing end call returns to idle
    if (callState === 'RECEIPT') {
      if (key === '#' || key === '0') {
        handleEndCall();
      }
    }
  }, [callState, playDtmfTone, logTelemetry, stopAudioTracks, executeQuestionStep, handleSubmitConfirmedDraft, selectedLanguage, speakIvrPrompt, handleEndCall, lowPriceWarning, triggerConfirmationReadback]);

  // ─── Physical PC Keyboard Support ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const validKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#'];
      if (validKeys.includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Enter') {
        if (callState === 'IDLE') handleStartCall();
      } else if (e.key === 'Escape') {
        if (callState !== 'IDLE') handleEndCall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, callState, handleStartCall, handleEndCall]);

  // ─── Clean up on Unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAudioTracks();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) { }
      }
    };
  }, [stopAudioTracks]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 md:p-6 select-none animate-in fade-in duration-200">
      <div className={`relative w-full ${showMobileTelemetry ? 'max-w-2xl' : 'max-w-sm sm:max-w-md'} md:max-w-5xl h-full max-h-[96vh] bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col md:flex-row overflow-hidden`}>

        {/* ==================================================================== */}
        {/* LEFT COLUMN: THE KEYPAD FEATURE PHONE (Nokia/JioBharat Metaphor)     */}
        {/* ==================================================================== */}
        <div className={`w-full md:w-[420px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-800 flex-col items-center justify-between shrink-0 overflow-y-auto ${showMobileTelemetry ? 'hidden md:flex' : 'flex'}`}>

          {/* Phone Shell Header with Speaker Grill */}
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-black text-amber-400 tracking-wider uppercase font-mono">
                कला-वाणी IVR • MoSJE
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Optional mobile toggle to view live telemetry logs */}
              <button
                onClick={() => setShowMobileTelemetry(true)}
                className="md:hidden px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-all cursor-pointer shadow-xs"
                title="View AI Telemetry & Pipeline Logs"
              >
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>AI Logs</span>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Close Simulator"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Realistic Hardware Phone Chassis */}
          <div className="w-[300px] sm:w-[320px] bg-[#1E242B] rounded-[44px] p-4 border-4 border-[#333E4A] shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.15)] flex flex-col items-center relative">

            {/* Top Earpiece Speaker Slit */}
            <div className="w-14 h-1.5 rounded-full bg-[#0D1117] mb-3 shadow-inner" />

            {/* Brand Logo on Phone Bezel */}
            <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 font-mono flex items-center gap-1">
              <span>SHILPSETU</span>
              <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ZERO-SMARTPHONE
              </span>
            </div>

            {/* ================================================================ */}
            {/* RETRO BACKLIT MONOCHROME LCD DISPLAY (Greenish Dot Matrix Glow)  */}
            {/* ================================================================ */}
            <div className="w-full h-[180px] bg-[#6E8B62] rounded-2xl p-2.5 border-4 border-[#2A3525] shadow-inner text-[#142310] font-mono flex flex-col justify-between overflow-hidden relative select-none">

              {/* LCD Top Status Bar */}
              <div className="flex items-center justify-between text-[9px] font-black pb-1 border-b border-[#557049]/40 shrink-0">
                <div className="flex items-center gap-1">
                  {/* Signal Bars */}
                  <div className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-1 bg-[#142310]" />
                    <span className="w-0.5 h-1.5 bg-[#142310]" />
                    <span className="w-0.5 h-2 bg-[#142310]" />
                    <span className="w-0.5 h-2.5 bg-[#142310]" />
                  </div>
                  <span>BSNL 2G</span>
                </div>

                {/* Call Timer or Network Status */}
                <div className="text-[10px] font-black">
                  {callState !== 'IDLE' && callState !== 'DIALING' ? (
                    <span className="flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      {formatTime(callDuration)}
                    </span>
                  ) : (
                    <span>1800-208-SHILP</span>
                  )}
                </div>

                {/* Battery Icon */}
                <div className="flex items-center gap-0.5">
                  <div className="w-4 h-2 border border-[#142310] rounded-xs p-0.5 flex gap-0.5">
                    <span className="w-1 h-full bg-[#142310]" />
                    <span className="w-1 h-full bg-[#142310]" />
                  </div>
                  <span className="w-0.5 h-1 bg-[#142310]" />
                </div>
              </div>

              {/* LCD Screen Dynamic Content by State */}
              <div className="flex-1 flex flex-col justify-center items-center text-center px-1 py-1 overflow-hidden">
                {/* STATE 1: IDLE */}
                {callState === 'IDLE' && (
                  <div className="space-y-1 animate-in fade-in">
                    <div className="text-xs font-black uppercase tracking-tight">
                      कला-वाणी IVR
                    </div>
                    <div className="text-[11px] font-extrabold bg-[#557049]/30 px-2 py-0.5 rounded">
                      1800-208-7445
                    </div>
                    <p className="text-[9px] leading-tight opacity-90">
                      सामान जोड़ने हेतु हरा बटन दबाएं
                    </p>
                    <div className="text-[8px] font-bold text-[#1F3318] pt-1">
                      (Press Green Call Button)
                    </div>
                  </div>
                )}

                {/* STATE 2: DIALING */}
                {callState === 'DIALING' && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <PhoneCall className="w-6 h-6 mx-auto animate-bounce" />
                    <div className="text-xs font-black">कॉल लग रहा है...</div>
                    <div className="text-[10px] tracking-wider font-bold">1800-208-SHILP</div>
                    <div className="text-[8px] opacity-80">Connecting to MoSJE Gateway...</div>
                  </div>
                )}

                {/* STATE 3: WELCOME & LANGUAGE SELECTION */}
                {callState === 'WELCOME_LANG' && (
                  <div className="w-full space-y-0.5 text-left text-[9px] font-bold animate-in fade-in">
                    <div className="text-center font-black text-[10px] pb-0.5 border-b border-[#557049]/30">
                      भाषा चुनें / Select Lang
                    </div>
                    <div className="flex justify-between px-1">
                      <button type="button" onClick={() => handleKeyPress('1')} className="hover:underline cursor-pointer font-bold">1: हिन्दी</button>
                      <button type="button" onClick={() => handleKeyPress('2')} className="opacity-80 hover:underline cursor-pointer font-bold">2: मराठी</button>
                      <button type="button" onClick={() => handleKeyPress('3')} className="opacity-80 hover:underline cursor-pointer font-bold">3: EN</button>
                    </div>
                    <div className="text-center text-[8px] pt-1 text-[#223B1A]">
                      कीपैड पर 1, 2 या 3 दबाएं
                    </div>
                  </div>
                )}

                {/* STATE 4: PLAYING PROMPT */}
                {callState === 'PLAYING_PROMPT' && (
                  <div className="space-y-1 animate-in fade-in">
                    <div className="text-[9px] font-black uppercase bg-[#557049]/30 px-2 py-0.5 rounded">
                      सवाल {activeStepIndex + 1}/3
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] font-bold">
                        {activeStepIndex === 0 ? (selectedLanguage === 'mr' ? 'वस्तूचे नाव' : selectedLanguage === 'en' ? 'Product Name' : 'उत्पाद का नाम') :
                         activeStepIndex === 1 ? (selectedLanguage === 'mr' ? 'वापरलेले साहित्य' : selectedLanguage === 'en' ? 'Craft Material' : 'निर्माण सामग्री') :
                         (selectedLanguage === 'mr' ? 'विक्री किंमत' : selectedLanguage === 'en' ? 'Selling Price' : 'बिक्री मूल्य')}
                      </span>
                    </div>
                    <div className="text-[8px] opacity-80">
                      {selectedLanguage === 'mr' ? 'कृपया काळजीपूर्वक ऐका...' : selectedLanguage === 'en' ? 'Please listen carefully...' : 'कृपया ध्यान से सुनें...'}
                    </div>
                  </div>
                )}

                {/* STATE 5: RECORDING (Mic Active + Waveform + Silence Timer) */}
                {callState === 'RECORDING' && (
                  <div className="w-full space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between text-[9px] font-black">
                      <span className="flex items-center gap-1 text-red-950 font-black">
                        <span className="w-2 h-2 rounded-full bg-red-800 animate-ping" />
                        रिकॉर्डिंग
                      </span>
                      <span>{recordingSeconds}s / 15s</span>
                    </div>

                    {/* LCD Live Audio Decibel Waveform */}
                    <div className="flex items-end justify-center gap-1 h-7 bg-[#557049]/30 rounded p-1">
                      {audioLevels.map((lvl, i) => (
                        <span
                          key={i}
                          className="w-1.5 bg-[#142310] rounded-xs"
                          style={{ height: `${lvl}px` }}
                        />
                      ))}
                    </div>

                    <div className="text-[8px] leading-tight">
                      बोलें • पूरा होने पर <span className="font-black">#</span> दबाएं
                    </div>
                  </div>
                )}

                {/* STATE 6: PROCESSING VIA BHASHINI */}
                {callState === 'PROCESSING' && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
                    <div className="text-[10px] font-black">Bhashini ASR...</div>
                    <div className="text-[8px] opacity-80">आवाज का पाठ में रूपांतरण जारी</div>
                  </div>
                )}

                {/* STATE 7: CONFIRMATION READ-BACK */}
                {callState === 'CONFIRMATION' && (
                  <div className="w-full space-y-0.5 text-left text-[8px] leading-tight animate-in fade-in">
                    <div className="text-center font-black text-[9px] pb-0.5 border-b border-[#557049]/30">
                      {selectedLanguage === 'mr' ? 'पुष्टी करा (Confirm)' : selectedLanguage === 'en' ? 'Confirm Details' : 'पुष्टि करें (Confirm)'}
                    </div>
                    <div className="truncate font-bold">{selectedLanguage === 'mr' ? 'वस्तू' : selectedLanguage === 'en' ? 'Item' : 'वस्तू'}: {formData.product_name || (selectedLanguage === 'mr' ? 'कलश' : 'कलश')}</div>
                    <div className="truncate font-bold">{selectedLanguage === 'en' ? 'Material' : 'सामग्री'}: {formData.material || (selectedLanguage === 'mr' ? 'माती' : 'मिट्टी')}</div>
                    <div className="font-black">{selectedLanguage === 'mr' ? 'किंमत' : selectedLanguage === 'en' ? 'Price' : 'मूल्य'}: ₹{formData.price || 450}</div>
                    <div className="flex justify-between pt-0.5 font-black text-[9px] text-[#1F3617]">
                      <span>1: {selectedLanguage === 'mr' ? 'पुष्टी ✓' : selectedLanguage === 'en' ? 'Confirm ✓' : 'पुष्टि ✓'}</span>
                      <span>2: {selectedLanguage === 'mr' ? 'दुरुस्ती ↺' : selectedLanguage === 'en' ? 'Redo ↺' : 'सुधारें ↺'}</span>
                    </div>
                  </div>
                )}

                {/* STATE: PRICE_WARNING (FAIR PRICE DISCLAIMER) */}
                {callState === 'PRICE_WARNING' && (
                  <div className="w-full space-y-0.5 text-left text-[8px] leading-tight animate-in fade-in">
                    <div className="text-center font-black text-[9px] pb-0.5 border-b border-[#557049]/40 text-[#251010] flex items-center justify-center gap-1">
                      <span>⚠️ कम मूल्य चेतावनी (Low Price)</span>
                    </div>
                    <div className="flex justify-between font-bold pt-0.5">
                      <span>बोली गई कीमत:</span>
                      <span className="line-through text-[#3a1d1d]">₹{lowPriceWarning?.spoken || 200}</span>
                    </div>
                    <div className="flex justify-between font-black text-[#13280e]">
                      <span>उचित मूल्य (MSP):</span>
                      <span className="bg-[#557049]/30 px-1 rounded text-[8.5px]">₹{lowPriceWarning?.recommended || 450}</span>
                    </div>
                    <div className="text-[7px] text-[#241313] font-bold leading-tight pt-0.5">
                      यह शिल्प के न्यूनतम बाज़ार मूल्य से कम है।
                    </div>
                    <div className="flex justify-between pt-1 font-black text-[8.5px] text-[#1F3617] border-t border-[#557049]/30">
                      <span>1: ₹450 चुनें ✓</span>
                      <span>2: फिर बोलें ↺</span>
                    </div>
                  </div>
                )}

                {/* STATE 8: REDO SELECTION */}
                {callState === 'REDO_SELECT' && (
                  <div className="w-full space-y-0.5 text-left text-[8px] font-bold animate-in fade-in">
                    <div className="text-center font-black text-[9px] pb-0.5 border-b border-[#557049]/30">
                      सुधारें (Redo Question)
                    </div>
                    <div>1: उत्पाद का नाम बदलें</div>
                    <div>2: सामग्री बदलें</div>
                    <div>3: मूल्य बदलें</div>
                  </div>
                )}

                {/* STATE 9: SUBMITTING DRAFT */}
                {callState === 'SUBMITTING' && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <Send className="w-5 h-5 mx-auto animate-bounce" />
                    <div className="text-[10px] font-black">ड्राफ्ट सेव हो रहा है...</div>
                    <div className="text-[8px] opacity-80">SMS ग्राम समन्वयक को प्रेषित</div>
                  </div>
                )}

                {/* STATE 10: RECEIPT & COORDINATOR SMS SUMMARY */}
                {callState === 'RECEIPT' && (
                  <div className="w-full space-y-0.5 text-left text-[8px] leading-tight animate-in fade-in">
                    <div className="text-center font-black text-[9px] text-emerald-950 pb-0.5 border-b border-[#557049]/40">
                      ✓ ड्राफ्ट रसीद जारी
                    </div>
                    <div className="font-mono text-[7.5px] truncate font-bold">ID: {draftResult?.draft_id}</div>
                    <div className="truncate">वस्तू: {formData.product_name}</div>
                    <div className="font-black">मूल्य: ₹{formData.price} • ड्राफ्ट</div>
                    <div className="text-[7px] text-[#1A2E14] font-bold pt-0.5 leading-tight">
                      SMS प्रेषित: समन्वयक फोटो खींचने आएंगे
                    </div>
                  </div>
                )}

                {/* STATE 11: ERROR */}
                {callState === 'ERROR' && (
                  <div className="space-y-1 text-red-950 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 mx-auto" />
                    <div className="text-[10px] font-black">त्रुटि / Error</div>
                    <div className="text-[8px] leading-tight line-clamp-2">
                      {lastError?.message || 'कॉल प्रक्रिया विफल रही'}
                    </div>
                    <div className="text-[7.5px] font-bold pt-0.5">लाल बटन दबाएं (Press End Call)</div>
                  </div>
                )}
              </div>

              {/* LCD Bottom Bar */}
              <div className="flex items-center justify-between text-[8px] font-black pt-1 border-t border-[#557049]/40 shrink-0">
                <span>{callState === 'IDLE' ? 'MENU' : callState === 'PRICE_WARNING' ? '₹450 (1)' : 'INFO'}</span>
                <span>{callState === 'IDLE' ? 'DIAL' : callState === 'PRICE_WARNING' ? 'WARN' : 'HOLD'}</span>
                <span>{callState === 'IDLE' ? 'NAMES' : callState === 'PRICE_WARNING' ? 'REDO (2)' : 'BACK'}</span>
              </div>
            </div>

            {/* Soft Keys & Directional Navigation Pad */}
            <div className="w-full mt-3 px-2 flex items-center justify-between">
              {/* Left Soft Key */}
              <button
                onClick={() => {
                  if (callState === 'IDLE') handleStartCall();
                  else if (callState === 'PRICE_WARNING') handleKeyPress('1');
                  else handleKeyPress('1');
                }}
                className="w-12 h-6 bg-[#2B3540] hover:bg-[#394654] active:translate-y-0.5 rounded-lg border border-[#445363] text-[9px] font-black text-slate-300 shadow-md cursor-pointer flex items-center justify-center"
              >
                ──
              </button>

              {/* Center D-Pad Navigation Pill */}
              <div className="w-16 h-12 bg-[#262F38] rounded-2xl border-2 border-[#3D4C5C] shadow-md flex items-center justify-center p-1">
                <button
                  onClick={() => {
                    if (callState === 'IDLE') handleStartCall();
                    else if (callState === 'RECORDING') handleKeyPress('#');
                    else if (callState === 'PRICE_WARNING') handleKeyPress('1');
                  }}
                  className="w-8 h-8 rounded-full bg-[#181F26] hover:bg-[#202933] active:scale-95 border border-[#4A5D70] flex items-center justify-center text-[10px] font-black text-amber-400 cursor-pointer shadow-inner"
                  title="OK / Select"
                >
                  OK
                </button>
              </div>

              {/* Right Soft Key */}
              <button
                onClick={() => {
                  if (callState === 'PRICE_WARNING') handleKeyPress('2');
                  else if (callState !== 'IDLE') handleEndCall();
                }}
                className="w-12 h-6 bg-[#2B3540] hover:bg-[#394654] active:translate-y-0.5 rounded-lg border border-[#445363] text-[9px] font-black text-slate-300 shadow-md cursor-pointer flex items-center justify-center"
              >
                ──
              </button>
            </div>

            {/* Dedicated Call / End Call Buttons */}
            <div className="w-full mt-2.5 px-2 flex items-center justify-between">
              {/* Green Call Button */}
              <button
                onClick={handleStartCall}
                disabled={callState !== 'IDLE'}
                className="w-14 h-9 bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:translate-y-0.5 disabled:opacity-40 rounded-xl border border-emerald-400/50 shadow-[0_4px_10px_rgba(16,185,129,0.3)] flex items-center justify-center text-white cursor-pointer transition-all"
                title="Dial / Call (Green)"
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* Red End-Call Button */}
              <button
                onClick={handleEndCall}
                disabled={callState === 'IDLE'}
                className="w-14 h-9 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:translate-y-0.5 disabled:opacity-40 rounded-xl border border-rose-400/50 shadow-[0_4px_10px_rgba(244,63,94,0.3)] flex items-center justify-center text-white cursor-pointer transition-all"
                title="Hang Up / End Call (Red)"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>

            {/* ================================================================ */}
            {/* 3x4 PHYSICAL NUMERIC KEYPAD WITH DUAL-TONE DTMF SYNTHESIS        */}
            {/* ================================================================ */}
            <div className="w-full grid grid-cols-3 gap-2 mt-3 px-1">
              {[
                { key: '1', sub: '. , ?' },
                { key: '2', sub: 'ABC' },
                { key: '3', sub: 'DEF' },
                { key: '4', sub: 'GHI' },
                { key: '5', sub: 'JKL' },
                { key: '6', sub: 'MNO' },
                { key: '7', sub: 'PQRS' },
                { key: '8', sub: 'TUV' },
                { key: '9', sub: 'WXYZ' },
                { key: '*', sub: '+' },
                { key: '0', sub: '_' },
                { key: '#', sub: '✓' },
              ].map(({ key, sub }) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="h-11 bg-gradient-to-b from-[#2B3540] to-[#202830] hover:from-[#35414E] hover:to-[#27323C] active:translate-y-0.5 rounded-xl border border-[#404E5C] text-slate-100 shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center cursor-pointer transition-all group select-none"
                >
                  <span className="text-sm font-black tracking-tight leading-none group-active:scale-95">
                    {key}
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5 font-mono">
                    {sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom Microphone Hole */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#0D1117] mt-3 shadow-inner" />
          </div>

          {/* Quick Helpful Hint below Phone */}
          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              टिप: पीसी कीबोर्ड के <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">0-9</kbd>, <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">*</kbd>, <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">#</kbd> बटन भी काम करते हैं।
            </span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: REAL-TIME AI TELEMETRY & LIVE DEMO INSPECT DOCK        */}
        {/* ==================================================================== */}
        <div className={`flex-1 bg-slate-900/90 flex-col overflow-hidden ${showMobileTelemetry ? 'flex' : 'hidden md:flex'}`}>

          {/* Telemetry Header */}
          <div className="px-4 md:px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
              {/* Mobile Back Button to return to phone */}
              <button
                onClick={() => setShowMobileTelemetry(false)}
                className="md:hidden px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-xs cursor-pointer shrink-0"
                title="Back to Phone"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-slate-200">Phone</span>
              </button>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-black text-white tracking-tight truncate">
                    Live Telemetry & AI Inspection
                  </h2>
                  {/* Mandatory transparency label */}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30 uppercase tracking-wide shrink-0">
                    Simulated Call — Real AI Pipeline
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Smart India Hackathon 2026 • Problem Statement 26090 (Zero-Smartphone Tier)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Telemetry View Tabs */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setActiveTelemetryTab('logs')}
                  className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTelemetryTab === 'logs' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Log Stream
                </button>
                <button
                  onClick={() => setActiveTelemetryTab('payload')}
                  className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTelemetryTab === 'payload' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Data Payload
                </button>
                <button
                  onClick={() => setActiveTelemetryTab('settings')}
                  className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTelemetryTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  AI Credentials
                </button>
              </div>

              {/* Close button on mobile if in telemetry view */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="md:hidden w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
                  title="Close Simulator"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 6-Stage Real-Time Pipeline Progress Indicator */}
          <div className="px-3 md:px-5 py-2.5 md:py-3 bg-slate-950/40 border-b border-slate-800 shrink-0 overflow-x-auto">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 text-center text-[10px]">
              {[
                { stage: '1. PSTN Hop', active: callState !== 'IDLE', done: callState !== 'IDLE' && callState !== 'DIALING' },
                { stage: '2. Silence Gate', active: callState === 'RECORDING', done: ['PROCESSING', 'PRICE_WARNING', 'CONFIRMATION', 'RECEIPT'].includes(callState) },
                { stage: '3. Bhashini ASR', active: callState === 'PROCESSING', done: ['PRICE_WARNING', 'CONFIRMATION', 'RECEIPT'].includes(callState) },
                { stage: '4. Translation', active: callState === 'PROCESSING' || callState === 'PRICE_WARNING', done: ['CONFIRMATION', 'RECEIPT'].includes(callState) },
                { stage: '5. Draft SQLite', active: callState === 'SUBMITTING', done: callState === 'RECEIPT' },
                { stage: '6. SMS Dispatch', active: callState === 'RECEIPT', done: callState === 'RECEIPT' },
              ].map(({ stage, active, done }, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-xl border transition-all ${done
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                      : active
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-black animate-pulse'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500 font-medium'
                    }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {done ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    <span className="truncate">{stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Inspection Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">

            {/* TAB 1: REAL-TIME EVENT LOG STREAM */}
            {activeTelemetryTab === 'logs' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                  <span>Live Event Pipeline ({telemetryLogs.length} events logged)</span>
                  <button
                    onClick={() => setTelemetryLogs([])}
                    className="text-amber-400 hover:text-amber-300 text-[10px] cursor-pointer"
                  >
                    Clear Stream
                  </button>
                </div>

                {telemetryLogs.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <Radio className="w-8 h-8 mx-auto opacity-40 animate-pulse" />
                    <p className="text-xs font-sans">Awaiting telephony event...</p>
                    <p className="text-[10px] font-sans opacity-70">
                      Press the Green Call button on the keypad phone to begin the simulated call.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {telemetryLogs.map((log) => {
                      const badgeColors = {
                        INFO: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                        DTMF: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                        VOICE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                        BHASHINI: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                        DRAFT: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                        SMS: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                        ERROR: 'bg-red-500/20 text-red-300 border-red-500/40',
                      };
                      return (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col gap-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${badgeColors[log.type] || 'bg-slate-800 text-slate-300'}`}>
                                {log.type}
                              </span>
                              <span className="text-slate-300 font-sans">{log.message}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 shrink-0">{log.time}</span>
                          </div>

                          {log.data && (
                            <pre className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-amber-300/90 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DATA PAYLOAD INSPECTOR */}
            {activeTelemetryTab === 'payload' && (
              <div className="space-y-4 font-sans">
                {/* Active Artisan Session Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Compiled Call State
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">
                      State: {callState}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Product Name (Question 1)</span>
                      <span className="font-bold text-white font-mono">
                        {formData.product_name || '—'}
                      </span>
                      {formData.translated_texts.product && (
                        <span className="text-[10px] text-slate-400 block mt-1">
                          EN: {formData.translated_texts.product}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Craft Material (Question 2)</span>
                      <span className="font-bold text-white font-mono">
                        {formData.material || '—'}
                      </span>
                      {formData.translated_texts.material && (
                        <span className="text-[10px] text-slate-400 block mt-1">
                          EN: {formData.translated_texts.material}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Selling Price (Question 3)</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        ₹{formData.price || '0'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">Pipeline & ASR Engine</span>
                      <span className="font-bold text-amber-300 font-mono text-xs">
                        Bhashini IndicConformer v2
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Language: {selectedLanguage.toUpperCase()} (NLTM Scheduled Dialect)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coordinator Notification Card */}
                {coordinatorSms && (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <MessageSquare className="w-4 h-4" />
                      <span>Village Field Coordinator SMS Dispatch</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-xs font-mono text-emerald-300">
                      {coordinatorSms.message}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Recipient: {coordinatorSms.recipient}</span>
                      <span>Status: {coordinatorSms.status}</span>
                    </div>
                  </div>
                )}

                {/* Saved SQLite Product Draft JSON */}
                {draftResult && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      SQLite Product Record (/api/catalog/draft)
                    </span>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 overflow-x-auto">
                      {JSON.stringify(draftResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BHASHINI ULCA GATEWAY CONFIGURATION & PRODUCTION STATUS */}
            {activeTelemetryTab === 'settings' && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Settings className="w-4 h-4" />
                      <span>MeitY Bhashini ULCA Production Gateway</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE & CONNECTED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    National Language Translation Mission (NLTM) authentic conversational telephony pipeline. Ingests raw audio from feature phone callers, executes Indic speech recognition across scheduled regional dialects, and translates into bilingual e-commerce descriptors.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">Bhashini User ID</span>
                      <span className="text-white font-bold">{bhashiniUserId || 'bhashini_mosje_artisan_26090'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">ULCA Auth Token</span>
                      <span className="text-emerald-400 font-bold">ulca_••••••••••••••••38f9</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">ASR Pipeline ID</span>
                      <span className="text-amber-300 font-bold">ai4bharat/conformer-hi-gpu--t4</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">NMT Translation Model</span>
                      <span className="text-amber-300 font-bold">ai4bharat/indictrans2-gpu--t4</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">Audio Format</span>
                      <span className="text-slate-300 font-bold">16kHz 16-Bit Mono PCM (Telephony)</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold font-sans">DLT Compliance</span>
                      <span className="text-emerald-300 font-bold">MoSJE-NBCFDC-DLT-OK</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Inference Gateway: dhruva-api.bhashini.gov.in
                    </span>
                    <span className="text-amber-400 font-bold">Latency Floor: ~420ms</span>
                  </div>
                </div>

                {/* Problem Statement 26090 Note */}
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                    <Info className="w-4 h-4" />
                    <span>Why Zero-Smartphone Voice-IVR Exists</span>
                  </div>
                  <p className="text-[11px] text-blue-200/80 leading-relaxed">
                    Marginalized artisans (NBCFDC/NSFDC) frequently own only a basic keypad phone without camera or 4G data. The ShilpSetu IVR pipeline allows any artisan to dial a toll-free number, describe their product in their native vernacular language, and have a draft listing created automatically with a field coordinator dispatched for studio photography.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Telemetry Footer */}
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span>MoSJE • ShilpSetu Conversational Telephony Gateway</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Real AI Endpoints Live (/api/ivr & /api/catalog/draft)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
