import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Check, X, Trash2, Volume2, Sparkles,
  Loader2, Play, Pause, AlertCircle, ShieldCheck, Tag
} from 'lucide-react';
import { annotatePinVoice } from '../services/api';

const SAMPLE_SPOT_PROMPTS = [
  {
    category: 'imperfection',
    label_hi: 'हल्की प्राकृतिक दरार (Natural Hairline)',
    text_hi: 'यहाँ पर हल्की सी दरार है, यह मिट्टी के प्राकृतिक स्वभाव और भट्ठी में पकाने के कारण है।',
  },
  {
    category: 'craft_detail',
    label_hi: 'पारंपरिक चाक नक्काशी (Wheel Motif)',
    text_hi: 'यहाँ पर हाथ से उकेरी गई पारंपरिक चाक नक्काशी है, जो हमारी पीढ़ीगत पहचान है।',
  },
  {
    category: 'imperfection',
    label_hi: 'प्राकृतिक रंग व शेड अंतर (Dye Variation)',
    text_hi: 'यहाँ पर रंग में हल्का शेड अंतर है, जो प्राकृतिक वनस्पति रंगों की धूप में सुखाई की निशानी है।',
  },
  {
    category: 'craft_detail',
    label_hi: 'हाथ की बारीक ज़री बुनाई (Zari Accent)',
    text_hi: 'यह पारंपरिक हथकरघे पर हाथ से पिरोया गया शुद्ध ज़री का बॉर्डर है।',
  },
];

