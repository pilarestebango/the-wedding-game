// Lightweight WebAudio-synthesized sound effects — no external audio files,
// so there's no music-licensing question to resolve (GAME_SPEC.md §8 item 5
// is sidestepped rather than answered; background music tracks are out of
// scope for this pass, see the plan). Gated by gameState.muted.

import { gameState } from '../state/gameState.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContextClass();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, duration = 0.12, type = 'square', volume = 0.15, startOffset = 0 }) {
  if (gameState.muted) return;
  const audioCtx = getCtx();
  const start = audioCtx.currentTime + startOffset;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  jump() {
    tone({ freq: 520, duration: 0.1, type: 'square' });
  },
  mashTick(pitchBoost = 0) {
    tone({ freq: 300 + pitchBoost, duration: 0.05, type: 'square', volume: 0.08 });
  },
  meterComplete() {
    tone({ freq: 660, duration: 0.18, type: 'triangle' });
    tone({ freq: 880, duration: 0.18, type: 'triangle', startOffset: 0.08 });
  },
  stumble() {
    tone({ freq: 220, duration: 0.2, type: 'sawtooth', volume: 0.12 });
    tone({ freq: 140, duration: 0.2, type: 'sawtooth', volume: 0.12, startOffset: 0.1 });
  },
  ringCollect() {
    tone({ freq: 988, duration: 0.1, type: 'sine' });
  },
  wrongAnswer() {
    tone({ freq: 160, duration: 0.25, type: 'sawtooth', volume: 0.18 });
    tone({ freq: 110, duration: 0.25, type: 'sawtooth', volume: 0.18, startOffset: 0.15 });
  },
  cashRegister() {
    tone({ freq: 1046, duration: 0.08, type: 'square', volume: 0.12 });
    tone({ freq: 1318, duration: 0.15, type: 'square', volume: 0.12, startOffset: 0.09 });
  },
  coinClink() {
    tone({ freq: 1400, duration: 0.05, type: 'triangle', volume: 0.14 });
    tone({ freq: 1800, duration: 0.07, type: 'triangle', volume: 0.1, startOffset: 0.04 });
  },
  fanfare() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      tone({ freq, duration: 0.22, type: 'triangle', volume: 0.16, startOffset: i * 0.12 });
    });
  },
  heart() {
    tone({ freq: 784, duration: 0.15, type: 'sine' });
    tone({ freq: 1046, duration: 0.2, type: 'sine', startOffset: 0.1 });
  },
};
