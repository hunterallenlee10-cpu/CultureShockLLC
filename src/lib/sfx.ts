'use client';
/**
 * UI sound design, synthesized with WebAudio (no audio files): a channel-flip
 * static burst and a soft tick. Only plays when the HUD sound toggle is on.
 */
import { store } from './bus';

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function ensure() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function sfxStatic(duration = 0.22, gain = 0.09) {
  if (!store.sound.get()) return;
  const c = ensure();
  if (!c || !noise) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400;
  bp.Q.value = 0.6;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.2, duration);
}

export function sfxTick(freq = 1800) {
  if (!store.sound.get()) return;
  const c = ensure();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime;
  o.type = 'square';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.025, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.06);
}

/** Called from the sound toggle's click so the AudioContext unlocks on a user gesture. */
export function unlockAudio() {
  ensure();
}
