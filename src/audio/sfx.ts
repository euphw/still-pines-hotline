type AudioCtor = new () => AudioContext;

function getAudioCtor(): AudioCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext;
}

/**
 * Tiny synthesized sound effects. Off by default; the first enable() must come
 * from a user gesture. Every method is a safe no-op without WebAudio.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private ambientNodes: Array<OscillatorNode | GainNode> = [];
  private on = false;

  get enabled(): boolean {
    return this.on;
  }

  get supported(): boolean {
    return getAudioCtor() !== undefined;
  }

  setEnabled(value: boolean): void {
    this.on = value && this.supported;
    if (this.on) {
      this.ensureContext();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
      return this.ctx;
    }
    const Ctor = getAudioCtor();
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.on) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Ignore audio failures; the app works without sound.
    }
  }

  /** The answering machine beep. */
  beep(): void {
    this.tone(980, 0.45, 'sine', 0.12);
  }

  /** Mechanical button press. */
  click(): void {
    this.tone(140, 0.08, 'square', 0.07);
  }

  /** Soft chime when a message is saved. */
  chime(): void {
    this.tone(420, 0.5, 'triangle', 0.08);
  }

  private startAmbient(): void {
    if (this.ambientNodes.length > 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const gain = ctx.createGain();
      gain.gain.value = 0.025;
      gain.connect(ctx.destination);
      // Two close low frequencies produce a slow, uneasy beating hum.
      for (const freq of [55, 58.5]) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start();
        this.ambientNodes.push(osc);
      }
      this.ambientNodes.push(gain);
    } catch {
      this.ambientNodes = [];
    }
  }

  private stopAmbient(): void {
    for (const node of this.ambientNodes) {
      try {
        if ('stop' in node) node.stop();
        node.disconnect();
      } catch {
        // already stopped
      }
    }
    this.ambientNodes = [];
  }
}
