// Zero-dependency browser-native sound design using Web Audio API.
// Audio starts on user interaction per browser autoplay policies.

let audioCtx = null;
let catAudio = null;

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

function getCatAudio() {
  if (!catAudio && typeof Audio !== 'undefined') {
    catAudio = new Audio('./art/cat-meow.mp3');
    catAudio.preload = 'auto';
  }
  return catAudio;
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

  // Authentic kitten meow from recorded audio
  playCatMeow() {
    try {
      const audio = getCatAudio();
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.85;
        const playPromise = audio.play();
        if (playPromise) playPromise.catch(() => {});
      }
    } catch (_) {}
  },

  // Stop kitten meow when closing
  stopCatMeow() {
    if (catAudio) {
      catAudio.pause();
      catAudio.currentTime = 0;
    }
  },

  // Soft, adorable baby kitten chirps and peeps for streaming speech words
  playCatChirp() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';

    // Randomize slightly between a soft baby peep and a gentle kitten mew
    const isMew = Math.random() > 0.45;
    if (isMew) {
      const f0 = 840 + Math.random() * 60;
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.3, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.95, now + 0.12);
    } else {
      // Gentle kitten trill / mrrp
      const f0 = 780 + Math.random() * 50;
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f0 * 1.25, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.9, now + 0.14);
    }

    filter.type = 'lowpass';
    filter.frequency.value = 2800;

    // Whisper-soft volume so it sounds like sweet gentle talking
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  },

  // Organic plant leaf pluck snap and soft foliage rustle
  playLeafPluck() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Stem pluck snap
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(1700, now);
    snap.frequency.exponentialRampToValueAtTime(450, now + 0.035);
    snapGain.gain.setValueAtTime(0.14, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.04);

    // Green leaf flutter
    const flutterSize = Math.floor(ctx.sampleRate * 0.25);
    const flutterBuf = ctx.createBuffer(1, flutterSize, ctx.sampleRate);
    const data = flutterBuf.getChannelData(0);
    for (let i = 0; i < flutterSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / flutterSize) * Math.PI);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = flutterBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now + 0.02);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.22);
    filter.Q.value = 2.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.07, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now + 0.02);
  }
};
