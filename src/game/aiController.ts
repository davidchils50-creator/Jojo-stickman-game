import { Fighter, InputState, MatchConfig } from '../types';
import { TIME_STOP_ENERGY_COST, ROAD_ROLLER_COST, BARRAGE_COST } from './constants';
import { BossAIController } from './bossAIController';

export class AIController {
  private bossAIController: BossAIController = new BossAIController();
  private aiDecisionTimer: number = 0;
  private aiNextAction: string = 'idle';
  private aiComboChain: string[] = [];
  private aiComboIndex: number = 0;

  public update(
    ai: Fighter,
    targetOrTargets: Fighter | Fighter[],
    matchConfig: MatchConfig,
    activeGravityAxis: 'down' | 'right' | 'up' | 'left' = 'down'
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
      return this.bossAIController.update(ai, targetOrTargets, activeGravityAxis);
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
      return this.translateActionToInputs(this.aiNextAction, ai, ai, activeGravityAxis);
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
      // Responsive reaction time for standard & teammate CPU (6 to 14 frames ~ 0.1s - 0.23s)
      this.aiDecisionTimer = 6 + Math.floor(Math.random() * 8);

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

    // Auto-advance if idle and far from opponent
    if (surfaceDist > 110 && (this.aiNextAction === 'idle' || this.aiNextAction === 'attack')) {
      if (ai.actionTimer <= 0) {
        this.aiNextAction = 'advance';
      }
    }

    const result = this.translateActionToInputs(this.aiNextAction, ai, player, activeGravityAxis);

    // If an instantaneous action was triggered, clear it to prevent sticky state
    if (['attack', 'skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'ultimate', 'time_stop', 'toggle_stand', 'road_roller', 'ora_beatdown'].includes(this.aiNextAction)) {
      this.aiNextAction = surfaceDist > 110 ? 'advance' : 'idle';
    }

    return result;
  }

  // --- STANDARD FAIR CPU AI DECISION (OP DIO, DIAVOLO, PUCCI & SMART BALANCED KITS) ---
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
    if (standUsers.includes(charId) && !ai.isStandActive && ai.cooldowns.standToggle <= 0 && Math.random() < 0.65) {
      this.aiNextAction = 'toggle_stand';
      return;
    }

    // Universal Time Stop Check for Jotaro & DIO (Ruthless activation)
    if ((charId === 'jotaro' || charId === 'dio') && ai.cooldowns.timeStop <= 0 && (ai.energy >= TIME_STOP_ENERGY_COST || ai.hp < 350) && Math.random() < 0.75) {
      this.aiNextAction = 'time_stop';
      if (charId === 'dio') {
        this.aiComboChain = ['skill1', 'skill2', 'skill3', 'barrage'];
        this.aiComboIndex = 0;
      }
      return;
    }

    // Universal Ultimate Check for DIO, TOORU, PUCCI & GAPPY
    if (charId === 'dio' && ai.cooldowns.ultimate <= 0 && (ai.energy >= ROAD_ROLLER_COST || ai.hp < 400) && Math.random() < 0.7) {
      this.aiNextAction = 'road_roller';
      return;
    }

    if (charId === 'tooru' && ai.cooldowns.ultimate <= 0 && ai.energy >= 80 && Math.random() < 0.3) {
      this.aiNextAction = 'ultimate';
      return;
    }

    if (charId === 'gappy' && ai.cooldowns.skill5 <= 0 && ai.energy >= 80 && Math.random() < 0.5) {
      this.aiNextAction = 'skill5';
      return;
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

        // 1. GRAVITATIONAL SHIFT TRIGGER (Skill 1) - Pucci uses this frequently to disorient enemies!
        if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.65) {
          this.aiNextAction = 'skill1'; // Gravitational Shift!
          // Follow up immediately with Debris Launch or Inversion Punch
          this.aiComboChain = ['skill3', 'skill2'];
          this.aiComboIndex = 0;
          return;
        }

        // 2. Close Range (surfaceDist < 140)
        if (surfaceDist < 140) {
          if (ai.cooldowns.skill2 <= 0 && Math.random() < 0.85) {
            this.aiNextAction = 'skill2'; // Inversion Punch (Massive inversion burst)
            this.aiComboChain = ['skill4', 'barrage'];
            this.aiComboIndex = 0;
          } else if (ai.cooldowns.skill4 <= 0 && Math.random() < 0.75) {
            this.aiNextAction = 'skill4'; // Gravity Slam / Shield
            this.aiComboChain = ['barrage'];
            this.aiComboIndex = 0;
          } else if (ai.energy >= BARRAGE_COST && Math.random() < 0.9) {
            this.aiNextAction = 'barrage'; // Builds C-Moon Gauge super fast
          } else {
            this.aiNextAction = 'attack';
          }
          return;
        }

        // 3. Mid / Long Range (surfaceDist >= 140)
        if (ai.cooldowns.skill3 <= 0 && Math.random() < 0.8) {
          this.aiNextAction = 'skill3'; // Debris Launch (fires chunks along gravity)
        } else if (ai.cooldowns.skill1 <= 0 && Math.random() < 0.6) {
          this.aiNextAction = 'skill1'; // Shift gravity
        } else {
          this.aiNextAction = 'advance';
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

    // --- OTHER CHARACTERS (Jotaro, Josuke, Jonathan, Joseph, Tooru, etc.) ---
    // 1. CLOSE RANGE (surfaceDist < 110)
    if (surfaceDist < 110) {
      const roll = Math.random();

      // Defensive reaction
      if (isPlayerAttacking && roll < 0.18) {
        this.aiNextAction = 'crouch';
        return;
      }

      if (charId === 'tooru') {
        if (ai.cooldowns.skill3 <= 0 && roll < 0.4) this.aiNextAction = 'skill3';
        else if (ai.cooldowns.skill2 <= 0 && roll < 0.7) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill1 <= 0 && roll < 0.9) this.aiNextAction = 'skill1';
        else this.aiNextAction = 'retreat';
      } else if (charId === 'jotaro') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.55) this.aiNextAction = 'ora_beatdown';
        else if (ai.cooldowns.skill1 <= 0 && roll < 0.75) this.aiNextAction = 'star_finger';
        else if (ai.energy >= BARRAGE_COST && roll < 0.9) this.aiNextAction = 'barrage';
        else this.aiNextAction = 'attack';
      } else if (charId === 'crazy_diamond') {
        if (ai.cooldowns.skill3 <= 0 && roll < 0.5) this.aiNextAction = 'skill3';
        else if (ai.cooldowns.skill5 <= 0 && roll < 0.75) this.aiNextAction = 'skill5';
        else if (ai.energy >= BARRAGE_COST && roll < 0.9) this.aiNextAction = 'barrage';
        else this.aiNextAction = 'attack';
      } else if (charId === 'silver_chariot') {
        if (!ai.isArmorOff && ai.cooldowns.skill2 <= 0 && roll < 0.45) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill5 <= 0 && roll < 0.7) this.aiNextAction = 'skill5';
        else if (ai.cooldowns.skill1 <= 0 && roll < 0.88) this.aiNextAction = 'skill1';
        else this.aiNextAction = 'attack';
      } else if (charId === 'jonathan') {
        if (ai.cooldowns.skill5 <= 0 && roll < 0.5) this.aiNextAction = 'skill5';
        else if (ai.cooldowns.skill3 <= 0 && roll < 0.75) this.aiNextAction = 'skill3';
        else if (ai.cooldowns.skill2 <= 0 && roll < 0.9) this.aiNextAction = 'skill2';
        else this.aiNextAction = 'attack';
      } else if (charId === 'joseph_young') {
        if (ai.cooldowns.skill2 <= 0 && roll < 0.5) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill5 <= 0 && roll < 0.75) this.aiNextAction = 'skill5';
        else if (ai.cooldowns.skill1 <= 0 && roll < 0.9) this.aiNextAction = 'skill1';
        else this.aiNextAction = 'attack';
      } else if (charId === 'joseph_old') {
        if (ai.cooldowns.skill2 <= 0 && roll < 0.5) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) this.aiNextAction = 'skill4';
        else if (ai.cooldowns.skill5 <= 0 && roll < 0.9) this.aiNextAction = 'skill5';
        else this.aiNextAction = 'attack';
      } else if (charId === 'gappy') {
        if (ai.cooldowns.skill3 <= 0 && roll < 0.5) this.aiNextAction = 'skill3';
        else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) this.aiNextAction = 'skill4';
        else if (ai.cooldowns.skill2 <= 0 && roll < 0.9) this.aiNextAction = 'skill2';
        else this.aiNextAction = 'attack';
      } else if (charId === 'funny_valentine') {
        if (ai.isParallelWorld) {
          // If in parallel world, trigger Paradox Pull after a brief fight
          this.aiNextAction = 'skill1';
        } else if (ai.cooldowns.ultimate <= 0 && ai.energy >= 85 && (ai.hp < ai.maxHp * 0.6 || roll < 0.5)) {
          this.aiNextAction = 'ultimate'; // Love Train!
        } else if (ai.cooldowns.skill3 <= 0 && roll < 0.45) {
          this.aiNextAction = 'skill3'; // D4C Heavy Barrage
        } else if (ai.cooldowns.skill2 <= 0 && (!ai.valentineClones || ai.valentineClones.length === 0) && roll < 0.75) {
          this.aiNextAction = 'skill2'; // Parallel Self Army (Life Insurance)
        } else if (ai.cooldowns.skill1 <= 0 && roll < 0.85) {
          this.aiNextAction = 'skill1'; // Parallel Shift
        } else {
          this.aiNextAction = 'attack';
        }
      } else if (charId === 'vampire') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'skill1';
        else if (ai.energy >= BARRAGE_COST && roll < 0.85) this.aiNextAction = 'barrage';
        else this.aiNextAction = 'attack';
      } else {
        if (ai.energy >= BARRAGE_COST && roll < 0.6) this.aiNextAction = 'barrage';
        else this.aiNextAction = 'attack';
      }
      return;
    }

    // 2. MID RANGE (110 <= surfaceDist < 260)
    if (surfaceDist < 260) {
      const roll = Math.random();

      if (charId === 'tooru') {
        if (ai.cooldowns.skill4 <= 0 && roll < 0.4) this.aiNextAction = 'skill4';
        else if (ai.cooldowns.skill2 <= 0 && roll < 0.7) this.aiNextAction = 'skill2';
        else this.aiNextAction = 'advance';
      } else if (charId === 'jotaro') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'star_finger';
        else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) this.aiNextAction = 'star_vacuum';
        else this.aiNextAction = 'advance';
      } else if (charId === 'crazy_diamond') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'skill1';
        else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) this.aiNextAction = 'skill2';
        else this.aiNextAction = 'advance';
      } else if (charId === 'silver_chariot') {
        if (ai.cooldowns.skill3 <= 0 && roll < 0.5) this.aiNextAction = 'skill3';
        else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) this.aiNextAction = 'skill4';
        else this.aiNextAction = 'advance';
      } else if (charId === 'jonathan') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'skill1';
        else if (ai.cooldowns.skill4 <= 0 && roll < 0.8) this.aiNextAction = 'skill4';
        else this.aiNextAction = 'advance';
      } else if (charId === 'joseph_young') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'skill1';
        else if (ai.cooldowns.skill4 <= 0 && roll < 0.75) this.aiNextAction = 'skill4';
        else this.aiNextAction = 'advance';
      } else if (charId === 'joseph_old') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'skill1';
        else if (ai.cooldowns.skill3 <= 0 && roll < 0.8) this.aiNextAction = 'skill3';
        else this.aiNextAction = 'advance';
      } else if (charId === 'gappy') {
        if (ai.cooldowns.skill1 <= 0 && roll < 0.5) this.aiNextAction = 'skill1';
        else if (ai.cooldowns.skill3 <= 0 && roll < 0.75) this.aiNextAction = 'skill3';
        else this.aiNextAction = 'advance';
      } else if (charId === 'funny_valentine') {
        if (ai.isParallelWorld) this.aiNextAction = 'skill1'; // Paradox Pull!
        else if (ai.cooldowns.skill2 <= 0 && (!ai.valentineClones || ai.valentineClones.length === 0) && roll < 0.6) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill1 <= 0 && roll < 0.8) this.aiNextAction = 'skill1';
        else this.aiNextAction = 'advance';
      } else if (charId === 'vampire') {
        if (ai.cooldowns.skill2 <= 0 && roll < 0.5) this.aiNextAction = 'skill2';
        else if (ai.cooldowns.skill3 <= 0 && roll < 0.8) this.aiNextAction = 'skill3';
        else this.aiNextAction = 'advance';
      } else {
        this.aiNextAction = 'advance';
      }
      return;
    }

    // 3. LONG RANGE (surfaceDist >= 260)
    const roll = Math.random();
    if (charId === 'tooru') {
      if (ai.cooldowns.skill4 <= 0 && roll < 0.5) this.aiNextAction = 'skill4';
      else if (ai.cooldowns.skill2 <= 0 && roll < 0.75) this.aiNextAction = 'skill2';
      else this.aiNextAction = 'advance';
    } else if (charId === 'crazy_diamond') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.6) this.aiNextAction = 'skill1';
      else this.aiNextAction = 'advance';
    } else if (charId === 'joseph_young') {
      if (ai.cooldowns.skill4 <= 0 && roll < 0.6) this.aiNextAction = 'skill4';
      else this.aiNextAction = 'advance';
    } else if (charId === 'joseph_old') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.6) this.aiNextAction = 'skill1';
      else this.aiNextAction = 'advance';
    } else if (charId === 'gappy') {
      if (ai.cooldowns.skill1 <= 0 && roll < 0.55) this.aiNextAction = 'skill1';
      else if (ai.cooldowns.skill5 <= 0 && roll < 0.75) this.aiNextAction = 'skill5';
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
    activeGravityAxis: 'down' | 'right' | 'up' | 'left' = 'down'
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

    switch (action) {
      case 'toggle_stand':
        input.toggleStand = true;
        break;

      case 'advance':
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
          if (isToLeft) input.left = true;
          else input.right = true;
          // Jump towards aerial opponent
          if (player.y < ai.y - 80 && ai.isGrounded && Math.random() < 0.35) {
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
          if (isToLeft) input.right = true;
          else input.left = true;
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

