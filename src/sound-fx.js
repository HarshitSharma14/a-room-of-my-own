// Zero-dependency browser-native sound design using Web Audio API.
// Audio starts on user interaction per browser autoplay policies.

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const soundFX = {
  // Soft tactile UI click
  playClick() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  },

  // Soft modal close sound
  playClose() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.09);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  },

  // Hanging paper detaching and rustling forward
  playPageOpen() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Pin unseat pop
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = 'triangle';
    pop.frequency.setValueAtTime(1200, now);
    pop.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    popGain.gain.setValueAtTime(0.15, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    pop.connect(popGain);
    popGain.connect(ctx.destination);
    pop.start(now);
    pop.stop(now + 0.05);

    // Paper slide / whoosh buffer
    const bufferSize = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now + 0.02);
    filter.frequency.exponentialRampToValueAtTime(650, now + 0.32);
    filter.Q.value = 2.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.02);
  },

  // Premium ambient laptop chime on opening
  playLaptopOpen() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [659.25, 987.77]; // E5, B5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
  },

  // Green floor book open rustle and hardcover thud
  playBookOpen() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Hardcover lift thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(220, now);
    thud.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    thudGain.gain.setValueAtTime(0.18, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.13);

    // Page flutter
    const flutterSize = Math.floor(ctx.sampleRate * 0.28);
    const flutterBuf = ctx.createBuffer(1, flutterSize, ctx.sampleRate);
    const data = flutterBuf.getChannelData(0);
    for (let i = 0; i < flutterSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / flutterSize) * Math.PI);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = flutterBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now + 0.04);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.26);
    filter.Q.value = 2.4;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.09, now + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now + 0.04);
  },

  // Cute, expressive procedural kitten meow
  playCatMeow() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Main vocal cord oscillator (triangle wave gives soft vocal harmonics)
    const voice = ctx.createOscillator();
    voice.type = 'triangle';

    // Harmonic overtone oscillator (sine wave for throat sweetness)
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';

    // Pitch contour of a real meow: starts ~480Hz, glides up to ~780Hz, holds with vibrato, falls to ~510Hz
    voice.frequency.setValueAtTime(460, now);
    voice.frequency.exponentialRampToValueAtTime(760, now + 0.18);
    voice.frequency.setValueAtTime(760, now + 0.38);
    voice.frequency.exponentialRampToValueAtTime(510, now + 0.62);

    overtone.frequency.setValueAtTime(920, now);
    overtone.frequency.exponentialRampToValueAtTime(1520, now + 0.18);
    overtone.frequency.setValueAtTime(1520, now + 0.38);
    overtone.frequency.exponentialRampToValueAtTime(1020, now + 0.62);

    // Natural 5.5Hz vibrato (wobble)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 5.5;
    vibratoGain.gain.setValueAtTime(0, now);
    vibratoGain.gain.linearRampToValueAtTime(14, now + 0.2);
    vibratoGain.gain.linearRampToValueAtTime(0, now + 0.55);
    vibrato.connect(voice.frequency);
    vibrato.start(now);
    vibrato.stop(now + 0.65);

    // Formant filter: sweeps from nasal 'm' (650Hz) to open 'ee' (1400Hz) to rounded 'ow' (800Hz)
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.Q.value = 2.6;
    formant.frequency.setValueAtTime(650, now);
    formant.frequency.exponentialRampToValueAtTime(1450, now + 0.2);
    formant.frequency.exponentialRampToValueAtTime(820, now + 0.6);

    // Volume envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    masterGain.gain.setValueAtTime(0.18, now + 0.42);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.35;
    overtone.connect(overtoneGain);
    overtoneGain.connect(formant);

    voice.connect(formant);
    formant.connect(masterGain);
    masterGain.connect(ctx.destination);

    voice.start(now);
    overtone.start(now);
    voice.stop(now + 0.66);
    overtone.stop(now + 0.66);
  },

  // Soft, quick kitten mew/chirp for streaming speech words
  playCatChirp() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    // Gentle cheerful pitch chirp
    const basePitch = 640 + Math.random() * 80;
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 1.35, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.9, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2.0;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }
};
