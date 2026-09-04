import { Fighter, InputState, MatchConfig } from '../types';
import { TIME_STOP_ENERGY_COST, ROAD_ROLLER_COST, BARRAGE_COST } from './constants';
import { BossAIController } from './bossAIController';

export class AIController {
  private bossAIController: BossAIController = new BossAIController();
  private aiDecisionTimer: number = 0;
  private aiNextAction: string = 'idle';
  private aiComboChain: string[] = [];
  private aiComboIndex: number = 0;
  private stuckFrames: number = 0;
  private lastX: number = 0;
  private lastY: number = 0;

  public update(
    ai: Fighter,
    targetOrTargets: Fighter | Fighter[],
    matchConfig: MatchConfig,
    activeGravityAxis: 'down' | 'right' | 'up' | 'left' = 'down',
    arenaWidth: number = 960
  ): InputState {
    const input: InputState = {
      left: false,
      right: false,
      jump: false,
      crouch: false,
      punch: false,
      barrage: false,
      toggleStand: false,
      pose: false,
      skill1: false,
      skill2: false,
      skill3: false,
      skill4: false,
      skill5: false,
      timeStop: false,
      ultimate: false,
    };

    if ((matchConfig.mode === 'training' && !ai.isClone) || ai.hitStun > 0) {
      return input;
    }

    // Determine if AI is operating in Supreme Boss Mode (ONLY true in team_boss mode!)
    const isBoss = !!ai.isBoss && matchConfig.mode === 'team_boss';

    if (isBoss) {
      return this.bossAIController.update(ai, targetOrTargets, activeGravityAxis, arenaWidth);
    }

    // Select primary target (must be in the same dimension as AI)
    const targets: Fighter[] = Array.isArray(targetOrTargets) ? targetOrTargets : [targetOrTargets];
    const isAiParallel = !!ai.isParallelWorld;
    const aliveTargets = targets.filter(t => t && t.hp > 0 && !!t.isParallelWorld === isAiParallel);

    if (aliveTargets.length === 0) {
      // Enemy is in another dimension (e.g. Valentine in Parallel World is undetectable to Real World AI)
      this.aiDecisionTimer = 18;
      this.aiNextAction = Math.random() < 0.25 ? 'retreat' : 'idle';
      this.aiComboChain = [];
      this.aiComboIndex = 0;
      return this.translateActionToInputs(this.aiNextAction, ai, ai, activeGravityAxis, arenaWidth);
    }

    let player = aliveTargets[0];
    if (aliveTargets.length > 1) {
      let minDist = Infinity;
      for (const t of aliveTargets) {
        const d = Math.hypot(t.x - ai.x, t.y - ai.y);
        if (d < minDist) {
          minDist = d;
          player = t;
        }
      }
    }

    this.aiDecisionTimer--;
    
    // Calculate distance according to current gravity axis
    const dx = Math.abs(ai.x - player.x);
    const dy = Math.abs(ai.y - player.y);
    const surfaceDist = (activeGravityAxis === 'right' || activeGravityAxis === 'left') ? dy : dx;
    const directDist = Math.hypot(dx, dy);
    const charId = ai.charId;

    if (this.aiDecisionTimer <= 0) {
      // High-IQ responsive reaction time for CPU (2 to 5 frames ~ 0.03s - 0.08s)
      this.aiDecisionTimer = 2 + Math.floor(Math.random() * 4);

      if (this.aiComboChain.length > 0 && this.aiComboIndex < this.aiComboChain.length) {
        this.aiNextAction = this.aiComboChain[this.aiComboIndex];
        this.aiComboIndex++;
        if (this.aiComboIndex >= this.aiComboChain.length) {
          this.aiComboChain = [];
          this.aiComboIndex = 0;
        }
      } else {
        this.decideStandardAction(ai, player, surfaceDist, directDist, charId, activeGravityAxis);
      }
    }

    // Auto-advance only if idle and genuinely far from opponent (surfaceDist > 160)
    if (surfaceDist > 160 && this.aiNextAction === 'idle') {
      if (ai.actionTimer <= 0) {
        this.aiNextAction = 'advance';
      }
    }

    // Stuck position detection (prevents hugging left/right edges continuously)
    if (Math.abs(ai.x - this.lastX) < 1 && Math.abs(ai.y - this.lastY) < 1 && (this.aiNextAction === 'advance' || this.aiNextAction === 'retreat')) {
      this.stuckFrames++;
      if (this.stuckFrames > 12) {
        this.stuckFrames = 0;
        this.aiNextAction = 'advance';
      }
    } else {
      this.stuckFrames = 0;
    }
    this.lastX = ai.x;
    this.lastY = ai.y;

    const result = this.translateActionToInputs(this.aiNextAction, ai, player, activeGravityAxis, arenaWidth);

    // If an instantaneous action was triggered, clear it to prevent sticky state
    if (['attack', 'skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'ultimate', 'time_stop', 'toggle_stand', 'road_roller', 'ora_beatdown'].includes(this.aiNextAction)) {
      this.aiNextAction = surfaceDist > 160 ? 'advance' : 'idle';
    }

    return result;
  }

  // --- STANDARD HIGH-IQ CPU AI DECISION (DIPEZ, TOORU, DIO, DIAVOLO, PUCCI, JOTARO, GAPPY, VALENTINE) ---
  private decideStandardAction(
    ai: Fighter,
    player: Fighter,
    surfaceDist: number,
    directDist: number,
    charId: string,
    activeGravityAxis: 'down' | 'right' | 'up' | 'left'
  ) {
    const isPlayerAttacking =
      player.action !== 'idle' &&
      player.action !== 'walk' &&
      player.action !== 'crouch' &&
      player.action !== 'hit' &&
      player.action !== 'stun' &&
      player.action !== 'guard_break' &&
      player.action !== 'knockdown' &&
      player.action !== 'dead';

    // Auto-Toggle Stand check for standard/teammate CPU
    const standUsers = ['jotaro', 'dio', 'crazy_diamond', 'king_crimson', 'silver_chariot', 'pucci', 'gappy'];
    if (standUsers.includes(charId) && !ai.isStandActive && ai.cooldowns.standToggle <= 0 && Math.random() < 0.75) {
      this.aiNextAction = 'toggle_stand';
      return;
    }

    // Universal Time Stop Check for Jotaro & DIO (Ruthless activation)
    if ((charId === 'jotaro' || charId === 'dio') && ai.cooldowns.timeStop <= 0 && (ai.energy >= TIME_STOP_ENERGY_COST || ai.hp < 400) && Math.random() < 0.8) {
      this.aiNextAction = 'time_stop';
      if (charId === 'dio') {
        this.aiComboChain = ['skill1', 'skill2', 'skill3', 'barrage'];
        this.aiComboIndex = 0;
      } else if (charId === 'jotaro') {
        this.aiComboChain = ['skill5', 'skill1', 'barrage'];
        this.aiComboIndex = 0;
      }
      return;
    }

    // Universal Ultimate Check for DIO, TOORU, PUCCI, GAPPY, VALENTINE
    if (charId === 'dio' && ai.cooldowns.ultimate <= 0 && (ai.energy >= ROAD_ROLLER_COST || ai.hp < 400) && Math.random() < 0.75) {
      this.aiNextAction = 'road_roller';
      return;
    }

    if (charId === 'tooru' && ai.cooldowns.ultimate <= 0 && ai.energy >= 80 && Math.random() < 0.6) {
      this.aiNextAction = 'ultimate';
      return;
    }

    if (charId === 'gappy' && ai.cooldowns.skill5 <= 0 && ai.energy >= 80 && Math.random() < 0.65) {
      this.aiNextAction = 'skill5';
      return;
    }

    if (charId === 'funny_valentine' && !ai.isParallelWorld && ai.cooldowns.ultimate <= 0 && ai.energy >= 85 && (ai.hp < ai.maxHp * 0.75 || Math.random() < 0.65)) {
      this.aiNextAction = 'ultimate'; // Love Train
      return;
    }

    // =========================================================================
    // ★★★ DIPEZ (LIGHT GOD & EVOLUTION MASTER) HIGH-IQ AI TACTICS ★★★
    // =========================================================================
    if (charId === 'dipez') {
      const isPureLight = ai.dipezForm === 'pure_light';
      const hasLostArms = !isPureLight && (ai.dipezArmLostTimer !== undefined && ai.dipezArmLostTimer > 0);

      // --- FORM B: PURE LIGHT FORM (GLOWING MAN / LIGHT GOD MODE) ---
      if (isPureLight) {
        // 1. Apocalyptic STAR MAKER Ultimate (Full Screen White Burst & Burn)
        if (ai.cooldowns.skill4 <= 0 && (ai.energy >= 50 || ai.hp < 450) && Math.random() < 0.85) {
          this.aiNextAction = 'ultimate';
          this.aiComboChain = ['skill2', 'skill3'];
          this.aiComboIndex = 0;
          return;
        }

        // 2. Omnipresent Full-Map Sky Laser (140 dmg across entire arena!)
        if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill2';
          this.aiComboChain = ['skill3', 'skill1'];
          this.aiComboIndex = 0;
          return;
        }

        // 3. Speed of Light Blitz (Multi-Point Teleport Blitz Strike)
        if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill3';
          this.aiComboChain = ['skill2', 'barrage'];
          this.aiComboIndex = 0;
          return;
        }

        // 4. Photon Invisibility (6s True Invisibility)
        if (ai.cooldowns.skill1 <= 0 && (!ai.dipezInvisibleTimer || ai.dipezInvisibleTimer <= 0) && Math.random() < 0.8) {
          this.aiNextAction = 'skill1';
          this.aiComboChain = ['skill3', 'skill2'];
          this.aiComboIndex = 0;
          return;
        }

        // 5. Close Range Combat in Pure Light Form
        if (surfaceDist < 130) {
          if (ai.energy >= BARRAGE_COST && Math.random() < 0.7) {
            this.aiNextAction = 'barrage';
            this.aiComboChain = ['skill3'];
            this.aiComboIndex = 0;
          } else {
            this.aiNextAction = 'attack';
          }
          return;
        }

        // 6. Mid/Long Range Combat in Pure Light Form
        this.aiNextAction = 'advance';
        return;
      }

      // --- FORM A: BASE DIPEZ FORM ---
      // PRIORITY 1: ATTEMPT EVOLUTION GAMBLE (Skill 4 / Ultimate)
      // Dipez CPU proactively tries to evolve into Pure Light Form!
      if (ai.cooldowns.skill4 <= 0 && (ai.energy >= 20 || ai.hp < 400 || surfaceDist > 140 || Math.random() < 0.8)) {
        this.aiNextAction = 'skill4';
        return;
      }

      // If arms are lost (from Arm Laser Cannon recoil), play smart & evasive
      if (hasLostArms) {
        if (surfaceDist < 120 && Math.random() < 0.5) {
          this.aiNextAction = 'retreat';
        } else if (ai.cooldowns.skill4 <= 0) {
          this.aiNextAction = 'skill4'; // Evolution restores arms instantly!
        } else {
          this.aiNextAction = 'advance';
        }
        return;
      }

      // 1. Close Range (surfaceDist < 130)
      if (surfaceDist < 130) {
        // If player is attacking, use Flashbang to blind and stun them!
        if (isPlayerAttacking && ai.cooldowns.skill2 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill2'; // Flashbang (Blinds & stuns!)
          this.aiComboChain = ['skill3', 'skill1'];
          this.aiComboIndex = 0;
          return;
        }

        // Close range skill rotation
        if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.75) {
          this.aiNextAction = 'skill2'; // Flashbang
          this.aiComboChain = ['skill3', 'skill1'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.7) {
          this.aiNextAction = 'skill3'; // Arm Laser Cannon
          this.aiComboChain = ['skill1'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.7) {
          this.aiNextAction = 'skill1'; // Photon Bullet
          this.aiComboChain = ['attack', 'barrage'];
          this.aiComboIndex = 0;
        } else if (ai.energy >= BARRAGE_COST && Math.random() < 0.6) {
          this.aiNextAction = 'barrage';
        } else {
          this.aiNextAction = 'attack';
        }
        return;
      }

      // 2. Mid Range (130 <= surfaceDist < 300)
      if (surfaceDist < 300) {
        if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.75) {
          this.aiNextAction = 'skill4'; // Evolution Gamble
        } else if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill3'; // Giant Arm Laser Cannon
        } else if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.75) {
          this.aiNextAction = 'skill2'; // Flashbang
        } else if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill1'; // Photon Bullet
        } else {
          this.aiNextAction = 'advance';
        }
        return;
      }

      // 3. Long Range (surfaceDist >= 300)
      if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.85) {
        this.aiNextAction = 'skill4'; // Evolution Gamble
      } else if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.85) {
        this.aiNextAction = 'skill1'; // Fast Photon Bullet
      } else if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.75) {
        this.aiNextAction = 'skill3'; // Arm Laser Cannon
      } else {
        this.aiNextAction = 'advance';
      }
      return;
    }

    // =========================================================================
    // ★★★ ARABIAN FAT (THE SUN STAND) CPU AI TACTICS ★★★
    // =========================================================================
    if (charId === 'arabian_fat') {
      // 1. Ultimate: Supernova Heatwave
      if (ai.cooldowns.ultimate <= 0 && (ai.energy >= 75 || ai.hp < 400 || (ai.sunTemperature && ai.sunTemperature > 60)) && Math.random() < 0.85) {
        this.aiNextAction = 'ultimate';
        this.aiComboChain = ['skill1', 'skill3'];
        this.aiComboIndex = 0;
        return;
      }

      // 2. Skill 3: Prominence Solar Bombardment
      if (ai.cooldowns.skill3 <= 0 && (ai.energy >= 30 || Math.random() < 0.75)) {
        this.aiNextAction = 'skill3';
        this.aiComboChain = ['skill1'];
        this.aiComboIndex = 0;
        return;
      }

      // 3. Skill 2: Desert Mirage Illusion
      if (ai.cooldowns.skill2 <= 0 && (!player.blindedTimer || player.blindedTimer <= 0) && Math.random() < 0.8) {
        this.aiNextAction = 'skill2';
        this.aiComboChain = ['skill1'];
        this.aiComboIndex = 0;
        return;
      }

      // 4. Skill 1: Focused Heat Ray Snipe
      if (ai.cooldowns.skill1 <= 0 && (ai.energy >= 15 || Math.random() < 0.85)) {
        this.aiNextAction = 'skill1';
        return;
      }

      // While in camouflage, don't walk or advance, stay hidden!
      if (ai.isHidingBehindMirror) {
        this.aiNextAction = 'idle';
        return;
      }

      // If exposed, run away or attack!
      if (surfaceDist < 120) {
        this.aiNextAction = Math.random() < 0.6 ? 'barrage' : 'attack';
      } else {
        this.aiNextAction = 'retreat';
      }
      return;
    }

    // =========================================================================
    // ★★★ MICHAEL JUNISTER (GHOST: HAT PRICE) CPU AI TACTICS ★★★
    // =========================================================================
    if (charId === 'michael') {
      // 1. Ultimate: Maximum Price
      if (ai.cooldowns.ultimate <= 0 && (ai.energy >= 75 || ai.hp < 450) && surfaceDist < 250 && Math.random() < 0.85) {
        this.aiNextAction = 'ultimate';
        this.aiComboChain = ['skill1', 'skill3'];
        this.aiComboIndex = 0;
        return;
      }

      // 2. Reactive Flash Step Counter (Skill 2) when enemy attacks in close-to-mid range
      if (isPlayerAttacking && surfaceDist < 160 && ai.cooldowns.skill2 <= 0 && ai.energy >= 25 && Math.random() < 0.8) {
        this.aiNextAction = 'skill2'; // Stance primes instant counter-kick behind opponent!
        this.aiComboChain = ['skill5', 'skill1'];
        this.aiComboIndex = 0;
        return;
      }

      // 3. Hat Price Overdrive (Skill 4) - keeps buff active
      if (ai.cooldowns.skill4 <= 0 && (!ai.michaelOverdriveTimer || ai.michaelOverdriveTimer <= 30) && ai.energy >= 35 && Math.random() < 0.75) {
        this.aiNextAction = 'skill4';
        return;
      }

      // 4. Mid-Range Initiator: Golden Palm Thrust (Skill 1)
      if (surfaceDist >= 70 && surfaceDist <= 220 && ai.cooldowns.skill1 <= 0 && ai.energy >= 20 && Math.random() < 0.8) {
        this.aiNextAction = 'skill1';
        this.aiComboChain = ['skill3', 'skill5'];
        this.aiComboIndex = 0;
        return;
      }

      // 5. Close Range: Golden Axe Kick (Skill 3) pop-up juggle or Kinetic Barrage (Skill 5)
      if (surfaceDist < 100) {
        if (ai.cooldowns.skill3 <= 0 && ai.energy >= 25 && Math.random() < 0.7) {
          this.aiNextAction = 'skill3';
          this.aiComboChain = ['skill5'];
          this.aiComboIndex = 0;
          return;
        }
        if (ai.cooldowns.skill5 <= 0 && ai.energy >= 35 && Math.random() < 0.75) {
          this.aiNextAction = 'skill5';
          return;
        }
        if (Math.random() < 0.6) {
          this.aiNextAction = 'barrage';
          return;
        }
      }
    }

    // --- DIAVOLO (KING CRIMSON) CPU OP TACTICS ---
    if (charId === 'king_crimson') {
      // 1. Reactive Epitaph Foresight & Time Erase
      if (isPlayerAttacking) {
        if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill1'; // Epitaph Counter
          return;
        }
        if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.75) {
          this.aiNextAction = 'skill2'; // Time Erase invulnerability skip
          return;
        }
        if (ai.cooldowns.skill5 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill5'; // Time Erase Ambush (behind)
          this.aiComboChain = ['skill3', 'barrage', 'skill4'];
          this.aiComboIndex = 0;
          return;
        }
      }

      // 2. Close Range (surfaceDist < 120)
      if (surfaceDist < 120) {
        if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill3'; // Lethal Donut Strike
          this.aiComboChain = ['barrage', 'skill4'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.7) {
          this.aiNextAction = 'skill4'; // Blood Blind
          this.aiComboChain = ['barrage'];
          this.aiComboIndex = 0;
        } else if (ai.energy >= BARRAGE_COST && Math.random() < 0.9) {
          this.aiNextAction = 'barrage';
        } else {
          this.aiNextAction = 'attack';
        }
        return;
      }

      // 3. Mid / Long Range (surfaceDist >= 120)
      if (ai.cooldowns.skill5 <= 0 && Math.random() < 0.8) {
        this.aiNextAction = 'skill5'; // Time Erase Ambush behind target
        this.aiComboChain = ['skill3', 'barrage'];
        this.aiComboIndex = 0;
      } else if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.65) {
        this.aiNextAction = 'skill2'; // Time Erase gap closer
      } else if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.6) {
        this.aiNextAction = 'skill4'; // Throw Blood
      } else {
        this.aiNextAction = 'advance';
      }
      return;
    }

    // --- DIO CPU OP TACTICS ---
    if (charId === 'dio') {
      // 1. Reactive Teleport & Counter
      if (isPlayerAttacking && ai.cooldowns.skill5 <= 0 && Math.random() < 0.8) {
        this.aiNextAction = 'skill5'; // Teleport Behind
        this.aiComboChain = ['skill2', 'skill3', 'barrage'];
        this.aiComboIndex = 0;
        return;
      }

      // 2. Close Range (surfaceDist < 120)
      if (surfaceDist < 120) {
        if (ai.cooldowns.skill2 <= 0 && (ai.hp < ai.maxHp * 0.85 || Math.random() < 0.75)) {
          this.aiNextAction = 'skill2'; // Vampiric Drain (Heals HP!)
          this.aiComboChain = ['skill3', 'barrage'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill3'; // Street Sign Smash
          this.aiComboChain = ['barrage'];
          this.aiComboIndex = 0;
        } else if (ai.energy >= BARRAGE_COST && Math.random() < 0.9) {
          this.aiNextAction = 'barrage'; // MUDA MUDA
        } else {
          this.aiNextAction = 'attack';
        }
        return;
      }

      // 3. Mid Range (120 <= surfaceDist < 280)
      if (surfaceDist < 280) {
        if (ai.cooldowns.skill5 <= 0 && Math.random() < 0.75) {
          this.aiNextAction = 'skill5'; // Teleport Behind
          this.aiComboChain = ['skill2', 'barrage'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill1'; // Knife Throw
        } else if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.75) {
          this.aiNextAction = 'skill4'; // Space Ripper Stingy Eyes Laser
        } else {
          this.aiNextAction = 'advance';
        }
        return;
      }

      // 4. Long Range (surfaceDist >= 280)
      if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.8) {
        this.aiNextAction = 'skill4'; // Space Ripper Laser
      } else if (ai.cooldowns.skill5 <= 0 && Math.random() < 0.75) {
        this.aiNextAction = 'skill5'; // Teleport close
      } else if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.75) {
        this.aiNextAction = 'skill1'; // Knives
      } else {
        this.aiNextAction = 'advance';
      }
      return;
    }

    // --- ENRICO PUCCI CPU OP COMBO & GRAVITY WARPING TACTICS ---
    if (charId === 'pucci') {
      const form = ai.pucciForm || 'whitesnake';

      // A. WHITESNAKE FORM
      if (form === 'whitesnake') {
        if (ai.action === 'pucci_14_words_chant') {
          this.aiNextAction = 'idle';
          return;
        }

        const canChant = ai.cooldowns.skill5 <= 0 && ai.isGrounded;
        const playerStunned = player.action === 'hit' || player.action === 'stun' || player.action === 'knockdown' || (player.silencedTimer && player.silencedTimer > 0) || (player.discFrozenTimer && player.discFrozenTimer > 0);

        if (canChant && (playerStunned || surfaceDist > 250 || Math.random() < 0.3)) {
          this.aiNextAction = 'skill5'; // Recite 14 Words Evolution
          return;
        }

        if (surfaceDist < 140) {
          if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.85) {
            this.aiNextAction = 'skill4'; // Stand Disc Freeze (stuns opponent)
            if (canChant) {
              this.aiComboChain = ['skill5'];
              this.aiComboIndex = 0;
            }
          } else if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.8) {
            this.aiNextAction = 'skill2'; // Memory Disc Extract (silences opponent)
            if (canChant) {
              this.aiComboChain = ['skill5'];
              this.aiComboIndex = 0;
            }
          } else if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.7) {
            this.aiNextAction = 'skill3'; // Acid Melt Pool
            this.aiComboChain = ['barrage'];
            this.aiComboIndex = 0;
          } else if (ai.energy >= BARRAGE_COST && Math.random() < 0.85) {
            this.aiNextAction = 'barrage';
          } else {
            this.aiNextAction = 'attack';
          }
          return;
        }

        // Mid/Long range
        if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill1'; // Pistol Shot
        } else if (canChant) {
          this.aiNextAction = 'skill5'; // Chant words
        } else {
          this.aiNextAction = 'advance';
        }
        return;
      }

      // B. C-MOON FORM (GRAVITATIONAL SHIFTING MASTER)
      if (form === 'cmoon') {
        // Instant evolve to Made in Heaven if gauge >= 100
        if (ai.cooldowns.skill5 <= 0 && (ai.cmoonGauge || 0) >= 100) {
          this.aiNextAction = 'skill5'; // Cape Canaveral Ascension
          return;
        }

        if (ai.action === 'cmoon_evolve_mih') {
          this.aiNextAction = 'idle';
          return;
        }

        // 1. Close Range Combat (surfaceDist < 140)
        if (surfaceDist < 140) {
          // If player is attacking, high chance to use Gravity Repulsion Shield or Inversion Punch
          if (isPlayerAttacking && ai.cooldowns.skill4 <= 0 && ai.energy >= 25 && Math.random() < 0.8) {
            this.aiNextAction = 'skill4'; // Gravity Repulsion Shield
            return;
          }

          if (ai.cooldowns.skill2 <= 0 && ai.energy >= 30 && Math.random() < 0.85) {
            this.aiNextAction = 'skill2'; // Inversion Punch (Massive inversion burst)
            return;
          }

          if (ai.cooldowns.skill4 <= 0 && ai.energy >= 25 && Math.random() < 0.75) {
            this.aiNextAction = 'skill4'; // Gravity Slam / Shield
            return;
          }

          if (ai.energy >= BARRAGE_COST && ai.cooldowns.barrage <= 0 && Math.random() < 0.9) {
            this.aiNextAction = 'barrage'; // Builds C-Moon Gauge super fast
            return;
          }

          // Reliable basic C-Moon gravitational strike
          if (ai.cooldowns.punch <= 0) {
            this.aiNextAction = 'attack';
            return;
          }

          if (surfaceDist < 85) {
            this.aiNextAction = Math.random() < 0.5 ? 'retreat' : 'crouch';
          } else {
            this.aiNextAction = 'idle';
          }
          return;
        }

        // 2. Mid / Long Range (surfaceDist >= 140)
        if (ai.cooldowns.skill1 <= 0 && ai.energy >= 15 && Math.random() < 0.65) {
          this.aiNextAction = 'skill1'; // Gravitational Shift!
          return;
        }

        if (ai.cooldowns.skill3 <= 0 && ai.energy >= 25 && Math.random() < 0.8) {
          this.aiNextAction = 'skill3'; // Debris Launch (fires chunks along gravity)
          return;
        }

        if (surfaceDist > 160) {
          this.aiNextAction = 'advance';
        } else {
          this.aiNextAction = 'idle';
        }
        return;
      }

      // C. MADE IN HEAVEN FORM (INFINITE SPEED ACCELERATION)
      if (form === 'made_in_heaven') {
        if (ai.cooldowns.ultimate <= 0 || ai.cooldowns.skill5 <= 0) {
          this.aiNextAction = 'ultimate'; // UNIVERSE RESET!
          return;
        }

        if (ai.action === 'mih_universe_reset') {
          this.aiNextAction = 'idle';
          return;
        }

        // Keep Time Acceleration buff active
        if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.85) {
          this.aiNextAction = 'skill2'; // Time Acceleration
          return;
        }

        if (surfaceDist < 160) {
          if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.85) {
            this.aiNextAction = 'skill1'; // Speed Blitz
            this.aiComboChain = ['skill4', 'skill3'];
            this.aiComboIndex = 0;
          } else if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.8) {
            this.aiNextAction = 'skill4'; // Teleport Strike
          } else if (ai.energy >= BARRAGE_COST && Math.random() < 0.9) {
            this.aiNextAction = 'barrage';
          } else {
            this.aiNextAction = 'attack';
          }
          return;
        }

        // Mid/Long range
        if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill4'; // Speed Teleport Ambush
          this.aiComboChain = ['skill1', 'skill3'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill3'; // High speed knives
        } else {
          this.aiNextAction = 'advance';
        }
        return;
      }
    }

    // --- OTHER CHARACTERS (Tooru, Jotaro, Josuke, Jonathan, Joseph, Valentine, Gappy, Polnareff, etc.) ---
    // 1. CLOSE RANGE (surfaceDist < 120)
    if (surfaceDist < 120) {
      const roll = Math.random();

      // Active High-IQ Defensive reaction (Crouch guard, parry, counter)
      if (isPlayerAttacking && roll < 0.4) {
        this.aiNextAction = 'crouch';
        return;
      }

      if (charId === 'tooru') {
        if (isPlayerAttacking && ai.cooldowns.skill3 <= 0 && roll < 0.85) {
          this.aiNextAction = 'skill3'; // Calamity Counter / Retribution Shield
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.6) {
          this.aiNextAction = 'skill1'; // Head Doctor Disguise (Untouchable)
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill2'; // Rock Insect Drop
          this.aiComboChain = ['skill5'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill5 <= 0 && roll < 0.85) {
          this.aiNextAction = 'skill5'; // WOU Calamity Gaze
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'jotaro') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.7) {
          this.aiNextAction = 'ora_beatdown';
          this.aiComboChain = ['skill1', 'barrage'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.75) {
          this.aiNextAction = 'star_finger';
          this.aiComboChain = ['barrage'];
          this.aiComboIndex = 0;
        } else if (ai.energy >= BARRAGE_COST && roll < 0.8) {
          this.aiNextAction = 'barrage';
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'crazy_diamond') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill5'; // Crazy Beatdown
          this.aiComboChain = ['skill3', 'barrage'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill3 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill3'; // Rock Wall Trap
          this.aiComboChain = ['barrage'];
          this.aiComboIndex = 0;
        } else if (ai.energy >= BARRAGE_COST && roll < 0.8) {
          this.aiNextAction = 'barrage';
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'silver_chariot') {
        if (!ai.isArmorOff && ai.cooldowns.skill2 <= 0 && roll < 0.6) {
          this.aiNextAction = 'skill2'; // Armor Off
        } else if (ai.cooldowns.skill5 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill5'; // Needle Barrage
          this.aiComboChain = ['skill1'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.85) {
          this.aiNextAction = 'skill1'; // Rapier Thrust
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'jonathan') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill5'; // Sunlight Yellow Overdrive!
          this.aiComboChain = ['skill3', 'skill2'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill3 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill3'; // Scarlet Overdrive
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill2'; // Sendo Wave Kick
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'joseph_young') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill5'; // Tommy Gun Overdrive!
          this.aiComboChain = ['skill2', 'skill1'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill2'; // Clacker Volley
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill1'; // Overdrive Punch
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'joseph_old') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill5'; // Hermit Purple Divination Beatdown
        } else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill4'; // Vine Trap
          this.aiComboChain = ['skill2'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill2'; // Overdrive Shock
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'gappy') {
        if (ai.cooldowns.skill3 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill3'; // Explosive Bubble Barrage
          this.aiComboChain = ['skill4', 'skill2'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill4'; // Trap Bubble
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill2'; // Shave Plunder
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'funny_valentine') {
        if (ai.isParallelWorld) {
          this.aiNextAction = 'skill1'; // Paradox Pull
        } else if (ai.cooldowns.skill2 <= 0 && (!ai.valentineClones || ai.valentineClones.length === 0) && roll < 0.8) {
          this.aiNextAction = 'skill2'; // Parallel Self Army
        } else if (ai.cooldowns.skill3 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill3'; // D4C Heavy Barrage
          this.aiComboChain = ['skill4'];
          this.aiComboIndex = 0;
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill1'; // Parallel Shift
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'vampire') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.6) {
          this.aiNextAction = 'skill1';
          this.aiComboChain = ['barrage'];
          this.aiComboIndex = 0;
        } else if (ai.energy >= BARRAGE_COST && roll < 0.8) {
          this.aiNextAction = 'barrage';
        } else {
          this.aiNextAction = 'attack';
        }
      } else {
        if (ai.energy >= BARRAGE_COST && roll < 0.7) this.aiNextAction = 'barrage';
        else this.aiNextAction = 'attack';
      }
      return;
    }

    // 2. MID RANGE (120 <= surfaceDist < 280)
    if (surfaceDist < 280) {
      const roll = Math.random();

      if (charId === 'tooru') {
        if (ai.cooldowns.skill4 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill4'; // Calamity Rain
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill2'; // Rock Insects
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill1'; // Head doctor
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'jotaro') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.7) {
          this.aiNextAction = 'star_finger';
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) {
          this.aiNextAction = 'star_vacuum'; // Pull opponent in!
          this.aiComboChain = ['ora_beatdown', 'barrage'];
          this.aiComboIndex = 0;
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'crazy_diamond') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill1'; // Glass Shard
        } else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill2'; // Bearing Sniper
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'silver_chariot') {
        if (ai.cooldowns.skill3 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill3'; // Rapier Blade Shot
        } else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill4'; // Afterimage Dash Ambush
          this.aiComboChain = ['skill5', 'skill1'];
          this.aiComboIndex = 0;
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'jonathan') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill1'; // Zoom Punch
        } else if (ai.cooldowns.skill4 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill4'; // Life Magnet Overdrive Dash
          this.aiComboChain = ['skill5'];
          this.aiComboIndex = 0;
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'joseph_young') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill1'; // Clacker Boomerang
        } else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill4'; // Hamon Overdrive Kick
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'joseph_old') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.7) {
          this.aiNextAction = 'skill1'; // Hermit Purple Whip
        } else if (ai.cooldowns.skill3 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill3'; // Hamon Infused Trap
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'gappy') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill1'; // Plunder Bubble
        } else if (ai.cooldowns.skill3 <= 0 && roll < 0.75) {
          this.aiNextAction = 'skill3'; // Explosive Bubble
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'funny_valentine') {
        if (ai.isParallelWorld) {
          this.aiNextAction = 'skill1'; // Paradox Pull
        } else if (ai.cooldowns.skill2 <= 0 && (!ai.valentineClones || ai.valentineClones.length === 0) && roll < 0.7) {
          this.aiNextAction = 'skill2'; // Clones
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.8) {
          this.aiNextAction = 'skill1'; // Parallel Shift
        } else {
          this.aiNextAction = 'advance';
        }
      } else if (charId === 'vampire') {
        if (ai.cooldowns.skill2 <= 0 && roll < 0.6) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill3 <= 0 && roll < 0.8) this.aiNextAction = 'skill3';
        else this.aiNextAction = 'advance';
      } else {
        this.aiNextAction = 'advance';
      }
      return;
    }

    // 3. LONG RANGE (surfaceDist >= 280)
    const roll = Math.random();
    if (charId === 'tooru') {
      if (ai.cooldowns.skill4 <= 0 && roll < 0.8) this.aiNextAction = 'skill4'; // Calamity Rain
      else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) this.aiNextAction = 'skill2'; // Rock Insects
      else this.aiNextAction = 'advance';
    } else if (charId === 'crazy_diamond') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.8) this.aiNextAction = 'skill1';
      else if (ai.cooldowns.skill2 <= 0 && roll < 0.8) this.aiNextAction = 'skill2';
      else this.aiNextAction = 'advance';
    } else if (charId === 'joseph_young') {
      if (ai.cooldowns.skill4 <= 0 && roll < 0.75) this.aiNextAction = 'skill4';
      else if (ai.cooldowns.skill1 <= 0 && roll < 0.75) this.aiNextAction = 'skill1';
      else this.aiNextAction = 'advance';
    } else if (charId === 'joseph_old') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.75) this.aiNextAction = 'skill1';
      else this.aiNextAction = 'advance';
    } else if (charId === 'gappy') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.8) this.aiNextAction = 'skill1';
      else if (ai.cooldowns.skill5 <= 0 && roll < 0.75) this.aiNextAction = 'skill5';
      else this.aiNextAction = 'advance';
    } else if (charId === 'silver_chariot') {
      if (ai.cooldowns.skill3 <= 0 && roll < 0.75) this.aiNextAction = 'skill3';
      else this.aiNextAction = 'advance';
    } else if (charId === 'jonathan') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.75) this.aiNextAction = 'skill1';
      else this.aiNextAction = 'advance';
    } else {
      this.aiNextAction = 'advance';
    }
  }

  // --- GRAVITY-AWARE INPUT TRANSLATION ---
  private translateActionToInputs(
    action: string,
    ai: Fighter,
    player: Fighter,
    activeGravityAxis: 'down' | 'right' | 'up' | 'left' = 'down',
    arenaWidth: number = 960
  ): InputState {
    const input: InputState = {
      left: false,
      right: false,
      jump: false,
      crouch: false,
      punch: false,
      barrage: false,
      toggleStand: false,
      pose: false,
      skill1: false,
      skill2: false,
      skill3: false,
      skill4: false,
      skill5: false,
      timeStop: false,
      ultimate: false,
    };

    const isToLeft = player.x < ai.x;
    const isAbove = player.y < ai.y;
    const isBelow = player.y > ai.y;

    const dx = Math.abs(ai.x - player.x);
    const dy = Math.abs(ai.y - player.y);
    const surfaceDist = (activeGravityAxis === 'right' || activeGravityAxis === 'left') ? dy : dx;

    // Auto-face target to prevent AI from facing away or getting stuck attacking empty air
    if (activeGravityAxis === 'down' || activeGravityAxis === 'up') {
      if (player.x > ai.x + 5) {
        if (action !== 'retreat') ai.facing = 'right';
      } else if (player.x < ai.x - 5) {
        if (action !== 'retreat') ai.facing = 'left';
      }
    } else if (activeGravityAxis === 'right') {
      // Right wall: facing === 'right' means UP (-Y), facing === 'left' means DOWN (+Y)
      if (player.y < ai.y - 5) {
        if (action !== 'retreat') ai.facing = 'right'; // Face UP
      } else if (player.y > ai.y + 5) {
        if (action !== 'retreat') ai.facing = 'left'; // Face DOWN
      }
    } else if (activeGravityAxis === 'left') {
      // Left wall: facing === 'left' means UP (-Y), facing === 'right' means DOWN (+Y)
      if (player.y < ai.y - 5) {
        if (action !== 'retreat') ai.facing = 'left'; // Face UP
      } else if (player.y > ai.y + 5) {
        if (action !== 'retreat') ai.facing = 'right'; // Face DOWN
      }
    }

    switch (action) {
      case 'toggle_stand':
        input.toggleStand = true;
        break;

      case 'advance':
        if (surfaceDist <= 85) {
          // Bodies are already in contact / touching. Do not push continuously into player.
          if (ai.cooldowns.punch <= 0) {
            input.punch = true; // Quick point-blank poke
          }
          break;
        }
        if (activeGravityAxis === 'right') {
          // Standing on Right Wall (Ground is at +X)
          // Walking surface is vertical: Y axis
          if (isAbove) input.jump = true; // Walk UP along right wall
          else if (isBelow) input.crouch = true; // Walk DOWN along right wall
          // If player is far away in arena center/left, jump off right wall
          if (player.x < ai.x - 90 && ai.isGrounded && Math.random() < 0.4) {
            input.left = true;
          }
        } else if (activeGravityAxis === 'left') {
          // Standing on Left Wall (Ground is at -X)
          // Walking surface is vertical: Y axis
          if (isAbove) input.jump = true; // Walk UP along left wall
          else if (isBelow) input.crouch = true; // Walk DOWN along left wall
          // If player is far away in arena center/right, jump off left wall
          if (player.x > ai.x + 90 && ai.isGrounded && Math.random() < 0.4) {
            input.right = true;
          }
        } else if (activeGravityAxis === 'up') {
          // Standing on Ceiling (Ground is at -Y)
          if (isToLeft) input.left = true;
          else input.right = true;
          // Jump down into arena if opponent is far below
          if (player.y > ai.y + 100 && ai.isGrounded && Math.random() < 0.35) {
            input.crouch = true;
          }
        } else {
          // Normal 'down' floor
          const isAtLeftWall = ai.x <= 75;
          const isAtRightWall = ai.x >= arenaWidth - ai.width - 75;

          if (isToLeft) input.left = true;
          else input.right = true;

          // Jump towards aerial opponent or if cornered trying to advance against edge
          if ((player.y < ai.y - 70 || (isAtLeftWall && isToLeft) || (isAtRightWall && !isToLeft)) && ai.isGrounded) {
            input.jump = true;
          }
        }
        break;

      case 'retreat':
        if (activeGravityAxis === 'right') {
          if (isAbove) input.crouch = true;
          else input.jump = true;
        } else if (activeGravityAxis === 'left') {
          if (isAbove) input.crouch = true;
          else input.jump = true;
        } else if (activeGravityAxis === 'up') {
          if (isToLeft) input.right = true;
          else input.left = true;
        } else {
          // Normal 'down' floor
          const isAtLeftWall = ai.x <= 75;
          const isAtRightWall = ai.x >= arenaWidth - ai.width - 75;

          if (isAtLeftWall) {
            // Can't retreat left! Wall is behind AI. Jump forward into arena
            input.right = true;
            if (ai.isGrounded) input.jump = true;
            ai.facing = 'right';
          } else if (isAtRightWall) {
            // Can't retreat right! Wall is behind AI. Jump forward into arena
            input.left = true;
            if (ai.isGrounded) input.jump = true;
            ai.facing = 'left';
          } else {
            if (isToLeft) input.right = true;
            else input.left = true;
          }
        }
        break;

      case 'crouch':
        if (activeGravityAxis === 'right' || activeGravityAxis === 'left') {
          input.crouch = true;
        } else if (activeGravityAxis === 'up') {
          input.jump = true; // Hold against ceiling
        } else {
          input.crouch = true;
        }
        break;

      case 'attack':
        input.punch = true;
        break;

      case 'barrage':
        input.barrage = true;
        break;

      case 'time_stop':
        input.timeStop = true;
        break;

      case 'star_finger':
      case 'knife_throw':
      case 'skill1':
        input.skill1 = true;
        break;

      case 'star_vacuum':
      case 'drain_blood':
      case 'skill2':
        input.skill2 = true;
        break;

      case 'stand_leap':
      case 'street_sign':
      case 'skill3':
        input.skill3 = true;
        break;

      case 'parry':
      case 'space_ripper':
      case 'skill4':
        input.skill4 = true;
        break;

      case 'ora_beatdown':
      case 'teleport':
      case 'skill5':
        input.skill5 = true;
        break;

      case 'road_roller':
      case 'ultimate':
        input.ultimate = true;
        break;
    }

    return input;
  }
}

