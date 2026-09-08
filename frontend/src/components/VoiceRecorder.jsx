import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useArtisan } from '../context/ArtisanContext';

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
  } = useArtisan();

  const [isListening, setIsListening] = useState(false);
  const [audioLevels, setAudioLevels] = useState([12, 24, 8, 32, 18, 28, 14, 30, 10, 20]);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Spoken voice guidance prompt on entry
  const voicePrompts = {
    hi: 'कृपया अपने उत्पाद के बारे में बताएं - यह क्या है, किन चीजों से बना है, और बनाने में कितना समय लगा।',
    mr: 'कृपया आपल्या उत्पादनाबद्दल सांगा - हे काय आहे, कशापासून बनवले आहे, आणि बनवायला किती वेळ लागला.',
    bn: 'দয়া করে আপনার পণ্য সম্পর্কে বলুন - এটি কী, কী উপাদান দিয়ে তৈরি এবং তৈরি করতে কত সময় লেগেছে।',
    ta: 'தயவுசெய்து உங்கள் தயாரிப்பைப் பற்றி சொல்லுங்கள் - இது என்ன, எதனால் செய்யப்பட்டது, எவ்வளவு நேரம் ஆனது.',
    te: 'దయచేసి మీ ఉత్పత్తి గురించి చెప్పండి - ఇది ఏమిటి, దేనితో తయారు చేయబడింది, ఎంత సమయం పట్టింది.',
    en: 'Please describe your craft - what it is, materials used, and hours invested.',
  };

  const playVoicePrompt = () => {
    const text = voicePrompts[language] || voicePrompts['hi'];
    speakVoice(text, language === 'hi' ? 'hi-IN' : 'en-IN');
  };

  useEffect(() => {
    // Play voice prompt when entering Screen 2
    playVoicePrompt();
    return () => {
      stopAudioVisualizer();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Web Audio Visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 10)).map(v => Math.max(6, Math.min(48, v / 5)));
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (e) {
      // Fallback simulated waveform when mic permission is not granted
      simulateWaveform();
    }
  };

  const simulateWaveform = () => {
    const interval = setInterval(() => {
      setAudioLevels(Array.from({ length: 10 }, () => Math.floor(Math.random() * 38) + 6));
    }, 120);
    animationFrameRef.current = interval;
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      if (typeof animationFrameRef.current === 'number') {
        cancelAnimationFrame(animationFrameRef.current);
        clearInterval(animationFrameRef.current);
      }
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Web Speech API recognition
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    startAudioVisualizer();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText) {
          setTranscript(currentText);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    } else {
      // If browser doesn't support Web Speech API, use fixture transcript
      console.log('Web Speech API not supported in this browser, utilizing voice transcript');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    stopAudioVisualizer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Submit and run autonomous AI studio & pricing
  const handleProceed = () => {
    stopListening();
    processCaptureAndVoice();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 text-white p-6 select-none overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-semibold py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-bold">
              2
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
              {language === 'hi' ? 'दूसरा चरण: बोलें' : 'Step 2: Speak'}
            </span>
          </div>

          <button
            onClick={playVoicePrompt}
            aria-label="Replay Audio Instruction"
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:text-amber-300"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Audio prompt banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-900 border border-emerald-500/30 mb-4 shadow-lg">
          <p className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 animate-bounce" />
            {language === 'hi' ? 'आवाज में बताएं:' : 'Audio Guidance:'}
          </p>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            "{voicePrompts[language] || voicePrompts['hi']}"
          </p>
        </div>
      </div>

      {/* Central Giant 96px Microphone with Pulsating Ripple Rings */}
      <div className="my-auto flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center">
          {/* Animated Ripple Rings when recording */}
          {isListening && (
            <>
              <div className="absolute w-40 h-40 rounded-full bg-emerald-500/30 animate-ripple pointer-events-none" />
              <div className="absolute w-40 h-40 rounded-full bg-emerald-400/20 animate-ripple-delayed pointer-events-none" />
            </>
          )}

          {/* Giant 96px+ Button */}
          <button
            onClick={toggleListening}
            aria-label={isListening ? 'Stop Recording' : 'Start Speaking'}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 ring-8 ring-rose-500/30 shadow-rose-500/50'
                : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 ring-8 ring-emerald-500/20 shadow-emerald-500/30'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-slate-950" />
            )}
          </button>
        </div>

        {/* Live Audio Amplitude Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-12 mt-6">
          {audioLevels.map((lvl, idx) => (
            <div
              key={idx}
              style={{ height: `${isListening ? lvl : 8}px` }}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-gradient-to-t from-emerald-500 to-amber-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">
          {isListening
            ? (language === 'hi' ? 'रिकॉर्डिंग चालू है... (रोकने के लिए दबाएं)' : 'Recording active... (Tap to pause)')
            : (language === 'hi' ? 'माइक दबाएं और बोलें' : 'Tap Mic & Speak')}
        </p>
      </div>

      {/* Spoken Transcript Area & Sample Phrases */}
      <div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              {language === 'hi' ? 'सुना गया विवरण (ऑटो-ट्रांसक्राइब):' : 'Spoken Voice Transcript:'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Bhashini ASR Ready
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200 min-h-[48px] italic leading-relaxed">
            {transcript || (language === 'hi' ? 'बोलना शुरू करें या नीचे दिया गया नमूना चुनें...' : 'Start speaking or tap sample below...')}
          </p>
        </div>

        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-3 mb-4 animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{processStatusText || 'AI Studio & Gemini Multimodal Cataloging in progress...'}</span>
          </div>
        )}

        {/* Big Action Button: Process & Next */}
        <button
          onClick={handleProceed}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isProcessing ? 'AI Studio Processing...' : (language === 'hi' ? 'कैटलॉग और कीमत तैयार करें' : 'Generate Studio Catalog & Price')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
