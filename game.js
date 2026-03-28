/* ═══════════════════════════════════════════
   Sonic Palette: Meow Edition — Petite-Vue
   ═══════════════════════════════════════════ */

/* ── Constants ── */
const PITCH_MIN = 0.5, PITCH_MAX = 2.0;
const VIBRATO_MIN = 0, VIBRATO_MAX = 50;
const INFLECTION_MIN = -0.5, INFLECTION_MAX = 0.5;
const TOTAL_ROUNDS = 5;
const DEFAULT_AUDIO = 'dragon-studio-cat-meow-401729.mp3';
const VOL_KEY = 'wavemeow_vol';

/* ── Audio engine (non-reactive, module-level) ── */
let audioCtx = null;
let audioBuffer = null;
let pitchShifterNode = null;
let masterGainNode = null;
let listenInterval = null;
let scoreRAF = null;
let workletReady = false;

function ensureCtx(vol) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = vol / 100;
    masterGainNode.connect(audioCtx.destination);
  }
}

async function loadWorklet() {
  if (workletReady) return;
  await audioCtx.audioWorklet.addModule('pitch-shifter-worklet.js');
  workletReady = true;
}

function stopAudio() {
  if (pitchShifterNode) {
    pitchShifterNode.port.postMessage({ stop: true });
    pitchShifterNode.disconnect();
    pitchShifterNode = null;
  }
}

function buildGraph(pitch, vibrato, inflection, loop) {
  stopAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  startPlayback(pitch, vibrato, inflection, loop);
}

function startPlayback(pitch, vibrato, inflection, loop) {
  stopAudio();

  /* Worklet reads directly from PCM — no BufferSourceNode needed */
  pitchShifterNode = new AudioWorkletNode(audioCtx, 'pitch-shifter');
  pitchShifterNode.connect(masterGainNode);

  /* Send PCM + params; worklet generates audio from this buffer */
  const pcm = audioBuffer.getChannelData(0);
  pitchShifterNode.port.postMessage({
    buffer: pcm,
    pitch, inflection, vibratoCents: vibrato,
    duration: audioBuffer.duration, loop: !!loop,
    play: true, reset: true
  });
}

/* ── Mapping helpers ── */
function sliderToPitch(v)      { return PITCH_MIN      + (v / 1000) * (PITCH_MAX      - PITCH_MIN); }
function sliderToVibrato(v)    { return VIBRATO_MIN    + (v / 1000) * (VIBRATO_MAX    - VIBRATO_MIN); }
function sliderToInflection(v) { return INFLECTION_MIN + (v / 1000) * (INFLECTION_MAX - INFLECTION_MIN); }
function pitchToSlider(p)      { return Math.round((p - PITCH_MIN)      / (PITCH_MAX      - PITCH_MIN)      * 1000); }
function vibratoToSlider(v)    { return Math.round((v - VIBRATO_MIN)    / (VIBRATO_MAX    - VIBRATO_MIN)    * 1000); }
function inflectionToSlider(i) { return Math.round((i - INFLECTION_MIN) / (INFLECTION_MAX - INFLECTION_MIN) * 1000); }

function calcScore(target, player, min, max) {
  return Math.max(0, 10 - (Math.abs(target - player) / (max - min) * 10));
}

/* ═══════════════════════════════════════════
   Petite-Vue Application
   ═══════════════════════════════════════════ */
