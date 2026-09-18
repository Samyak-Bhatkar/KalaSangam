import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Volume2, ArrowLeft, ArrowRight, Sparkles,
  AlertTriangle, CheckCircle, Languages, RefreshCw, Edit3,
  WifiOff, ShieldAlert, Loader2, Radio
} from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

// ─── Bhashini ASR Config ────────────────────────────────────────────────────
// Set VITE_BHASHINI_API_KEY and VITE_BHASHINI_USER_ID in frontend/.env.local
const BHASHINI_API_KEY   = import.meta.env.VITE_BHASHINI_API_KEY   || '';
const BHASHINI_USER_ID   = import.meta.env.VITE_BHASHINI_USER_ID   || '';
const BHASHINI_PIPELINE_ID = import.meta.env.VITE_BHASHINI_PIPELINE_ID || 'ai4bharat/conformer-hi-gpu--t4';

// Bhashini language codes for each dialect
const BHASHINI_LANG_CODES = {
  hi:        'hi',
  bhojpuri:  'bho',
  bundeli:   'hi',   // mapped to hi — closest supported
  malwi:     'hi',
  mr:        'mr',
  bn:        'bn',
  en:        'en',
};

/**
 * Call Bhashini ASR API with a recorded audio blob.
 * Returns transcribed text or null on failure.
 */
async function callBhashiniASR(audioBlob, langCode = 'hi') {
  if (!BHASHINI_API_KEY || !BHASHINI_USER_ID) return null;

  try {
    // Step 1: Get pipeline config from Ulca
    const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userID': BHASHINI_USER_ID,
        'ulcaApiKey': BHASHINI_API_KEY,
      },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'asr', config: { language: { sourceLanguage: langCode } } }],
        pipelineRequestConfig: { pipelineId: BHASHINI_PIPELINE_ID },
      }),
    });

    if (!configRes.ok) return null;
    const configData = await configRes.json();
    const serviceUrl  = configData?.pipelineInferenceAPIEndPoint?.inferenceApiEndPoint?.callbackUrl;
    const callbackKey = configData?.pipelineInferenceAPIEndPoint?.inferenceApiEndPoint?.authorizationKey;

    if (!serviceUrl) return null;

    // Step 2: Convert audio blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio  = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Step 3: Inference call
    const inferRes = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: callbackKey,
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'asr',
          config: { language: { sourceLanguage: langCode }, audioFormat: 'wav', samplingRate: 16000 },
        }],
        inputData: {
          audio: [{ audioContent: base64Audio }],
        },
      }),
    });

    if (!inferRes.ok) return null;
    const inferData = await inferRes.json();
    const text = inferData?.pipelineResponse?.[0]?.output?.[0]?.source?.trim();
    return text || null;
  } catch (err) {
    console.warn('[Bhashini ASR] Error:', err);
    return null;
  }
}

// ─── Mic permission check utility ───────────────────────────────────────────
async function checkMicPermission() {
  if (!navigator.permissions) return 'unknown';
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown';
  }
}

// ─── Dialect definitions ─────────────────────────────────────────────────────
const DIALECTS = [
  { code: 'hi',       label: 'Hindi',    badge: 'हि',   langCode: 'hi-IN', region: 'मानक हिन्दी' },
  { code: 'bhojpuri', label: 'Bhojpuri', badge: 'भोज', langCode: 'hi-IN', region: 'गोरखपुर / पूर्वांचल' },
  { code: 'bundeli',  label: 'Bundeli',  badge: 'बु',  langCode: 'hi-IN', region: 'चंदेरी / बुंदेलखंड' },
  { code: 'malwi',    label: 'Malwi',    badge: 'म',   langCode: 'hi-IN', region: 'मालवा / मध्य प्रदेश' },
  { code: 'mr',       label: 'Marathi',  badge: 'मरा', langCode: 'mr-IN', region: 'महाराष्ट्र' },
  { code: 'bn',       label: 'Bengali',  badge: 'বাং', langCode: 'bn-IN', region: 'पश्चिम बंगाल' },
  { code: 'en',       label: 'English',  badge: 'EN',  langCode: 'en-IN', region: 'Export Pitch' },
];

