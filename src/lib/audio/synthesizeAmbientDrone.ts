/**
 * synthesizeAmbientDrone.ts
 *
 * SOUNDSCAPE-SYNTH-001: replaces the Cloudinary CDN dependency in
 * useSoundscapeAudioLoader.ts. The Cloudinary "soundscapes" folder this app
 * pointed at was never actually populated — public/soundscape-manifest.json
 * is a setup TEMPLATE ("Replace CLOUDINARY_URL...", "Upload all 20 MP3
 * files") that was never completed, confirmed live (every track 404s,
 * including the ones previously assumed "known good"). Per product decision
 * (2026-08-30): stop depending on an external CDN for this feature at all —
 * generate a soft ambient drone for every soundscape procedurally, live, in
 * the user's own browser via the Web Audio API. No network request, no
 * external asset, no license/hosting concerns.
 *
 * Approach: each soundscape id maps to a small set of musical/DSP
 * parameters (register, chord/interval stack, filter brightness, how much
 * filtered noise/"air" to mix in, a slow breathing LFO, and how much of a
 * cheap algorithmic reverb to apply). One shared render function turns any
 * parameter set into a seamless, loopable stereo AudioBuffer using an
 * OfflineAudioContext (rendered as fast as the CPU allows, not in real
 * time — a ~24s stereo buffer with a handful of oscillators/filters renders
 * in well under a second). The loop seam is closed with a manual crossfade
 * so source.loop = true (SoundscapePlayer.tsx) doesn't click.
 */

export type DroneCharacter = 'pad' | 'pulse' | 'pluck' | 'noise-wash';

export interface DroneParams {
  /** Root frequency in Hz — sets the overall register. */
  rootFreq: number;
  /** Semitone offsets stacked on the root (the drone's chord/cluster). */
  intervals: number[];
  /** Overall shaping behavior. */
  character: DroneCharacter;
  /** Lowpass filter cutoff in Hz — higher = brighter. */
  filterCutoff: number;
  filterQ: number;
  /** 0-1 — how much filtered noise ("air"/wind/breath) is mixed in. */
  noiseMix: number;
  /** Hz — speed of the slow filter/amplitude "breathing" modulation. */
  lfoRate: number;
  /** 0-1 — depth of that breathing modulation. */
  lfoDepth: number;
  /** Cents — chorus-style detune width between paired oscillators. */
  detuneCents: number;
  /** Hz — only used when character === 'pulse'. */
  pulseRate?: number;
  /** Seconds between plucked notes — only used when character === 'pluck'. */
  pluckInterval?: number;
  /** 0-1 — send level into the algorithmic reverb bus. */
  reverbAmount: number;
  /** 0-1 — overall output level before the caller's own gain staging. */
  gain: number;
}

const DEFAULT_PARAMS: DroneParams = {
  rootFreq: 174.6, // F3
  intervals: [0, 7],
  character: 'pad',
  filterCutoff: 1300,
  filterQ: 0.7,
  noiseMix: 0.08,
  lfoRate: 0.07,
  lfoDepth: 0.3,
  detuneCents: 8,
  reverbAmount: 0.25,
  gain: 0.5,
};

/**
 * One entry per id in SoundscapeEngine.ts's SOUNDSCAPE_LIBRARY. Registers
 * and voicings are chosen from each soundscape's own audioCharacter /
 * audioStyle / descriptionThai so the 21 tracks are audibly distinct
 * families (dark/deep vs. warm/morning vs. bright/energetic vs. sparse
 * night), not 21 copies of the same pad.
 */
