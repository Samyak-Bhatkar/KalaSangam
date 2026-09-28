/**
 * ModalDrumSynth - Membranophone Modal Resonance Synthesis
 * Reconstructs the acoustics of Indian classical drums (Mridangam, Pushkara, Damaru).
 * Sir C.V. Raman discovered that the loaded central paste (karanai) forces circular membrane
 * modes into harmonic overtones, yielding a distinct singing pitch.
 */

export class ModalDrumSynth {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.bufferCache = new Map();
  }

  /**
   * Synthesize or retrieve an AudioBuffer for a specific drum stroke
   */
  getDrumStrokeBuffer(strokeType, options = {}) {
    const {
      centerFreq = 146.83, // D3
      rimFreq = 293.66,    // D4
      dampingSeconds = 1.2,
      pitchDropHz = 35,
      harmonicPurity = 0.9
    } = options;

    const cacheKey = `${strokeType}_${Math.round(centerFreq)}_${Math.round(dampingSeconds * 100)}`;
    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey);
    }

    const sampleRate = this.ctx.sampleRate;
    const duration = Math.min(2.5, dampingSeconds * 1.5);
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Stroke modal parameters
    let modes = [];
    let initialPitch = centerFreq;
    let pitchDropDuration = 0.055;
    let noiseMix = 0.15;
    let noiseDecay = 0.025;

    if (strokeType === 'bass' || strokeType === 'tha') {
      initialPitch = centerFreq * 0.65;
      pitchDropHz = 40;
      modes = [
        { ratio: 1.0, amp: 1.0, decay: dampingSeconds * 1.1 },
        { ratio: 1.8, amp: 0.35, decay: dampingSeconds * 0.6 },
        { ratio: 2.6, amp: 0.15, decay: dampingSeconds * 0.3 }
      ];
      noiseMix = 0.25;
    } else if (strokeType === 'rim' || strokeType === 'nam' || strokeType === 'dhak') {
      initialPitch = rimFreq;
      pitchDropHz = 15;
      modes = [
        { ratio: 1.0, amp: 0.8, decay: dampingSeconds * 0.5 },
        { ratio: 1.62, amp: 0.65, decay: dampingSeconds * 0.35 },
        { ratio: 2.31, amp: 0.45, decay: dampingSeconds * 0.25 },
        { ratio: 3.15, amp: 0.25, decay: dampingSeconds * 0.15 }
      ];
      noiseMix = 0.35;
      noiseDecay = 0.015;
    } else {
      // Tonal center stroke ('dheem', 'dhum') - Raman harmonic series
      initialPitch = centerFreq;
      const h2 = harmonicPurity > 0.8 ? 2.0 : 2.14;
      const h3 = harmonicPurity > 0.8 ? 3.0 : 3.25;
      const h4 = harmonicPurity > 0.8 ? 4.0 : 4.4;
      modes = [
        { ratio: 1.0, amp: 1.0, decay: dampingSeconds * 1.2 },
        { ratio: h2, amp: 0.72, decay: dampingSeconds * 0.9 },
        { ratio: h3, amp: 0.45, decay: dampingSeconds * 0.7 },
        { ratio: h4, amp: 0.25, decay: dampingSeconds * 0.5 }
      ];
      noiseMix = 0.12;
      noiseDecay = 0.02;
    }

    // Modal synthesis buffer loop
    const modePhases = new Float32Array(modes.length);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;

      // Pitch drop transient
      let currentFundamental = initialPitch;
      if (t < pitchDropDuration) {
        const dropProgress = 1 - (t / pitchDropDuration);
        currentFundamental += pitchDropHz * Math.pow(dropProgress, 2);
      }

      // Sum modes
      let sample = 0;
      for (let m = 0; m < modes.length; m++) {
        const mode = modes[m];
        const modeFreq = currentFundamental * mode.ratio;
        modePhases[m] += (2 * Math.PI * modeFreq) / sampleRate;
        const env = Math.exp(-t / Math.max(0.01, mode.decay));
        sample += Math.sin(modePhases[m]) * mode.amp * env;
      }

      // Initial leather impact noise burst
      if (t < 0.08) {
        const noiseEnv = Math.exp(-t / noiseDecay);
        const rand = (Math.random() * 2 - 1);
        sample += rand * noiseMix * noiseEnv;
      }

      // Soft saturation to model membrane tension resistance
      data[i] = Math.tanh(sample * 1.1) * 0.85;
    }

    if (this.bufferCache.size < 30) {
      this.bufferCache.set(cacheKey, buffer);
    }

    return buffer;
  }

  /**
   * Trigger a drum stroke
   */
  trigger(destination, strokeType = 'dheem', velocity = 0.85, options = {}) {
    const audioBuffer = this.getDrumStrokeBuffer(strokeType, options);

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = this.ctx.createGain();
    const now = this.ctx.currentTime;
    const dynamicGain = Math.min(1.0, Math.max(0.1, velocity * 0.95));

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(dynamicGain, now + 0.002);

    source.connect(gainNode);
    gainNode.connect(destination);

    source.start(now);

    return {
      source,
      gainNode,
      stop: (fade = 0.05) => {
        const t = this.ctx.currentTime;
        gainNode.gain.cancelScheduledValues(t);
        gainNode.gain.setValueAtTime(gainNode.gain.value, t);
        gainNode.gain.linearRampToValueAtTime(0.0001, t + fade);
        source.stop(t + fade + 0.01);
      }
    };
  }
}
