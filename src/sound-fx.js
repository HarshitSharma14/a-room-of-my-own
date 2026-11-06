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

  // Cute, sweet kitten mew
  playCatMeow() {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sweet sine fundamental - warm and organic, zero harshness
    const voice = ctx.createOscillator();
    voice.type = 'sine';

    // Soft second harmonic for throat warmth
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';

    // Kitten pitch contour: high, sweet, gentle arch
    const baseFreq = 740;
    voice.frequency.setValueAtTime(baseFreq, now);
    voice.frequency.exponentialRampToValueAtTime(1180, now + 0.11);
    voice.frequency.setValueAtTime(1180, now + 0.19);
    voice.frequency.exponentialRampToValueAtTime(820, now + 0.35);

    overtone.frequency.setValueAtTime(baseFreq * 2, now);
    overtone.frequency.exponentialRampToValueAtTime(2360, now + 0.11);
    overtone.frequency.setValueAtTime(2360, now + 0.19);
    overtone.frequency.exponentialRampToValueAtTime(1640, now + 0.35);

    // Subtle 6.5Hz kitten vocal vibrato
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 6.5;
    vibratoGain.gain.setValueAtTime(0, now);
    vibratoGain.gain.linearRampToValueAtTime(12, now + 0.11);
    vibratoGain.gain.linearRampToValueAtTime(0, now + 0.32);
    vibrato.connect(voice.frequency);
    vibrato.connect(overtone.frequency);
    vibrato.start(now);
    vibrato.stop(now + 0.36);

    // Warm lowpass filter to keep sound rounded and gentle
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);

    // Amplitude envelope: soft attack, gentle body, sweet fade
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    masterGain.gain.setValueAtTime(0.14, now + 0.19);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.18;
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);

    voice.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    voice.start(now);
    overtone.start(now);
    voice.stop(now + 0.36);
    overtone.stop(now + 0.36);
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
  }
};
