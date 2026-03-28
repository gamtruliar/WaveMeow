/**
 * WSOLA pitch shifter (direct PCM buffer).
 *
 * Two Hann-windowed read-heads offset by G/2, both advancing at rate `pf`.
 * `outputPos` advances at rate 1 → constant playback speed.
 * When a grain expires, WSOLA cross-correlation finds the phase-coherent
 * snap position near `outputPos` → eliminates beating / amplitude modulation.
 */
class PitchShifterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() { return []; }

  constructor() {
    super();

    /* ── PCM source buffer (set via message) ── */
    this.pcm    = null;
    this.pcmLen = 0;

    /* ── Grain config ── */
    this.G     = 2048;             /* grain length (~43 ms @ 48 kHz)  */
    this.halfG = this.G / 2;

    /* ── WSOLA search parameters ── */
    this.searchRange = 256;        /* ± samples to search             */
    this.tplLen      = 64;         /* correlation template length      */

    /* ── Hann window ── */
    this.win = new Float32Array(this.G);
    for (let i = 0; i < this.G; i++)
      this.win[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / this.G));

    /* ── Two read-heads, offset by halfG ── */
    this.grains = [
      { readPos: 0, phase: 0 },
      { readPos: 0, phase: this.halfG }
    ];

    this.outputPos = 0;
    this.playing   = false;

    /* ── Musical params (from main thread via MessagePort) ── */
    this.pitch        = 1.0;
    this.inflection   = 0;
    this.vibratoCents = 0;
    this.duration     = 1.0;
    this.loop         = false;
    this.sampleCtr    = 0;
    this.LFO_FREQ     = 6;
    this.lfoPhase     = 0;

    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.buffer) {
        this.pcm    = d.buffer;
        this.pcmLen = d.buffer.length;
      }
      if (d.pitch        !== undefined) this.pitch        = d.pitch;
      if (d.inflection   !== undefined) this.inflection   = d.inflection;
      if (d.vibratoCents !== undefined) this.vibratoCents = d.vibratoCents;
      if (d.duration     !== undefined) this.duration     = d.duration;
      if (d.loop         !== undefined) this.loop         = d.loop;
      if (d.play)  this.playing = true;
      if (d.stop)  this.playing = false;
      if (d.reset) {
        this.outputPos = 0;
        this.sampleCtr = 0;
        this.lfoPhase  = 0;
        this.grains[0].readPos = 0;
        this.grains[0].phase   = 0;
        this.grains[1].readPos = 0;
        this.grains[1].phase   = this.halfG;
      }
    };
  }

  /* Linear-interpolated read with optional loop-wrap */
  readSample(pos) {
    const len = this.pcmLen;
    if (this.loop) {
      pos = ((pos % len) + len) % len;
    } else if (pos < 0 || pos >= len) {
      return 0;
    }
    const i0 = Math.floor(pos);
    const f  = pos - i0;
    const i  = ((i0 % len) + len) % len;
    return this.pcm[i] * (1 - f) + this.pcm[(i + 1) % len] * f;
  }

  /* Fast integer read (no interpolation) for correlation search */
  readInt(pos) {
    const len = this.pcmLen;
    if (this.loop) {
      return this.pcm[((Math.floor(pos) % len) + len) % len];
    }
    const i = Math.floor(pos);
    if (i < 0 || i >= len) return 0;
    return this.pcm[i];
  }

  /**
   * WSOLA snap: find position near targetPos whose audio best
   * correlates with audio at refPos (the other grain's read-head).
   * This ensures the new grain starts in-phase with the ongoing grain.
   */
  wsolaSnap(refPos, targetPos) {
    const range = this.searchRange;
    const tpl   = this.tplLen;
    let bestOff  = 0;
    let bestCorr = -1e30;

    for (let off = -range; off <= range; off++) {
      let corr = 0;
      const cand = targetPos + off;
      for (let j = 0; j < tpl; j++) {
        corr += this.readInt(refPos + j) * this.readInt(cand + j);
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestOff  = off;
      }
    }
    return targetPos + bestOff;
  }

  process(inputs, outputs) {
    const out = outputs[0]?.[0];
    if (!out) return true;

    if (!this.playing || !this.pcm) { out.fill(0); return true; }

    const G   = this.G;
    const len = this.pcmLen;
    const totalSamples = Math.max(1, this.duration * sampleRate);

    for (let i = 0; i < out.length; i++) {

      /* ── Effective pitch factor ── */
      const progress = Math.min(1, this.sampleCtr / totalSamples);
      const rampedP  = this.pitch + this.inflection * progress;
      const lfo      = Math.sin(this.lfoPhase);
      const vibShift = rampedP * (Math.pow(2, this.vibratoCents * lfo / 1200) - 1);
      const pf       = Math.max(0.25, Math.min(4, rampedP + vibShift));

      this.lfoPhase += 2 * Math.PI * this.LFO_FREQ / sampleRate;
      if (this.lfoPhase > 6.2831853) this.lfoPhase -= 6.2831853;

      /* ── Mix two grains ── */
      let sum = 0;
      for (let k = 0; k < 2; k++) {
        const g = this.grains[k];
        sum += this.readSample(g.readPos) * this.win[g.phase];

        g.readPos += pf;
        if (this.loop) g.readPos = ((g.readPos % len) + len) % len;

        g.phase++;
        if (g.phase >= G) {
          g.phase = 0;
          /* WSOLA: snap near outputPos, phase-locked to the OTHER grain */
          const other = this.grains[1 - k];
          g.readPos = this.wsolaSnap(other.readPos, this.outputPos);
          if (this.loop) g.readPos = ((g.readPos % len) + len) % len;
        }
      }
      out[i] = sum;

      /* ── Advance output position (constant speed) ── */
      this.outputPos++;
      if (this.loop && this.outputPos >= len) this.outputPos -= len;

      /* ── Inflection ramp counter ── */
      this.sampleCtr++;
      if (this.loop && this.sampleCtr >= totalSamples) this.sampleCtr = 0;

      /* ── Non-loop: stop when source exhausted ── */
      if (!this.loop && this.outputPos >= len) {
        this.playing = false;
        out.fill(0, i + 1);
        break;
      }
    }

    return true;
  }
}
registerProcessor('pitch-shifter', PitchShifterProcessor);



