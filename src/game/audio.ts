// Web Audio API Synthesizer (0ms Latency, Zero garbage collection, No new Audio() instances)

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private poseAudioCache: Record<string, HTMLAudioElement> = {};
  private tooruBgmTimer: ReturnType<typeof setInterval> | null = null;
  private tooruBgmTimeout: ReturnType<typeof setTimeout> | null = null;
  private tooruActiveOscillators: OscillatorNode[] = [];
  private tooruBgmIndex: number = 0;
  private isTooruBgmActive: boolean = false;
  private isWonderThemePlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('click', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // Quick punch / hit sound
  public playHit(isHeavy: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isHeavy ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(isHeavy ? 160 : 280, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + (isHeavy ? 0.12 : 0.06));

      gain.gain.setValueAtTime(isHeavy ? 0.4 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.12 : 0.06));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isHeavy ? 0.12 : 0.06));
    } catch {
      // AudioContext fallback guard
    }
  }

  // Rapid barrage rush hit (ORA / MUDA micro hits)
  public playBarrageHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // AudioContext guard
    }
  }

  // Authentic Anime Time Stop SFX (Multi-layered synthesized sound effect matching the anime)
  public playTimeStop(charId?: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const isDio = charId === 'dio';

      // 1. Initial Charge & Metallic Resonance Ring (Anime Stand Aura & Time Distort)
      const oscCharge = this.ctx.createOscillator();
      const gainCharge = this.ctx.createGain();
      const filterCharge = this.ctx.createBiquadFilter();

      oscCharge.type = 'sawtooth';
      filterCharge.type = 'bandpass';
      filterCharge.Q.setValueAtTime(8, now);
      filterCharge.frequency.setValueAtTime(400, now);
      filterCharge.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
      filterCharge.frequency.exponentialRampToValueAtTime(150, now + 0.9);

      oscCharge.frequency.setValueAtTime(isDio ? 180 : 220, now);
      oscCharge.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      oscCharge.frequency.exponentialRampToValueAtTime(45, now + 0.9);

      gainCharge.gain.setValueAtTime(0.4, now);
      gainCharge.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      oscCharge.connect(filterCharge);
      filterCharge.connect(gainCharge);
      gainCharge.connect(this.ctx.destination);

      oscCharge.start(now);
      oscCharge.stop(now + 0.9);

      // 2. The Iconic Anime Sub-Bass Plunge ("BWAAAMP" Vacuum Drop)
      const oscBass = this.ctx.createOscillator();
      const gainBass = this.ctx.createGain();
      const filterBass = this.ctx.createBiquadFilter();

      oscBass.type = 'sine';
      filterBass.type = 'lowpass';
      filterBass.frequency.setValueAtTime(800, now + 0.15);
      filterBass.frequency.exponentialRampToValueAtTime(60, now + 1.1);

      oscBass.frequency.setValueAtTime(320, now + 0.15);
      oscBass.frequency.exponentialRampToValueAtTime(28, now + 1.1);

      gainBass.gain.setValueAtTime(0.001, now);
      gainBass.gain.setValueAtTime(0.65, now + 0.15);
      gainBass.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      oscBass.connect(filterBass);
      filterBass.connect(gainBass);
      gainBass.connect(this.ctx.destination);

      oscBass.start(now + 0.15);
      oscBass.stop(now + 1.1);

      // 3. High-Pitched Glass/Time Freeze Shimmer
      const oscShimmer = this.ctx.createOscillator();
      const gainShimmer = this.ctx.createGain();

      oscShimmer.type = 'triangle';
      oscShimmer.frequency.setValueAtTime(1760, now + 0.2);
      oscShimmer.frequency.exponentialRampToValueAtTime(440, now + 0.8);

      gainShimmer.gain.setValueAtTime(0.001, now);
      gainShimmer.gain.setValueAtTime(0.3, now + 0.2);
      gainShimmer.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      oscShimmer.connect(gainShimmer);
      gainShimmer.connect(this.ctx.destination);

      oscShimmer.start(now + 0.2);
      oscShimmer.stop(now + 0.8);

      // 4. Time Ticking SFX Sequence (Tick... Tock... Tick...)
      for (let i = 0; i < 4; i++) {
        const tickTime = now + 0.35 + (i * 0.22);
        const oscTick = this.ctx.createOscillator();
        const gainTick = this.ctx.createGain();

        oscTick.type = 'square';
        oscTick.frequency.setValueAtTime(i % 2 === 0 ? 1200 : 800, tickTime);
        oscTick.frequency.exponentialRampToValueAtTime(300, tickTime + 0.04);

        gainTick.gain.setValueAtTime(0.25 - (i * 0.04), tickTime);
        gainTick.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.04);

        oscTick.connect(gainTick);
        gainTick.connect(this.ctx.destination);

        oscTick.start(tickTime);
        oscTick.stop(tickTime + 0.04);
      }
    } catch {
      // Audio guard
    }
  }

  // Time Resumes (Toki wa ugoki dasu)
  public playTimeResume() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext guard
    }
  }

  // Stand Summon aura whoosh
  public playStandSummon() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // AudioContext guard
    }
  }

  // Knife throw swish
  public playKnifeThrow() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext guard
    }
  }

  // Character Iconic JoJo Pose Emote Real Anime Voice & SFX Player
  public playPoseSound(charId: string) {
    if (this.isMuted) return;
    this.init();

    const baseUrl = import.meta.env.BASE_URL || '/';

    // Map character IDs to real downloaded anime sound files in public/sounds
    const soundMap: Record<string, string> = {
      jotaro: `${baseUrl}sounds/jotaro_pose.mp3`,
      dio: `${baseUrl}sounds/dio_pose.mp3`,
      josuke: `${baseUrl}sounds/josuke_pose.mp3`,
      crazy_diamond: `${baseUrl}sounds/josuke_pose.mp3`,
      diavolo: `${baseUrl}sounds/diavolo_pose.mp3`,
      king_crimson: `${baseUrl}sounds/diavolo_pose.mp3`,
      polnareff: `${baseUrl}sounds/polnareff_pose.mp3`,
      silver_chariot: `${baseUrl}sounds/polnareff_pose.mp3`,
      jonathan: `${baseUrl}sounds/jonathan_pose.mp3`,
      joseph_young: `${baseUrl}sounds/joseph_young_pose.mp3`,
      joseph_old: `${baseUrl}sounds/joseph_old_pose.mp3`,
      tooru: `${baseUrl}sounds/tooru_pose.mp3`,
    };

    const filePath = soundMap[charId] || `${baseUrl}sounds/jotaro_pose.mp3`;

    if (charId === 'jonathan') {
      this.playJonathanUrusai();
    } else if (charId === 'tooru') {
      this.playDododoTheme();
    } else if (charId === 'funny_valentine') {
      this.playDojyaaan();
    } else if (charId === 'dipez') {
      this.playDipezEvolution();
    }

    try {
      let audio = this.poseAudioCache[filePath];
      if (!audio) {
        audio = new Audio(filePath);
        this.poseAudioCache[filePath] = audio;
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.volume = 0.9;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Pose audio playback prevented or deferred:', err);
        });
      }
    } catch (e) {
      console.error('Failed to play real pose sound:', e);
    }
  }

  // Polnareff rapid rapier needle thrust sound (high speed piercing swoosh & metallic chime)
  public playRapierThrust() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. High-speed piercing whistle/swoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);

      // 2. Crisp metallic needle ting
      const ting = this.ctx.createOscillator();
      const tingGain = this.ctx.createGain();
      ting.type = 'sine';
      ting.frequency.setValueAtTime(1400 + Math.random() * 300, now);
      ting.frequency.exponentialRampToValueAtTime(600, now + 0.03);
      tingGain.gain.setValueAtTime(0.16, now);
      tingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      ting.connect(tingGain);
      tingGain.connect(this.ctx.destination);
      ting.start(now);
      ting.stop(now + 0.03);
    } catch {
      // AudioContext guard
    }
  }

  // Sans-style character dialogue voice chatter pitch blip
  public playDialogueBlip(charId: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (charId === 'jotaro') {
        // Deep resonant punchy pitch (like a stoic tough guy undertale chatter)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(115 + (Math.random() * 8 - 4), now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.045);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      } else if (charId === 'dio') {
        // Menacing raspy vampiric pitch
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(210 + (Math.random() * 12 - 6), now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (charId === 'crazy_diamond') {
        // Bouncy, youthful punk pitch (Josuke)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 + (Math.random() * 15 - 7.5), now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else if (charId === 'king_crimson') {
        // Dark mysterious low murmur / time-glitch blip (Diavolo)
        osc.type = 'square';
        osc.frequency.setValueAtTime(95 + (Math.random() * 6 - 3), now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.05);
        gain.gain.setValueAtTime(0.17, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (charId === 'silver_chariot') {
        // Sharp metallic fencer chime blip (Polnareff)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420 + (Math.random() * 18 - 9), now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.038);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
      } else if (charId === 'jonathan') {
        // Noble, righteous, resonant baritone hero voice blip (Jonathan Joestar)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(145 + (Math.random() * 10 - 5), now);
        osc.frequency.exponentialRampToValueAtTime(105, now + 0.045);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      } else if (charId === 'joseph_young') {
        // High energy, cheeky, cocky young trickster voice blip (Young Joseph)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320 + (Math.random() * 20 - 10), now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else if (charId === 'joseph_old') {
        // Wise, gravelly veteran voice blip (Old Joseph)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + (Math.random() * 10 - 5), now);
        osc.frequency.exponentialRampToValueAtTime(85, now + 0.05);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (charId === 'gappy') {
        // Soft bubbly water-like pitch blip (Gappy - Soft & Wet)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280 + (Math.random() * 16 - 8), now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.04);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else if (charId === 'tooru') {
        // Smooth nonchalant vinyl/cassette lo-fi pitch (Tooru)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(210 + (Math.random() * 12 - 6), now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (charId === 'funny_valentine') {
        // Eloquent, resolute presidential voice blip with dimensional shimmer resonance (Valentine)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260 + (Math.random() * 12 - 6), now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.045);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      } else {
        // Default stickman arcade blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(260 + (Math.random() * 10 - 5), now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // AudioContext guard
    }
  }

  // Jonathan Special "NANI O SURONDA, URUSAI!" Anime Voice SFX
  public playJonathanUrusai() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [350, 420, 480, 520, 380, 560, 620];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const time = now + (idx * 0.07);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, time + 0.06);

        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.06);
      });
    } catch {
      // Audio guard
    }
  }

  // Jonathan Hamon Electric Buzzing & Ripple Hum (波紋疾走)
  public playHamonBuzz() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext guard
    }
  }

  // Jonathan Deep Hamon Breathing (Sendo Seimei Jiki / 仙道生命磁気呼吸)
  public playHamonBreath() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.35);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext guard
    }
  }

  // Sword of Luck & Pluck Heroic Slash (Metallic woosh & Hamon spark)
  public playSwordSlash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Sharp metallic blade zing
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // 2. High-speed wind cut
      const swoosh = this.ctx.createOscillator();
      const swooshGain = this.ctx.createGain();
      swoosh.type = 'sawtooth';
      swoosh.frequency.setValueAtTime(600, now);
      swoosh.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      swooshGain.gain.setValueAtTime(0.22, now);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      swoosh.connect(swooshGain);
      swooshGain.connect(this.ctx.destination);
      swoosh.start(now);
      swoosh.stop(now + 0.18);
    } catch {
      // AudioContext guard
    }
  }

  // Sunlight Yellow Overdrive Sunburst Detonation (Sunlight Boom)
  public playOverdriveExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Bright high resonant sun flare
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(720, now);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.4);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // 2. Heavy bass shockwave
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(180, now);
      osc2.frequency.exponentialRampToValueAtTime(32, now + 0.55);
      gain2.gain.setValueAtTime(0.45, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.55);
    } catch {
      // AudioContext guard
    }
  }

  // Young Joseph Clacker Volley Rattle
  public playClackerRattle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + i * 150, now + i * 0.03);
        osc.frequency.exponentialRampToValueAtTime(300, now + i * 0.03 + 0.02);
        gain.gain.setValueAtTime(0.2, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.02);
      }
    } catch {
      // AudioContext guard
    }
  }

  // Young Joseph Tommy Gun Burst
  public playTommyGun() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(450 + Math.random() * 100, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // AudioContext guard
    }
  }

  // Old Joseph Hermit Purple Vine Stretch & Whip
  public playHermitVineWhip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // AudioContext guard
    }
  }

  // Old Joseph Spirit Photo Camera Flash & Smash
  public playSpiritPhotoFlash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext guard
    }
  }

  // Start continuous Match BGM for Tooru ("The Wonder of You" Elvis Presley Synth) right from match start!
  public startTooruMatchBgm() {
    if (this.isTooruBgmActive) return;
    this.isTooruBgmActive = true;
    this.tooruBgmIndex = 0;

    // Play immediately on match start
    this.playNextTooruBgmNote();
  }

  // Stop Tooru Match BGM immediately when match ends or player leaves
  public stopTooruMatchBgm() {
    this.isTooruBgmActive = false;
    this.isWonderThemePlaying = false;
    this.tooruBgmIndex = 0;

    if (this.tooruBgmTimeout !== null) {
      clearTimeout(this.tooruBgmTimeout);
      this.tooruBgmTimeout = null;
    }
    if (this.tooruBgmTimer !== null) {
      clearInterval(this.tooruBgmTimer);
      this.tooruBgmTimer = null;
    }

    // Stop and disconnect any ongoing oscillators
    this.tooruActiveOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.tooruActiveOscillators = [];
  }

  // Universal BGM stopper (called on unmount / navigation)
  public stopAllBgm() {
    this.stopTooruMatchBgm();
    Object.values(this.poseAudioCache).forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
  }

  // Sequenced playback of Elvis Presley's "The Wonder of You" note-by-note to avoid Web Audio thread crashes
  private playNextTooruBgmNote() {
    if (!this.isTooruBgmActive || this.isMuted) {
      this.stopTooruMatchBgm();
      return;
    }
    this.init();
    if (!this.ctx) return;

    const wonderMelody = [
      // Verse 1: "When no one else can understand me..."
      { f: 261.63, d: 0.35, vol: 0.28 }, // C4 ("When")
      { f: 293.66, d: 0.35, vol: 0.28 }, // D4 ("no")
      { f: 329.63, d: 0.40, vol: 0.30 }, // E4 ("one")
      { f: 392.00, d: 0.48, vol: 0.32 }, // G4 ("else")
      { f: 349.23, d: 0.35, vol: 0.28 }, // F4 ("can")
      { f: 329.63, d: 0.35, vol: 0.28 }, // E4 ("un-")
      { f: 293.66, d: 0.40, vol: 0.28 }, // D4 ("der-")
      { f: 261.63, d: 0.60, vol: 0.30 }, // C4 ("stand me...")

      // Verse 2: "When everything I do is wrong..."
      { f: 293.66, d: 0.35, vol: 0.28 }, // D4 ("When")
      { f: 329.63, d: 0.35, vol: 0.28 }, // E4 ("eve-")
      { f: 349.23, d: 0.40, vol: 0.30 }, // F4 ("ry-")
      { f: 440.00, d: 0.48, vol: 0.32 }, // A4 ("thing")
      { f: 392.00, d: 0.35, vol: 0.28 }, // G4 ("I")
      { f: 349.23, d: 0.35, vol: 0.28 }, // F4 ("do")
      { f: 329.63, d: 0.40, vol: 0.28 }, // E4 ("is")
      { f: 293.66, d: 0.70, vol: 0.30 }, // D4 ("wrong...")

      // Climax Chorus: "You give me hope and consolation... That's the Wonder of You!"
      { f: 329.63, d: 0.35, vol: 0.30 }, // E4 ("You")
      { f: 392.00, d: 0.35, vol: 0.32 }, // G4 ("give")
      { f: 440.00, d: 0.40, vol: 0.34 }, // A4 ("me")
      { f: 523.25, d: 0.65, vol: 0.38 }, // C5 ("WON-")
      { f: 493.88, d: 0.50, vol: 0.34 }, // B4 ("DER")
      { f: 440.00, d: 0.40, vol: 0.32 }, // A4 ("OF")
      { f: 392.00, d: 0.90, vol: 0.42 }, // G4 ("YOU!")
    ];

    const note = wonderMelody[this.tooruBgmIndex];
    if (!note) {
      // Loop back to start
      this.tooruBgmIndex = 0;
      if (this.isTooruBgmActive && !this.isMuted) {
        this.tooruBgmTimeout = setTimeout(() => this.playNextTooruBgmNote(), 500);
      }
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const oscLead = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscLead.type = 'triangle';
      oscSub.type = 'sine';

      oscLead.frequency.setValueAtTime(note.f, now);
      oscSub.frequency.setValueAtTime(note.f * 0.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(note.vol * 1.5, now + 0.04);
      gain.gain.linearRampToValueAtTime(0.001, now + note.d);

      oscLead.connect(gain);
      oscSub.connect(gain);
      gain.connect(this.ctx.destination);

      this.tooruActiveOscillators.push(oscLead, oscSub);

      oscLead.onended = () => {
        this.tooruActiveOscillators = this.tooruActiveOscillators.filter(o => o !== oscLead);
      };
      oscSub.onended = () => {
        this.tooruActiveOscillators = this.tooruActiveOscillators.filter(o => o !== oscSub);
      };

      oscLead.start(now);
      oscSub.start(now);

      oscLead.stop(now + note.d);
      oscSub.stop(now + note.d);

      this.tooruBgmIndex = (this.tooruBgmIndex + 1) % wonderMelody.length;

      // Schedule next note with tiny overlap (legato feel)
      if (this.isTooruBgmActive && !this.isMuted) {
        const delayMs = note.d * 920;
        this.tooruBgmTimeout = setTimeout(() => this.playNextTooruBgmNote(), delayMs);
      }
    } catch (e) {
      console.warn('Tooru sequencer playback deferred:', e);
      if (this.isTooruBgmActive && !this.isMuted) {
        this.tooruBgmTimeout = setTimeout(() => this.playNextTooruBgmNote(), 1000);
      }
    }
  }

  // Synthesized Retro Cover of Elvis Presley's "The Wonder of You" (LOUD & CLEAR VOLUME)
  public playElvisWonderOfYouTheme(force: boolean = false) {
    if (force) {
      this.startTooruMatchBgm();
    }
  }

  // Tooru Skill Chime (Quick retro 80s cassette chime)
  public playDododoTheme() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [440, 554, 659, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch {
      // AudioContext guard
    }
  }

  // Calamity Flow Trigger Sound (Dark ominous reverse pulse)
  public playTooruCalamity() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // AudioContext guard
    }
  }

  // Sudden Lightning Calamity Strike
  public playLightningStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext guard
    }
  }

  // Flying Vehicle / Runaway Car Crash
  public playCarCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Screech
      const screech = this.ctx.createOscillator();
      const screechGain = this.ctx.createGain();
      screech.type = 'triangle';
      screech.frequency.setValueAtTime(900, now);
      screech.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      screechGain.gain.setValueAtTime(0.3, now);
      screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      screech.connect(screechGain);
      screechGain.connect(this.ctx.destination);
      screech.start(now);
      screech.stop(now + 0.15);

      // Impact Crash Boom
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'square';
      boom.frequency.setValueAtTime(150, now + 0.1);
      boom.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      boomGain.gain.setValueAtTime(0.38, now + 0.1);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start(now + 0.1);
      boom.stop(now + 0.45);
    } catch {
      // AudioContext guard
    }
  }

  // Extinction Meteor Explosion
  public playMeteorExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // AudioContext guard
    }
  }

  // Rock Insects Crawl / Hiss
  public playRockInsectHiss() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext guard
    }
  }

  // Debris Falling Smash
  public playDebrisSmash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext guard
    }
  }

  // Razor Sharp Cut
  public playRazorCut() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // AudioContext guard
    }
  }

  // --- ENRICO PUCCI & EVOLUTION AUDIO SUITE ---

  // Whitesnake Pistol Shot
  public playPucciPistol() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Gunshot noise / snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Audio guard
    }
  }

  // Whitesnake DISC Extract / Insertion
  public playPucciDisc() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio guard
    }
  }

  // Whitesnake Acid Melt Sizzle
  public playPucciAcid() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio guard
    }
  }

  // 14 Words Gregorian / Sacred Chant Chime
  public play14WordsChant(step: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 261.63 * Math.pow(1.059463, (step % 12)); // Chromatic holy tones
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio guard
    }
  }

  // C-Moon Gravity Shift Resonance
  public playCmoonGravity() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio guard
    }
  }

  // C-Moon Surface Inversion Strike
  public playCmoonInversion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio guard
    }
  }

  // Made in Heaven Extreme Acceleration Rush
  public playMiHAcceleration() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.28);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Audio guard
    }
  }

  // Pucci Whitesnake Pistol Shot
  public playPucciGunshot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Pucci Whitesnake Acid Melt Sizzling
  public playAcidMelt() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Pucci 14 Words Chanting Sound
  public playPucciChant() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Pucci Evolution Chime
  public playPucciEvolution() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1280, now + 0.4);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // Made in Heaven Speed Blitz Dash
  public playMiHBlitz() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Made in Heaven Accelerated Knife Throw
  public playMiHKnife() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Universe Reset Ultimate Reality Glitch & Ascension
  public playUniverseReset() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High cosmic drone + exploding chord
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.linearRampToValueAtTime(1760, now + 1.2);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(110, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 1.2);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
    } catch {
      // Audio guard
    }
  }

  // Soft & Wet Bubble Pop SFX
  public playBubblePop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Soft & Wet Plunder Theft SFX
  public playBubblePlunder() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Go Beyond Invisible Line Launch SFX
  public playGoBeyondLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Go Beyond Manga Explosive Burst SFX
  public playGoBeyondExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.8);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.linearRampToValueAtTime(100, now + 0.8);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch {}
  }

  // Funny Valentine - Dojyaaa~~n Dimensional Warp Chord
  public playDojyaaan() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Multi-harmonic chime (F#, A#, C#, F) for majestic dimensional warp
      const freqs = [370, 466, 554, 740];
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.6);
        gain.gain.setValueAtTime(0.2, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.7);
      });
    } catch {}
  }

  // Funny Valentine - Flag Sandwich Warp Whoosh
  public playFlagSandwich() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  // Funny Valentine - Paradox Menger Sponge Collision Shatter
  public playParadoxCollision() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Heavy sub-bass crunch + high crystal shatter
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.8);

      // Metallic shattering resonance
      const shatterOsc = this.ctx.createOscillator();
      const shatterGain = this.ctx.createGain();
      shatterOsc.type = 'sawtooth';
      shatterOsc.frequency.setValueAtTime(1200, now);
      shatterOsc.frequency.linearRampToValueAtTime(300, now + 0.5);
      shatterGain.gain.setValueAtTime(0.35, now);
      shatterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      shatterOsc.connect(shatterGain);
      shatterGain.connect(this.ctx.destination);
      shatterOsc.start(now);
      shatterOsc.stop(now + 0.5);
    } catch {}
  }

  // Funny Valentine - Love Train Holy Light Activate
  public playLoveTrainActivate() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major holy chord
      chords.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 1.4);
      });
    } catch {}
  }

  // Funny Valentine - Love Train Misfortune Redirection
  public playLoveTrainRedirect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Dipez - Skill 1: Photon Bullet ("Tch")
  public playDipezTch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  // Dipez - Skill 2: Flashbang ("Die you!!!")
  public playDipezDieYou() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // White noise explosion + high frequency flash shine
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      whiteNoise.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(now);
    } catch {}
  }

  // Dipez - Skill 3: Arm Vanish Drawback ("whaa!!!")
  public playDipezWhaa() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  // Dipez - Skill 4: Pure Light Evolution ("Finally, finally, my power has increased!!!")
  public playDipezEvolution() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      arpeggio.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {}
  }

  // Dipez - Barrage Cry: "WHOAAAA!!!"
  public playDipezWhoaaa() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Dipez - Evolved Skill 4: Star Maker
  public playDipezStarMaker() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 1.2);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    } catch {}
  }
}

export const soundManager = new SoundSynthesizer();