export const SOUNDSCAPE_SYNTH_PARAMS: Record<string, DroneParams> = {
  'morning-forest': {
    rootFreq: 196.0, intervals: [0, 7, 12], character: 'noise-wash',
    filterCutoff: 2200, filterQ: 0.6, noiseMix: 0.38, lfoRate: 0.15, lfoDepth: 0.4,
    detuneCents: 6, reverbAmount: 0.25, gain: 0.45,
  },
  'morning-focus': {
    rootFreq: 220.0, intervals: [0, 5, 9], character: 'pulse',
    filterCutoff: 1600, filterQ: 0.7, noiseMix: 0.12, lfoRate: 0.1, lfoDepth: 0.25,
    detuneCents: 7, pulseRate: 0.5, reverbAmount: 0.2, gain: 0.45,
  },
  'morning-gentle': {
    rootFreq: 174.6, intervals: [0, 4, 7], character: 'pad',
    filterCutoff: 1200, filterQ: 0.6, noiseMix: 0.05, lfoRate: 0.08, lfoDepth: 0.3,
    detuneCents: 6, reverbAmount: 0.3, gain: 0.45,
  },
  'deep-work': {
    rootFreq: 130.8, intervals: [0, 7], character: 'pulse',
    filterCutoff: 900, filterQ: 0.8, noiseMix: 0.03, lfoRate: 0.08, lfoDepth: 0.2,
    detuneCents: 5, pulseRate: 0.8, reverbAmount: 0.1, gain: 0.5,
  },
  'afternoon-creative': {
    rootFreq: 246.9, intervals: [0, 4, 7, 11], character: 'pad',
    filterCutoff: 2600, filterQ: 0.9, noiseMix: 0.06, lfoRate: 0.3, lfoDepth: 0.35,
    detuneCents: 12, reverbAmount: 0.25, gain: 0.4,
  },
  'afternoon-calm': {
    rootFreq: 196.0, intervals: [0, 5, 7], character: 'pad',
    filterCutoff: 1500, filterQ: 0.6, noiseMix: 0.1, lfoRate: 0.06, lfoDepth: 0.25,
    detuneCents: 6, reverbAmount: 0.2, gain: 0.45,
  },
  'discovery-mode': {
    rootFreq: 146.8, intervals: [0, 7, 14, 19], character: 'pad',
    filterCutoff: 2000, filterQ: 0.7, noiseMix: 0.08, lfoRate: 0.05, lfoDepth: 0.4,
    detuneCents: 20, reverbAmount: 0.5, gain: 0.4,
  },
  'evening-reflection': {
    rootFreq: 261.6, intervals: [0, 4, 7, 12], character: 'pluck',
    filterCutoff: 3000, filterQ: 0.5, noiseMix: 0.02, lfoRate: 0.05, lfoDepth: 0.15,
    detuneCents: 4, pluckInterval: 2.8, reverbAmount: 0.4, gain: 0.4,
  },
  'relationship-evening': {
    rootFreq: 196.0, intervals: [0, 4, 7], character: 'pad',
    filterCutoff: 1400, filterQ: 0.6, noiseMix: 0.08, lfoRate: 0.07, lfoDepth: 0.25,
    detuneCents: 7, reverbAmount: 0.3, gain: 0.45,
  },
  'evening-release': {
    rootFreq: 164.8, intervals: [0, 7], character: 'pad',
    filterCutoff: 1000, filterQ: 0.6, noiseMix: 0.15, lfoRate: 0.05, lfoDepth: 0.3,
    detuneCents: 6, reverbAmount: 0.4, gain: 0.4,
  },
  'spiritual-evening': {
    rootFreq: 136.1, intervals: [0, 7, 12], character: 'pad',
    filterCutoff: 1300, filterQ: 0.5, noiseMix: 0.05, lfoRate: 0.04, lfoDepth: 0.2,
    detuneCents: 3, reverbAmount: 0.5, gain: 0.4,
  },
  'night-ambient': {
    rootFreq: 82.4, intervals: [0, 7], character: 'pad',
    filterCutoff: 700, filterQ: 0.7, noiseMix: 0.1, lfoRate: 0.04, lfoDepth: 0.25,
    detuneCents: 6, reverbAmount: 0.4, gain: 0.5,
  },
  'night-focus': {
    rootFreq: 98.0, intervals: [0, 5], character: 'pulse',
    filterCutoff: 850, filterQ: 0.8, noiseMix: 0.03, lfoRate: 0.06, lfoDepth: 0.2,
    detuneCents: 5, pulseRate: 1.2, reverbAmount: 0.15, gain: 0.5,
  },
  'night-identity': {
    rootFreq: 110.0, intervals: [0, 7, 19], character: 'pad',
    filterCutoff: 900, filterQ: 0.6, noiseMix: 0.06, lfoRate: 0.035, lfoDepth: 0.3,
    detuneCents: 25, reverbAmount: 0.55, gain: 0.45,
  },
  'night-wind-down': {
    rootFreq: 65.4, intervals: [0, 7], character: 'pad',
    filterCutoff: 500, filterQ: 0.6, noiseMix: 0.08, lfoRate: 0.03, lfoDepth: 0.2,
    detuneCents: 4, reverbAmount: 0.35, gain: 0.5,
  },
  celebration: {
    rootFreq: 261.6, intervals: [0, 4, 7, 12, 16], character: 'pluck',
    filterCutoff: 3500, filterQ: 0.7, noiseMix: 0.04, lfoRate: 0.2, lfoDepth: 0.3,
    detuneCents: 15, pluckInterval: 1.4, reverbAmount: 0.3, gain: 0.4,
  },
  'health-nature': {
    rootFreq: 174.6, intervals: [0, 7, 12], character: 'noise-wash',
    filterCutoff: 1800, filterQ: 0.6, noiseMix: 0.42, lfoRate: 0.12, lfoDepth: 0.35,
    detuneCents: 6, reverbAmount: 0.3, gain: 0.45,
  },
  'money-clarity': {
    rootFreq: 220.0, intervals: [0, 7], character: 'pad',
    filterCutoff: 2000, filterQ: 0.5, noiseMix: 0.02, lfoRate: 0.05, lfoDepth: 0.15,
    detuneCents: 4, reverbAmount: 0.15, gain: 0.45,
  },
  'creativity-flow': {
    rootFreq: 220.0, intervals: [0, 4, 7, 11], character: 'pluck',
    filterCutoff: 2400, filterQ: 0.7, noiseMix: 0.06, lfoRate: 0.15, lfoDepth: 0.3,
    detuneCents: 10, pluckInterval: 3.6, reverbAmount: 0.3, gain: 0.4,
  },
  'ambient-minimal': {
    rootFreq: 174.6, intervals: [0, 7], character: 'pad',
    filterCutoff: 1300, filterQ: 0.5, noiseMix: 0.08, lfoRate: 0.06, lfoDepth: 0.2,
    detuneCents: 6, reverbAmount: 0.25, gain: 0.45,
  },
  'deep-reflection-universal': {
    rootFreq: 130.8, intervals: [0, 7, 12], character: 'pad',
    filterCutoff: 1000, filterQ: 0.5, noiseMix: 0.1, lfoRate: 0.04, lfoDepth: 0.25,
    detuneCents: 5, reverbAmount: 0.4, gain: 0.45,
  },
};

