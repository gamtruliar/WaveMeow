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
const LANG_KEY = 'wavemeow_lang';

/* ── i18n ── */
const I18N = {
  en: {
    loadMeow: 'Load Your Meow',
    loadingDefault: 'Loading default meow…',
    defaultLoaded: '✓ Default meow loaded! (or upload your own below)',
    defaultFailed: '⚠ Could not load default audio. Please upload a meow file.',
    customLoaded: '✓ Custom meow loaded: ',
    decodeFailed: '⚠ Could not decode audio.',
    uploadHint: 'Drag & drop or <span>browse</span>',
    startGame: 'Start Game 🎮',
    roundOf: 'of',
    listen: 'Listen 🎧',
    tuneIt: 'Tune It 🎛️',
    pitch: 'Pitch',
    vibrato: 'Vibrato',
    inflection: 'Inflection',
    pitchHint: 'Base frequency / Detune',
    vibratoHint: 'Trembling / Purr intensity',
    inflectionHint: 'Tail pitch slide ↗↘',
    confirm: 'Confirm 😺',
    roundScore: 'Round Score',
    roundScoreSub: 'round score',
    pitchContour: '📈 Pitch Contour',
    target: 'Target',
    yours: 'Yours',
    you: 'You',
    visualCompare: 'Visual Compare',
    playTarget: '🎯 Play Target',
    playYours: '🐱 Play Yours',
    viewFinal: 'View Final Results 🏆',
    nextRound: 'Next Round →',
    finalResults: 'Final Results',
    playAgain: 'Play Again 🔄',
    round: 'Round',
    c47: '"Tetrachromat of Sound!" 🎯',
    c42: '"Cat Whisperer. Absolute unit." 😼',
    c35: '"Pretty good ears, not gonna lie." 🎧',
    c25: '"Decent. Keep practicing." 🐱',
    c15: '"Are you sure you\'re listening?" 😐',
    c0:  '"Go wash your ears." 🚿',
  },
  yue: {
    loadMeow: '載入你隻貓叫',
    loadingDefault: '載入預設貓叫中…',
    defaultLoaded: '✓ 預設貓叫已載入！（或者上傳你自己嘅）',
    defaultFailed: '⚠ 載入預設音訊失敗，請上傳貓叫檔案。',
    customLoaded: '✓ 自訂貓叫已載入：',
    decodeFailed: '⚠ 無法解碼音訊。',
    uploadHint: '拖放或<span>瀏覽</span>',
    startGame: '開始遊戲 🎮',
    roundOf: '/',
    listen: '聽吓 🎧',
    tuneIt: '調音 🎛️',
    pitch: '音高',
    vibrato: '抖音',
    inflection: '語氣',
    pitchHint: '基礎頻率 / 高低音',
    vibratoHint: '顫抖 / 撒嬌程度',
    inflectionHint: '尾音滑動 ↗↘',
    confirm: '確認 😺',
    roundScore: '回合分數',
    roundScoreSub: '回合分數',
    pitchContour: '📈 音高曲線',
    target: '目標',
    yours: '你嘅',
    you: '你',
    visualCompare: '視覺對比',
    playTarget: '🎯 播放目標',
    playYours: '🐱 播放你嘅',
    viewFinal: '睇最終結果 🏆',
    nextRound: '下一回合 →',
    finalResults: '最終結果',
    playAgain: '再玩一次 🔄',
    round: '第{n}回合',
    c47: '「聲音四色覺者！」 🎯',
    c42: '「貓語大師，絕對嘅強者。」 😼',
    c35: '「唔講得笑，耳仔幾靈喎。」 🎧',
    c25: '「OK 啦，繼續練。」 🐱',
    c15: '「你真係有喺度聽？」 😐',
    c0:  '「去洗吓耳仔先啦。」 🚿',
  },
  ja: {
    loadMeow: 'ニャー音を読み込む',
    loadingDefault: 'デフォルトのニャーを読み込み中…',
    defaultLoaded: '✓ デフォルトのニャーを読み込みました！（または自分のをアップロード）',
    defaultFailed: '⚠ デフォルト音声の読み込みに失敗。ファイルをアップロードしてください。',
    customLoaded: '✓ カスタムニャーを読み込みました：',
    decodeFailed: '⚠ 音声をデコードできませんでした。',
    uploadHint: 'ドラッグ＆ドロップまたは<span>参照</span>',
    startGame: 'ゲーム開始 🎮',
    roundOf: '/',
    listen: '聴いて 🎧',
    tuneIt: 'チューニング 🎛️',
    pitch: 'ピッチ',
    vibrato: 'ビブラート',
    inflection: '抑揚',
    pitchHint: '基本周波数 / デチューン',
    vibratoHint: '震え / ゴロゴロ強度',
    inflectionHint: '尻尾のピッチスライド ↗↘',
    confirm: '確定 😺',
    roundScore: 'ラウンドスコア',
    roundScoreSub: 'ラウンドスコア',
    pitchContour: '📈 ピッチ曲線',
    target: 'ターゲット',
    yours: 'あなた',
    you: 'あなた',
    visualCompare: 'ビジュアル比較',
    playTarget: '🎯 ターゲット再生',
    playYours: '🐱 あなたの再生',
    viewFinal: '最終結果を見る 🏆',
    nextRound: '次のラウンド →',
    finalResults: '最終結果',
    playAgain: 'もう一度遊ぶ 🔄',
    round: 'ラウンド{n}',
    c47: '「音の四色型色覚者！」 🎯',
    c42: '「猫の囁き使い。絶対的存在。」 😼',
    c35: '「なかなかいい耳してるね。」 🎧',
    c25: '「まあまあ。練習を続けよう。」 🐱',
    c15: '「本当に聴いてる？」 😐',
    c0:  '「耳を洗ってきて。」 🚿',
  }
};

