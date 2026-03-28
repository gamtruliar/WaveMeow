/* ═══════════════════════════════════════════
   Sonic Palette: Meow Edition — Petite-Vue
   ═══════════════════════════════════════════ */

/* ── Constants ── */
const PITCH_MIN = 0.5, PITCH_MAX = 2.0;
const TIMBRE_MIN = 300, TIMBRE_MAX = 3000;
const TREMOLO_MIN = 0, TREMOLO_MAX = 1;
const LFO_FREQ = 20;
const TOTAL_ROUNDS = 5;
const DEFAULT_AUDIO = 'dragon-studio-cat-meow-401729.mp3';
const VOL_KEY = 'wavemeow_vol';

/* ── Audio engine (non-reactive, module-level) ── */
let audioCtx = null;
let audioBuffer = null;
let currentSource = null;
let filterNode = null;
let tremoloGainNode = null;
let lfoNode = null;
let lfoDepthNode = null;
let masterGainNode = null;
let listenInterval = null;
let scoreRAF = null;

function ensureCtx(vol) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = vol / 100;
    masterGainNode.connect(audioCtx.destination);
  }
}

function stopAudio() {
  if (lfoNode) { try { lfoNode.stop(); } catch (_) { /* */ } lfoNode = null; }
  if (currentSource) { try { currentSource.stop(); } catch (_) { /* */ } currentSource = null; }
}

function buildGraph(pitch, timbre, tremolo, loop) {
  stopAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const src = audioCtx.createBufferSource();
  src.buffer = audioBuffer;
  src.loop = loop;
  src.playbackRate.value = pitch;

  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'peaking';
  filterNode.Q.value = 5;
  filterNode.gain.value = 15;
  filterNode.frequency.value = timbre;

  tremoloGainNode = audioCtx.createGain();
  tremoloGainNode.gain.value = 1;

  lfoNode = audioCtx.createOscillator();
  lfoNode.type = 'sine';
  lfoNode.frequency.value = LFO_FREQ;

  lfoDepthNode = audioCtx.createGain();
  lfoDepthNode.gain.value = tremolo * 0.9;

  lfoNode.connect(lfoDepthNode);
  lfoDepthNode.connect(tremoloGainNode.gain);

  src.connect(filterNode);
  filterNode.connect(tremoloGainNode);
  tremoloGainNode.connect(masterGainNode);

  lfoNode.start();
  src.start();
  currentSource = src;
  src.onended = () => { if (currentSource === src) currentSource = null; };
}

/* ── Mapping helpers ── */
function sliderToPitch(v)   { return PITCH_MIN   + (v / 1000) * (PITCH_MAX   - PITCH_MIN); }
function sliderToTimbre(v)  { return TIMBRE_MIN  + (v / 1000) * (TIMBRE_MAX  - TIMBRE_MIN); }
function sliderToTremolo(v) { return TREMOLO_MIN + (v / 1000) * (TREMOLO_MAX - TREMOLO_MIN); }
function pitchToSlider(p)   { return Math.round((p - PITCH_MIN)   / (PITCH_MAX   - PITCH_MIN)   * 1000); }
function timbreToSlider(t)  { return Math.round((t - TIMBRE_MIN)  / (TIMBRE_MAX  - TIMBRE_MIN)  * 1000); }
function tremoloToSlider(g) { return Math.round((g - TREMOLO_MIN) / (TREMOLO_MAX - TREMOLO_MIN) * 1000); }

