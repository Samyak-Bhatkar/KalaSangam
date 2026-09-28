/**
 * BellSynth - Idiophone Synthesis (Sacred Temple Ghanta & Manjira Cymbals)
 * Reconstructs the complex inharmonic spectra of bronze and bell-metal (Panchaloha)
 * with individual partial decay rates and slow beat shimmer.
 */

export class BellSynth {
  constructor(audioContext) {
    this.ctx = audioContext;
  }

  /**
   * Strike a temple bell or manjira cymbal
   */
  strike(destination, frequency = 587.33, options = {}) {
    const now = this.ctx.currentTime;
    const {
      isManjira = false,
      isMuffled = false,
      decaySeconds = 5.2,
      velocity = 0.85
    } = options;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(velocity * 0.9, now + 0.003); // anti-click instant attack

    // Partials definition: frequency multiplier, relative amplitude, individual decay multiplier
    let partials = [];
    if (isManjira) {
      const d = isMuffled ? 0.35 : decaySeconds;
      partials = [
        { ratio: 1.0, amp: 1.0, decay: d },
        { ratio: 2.14, amp: 0.75, decay: d * 0.7 },
        { ratio: 3.42, amp: 0.45, decay: d * 0.4 },
        { ratio: 4.88, amp: 0.25, decay: d * 0.25 }
      ];
    } else {
      // Temple Ghanta (humtone, strike tone, tierce, quint, nominal)
      partials = [
        { ratio: 0.52, amp: 0.85, decay: decaySeconds * 1.3 }, // Humtone (deep prolonged sub-octave)
        { ratio: 1.00, amp: 1.00, decay: decaySeconds * 1.0 }, // Fundamental strike tone
        { ratio: 1.22, amp: 0.70, decay: decaySeconds * 0.85 }, // Minor third tierce
        { ratio: 1.53, amp: 0.50, decay: decaySeconds * 0.7 }, // Quint
        { ratio: 2.02, amp: 0.40, decay: decaySeconds * 0.55 }, // Octave
        { ratio: 2.76, amp: 0.25, decay: decaySeconds * 0.4 }, // Upper mode
        { ratio: 4.15, amp: 0.15, decay: decaySeconds * 0.25 }  // Rim clang
      ];
    }

    const oscs = [];

    // Slow metallic beat shimmer modulator (FM)
    const shimmerLfo = this.ctx.createOscillator();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.setValueAtTime(isManjira ? 7.5 : 4.6, now);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(frequency * 0.004, now);
    shimmerLfo.connect(shimmerGain);

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const partialFreq = frequency * p.ratio;
      osc.frequency.setValueAtTime(partialFreq, now);

      shimmerGain.connect(osc.frequency);

      const pGain = this.ctx.createGain();
      pGain.gain.setValueAtTime(p.amp, now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(pGain);
      pGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
      oscs.push(osc);
    });

    shimmerLfo.start(now);
    shimmerLfo.stop(now + decaySeconds + 0.1);

    masterGain.connect(destination);

    return {
      masterGain,
      stop: (fade = 0.05) => {
        const t = this.ctx.currentTime;
        masterGain.gain.cancelScheduledValues(t);
        masterGain.gain.setValueAtTime(masterGain.gain.value, t);
        masterGain.gain.linearRampToValueAtTime(0.0001, t + fade);
        setTimeout(() => {
          oscs.forEach(o => {
            try { o.stop(); } catch {}
          });
          try { shimmerLfo.stop(); } catch {}
        }, fade * 1000 + 20);
      }
    };
  }
}
