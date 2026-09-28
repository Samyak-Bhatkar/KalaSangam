/**
 * Web Speech Synthesis Utility for Cultural Genome Storyteller
 */

let currentUtterance = null;

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText({ text, lang = 'hi-IN', onStart = () => {}, onEnd = () => {}, onError = () => {} }) {
  if (!isSpeechSupported()) {
    console.warn("Speech synthesis not supported in this browser environment.");
    return false;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95; // Slightly measured rate for folk storytelling
  utterance.pitch = 1.0;

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = onStart;
  utterance.onend = () => {
    currentUtterance = null;
    onEnd();
  };
  utterance.onerror = (e) => {
    currentUtterance = null;
    onError(e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeech() {
  if (isSpeechSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeech() {
  if (isSpeechSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