/* ── Audio engine (non-reactive, module-level) ── */
let audioCtx = null;
let audioBuffer = null;
let pitchShifterNode = null;
let masterGainNode = null;
let listenInterval = null;
let scoreRAF = null;
let workletReady = false;
let wasPlayingBeforeHide = false;

/* ── Pause audio when tab goes background ── */
document.addEventListener('visibilitychange', () => {
  if (!audioCtx) return;
  if (document.hidden) {
    wasPlayingBeforeHide = !!pitchShifterNode;
    if (audioCtx.state === 'running') audioCtx.suspend();
  } else {
    if (wasPlayingBeforeHide && audioCtx.state === 'suspended') audioCtx.resume();
  }
});

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

/* ── Pitch contour generator (effective pitch factor over time) ── */
function pitchContour(pitch, vibrato, inflection, dur, steps) {
  const LFO_HZ = 6;
  const pts = new Float32Array(steps);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);           /* 0‥1 progress */
    const rampP = pitch + inflection * t;
    const lfo = Math.sin(2 * Math.PI * LFO_HZ * t * dur);
    const vibS = rampP * (Math.pow(2, vibrato * lfo / 1200) - 1);
    pts[i] = Math.max(0.25, Math.min(4, rampP + vibS));
  }
  return pts;
}

/* ═══════════════════════════════════════════
   Petite-Vue Application
   ═══════════════════════════════════════════ */