function semitoneToFreq(root: number, semitones: number): number {
  return root * Math.pow(2, semitones / 12);
}

function createNoiseBuffer(ctx: OfflineAudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Cheap algorithmic ambience: two feedback delay lines with a lowpass in
 *  the loop, mixed with the dry signal by `wetLevel`. Not a real reverb
 *  impulse response (none is bundled — no external assets), but gives slow
 *  ambient pads a sense of space instead of sounding completely dry. */
function buildReverbSend(ctx: OfflineAudioContext, wetLevel: number): { input: GainNode; output: GainNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  output.gain.value = wetLevel;

  const delayTimes = [0.29, 0.37];
  for (const time of delayTimes) {
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = time;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.55;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2200;

    input.connect(delay);
    delay.connect(lowpass);
    lowpass.connect(feedback);
    feedback.connect(delay);
    lowpass.connect(output);
  }

  return { input, output };
}

function buildDroneGraph(ctx: OfflineAudioContext, params: DroneParams, durationSec: number, master: GainNode) {
  const reverb = buildReverbSend(ctx, params.reverbAmount);
  reverb.output.connect(master);

  const dry = ctx.createGain();
  dry.gain.value = 1 - params.reverbAmount * 0.5;
  dry.connect(master);
  dry.connect(reverb.input);

  // Slow filter-cutoff "breathing" LFO shared by the pad/noise layers.
  const filterLfo = ctx.createOscillator();
  filterLfo.frequency.value = params.lfoRate;
  const filterLfoGain = ctx.createGain();
  filterLfoGain.gain.value = params.filterCutoff * params.lfoDepth;
  filterLfo.connect(filterLfoGain);
  filterLfo.start(0);
  filterLfo.stop(durationSec);

  // Slow amplitude "breathing" LFO for the whole pad bed.
  const ampLfo = ctx.createOscillator();
  ampLfo.frequency.value = Math.max(0.02, params.lfoRate * 0.6);
  const ampLfoGain = ctx.createGain();
  ampLfoGain.gain.value = 0.15;
  const ampBase = ctx.createConstantSource();
  ampBase.offset.value = 0.85;
  ampLfo.connect(ampLfoGain);
  ampLfo.start(0);
  ampLfo.stop(durationSec);
  ampBase.start(0);
  ampBase.stop(durationSec);

  const padGain = ctx.createGain();
  padGain.gain.value = 0; // driven entirely by ampBase + ampLfoGain below
  ampBase.connect(padGain.gain);
  ampLfoGain.connect(padGain.gain);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = params.filterCutoff;
  filter.Q.value = params.filterQ;
  filterLfoGain.connect(filter.frequency);

  padGain.connect(filter);
  filter.connect(dry);

  const perNoteGain = 0.7 / Math.max(1, params.intervals.length);
  for (const semitones of params.intervals) {
    const freq = semitoneToFreq(params.rootFreq, semitones);
    for (const sign of [-1, 1]) {
      const osc = ctx.createOscillator();
      osc.type = semitones <= 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = sign * params.detuneCents;
      const noteGain = ctx.createGain();
      noteGain.gain.value = perNoteGain * 0.5;
      osc.connect(noteGain);
      noteGain.connect(padGain);
      osc.start(0);
      osc.stop(durationSec);
    }
  }

  if (params.noiseMix > 0) {
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = createNoiseBuffer(ctx, Math.min(durationSec, 4));
    noiseSrc.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = params.character === 'noise-wash' ? 'bandpass' : 'lowpass';
    noiseFilter.frequency.value = params.filterCutoff * 0.7;
    noiseFilter.Q.value = 0.8;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = params.noiseMix;
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dry);
    noiseGain.connect(reverb.input);
    noiseSrc.start(0);
    noiseSrc.stop(durationSec);
  }

  if (params.character === 'pulse' && params.pulseRate) {
    const pulseLfo = ctx.createOscillator();
    pulseLfo.type = 'sine';
    pulseLfo.frequency.value = params.pulseRate;
    const pulseShape = ctx.createGain();
    pulseShape.gain.value = 0.25;
    const pulseOffset = ctx.createConstantSource();
    pulseOffset.offset.value = 0.75;
    pulseLfo.connect(pulseShape);
    pulseShape.connect(padGain.gain);
    pulseOffset.connect(padGain.gain);
    pulseLfo.start(0);
    pulseLfo.stop(durationSec);
    pulseOffset.start(0);
    pulseOffset.stop(durationSec);
  }

  if (params.character === 'pluck' && params.pluckInterval) {
    // Quieten the sustained pad bed so plucked notes read clearly on top.
    padGain.gain.cancelScheduledValues(0);
    padGain.gain.value = 0;
    ampBase.disconnect();
    ampLfoGain.disconnect();
    const quietBase = ctx.createConstantSource();
    quietBase.offset.value = 0.35;
    quietBase.connect(padGain.gain);
    quietBase.start(0);
    quietBase.stop(durationSec);
    ampLfoGain.connect(padGain.gain);

    let t = 0.5;
    let step = 0;
    while (t < durationSec - 1) {
      const semitones = params.intervals[step % params.intervals.length];
      const freq = semitoneToFreq(params.rootFreq, semitones + 12); // an octave up from the pad bed
      const pluckOsc = ctx.createOscillator();
      pluckOsc.type = 'triangle';
      pluckOsc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.5, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      pluckOsc.connect(env);
      env.connect(filter);
      pluckOsc.start(t);
      pluckOsc.stop(t + 2.3);
      t += params.pluckInterval;
      step += 1;
    }
  }
}