function calcScore(target, player, min, max) {
  return Math.max(0, 100 - (Math.abs(target - player) / (max - min) * 100));
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
  targetTimbre: 1500,
  targetTremolo: 0.5,

  sliderPitch: 500,
  sliderTimbre: 500,
  sliderTremolo: 500,

  lastPitch: 1,
  lastTimbre: 1500,
  lastTremolo: 0.5,

  roundScores: [],
  scoreDisplay: '0%',
  scoreAnimating: false,
  roundResult: null,
  barPitch: '0%',
  barTimbre: '0%',
  barTremolo: '0%',

  cmpPitch: 500,
  cmpTimbre: 500,
  cmpTremolo: 500,

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

  get tgtPitchPct()   { return (this.targetPitch   - PITCH_MIN)   / (PITCH_MAX   - PITCH_MIN); },
  get tgtTimbrePct()  { return (this.targetTimbre  - TIMBRE_MIN)  / (TIMBRE_MAX  - TIMBRE_MIN); },
  get tgtTremoloPct() { return (this.targetTremolo - TREMOLO_MIN) / (TREMOLO_MAX - TREMOLO_MIN); },

  get finalAvg() {
    if (!this.roundScores.length) return 0;
    return this.roundScores.reduce((s, r) => s + r.total, 0) / TOTAL_ROUNDS;
  },
  get finalComment() {
    const a = this.finalAvg;
    if (a >= 95) return '"Tetrachromat of Sound!" 🎯';
    if (a >= 85) return '"Cat Whisperer. Absolute unit." 😼';
    if (a >= 70) return '"Pretty good ears, not gonna lie." 🎧';
    if (a >= 50) return '"Decent. Keep practicing." 🐱';
    if (a >= 30) return '"Are you sure you\'re listening?" 😐';
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
    this.targetPitch   = PITCH_MIN   + Math.random() * (PITCH_MAX   - PITCH_MIN);
    this.targetTimbre  = TIMBRE_MIN  + Math.random() * (TIMBRE_MAX  - TIMBRE_MIN);
    this.targetTremolo = TREMOLO_MIN + Math.random() * (TREMOLO_MAX - TREMOLO_MIN);
    this.sliderPitch   = 500;
    this.sliderTimbre  = 500;
    this.sliderTremolo = 500;
    this.screen = 'listen';
    this.startListen();
  },

  startListen() {
    this.pulseIdle   = false;
    this.listenWave  = true;
    ensureCtx(this.masterVol);
    buildGraph(this.targetPitch, this.targetTimbre, this.targetTremolo, true);

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
    const p  = sliderToPitch(this.sliderPitch);
    const t  = sliderToTimbre(this.sliderTimbre);
    const tr = sliderToTremolo(this.sliderTremolo);
    buildGraph(p, t, tr, true);
  },

  onSliderInput() {
    const p  = sliderToPitch(this.sliderPitch);
    const t  = sliderToTimbre(this.sliderTimbre);
    const tr = sliderToTremolo(this.sliderTremolo);
    if (currentSource) {
      currentSource.playbackRate.value = p;
      if (filterNode)   filterNode.frequency.value = t;
      if (lfoDepthNode) lfoDepthNode.gain.value = tr * 0.9;
    } else {
      ensureCtx(this.masterVol);
      buildGraph(p, t, tr, true);
    }
    this.tuneWave = true;
  },

  confirmTune() {
    stopAudio();
    this.tuneWave = false;

    const pP  = sliderToPitch(this.sliderPitch);
    const pT  = sliderToTimbre(this.sliderTimbre);
    const pTr = sliderToTremolo(this.sliderTremolo);
    this.lastPitch   = pP;
    this.lastTimbre  = pT;
    this.lastTremolo = pTr;

    const ps  = calcScore(this.targetPitch,   pP,  PITCH_MIN,   PITCH_MAX);
    const ts  = calcScore(this.targetTimbre,  pT,  TIMBRE_MIN,  TIMBRE_MAX);
    const trs = calcScore(this.targetTremolo, pTr, TREMOLO_MIN, TREMOLO_MAX);
    const result = { pitch: ps, timbre: ts, tremolo: trs, total: (ps + ts + trs) / 3 };

    this.roundScores.push(result);
    this.roundResult = result;

    this.cmpPitch   = pitchToSlider(pP);
    this.cmpTimbre  = timbreToSlider(pT);
    this.cmpTremolo = tremoloToSlider(pTr);

    this.barPitch   = '0%';
    this.barTimbre  = '0%';
    this.barTremolo = '0%';

    this.playingTarget = false;
    this.playingYours  = false;
    this.playDisabled  = false;

    this.screen = 'round-score';

    setTimeout(() => {
      this.barPitch   = result.pitch   + '%';
      this.barTimbre  = result.timbre  + '%';
      this.barTremolo = result.tremolo + '%';
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
      this.scoreDisplay = (e * target).toFixed(2) + '%';
      if (t < 1) {
        scoreRAF = requestAnimationFrame(step);
      } else {
        this.scoreDisplay = target.toFixed(2) + '%';
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
    buildGraph(this.targetPitch, this.targetTimbre, this.targetTremolo, false);
    const ms = (audioBuffer ? audioBuffer.duration * 1000 : 2000) + 200;
    setTimeout(() => { this.playDisabled = false; this.playingTarget = false; }, ms);
  },

  playYours() {
    if (this.playDisabled) return;
    stopAudio();
    this.playDisabled = true;
    this.playingYours = true;
    ensureCtx(this.masterVol);
    buildGraph(this.lastPitch, this.lastTimbre, this.lastTremolo, false);
    const ms = (audioBuffer ? audioBuffer.duration * 1000 : 2000) + 200;
    setTimeout(() => { this.playDisabled = false; this.playingYours = false; }, ms);
  },

  playAgain() {
    stopAudio();
    this.startGame();
  }

}).mount('#app');