export default function CraftPinVoiceModal({
  pinNumber,
  xPct,
  yPct,
  initialPin = null,
  language = 'hi',
  categoryHint = 'Terracotta Pottery',
  onSavePin,
  onDeletePin,
  onClose,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState(initialPin?.full_description || initialPin?.short_label || '');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(initialPin?.audio_url || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioElementRef = useRef(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = language === 'en' ? 'en-IN' : 'hi-IN';

      recognizer.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognizer.onerror = (e) => {
        console.warn('Speech recognition notice:', e.error);
      };

      recognitionRef.current = recognizer;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [language]);

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start caught:', e);
        }
      }
    } catch (err) {
      console.error('Microphone access failed:', err);
      setErrorMsg(
        language === 'hi'
          ? 'माइक्रोफोन की अनुमति नहीं मिली। आप नीचे दिए गए सुझाव चुन सकते हैं।'
          : 'Microphone permission denied. You can select a sample description below.'
      );
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }
  };

  // Audio Playback Preview
  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Save / Confirm Pin
  const handleConfirmPin = async () => {
    const textToProcess = (transcript || '').trim();
    if (!textToProcess && !audioBlob) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया बोलकर इस स्थान का विवरण दें या नीचे से एक सुझाव चुनें।'
          : 'Please speak to describe this spot or select a preset prompt below.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await annotatePinVoice({
        audioBlob,
        transcript: textToProcess,
        language,
        categoryHint,
        pinNumber,
        xPct,
        yPct,
      });

      if (response && response.pin) {
        onSavePin({
          ...response.pin,
          id: initialPin?.id || response.pin.id,
          x: xPct,
          y: yPct,
          x_pct: xPct,
          y_pct: yPct,
          audio_url: response.pin.audio_url || audioUrl,
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Failed to annotate pin:', err);
      // Fallback: save locally
      const isImperfection = textToProcess.match(/(दरार|crack|हल्का|दाग|mark|rough|asymmetry|variation|मिट्टी|hairline)/i);
      const cat = isImperfection ? 'imperfection' : 'craft_detail';
      const bankTerm = isImperfection ? 'Hairline Crack' : 'Traditional Motif';
      const label = isImperfection
        ? (language === 'hi' ? 'प्राकृतिक हेयरलाइन दरार' : 'Hairline Crack')
        : (language === 'hi' ? 'पारंपरिक चाक नक्काशी' : 'Traditional Motif');

      onSavePin({
        id: initialPin?.id || `pin_${Date.now()}_${pinNumber}`,
        pin_number: pinNumber,
        x: xPct,
        y: yPct,
        x_pct: xPct,
        y_pct: yPct,
        category: cat,
        bank_term: bankTerm,
        short_label: label,
        short_label_hi: label,
        short_label_en: bankTerm,
        one_line_summary: isImperfection
          ? 'Natural handmade variation from firing.'
          : 'Heritage artisanal craftsmanship accent.',
        label_angle: initialPin?.label_angle ?? ((pinNumber * 90) % 360),
        full_description: textToProcess,
        full_description_hi: textToProcess,
        full_description_en: textToProcess,
        audio_url: audioUrl,
        language,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-3.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white text-amber-800 font-bold text-base flex items-center justify-center shadow">
              {pinNumber}
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {language === 'hi' ? `बिंदु #${pinNumber}: शिल्प विवरण बोलें` : `Pin #${pinNumber}: Voice Detail`}
              </h3>
              <p className="text-xs text-amber-100/90 font-medium">
                {language === 'hi' ? 'पारंपरिक खूबी या प्राकृतिक विशेषता का वर्णन करें' : 'Describe a craft detail or natural variation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Audio recording area */}
          <div className="flex flex-col items-center justify-center py-4 bg-amber-50/50 dark:bg-slate-800/60 rounded-xl border border-amber-200/60 dark:border-slate-700">
            <div className="relative mb-3">
              {isRecording && (
                <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping" />
              )}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gradient-to-tr from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-9 h-9 animate-pulse" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isRecording
                ? `${language === 'hi' ? 'रिकॉर्डिंग चालू है...' : 'Recording...'} (${recordingDuration}s)`
                : audioUrl
                ? (language === 'hi' ? 'आवाज़ रिकॉर्ड हो चुकी है (फिर से बोलने के लिए माइक दबाएं)' : 'Voice recorded (Tap to re-record)')
                : (language === 'hi' ? 'माइक दबाएं और इस स्थान के बारे में बोलें' : 'Tap mic and speak about this spot')}
            </span>

            {/* Audio playback button if available */}
            {audioUrl && !isRecording && (
              <button
                type="button"
                onClick={togglePlayAudio}
                className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-3 py-1.5 rounded-full hover:bg-amber-200 transition"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'रोकें (Pause)' : 'अपनी आवाज़ सुनें (Listen Back)'}</span>
              </button>
            )}
          </div>

          {/* Transcript / Spoken Text Display */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'बोला गया विवरण (Spoken Text):' : 'Spoken Description:'}
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'जैसे: "यहाँ पर हल्की सी दरार है, यह मिट्टी के प्राकृतिक स्वभाव के कारण है"'
                  : 'e.g. "Slight natural hairline clay variation from kiln firing."'
              }
              rows={3}
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
            />
          </div>

          {/* Quick Vernacular Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              {language === 'hi' ? 'त्वरित उदाहरण (Quick Suggestions):' : 'Quick Suggestions:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_SPOT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTranscript(prompt.text_hi)}
                  className="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800 transition text-xs flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {prompt.category === 'imperfection' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    {prompt.label_hi}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {prompt.text_hi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Trust notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="leading-snug">
              {language === 'hi'
                ? 'ईमानदारी से प्राकृतिक भिन्नता बताना ग्राहकों का विश्वास बढ़ाता है और रिटर्न विवादों को रोकता है।'
                : 'Honest disclosure builds buyer trust and prevents post-delivery dispute returns.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-2.5 flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          {initialPin ? (
            <button
              type="button"
              onClick={() => onDeletePin && onDeletePin(initialPin.id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center gap-1 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'हटाएं' : 'Delete'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition"
            >
              <X className="w-4 h-4" />
              <span>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isProcessing || isRecording}
            onClick={handleConfirmPin}
            className="flex-1 max-w-[200px] sm:max-w-[240px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-bold shadow-md hover:shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving Pin...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4.5 h-4.5" />
                <span>{language === 'hi' ? '✓ विवरण जोड़ें' : '✓ Confirm Pin'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