PetiteVue.createApp({

  /* ── Reactive state ── */
  lang: localStorage.getItem(LANG_KEY) || 'en',
  screen: 'init',
  audioReady: false,
  fileName: '',
  defaultStatus: '',
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

  /* ── i18n helper ── */
  t(key) {
    return (I18N[this.lang] || I18N.en)[key] || (I18N.en[key] || key);
  },
  setLang(l) {
    this.lang = l;
    localStorage.setItem(LANG_KEY, l);
  },
  roundLabel(n) {
    const tpl = this.t('round');
    if (tpl.includes('{n}')) return tpl.replace('{n}', n);
    return tpl + ' ' + n;
  },

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
    if (a >= 47.5) return this.t('c47');
    if (a >= 42.5) return this.t('c42');
    if (a >= 35) return this.t('c35');
    if (a >= 25) return this.t('c25');
    if (a >= 15) return this.t('c15');
    return this.t('c0');
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
    this.defaultStatus = this.t('loadingDefault');
    ensureCtx(this.masterVol);
    await loadWorklet();
    try {
      const resp = await fetch(DEFAULT_AUDIO);
      if (!resp.ok) throw new Error('fetch failed');
      audioBuffer = await audioCtx.decodeAudioData(await resp.arrayBuffer());
      this.defaultStatus = this.t('defaultLoaded');
      this.defaultStatusOk = true;
      this.audioReady = true;
    } catch {
      this.defaultStatus = this.t('defaultFailed');
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
      this.defaultStatus = this.t('customLoaded') + file.name;
      this.defaultStatusOk = true;
      this.audioReady = true;
    } catch {
      this.fileName = this.t('decodeFailed');
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
    this.sliderPitch      = Math.floor(Math.random() * 1001);
    this.sliderVibrato    = Math.floor(Math.random() * 1001);
    this.sliderInflection = Math.floor(Math.random() * 1001);
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
    const result = {
      pitch: ps, vibrato: vs, inflection: infs, total: (ps + vs + infs) / 3,
      tP: this.targetPitch, tV: this.targetVibrato, tI: this.targetInflection,
      pP, pV, pI: pInf
    };

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
    setTimeout(() => this.drawWaveComparison(), 150);
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
      setTimeout(() => this.drawFinalContours(), 200);
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

  /* Shared pitch contour renderer — draws on any canvas */
  renderContourOnCanvas(canvas, tgtC, plrC, opts) {
    if (!canvas) return;
    const c = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    c.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const STEPS = tgtC.length;
    const mini = opts?.mini || false;

    /* y-axis range: auto-scale to actual data with padding */
    let dataMin = Infinity, dataMax = -Infinity;
    for (let i = 0; i < STEPS; i++) {
      dataMin = Math.min(dataMin, tgtC[i], plrC[i]);
      dataMax = Math.max(dataMax, tgtC[i], plrC[i]);
    }
    const span = Math.max(0.1, dataMax - dataMin);
    const padV = span * 0.25 + 0.05;
    const yMin = dataMin - padV, yMax = dataMax + padV;
    const PAD_TOP = mini ? 6 : 16, PAD_BOT = mini ? 6 : 16;
    const plotH = H - PAD_TOP - PAD_BOT;
    const map = (v) => PAD_TOP + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    c.clearRect(0, 0, W, H);

    /* Pick a nice grid step based on range */
    let gridStep = 0.1;
    if (yMax - yMin > 1.5) gridStep = 0.5;
    else if (yMax - yMin > 0.6) gridStep = 0.2;

    /* Horizontal grid lines */
    c.strokeStyle = 'rgba(160,128,104,0.12)';
    c.lineWidth = 1;
    c.setLineDash([3, 5]);
    for (let v = Math.ceil(yMin / gridStep) * gridStep; v <= yMax; v += gridStep) {
      const y = map(v);
      if (y > PAD_TOP - 2 && y < H - PAD_BOT + 2) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      }
    }
    c.setLineDash([]);

    if (!mini) {
      /* Y-axis tick labels */
      c.fillStyle = 'rgba(160,128,104,0.45)';
      c.font = '600 9px Nunito, sans-serif';
      c.textAlign = 'left';
      for (let v = Math.ceil(yMin / gridStep) * gridStep; v <= yMax; v += gridStep) {
        const y = map(v);
        if (y > PAD_TOP + 4 && y < H - PAD_BOT - 2) c.fillText(v.toFixed(gridStep < 0.15 ? 2 : 1), 3, y - 3);
      }
    }

    /* Draw filled area between curves (difference zone) */
    c.fillStyle = 'rgba(210,140,90,0.10)';
    c.beginPath();
    for (let i = 0; i < STEPS; i++) {
      const x = (i / (STEPS - 1)) * W;
      i === 0 ? c.moveTo(x, map(tgtC[i])) : c.lineTo(x, map(tgtC[i]));
    }
    for (let i = STEPS - 1; i >= 0; i--) {
      const x = (i / (STEPS - 1)) * W;
      c.lineTo(x, map(plrC[i]));
    }
    c.closePath(); c.fill();

    /* Draw curves */
    const lw = mini ? 1.8 : 2.5;
    const blur = mini ? 4 : 6;
    function drawCurve(pts, color, width) {
      c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round';
      c.beginPath();
      for (let i = 0; i < STEPS; i++) {
        const x = (i / (STEPS - 1)) * W;
        i === 0 ? c.moveTo(x, map(pts[i])) : c.lineTo(x, map(pts[i]));
      }
      c.stroke();
    }

    c.shadowColor = 'rgba(92,199,122,0.4)'; c.shadowBlur = blur;
    drawCurve(tgtC, 'rgba(92,199,122,0.85)', lw);
    c.shadowBlur = 0;

    c.shadowColor = 'rgba(212,135,92,0.4)'; c.shadowBlur = blur;
    drawCurve(plrC, 'rgba(212,135,92,0.9)', lw);
    c.shadowBlur = 0;

    if (!mini) {
      c.fillStyle = 'rgba(160,128,104,0.35)';
      c.font = '700 8px Nunito, sans-serif';
      c.textAlign = 'center';
      c.fillText('time \u2192', W / 2, H - 3);
      c.textAlign = 'right';
      c.fillText('pitch \u2191', W - 4, 10);
    }
  },

  drawWaveComparison() {
    const canvas = document.getElementById('wave-compare-canvas');
    if (!canvas || !audioBuffer) return;
    const dur = audioBuffer.duration;
    const STEPS = Math.max(200, Math.floor(canvas.getBoundingClientRect().width * 2));
    const tgtC = pitchContour(this.targetPitch, this.targetVibrato, this.targetInflection, dur, STEPS);
    const plrC = pitchContour(this.lastPitch, this.lastVibrato, this.lastInflection, dur, STEPS);
    this.renderContourOnCanvas(canvas, tgtC, plrC);
  },

  drawFinalContours() {
    if (!audioBuffer) return;
    const dur = audioBuffer.duration;
    for (let r = 0; r < this.roundScores.length; r++) {
      const s = this.roundScores[r];
      const cv = document.getElementById('final-contour-' + r);
      if (!cv) continue;
      const STEPS = Math.max(120, Math.floor(cv.getBoundingClientRect().width * 2));
      const tgtC = pitchContour(s.tP, s.tV, s.tI, dur, STEPS);
      const plrC = pitchContour(s.pP, s.pV, s.pI, dur, STEPS);
      this.renderContourOnCanvas(cv, tgtC, plrC, { mini: true });
    }
  },

  playAgain() {
    stopAudio();
    this.startGame();
  }

}).mount('#app');
