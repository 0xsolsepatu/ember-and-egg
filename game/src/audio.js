// All sound is synthesised with WebAudio: short oscillator blips and filtered
// noise, no audio files and no network. Created lazily on the first user
// gesture, so the game stays silent (and error-free) until played.
export function createAudio() {
  let ctx = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
      gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + dur);
    } catch {
      // Audio is decoration; a failure never breaks the game.
    }
  }

  function noise(dur, vol, filterFreq) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const len = Math.floor(ac.sampleRate * dur);
      const buffer = ac.createBuffer(1, len, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ac.createBufferSource();
      src.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = filterFreq || 1200;
      const gain = ac.createGain();
      gain.gain.value = vol || 0.08;
      src.connect(filter).connect(gain).connect(ac.destination);
      src.start();
    } catch {
      // Audio is decoration; a failure never breaks the game.
    }
  }

  return {
    unlock() {
      const ac = ensure();
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    isMuted() {
      return muted;
    },
    pickup() {
      tone(520, 0.08, 'triangle', 0.1, 700);
    },
    chop() {
      noise(0.09, 0.16, 2400);
      tone(180, 0.06, 'square', 0.05, 120);
    },
    place() {
      tone(340, 0.07, 'triangle', 0.1, 260);
    },
    ding() {
      tone(880, 0.12, 'sine', 0.12);
      setTimeout(() => tone(1318, 0.18, 'sine', 0.1), 90);
    },
    coin() {
      tone(988, 0.09, 'sine', 0.12);
      setTimeout(() => tone(1319, 0.16, 'sine', 0.12), 80);
    },
    error() {
      tone(160, 0.18, 'sawtooth', 0.08, 110);
    },
    burn() {
      noise(0.4, 0.1, 500);
      tone(220, 0.3, 'sawtooth', 0.06, 90);
    },
    startSizzle() {
      if (muted || sizzleNodes) return;
      const ac = ensure();
      if (!ac) return;
      try {
        const len = ac.sampleRate;
        const buffer = ac.createBuffer(1, len, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ac.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ac.createGain();
        gain.gain.value = 0.015;
        src.connect(filter).connect(gain).connect(ac.destination);
        src.start();
        sizzleNodes = { src, gain };
      } catch {
        sizzleNodes = null;
      }
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try {
        sizzleNodes.src.stop();
      } catch {
        // Already stopped.
      }
      sizzleNodes = null;
    },
    fanfare() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.12), i * 110));
    },
  };
}