// ─── Craft voice presets ──────────────────────────────────────────────────────
const CRAFT_VOICE_PRESETS = {
  terracotta: {
    hi: 'यह गोरखपुर का हस्तनिर्मित टेराकोटा मिट्टी का कलश और हांडी है। तालाब की शुद्ध मिट्टी से चाक पर बनाया है। नक्काशी करने और पकाने में 6 घंटे लगे हैं। कच्चा माल ₹180 का लगा है।',
    bhojpuri: 'ई गोरखपुर के शुद्ध लाल माटी के कलश आ हांडी ह। चाक पर हाथ से 6 घंटा में गढ़ले बानी। भट्ठी में पकाइल गइल बा, माटी आ ईंधन के खरच ₹180 लागल बा।',
    bundeli: 'ई हमार हाथ से बनो टेराकोटा को कलश है। चाक पै 6 घंटा मेहनत करी, भट्टी में पकाय के त्यार करो है। लागत करीब 180 रुपिया आई है।',
    malwi: 'म्हारा हाथ सू बणायो विशुद्ध माटी को कलश अर हांडी छे। 6 घंटा री मेहनत लागी, ₹180 रो खर्चो आयो।',
    mr: 'हे अस्सल मातीचे पारंपरिक भांडे व कलश आहे. चाकावर हाताने घडवले असून 6 तास लागले. कच्चा माल ₹180 चा आहे.',
    bn: 'এটি খাঁটি পোড়ামাটির ঐতিহ্যবাহী মাটির হাঁড়ি ও কলসি। চাকায় ঘুরিয়ে তৈরি করতে ৬ ঘণ্টা সময় লেগেছে, খরচ ₹১৮০।',
    en: 'This is a handcrafted Gorakhpur terracotta clay cooking handi pot. Wheel-thrown using pure riverbed clay, kiln-fired for 6 hours. Material cost is around ₹180.',
  },
  saree: {
    hi: 'यह शुद्ध चंदेरी सिल्क की हाथ से बुनी ज़री साड़ी है। हथकरघे पर 18 घंटे की बुनाई से तैयार हुई है। शुद्ध जरी और रेशम का खर्च ₹1400 आया है।',
    bhojpuri: 'ई शुद्ध चंदेरी सिल्क के हाथ से बीनल जरी साड़ी ह। 18 घंटा के मिहनत से बनल बा। कच्चा सिल्क आ जरी के खरच ₹1400 आइल बा।',
    bundeli: 'ई हमार हथकरघा पै बुनी चंदेरी सिल्क की साड़ी है। 18 घंटा को काम है, जरी और रेशम ₹1400 को लगो है।',
    malwi: 'म्हारी चंदेरी सिल्क री साड़ी छे, 18 घंटा हथकरघा पै काम करयो, जरी अर रेशम रो खर्चो ₹1400 आयो।',
    mr: 'ही अस्सल चंदेरी सिल्क हातमाग साडी आहे. 18 तास विणकाम केले असून कच्चा माल ₹1400 चा लागला आहे.',
    bn: 'এটি খাঁটি চান্দেরি সিল্ক জরি শাড়ি। তাঁতে ১৮ ঘণ্টা বুনে তৈরি করা হয়েছে। সুতো ও জরির খরচ ₹১৪০০।',
    en: 'This is an authentic handwoven Chanderi silk saree with pure zari border. Crafted on traditional pit looms over 18 hours. Raw silk and metallic zari cost around ₹1400.',
  },
  dhokra: {
    hi: 'यह बस्तर का पारंपरिक ढोकरा शिल्प है। मोम के धागे और पीतल ढालकर बनाया है। 12 घंटे की मेहनत लगी है। कच्चा माल ₹480 का है।',
    bhojpuri: 'ई बस्तर के पारंपरिक ढोकरा शिल्प ह। मोम के धागा आ पीतल ढाल के 12 घंटा में बनवले बानी। खरच ₹480 बा।',
    bundeli: 'ई बस्तर को ढोकरा शिल्प है। मोम और पीतल से 12 घंटा में त्यार करो है। कच्चो माल ₹480 को लगो है।',
    malwi: 'म्हारो बस्तर ढोकरा शिल्प छे, 12 घंटा लाग्या, ₹480 रो पीतल अर मोम लाग्यो।',
    mr: 'हे बस्तरचे पारंपरिक ढोकरा पितळी शिल्प आहे. 12 तास मेहनत लागली असून खर्च ₹480 झाला आहे.',
    bn: 'এটি বাস্তার ডোকরা ঐতিহ্যবাহী ধাতব শিল্পকলা। তৈরি করতে ১২ ঘণ্টা সময় লেগেছে, কাঁচামাল ₹৪৮০।',
    en: 'This is an authentic Bastar Dhokra lost-wax cast bell metal sculpture. Crafted by tribal artisans over 12 hours. Raw brass and wax cost ₹480.',
  },
  madhubani: {
    hi: 'यह मिथिला की पारंपरिक कल्पवृक्ष मधुबनी पेंटिंग है। बांस की तीली और प्राकृतिक रंगों से 10 घंटे में बनाई है। खर्च ₹250 है।',
    bhojpuri: 'ई मिथिला के कल्पवृक्ष मधुबनी पेंटिंग ह। बांस के तीली आ प्राकृतिक रंग से 10 घंटा में बनवले बानी। खरच ₹250 आइल बा।',
    bundeli: 'ई मधुबनी पेंटिंग है। बांस की तीली और कुदरती रंगन से 10 घंटा में बनाई है। खर्च ₹250 है।',
    malwi: 'म्हारी कल्पवृक्ष मधुबनी पेंटिंग छे, 10 घंटा में बणाई, ₹250 रो खर्चो आयो।',
    mr: 'ही पारंपरिक मधुबनी कल्पवृक्ष पेंटिंग आहे. नैसर्गिक रंगांनी 10 तासात रेखाटली असून खर्च ₹250 आहे.',
    bn: 'এটি ঐতিহ্যবাহী মধুবনী কল্পবৃক্ষ লোকশিল্প। প্রাকৃতিক রঙে আঁকতে ১০ ঘণ্টা সময় লেগেছে, খরচ ₹২৫০।',
    en: 'This is an authentic Mithila Madhubani Tree of Life folk painting. Hand-painted using bamboo twigs and botanical pigments over 10 hours. Cost is ₹250.',
  },
};