/**
 * Renders a seamless, loopable stereo ambient drone for `soundscapeId` into
 * an AudioBuffer usable with `audioContext` (matching sample rate). Falls
 * back to SOUNDSCAPE_SYNTH_PARAMS['ambient-minimal'] (or DEFAULT_PARAMS if
 * even that is somehow missing) for an unrecognized id, so this never
 * throws for a bad id — only for genuine Web Audio failures.
 */
export async function synthesizeSoundscapeBuffer(
  soundscapeId: string,
  audioContext: BaseAudioContext,
  durationSec = 24
): Promise<AudioBuffer> {
  const params = SOUNDSCAPE_SYNTH_PARAMS[soundscapeId] ?? SOUNDSCAPE_SYNTH_PARAMS['ambient-minimal'] ?? DEFAULT_PARAMS;
  const fadeSec = 2;
  const sampleRate = audioContext.sampleRate;
  const totalSec = durationSec + fadeSec;

  const OfflineCtor: typeof OfflineAudioContext =
    (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtor(2, Math.ceil(totalSec * sampleRate), sampleRate);

  const master = offlineCtx.createGain();
  master.gain.value = params.gain;
  master.connect(offlineCtx.destination);

  buildDroneGraph(offlineCtx, params, totalSec, master);

  const rendered = await offlineCtx.startRendering();

  // Close the loop seam: blend the tail into the head so
  // AudioBufferSourceNode.loop = true doesn't click at the wrap-around.
  const loopLen = Math.floor(durationSec * sampleRate);
  const fadeLen = Math.floor(fadeSec * sampleRate);
  const output = audioContext.createBuffer(rendered.numberOfChannels, loopLen, sampleRate);

  for (let ch = 0; ch < rendered.numberOfChannels; ch++) {
    const src = rendered.getChannelData(ch);
    const dst = output.getChannelData(ch);
    for (let i = 0; i < loopLen; i++) {
      dst[i] = src[i];
    }
    for (let i = 0; i < fadeLen; i++) {
      const t = i / fadeLen; // 0 -> 1 across the fade window
      const tailSample = src[loopLen + i] ?? 0;
      dst[i] = dst[i] * t + tailSample * (1 - t);
    }
  }

  return output;
}

export default synthesizeSoundscapeBuffer;