PetiteVue.createApp({

  /* ── Reactive state ── */
  screen: 'init',
  audioReady: false,
  fileName: '',
  defaultStatus: 'Loading default meow…',
  defaultStatusOk: false,

  currentRound: 0,
  targetPitch: 1,
  targetVibrato: 0,
  targetInflection: 0,

  sliderPitch: 500,
  sliderVibrato: 500,
  sliderInflection: 500,

  lastPitch: 1,
  lastVibrato: 0,
  lastInflection: 0,

  roundScores: [],
  scoreDisplay: '0.00',
  scoreAnimating: false,
  roundResult: null,
  barPitch: '0%',
  barVibrato: '0%',
  barInflection: '0%',

  cmpPitch: 500,
  cmpVibrato: 500,
  cmpInflection: 500,

  countdown: '–',
  pulseIdle: true,
  listenWave: false,
  tuneWave: false,

  playingTarget: false,
  playingYours: false,
  playDisabled: false,

  masterVol: +(localStorage.getItem(VOL_KEY) ?? 50),

  /* ── Getters (computed-like) ── */
  get isLastRound()   { return this.currentRound + 1 >= TOTAL_ROUNDS; },

  get tgtPitchPct()      { return (this.targetPitch      - PITCH_MIN)      / (PITCH_MAX      - PITCH_MIN); },
  get tgtVibratoPct()    { return (this.targetVibrato    - VIBRATO_MIN)    / (VIBRATO_MAX    - VIBRATO_MIN); },
  get tgtInflectionPct() { return (this.targetInflection - INFLECTION_MIN) / (INFLECTION_MAX - INFLECTION_MIN); },

  get finalTotal() {
    if (!this.roundScores.length) return 0;
    return this.roundScores.reduce((s, r) => s + r.total, 0);
  },
  get finalComment() {
    const a = this.finalTotal;
    if (a >= 47.5) return '"Tetrachromat of Sound!" 🎯';
    if (a >= 42.5) return '"Cat Whisperer. Absolute unit." 😼';
    if (a >= 35) return '"Pretty good ears, not gonna lie." 🎧';
    if (a >= 25) return '"Decent. Keep practicing." 🐱';
    if (a >= 15) return '"Are you sure you\'re listening?" 😐';
    return '"Go wash your ears." 🚿';
  },

  /* ── Dot helper ── */
  dotClass(i) {
    if (i < this.currentRound) return 'round-dot done';
    if (i === this.currentRound) return 'round-dot active';
    return 'round-dot';
  },
  dotText(i) { return i === this.currentRound ? '😺' : '⭐'; },

  /* ── Audio init ── */
  async loadDefaultAudio() {
    ensureCtx(this.masterVol);
    await loadWorklet();
    try {
      const resp = await fetch(DEFAULT_AUDIO);
      if (!resp.ok) throw new Error('fetch failed');
      audioBuffer = await audioCtx.decodeAudioData(await resp.arrayBuffer());
      this.defaultStatus = '✓ Default meow loaded! (or upload your own below)';
      this.defaultStatusOk = true;
      this.audioReady = true;
    } catch {
      this.defaultStatus = '⚠ Could not load default audio. Please upload a meow file.';
      this.defaultStatusOk = false;
    }
  },

  async onFileInput(e) {
    const file = e.target.files[0];
    if (!file) return;
    this.fileName = file.name;
    ensureCtx(this.masterVol);
    await loadWorklet();
    try {
      audioBuffer = await audioCtx.decodeAudioData(await file.arrayBuffer());
      this.defaultStatus = '✓ Custom meow loaded: ' + file.name;
      this.defaultStatusOk = true;
      this.audioReady = true;
    } catch {
      this.fileName = '⚠ Could not decode audio.';
    }
  },

  onMasterVol() {
    if (masterGainNode) masterGainNode.gain.value = this.masterVol / 100;
    localStorage.setItem(VOL_KEY, this.masterVol);
  },

  /* ── Game flow ── */
  startGame() {
    ensureCtx(this.masterVol);
    if (audioCtx.state === 'suspended') audioCtx.resume();
    this.currentRound = 0;
    this.roundScores = [];
    this.startRound();
  },

  startRound() {
    this.targetPitch      = PITCH_MIN      + Math.random() * (PITCH_MAX      - PITCH_MIN);
    this.targetVibrato    = VIBRATO_MIN    + Math.random() * (VIBRATO_MAX    - VIBRATO_MIN);
    this.targetInflection = INFLECTION_MIN + Math.random() * (INFLECTION_MAX - INFLECTION_MIN);
    this.sliderPitch      = 500;
    this.sliderVibrato    = 500;
    this.sliderInflection = 500;
    this.screen = 'listen';
    this.startListen();
  },

  startListen() {
    this.pulseIdle   = false;
    this.listenWave  = true;
    ensureCtx(this.masterVol);
    buildGraph(this.targetPitch, this.targetVibrato, this.targetInflection, true);

    let remaining = 5;
    this.countdown = remaining;
    if (listenInterval) clearInterval(listenInterval);
    listenInterval = setInterval(() => {
      remaining--;
      this.countdown = remaining > 0 ? remaining : '–';
      if (remaining <= 0) {
        clearInterval(listenInterval);
        listenInterval = null;
        stopAudio();
        this.listenWave = false;
        this.pulseIdle  = true;
        this.startTune();
      }
    }, 1000);
  },

  startTune() {
    this.screen = 'tune';
    this.tuneWave = true;
    ensureCtx(this.masterVol);
    const p   = sliderToPitch(this.sliderPitch);
    const v   = sliderToVibrato(this.sliderVibrato);
    const inf = sliderToInflection(this.sliderInflection);
    buildGraph(p, v, inf, true);
  },

  onSliderInput() {
    const p   = sliderToPitch(this.sliderPitch);
    const v   = sliderToVibrato(this.sliderVibrato);
    const inf = sliderToInflection(this.sliderInflection);
    if (pitchShifterNode) {
      /* Send updated params to worklet — no automation to cancel */
      pitchShifterNode.port.postMessage({
        pitch: p, inflection: inf, vibratoCents: v
      });
    } else {
      ensureCtx(this.masterVol);
      buildGraph(p, v, inf, true);
    }
    this.tuneWave = true;
  },

  confirmTune() {
    stopAudio();
    this.tuneWave = false;

    const pP   = sliderToPitch(this.sliderPitch);
    const pV   = sliderToVibrato(this.sliderVibrato);
    const pInf = sliderToInflection(this.sliderInflection);
    this.lastPitch      = pP;
    this.lastVibrato    = pV;
    this.lastInflection = pInf;

    const ps   = calcScore(this.targetPitch,      pP,   PITCH_MIN,      PITCH_MAX);
    const vs   = calcScore(this.targetVibrato,    pV,   VIBRATO_MIN,    VIBRATO_MAX);
    const infs = calcScore(this.targetInflection, pInf, INFLECTION_MIN, INFLECTION_MAX);
    const result = { pitch: ps, vibrato: vs, inflection: infs, total: (ps + vs + infs) / 3 };

    this.roundScores.push(result);
    this.roundResult = result;

    this.cmpPitch      = pitchToSlider(pP);
    this.cmpVibrato    = vibratoToSlider(pV);
    this.cmpInflection = inflectionToSlider(pInf);

    this.barPitch      = '0%';
    this.barVibrato    = '0%';
    this.barInflection = '0%';

    this.playingTarget = false;
    this.playingYours  = false;
    this.playDisabled  = false;

    this.screen = 'round-score';

    setTimeout(() => {
      this.barPitch      = (result.pitch      / 10 * 100) + '%';
      this.barVibrato    = (result.vibrato    / 10 * 100) + '%';
      this.barInflection = (result.inflection / 10 * 100) + '%';
    }, 250);

    this.animateScore(result.total);
  },

  animateScore(target) {
    if (scoreRAF) cancelAnimationFrame(scoreRAF);
    this.scoreAnimating = true;
    const dur = 950, t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      this.scoreDisplay = (e * target).toFixed(2) + ' / 10';
      if (t < 1) {
        scoreRAF = requestAnimationFrame(step);
      } else {
        this.scoreDisplay = target.toFixed(2) + ' / 10';
        this.scoreAnimating = false;
      }
    };
    step(t0);
  },

  nextRound() {
    stopAudio();
    this.currentRound++;
    if (this.currentRound >= TOTAL_ROUNDS) {
      this.screen = 'gameover';
    } else {
      this.startRound();
    }
  },

  playTarget() {
    if (this.playDisabled) return;
    stopAudio();
    this.playDisabled  = true;
    this.playingTarget = true;
    ensureCtx(this.masterVol);
    buildGraph(this.targetPitch, this.targetVibrato, this.targetInflection, false);
    const ms = (audioBuffer ? audioBuffer.duration * 1000 : 2000) + 200;
    setTimeout(() => { this.playDisabled = false; this.playingTarget = false; }, ms);
  },

  playYours() {
    if (this.playDisabled) return;
    stopAudio();
    this.playDisabled = true;
    this.playingYours = true;
    ensureCtx(this.masterVol);
    buildGraph(this.lastPitch, this.lastVibrato, this.lastInflection, false);
    const ms = (audioBuffer ? audioBuffer.duration * 1000 : 2000) + 200;
    setTimeout(() => { this.playDisabled = false; this.playingYours = false; }, ms);
  },

  playAgain() {
    stopAudio();
    this.startGame();
  }

}).mount('#app');