// ─── Mic error types ──────────────────────────────────────────────────────────
const MIC_ERRORS = {
  NOT_ALLOWED: 'not-allowed',
  NOT_SUPPORTED: 'not-supported',
  NETWORK: 'network',
  NO_SPEECH: 'no-speech',
  BHASHINI_PROCESSING: 'bhashini-processing',
  BHASHINI_DONE: 'bhashini-done',
};

export default function VoiceRecorder() {
  const {
    language,
    selectedPreset,
    transcript,
    setTranscript,
    setCurrentStep,
    speakVoice,
    processCaptureAndVoice,
    isProcessing,
    processStatusText,
    rawImageUrl,
  } = useArtisan();

  // ── State ──────────────────────────────────────────────────────────────────
  const [isListening,      setIsListening]      = useState(false);
  const [micState,         setMicState]         = useState('idle'); // 'idle'|'requesting'|'live'|'recording'|'processing'|'error'
  const [micError,         setMicError]         = useState(null);   // null | MIC_ERRORS.*
  const [audioLevels,      setAudioLevels]      = useState(Array(10).fill(4));
  const [activeDialect,    setActiveDialect]    = useState('hi');
  const [hasSpeechResult,  setHasSpeechResult]  = useState(false);
  const [bhashiniMode,     setBhashiniMode]     = useState(false);  // switched to Bhashini recording
  const [bhashiniStatus,   setBhashiniStatus]   = useState('');

  // ── Refs ───────────────────────────────────────────────────────────────────
  const recognitionRef    = useRef(null);
  const mediaRecorderRef  = useRef(null);
  const audioContextRef   = useRef(null);
  const analyserRef       = useRef(null);
  const animFrameRef      = useRef(null);
  const streamRef         = useRef(null);
  const bhashiniChunksRef = useRef([]);

  // ── Derived helpers ────────────────────────────────────────────────────────
  const getActiveCraftType = () => {
    const cat = (selectedPreset?.craft_category || '').toLowerCase();
    const id  = (selectedPreset?.id || '').toLowerCase();
    if (cat.includes('textile') || id.includes('001') || cat.includes('saree'))   return 'saree';
    if (cat.includes('metal')   || id.includes('003') || cat.includes('dhokra'))  return 'dhokra';
    if (cat.includes('paint')   || id.includes('004') || cat.includes('madhubani')) return 'madhubani';
    return 'terracotta';
  };

  const currentVoiceSamples = CRAFT_VOICE_PRESETS[getActiveCraftType()];
  const currentDialect = DIALECTS.find(d => d.code === activeDialect) || DIALECTS[0];
  const hasBhashini = Boolean(BHASHINI_API_KEY && BHASHINI_USER_ID);
  // Regional dialects (non-Hindi-standard) benefit from Bhashini
  const isRegionalDialect = ['bhojpuri', 'bundeli', 'malwi', 'mr', 'bn'].includes(activeDialect);

  // ── On mount: prefill transcript ──────────────────────────────────────────
  useEffect(() => {
    if (!transcript) {
      setTranscript(currentVoiceSamples[activeDialect] || currentVoiceSamples.hi);
    }
    const promptText = language === 'hi'
      ? 'कृपया अपने शिल्प के बारे में बोलें - सामग्री, बनाने का समय और लागत बताएं।'
      : 'Please describe your craft — mention materials, hours invested, and raw material cost.';
    speakVoice(promptText, language === 'hi' ? 'hi-IN' : 'en-IN');
    return () => { cleanupAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Real audio visualizer using actual mic stream ─────────────────────────
  const startAudioVisualizer = useCallback(async (existingStream = null) => {
    try {
      const stream = existingStream || await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (!existingStream) streamRef.current = stream;

      const audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
      const analyser   = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source     = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current     = analyser;

      const dataArray     = new Uint8Array(analyser.frequencyBinCount);
      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 10)).map(v => Math.max(4, Math.min(48, v / 4)));
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
      return stream;
    } catch {
      // ⚠️ Real mic access failed — show flat bars (no fake waveform)
      setAudioLevels(Array(10).fill(4));
      return null;
    }
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevels(Array(10).fill(4));
  }, []);

  const stopMicStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const cleanupAll = useCallback(() => {
    // Stop Web Speech
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    // Stop MediaRecorder (Bhashini)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }
    stopAudioVisualizer();
    stopMicStream();
    setIsListening(false);
    setMicState('idle');
  }, [stopAudioVisualizer, stopMicStream]);

  // ── Web Speech API (browser-native, works on localhost/HTTPS) ────────────
  const startWebSpeech = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError(MIC_ERRORS.NOT_SUPPORTED);
      setMicState('error');
      setIsListening(false);
      return;
    }

    // Request mic + start visualizer together
    setMicState('requesting');
    const permission = await checkMicPermission();
    if (permission === 'denied') {
      setMicError(MIC_ERRORS.NOT_ALLOWED);
      setMicState('error');
      setIsListening(false);
      return;
    }

    const stream = await startAudioVisualizer();
    if (!stream && permission !== 'unknown') {
      setMicError(MIC_ERRORS.NOT_ALLOWED);
      setMicState('error');
      setIsListening(false);
      return;
    }
    streamRef.current = stream;

    const recognition      = new SpeechRecognition();
    recognition.lang       = currentDialect.langCode;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setMicState('live');
      setMicError(null);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      const spoken = (finalText || interimText).trim();
      if (spoken) {
        setTranscript(spoken);
        setHasSpeechResult(true);
      }
    };

    recognition.onerror = (e) => {
      console.warn('[WebSpeech] Error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        setMicError(MIC_ERRORS.NOT_ALLOWED);
        setMicState('error');
        setIsListening(false);
        stopAudioVisualizer();
        stopMicStream();
      } else if (e.error === 'no-speech') {
        // Timeout — not an error, user just didn't speak yet
        setMicState('live');
      } else if (e.error === 'network') {
        setMicError(MIC_ERRORS.NETWORK);
        setMicState('error');
        setIsListening(false);
      } else {
        setMicState('live'); // other errors — keep trying
      }
    };

    recognition.onend = () => {
      // Auto-restart if still in "live" state (continuous listening)
      if (isListening && micState === 'live') {
        try { recognition.start(); } catch {}
      } else {
        setIsListening(false);
        setMicState('idle');
        stopAudioVisualizer();
        stopMicStream();
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn('[WebSpeech] Start failed:', err);
      setMicError(MIC_ERRORS.NOT_ALLOWED);
      setMicState('error');
      setIsListening(false);
      stopAudioVisualizer();
      stopMicStream();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDialect, currentDialect, startAudioVisualizer, stopAudioVisualizer, stopMicStream]);

  // ── Bhashini ASR (MediaRecorder → send blob → get transcript) ────────────
  const startBhashiniRecording = useCallback(async () => {
    setMicState('requesting');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 }, video: false });
    } catch {
      setMicError(MIC_ERRORS.NOT_ALLOWED);
      setMicState('error');
      setIsListening(false);
      return;
    }

    streamRef.current = stream;
    await startAudioVisualizer(stream);

    bhashiniChunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) bhashiniChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stopAudioVisualizer();
      stopMicStream();
      setMicState('processing');
      setBhashiniStatus('Bhashini ASR सुन रहा है...');

      const audioBlob = new Blob(bhashiniChunksRef.current, { type: 'audio/webm' });
      const bhashiniLang = BHASHINI_LANG_CODES[activeDialect] || 'hi';
      const text = await callBhashiniASR(audioBlob, bhashiniLang);

      if (text) {
        setTranscript(text);
        setHasSpeechResult(true);
        setBhashiniStatus('✓ Bhashini ने सफलतापूर्वक सुना');
        setMicError(MIC_ERRORS.BHASHINI_DONE);
      } else {
        setBhashiniStatus('Bhashini transcript failed — showing sample text.');
      }
      setMicState('idle');
      setIsListening(false);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setMicState('live');
    setMicError(null);
  }, [activeDialect, startAudioVisualizer, stopAudioVisualizer, stopMicStream]);

  const stopBhashiniRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Main toggle logic ──────────────────────────────────────────────────────
  const toggleListening = useCallback(async () => {
    if (isListening) {
      // Stop
      if (bhashiniMode) {
        stopBhashiniRecording();
      } else {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          recognitionRef.current = null;
        }
        stopAudioVisualizer();
        stopMicStream();
        setIsListening(false);
        setMicState('idle');
      }
      return;
    }

    // Start — decide Web Speech vs Bhashini
    setIsListening(true);
    setMicError(null);
    setHasSpeechResult(false);

    // Use Bhashini if: key is present AND (regional dialect OR user toggled Bhashini mode)
    const useBhashini = hasBhashini && (bhashiniMode || isRegionalDialect);
    if (useBhashini) {
      await startBhashiniRecording();
    } else {
      await startWebSpeech();
    }
  }, [
    isListening, bhashiniMode, isRegionalDialect, hasBhashini,
    startBhashiniRecording, startWebSpeech,
    stopBhashiniRecording, stopAudioVisualizer, stopMicStream,
  ]);

  // ── Dialect change ─────────────────────────────────────────────────────────
  const handleDialectChange = (d) => {
    if (isListening) cleanupAll();
    setActiveDialect(d.code);
    const sample = currentVoiceSamples[d.code] || currentVoiceSamples.hi;
    setTranscript(sample);
    speakVoice(sample, d.langCode);
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  // ── Misc handlers ──────────────────────────────────────────────────────────
  const playCurrentTranscript = () => {
    if (!transcript) return;
    speakVoice(transcript, currentDialect.langCode);
  };

  const handleProceed = () => {
    cleanupAll();
    const effectiveText = transcript || currentVoiceSamples.hi;
    processCaptureAndVoice(null, effectiveText);
  };

  const resetTranscript = () => {
    setTranscript(currentVoiceSamples[activeDialect] || currentVoiceSamples.hi);
    setHasSpeechResult(false);
    setMicError(null);
    setMicState('idle');
  };

  const craftImageSrc = rawImageUrl || '/terracotta_pot_raw.png';

  // ── Beautiful error banner component ──────────────────────────────────────
  const renderMicErrorBanner = () => {
    if (micState === 'processing') {
      return (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-sm">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
          <div>
            <p className="text-xs font-black text-indigo-900">Bhashini ASR Processing</p>
            <p className="text-[10px] text-indigo-700 font-medium">{bhashiniStatus}</p>
          </div>
        </div>
      );
    }

    if (micError === MIC_ERRORS.BHASHINI_DONE) {
      return (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-black text-emerald-900">Bhashini ने सफलतापूर्वक सुना!</p>
            <p className="text-[10px] text-emerald-700 font-medium">{bhashiniStatus}</p>
          </div>
        </div>
      );
    }

    if (micError === MIC_ERRORS.NOT_ALLOWED) {
      return (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-rose-900">
              {language === 'hi' ? 'माइक्रोफ़ोन अनुमति अवरुद्ध है' : 'Microphone Access Blocked'}
            </p>
            <p className="text-[10px] text-rose-700 font-medium leading-relaxed">
              {language === 'hi'
                ? 'Chrome में URL बार के बाईं ओर 🔒 आइकन टैप करें → Site Settings → Microphone → Allow करें। फिर पेज रीलोड करें।'
                : 'Tap the 🔒 icon in your browser URL bar → Site Settings → Microphone → Allow. Then reload the page.'}
            </p>
          </div>
        </div>
      );
    }

    if (micError === MIC_ERRORS.NOT_SUPPORTED) {
      return (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-900">
              {language === 'hi' ? 'ब्राउज़र वाक् इंजन उपलब्ध नहीं' : 'Browser Speech Engine Unavailable'}
            </p>
            <p className="text-[10px] text-amber-700 font-medium">
              {language === 'hi'
                ? 'Chrome या Edge उपयोग करें। या नीचे सीधे टाइप करें।'
                : 'Use Chrome or Edge browser, or type your description directly below.'}
            </p>
          </div>
        </div>
      );
    }

    if (micError === MIC_ERRORS.NETWORK) {
      return (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-slate-100 border border-slate-300 shadow-sm">
          <WifiOff className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-slate-900">
              {language === 'hi' ? 'नेटवर्क त्रुटि (Speech API)' : 'Network Error — Speech API'}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              {language === 'hi'
                ? 'इंटरनेट कनेक्शन जांचें या नीचे टाइप करें।'
                : 'Check your internet connection or type directly below.'}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#FDFBF7] text-slate-900 p-5 select-none overflow-y-auto font-sans">

      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { cleanupAll(); setCurrentStep(1); }}
            className="flex items-center gap-1 text-slate-700 hover:text-slate-950 text-xs font-bold py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कैमरा' : 'Camera'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black shadow-xs">
              2
            </span>
            <span className="text-xs font-black tracking-tight uppercase text-slate-900">
              {language === 'hi' ? 'दूसरा चरण: बोलकर विवरण दें' : 'Step 2: Vernacular Voice'}
            </span>
          </div>

          <button
            onClick={playCurrentTranscript}
            aria-label="Replay Audio Instruction"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-700 hover:text-amber-800 shadow-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Craft Thumbnail */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 mb-3 flex items-center gap-3 shadow-xs">
          <img
            src={craftImageSrc}
            alt="Craft Preview"
            onError={(e) => { e.target.onerror = null; e.target.src = '/terracotta_pot_raw.png'; }}
            className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                Raw Capture • AI स्टूडियो में स्वच्छ होगी
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {selectedPreset?.title_hi || 'पारंपरिक हस्तनिर्मित शिल्प'}
            </h4>
          </div>
        </div>

        {/* Dialect Pills */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
            <span className="flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              बोली / Dialect चुनें:
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <Radio className="w-3 h-3" />
              {hasBhashini ? 'Bhashini ASR + Browser' : 'Browser Web Speech'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DIALECTS.map(d => (
              <button
                key={d.code}
                onClick={() => handleDialectChange(d)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                  activeDialect === d.code
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                  {d.badge}
                </span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          {/* Bhashini mode toggle (only shown if key is available OR regional dialect) */}
          {(hasBhashini || isRegionalDialect) && (
            <button
              onClick={() => setBhashiniMode(v => !v)}
              className={`mt-2 text-[10px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                bhashiniMode || (hasBhashini && isRegionalDialect)
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {bhashiniMode || (hasBhashini && isRegionalDialect)
                ? '🇮🇳 Bhashini ASR Active (Regional)'
                : '🔄 Switch to Bhashini ASR'}
            </button>
          )}
        </div>
      </div>

      {/* ── Central Mic UI ────────────────────────────────────────────────── */}
      <div className="my-auto flex flex-col items-center justify-center py-2 gap-4">
        <div className="relative flex items-center justify-center">
          {/* Ripple rings — only when genuinely listening (live mic stream active) */}
          {micState === 'live' && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-amber-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/25 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Processing spinner ring */}
          {micState === 'processing' && (
            <div className="absolute w-40 h-40 rounded-full border-4 border-indigo-400/40 border-t-indigo-600 animate-spin pointer-events-none" />
          )}

          {/* The Big Mic Button */}
          <button
            id="voice-mic-btn"
            onClick={toggleListening}
            disabled={micState === 'processing'}
            aria-label={isListening ? 'Stop Recording' : 'Start Speaking'}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed ${
              micState === 'error'
                ? 'bg-gradient-to-tr from-rose-700 to-red-500 ring-8 ring-rose-500/30 shadow-rose-600/40'
                : micState === 'live'
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 ring-8 ring-rose-500/30 shadow-rose-500/40'
                : micState === 'processing'
                ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 ring-8 ring-indigo-500/30 shadow-indigo-500/40'
                : 'bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 ring-8 ring-amber-500/20 shadow-amber-500/30'
            }`}
          >
            {micState === 'requesting' ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : micState === 'processing' ? (
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            ) : micState === 'error' ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-white drop-shadow-sm" />
            )}
          </button>
        </div>

        {/* Audio Level Bars — only animate when real mic data exists */}
        <div className="flex items-center justify-center gap-1.5 h-10">
          {audioLevels.map((lvl, idx) => (
            <div
              key={idx}
              style={{ height: `${micState === 'live' ? lvl : 4}px` }}
              className={`w-2 rounded-full transition-all duration-75 ${
                micState === 'live'
                  ? 'bg-gradient-to-t from-emerald-500 via-amber-500 to-orange-600'
                  : micState === 'processing'
                  ? 'bg-indigo-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Status label */}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 text-center">
          {micState === 'requesting' && (
            <><Loader2 className="w-3 h-3 animate-spin text-amber-600" /><span className="text-amber-700">माइक्रोफ़ोन चालू हो रहा है...</span></>
          )}
          {micState === 'live' && (
            <><span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /><span className="text-red-600 font-extrabold">{language === 'hi' ? 'सुन रहे हैं... (रोकने के लिए दबाएं)' : 'Listening… (Tap to stop)'}</span></>
          )}
          {micState === 'processing' && (
            <><Loader2 className="w-3 h-3 animate-spin text-indigo-600" /><span className="text-indigo-700">Bhashini ASR Processing...</span></>
          )}
          {micState === 'idle' && !micError && (
            <span>{language === 'hi' ? 'माइक दबाएं और अपनी भाषा में बोलें' : 'Tap Mic & Speak in Your Dialect'}</span>
          )}
          {micState === 'error' && (
            <span className="text-rose-600">{language === 'hi' ? 'माइक उपलब्ध नहीं — नीचे टाइप करें' : 'Mic unavailable — Type below'}</span>
          )}
        </p>

        {/* Beautiful Error Banner */}
        {renderMicErrorBanner()}

        {/* Success badge when speech was recognized */}
        {hasSpeechResult && micState === 'idle' && !micError && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-black text-emerald-800">
              {language === 'hi' ? 'आवाज़ सफलतापूर्वक दर्ज हुई!' : 'Voice recorded successfully!'}
            </p>
          </div>
        )}
      </div>

      {/* ── Transcript Box ────────────────────────────────────────────────── */}
      <div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 mb-3 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-800 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              {language === 'hi' ? 'बोला गया विवरण (संपादन योग्य):' : 'Spoken Voice Narrative (Editable):'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={playCurrentTranscript}
                title="Listen to Transcript"
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3 text-amber-700" />
                <span>सुनें</span>
              </button>
              <button
                onClick={resetTranscript}
                title="Reset to Authentic Sample"
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-600" />
                <span>रीसेट</span>
              </button>
            </div>
          </div>

          <textarea
            id="voice-transcript-area"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 leading-relaxed focus:outline-none focus:border-amber-600 focus:bg-white transition-colors resize-none shadow-inner"
            placeholder={language === 'hi' ? 'माइक से बोलें या सीधे यहां टाइप करें...' : 'Speak with mic or type your craft narrative here...'}
          />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-3 mb-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{processStatusText || 'AI Studio & Gemini Multimodal Cataloging in progress...'}</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          id="proceed-to-catalog-btn"
          onClick={handleProceed}
          disabled={isProcessing}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm shadow-xl shadow-orange-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>
            {isProcessing
              ? 'AI कैटलॉग तैयार हो रहा है...'
              : (language === 'hi' ? 'कैटलॉग और उचित मूल्य तैयार करें' : 'Generate Studio Catalog & Fair Price')}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
