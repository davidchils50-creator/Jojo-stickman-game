import { 
  Fighter, 
  Hitbox, 
  InputState, 
  Particle, 
  MatchConfig, 
  CharacterDef, 
  Projectile,
  TimeStopState
} from '../types';
import {
  ARENA_WIDTH,
  GROUND_Y,
  GRAVITY,
  MOVE_SPEED,
  JUMP_FORCE,
  FRICTION,
  PLAYER_MAX_HP,
  PLAYER_MAX_ENERGY,
  ENERGY_REGEN_PER_FRAME,
  STAND_ENERGY_UPKEEP,
  PUNCH_DAMAGE,
  PUNCH_STAND_DAMAGE,
  PUNCH_COOLDOWN,
  PUNCH_DURATION,
  BARRAGE_COST,
  BARRAGE_DAMAGE_PER_HIT,
  BARRAGE_STAND_DAMAGE_PER_HIT,
  BARRAGE_DURATION,
  BARRAGE_COOLDOWN,
  POSE_DURATION,
  POSE_ENERGY_GAIN,
  FIGHTER_WIDTH,
  FIGHTER_HEIGHT,
  CHARACTERS,
  MAPS,
  JOTARO_TIME_STOP_FRAMES,
  DIO_TIME_STOP_FRAMES,
  TIME_STOP_ENERGY_COST,
  TIME_STOP_COOLDOWN,
  STAR_FINGER_DAMAGE,
  STAR_FINGER_RANGE,
  STAR_FINGER_STUN,
  STAR_FINGER_COST,
  STAR_FINGER_COOLDOWN,
  STAR_VACUUM_COST,
  STAR_VACUUM_PULL_SPEED,
  STAR_VACUUM_DURATION,
  STAR_VACUUM_COOLDOWN,
  ORA_BEATDOWN_COST,
  ORA_BEATDOWN_GRAB_RANGE,
  ORA_BEATDOWN_TOTAL_DAMAGE,
  ORA_BEATDOWN_DURATION,
  ORA_BEATDOWN_COOLDOWN,
  STAND_LEAP_IMPULSE,
  STAND_LEAP_COST,
  STAND_LEAP_COOLDOWN,
  PARRY_STANCE_DURATION,
  PARRY_COUNTER_DAMAGE,
  PARRY_COST,
  PARRY_COOLDOWN,
  KNIFE_THROW_COUNT,
  KNIFE_DAMAGE,
  KNIFE_SPEED,
  KNIFE_COST,
  KNIFE_COOLDOWN,
  DRAIN_BLOOD_GRAB_RANGE,
  DRAIN_BLOOD_DAMAGE,
  DRAIN_BLOOD_HEAL,
  DRAIN_BLOOD_DURATION,
  DRAIN_BLOOD_COST,
  DRAIN_BLOOD_COOLDOWN,
  STREET_SIGN_DAMAGE,
  STREET_SIGN_RANGE,
  STREET_SIGN_GUARD_BREAK_FRAMES,
  STREET_SIGN_COST,
  STREET_SIGN_COOLDOWN,
  SPACE_RIPPER_DAMAGE,
  SPACE_RIPPER_DURATION,
  SPACE_RIPPER_COST,
  SPACE_RIPPER_COOLDOWN,
  TELEPORT_COST,
  TELEPORT_COOLDOWN,
  ROAD_ROLLER_COST,
  ROAD_ROLLER_TOTAL_DAMAGE,
  ROAD_ROLLER_DURATION,
  ROAD_ROLLER_COOLDOWN,
  // JONATHAN
  ZOOM_PUNCH_DAMAGE,
  ZOOM_PUNCH_RANGE,
  ZOOM_PUNCH_STUN,
  ZOOM_PUNCH_COST,
  ZOOM_PUNCH_COOLDOWN,
  HAMON_HEAL_AMOUNT,
  HAMON_HEAL_ENERGY_GAIN,
  HAMON_HEAL_DURATION,
  HAMON_HEAL_COST,
  HAMON_HEAL_COOLDOWN,
  SENDO_WAVE_DAMAGE,
  SENDO_WAVE_SPEED,
  SENDO_WAVE_COST,
  SENDO_WAVE_COOLDOWN,
  HAMON_COUNTER_DAMAGE,
  HAMON_COUNTER_COST,
  HAMON_COUNTER_COOLDOWN,
  LUCK_PLUCK_DAMAGE,
  LUCK_PLUCK_RANGE,
  LUCK_PLUCK_COST,
  LUCK_PLUCK_COOLDOWN,
  SUNLIGHT_ULTIMATE_DAMAGE,
  SUNLIGHT_ULTIMATE_DURATION,
  SUNLIGHT_ULTIMATE_COST,
  SUNLIGHT_ULTIMATE_COOLDOWN,
  // YOUNG JOSEPH
  CLACKER_VOLLEY_DAMAGE,
  CLACKER_VOLLEY_COST,
  CLACKER_VOLLEY_COOLDOWN,
  NEXT_LINE_COST,
  NEXT_LINE_COOLDOWN,
  NEXT_LINE_COUNTER_DAMAGE,
  HAMON_ELBOW_DAMAGE,
  HAMON_ELBOW_COST,
  HAMON_ELBOW_COOLDOWN,
  TOMMY_GUN_BULLET_DAMAGE,
  TOMMY_GUN_COST,
  TOMMY_GUN_COOLDOWN,
  YOUNG_JOSEPH_ULTIMATE_DAMAGE,
  YOUNG_JOSEPH_ULTIMATE_COST,
  YOUNG_JOSEPH_ULTIMATE_COOLDOWN,
  // OLD JOSEPH
  HERMIT_GRAPPLE_DAMAGE,
  HERMIT_GRAPPLE_RANGE,
  HERMIT_GRAPPLE_COST,
  HERMIT_GRAPPLE_COOLDOWN,
  SPIRIT_PHOTO_BUFF_DURATION,
  SPIRIT_PHOTO_COST,
  SPIRIT_PHOTO_COOLDOWN,
  HERMIT_TRAP_DAMAGE,
  HERMIT_TRAP_COST,
  HERMIT_TRAP_COOLDOWN,
  OVERDRIVE_TACTICS_DAMAGE,
  OVERDRIVE_TACTICS_COST,
  OVERDRIVE_TACTICS_COOLDOWN,
  OLD_JOSEPH_ULTIMATE_DAMAGE,
  OLD_JOSEPH_ULTIMATE_COST,
  OLD_JOSEPH_ULTIMATE_COOLDOWN,
  // DIAVOLO
  EPITAPH_DURATION,
  EPITAPH_COST,
  EPITAPH_COOLDOWN,
  TIME_ERASE_DURATION,
  TIME_ERASE_COST,
  TIME_ERASE_COOLDOWN,
  DONUT_STRIKE_DAMAGE,
  DONUT_STRIKE_COST,
  DONUT_STRIKE_COOLDOWN,
  FLESH_THROW_DAMAGE,
  FLESH_THROW_BLIND_DURATION,
  FLESH_THROW_COST,
  FLESH_THROW_COOLDOWN,
  TIME_ERASE_AMBUSH_DAMAGE,
  TIME_ERASE_AMBUSH_COST,
  TIME_ERASE_AMBUSH_COOLDOWN,
  // POLNAREFF
  RAY_OF_LIGHT_DAMAGE_PER_HIT,
  RAY_OF_LIGHT_COST,
  RAY_OF_LIGHT_COOLDOWN,
  ARMOR_OFF_SPEED_MULTIPLIER,
  ARMOR_OFF_DEFENSE_PENALTY,
  ARMOR_OFF_COST,
  ARMOR_OFF_COOLDOWN,
  SHOOTING_SWORD_DAMAGE,
  SHOOTING_SWORD_COST,
  SHOOTING_SWORD_COOLDOWN,
  UPWARD_THRUST_DAMAGE,
  UPWARD_THRUST_COST,
  UPWARD_THRUST_COOLDOWN,
  AFTERIMAGE_MIRAGE_DAMAGE,
  AFTERIMAGE_MIRAGE_COST,
  AFTERIMAGE_MIRAGE_COOLDOWN,
  JOSUKE_HOMING_SHARD_DAMAGE,
  JOSUKE_HOMING_SHARD_SPEED,
  JOSUKE_HOMING_SHARD_COST,
  JOSUKE_HOMING_SHARD_COOLDOWN,
  JOSUKE_ANGELO_WALL_STUN_DURATION,
  JOSUKE_ANGELO_WALL_DAMAGE,
  JOSUKE_ANGELO_WALL_COST,
  JOSUKE_ANGELO_WALL_COOLDOWN,
  JOSUKE_BEARING_SHOT_DAMAGE,
  JOSUKE_BEARING_SHOT_SPEED,
  JOSUKE_BEARING_SHOT_COST,
  JOSUKE_BEARING_SHOT_COOLDOWN,
  JOSUKE_DORA_COUNTER_DURATION,
  JOSUKE_DORA_COUNTER_DAMAGE,
  JOSUKE_DORA_COUNTER_COST,
  JOSUKE_DORA_COUNTER_COOLDOWN,
  JOSUKE_ROCK_SHIELD_DURATION,
  JOSUKE_ROCK_SHIELD_COST,
  JOSUKE_ROCK_SHIELD_COOLDOWN,
  JOSUKE_GROUND_PUNCH_DAMAGE,
  JOSUKE_GROUND_PUNCH_COST,
  JOSUKE_GROUND_PUNCH_COOLDOWN,
  // TOORU & WONDER OF U
  TOORU_HEAD_DOCTOR_DURATION,
  TOORU_HEAD_DOCTOR_COST,
  TOORU_HEAD_DOCTOR_COOLDOWN,
  TOORU_ROCK_INSECT_DAMAGE,
  TOORU_ROCK_INSECT_POISON_TICKS,
  TOORU_ROCK_INSECT_COST,
  TOORU_ROCK_INSECT_COOLDOWN,
  TOORU_CALAMITY_COUNTER_DURATION,
  TOORU_CALAMITY_COUNTER_COST,
  TOORU_CALAMITY_COUNTER_COOLDOWN,
  TOORU_CALAMITY_RAIN_DURATION,
  TOORU_ULTIMATE_DURATION,
  TOORU_CALAMITY_RAIN_TICK_DAMAGE,
  TOORU_CALAMITY_RAIN_SKILL_COST,
  TOORU_CALAMITY_RAIN_SKILL_COOLDOWN,
  TOORU_CURSE_GAZE_COST,
  TOORU_CURSE_GAZE_COOLDOWN,
  TOORU_METEOR_DAMAGE,
  TOORU_ULTIMATE_COST,
  TOORU_ULTIMATE_COOLDOWN,
  CALAMITY_DEBRIS_DAMAGE,
  CALAMITY_LIGHTNING_DAMAGE,
  CALAMITY_TRIP_DAMAGE,
  CALAMITY_COMBUSTION_TICK_DAMAGE,
  CALAMITY_CAR_DAMAGE,
  CALAMITY_BLEED_TICK_DAMAGE,
  PUCCI_14_WORDS_LIST,
  PUCCI_14_WORDS_TOTAL_WORDS,
  PUCCI_14_WORDS_STEP_FRAMES,
  PUCCI_14_WORDS_COST,
  PUCCI_14_WORDS_COOLDOWN,
  PUCCI_PISTOL_DAMAGE,
  PUCCI_PISTOL_SPEED,
  PUCCI_PISTOL_COST,
  PUCCI_PISTOL_COOLDOWN,
  PUCCI_DISC_EXTRACT_DAMAGE,
  PUCCI_DISC_EXTRACT_COST,
  PUCCI_DISC_EXTRACT_COOLDOWN,
  PUCCI_ACID_MELT_DAMAGE_TICK,
  PUCCI_ACID_MELT_DURATION,
  PUCCI_ACID_MELT_COST,
  PUCCI_ACID_MELT_COOLDOWN,
  PUCCI_STAND_DISC_DAMAGE,
  PUCCI_STAND_DISC_FREEZE_DURATION,
  PUCCI_STAND_DISC_COST,
  PUCCI_STAND_DISC_COOLDOWN,
  CMOON_GRAVITY_SHIFT_COST,
  CMOON_GRAVITY_SHIFT_COOLDOWN,
  CMOON_INVERSION_PUNCH_DAMAGE,
  CMOON_INVERSION_PUNCH_COST,
  CMOON_INVERSION_PUNCH_COOLDOWN,
  CMOON_DEBRIS_LAUNCH_DAMAGE,
  CMOON_DEBRIS_LAUNCH_COST,
  CMOON_DEBRIS_LAUNCH_COOLDOWN,
  CMOON_GRAVITY_SHIELD_DURATION,
  CMOON_GRAVITY_SHIELD_COST,
  CMOON_GRAVITY_SHIELD_COOLDOWN,
  CMOON_EVOLVE_MIH_COST,
  MIH_SPEED_BLITZ_DAMAGE,
  MIH_SPEED_BLITZ_COST,
  MIH_SPEED_BLITZ_COOLDOWN,
  MIH_TIME_ACCEL_DURATION,
  MIH_TIME_ACCEL_COST,
  MIH_TIME_ACCEL_COOLDOWN,
  MIH_KNIFE_COUNT,
  MIH_KNIFE_DAMAGE,
  MIH_KNIFE_SPEED,
  MIH_KNIFE_COST,
  MIH_KNIFE_COOLDOWN,
  MIH_TELEPORT_STRIKE_DAMAGE,
  MIH_TELEPORT_STRIKE_COST,
  MIH_TELEPORT_STRIKE_COOLDOWN,
  MIH_TELEPORT_DAMAGE,
  MIH_TELEPORT_COST,
  MIH_TELEPORT_COOLDOWN,
  MIH_UNIVERSE_RESET_DAMAGE,
  MIH_UNIVERSE_RESET_COST,
  MIH_UNIVERSE_RESET_COOLDOWN,
  PUCCI_MEMORY_DISC_DAMAGE,
  PUCCI_MEMORY_DISC_COST,
  PUCCI_MEMORY_DISC_COOLDOWN,
  PUCCI_ACID_DAMAGE_PER_TICK,
  PUCCI_ACID_DURATION,
  CMOON_DEBRIS_DAMAGE,
  CMOON_DEBRIS_COST,
  CMOON_DEBRIS_COOLDOWN,
  CMOON_SHIELD_DURATION,
  CMOON_SHIELD_COST,
  CMOON_SHIELD_COOLDOWN,
  MIH_SPEED_BLITZ_DAMAGE_PER_HIT,
  // GAPPY (PART 8: JOJOLION)
  GAPPY_PLUNDER_CHANCE,
  GAPPY_PLUNDER_EFFECT_DURATION,
  GAPPY_BUBBLE_PLUNDER_COST,
  GAPPY_BUBBLE_PLUNDER_COOLDOWN,
  GAPPY_FRICTION_STRIP_DURATION,
  GAPPY_SHAVE_MOISTURE_DAMAGE,
  GAPPY_SHAVE_MOISTURE_LIFESTEAL,
  GAPPY_SHAVE_MOISTURE_ATTACK_DRAIN_PCT,
  GAPPY_SHAVE_MOISTURE_DURATION,
  GAPPY_SHAVE_MOISTURE_COST,
  GAPPY_SHAVE_MOISTURE_COOLDOWN,
  GAPPY_BUBBLE_BARRAGE_DAMAGE_PER_HIT,
  GAPPY_BUBBLE_BARRAGE_BURST_DAMAGE,
  GAPPY_BUBBLE_BARRAGE_COST,
  GAPPY_BUBBLE_BARRAGE_COOLDOWN,
  GAPPY_SHIELD_DURATION,
  GAPPY_TRAP_DURATION,
  GAPPY_BUBBLE_TRAP_COST,
  GAPPY_BUBBLE_TRAP_COOLDOWN,
  GAPPY_GO_BEYOND_TRUE_DAMAGE,
  GAPPY_GO_BEYOND_COST,
  GAPPY_GO_BEYOND_COOLDOWN,
  // FUNNY VALENTINE (PART 7: STEEL BALL RUN)
  VALENTINE_PARALLEL_COST,
  VALENTINE_PARALLEL_COOLDOWN,
  VALENTINE_PARALLEL_DURATION,
  VALENTINE_CLONE_ARMY_COST,
  VALENTINE_CLONE_ARMY_COOLDOWN,
  VALENTINE_CLONE_DURATION,
  VALENTINE_BARRAGE_DAMAGE_PER_HIT,
  VALENTINE_BARRAGE_FINISHER_DAMAGE,
  VALENTINE_BARRAGE_COST,
  VALENTINE_BARRAGE_COOLDOWN,
  VALENTINE_LOVE_TRAIN_DURATION,
  VALENTINE_LOVE_TRAIN_COST,
  VALENTINE_LOVE_TRAIN_COOLDOWN,
  VALENTINE_LOVE_TRAIN_REDIRECT_DAMAGE,
  VALENTINE_PISTOL_DAMAGE,
  VALENTINE_PARADOX_TRUE_DAMAGE,
  VALENTINE_LIFE_INSURANCE_HEAL_PCT,
} from './constants';
import { soundManager } from './audio';
import { createFighter } from './fighterFactory';
import { AIController } from './aiController';
import { findCharacterById, PUCCI_FORM_SKILLS } from './characters';

export class GameEngine {
  public player: Fighter;
  public ai: Fighter;
  public teammate: Fighter | null = null;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public acidPools: Array<{ id: number; ownerId: string; x: number; y: number; width: number; height: number; damagePerTick: number; duration: number; color: string }> = [];
  public activeGravityAxis: 'down' | 'right' | 'up' | 'left' = 'down';
  public matchTime: number = 99; // seconds
  public isGameOver: boolean = false;
  public winner: 'player' | 'ai' | 'draw' | null = null;
  public screenShake: number = 0;
  public matchConfig: MatchConfig;
  public survivalStreak: number = 0;
  public vampires: Fighter[] = [];
  public vampireWaveTimer: number = 600;
  
  // GLOBAL TIME STOP & DAMAGE STACKING STATE
  public timeStopState: TimeStopState = {
    isActive: false,
    initiator: null,
    accumulatedDamagePlayer: 0,
    accumulatedDamageAI: 0,
    accumulatedDamageTeammate: 0,
    accumulatedKnockbackXPlayer: 0,
    accumulatedKnockbackYPlayer: 0,
    accumulatedKnockbackXAI: 0,
    accumulatedKnockbackYAI: 0,
    accumulatedKnockbackXTeammate: 0,
    accumulatedKnockbackYTeammate: 0,
    filterFlash: 0,
  };

  public universeResetFlash: number = 0;
  private frameCount: number = 0;
  private particleId: number = 0;
  private projectileId: number = 0;
  private aiControllersMap: Map<string, AIController> = new Map();

  public getAIControllerForFighter(fighterId: string): AIController {
    let controller = this.aiControllersMap.get(fighterId);
    if (!controller) {
      controller = new AIController();
      this.aiControllersMap.set(fighterId, controller);
    }
    return controller;
  }

  public getArenaWidth(): number {
    const mode = this.matchConfig?.mode;
    if (mode === 'survival' || mode === 'team_survival' || mode === 'team_boss') {
      return 2600;
    }
    return ARENA_WIDTH;
  }

  constructor(config?: MatchConfig) {
    this.matchConfig = config || {
      playerChar: CHARACTERS[0],
      enemyChar: CHARACTERS[1],
      mode: 'arcade',
      map: MAPS[0],
    };

    this.player = createFighter('player', 220, 'right', this.matchConfig.playerChar, this.matchConfig);
    this.ai = createFighter('ai', 700, 'left', this.matchConfig.enemyChar, this.matchConfig);

    if (this.matchConfig.mode === 'team_boss' || this.matchConfig.mode === 'team_survival') {
      const partnerChar = this.matchConfig.teammateChar || CHARACTERS[2];
      this.teammate = createFighter('teammate', 120, 'right', partnerChar, this.matchConfig);
      this.teammate.team = 'teamA';
    } else {
      this.teammate = null;
    }

    this.checkAndStartTooruBgm();
  }

  public checkAndStartTooruBgm() {
    const hasTooru =
      this.player.charId === 'tooru' ||
      this.ai.charId === 'tooru' ||
      this.ai.bossType === 'boss_tooru' ||
      (this.teammate && this.teammate.charId === 'tooru');

    if (hasTooru && !this.isGameOver) {
      soundManager.startTooruMatchBgm();
    } else {
      soundManager.stopTooruMatchBgm();
    }
  }

  public setMatchConfig(config: MatchConfig) {
    this.matchConfig = config;
    this.reset();
  }

  public spawnVampireWave(count: number = 3) {
    const MAX_ACTIVE_VAMPIRES = 5;
    const availableSlots = Math.max(0, MAX_ACTIVE_VAMPIRES - this.vampires.length);
    const actualSpawn = Math.min(count, availableSlots);
    if (actualSpawn <= 0) return;

    const arenaW = this.getArenaWidth();
    const vampireDef = findCharacterById('vampire') || CHARACTERS[0];

    for (let i = 0; i < actualSpawn; i++) {
      const fromLeft = i % 2 === 0;
      const sideIndex = Math.floor(i / 2);
      const offset = sideIndex * 85;
      const spawnX = fromLeft ? -100 - offset : arenaW + 100 + offset;
      const facing: 'left' | 'right' = fromLeft ? 'right' : 'left';
      const id = `vampire_${this.frameCount}_${i}_${Math.floor(Math.random() * 1000)}`;

      const v = createFighter(id, spawnX, facing, vampireDef, this.matchConfig);
      v.team = 'teamB';
      v.invulnerableTimer = 20;
      v.maxHp = 130 + Math.floor(Math.random() * 30);
      v.hp = v.maxHp;
      v.hasStand = false;
      v.isStandActive = false;
      v.standAlpha = 0;
      this.vampires.push(v);
      this.addShockwave(spawnX, GROUND_Y - 40, '#ef4444');
    }

    soundManager.playPoseSound('dio');
    this.addTextParticle(
      Math.min(arenaW - 400, Math.max(400, this.player.x)),
      130,
      `🩸 VAMPIRE SURGE! (+${actualSpawn} VAMPIRES FROM LEFT & RIGHT WALLS)`,
      '#ef4444'
    );
  }

  public getAllActiveFighters(): Fighter[] {
    const list: Fighter[] = [];

    const addFighterWithClones = (f: Fighter | null) => {
      if (!f || f.hp <= 0) return;
      list.push(f);
      if (f.valentineClones) {
        for (const clone of f.valentineClones) {
          if (clone && clone.hp > 0) {
            list.push(clone);
          }
        }
      }
      if (f.parallelEnemyClone && f.parallelEnemyClone.hp > 0) {
        list.push(f.parallelEnemyClone);
      }
    };

    addFighterWithClones(this.player);
    addFighterWithClones(this.ai);
    addFighterWithClones(this.teammate);

    if (this.vampires) {
      for (const v of this.vampires) {
        if (v && v.hp > 0) list.push(v);
      }
    }

    return list;
  }

  public getTargetsForAttacker(attacker: Fighter, defaultTarget: Fighter): Fighter[] {
    const isAttackerParallel = !!attacker.isParallelWorld;

    if (this.matchConfig.mode === 'survival' || this.matchConfig.mode === 'team_survival') {
      if (attacker.team === 'teamA') {
        const aliveVampires = this.vampires.filter(v => v.hp > 0 && !!v.isParallelWorld === isAttackerParallel);
        if (aliveVampires.length > 0) return aliveVampires;
      }
    }

    const all = this.getAllActiveFighters();
    const targets: Fighter[] = [];

    for (const f of all) {
      if (f.id !== attacker.id && f.hp > 0) {
        // Enforce strict dimension boundary: only targets in the exact same dimension
        if (!!f.isParallelWorld !== isAttackerParallel) {
          continue;
        }
        // Target opposing team members
        if (f.team !== attacker.team) {
          targets.push(f);
        }
      }
    }

    if (targets.length === 0 && defaultTarget && defaultTarget.hp > 0 && !!defaultTarget.isParallelWorld === isAttackerParallel) {
      targets.push(defaultTarget);
    }

    return targets;
  }

  public reset() {
    this.player = createFighter('player', 220, 'right', this.matchConfig.playerChar, this.matchConfig);
    this.ai = createFighter('ai', 700, 'left', this.matchConfig.enemyChar, this.matchConfig);
    
    if (this.matchConfig.mode === 'team_boss' || this.matchConfig.mode === 'team_survival') {
      const partnerChar = this.matchConfig.teammateChar || CHARACTERS[2];
      this.teammate = createFighter('teammate', 120, 'right', partnerChar, this.matchConfig);
      this.teammate.team = 'teamA';
    } else {
      this.teammate = null;
    }

    this.vampires = [];
    this.vampireWaveTimer = 720;
    this.survivalStreak = 0;

    if (this.matchConfig.mode === 'survival' || this.matchConfig.mode === 'team_survival') {
      this.spawnVampireWave(3);
      if (this.vampires.length > 0) {
        this.ai = this.vampires[0];
      }
    }

    this.projectiles = [];
    this.particles = [];
    this.matchTime = this.matchConfig.mode === 'training' ? 999 : 99;
    this.isGameOver = false;
    this.winner = null;
    this.screenShake = 0;
    this.frameCount = 0;
    this.timeStopState = {
      isActive: false,
      initiator: null,
      accumulatedDamagePlayer: 0,
      accumulatedDamageAI: 0,
      accumulatedDamageTeammate: 0,
      accumulatedKnockbackXPlayer: 0,
      accumulatedKnockbackYPlayer: 0,
      accumulatedKnockbackXAI: 0,
      accumulatedKnockbackYAI: 0,
      accumulatedKnockbackXTeammate: 0,
      accumulatedKnockbackYTeammate: 0,
      filterFlash: 0,
    };

    this.checkAndStartTooruBgm();
  }

  public nextSurvivalOpponent() {
    this.survivalStreak++;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 350);
    this.player.energy = this.player.maxEnergy;

    if (this.teammate && this.teammate.hp > 0) {
      this.teammate.hp = Math.min(this.teammate.maxHp, this.teammate.hp + 350);
      this.teammate.energy = this.teammate.maxEnergy;
    }

    const otherChars = CHARACTERS.filter(c => c.id !== this.ai.charId);
    const nextEnemy = otherChars[Math.floor(Math.random() * otherChars.length)] || CHARACTERS[0];
    
    this.ai = createFighter('ai', 700, 'left', nextEnemy, this.matchConfig);
    this.matchTime = 99;
    this.isGameOver = false;
    this.winner = null;

    this.addTextParticle(ARENA_WIDTH / 2, 140, `STAGE ${this.survivalStreak + 1}: ${nextEnemy.name}!`, '#fbbf24');
  }

  private currentDt: number = 1.0;

  public update(playerInput: InputState, dt: number = 1.0, overrideAiInput?: InputState) {
    if (this.isGameOver) return;

    // Clamp dt to avoid extreme physics simulation jumps on backgrounding tab
    this.currentDt = Math.max(0.5, Math.min(2.0, dt));
    this.frameCount++;

    // Global Match timer (only decrements when time is not stopped)
    if (!this.timeStopState.isActive && this.matchConfig.mode !== 'training' && this.frameCount % 60 === 0 && this.matchTime > 0) {
      this.matchTime--;
      if (this.matchTime <= 0) {
        this.checkTimeoutWinner();
      }
    }

    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    if (this.timeStopState.filterFlash > 0) {
      this.timeStopState.filterFlash *= 0.85;
    }

    // Training mode infinite SP / HP sustain
    if (this.matchConfig.mode === 'training') {
      this.player.energy = 100;
      if (this.ai.hp < 200) {
        this.ai.hp = this.ai.maxHp;
      }
    }

    // 1. UPDATE TIME STOP ENGINE & PARALLEL TIMERS (Jotaro & Dio exclusive)
    this.updateTimeStopSystem(playerInput);

    // 2. VAMPIRE HORDE SURVIVAL MODE LOGIC (Spawns 3 vampires up to max 5 active every 12 seconds)
    if (this.matchConfig.mode === 'survival' || this.matchConfig.mode === 'team_survival') {
      this.vampireWaveTimer -= this.currentDt * 60;
      if (this.vampireWaveTimer <= 0 || this.vampires.length === 0) {
        this.vampireWaveTimer = 720; // Reset 12s timer
        this.spawnVampireWave(3);
      }

      // Check dead vampires in horde
      for (let i = this.vampires.length - 1; i >= 0; i--) {
        const v = this.vampires[i];
        if (v.hp <= 0) {
          this.survivalStreak++;
          soundManager.playRazorCut();
          soundManager.playHit(true);
          this.addShockwave(v.x + v.width / 2, v.y + v.height / 2, '#ef4444');
          this.addTextParticle(v.x + v.width / 2, v.y - 35, `🩸 VAMPIRE DEFEATED! [KILLS: ${this.survivalStreak}]`, '#f87171');
          for (let s = 0; s < 8; s++) {
            this.addSpark(v.x + v.width / 2 + (Math.random() * 40 - 20), v.y + (Math.random() * 40 - 20), '#dc2626');
          }
          this.vampires.splice(i, 1);
        }
      }

      // If all vampires were just killed, spawn the next wave immediately
      if (this.vampires.length === 0) {
        this.vampireWaveTimer = 720;
        this.spawnVampireWave(3);
      }

      if (this.vampires.length > 0) {
        this.ai = this.vampires[0];
      }
    }

    // 3. Target decision for AI (multi-target support in boss mode & closest target in standard)
    const isAiParallel = !!this.ai.isParallelWorld;
    const candidatesForAi: Fighter[] = [];
    if (this.player && this.player.hp > 0 && !!this.player.isParallelWorld === isAiParallel) {
      candidatesForAi.push(this.player);
    }
    if (this.teammate && this.teammate.hp > 0 && !!this.teammate.isParallelWorld === isAiParallel) {
      candidatesForAi.push(this.teammate);
    }
    if (this.player?.valentineClones) {
      for (const clone of this.player.valentineClones) {
        if (clone && clone.hp > 0 && !!clone.isParallelWorld === isAiParallel) {
          candidatesForAi.push(clone);
        }
      }
    }
    if (this.player?.parallelEnemyClone && this.player.parallelEnemyClone.hp > 0 && isAiParallel) {
      candidatesForAi.push(this.player.parallelEnemyClone);
    }

    let targetForAi = candidatesForAi[0] || this.ai;
    if (candidatesForAi.length > 1) {
      let minDist = Infinity;
      for (const c of candidatesForAi) {
        const d = Math.abs(c.x - this.ai.x);
        if (d < minDist) {
          minDist = d;
          targetForAi = c;
        }
      }
    }

    const aiInput = overrideAiInput || this.getAIControllerForFighter(this.ai.id).update(this.ai, candidatesForAi.length > 0 ? candidatesForAi : [this.ai], this.matchConfig, this.activeGravityAxis);

    // 4. Update Both Fighters & Vampire Horde (Checking if frozen)
    const playerFrozen = this.isFighterFrozen(this.player);
    const aiFrozen = this.isFighterFrozen(this.ai);
    const teammateFrozen = this.teammate ? this.isFighterFrozen(this.teammate) : false;

    this.player.isFrozenByTimeStop = playerFrozen;
    this.ai.isFrozenByTimeStop = aiFrozen;
    if (this.teammate) {
      this.teammate.isFrozenByTimeStop = teammateFrozen;
    }

    const playerOpponent = this.player.isParallelWorld ? (this.player.parallelEnemyClone || this.ai) : this.ai;
    const aiOpponent = this.ai.isParallelWorld ? (this.ai.parallelEnemyClone || this.player) : targetForAi;

    if (!playerFrozen) {
      this.updateFighter(this.player, playerInput, playerOpponent);
    }
    if (!aiFrozen) {
      this.updateFighter(this.ai, aiInput, aiOpponent);
    }
    if (this.teammate && this.teammate.hp > 0 && !teammateFrozen) {
      const isTeammateParallel = !!this.teammate.isParallelWorld;
      const candidatesForTeammate: Fighter[] = [];
      if (this.ai && this.ai.hp > 0 && !!this.ai.isParallelWorld === isTeammateParallel) {
        candidatesForTeammate.push(this.ai);
      }
      if (this.vampires) {
        for (const v of this.vampires) {
          if (v.hp > 0 && !!v.isParallelWorld === isTeammateParallel) candidatesForTeammate.push(v);
        }
      }
      const tmTarget = candidatesForTeammate[0] || this.ai;
      const teammateInput = this.getAIControllerForFighter(this.teammate.id).update(this.teammate, candidatesForTeammate.length > 0 ? candidatesForTeammate : [this.teammate], this.matchConfig, this.activeGravityAxis);
      this.updateFighter(this.teammate, teammateInput, tmTarget);
    }

    // Update active vampires in horde
    if (this.matchConfig.mode === 'survival' || this.matchConfig.mode === 'team_survival') {
      for (const v of this.vampires) {
        const vFrozen = this.isFighterFrozen(v);
        v.isFrozenByTimeStop = vFrozen;
        if (!vFrozen) {
          const isVampParallel = !!v.isParallelWorld;
          const vCandidates: Fighter[] = [];
          if (this.player && this.player.hp > 0 && !!this.player.isParallelWorld === isVampParallel) {
            vCandidates.push(this.player);
          }
          if (this.teammate && this.teammate.hp > 0 && !!this.teammate.isParallelWorld === isVampParallel) {
            vCandidates.push(this.teammate);
          }
          if (this.player?.valentineClones) {
            for (const clone of this.player.valentineClones) {
              if (clone.hp > 0 && !!clone.isParallelWorld === isVampParallel) vCandidates.push(clone);
            }
          }
          let vTarget = vCandidates[0] || v;
          if (vCandidates.length > 1) {
            let minDist = Infinity;
            for (const c of vCandidates) {
              const d = Math.abs(c.x - v.x);
              if (d < minDist) {
                minDist = d;
                vTarget = c;
              }
            }
          }
          const vInput = this.getAIControllerForFighter(v.id).update(v, vCandidates.length > 0 ? vCandidates : [v], this.matchConfig, this.activeGravityAxis);
          this.updateFighter(v, vInput, vTarget);
        }
      }
    }


    // 4. Update Stands Visual Fade
    this.updateStandState(this.player);
    this.updateStandState(this.ai);
    if (this.teammate) {
      this.updateStandState(this.teammate);
    }

    // 5. Update Projectiles (Knives, Space Ripper lasers, Road Roller)
    this.updateProjectiles();
    this.updateAcidPools();

    // 6. Update Particles
    this.updateParticles();

    // 7. Check Game Over
    if (this.matchConfig.mode !== 'training') {
      // Teammate respawn check in boss raid
      if (this.teammate && this.teammate.hp <= 0 && this.matchConfig.mode === 'team_boss') {
        this.teammate.hp = this.teammate.maxHp;
        this.teammate.energy = this.teammate.maxEnergy;
        this.teammate.x = 120;
        this.teammate.y = GROUND_Y - FIGHTER_HEIGHT;
        this.teammate.action = 'idle';
        this.teammate.invulnerableTimer = 90;
        this.addTextParticle(this.teammate.x + this.teammate.width / 2, this.teammate.y - 40, '⚡ TEAMMATE RESPAWNED!', '#818cf8');
      }

      if (this.player.hp <= 0 && this.matchConfig.mode === 'team_boss') {
        // Player respawns in boss raid mode!
        this.player.hp = this.player.maxHp;
        this.player.energy = this.player.maxEnergy;
        this.player.x = 80;
        this.player.y = GROUND_Y - FIGHTER_HEIGHT;
        this.player.action = 'idle';
        this.player.invulnerableTimer = 90;
        this.addTextParticle(this.player.x + this.player.width / 2, this.player.y - 40, '⚡ RESPAWNED (TEAM BOSS RAID)!', '#38bdf8');
      } else {
        const isPlayerDead = this.player.hp <= 0;
        const isTeammateDead = this.teammate ? this.teammate.hp <= 0 : true;

        if (isPlayerDead && isTeammateDead && this.ai.hp <= 0) {
          this.isGameOver = true;
          this.winner = 'draw';
          soundManager.stopTooruMatchBgm();
        } else if (isPlayerDead && isTeammateDead) {
          this.isGameOver = true;
          this.winner = 'ai';
          soundManager.stopTooruMatchBgm();
        } else if (this.ai.hp <= 0) {
          if (this.matchConfig.mode !== 'survival' && this.matchConfig.mode !== 'team_survival') {
            this.isGameOver = true;
            this.winner = 'player';
            soundManager.stopTooruMatchBgm();
          }
        }
      }
    }
  }

  // --- TIME STOP LOGIC & PARALLEL COUNTERS (EXCLUSIVE TO DIO & JOTARO) ---
  private updateTimeStopSystem(playerInput: InputState) {
    const playerCanTimeStop = (this.player.charId === 'dio' || this.player.charId === 'jotaro') && this.player.canMoveInStoppedTime;
    const aiCanTimeStop = (this.ai.charId === 'dio' || this.ai.charId === 'jotaro') && this.ai.canMoveInStoppedTime;

    // 1. Check if Player triggers Time Stop / Counter Time Stop
    if (playerInput.timeStop && playerCanTimeStop && this.player.cooldowns.timeStop <= 0) {
      if (this.player.energy >= TIME_STOP_ENERGY_COST || this.matchConfig.mode === 'training') {
        this.activateTimeStop(this.player);
      }
    }

    // 2. Check if AI triggers Counter Time Stop when frozen by player
    if (this.timeStopState.isActive && this.ai.isFrozenByTimeStop && aiCanTimeStop && this.ai.cooldowns.timeStop <= 0 && this.ai.energy >= TIME_STOP_ENERGY_COST) {
      // AI Counter Time Stop reaction
      this.activateTimeStop(this.ai);
      this.addTextParticle(this.ai.x + this.ai.width / 2, this.ai.y - 40, `[COUNTER TIME STOP!]`, '#eab308');
    }

    // 3. Decrement individual parallel active timers
    if (this.timeStopState.isActive) {
      if (this.player.timeStopActiveTimer > 0) {
        this.player.timeStopActiveTimer -= this.currentDt;
        if (this.player.timeStopActiveTimer <= 0) {
          this.player.timeStopActiveTimer = 0;
          this.addTextParticle(this.player.x + this.player.width / 2, this.player.y - 20, 'TIME STOP EXPIRED', '#94a3b8');
        }
      }

      if (this.ai.timeStopActiveTimer > 0) {
        this.ai.timeStopActiveTimer -= this.currentDt;
        if (this.ai.timeStopActiveTimer <= 0) {
          this.ai.timeStopActiveTimer = 0;
          this.addTextParticle(this.ai.x + this.ai.width / 2, this.ai.y - 20, 'TIME STOP EXPIRED', '#94a3b8');
        }
      }

      if (this.teammate && this.teammate.timeStopActiveTimer > 0) {
        this.teammate.timeStopActiveTimer -= this.currentDt;
        if (this.teammate.timeStopActiveTimer <= 0) {
          this.teammate.timeStopActiveTimer = 0;
          this.addTextParticle(this.teammate.x + this.teammate.width / 2, this.teammate.y - 20, 'TIME STOP EXPIRED', '#818cf8');
        }
      }

      // Check if both characters (and teammate if active) have exhausted their active stopped time duration
      const playerExhausted = this.player.timeStopActiveTimer <= 0;
      const aiExhausted = this.ai.timeStopActiveTimer <= 0;
      const teammateExhausted = this.teammate ? this.teammate.timeStopActiveTimer <= 0 : true;

      if (playerExhausted && aiExhausted && teammateExhausted) {
        this.resumeTime();
      }
    }
  }

  public activateTimeStop(f: Fighter) {
    if (this.matchConfig.mode !== 'training') {
      f.energy -= TIME_STOP_ENERGY_COST;
    }
    f.cooldowns.timeStop = f.isBoss ? 2600 : TIME_STOP_COOLDOWN;
    f.timeStopActiveTimer = f.timeStopDurationMax;
    f.isStandActive = true; // Auto summon stand

    const isFirstActivation = !this.timeStopState.isActive;
    this.timeStopState.isActive = true;
    this.timeStopState.filterFlash = 1.0;
    if (isFirstActivation) {
      this.timeStopState.initiator = f.id;
    }

    const durationSec = Math.round(f.timeStopDurationMax / 60);
    const isDio = f.charId === 'dio';
    const shout = isDio 
      ? `ZA WARUDO... TOKI WO TOMARE! (${durationSec}s)` 
      : `STAR PLATINUM: THE WORLD! (${durationSec}s)`;

    this.addTextParticle(f.x + f.width / 2, f.y - 50, shout, isDio ? '#facc15' : '#c084fc');
    this.screenShake = 14;

    // Trigger authentic anime Time Stop sound effect
    soundManager.playTimeStop(f.charId);

    // Time stop distortion shockwave
    this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, isDio ? '#eab308' : '#a855f7');
  }

  public activateTimeErase(f: Fighter, opponent: Fighter) {
    if (this.matchConfig.mode !== 'training') {
      f.energy -= TIME_ERASE_COST;
    }
    f.cooldowns.timeStop = f.isBoss ? 2200 : TIME_ERASE_COOLDOWN;
    f.cooldowns.skill2 = f.isBoss ? 2200 : TIME_ERASE_COOLDOWN;
    f.isTimeEraseActive = true;
    f.timeEraseTimer = TIME_ERASE_DURATION;
    f.invulnerableTimer = 0;
    f.isStandActive = true;

    // Instant skip position behind opponent in erased time
    const targetX = opponent.facing === 'right' ? opponent.x - 65 : opponent.x + opponent.width + 25;
    f.x = Math.max(40, Math.min(this.getArenaWidth() - 80, targetX));
    f.y = opponent.y;

    this.addTextParticle(f.x + f.width / 2, f.y - 40, '⏱️ KING CRIMSON: ERASED TIME!', '#e11d48');
    this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#e11d48');
    this.screenShake = 14;

    soundManager.playPoseSound('king_crimson');
  }

  private isFighterFrozen(f: Fighter): boolean {
    if (!this.timeStopState.isActive) return false;
    return f.timeStopActiveTimer <= 0;
  }

  private resumeTime() {
    this.timeStopState.isActive = false;
    this.timeStopState.initiator = null;
    this.timeStopState.filterFlash = 1.0;
    this.screenShake = 15;

    // Trigger time resume audio synthesis
    soundManager.playTimeResume();

    this.addTextParticle(ARENA_WIDTH / 2, 120, '★ TOKI WA UGOKI DASU (TIME RESUMES!) ★', '#ffffff');

    // 1. Execute Stacked Accumulated Damage on Player
    if (this.timeStopState.accumulatedDamagePlayer > 0) {
      this.player.hp = Math.max(0, this.player.hp - this.timeStopState.accumulatedDamagePlayer);
      this.player.hitStun = 35;
      this.player.vx = this.timeStopState.accumulatedKnockbackXPlayer;
      this.player.vy = this.timeStopState.accumulatedKnockbackYPlayer;
      this.player.isGrounded = false;
      this.player.invulnerableTimer = 25;

      const impactX = this.player.x + this.player.width / 2;
      const impactY = this.player.y + this.player.height / 2;
      this.addShockwave(impactX, impactY, '#ef4444');
      this.addTextParticle(impactX, impactY - 30, `-${Math.round(this.timeStopState.accumulatedDamagePlayer)} DETONATION!`, '#ef4444');
    }

    // 2. Execute Stacked Accumulated Damage on AI
    if (this.timeStopState.accumulatedDamageAI > 0) {
      this.ai.hp = Math.max(0, this.ai.hp - this.timeStopState.accumulatedDamageAI);
      this.ai.hitStun = 35;
      this.ai.vx = this.timeStopState.accumulatedKnockbackXAI;
      this.ai.vy = this.timeStopState.accumulatedKnockbackYAI;
      this.ai.isGrounded = false;
      this.ai.invulnerableTimer = 25;

      const impactX = this.ai.x + this.ai.width / 2;
      const impactY = this.ai.y + this.ai.height / 2;
      this.addShockwave(impactX, impactY, '#facc15');
      this.addTextParticle(impactX, impactY - 30, `-${Math.round(this.timeStopState.accumulatedDamageAI)} DETONATION!`, '#facc15');
    }

    // 2b. Execute Stacked Accumulated Damage on Teammate
    if (this.teammate && this.teammate.hp > 0 && this.timeStopState.accumulatedDamageTeammate > 0) {
      this.teammate.hp = Math.max(0, this.teammate.hp - this.timeStopState.accumulatedDamageTeammate);
      this.teammate.hitStun = 35;
      this.teammate.vx = this.timeStopState.accumulatedKnockbackXTeammate;
      this.teammate.vy = this.timeStopState.accumulatedKnockbackYTeammate;
      this.teammate.isGrounded = false;
      this.teammate.invulnerableTimer = 25;

      const impactX = this.teammate.x + this.teammate.width / 2;
      const impactY = this.teammate.y + this.teammate.height / 2;
      this.addShockwave(impactX, impactY, '#818cf8');
      this.addTextParticle(impactX, impactY - 30, `-${Math.round(this.timeStopState.accumulatedDamageTeammate)} DETONATION!`, '#818cf8');
    }

    // Reset accumulated stacks
    this.timeStopState.accumulatedDamagePlayer = 0;
    this.timeStopState.accumulatedDamageAI = 0;
    this.timeStopState.accumulatedDamageTeammate = 0;
    this.timeStopState.accumulatedKnockbackXPlayer = 0;
    this.timeStopState.accumulatedKnockbackYPlayer = 0;
    this.timeStopState.accumulatedKnockbackXAI = 0;
    this.timeStopState.accumulatedKnockbackYAI = 0;
    this.timeStopState.accumulatedKnockbackXTeammate = 0;
    this.timeStopState.accumulatedKnockbackYTeammate = 0;

    // 3. Unfreeze all suspended floating projectiles
    for (const proj of this.projectiles) {
      if (proj.isFrozenInTime) {
        proj.isFrozenInTime = false;
        proj.vx = proj.baseVx;
        proj.vy = proj.baseVy;
        this.addSpark(proj.x, proj.y, '#facc15');
      }
    }
  }

  private checkTimeoutWinner() {
    this.isGameOver = true;
    soundManager.stopTooruMatchBgm();
    if (this.player.hp > this.ai.hp) {
      this.winner = 'player';
    } else if (this.ai.hp > this.player.hp) {
      this.winner = 'ai';
    } else {
      this.winner = 'draw';
    }
  }

  // --- FIGHTER UPDATE ---
  private updateFighter(f: Fighter, input: InputState, opponent: Fighter) {
    // Cooldown reductions (Boss gets accelerated cooldown ticks!)
    const cdMult = f.isBoss ? 2.2 : 1.0;
    f.cooldowns.punch = Math.max(0, f.cooldowns.punch - cdMult);
    f.cooldowns.barrage = Math.max(0, f.cooldowns.barrage - cdMult);
    f.cooldowns.standToggle = Math.max(0, f.cooldowns.standToggle - cdMult);
    f.cooldowns.pose = Math.max(0, f.cooldowns.pose - cdMult);
    f.cooldowns.skill1 = Math.max(0, f.cooldowns.skill1 - cdMult);
    f.cooldowns.skill2 = Math.max(0, f.cooldowns.skill2 - cdMult);
    f.cooldowns.skill3 = Math.max(0, f.cooldowns.skill3 - cdMult);
    f.cooldowns.skill4 = Math.max(0, f.cooldowns.skill4 - cdMult);
    f.cooldowns.skill5 = Math.max(0, f.cooldowns.skill5 - cdMult);
    f.cooldowns.timeStop = Math.max(0, f.cooldowns.timeStop - cdMult);
    f.cooldowns.ultimate = Math.max(0, f.cooldowns.ultimate - cdMult);

    if (f.isBoss) {
      f.energy = Math.min(f.maxEnergy, f.energy + 0.35); // Constant Boss energy recharge
      if (this.frameCount % 45 === 0) {
        this.addMenacingParticle(f.x + f.width / 2, f.y, 'ゴ', f.charId === 'dio' ? '#facc15' : '#e11d48');
      }
    }

    f.invulnerableTimer = Math.max(0, f.invulnerableTimer - 1);
    f.hitStun = Math.max(0, f.hitStun - 1);
    f.guardBreakTimer = Math.max(0, f.guardBreakTimer - 1);

    // DIPEZ PASSIVE MECHANICS (ALWAYS DECREMENTS EVERY FRAME)
    if (f.charId === 'dipez') {
      if (f.dipezArmLostTimer && f.dipezArmLostTimer > 0) {
        f.dipezArmLostTimer--;
      }
      if (f.dipezInvisibleTimer && f.dipezInvisibleTimer > 0) {
        f.dipezInvisibleTimer--;
        if (this.frameCount % 5 === 0) {
          this.addSpark(f.x + Math.random() * f.width, f.y + Math.random() * f.height, '#fef08a');
        }
      }
      if (f.dipezStarMakerFlash && f.dipezStarMakerFlash > 0) {
        f.dipezStarMakerFlash--;
        this.screenShake = Math.max(this.screenShake, 14); // Continuous heavy screen shake during Star Maker!
      }
    }

    // Parallel Self Army (Clones update - ALWAYS runs even if main Valentine is stunned, hit, or knocked down)
    if (!f.isClone && f.valentineClones && f.valentineClones.length > 0) {
      for (let i = f.valentineClones.length - 1; i >= 0; i--) {
        const clone = f.valentineClones[i];
        if (!clone.cloneLifeTimer) clone.cloneLifeTimer = VALENTINE_CLONE_DURATION;
        clone.cloneLifeTimer--;
        if (clone.hp <= 0 || clone.cloneLifeTimer <= 0) {
          soundManager.playFlagSandwich();
          this.addSpark(clone.x + clone.width / 2, clone.y + clone.height / 2, '#f472b6');
          this.addTextParticle(clone.x + clone.width / 2, clone.y - 35, clone.hp <= 0 ? '👥 CLONE DESTROYED!' : '👥 CLONE EXPIRED!', '#f472b6');
          f.valentineClones.splice(i, 1);
        } else {
          const cloneTargets = this.getTargetsForAttacker(clone, opponent);
          const cloneTarget = cloneTargets[0] || opponent;
          const cloneInput = this.getAIControllerForFighter(clone.id).update(clone, cloneTarget, this.matchConfig, this.activeGravityAxis);
          this.updateFighter(clone, cloneInput, cloneTarget);
        }
      }
    }

    // Parallel World Timer & Active Parallel Enemy CPU (Only for main Funny Valentine)
    if (!f.isClone && f.charId === 'funny_valentine' && f.isParallelWorld) {
      if (f.parallelWorldTimer && f.parallelWorldTimer > 0) {
        f.parallelWorldTimer--;
        f.invulnerableTimer = Math.max(f.invulnerableTimer, 2);

        if (f.parallelEnemyClone) {
          if (f.parallelEnemyClone.hp <= 0) {
            soundManager.playFlagSandwich();
            this.addSpark(f.parallelEnemyClone.x + f.parallelEnemyClone.width / 2, f.parallelEnemyClone.y + f.parallelEnemyClone.height / 2, '#38bdf8');
            this.addTextParticle(f.parallelEnemyClone.x + f.parallelEnemyClone.width / 2, f.parallelEnemyClone.y - 35, '🌀 PARALLEL ENEMY CLONE DESTROYED!', '#38bdf8');
            f.parallelEnemyClone = null;
          } else {
            // Keep clone locked in Parallel World
            f.parallelEnemyClone.isParallelWorld = true;
            const cloneInput = this.getAIControllerForFighter(f.parallelEnemyClone.id).update(
              f.parallelEnemyClone,
              [f],
              this.matchConfig,
              this.activeGravityAxis
            );
            this.updateFighter(f.parallelEnemyClone, cloneInput, f);
          }
        }
      } else {
        f.isParallelWorld = false;
        if (f.parallelEnemyClone) {
          f.parallelEnemyClone = null;
        }
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🌀 RETURNED TO MAIN DIMENSION', '#94a3b8');
      }
    }

    if (f.epitaphTimer && f.epitaphTimer > 0) {
      f.epitaphTimer--;
      if (f.epitaphTimer <= 0) f.isEpitaphActive = false;
    }
    if (f.timeEraseTimer && f.timeEraseTimer > 0) {
      f.timeEraseTimer--;
      if (f.timeEraseTimer <= 0) f.isTimeEraseActive = false;
    }

    // Initialize afterimages array if undefined
    if (!f.afterimages) {
      f.afterimages = [];
    }

    // Decay existing afterimages
    f.afterimages.forEach(img => {
      img.alpha -= 0.045; // Fade out rate
    });
    f.afterimages = f.afterimages.filter(img => img.alpha > 0);

    // If Diavolo and Time Erase is active, record new afterimage
    if (f.charId === 'king_crimson' && f.isTimeEraseActive) {
      // Record a position trail if moving or acting
      if (this.frameCount % 3 === 0 && (f.vx !== 0 || f.vy !== 0 || f.action === 'walk' || f.action === 'jump')) {
        f.afterimages.push({
          x: f.x,
          y: f.y,
          alpha: 0.8,
          facing: f.facing,
          charId: 'king_crimson',
          color: 'rgba(239, 68, 68, 0.65)' // Red/Crimson afterimage
        });
      }
    }

    // PUCCI MADE IN HEAVEN: Continuous Speed Afterimages whenever moving, jumping, or executing any skills (like Diavolo Time Erase)
    if (f.charId === 'pucci' && f.pucciForm === 'made_in_heaven') {
      const isMovingOrActing = (
        Math.abs(f.vx) > 0.05 || 
        Math.abs(f.vy) > 0.05 || 
        f.action !== 'idle' ||
        (f.actionTimer && f.actionTimer > 0)
      );

      if (isMovingOrActing) {
        // Dynamic spawn frequency: every frame during active Time Accel / Universe Reset / Speed Blitz, otherwise every 2 frames
        const spawnInterval = (f.mihTimeAccelTimer && f.mihTimeAccelTimer > 0) || f.action === 'mih_universe_reset' || f.action === 'mih_speed_blitz' ? 1 : 2;
        if (this.frameCount % spawnInterval === 0) {
          const celestialColors = [
            'rgba(250, 204, 21, 0.75)',  // Radiant Heaven Gold
            'rgba(255, 255, 255, 0.75)',  // Pure Celestial White
            'rgba(56, 189, 248, 0.70)',   // Cosmic Cyan Velocity
            'rgba(234, 179, 8, 0.70)',    // Sunburst Amber
          ];
          const chosenColor = celestialColors[f.afterimages.length % celestialColors.length];
          f.afterimages.push({
            x: f.x,
            y: f.y,
            alpha: 0.85,
            facing: f.facing,
            charId: 'pucci',
            color: chosenColor
          });
        }
      }
    }

    // --- MANGA MENACING SFX GENERATOR (WALKING, FOOTSTEPS, LANDING, STAND AURA) ---
    // 1. Ground Landing Impact SFX (When touching down on floor)
    if (!f.wasGroundedLastFrame && f.isGrounded && Math.abs(f.vy) > 1.2) {
      const landX = f.x + f.width / 2;
      const landY = f.y + f.height - 12;
      this.addMenacingParticle(landX - 22, landY, 'ド', 'rgba(239, 68, 68, 0.9)');
      this.addMenacingParticle(landX + 22, landY, 'ゴ', 'rgba(192, 132, 252, 0.9)');
    }
    f.wasGroundedLastFrame = f.isGrounded;

    // 2. Walking / Footstep Menacing Particles (When stepping/walking across the ground)
    if (f.isGrounded && (f.action === 'walk' || Math.abs(f.vx) > 0.4)) {
      if (this.frameCount % 7 === (f.id === 'player' ? 0 : 3)) {
        const footX = f.x + f.width / 2 + (Math.random() * 26 - 13);
        const footY = f.y + f.height - 10;
        const footGlyphs = ['ゴ', 'ド', 'ズズ', 'ドド'];
        const chosenGlyph = footGlyphs[Math.floor(Math.random() * footGlyphs.length)];
        const footColor = f.charId === 'dio' ? 'rgba(234, 179, 8, 0.9)'
          : f.charId === 'gappy' ? 'rgba(56, 189, 248, 0.9)'
          : f.charId === 'pucci' ? 'rgba(192, 132, 252, 0.9)'
          : f.charId === 'tooru' ? 'rgba(239, 68, 68, 0.9)'
          : 'rgba(168, 85, 247, 0.9)';
        this.addMenacingParticle(footX, footY, chosenGlyph, footColor);
      }
    }

    // 3. Stand Active Ambient Aura Particles
    if (f.isStandActive && this.frameCount % 16 === (f.id === 'player' ? 0 : 8)) {
      const auraX = f.x + Math.random() * f.width;
      const auraY = f.y - 10 + Math.random() * f.height;
      const auraGlyph = Math.random() < 0.7 ? 'ゴ' : (Math.random() < 0.5 ? 'ド' : 'ズ');
      const auraColor = f.charId === 'dio' ? 'rgba(250, 204, 21, 0.85)'
        : f.charId === 'crazy_diamond' ? 'rgba(56, 189, 248, 0.85)'
        : f.charId === 'king_crimson' ? 'rgba(251, 113, 133, 0.85)'
        : f.charId === 'gappy' ? 'rgba(125, 211, 252, 0.85)'
        : f.charId === 'pucci' ? 'rgba(192, 132, 252, 0.85)'
        : 'rgba(168, 85, 247, 0.85)';
      this.addMenacingParticle(auraX, auraY, auraGlyph, auraColor);
    }

    if (f.isShootingSwordCooldown && f.isShootingSwordCooldown > 0) {
      f.isShootingSwordCooldown--;
    }
    if (f.blindedTimer && f.blindedTimer > 0) {
      f.blindedTimer--;
    }

    // Josuke Crazy Diamond checks
    if (f.charId === 'crazy_diamond') {
      // Check auto-trigger Enraged under 30% HP
      if (f.hp < f.maxHp * 0.30 && !f.isEnraged) {
        f.isEnraged = true;
        f.enragedTimer = 600; // 10s buff duration
        this.addTextParticle(f.x + f.width / 2, f.y - 45, "🤬 DON'T INSULT MY HAIR!!!", '#f43f5e');
        this.addMenacingParticle(f.x, f.y - 15, '💢', '#ef4444');
        soundManager.playPoseSound('crazy_diamond');
        this.screenShake = Math.max(this.screenShake, 8.5);
      }
    }

    if (f.enragedTimer && f.enragedTimer > 0) {
      f.enragedTimer--;
      if (f.enragedTimer <= 0 && f.hp >= f.maxHp * 0.30) {
        f.isEnraged = false;
        this.addTextParticle(f.x + f.width / 2, f.y - 40, "😇 JOSUKE CALMED DOWN", '#38bdf8');
      }
    }

    if (f.rockShieldTimer && f.rockShieldTimer > 0) {
      f.rockShieldTimer--;
      if (f.rockShieldTimer <= 0) {
        f.rockShieldX = undefined;
      }
    }

    if (f.angeloWallTimer && f.angeloWallTimer > 0) {
      f.angeloWallTimer--;
      // Keep opponent rooted
      opponent.vx = 0;
      opponent.vy = 0;
      opponent.hitStun = Math.max(opponent.hitStun, 2);
      if (this.frameCount % 5 === 0) {
        this.addSpark(opponent.x + opponent.width / 2, opponent.y + opponent.height / 2, '#64748b');
      }
    }

    // TOORU & WONDER OF U STATUS TIMERS & CALAMITY FLOW
    if (f.burnedTimer && f.burnedTimer > 0) {
      f.burnedTimer--;
      if (this.frameCount % 18 === 0) {
        this.applyRawDamage(f, CALAMITY_COMBUSTION_TICK_DAMAGE, 0, 0);
        this.addMenacingParticle(f.x + Math.random() * f.width, f.y + Math.random() * f.height, '🔥', '#f97316');
      }
    }
    if (f.bleedTimer && f.bleedTimer > 0) {
      f.bleedTimer--;
      if (this.frameCount % 15 === 0) {
        this.applyRawDamage(f, CALAMITY_BLEED_TICK_DAMAGE, 0, 0);
        this.addMenacingParticle(f.x + Math.random() * f.width, f.y + Math.random() * f.height, '🩸', '#dc2626');
      }
    }
    if (f.headDoctorTimer && f.headDoctorTimer > 0) {
      f.headDoctorTimer--;
      f.invulnerableTimer = Math.max(f.invulnerableTimer, 2); // Maintain invulnerability
      if (f.headDoctorTimer <= 0) {
        f.isHeadDoctorDisguise = false;
        this.addTextParticle(f.x + f.width / 2, f.y - 30, 'DISGUISE EXPIRED', '#94a3b8');
      }
    }
    if (f.calamityCounterTimer && f.calamityCounterTimer > 0) {
      f.calamityCounterTimer--;
      if (f.calamityCounterTimer <= 0) {
        f.isCalamityCounterActive = false;
      }
    }
    if (f.calamityCooldownTimer && f.calamityCooldownTimer > 0) {
      f.calamityCooldownTimer--;
    }
    if (f.calamityRainTimer && f.calamityRainTimer > 0) {
      f.calamityRainTimer--;
      // Keep Tooru protected in the eye of the calamity storm
      if (f.charId === 'tooru') {
        f.invulnerableTimer = Math.max(f.invulnerableTimer, 20);
      }
      // Dense piercing rain across the entire map
      if (this.frameCount % 2 === 0) {
        this.spawnCalamityRaindrop(f, opponent);
      }

      // ULTIMATE MASSIVE HIGHWAY TRAFFIC CARNAGE:
      // Fast-paced bumper-to-bumper convoys (🚗 🚙 🛻 🚐 🚚 🚛) rushing from outside map walls!
      if (f.calamityRainTimer > 25 && f.calamityRainTimer % 20 === 0) {
        const waveIndex = Math.floor((TOORU_ULTIMATE_DURATION - f.calamityRainTimer) / 20);
        const vehicleTypes: Array<'sedan' | 'suv' | 'pickup' | 'van' | 'truck' | 'semi'> = [
          'sedan', 'suv', 'pickup', 'van', 'truck', 'semi', 'sedan', 'pickup'
        ];
        // Spawn a fast sequence of vehicles from both left & right walls simultaneously!
        for (let c = 0; c < 6; c++) {
          const type = vehicleTypes[(waveIndex * 2 + c) % vehicleTypes.length];
          const dir: 1 | -1 = c % 2 === 0 ? 1 : -1;
          const sideIndex = Math.floor(c / 2);
          const offset = sideIndex * 200;
          this.spawnRunawayCar(f, opponent, dir, type, offset);
        }
      } else if (f.calamityRainTimer === 20) {
        // Climax: Giant Extinction Meteor crashes onto opponent!
        this.spawnCalamityMeteor(f, opponent);
      }
    }

    // Wonder of U Autonomous Entity AI & Combat (Walks freely across the arena & repels intruders)
    if (f.charId === 'tooru') {
      if (!f.wouEntity) {
        f.wouEntity = {
          x: f.x - (f.facing === 'right' ? 80 : -80),
          y: f.y,
          vx: 0,
          vy: 0,
          facing: f.facing,
          walkTimer: 0,
          active: true,
          state: 'idle',
          targetX: f.x,
        };
      }

      const wou = f.wouEntity;
      wou.walkTimer++;

      // Wonder of U Autonomous Wandering & Stalking AI
      if (wou.walkTimer % 90 === 0) {
        const rand = Math.random();
        if (rand < 0.35) {
          wou.state = 'walk';
          wou.targetX = Math.max(80, Math.min(this.getArenaWidth() - 80, f.x + (Math.random() * 400 - 200)));
        } else if (rand < 0.85) {
          wou.state = 'stalk';
          wou.targetX = Math.max(80, Math.min(this.getArenaWidth() - 80, opponent.x + (Math.random() > 0.5 ? 90 : -90)));
        } else {
          wou.state = 'idle';
          wou.vx = 0;
        }
      }

      if (wou.state === 'walk' || wou.state === 'stalk') {
        const dx = wou.targetX - wou.x;
        if (Math.abs(dx) > 15) {
          wou.vx = Math.sign(dx) * 2.4; // Menacing walking speed
          wou.facing = dx > 0 ? 'right' : 'left';
        } else {
          wou.vx = 0;
          wou.state = 'idle';
        }
      } else {
        wou.vx = 0;
      }

      wou.x += wou.vx;
      wou.y = f.y;

      // Wonder of U Autonomous Proximity Retaliation:
      // If the opponent gets dangerously close to Wonder of U, WoU strikes with Calamity Aura!
      const distToWou = Math.abs((wou.x + 20) - (opponent.x + opponent.width / 2));
      if (!this.timeStopState.isActive && distToWou < 200 && (!wou.attackCooldown || wou.attackCooldown <= 0)) {
        wou.facing = opponent.x > wou.x ? 'right' : 'left';
        if (opponent.charId === 'dipez' && opponent.dipezForm === 'pure_light') {
          this.triggerDipezAutoBlink(opponent, f);
        } else {
          const knockDir = wou.facing === 'right' ? 1 : -1;
          this.applyRawDamage(opponent, 145, knockDir * 16, -9, f);
          opponent.hitStun = 45;
          opponent.isGrounded = false;
          soundManager.playRazorCut();
          this.screenShake = 10;
          this.addShockwave(wou.x + 20, wou.y + 35, '#ef4444');
          this.addTextParticle(wou.x, wou.y - 45, '⚠️ [WOU: CANE OF CALAMITY!]', '#ef4444');
        }
        wou.attackCooldown = 55;
      }
      if (wou.attackCooldown && wou.attackCooldown > 0) {
        wou.attackCooldown--;
      }

      // Floating "DO DO DO DE DA DA DA" and Menacing Katakana particles around Wonder of U & Tooru
      if (this.frameCount % 24 === 0) {
        const text = Math.random() > 0.5 ? 'DO DO DO' : 'DE DA DA DA';
        this.addTextParticle(wou.x + (Math.random() * 30 - 15), wou.y - 45, text, '#ef4444');
      }

      // Continuous Menacing Katakana SFX beside Wonder of U Entity
      if (this.frameCount % 8 === 0) {
        const wouSideX = wou.x + (Math.random() > 0.5 ? -25 : 35);
        const wouSideY = wou.y - 15 + (Math.random() * 30 - 15);
        const wouGlyph = Math.random() < 0.7 ? 'ゴ' : (Math.random() < 0.5 ? 'ド' : '災');
        this.addMenacingParticle(wouSideX, wouSideY, wouGlyph, '#ef4444');
      }

      // Continuous Menacing Katakana SFX beside Tooru himself
      if (this.frameCount % 8 === 4) {
        const tooruSideX = f.x + (Math.random() > 0.5 ? -28 : 38);
        const tooruSideY = f.y - 15 + (Math.random() * 30 - 15);
        const tooruGlyph = Math.random() < 0.7 ? 'ゴ' : (Math.random() < 0.5 ? 'ド' : '災');
        this.addMenacingParticle(tooruSideX, tooruSideY, tooruGlyph, '#ef4444');
      }

      // PASSIVE: "LOGIC OF CALAMITY" - Trigger when enemy approaches, pursues or attacks Tooru (same dimension only)
      const isSameDimension = !!f.isParallelWorld === !!opponent.isParallelWorld;
      const isOpponentApproaching = isSameDimension && ((opponent.facing === 'right' && opponent.x < f.x && opponent.vx > 0.3) ||
                                    (opponent.facing === 'left' && opponent.x > f.x && opponent.vx < -0.3));
      const isOpponentAttacking = isSameDimension && ['punch', 'barrage', 'skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'ultimate', 'star_finger', 'knife_throw', 'road_roller', 'clacker_boomerang', 'ray_of_light', 'homing_shard'].includes(opponent.action);
      const dist = Math.abs((f.x + f.width / 2) - (opponent.x + opponent.width / 2));

      const isPursuing = isSameDimension && ((isOpponentApproaching && dist < 850) || (isOpponentAttacking && dist < 900) || (dist < 400));
      opponent.isPursuing = isPursuing;

      // TIME STOP WEAKNESS RULE (CRUCIAL):
      // If Time Stop is active, Calamity flow is totally broken and Tooru is frozen & vulnerable!
      if (this.timeStopState.isActive) {
        f.isCalamityCounterActive = false;
        f.isHeadDoctorDisguise = false;
        f.invulnerableTimer = 0;
      } else {
        // Normal time flow -> Calamity logic is highly active and potent!
        if (isPursuing && (!f.calamityCooldownTimer || f.calamityCooldownTimer <= 0)) {
          this.triggerCalamity(f, opponent);
          const cd = f.isHeadDoctorDisguise ? 20 : 32;
          f.calamityCooldownTimer = cd;
        }
      }
    }

    // Combo reset timer
    if (f.comboResetTimer > 0) {
      f.comboResetTimer--;
      if (f.comboResetTimer <= 0) f.comboCount = 0;
    }

    // Energy management
    if (f.isStandActive) {
      if (this.matchConfig.mode !== 'training' && !this.timeStopState.isActive) {
        f.energy = Math.max(0, f.energy - STAND_ENERGY_UPKEEP);
      }
      if (f.energy <= 0 && this.matchConfig.mode !== 'training') {
        f.isStandActive = false;
        this.addTextParticle(f.x + f.width / 2, f.y - 20, 'STAND DISMISSED', '#94a3b8');
      }
    } else {
      f.energy = Math.min(f.maxEnergy, f.energy + ENERGY_REGEN_PER_FRAME);
    }

    // Smooth Stand / Hamon Aura fade transition
    const shouldShowAura = f.isStandActive || (!f.hasStand && (f.action !== 'idle' || f.energy >= 40));
    if (shouldShowAura) {
      f.standAlpha = Math.min(1, f.standAlpha + 0.1);
    } else {
      f.standAlpha = Math.max(0, f.standAlpha - 0.08);
    }

    // 1. Defeat / KO State Lock
    if (f.hp <= 0) {
      f.action = 'dead';
      f.isStandActive = false;
      this.applyPhysics(f);
      return;
    }

    // 2. Knockdown State (Lying on ground)
    if (f.action === 'knockdown') {
      f.vx *= 0.85;
      this.applyPhysics(f);
      if (f.actionTimer > 0) {
        f.actionTimer--;
        if (f.actionTimer <= 0) {
          if (f.hp <= 0) {
            f.action = 'dead';
          } else {
            f.action = 'wakeup';
            f.actionTimer = 25;
            f.actionDuration = 25;
            f.invulnerableTimer = 30;
          }
        }
      }
      return;
    }

    // 3. Wakeup State (Pushing up off floor)
    if (f.action === 'wakeup') {
      this.applyPhysics(f);
      if (f.actionTimer > 0) {
        f.actionTimer--;
        if (f.actionTimer <= 0) {
          f.action = 'idle';
        }
      }
      return;
    }

    // 4. Knockback State (Flying backward in air/recoil)
    if (f.action === 'knockback') {
      this.applyPhysics(f);
      if (f.isGrounded) {
        f.action = 'knockdown';
        f.actionTimer = 40;
        f.actionDuration = 40;
        f.vx *= 0.3;
        soundManager.playHit(false);
        this.addShockwave(f.x + f.width / 2, GROUND_Y - 10, '#94a3b8');
      }
      return;
    }

    // 5. Guard Break state lock
    if (f.guardBreakTimer > 0) {
      f.action = 'guard_break';
      this.applyPhysics(f);
      return;
    }

    // 6. Hitstun lock
    if (f.hitStun > 0) {
      if (!f.isGrounded || Math.abs(f.vx) > 7 || f.vy < -2) {
        f.action = 'knockback';
      } else {
        f.action = 'hit';
      }
      this.applyPhysics(f);
      if (f.action === 'knockback' && f.isGrounded) {
        f.action = 'knockdown';
        f.actionTimer = 40;
        f.actionDuration = 40;
        f.vx *= 0.3;
        soundManager.playHit(false);
        this.addShockwave(f.x + f.width / 2, GROUND_Y - 10, '#94a3b8');
      }
      return;
    }

    // Grabbed by Command Grab (locked in place while attacker pummels)
    if (f.action === 'grabbed') {
      f.vx = 0;
      f.vy = 0;
      return;
    }

    // Handle Active Action Execution Timers
    if (f.actionTimer > 0) {
      const op = (f.id === 'player' || f.id === 'teammate') ? this.ai : this.player;
      const isSlowed = op && op.charId === 'king_crimson' && op.isTimeEraseActive;
      if (!isSlowed || this.frameCount % 4 === 0) {
        f.actionTimer--;
        this.handleActionFrame(f, opponent);
      }

      if (f.actionTimer <= 0) {
        f.isParrying = false;
        f.action = f.isGrounded ? 'idle' : 'jump';
        if (f.grabbedTarget) {
          opponent.action = 'idle';
          f.grabbedTarget = null;
        }
      }

      this.applyPhysics(f);
      return;
    }

    // STATUS EFFECT & PASSIVE TIMERS
    // 0. Silenced by Whitesnake Disc Steal (Blocks skill activations)
    if (f.silencedTimer && f.silencedTimer > 0) {
      f.silencedTimer--;
      input.skill1 = false;
      input.skill2 = false;
      input.skill3 = false;
      input.skill4 = false;
      input.skill5 = false;
      input.timeStop = false;
      input.ultimate = false;
      if (this.frameCount % 20 === 0) {
        this.addTextParticle(f.x + f.width / 2, f.y - 30, '💿 SILENCED', '#94a3b8');
      }
    }

    // 0.1. Frozen in Place by Stand Disc Command (1.5s stun)
    if (f.discFrozenTimer && f.discFrozenTimer > 0) {
      f.discFrozenTimer--;
      f.vx = 0;
      f.vy = 0;
      f.action = 'hit';
      if (this.frameCount % 15 === 0) {
        this.addSpark(f.x + f.width / 2, f.y + f.height / 2, '#e2e8f0');
      }
      this.applyPhysics(f);
      return;
    }

    // 0.2. C-Moon Gravity Shield Timer
    if (f.cmoonShieldTimer && f.cmoonShieldTimer > 0) {
      f.cmoonShieldTimer--;
    }

    // 0.3. Made in Heaven Time Acceleration Timer (Instantly refreshes all MiH cooldowns)
    if (f.mihTimeAccelTimer && f.mihTimeAccelTimer > 0) {
      f.mihTimeAccelTimer--;
      if (f.charId === 'pucci') {
        f.cooldowns.skill1 = 0;
        f.cooldowns.skill2 = 0;
        f.cooldowns.skill3 = 0;
        f.cooldowns.skill4 = 0;
        f.cooldowns.ultimate = 0;
      }
    }

    // 0.4. C-Moon Passive: Gravitational Repulsion (Gently repulses opponent when within 140px)
    if (f.charId === 'pucci' && f.pucciForm === 'cmoon' && opponent && opponent.hp > 0) {
      const pCx = f.x + f.width / 2;
      const opCx = opponent.x + opponent.width / 2;
      const dist = Math.abs(pCx - opCx);
      if (dist < 140 && dist > 10) {
        const pushDir = opCx > pCx ? 1 : -1;
        opponent.vx += pushDir * (140 - dist) * 0.025;
        if (this.frameCount % 20 === 0) {
          this.addSpark(opponent.x + opponent.width / 2, opponent.y + opponent.height / 2, '#22c55e');
        }
      }
    }

    // 0.5. Made in Heaven Passive: Velocity Acceleration
    if (f.charId === 'pucci' && f.pucciForm === 'made_in_heaven') {
      if (input.left || input.right) {
        f.mihSpeedStack = Math.min(1.8, (f.mihSpeedStack || 0) + 0.02);
      } else {
        f.mihSpeedStack = 0;
      }
    }

    // 0.6. Gappy Status Timers & Passive Mechanics
    // Friction Theft (Zero ground friction, fighter slips out of control)
    if (f.gappyFrictionTheftTimer && f.gappyFrictionTheftTimer > 0) {
      f.gappyFrictionTheftTimer--;
      if (f.isGrounded) {
        f.vx *= 0.995;
      }
      if (this.frameCount % 15 === 0) {
        this.addSpark(f.x + f.width / 2, f.y + f.height, '#38bdf8');
      }
    }

    // Sight Theft (Screen blackout vignette)
    if (f.gappySightTheftTimer && f.gappySightTheftTimer > 0) {
      f.gappySightTheftTimer--;
      if (this.frameCount % 20 === 0) {
        this.addTextParticle(f.x + f.width / 2, f.y - 25, '👁️ SIGHT THEFT', '#0f172a');
      }
    }

    // Sound Theft (Muted sound effects)
    if (f.gappySoundTheftTimer && f.gappySoundTheftTimer > 0) {
      f.gappySoundTheftTimer--;
      if (this.frameCount % 20 === 0) {
        this.addTextParticle(f.x + f.width / 2, f.y - 25, '🔇 SOUND THEFT', '#64748b');
      }
    }

    // Attack Theft (50% reduced attack power)
    if (f.gappyAttackTheftTimer && f.gappyAttackTheftTimer > 0) {
      f.gappyAttackTheftTimer--;
      if (this.frameCount % 20 === 0) {
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '📉 ATK DRAIN (-50%)', '#0284c7');
      }
    }

    // Bubble Shield Timer
    if (f.gappyShieldTimer && f.gappyShieldTimer > 0) {
      f.gappyShieldTimer--;
      f.gappyShieldActive = true;
      if (this.frameCount % 12 === 0) {
        this.addSpark(f.x + f.width / 2, f.y + f.height / 2, '#7dd3fc');
      }
    } else {
      f.gappyShieldActive = false;
    }

    // Suspended in Bubble Trap
    if (f.gappyTrappedTimer && f.gappyTrappedTimer > 0) {
      f.gappyTrappedTimer--;
      f.vy = Math.sin(this.frameCount * 0.1) * 0.5;
      f.vx = 0;
      f.action = 'stun';
      if (this.frameCount % 15 === 0) {
        this.addSpark(f.x + f.width / 2, f.y + f.height / 2, '#38bdf8');
      }
      this.applyPhysics(f);
      return;
    }

    // Active Friction Strips (Floor traps)
    if (f.gappyFrictionStrips && f.gappyFrictionStrips.length > 0) {
      f.gappyFrictionStrips = f.gappyFrictionStrips.filter(strip => {
        strip.timer--;
        if (opponent && opponent.isGrounded) {
          const opCenterX = opponent.x + opponent.width / 2;
          if (Math.abs(opCenterX - strip.x) < strip.width / 2) {
            opponent.gappyFrictionTheftTimer = 60; // 1s zero friction slip
            opponent.vx += (opCenterX > strip.x ? 5 : -5);
          }
        }
        return strip.timer > 0;
      });
    }

    // FUNNY VALENTINE TIMERS & DUAL-DIMENSION MECHANICS (PART 7)
    if (f.charId === 'funny_valentine') {
      // Love Train Active
      if (f.loveTrainTimer && f.loveTrainTimer > 0) {
        f.loveTrainTimer--;
        f.isLoveTrainActive = true;
        f.invulnerableTimer = Math.max(f.invulnerableTimer, 2);
        if (this.frameCount % 8 === 0) {
          this.addSpark(f.x + (Math.random() * 80 - 40), f.y - 20 + Math.random() * 100, '#fbbf24');
        }
      } else {
        f.isLoveTrainActive = false;
      }

      // Paradox Collision (Magnetic pulling & Menger Sponge explosion)
      if (f.isParadoxColliding && f.parallelEnemyClone) {
        if (f.paradoxCollisionTimer && f.paradoxCollisionTimer > 0) {
          f.paradoxCollisionTimer--;
          const opCenterX = opponent.x + opponent.width / 2;
          const cloneCenterX = f.parallelEnemyClone.x + f.parallelEnemyClone.width / 2;
          const midX = (opCenterX + cloneCenterX) / 2;

          opponent.x += (midX - opCenterX) * 0.25;
          f.parallelEnemyClone.x += (midX - cloneCenterX) * 0.25;

          this.addSpark(midX, opponent.y + 30, '#38bdf8');
          this.addSpark(midX, opponent.y + 30, '#f472b6');

          if (f.paradoxCollisionTimer <= 0) {
            soundManager.playParadoxCollision();
            opponent.hp = Math.max(0, opponent.hp - VALENTINE_PARADOX_TRUE_DAMAGE);
            opponent.hitStun = 90;
            opponent.action = 'knockdown';
            opponent.actionTimer = 60;
            opponent.actionDuration = 60;
            this.screenShake = 28;

            this.addShockwave(midX, opponent.y + 30, '#38bdf8');
            this.addShockwave(midX, opponent.y + 30, '#f472b6');

            for (let p = 0; p < 48; p++) {
              if (this.particles.length >= this.MAX_PARTICLES) this.particles.shift();
              this.particles.push({
                id: Math.random(),
                x: midX + (Math.random() * 90 - 45),
                y: opponent.y + (Math.random() * 90 - 45),
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 50,
                maxLife: 50,
                size: Math.random() * 14 + 6,
                color: Math.random() < 0.5 ? '#38bdf8' : '#f472b6',
                type: 'paradox_cube'
              });
            }

            this.addTextParticle(midX, opponent.y - 45, `💥 ANNIHILATION PARADOX (MENGER SPONGE)! -${VALENTINE_PARADOX_TRUE_DAMAGE} TRUE DAMAGE!`, '#ef4444');
            f.parallelEnemyClone = null;
            f.isParallelWorld = false;
            f.isParadoxColliding = false;
          }
        }
      }
    }

    // DIPEZ MECHANICS & TIMERS
    if (f.charId === 'dipez') {

      // Arm lost drawback when Arm Laser Cannon finishes in base form
      if (f.action === 'dipez_laser_cannon' && f.actionTimer === 1 && f.dipezForm !== 'pure_light') {
        f.dipezArmLostTimer = 300; // 5 seconds missing arms!
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'whaa!!! (ARMS LOST FOR 5s)', '#ef4444');
        soundManager.playDipezWhaa();
      }

      // Evolved Form: Pure Light Form passive continuous invincibility auto-blink & photon aura
      if (f.dipezForm === 'pure_light') {
        f.isInvulnerable = true;
        f.invulnerableTimer = Math.max(f.invulnerableTimer, 2);

        // Pure light cannot be burned, bled, blinded, silenced, frozen or trapped
        f.burnedTimer = 0;
        if (f.bleedTimer) f.bleedTimer = 0;
        if (f.blindedTimer) f.blindedTimer = 0;
        if (f.silencedTimer) f.silencedTimer = 0;
        if (f.discFrozenTimer) f.discFrozenTimer = 0;
        if (f.gappyTrappedTimer) f.gappyTrappedTimer = 0;

        if (this.frameCount % 4 === 0) {
          this.addSpark(f.x + Math.random() * f.width, f.y + Math.random() * f.height, '#ffffff');
          this.addSpark(f.x + Math.random() * f.width, f.y + Math.random() * f.height, '#fef08a');
        }

        // Star Maker active damage tick (Arena white burn - HIGH DAMAGE!)
        if (f.dipezStarMakerActive && f.dipezStarMakerTimer && f.dipezStarMakerTimer > 0) {
          f.dipezStarMakerTimer--;
          if (this.frameCount % 4 === 0) {
            const allTargets = this.getAllActiveFighters();
            for (const target of allTargets) {
              if (target && target.hp > 0 && target.id !== f.id && target.team !== f.team) {
                this.applyRawDamage(target, 16, 0, -1, f);
                target.burnedTimer = Math.max(target.burnedTimer || 0, 180);
                this.addSpark(target.x + target.width / 2, target.y + target.height / 2, '#ffffff');
                this.addMenacingParticle(target.x + Math.random() * target.width, target.y + Math.random() * target.height, '💥', '#fef08a');
              }
            }
          }
          if (f.dipezStarMakerTimer <= 0) {
            f.dipezStarMakerActive = false;
          }
        }
      }
    }

    // TRIGGER ACTIONS BASED ON CHARACTER SKILLS
    const isJotaro = f.charId === 'jotaro';
    const isDio = f.charId === 'dio';
    const isJonathan = f.charId === 'jonathan';
    const isYoungJoseph = f.charId === 'joseph_young';
    const isOldJoseph = f.charId === 'joseph_old';
    const isDiavolo = f.charId === 'king_crimson';
    const isPolnareff = f.charId === 'silver_chariot';
    const isCrazyDiamond = f.charId === 'crazy_diamond';
    const isTooru = f.charId === 'tooru';
    const isPucci = f.charId === 'pucci';
    const isGappy = f.charId === 'gappy';
    const isValentine = f.charId === 'funny_valentine';
    const isDipez = f.charId === 'dipez';

    // Universal Time Stop / Time Erase Trigger (Key T / Button T:STOP / T:ERASE)
    if (input.timeStop && f.cooldowns.timeStop <= 0) {
      if (isDiavolo && (f.energy >= TIME_ERASE_COST || this.matchConfig.mode === 'training')) {
        this.activateTimeErase(f, opponent);
        this.applyPhysics(f);
        return;
      } else if ((isJotaro || isDio) && (f.energy >= TIME_STOP_ENERGY_COST || this.matchConfig.mode === 'training')) {
        this.activateTimeStop(f);
        this.applyPhysics(f);
        return;
      }
    }

    // 1. Stand Toggle / Equip Sword Stance Toggle
    if (input.toggleStand && f.cooldowns.standToggle <= 0) {
      if (isJonathan) {
        f.isSwordEquipped = !f.isSwordEquipped;
        f.isStandActive = f.isSwordEquipped; // Active Hamon aura glow
        f.cooldowns.standToggle = 25;
        soundManager.playSwordSlash();
        const msg = f.isSwordEquipped ? '⚔️ CHANGE: LUCK & PLUCK EQUIPPED!' : '👊 CHANGE: BARE HANDS STANCE';
        this.addTextParticle(f.x + f.width / 2, f.y - 40, msg, f.isSwordEquipped ? '#38bdf8' : '#facc15');
        for (let i = 0; i < 10; i++) {
          this.addSpark(
            f.x + f.width / 2 + (Math.random() * 40 - 20),
            f.y + f.height / 2 + (Math.random() * 40 - 20),
            f.isSwordEquipped ? '#38bdf8' : '#facc15'
          );
        }
      } else {
        f.isStandActive = !f.isStandActive;
        f.cooldowns.standToggle = 25;
        this.addTextParticle(f.x + f.width / 2, f.y - 30, f.isStandActive ? `[${f.standName}]` : 'STAND OFF', '#facc15');
        for (let i = 0; i < 6; i++) {
          this.addSpark(f.x + f.width / 2, f.y + f.height / 2, f.isStandActive ? '#c084fc' : '#94a3b8');
        }
      }
    }

    // 2. JONATHAN JOESTAR SKILLS (HAMON & LUCK/PLUCK SWORD)
    if (isJonathan) {
      // Skill 1: Zoom Punch (Bare hand) / Pluck Hamon Thrust (Sword)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= ZOOM_PUNCH_COST || this.matchConfig.mode === 'training')) {
        f.action = 'zoom_punch';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill1 = ZOOM_PUNCH_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= ZOOM_PUNCH_COST;
        if (f.isSwordEquipped) {
          soundManager.playSwordSlash();
          this.addTextParticle(f.x + f.width / 2, f.y - 35, 'PLUCK HAMON THRUST!', '#38bdf8');
        } else {
          soundManager.playHamonBuzz();
          this.addTextParticle(f.x + f.width / 2, f.y - 35, 'ZOOM PUNCH!', '#facc15');
        }
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Hamon Breathing & Heal / Blade Resonance
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= HAMON_HEAL_COST || this.matchConfig.mode === 'training')) {
        f.action = 'hamon_heal';
        f.actionTimer = HAMON_HEAL_DURATION;
        f.actionDuration = HAMON_HEAL_DURATION;
        f.cooldowns.skill2 = HAMON_HEAL_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= HAMON_HEAL_COST;
        const healAmt = f.isSwordEquipped ? HAMON_HEAL_AMOUNT + 30 : HAMON_HEAL_AMOUNT;
        f.hp = Math.min(f.maxHp, f.hp + healAmt);
        f.energy = Math.min(f.maxEnergy, f.energy + HAMON_HEAL_ENERGY_GAIN);
        soundManager.playHamonBreath();
        const msg = f.isSwordEquipped ? `+${healAmt} HP (BLADE RESONANCE)` : `+${healAmt} HP (SENDO HEAL)`;
        this.addTextParticle(f.x + f.width / 2, f.y - 40, msg, '#4ade80');
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Sendo Wave (Bare hand) / Sunlight Crescent Wave (Sword)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= SENDO_WAVE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'sendo_wave';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill3 = SENDO_WAVE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= SENDO_WAVE_COST;
        if (f.isSwordEquipped) {
          this.spawnSwordCrescentWave(f);
          soundManager.playSwordSlash();
          this.addTextParticle(f.x + f.width / 2, f.y - 35, 'SUNLIGHT CRESCENT WAVE!', '#38bdf8');
        } else {
          this.spawnSendoWave(f);
          soundManager.playHamonBuzz();
          this.addTextParticle(f.x + f.width / 2, f.y - 35, 'SENDO HAMON OVERDRIVE!', '#eab308');
        }
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Scarlet Overdrive Stance (Bare hand) / Pluck Counter Stance (Sword)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= HAMON_COUNTER_COST || this.matchConfig.mode === 'training')) {
        f.action = 'hamon_counter';
        f.actionTimer = 40;
        f.actionDuration = 40;
        f.cooldowns.skill4 = HAMON_COUNTER_COOLDOWN;
        f.isParrying = true;
        if (this.matchConfig.mode !== 'training') f.energy -= HAMON_COUNTER_COST;
        soundManager.playHamonBuzz();
        const counterMsg = f.isSwordEquipped ? 'PLUCK BLADE COUNTER STANCE' : 'SCARLET OVERDRIVE STANCE';
        this.addTextParticle(f.x + f.width / 2, f.y - 35, counterMsg, f.isSwordEquipped ? '#38bdf8' : '#f97316');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Sword of Luck & Pluck / Change Equip & Slash
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= LUCK_PLUCK_COST || this.matchConfig.mode === 'training')) {
        f.action = 'luck_pluck_slash';
        f.actionTimer = 28;
        f.actionDuration = 28;
        f.cooldowns.skill5 = LUCK_PLUCK_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= LUCK_PLUCK_COST;
        // Auto-equip sword on skill 5 if not equipped
        if (!f.isSwordEquipped) {
          f.isSwordEquipped = true;
          f.isStandActive = true;
        }
        const dir = f.facing === 'right' ? 1 : -1;
        f.vx = dir * 12;
        soundManager.playSwordSlash();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'LUCK & PLUCK BARRAGE SLASH!', '#38bdf8');
        this.applyPhysics(f);
        return;
      }

      // Ultimate: Sunlight Yellow Overdrive!!
      if (input.ultimate && f.cooldowns.ultimate <= 0 && (f.energy >= SUNLIGHT_ULTIMATE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'sunlight_ultimate';
        f.actionTimer = SUNLIGHT_ULTIMATE_DURATION;
        f.actionDuration = SUNLIGHT_ULTIMATE_DURATION;
        f.cooldowns.ultimate = SUNLIGHT_ULTIMATE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= SUNLIGHT_ULTIMATE_COST;
        soundManager.playHamonBreath();
        const ultMsg = f.isSwordEquipped ? '★ SUNLIGHT YELLOW PLUCK OVERDRIVE!! ★' : '★ SUNLIGHT YELLOW OVERDRIVE!! ★';
        this.addTextParticle(f.x + f.width / 2, f.y - 60, ultMsg, f.isSwordEquipped ? '#38bdf8' : '#facc15');
        this.screenShake = 14;
        this.applyPhysics(f);
        return;
      }
    }

    // 3. YOUNG JOSEPH JOESTAR SKILLS (BATTLE TENDENCY)
    if (isYoungJoseph) {
      // Skill 1: Clacker Volley
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= CLACKER_VOLLEY_COST || this.matchConfig.mode === 'training')) {
        f.action = 'clacker_volley';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill1 = CLACKER_VOLLEY_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= CLACKER_VOLLEY_COST;
        this.spawnClackerVolley(f);
        soundManager.playClackerRattle();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'CLACKER VOLLEY!', '#34d399');
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Tsugi ni Omae wa... (Next Line Counter)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= NEXT_LINE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'next_line';
        f.actionTimer = 40;
        f.actionDuration = 40;
        f.cooldowns.skill2 = NEXT_LINE_COOLDOWN;
        f.isParrying = true;
        if (this.matchConfig.mode !== 'training') f.energy -= NEXT_LINE_COST;
        soundManager.playHamonBuzz();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'TSUGI NI OMAE WA... TO IU!', '#facc15');
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Reaser-Edge Hamon Elbow
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= HAMON_ELBOW_COST || this.matchConfig.mode === 'training')) {
        f.action = 'hamon_elbow';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill3 = HAMON_ELBOW_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= HAMON_ELBOW_COST;
        const dir = f.facing === 'right' ? 1 : -1;
        f.vx = dir * 12;
        soundManager.playHamonBuzz();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'HAMON ELBOW DASH!', '#10b981');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Tommy Gun Burst
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= TOMMY_GUN_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tommy_gun';
        f.actionTimer = 35;
        f.actionDuration = 35;
        f.cooldowns.skill4 = TOMMY_GUN_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOMMY_GUN_COST;
        this.spawnTommyGunBurst(f);
        soundManager.playTommyGun();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'TOMMY GUN BURST!', '#ef4444');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Clacker Boomerang Overdrive
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= 30 || this.matchConfig.mode === 'training')) {
        f.action = 'clacker_boomerang';
        f.actionTimer = 28;
        f.actionDuration = 28;
        f.cooldowns.skill5 = 160;
        if (this.matchConfig.mode !== 'training') f.energy -= 30;
        f.vy = -10;
        soundManager.playClackerRattle();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'CLACKER LEAP OVERDRIVE!', '#facc15');
        this.applyPhysics(f);
        return;
      }

      // Ultimate: Red Stone Hamon Beam!!
      if (input.ultimate && f.cooldowns.ultimate <= 0 && (f.energy >= YOUNG_JOSEPH_ULTIMATE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'young_joseph_ultimate';
        f.actionTimer = 100;
        f.actionDuration = 100;
        f.cooldowns.ultimate = YOUNG_JOSEPH_ULTIMATE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= YOUNG_JOSEPH_ULTIMATE_COST;
        soundManager.playOverdriveExplosion();
        this.addTextParticle(f.x + f.width / 2, f.y - 60, '★ RED STONE HAMON BEAM!! ★', '#ef4444');
        this.screenShake = 12;
        this.applyPhysics(f);
        return;
      }
    }

    // 4. OLD JOSEPH JOESTAR SKILLS (STARDUST CRUSADERS)
    if (isOldJoseph) {
      // Skill 1: Hermit Purple Grapple
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= HERMIT_GRAPPLE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'hermit_purple_grapple';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill1 = HERMIT_GRAPPLE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= HERMIT_GRAPPLE_COST;
        this.spawnHermitVineGrab(f);
        soundManager.playHermitVineWhip();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'HERMIT VINE GRAPPLE!', '#c084fc');
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Spirit Photo Weakness Scan
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= SPIRIT_PHOTO_COST || this.matchConfig.mode === 'training')) {
        f.action = 'spirit_photo';
        f.actionTimer = 30;
        f.actionDuration = 30;
        f.cooldowns.skill2 = SPIRIT_PHOTO_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= SPIRIT_PHOTO_COST;
        f.energy = Math.min(f.maxEnergy, f.energy + 50);
        f.invulnerableTimer = 60; // 1 second invulnerability
        soundManager.playSpiritPhotoFlash();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'SPIRIT PHOTO: WEAKNESS SCAN!', '#a855f7');
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Hermit Purple Ground Trap
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= HERMIT_TRAP_COST || this.matchConfig.mode === 'training')) {
        f.action = 'hermit_trap';
        f.actionTimer = 32;
        f.actionDuration = 32;
        f.cooldowns.skill3 = HERMIT_TRAP_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= HERMIT_TRAP_COST;
        soundManager.playHermitVineWhip();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'HERMIT VINE BINDING TRAP!', '#a855f7');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Sunburst Overdrive Whip
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= OVERDRIVE_TACTICS_COST || this.matchConfig.mode === 'training')) {
        f.action = 'overdrive_tactics';
        f.actionTimer = 26;
        f.actionDuration = 26;
        f.cooldowns.skill4 = OVERDRIVE_TACTICS_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= OVERDRIVE_TACTICS_COST;
        soundManager.playHamonBuzz();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'SUNBURST OVERDRIVE WHIP!', '#facc15');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Polaroid Camera Smash
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= 25 || this.matchConfig.mode === 'training')) {
        f.action = 'camera_smash';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill5 = 150;
        if (this.matchConfig.mode !== 'training') f.energy -= 25;
        soundManager.playSpiritPhotoFlash();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'POLAROID CAMERA SMASH!', '#e2e8f0');
        this.applyPhysics(f);
        return;
      }

      // Ultimate: Hermit Overdrive Surge!!
      if (input.ultimate && f.cooldowns.ultimate <= 0 && (f.energy >= OLD_JOSEPH_ULTIMATE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'old_joseph_ultimate';
        f.actionTimer = 105;
        f.actionDuration = 105;
        f.cooldowns.ultimate = OLD_JOSEPH_ULTIMATE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= OLD_JOSEPH_ULTIMATE_COST;
        soundManager.playOverdriveExplosion();
        this.addTextParticle(f.x + f.width / 2, f.y - 60, '★ HERMIT OVERDRIVE SURGE!! ★', '#a855f7');
        this.screenShake = 12;
        this.applyPhysics(f);
        return;
      }
    }

    // 5. DIAVOLO SKILLS (KING CRIMSON & EPITAPH)
    if (isDiavolo) {
      // Skill 1: Epitaph (Precognition Auto-Dodge Stance)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= EPITAPH_COST || this.matchConfig.mode === 'training')) {
        f.isEpitaphActive = true;
        f.epitaphTimer = EPITAPH_DURATION;
        f.cooldowns.skill1 = EPITAPH_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= EPITAPH_COST;
        soundManager.playPoseSound('king_crimson');
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🔮 EPITAPH: PRECOGNITION ACTIVE!', '#fb7185');
        this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#fb7185');
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Time Erase / Erased Time (Skip Time)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= TIME_ERASE_COST || this.matchConfig.mode === 'training')) {
        this.activateTimeErase(f, opponent);
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Lethal Donut Chop
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= DONUT_STRIKE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'donut_strike';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill3 = DONUT_STRIKE_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= DONUT_STRIKE_COST;
        const dir = f.facing === 'right' ? 1 : -1;
        f.vx = dir * 10;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🩸 DONUT CHOP!', '#fb7185');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Flesh Throw / Blood Blind
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= FLESH_THROW_COST || this.matchConfig.mode === 'training')) {
        f.action = 'flesh_throw';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill4 = FLESH_THROW_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= FLESH_THROW_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🩸 FLESH THROW (BLOOD BLIND)', '#fb7185');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Time Erase Ambush
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= TIME_ERASE_AMBUSH_COST || this.matchConfig.mode === 'training')) {
        f.action = 'time_erase_ambush';
        f.actionTimer = 35;
        f.actionDuration = 35;
        f.cooldowns.skill5 = TIME_ERASE_AMBUSH_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= TIME_ERASE_AMBUSH_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 45, '👑 TIME ERASE AMBUSH CHOP!!', '#e11d48');
        this.applyPhysics(f);
        return;
      }
    }

    // 6. POLNAREFF SKILLS (SILVER CHARIOT)
    if (isPolnareff) {
      // Skill 1: Ray of Light (Rapid Thrust)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= RAY_OF_LIGHT_COST || this.matchConfig.mode === 'training')) {
        f.action = 'ray_of_light';
        f.actionTimer = 32;
        f.actionDuration = 32;
        f.cooldowns.skill1 = RAY_OF_LIGHT_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= RAY_OF_LIGHT_COST;
        soundManager.playRapierThrust();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '⚡ RAY OF LIGHT THRUST!', '#38bdf8');
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Armor Off (Speed 2x, Defense Penalty)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= ARMOR_OFF_COST || this.matchConfig.mode === 'training')) {
        f.isArmorOff = !f.isArmorOff;
        f.cooldowns.skill2 = ARMOR_OFF_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= ARMOR_OFF_COST;
        soundManager.playSwordSlash();
        const msg = f.isArmorOff ? '🛡️ ARMOR OFF: HYPER SPEED 2X!' : '🛡️ ARMOR ON: DEFENSE RESTORED';
        this.addTextParticle(f.x + f.width / 2, f.y - 40, msg, f.isArmorOff ? '#34d399' : '#64748b');
        for (let i = 0; i < 12; i++) {
          this.addSpark(
            f.x + f.width / 2 + (Math.random() * 40 - 20),
            f.y + f.height / 2 + (Math.random() * 40 - 20),
            f.isArmorOff ? '#34d399' : '#94a3b8'
          );
        }
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Shooting Sword (Rapier Launch)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= SHOOTING_SWORD_COST || this.matchConfig.mode === 'training')) {
        f.action = 'shooting_sword';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill3 = SHOOTING_SWORD_COOLDOWN;
        f.isShootingSwordCooldown = SHOOTING_SWORD_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= SHOOTING_SWORD_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🗡️ SHOOTING SWORD LAUNCH!', '#38bdf8');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Upward Thrust (Overhead Launcher)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= UPWARD_THRUST_COST || this.matchConfig.mode === 'training')) {
        f.action = 'upward_thrust';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill4 = UPWARD_THRUST_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= UPWARD_THRUST_COST;
        f.vy = -12; // Leaping upward
        const dir = f.facing === 'right' ? 1 : -1;
        f.vx = dir * 6;
        soundManager.playSwordSlash();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🗡️ UPWARD RAPIER THRUST!', '#38bdf8');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Afterimage Mirage (Multi-Clones - Requires Armor Off)
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= AFTERIMAGE_MIRAGE_COST || this.matchConfig.mode === 'training')) {
        if (!f.isArmorOff) {
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '⚠️ REQUIRES ARMOR OFF!', '#ef4444');
          f.cooldowns.skill5 = 30;
        } else {
          f.action = 'afterimage_mirage';
          f.actionTimer = 45;
          f.actionDuration = 45;
          f.cooldowns.skill5 = AFTERIMAGE_MIRAGE_COOLDOWN;
          f.isStandActive = true;
          if (this.matchConfig.mode !== 'training') f.energy -= AFTERIMAGE_MIRAGE_COST;
          soundManager.playRapierThrust();
          this.addTextParticle(f.x + f.width / 2, f.y - 45, '⚡ AFTERIMAGE MIRAGE CLONES!!', '#34d399');
        }
        this.applyPhysics(f);
        return;
      }
    }

    // 7. JOSUKE HIGASHIKATA SKILLS (CRAZY DIAMOND)
    if (isCrazyDiamond) {
      // Skill 1: Homing Shard (Dora Restoration Pull)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= JOSUKE_HOMING_SHARD_COST || this.matchConfig.mode === 'training')) {
        f.action = 'homing_shard';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill1 = JOSUKE_HOMING_SHARD_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= JOSUKE_HOMING_SHARD_COST;
        soundManager.playSwordSlash(); // whoosh
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '💎 HOMING SHARD RESTORE!', '#06b6d4');
        this.spawnJosukeShard(f);
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Angelo Wall / Rock Trap (Grab & Close-range Stun)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= JOSUKE_ANGELO_WALL_COST || this.matchConfig.mode === 'training')) {
        const dist = Math.abs(f.x - opponent.x);
        if (dist <= 115 && !opponent.isTimeEraseActive) {
          f.action = 'rock_trap';
          f.actionTimer = 35;
          f.actionDuration = 35;
          f.cooldowns.skill2 = JOSUKE_ANGELO_WALL_COOLDOWN;
          f.isStandActive = true;
          if (this.matchConfig.mode !== 'training') f.energy -= JOSUKE_ANGELO_WALL_COST;
          
          // Apply Angelo Wall Stun to Opponent
          opponent.angeloWallTimer = JOSUKE_ANGELO_WALL_STUN_DURATION;
          opponent.hitStun = JOSUKE_ANGELO_WALL_STUN_DURATION;
          opponent.vx = 0;
          opponent.vy = 0;
          this.applyRawDamage(opponent, JOSUKE_ANGELO_WALL_DAMAGE, 0, 0);

          soundManager.playHamonBuzz();
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '🪨 ROCK TRAP: ANGELO WALL!', '#06b6d4');
          this.addShockwave(opponent.x + opponent.width / 2, GROUND_Y - 20, '#64748b');
        } else {
          this.addTextParticle(f.x + f.width / 2, f.y - 30, 'TOO FAR FOR GRAB!', '#f43f5e');
          f.cooldowns.skill2 = 25; // short cooldown on miss
        }
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Bearing Shot (Flick metallic marble)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= JOSUKE_BEARING_SHOT_COST || this.matchConfig.mode === 'training')) {
        f.action = 'bearing_shot';
        f.actionTimer = 18;
        f.actionDuration = 18;
        f.cooldowns.skill3 = JOSUKE_BEARING_SHOT_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= JOSUKE_BEARING_SHOT_COST;
        soundManager.playRapierThrust(); // ping!
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🎯 BEARING SHOT!', '#06b6d4');
        this.spawnJosukeBearing(f);
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Dora Counter / Enraged Stagger (Parry/Block stance)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= JOSUKE_DORA_COUNTER_COST || this.matchConfig.mode === 'training')) {
        if (f.isEnraged) {
          // In enraged mode, block turns into a wild headbutt/tackle!
          f.action = 'enraged_stagger';
          f.actionTimer = 25;
          f.actionDuration = 25;
          f.cooldowns.skill4 = JOSUKE_DORA_COUNTER_COOLDOWN;
          f.isStandActive = true;
          const dir = f.facing === 'right' ? 1 : -1;
          f.vx = dir * 16; // tackle dash
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '🤬 ENRAGED STAGGER BEATDOWN!', '#ef4444');
          soundManager.playPoseSound('crazy_diamond');
        } else {
          f.action = 'parry_stance';
          f.actionTimer = JOSUKE_DORA_COUNTER_DURATION;
          f.actionDuration = JOSUKE_DORA_COUNTER_DURATION;
          f.cooldowns.skill4 = JOSUKE_DORA_COUNTER_COOLDOWN;
          f.isParrying = true;
          f.isStandActive = true;
          if (this.matchConfig.mode !== 'training') f.energy -= JOSUKE_DORA_COUNTER_COST;
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '🛡️ DORA COUNTER STANCE', '#38bdf8');
        }
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Rock Shield (Wall Restoration)
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= JOSUKE_ROCK_SHIELD_COST || this.matchConfig.mode === 'training')) {
        f.action = 'rock_shield';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill5 = JOSUKE_ROCK_SHIELD_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= JOSUKE_ROCK_SHIELD_COST;
        
        // Spawn barrier relative to facing
        const dir = f.facing === 'right' ? 1 : -1;
        f.rockShieldX = f.x + dir * 105;
        f.rockShieldTimer = JOSUKE_ROCK_SHIELD_DURATION;

        soundManager.playHit(true);
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🛡️ ROCK SHIELD RESTORED!', '#06b6d4');
        this.addShockwave(f.rockShieldX, GROUND_Y - 20, '#64748b');
        this.applyPhysics(f);
        return;
      }

      // Ultimate: Ground Punch / Upper Sweep
      if (input.ultimate && f.cooldowns.ultimate <= 0 && (f.energy >= JOSUKE_GROUND_PUNCH_COST || this.matchConfig.mode === 'training')) {
        f.action = 'ground_punch';
        f.actionTimer = 45;
        f.actionDuration = 45;
        f.cooldowns.ultimate = JOSUKE_GROUND_PUNCH_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= JOSUKE_GROUND_PUNCH_COST;
        
        soundManager.playPoseSound('crazy_diamond');
        this.addTextParticle(f.x + f.width / 2, f.y - 45, '💎 CRAZY DIAMOND: GROUND SMASH RESTORE!', '#06b6d4');
        this.screenShake = 12.0;
        this.applyPhysics(f);
        return;
      }
    }

    // 1. Stand Toggle
    if (input.toggleStand && f.cooldowns.standToggle <= 0) {
      f.isStandActive = !f.isStandActive;
      f.cooldowns.standToggle = 25;
      this.addTextParticle(f.x + f.width / 2, f.y - 30, f.isStandActive ? `[${f.standName}]` : 'STAND OFF', '#facc15');
      for (let i = 0; i < 6; i++) {
        this.addSpark(f.x + f.width / 2, f.y + f.height / 2, f.isStandActive ? '#c084fc' : '#94a3b8');
      }
    }

    // 2. JOTARO SKILLS
    if (isJotaro) {
      // Skill 1: Star Finger
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= STAR_FINGER_COST || this.matchConfig.mode === 'training')) {
        f.action = 'star_finger';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill1 = STAR_FINGER_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= STAR_FINGER_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'STAR FINGER!', '#c084fc');
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Star Vapor (Vacuum Inhale)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= STAR_VACUUM_COST || this.matchConfig.mode === 'training')) {
        f.action = 'star_vacuum';
        f.actionTimer = STAR_VACUUM_DURATION;
        f.actionDuration = STAR_VACUUM_DURATION;
        f.cooldowns.skill2 = STAR_VACUUM_COOLDOWN;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= STAR_VACUUM_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'STAR INHALE (SUCTION)', '#38bdf8');
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Stand Leap
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= STAND_LEAP_COST || this.matchConfig.mode === 'training')) {
        f.action = 'stand_leap';
        f.actionTimer = 16;
        f.actionDuration = 16;
        f.cooldowns.skill3 = STAND_LEAP_COOLDOWN;
        f.vy = STAND_LEAP_IMPULSE;
        f.isGrounded = false;
        f.isStandActive = true;
        if (this.matchConfig.mode !== 'training') f.energy -= STAND_LEAP_COST;
        this.addShockwave(f.x + f.width / 2, GROUND_Y, '#9333ea');
        this.addTextParticle(f.x + f.width / 2, f.y - 20, 'STAND LEAP!', '#c084fc');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Inhale & Counter (Parry Stance)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= PARRY_COST || this.matchConfig.mode === 'training')) {
        f.action = 'parry_stance';
        f.actionTimer = PARRY_STANCE_DURATION;
        f.actionDuration = PARRY_STANCE_DURATION;
        f.cooldowns.skill4 = PARRY_COOLDOWN;
        f.isParrying = true;
        if (this.matchConfig.mode !== 'training') f.energy -= PARRY_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 30, 'PARRY STANCE', '#facc15');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Ora Beatdown (Command Grab)
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= ORA_BEATDOWN_COST || this.matchConfig.mode === 'training')) {
        this.tryExecuteOraBeatdown(f, opponent);
        return;
      }
    }

    // 3. DIO SKILLS
    if (isDio) {
      // Skill 1: Knife Throw
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= KNIFE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'knife_throw';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill1 = KNIFE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= KNIFE_COST;
        this.spawnDIOKnives(f);
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Drain Blood (Command Grab)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= DRAIN_BLOOD_COST || this.matchConfig.mode === 'training')) {
        this.tryExecuteDrainBlood(f, opponent);
        return;
      }

      // Skill 3: Street Sign Attack (Guard Break Overhead)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= STREET_SIGN_COST || this.matchConfig.mode === 'training')) {
        f.action = 'street_sign';
        f.actionTimer = 26;
        f.actionDuration = 26;
        f.cooldowns.skill3 = STREET_SIGN_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= STREET_SIGN_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'STREET SIGN CHOP!', '#ef4444');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Space Ripper Stingy Eyes (Laser)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= SPACE_RIPPER_COST || this.matchConfig.mode === 'training')) {
        f.action = 'space_ripper';
        f.actionTimer = SPACE_RIPPER_DURATION;
        f.actionDuration = SPACE_RIPPER_DURATION;
        f.cooldowns.skill4 = SPACE_RIPPER_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= SPACE_RIPPER_COST;
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'SPACE RIPPER STINGY EYES!', '#ef4444');
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Checkmate (Teleport)
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= TELEPORT_COST || this.matchConfig.mode === 'training')) {
        f.action = 'teleport';
        f.actionTimer = 15;
        f.actionDuration = 15;
        f.cooldowns.skill5 = TELEPORT_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TELEPORT_COST;
        
        // Spawn teleport smoke at old position
        this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#eab308');
        
        // Teleport behind opponent
        const targetX = opponent.facing === 'right' ? opponent.x - 65 : opponent.x + opponent.width + 25;
        f.x = Math.max(40, Math.min(this.getArenaWidth() - 80, targetX));
        f.y = opponent.y;

        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'CHECKMATE!', '#facc15');
        this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#eab308');
        this.applyPhysics(f);
        return;
      }

      // Ultimate: Road Roller Da!
      if (input.ultimate && f.cooldowns.ultimate <= 0 && (f.energy >= ROAD_ROLLER_COST || this.matchConfig.mode === 'training')) {
        f.action = 'road_roller_startup';
        f.actionTimer = ROAD_ROLLER_DURATION;
        f.actionDuration = ROAD_ROLLER_DURATION;
        f.cooldowns.ultimate = ROAD_ROLLER_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= ROAD_ROLLER_COST;
        f.isStandActive = true;
        this.addTextParticle(f.x + f.width / 2, f.y - 60, '★ ROAD ROLLER DA! ★', '#eab308');
        this.screenShake = 10;
        this.applyPhysics(f);
        return;
      }
    }

    // TOORU & WONDER OF U (PART 8: JOJOLION)
    if (isTooru) {
      // Skill 1: Head Doctor Disguise (Satoru Akefu) - U
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= TOORU_HEAD_DOCTOR_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tooru_head_doctor';
        f.actionTimer = 16;
        f.actionDuration = 16;
        f.cooldowns.skill1 = TOORU_HEAD_DOCTOR_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOORU_HEAD_DOCTOR_COST;
        f.isHeadDoctorDisguise = true;
        f.headDoctorTimer = TOORU_HEAD_DOCTOR_DURATION;
        f.invulnerableTimer = TOORU_HEAD_DOCTOR_DURATION;
        soundManager.playPoseSound('tooru');
        this.addTextParticle(f.x + f.width / 2, f.y - 50, '🎩 HEAD DOCTOR DISGUISE: SATORU AKEFU', '#94a3b8');
        this.addMenacingParticle(f.x, f.y - 20, 'ゴ', '#64748b');
        this.applyPhysics(f);
        return;
      }

      // Skill 2: Rock Insects (Dododo De Dadada) - I
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= TOORU_ROCK_INSECT_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tooru_rock_insects';
        f.actionTimer = 18;
        f.actionDuration = 18;
        f.cooldowns.skill2 = TOORU_ROCK_INSECT_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOORU_ROCK_INSECT_COST;
        soundManager.playRockInsectHiss();
        const dir = f.facing === 'right' ? 1 : -1;
        for (let idx = 0; idx < 3; idx++) {
          this.projectiles.push({
            id: this.projectileId++,
            ownerId: f.id,
            type: 'rock_insect',
            subType: 'insect',
            x: f.x + (dir * (20 + idx * 30)),
            y: GROUND_Y - 20,
            vx: dir * (8 + idx * 3),
            vy: 0,
            baseVx: dir * (8 + idx * 3),
            baseVy: 0,
            width: 25,
            height: 18,
            damage: TOORU_ROCK_INSECT_DAMAGE,
            knockbackX: dir * 3,
            knockbackY: -2,
            isFrozenInTime: false,
            life: 140,
            maxLife: 140,
            color: '#84cc16',
          });
        }
        this.addTextParticle(f.x + f.width / 2, f.y - 45, '🦂 ROCK INSECTS: DODODO DE DADADA!', '#84cc16');
        this.applyPhysics(f);
        return;
      }

      // Skill 3: Calamity Counter (Traffic Hazard) - O
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= TOORU_CALAMITY_COUNTER_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tooru_calamity_counter';
        f.actionTimer = 16;
        f.actionDuration = 16;
        f.cooldowns.skill3 = TOORU_CALAMITY_COUNTER_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOORU_CALAMITY_COUNTER_COST;
        f.isCalamityCounterActive = true;
        f.calamityCounterTimer = TOORU_CALAMITY_COUNTER_DURATION;
        soundManager.playDododoTheme();
        this.addTextParticle(f.x + f.width / 2, f.y - 45, '🛡️ CALAMITY COUNTER: TRAFFIC HAZARD', '#ef4444');
        this.applyPhysics(f);
        return;
      }

      // Skill 4: Rain of Calamity - P
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= TOORU_CALAMITY_RAIN_SKILL_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tooru_calamity_rain';
        f.actionTimer = 18;
        f.actionDuration = 18;
        f.cooldowns.skill4 = TOORU_CALAMITY_RAIN_SKILL_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOORU_CALAMITY_RAIN_SKILL_COST;
        f.calamityRainTimer = TOORU_CALAMITY_RAIN_DURATION;
        soundManager.playDododoTheme();
        this.addTextParticle(f.x + f.width / 2, f.y - 50, '🌧️ RAIN OF CALAMITY (PIERCING DOWNPOUR)', '#38bdf8');
        this.screenShake = 6;
        this.applyPhysics(f);
        return;
      }

      // Skill 5: Wonder of U Stalk / Instant Calamity Flow - H
      if (input.skill5 && f.cooldowns.skill5 <= 0 && (f.energy >= TOORU_CURSE_GAZE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tooru_calamity_curse';
        f.actionTimer = 18;
        f.actionDuration = 18;
        f.cooldowns.skill5 = TOORU_CURSE_GAZE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOORU_CURSE_GAZE_COST;
        this.triggerCalamity(f, opponent);
        if (f.wouEntity) {
          f.wouEntity.x = opponent.x - (opponent.facing === 'right' ? 80 : -80);
        }
        soundManager.playPoseSound('tooru');
        this.addTextParticle(f.x + f.width / 2, f.y - 50, '👁️ WONDER OF U: ADVANCED CALAMITY FLOW', '#ef4444');
        this.addMenacingParticle(f.x, f.y - 20, 'ゴ', '#ef4444');
        this.applyPhysics(f);
        return;
      }

      // Ultimate: Extinction Meteor & Rain of Calamity - Y
      if (input.ultimate && f.cooldowns.ultimate <= 0 && (f.energy >= TOORU_ULTIMATE_COST || this.matchConfig.mode === 'training')) {
        f.action = 'tooru_calamity_rain';
        f.actionTimer = 25;
        f.actionDuration = 25;
        f.cooldowns.ultimate = TOORU_ULTIMATE_COOLDOWN;
        if (this.matchConfig.mode !== 'training') f.energy -= TOORU_ULTIMATE_COST;
        f.calamityRainTimer = TOORU_ULTIMATE_DURATION; // ~2.1s duration (balanced, prevents infinite lockup)
        soundManager.playDododoTheme();
        this.addTextParticle(f.x + f.width / 2, f.y - 60, '🌧️ RAIN OF CALAMITY & TRAFFIC CARNAGE! ☄️', '#ef4444');
        this.screenShake = 14;
        this.applyPhysics(f);
        return;
      }

      // Stand Toggle / Posture Shift (L)
      if (input.toggleStand && f.cooldowns.standToggle <= 0) {
        f.cooldowns.standToggle = 30;
        f.calamityCooldownTimer = Math.max(0, f.calamityCooldownTimer - 60);
        this.addMenacingParticle(f.x + (f.facing === 'right' ? 30 : -30), f.y - 30, 'ド', '#ef4444');
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🎩 WONDER OF U: MENACING POSTURE', '#94a3b8');
        return;
      }

      // Action J (Chill Step - replaces standard punch)
      if (input.punch && f.cooldowns.punch <= 0) {
        f.action = 'tooru_chill_tap';
        f.actionTimer = 16;
        f.actionDuration = 16;
        f.cooldowns.punch = 25;
        f.energy = Math.min(f.maxEnergy, f.energy + 12);
        f.calamityCooldownTimer = 0; // Accelerates calamity flow
        soundManager.playDododoTheme();
        this.addTextParticle(f.x + f.width / 2, f.y - 35, '🎵 CHILL STEP (LOGIC ACCELERATION)', '#94a3b8');
        this.applyPhysics(f);
        return;
      }

      // Action K (Flow of Calamity - replaces standard barrage)
      if (input.barrage && f.cooldowns.barrage <= 0) {
        f.action = 'tooru_calamity_curse';
        f.actionTimer = 18;
        f.actionDuration = 18;
        f.cooldowns.barrage = 50;
        this.triggerCalamity(f, opponent);
        f.isStandActive = true;
        this.addTextParticle(f.x + f.width / 2, f.y - 45, '👁️ WONDER OF U: CALAMITY GAZE!', '#ef4444');
        this.applyPhysics(f);
        return;
      }
    }

    // ENRICO PUCCI SKILLS (WHITESNAKE -> C-MOON -> MADE IN HEAVEN)
    if (isPucci) {
      if (this.handlePucciSkills(f, input, opponent)) {
        this.applyPhysics(f);
        return;
      }
    }

    // JOSUKE HIGASHIKATA / GAPPY SKILLS (PART 8)
    if (isGappy) {
      if (this.handleGappySkills(f, input, opponent)) {
        this.applyPhysics(f);
        return;
      }
    }

    // FUNNY VALENTINE SKILLS (PART 7: STEEL BALL RUN)
    if (isValentine) {
      if (this.handleValentineSkills(f, input, opponent)) {
        this.applyPhysics(f);
        return;
      }
    }

    // DIPEZ SKILLS (PHOTON CONVERTER & PURE LIGHT MAN)
    if (isDipez) {
      if (this.handleDipezSkills(f, input, opponent)) {
        this.applyPhysics(f);
        return;
      }
    }

    // 4. Barrage Attack (Universal)
    if (input.barrage && f.cooldowns.barrage <= 0 && (f.energy >= BARRAGE_COST || this.matchConfig.mode === 'training')) {
      f.action = 'barrage';
      f.actionTimer = BARRAGE_DURATION;
      f.actionDuration = BARRAGE_DURATION;
      f.cooldowns.barrage = BARRAGE_COOLDOWN;
      if (this.matchConfig.mode !== 'training') f.energy -= BARRAGE_COST;
      f.vx *= 0.3;
      this.addTextParticle(f.x + f.width / 2, f.y - 40, f.isStandActive ? f.barrageCry : 'RAPID RUSH!', '#eab308');
      this.screenShake = Math.max(this.screenShake, 3.5);
      this.applyPhysics(f);
      return;
    }

    // 5. Heavy Punch
    if (input.punch && f.cooldowns.punch <= 0) {
      f.action = 'punch';
      const duration = (f.charId === 'funny_valentine' && f.isStandActive) ? 26 : PUNCH_DURATION;
      f.actionTimer = duration;
      f.actionDuration = duration;
      f.cooldowns.punch = (f.charId === 'funny_valentine' && f.isStandActive) ? PUNCH_COOLDOWN + 6 : PUNCH_COOLDOWN;
      const dir = f.facing === 'right' ? 1 : -1;
      f.vx += dir * (f.charId === 'funny_valentine' && f.isStandActive ? 1.5 : 2.5);
      this.applyPhysics(f);
      return;
    }

    // 6. Pose
    if (input.pose && f.isGrounded && f.cooldowns.pose <= 0) {
      f.action = 'pose';
      f.actionTimer = POSE_DURATION;
      f.actionDuration = POSE_DURATION;
      f.cooldowns.pose = 45;
      f.vx = 0;

      soundManager.playPoseSound(f.charId);

      const dir = f.facing === 'right' ? 1 : -1;
      if (f.charId === 'jotaro') {
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'やれやれだぜ... (YARE YARE DAZE)', '#c084fc');
        this.addMenacingParticle(f.x + 35 * dir, f.y - 15, 'ゴ', '#c084fc');
      } else if (f.charId === 'dio') {
        this.addTextParticle(f.x + f.width / 2, f.y - 45, 'WRYYYYYYYYYYYYYY!!', '#facc15');
        this.addMenacingParticle(f.x - 10 * dir, f.y - 25, 'ゴ', '#facc15');
      } else if (f.charId === 'crazy_diamond') {
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'グレートだぜ...！ (GURETO DA ZE!)', '#38bdf8');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '♥', '#f43f5e');
      } else if (f.charId === 'king_crimson') {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'このディアボロだ！ (KONO DIAVOLO DA!)', '#fb7185');
        this.addMenacingParticle(f.x, f.y - 20, 'ゴ', '#fb7185');
      } else if (f.charId === 'silver_chariot') {
        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'ブラボー！おお…ブラボー！！ (BRAVO!)', '#e2e8f0');
        this.addMenacingParticle(f.x + 20 * dir, f.y - 20, '★', '#facc15');
      } else if (f.charId === 'jonathan') {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '何をするんだ！うるさい！！ (NANI O SURU NDA, URUSAI!)', '#eab308');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '☀', '#eab308');
      } else if (f.charId === 'joseph_young') {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'お前の次のセリフは...！ (TSUGI NI OMAE WA...!)', '#34d399');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '💬', '#34d399');
      } else if (f.charId === 'joseph_old') {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'OH MY GOD!! (オー・マイ・ガー！)', '#a855f7');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '⚡', '#a855f7');
      } else if (f.charId === 'tooru') {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '厄災の理... (THE LOGIC OF CALAMITY)', '#94a3b8');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '🎧', '#94a3b8');
      } else if (f.charId === 'pucci') {
        const chant = f.pucciForm === 'made_in_heaven'
          ? 'MADE IN HEAVEN... 時は加速する！ (TIME ACCELERATES!)'
          : f.pucciForm === 'cmoon'
          ? '我が心はすでに「天国」にある... (MY HEART IS IN HEAVEN)'
          : '素数を数えて落ち着くんだ... (COUNT PRIME NUMBERS...)';
        this.addTextParticle(f.x + f.width / 2, f.y - 40, chant, '#a855f7');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '📿', '#a855f7');
      } else if (f.charId === 'funny_valentine') {
        this.addTextParticle(f.x + f.width / 2, f.y - 45, 'ドジャア～～ン！ (DOJYAA~~N!)', '#f472b6');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '🇺🇸', '#facc15');
        this.addShockwave(f.x + f.width / 2, f.y + f.height - 10, '#f472b6');
      } else if (f.charId === 'dipez') {
        this.addTextParticle(f.x + f.width / 2, f.y - 45, 'GLOWING MAN... PHOTON SHIFT!', '#fef08a');
        this.addMenacingParticle(f.x + 25 * dir, f.y - 20, '✨', '#ffffff');
        this.addShockwave(f.x + f.width / 2, f.y + f.height - 10, '#fef08a');
      } else {
        this.addTextParticle(f.x + f.width / 2, f.y - 30, '★ JOJO POSE ★', '#c084fc');
        this.addMenacingParticle(f.x, f.y - 15, 'ゴ', '#c084fc');
      }

      this.applyPhysics(f);
      return;
    }

    // 7. Movement & Jump (Responsive to C-Moon Dynamic Gravity Axis)
    let speedMult = f.isArmorOff ? ARMOR_OFF_SPEED_MULTIPLIER : 1.0;
    if (f.charId === 'dipez' && f.dipezForm === 'pure_light') {
      speedMult *= 2.8; // Evolved form runs at light speed!
    }
    if (f.charId === 'pucci' && f.pucciForm === 'made_in_heaven') {
      speedMult *= (1.0 + (f.mihSpeedStack || 0));
    }
    const op = (f.id === 'player' || f.id === 'teammate') ? this.ai : this.player;
    if (op && op.charId === 'king_crimson' && op.isTimeEraseActive) {
      speedMult *= 0.28;
    }

    const axis = this.activeGravityAxis || 'down';
    const jumpMag = Math.abs(JUMP_FORCE);

    if (axis === 'right') {
      // Standing on Right Wall (Ground at +X, facing -X towards center)
      if (input.left && f.isGrounded) {
        let jumpF = jumpMag * 1.2;
        if (op && op.charId === 'king_crimson' && op.isTimeEraseActive) jumpF *= 0.55;
        f.vx = -jumpF; // Negative X = Jump AWAY from right wall (towards left)
        f.isGrounded = false;
        f.action = 'jump';
      } else if (input.jump) {
        // Walk UP along right wall (analog UP)
        f.vy = -MOVE_SPEED * speedMult;
        f.facing = 'right';
        if (f.isGrounded) f.action = 'walk';
      } else if (input.crouch) {
        // Walk DOWN along right wall (analog DOWN)
        f.vy = MOVE_SPEED * speedMult;
        f.facing = 'left';
        if (f.isGrounded) f.action = 'walk';
      } else {
        f.vy *= FRICTION;
        if (f.isGrounded && Math.abs(f.vy) < 0.2) f.action = 'idle';
      }

    } else if (axis === 'left') {
      // Standing on Left Wall (Ground at -X, facing +X towards center)
      if (input.right && f.isGrounded) {
        let jumpF = jumpMag * 1.2;
        if (op && op.charId === 'king_crimson' && op.isTimeEraseActive) jumpF *= 0.55;
        f.vx = jumpF; // Positive X = Jump AWAY from left wall (towards right)
        f.isGrounded = false;
        f.action = 'jump';
      } else if (input.jump) {
        // Walk UP along left wall (analog UP)
        f.vy = -MOVE_SPEED * speedMult;
        f.facing = 'left';
        if (f.isGrounded) f.action = 'walk';
      } else if (input.crouch) {
        // Walk DOWN along left wall (analog DOWN)
        f.vy = MOVE_SPEED * speedMult;
        f.facing = 'right';
        if (f.isGrounded) f.action = 'walk';
      } else {
        f.vy *= FRICTION;
        if (f.isGrounded && Math.abs(f.vy) < 0.2) f.action = 'idle';
      }

    } else if (axis === 'up') {
      // Standing on Ceiling (Ground at -Y, facing +Y towards floor)
      // Pulling Analog Down (away from ceiling into arena) = JUMP down from ceiling
      if (input.crouch && f.isGrounded) {
        let jumpF = jumpMag;
        if (op && op.charId === 'king_crimson' && op.isTimeEraseActive) jumpF *= 0.55;
        f.vy = jumpF; // Positive Y = Jump DOWN from ceiling
        f.isGrounded = false;
        f.action = 'jump';
      } else if (input.left) {
        f.vx = -MOVE_SPEED * speedMult;
        f.facing = 'left';
        if (f.isGrounded) f.action = 'walk';
      } else if (input.right) {
        f.vx = MOVE_SPEED * speedMult;
        f.facing = 'right';
        if (f.isGrounded) f.action = 'walk';
      } else {
        f.vx *= FRICTION;
        if (f.isGrounded && Math.abs(f.vx) < 0.2) f.action = 'idle';
      }

    } else {
      // Normal 'down' gravity floor
      if (input.left) {
        f.vx = -MOVE_SPEED * speedMult;
        f.facing = 'left';
        if (f.isGrounded) f.action = 'walk';
      } else if (input.right) {
        f.vx = MOVE_SPEED * speedMult;
        f.facing = 'right';
        if (f.isGrounded) f.action = 'walk';
      } else {
        f.vx *= FRICTION;
        if (f.isGrounded && Math.abs(f.vx) < 0.2) f.action = 'idle';
      }

      if (input.jump && f.isGrounded) {
        let jumpF = jumpMag;
        if (op && op.charId === 'king_crimson' && op.isTimeEraseActive) jumpF *= 0.55;
        f.vy = -jumpF;
        f.isGrounded = false;
        f.action = 'jump';
      }
    }

    this.applyPhysics(f);
  }

  // --- ACTION TIMELINE EXECUTION ---
  private handleActionFrame(f: Fighter, opponent: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;

    switch (f.action) {
      case 'punch':
        if (f.charId === 'funny_valentine' && f.isStandActive) {
          // Valentine Stand Combo: 1 Revolver Shot + 2 D4C Forward Heavy Punches!
          if (f.actionTimer === 23) {
            this.executeValentineBasicRevolverShot(f, opponent);
          } else if (f.actionTimer === 15) {
            f.vx += dir * 4.5;
            this.executeValentineD4CPunch(f, opponent, 1);
          } else if (f.actionTimer === 7) {
            f.vx += dir * 3.5;
            this.executeValentineD4CPunch(f, opponent, 2);
          }
        } else {
          if (f.actionTimer === Math.floor(f.actionDuration / 2)) {
            this.executePunch(f, opponent);
          }
        }
        break;

      case 'barrage':
        if (f.actionTimer % 3 === 0) {
          this.executeBarrageHit(f, opponent);
        }
        break;

      case 'pose':
        f.energy = Math.min(f.maxEnergy, f.energy + POSE_ENERGY_GAIN);
        if (this.frameCount % 6 === 0) {
          const offsetX = (Math.random() * 50 - 25);
          const glyph = f.charId === 'crazy_diamond' ? (Math.random() > 0.5 ? '♥' : '☮')
            : f.charId === 'silver_chariot' ? (Math.random() > 0.5 ? '★' : '⚔')
            : 'ゴ';
          const glyphColor = f.charId === 'dio' ? 'rgba(250, 204, 21, 0.9)'
            : f.charId === 'crazy_diamond' ? 'rgba(56, 189, 248, 0.9)'
            : f.charId === 'king_crimson' ? 'rgba(251, 113, 133, 0.9)'
            : f.charId === 'silver_chariot' ? 'rgba(226, 232, 240, 0.9)'
            : 'rgba(192, 132, 252, 0.9)';
          this.addMenacingParticle(f.x + f.width / 2 + offsetX, f.y - 10, glyph, glyphColor);
        }
        break;

      case 'star_finger':
        if (f.actionTimer === 12) {
          this.executeStarFinger(f, opponent);
        }
        break;

      case 'star_vacuum':
        // Suction pull towards Jotaro
        if (f.actionTimer % 2 === 0) {
          const pullDir = f.x < opponent.x ? -1 : 1;
          opponent.vx = pullDir * STAR_VACUUM_PULL_SPEED;
          opponent.guardBreakTimer = 50; // Guard Break
          this.addSpark(opponent.x + opponent.width / 2, opponent.y + opponent.height / 2, '#38bdf8');
        }
        break;

      case 'ora_beatdown':
        // Multi-hit pummel while target is locked in 'grabbed' state
        if (f.actionTimer % 6 === 0 && f.actionTimer > 15) {
          this.executeOraBeatdownHit(f, opponent);
        } else if (f.actionTimer === 10) {
          // Final explosive blow
          this.executeOraBeatdownFinisher(f, opponent);
        }
        break;

      case 'drain_blood':
        // Vampiric DoT tick & heal DIO
        if (f.actionTimer % 10 === 0) {
          this.executeDrainBloodTick(f, opponent);
        }
        break;

      case 'vampire_drain':
        if (f.actionTimer === 12) {
          this.executeVampireDrainBite(f, opponent);
        }
        break;

      case 'space_ripper_small':
        if (f.actionTimer === 15) {
          this.executeSpaceRipperSmall(f, opponent);
        }
        break;

      case 'street_sign':
        if (f.actionTimer === 12) {
          this.executeStreetSignChop(f, opponent);
        }
        break;

      case 'space_ripper':
        if (f.actionTimer === 25) {
          this.executeSpaceRipperBeam(f, opponent);
        }
        break;

      case 'road_roller_startup':
        if (f.actionTimer > 100) {
          // Leaping into the sky
          f.vy = -12;
          f.y = Math.max(30, f.y - 10);
        } else if (f.actionTimer === 100) {
          // Drops down on opponent coordinates
          f.x = opponent.x - 30;
          f.y = 40;
          f.vy = 24;
          this.addTextParticle(f.x + 40, f.y - 20, 'ROOAAAD ROLLER DAAA!!', '#eab308');
        } else if (f.actionTimer < 90 && f.actionTimer > 20) {
          // Pummelling the Road Roller with MUDA MUDA
          if (f.actionTimer % 4 === 0) {
            this.executeRoadRollerPummelHit(f, opponent);
          }
        } else if (f.actionTimer === 15) {
          // Final Road Roller Explosion
          this.executeRoadRollerExplosion(f, opponent);
        }
        break;

      // JONATHAN ACTIONS
      case 'zoom_punch':
        if (f.actionTimer === 12) {
          this.executeZoomPunch(f, opponent);
        }
        break;

      case 'luck_pluck_slash':
        if (f.actionTimer === 14) {
          this.executeLuckPluckSlash(f, opponent);
        }
        break;

      case 'sunlight_ultimate':
        if (f.actionTimer % 3 === 0 && f.actionTimer > 20) {
          this.executeSunlightYellowHit(f, opponent);
        } else if (f.actionTimer === 15) {
          this.executeSunlightYellowFinisher(f, opponent);
        }
        break;

      // YOUNG JOSEPH ACTIONS
      case 'hamon_elbow':
        if (f.actionTimer === 12) {
          this.executeHamonElbow(f, opponent);
        }
        break;

      case 'clacker_boomerang':
        if (f.actionTimer === 10) {
          this.executeClackerBoomerang(f, opponent);
        }
        break;

      case 'young_joseph_ultimate':
        if (f.actionTimer === 70) {
          this.executeRedStoneBeam(f, opponent);
        }
        break;

      // OLD JOSEPH ACTIONS
      case 'hermit_trap':
        if (f.actionTimer === 16) {
          this.executeHermitTrap(f, opponent);
        }
        break;

      case 'overdrive_tactics':
        if (f.actionTimer === 14) {
          this.executeOverdriveTacticsWhip(f, opponent);
        }
        break;

      case 'camera_smash':
        if (f.actionTimer === 10) {
          this.executeCameraSmash(f, opponent);
        }
        break;

      case 'old_joseph_ultimate':
        if (f.actionTimer % 6 === 0 && f.actionTimer > 20) {
          this.executeHermitSurgeHit(f, opponent);
        } else if (f.actionTimer === 15) {
          this.executeHermitSurgeFinisher(f, opponent);
        }
        break;

      // DIAVOLO ACTIONS
      case 'donut_strike':
        if (f.actionTimer === 12) {
          this.executeDonutStrike(f, opponent);
        }
        if (f.grabbedTarget) {
          opponent.action = 'grabbed';
          opponent.x = f.x + (f.facing === 'right' ? 65 : -opponent.width - 65);
          opponent.y = f.y;
          opponent.vx = 0;
          opponent.vy = 0;
        }
        if (f.actionTimer === 1 && f.grabbedTarget) {
          this.executeDonutThrow(f, opponent);
        }
        break;

      case 'flesh_throw':
        if (f.actionTimer === 10) {
          this.executeFleshThrow(f, opponent);
        }
        break;

      case 'time_erase_ambush':
        if (f.actionTimer === 28) {
          const ambushX = opponent.facing === 'right' ? opponent.x - 65 : opponent.x + opponent.width + 25;
          f.x = Math.max(40, Math.min(this.getArenaWidth() - 80, ambushX));
          f.y = opponent.y;
          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#e11d48');
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '⏱️ TIME ERASE AMBUSH!', '#e11d48');
        } else if (f.actionTimer === 14) {
          this.executeDonutStrikeAmbush(f, opponent);
        }
        if (f.grabbedTarget) {
          opponent.action = 'grabbed';
          opponent.x = f.x + (f.facing === 'right' ? 65 : -opponent.width - 65);
          opponent.y = f.y;
          opponent.vx = 0;
          opponent.vy = 0;
        }
        if (f.actionTimer === 1 && f.grabbedTarget) {
          this.executeDonutThrow(f, opponent);
        }
        break;

      // POLNAREFF ACTIONS
      case 'ray_of_light':
        if (f.actionTimer % 4 === 0) {
          this.executeRayOfLightHit(f, opponent);
        }
        break;

      case 'shooting_sword':
        if (f.actionTimer === 10) {
          this.executeShootingSword(f, opponent);
        }
        break;

      case 'upward_thrust':
        if (f.actionTimer === 12) {
          this.executeUpwardThrust(f, opponent);
        }
        break;

      case 'afterimage_mirage':
        if (f.actionTimer === 25) {
          this.executeAfterimageMirage(f, opponent);
        }
        break;

      // JOSUKE ACTIONS
      case 'ground_punch':
        if (f.actionTimer === 20) {
          this.executeGroundPunch(f, opponent);
        }
        break;

      case 'enraged_stagger':
        if (f.actionTimer % 6 === 0) {
          this.executeEnragedStagger(f, opponent);
        }
        break;

      // TOORU ACTIONS
      case 'tooru_chill_tap':
        if (f.actionTimer === 12) {
          this.addMenacingParticle(f.x, f.y - 15, '🎵', '#94a3b8');
        }
        break;

      case 'tooru_calamity_curse':
        if (f.actionTimer === 20) {
          this.triggerCalamity(f, opponent);
        }
        break;

      case 'tooru_head_doctor':
        if (f.actionTimer % 20 === 0) {
          this.addMenacingParticle(f.x, f.y - 20, 'ゴ', '#64748b');
        }
        break;

      case 'tooru_rock_insects':
        break;

      case 'tooru_calamity_counter':
        if (f.actionTimer % 15 === 0) {
          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#ef4444');
        }
        break;

      case 'tooru_calamity_rain':
        if (f.actionTimer % 12 === 0) {
          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#ef4444');
        }
        break;

      // PUCCI ACTIONS
      case 'pucci_pistol':
        if (f.actionTimer === 12) {
          this.executePucciPistol(f, opponent);
        }
        break;

      case 'pucci_memory_disc':
        if (f.actionTimer === 14) {
          this.executePucciMemoryDisc(f, opponent);
        }
        break;

      case 'pucci_acid_melt':
        if (f.actionTimer === 12) {
          this.executePucciAcidMelt(f, opponent);
        }
        break;

      case 'pucci_stand_disc':
        if (f.actionTimer === 12) {
          this.executePucciStandDisc(f, opponent);
        }
        break;

      case 'pucci_14_words_chant':
        this.handlePucciChantFrame(f);
        break;

      case 'cmoon_gravity_shift':
        if (f.actionTimer === 12) {
          this.executeCmoonGravityShift(f);
        }
        break;

      case 'cmoon_inversion_punch':
        if (f.actionTimer === 14) {
          this.executeCmoonInversionPunch(f, opponent);
        }
        break;

      case 'cmoon_debris_launch':
        if (f.actionTimer === 14) {
          this.executeCmoonDebrisLaunch(f, opponent);
        }
        break;

      case 'cmoon_gravity_shield':
        if (f.actionTimer % 15 === 0) {
          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#22c55e');
        }
        break;

      case 'cmoon_evolve_mih':
        this.handlePucciMiHEvolutionFrame(f);
        break;

      case 'mih_speed_blitz':
        if (f.actionTimer % 6 === 0 && f.actionTimer > 0) {
          this.executeMihSpeedBlitzHit(f, opponent, Math.floor((36 - f.actionTimer) / 6));
        }
        break;

      case 'dipez_light_speed_blitz':
        this.executeDipezLightSpeedBlitzFrame(f, opponent);
        break;

      case 'mih_time_acceleration':
        if (f.actionTimer === 12) {
          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#facc15');
        }
        break;

      case 'mih_knife_throw':
        if (f.actionTimer === 12) {
          this.executeMihKnifeThrow(f, opponent);
        }
        break;

      case 'mih_teleport_strike':
        if (f.actionTimer === 12) {
          this.executeMihTeleportStrike(f, opponent);
        }
        break;

      case 'mih_universe_reset':
        this.handlePucciUniverseResetFrame(f, opponent);
        break;

      // GAPPY (PART 8: JOJOLION) ACTIONS
      case 'gappy_bubble_plunder':
        if (f.actionTimer === 12) {
          this.executeGappyBubblePlunder(f, opponent);
        }
        break;

      case 'gappy_shave_moisture':
        if (f.actionTimer === 12) {
          this.executeGappyShaveMoisture(f, opponent);
        }
        break;

      case 'gappy_bubble_barrage':
        if (f.actionTimer % 4 === 0 && f.actionTimer > 8) {
          this.executeGappyBubbleBarrageHit(f, opponent);
        } else if (f.actionTimer === 4) {
          this.executeGappyBubbleBarrageFinisher(f, opponent);
        }
        break;

      case 'gappy_bubble_trap':
        if (f.actionTimer === 12) {
          this.executeGappyBubbleTrap(f, opponent);
        }
        break;

      case 'gappy_go_beyond':
        if (f.actionTimer === 45) {
          this.executeGappyGoBeyond(f, opponent);
        }
        break;
    }
  }

  // --- TOORU CALAMITY SPAWNERS & PASSIVE LOGIC ---
  private spawnCalamityRaindrop(f: Fighter, opponent: Fighter) {
    // Torrential piercing rain falling across entire map arena
    const arenaW = this.getArenaWidth();
    const targetX = Math.random() * (arenaW - 60) + 30;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'calamity_raindrop',
      subType: 'raindrop',
      x: targetX,
      y: -30,
      vx: (Math.random() - 0.5) * 6 - 2,
      vy: 32,
      baseVx: 0,
      baseVy: 32,
      width: 10,
      height: 30,
      damage: TOORU_CALAMITY_RAIN_TICK_DAMAGE,
      knockbackX: 0,
      knockbackY: 0,
      isFrozenInTime: false,
      life: 60,
      maxLife: 60,
      color: '#38bdf8',
    });
  }

  public spawnCalamityCarConvoy(f: Fighter, opponent: Fighter, count: number = 10) {
    if (this.timeStopState.isActive) return;
    const vehicleTypes: Array<'sedan' | 'suv' | 'pickup' | 'van' | 'truck' | 'semi'> = [
      'sedan', 'suv', 'pickup', 'van', 'truck', 'semi', 'sedan', 'pickup', 'van', 'truck'
    ];
    for (let c = 0; c < count; c++) {
      const type = vehicleTypes[c % vehicleTypes.length];
      const dir: 1 | -1 = c % 2 === 0 ? 1 : -1;
      const sideIndex = Math.floor(c / 2);
      const offset = sideIndex * 210; // Spaced bumper-to-bumper in sequence on each side
      this.spawnRunawayCar(f, opponent, dir, type, offset);
    }
    soundManager.playTooruCalamity();
    soundManager.playCarCrash();
    this.screenShake = 16;
    this.addTextParticle(
      Math.min(this.getArenaWidth() - 300, Math.max(300, opponent.x)),
      opponent.y - 65,
      `🚗 🚙 🛻 🚚 [CALAMITY DUAL-SIDE CONVOY! (LEFT & RIGHT WALLS)]`,
      '#dc2626'
    );
  }

  private spawnRunawayCar(
    f: Fighter,
    opponent: Fighter,
    direction: 1 | -1,
    vehicleType?: 'sedan' | 'suv' | 'pickup' | 'van' | 'truck' | 'semi',
    offsetDistance: number = 0
  ) {
    const arenaW = this.getArenaWidth();
    const types: Array<'sedan' | 'suv' | 'pickup' | 'van' | 'truck' | 'semi'> = [
      'sedan', 'suv', 'pickup', 'van', 'truck', 'semi'
    ];
    const subType = vehicleType || types[Math.floor(Math.random() * types.length)];

    let width = 175;
    let height = 68;
    let damage = CALAMITY_CAR_DAMAGE;
    let color = '#dc2626';
    let label = '🚗 [CALAMITY: SPEEDING SEDAN!]';

    switch (subType) {
      case 'sedan':
        width = 175;
        height = 68;
        damage = 220;
        color = '#dc2626'; // Crimson Red Sedan
        label = '🚗 [CALAMITY: RUNAWAY SEDAN!]';
        break;
      case 'suv':
        width = 185;
        height = 80;
        damage = 240;
        color = '#0284c7'; // Deep Blue SUV
        label = '🚙 [CALAMITY: 4x4 OFFROAD SUV!]';
        break;
      case 'pickup':
        width = 195;
        height = 78;
        damage = 250;
        color = '#d97706'; // Amber Pickup
        label = '🛻 [CALAMITY: HEAVY PICKUP TRUCK!]';
        break;
      case 'van':
        width = 190;
        height = 86;
        damage = 235;
        color = '#64748b'; // Slate Silver Van
        label = '🚐 [CALAMITY: DELIVERY VAN HAZARD!]';
        break;
      case 'truck':
        width = 225;
        height = 100;
        damage = 280;
        color = '#059669'; // Emerald Box Truck
        label = '🚚 [CALAMITY: FREIGHT CARGO TRUCK!]';
        break;
      case 'semi':
        width = 260;
        height = 112;
        damage = 320;
        color = '#991b1b'; // Heavy Semi Trailer
        label = '🚛 [CALAMITY: MASSIVE SEMI TRAILER!]';
        break;
    }

    // Always spawn from OUTSIDE the map boundary walls (dinding map)
    const spawnX = direction === 1 
      ? -width - 80 - offsetDistance 
      : arenaW + 80 + offsetDistance;

    const speed = 38;

    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'calamity_car',
      subType: subType,
      x: spawnX,
      y: GROUND_Y - height,
      vx: direction * speed,
      vy: 0,
      baseVx: direction * speed,
      baseVy: 0,
      width,
      height,
      damage,
      knockbackX: direction * 28,
      knockbackY: -15,
      isFrozenInTime: false,
      life: 180,
      maxLife: 180,
      color,
    });
    soundManager.playCarCrash();
    this.screenShake = 16;
    if (offsetDistance === 0) {
      this.addTextParticle(opponent.x + opponent.width / 2, opponent.y - 50, label, color);
    }
  }

  private spawnCalamityMeteor(f: Fighter, opponent: Fighter) {
    soundManager.playTooruCalamity();
    this.screenShake = 18;
    this.addTextParticle(opponent.x + opponent.width / 2, opponent.y - 70, '☄️ [CALAMITY: GIGANTIC EXTINCTION METEOR!]', '#ef4444');
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'calamity_meteor',
      subType: 'meteor',
      x: opponent.x - 35,
      y: -180,
      vx: (opponent.facing === 'right' ? -1 : 1) * 2,
      vy: 24,
      baseVx: 0,
      baseVy: 24,
      width: 110,
      height: 110,
      damage: TOORU_METEOR_DAMAGE,
      knockbackX: (f.facing === 'right' ? 1 : -1) * 20,
      knockbackY: -18,
      isFrozenInTime: false,
      life: 100,
      maxLife: 100,
      color: '#f97316',
    });
  }

  private triggerCalamity(tooru: Fighter, victim: Fighter) {
    if (this.timeStopState.isActive) return; // Strict immunity during Time Stop
    if (victim.charId === 'dipez' && victim.dipezForm === 'pure_light') {
      this.triggerDipezAutoBlink(victim, tooru);
      return; // Absolute light invincibility - Calamity logic cannot affect pure light!
    }
    if (victim.invulnerableTimer > 15) return;
    if (!!tooru.isParallelWorld !== !!victim.isParallelWorld) return; // Dimension isolation: Calamity cannot cross dimensions

    soundManager.playTooruCalamity();

    const dir = tooru.facing === 'right' ? 1 : -1;
    const events = [
      'falling_debris',
      'sudden_lightning',
      'self_trip',
      'projectile_ricochet',
      'spontaneous_combustion',
      'flying_vehicle',
      'flying_vehicle', // Solid chance for speeding car/truck in passive flow!
      'sharp_object_cut'
    ];

    const chosen = events[Math.floor(Math.random() * events.length)];

    switch (chosen) {
      case 'falling_debris': {
        const debrisTypes: Array<'billboard' | 'pot' | 'pole' | 'plane_door'> = ['billboard', 'pot', 'pole', 'plane_door'];
        const sub = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
        this.projectiles.push({
          id: this.projectileId++,
          ownerId: tooru.id,
          type: 'calamity_debris',
          subType: sub,
          x: victim.x + victim.width / 2 - 25,
          y: -80,
          vx: (Math.random() - 0.5) * 2,
          vy: 24,
          baseVx: 0,
          baseVy: 24,
          width: 50,
          height: 50,
          damage: CALAMITY_DEBRIS_DAMAGE,
          knockbackX: (Math.random() > 0.5 ? 1 : -1) * 8,
          knockbackY: -8,
          isFrozenInTime: false,
          life: 90,
          maxLife: 90,
          color: '#ef4444',
          rotation: Math.random() * Math.PI,
        });
        this.addTextParticle(victim.x + victim.width / 2, victim.y - 45, '⚠️ [CALAMITY: FALLING OBJECT!]', '#ef4444');
        break;
      }

      case 'sudden_lightning': {
        if (victim.charId === 'dipez' && victim.dipezForm === 'pure_light') {
          this.triggerDipezAutoBlink(victim, tooru);
          break;
        }
        this.applyRawDamage(victim, CALAMITY_LIGHTNING_DAMAGE, 0, -4, tooru);
        victim.hitStun = 55;
        soundManager.playLightningStrike();
        this.screenShake = 9;
        this.addTextParticle(victim.x + victim.width / 2, victim.y - 50, '⚡ [CALAMITY: SUDDEN LIGHTNING!]', '#38bdf8');
        for (let i = 0; i < 15; i++) {
          this.addSpark(victim.x + victim.width / 2, victim.y + Math.random() * victim.height, '#38bdf8');
        }
        break;
      }

      case 'self_trip': {
        if (victim.charId === 'dipez' && victim.dipezForm === 'pure_light') {
          this.triggerDipezAutoBlink(victim, tooru);
          break;
        }
        this.applyRawDamage(victim, CALAMITY_TRIP_DAMAGE, -dir * 6, 8, tooru);
        victim.hitStun = 45;
        victim.isGrounded = false;
        this.addTextParticle(victim.x + victim.width / 2, victim.y - 35, '💥 [CALAMITY: FATAL TRIP & SLIP!]', '#facc15');
        soundManager.playHit(true);
        break;
      }

      case 'projectile_ricochet': {
        let reflectedAny = false;
        for (const p of this.projectiles) {
          if (p.ownerId === victim.id) {
            p.ownerId = tooru.id;
            p.vx = -p.vx * 1.8;
            p.damage = Math.round(p.damage * 1.5);
            p.color = '#ef4444';
            reflectedAny = true;
          }
        }
        if (!reflectedAny) {
          this.projectiles.push({
            id: this.projectileId++,
            ownerId: tooru.id,
            type: 'calamity_debris',
            subType: 'pot',
            x: victim.x + (dir * -120),
            y: victim.y + 20,
            vx: dir * 26,
            vy: -1,
            baseVx: dir * 26,
            baseVy: 0,
            width: 30,
            height: 30,
            damage: 130,
            knockbackX: dir * 12,
            knockbackY: -6,
            isFrozenInTime: false,
            life: 40,
            maxLife: 40,
            color: '#ef4444',
          });
        }
        this.addTextParticle(victim.x + victim.width / 2, victim.y - 45, '🔄 [CALAMITY: RICOCHET TRAJECTORY!]', '#ef4444');
        break;
      }

      case 'spontaneous_combustion': {
        if (victim.charId === 'dipez' && victim.dipezForm === 'pure_light') {
          this.triggerDipezAutoBlink(victim, tooru);
          break;
        }
        victim.burnedTimer = 180;
        this.addTextParticle(victim.x + victim.width / 2, victim.y - 45, '🔥 [CALAMITY: SPONTANEOUS COMBUSTION!]', '#f97316');
        for (let i = 0; i < 10; i++) {
          this.addMenacingParticle(victim.x + Math.random() * victim.width, victim.y + Math.random() * victim.height, '🔥', '#f97316');
        }
        break;
      }

      case 'flying_vehicle': {
        const carDir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        const vehicleTypes: Array<'sedan' | 'suv' | 'pickup' | 'van' | 'truck' | 'semi'> = [
          'sedan', 'suv', 'pickup', 'van', 'truck', 'semi'
        ];
        const chosenType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        this.spawnRunawayCar(tooru, victim, carDir, chosenType);
        break;
      }

      case 'sharp_object_cut': {
        if (victim.charId === 'dipez' && victim.dipezForm === 'pure_light') {
          this.triggerDipezAutoBlink(victim, tooru);
          break;
        }
        victim.bleedTimer = 180;
        this.applyRawDamage(victim, 60, dir * 4, -3, tooru);
        soundManager.playRazorCut();
        this.addTextParticle(victim.x + victim.width / 2, victim.y - 45, '🩸 [CALAMITY: FATAL LACERATION!]', '#dc2626');
        for (let i = 0; i < 8; i++) {
          this.addMenacingParticle(victim.x + Math.random() * victim.width, victim.y + Math.random() * victim.height, '🩸', '#dc2626');
        }
        break;
      }
    }
  }

  // --- JOSUKE SKILLS ACTIONS ---
  private executeGroundPunch(f: Fighter, opponent: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    const waveDistX = Math.abs(f.x - opponent.x);
    if (waveDistX < 340 && opponent.isGrounded) {
      const hitbox: Hitbox = {
        x: opponent.x - 15,
        y: opponent.y - 15,
        width: opponent.width + 30,
        height: opponent.height + 30,
        damage: JOSUKE_GROUND_PUNCH_DAMAGE,
        knockbackX: dir * 5,
        knockbackY: -18, // Launcher!
        hitStun: 45
      };
      this.applyHit(f, opponent, hitbox);
      this.addShockwave(opponent.x + opponent.width / 2, GROUND_Y - 20, '#06b6d4');
      for (let i = 0; i < 15; i++) {
        this.addSpark(
          opponent.x + opponent.width / 2 + (Math.random() * 40 - 20),
          GROUND_Y - 20 + (Math.random() * 20 - 10),
          '#06b6d4'
        );
      }
    } else {
      // Create a visual ground smash FX
      this.addShockwave(f.x + dir * 140, GROUND_Y - 20, '#06b6d4');
      for (let i = 0; i < 8; i++) {
        this.addSpark(
          f.x + dir * 140 + (Math.random() * 60 - 30),
          GROUND_Y - 20 + (Math.random() * 20 - 10),
          '#06b6d4'
        );
      }
    }
  }

  private executeEnragedStagger(f: Fighter, opponent: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    const hitbox: Hitbox = {
      x: f.facing === 'right' ? f.x + f.width : f.x - 70,
      y: f.y + 10,
      width: 75,
      height: 55,
      damage: 16,
      knockbackX: dir * 9,
      knockbackY: -3,
      hitStun: 22
    };
    if (this.checkCollision(hitbox, opponent)) {
      this.applyHit(f, opponent, hitbox);
    }
  }

  // --- PUCCI SKILL DISPATCHER & EVOLUTION LOGIC ---
  private handlePucciSkills(f: Fighter, input: InputState, opponent: Fighter): boolean {
    const form = f.pucciForm || 'whitesnake';
    const isTraining = this.matchConfig.mode === 'training';

    // Stand Toggle
    if (input.toggleStand && f.cooldowns.standToggle <= 0) {
      f.isStandActive = !f.isStandActive;
      f.cooldowns.standToggle = 25;
      soundManager.playPucciDisc();
      const standTitle = form === 'made_in_heaven' ? 'MADE IN HEAVEN' : form === 'cmoon' ? 'C-MOON' : 'WHITESNAKE';
      this.addTextParticle(f.x + f.width / 2, f.y - 40, `✨ ${standTitle} ${f.isStandActive ? 'MANIFESTED' : 'RETRACTED'}`, f.color);
      return true;
    }

    if (form === 'whitesnake') {
      // Skill 1 - Pistol Shot (Key U / SKILL 1)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= PUCCI_PISTOL_COST || isTraining)) {
        f.action = 'pucci_pistol';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill1 = PUCCI_PISTOL_COOLDOWN;
        if (!isTraining) f.energy -= PUCCI_PISTOL_COST;
        soundManager.playPucciGunshot();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🔫 PISTOL SHOT!', '#e2e8f0');
        return true;
      }

      // Skill 2 - Memory Disc Extract (Key I / SKILL 2)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= PUCCI_MEMORY_DISC_COST || isTraining)) {
        f.action = 'pucci_memory_disc';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill2 = PUCCI_MEMORY_DISC_COOLDOWN;
        if (!isTraining) f.energy -= PUCCI_MEMORY_DISC_COST;
        f.isStandActive = true;
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '💿 MEMORY DISC EXTRACT!', '#c084fc');
        return true;
      }

      // Skill 3 - Acid Melt Illusion (Key O / SKILL 3)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= PUCCI_ACID_MELT_COST || isTraining)) {
        f.action = 'pucci_acid_melt';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill3 = PUCCI_ACID_MELT_COOLDOWN;
        if (!isTraining) f.energy -= PUCCI_ACID_MELT_COST;
        soundManager.playAcidMelt();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🧪 ACID MELT ILLUSION!', '#a855f7');
        return true;
      }

      // Skill 4 - Stand Disc Command (Key P / SKILL 4)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= PUCCI_STAND_DISC_COST || isTraining)) {
        f.action = 'pucci_stand_disc';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill4 = PUCCI_STAND_DISC_COOLDOWN;
        if (!isTraining) f.energy -= PUCCI_STAND_DISC_COST;
        soundManager.playPucciDisc();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '💿 STAND DISC COMMAND!', '#e2e8f0');
        return true;
      }

      // Skill 5 / Evolution - 14 Words Recitation (Key [ or H / EVOLUTION)
      if (input.skill5 && f.cooldowns.skill5 <= 0 && f.isGrounded) {
        f.action = 'pucci_14_words_chant';
        f.actionTimer = 252; // 14 words * 18 frames = 252 frames (~4.2s)
        f.actionDuration = 252;
        f.pucciChantStep = 0;
        f.vx = 0;
        f.cooldowns.skill5 = 120;
        soundManager.playPucciChant();
        this.addTextParticle(f.x + f.width / 2, f.y - 50, '📿 [14 WORDS RECITATION STARTED!]', '#c084fc');
        this.addTextParticle(f.x + f.width / 2, f.y - 25, '⚠️ (DO NOT GET HIT - CAN BE INTERRUPTED)', '#fb7185');
        return true;
      }
    } else if (form === 'cmoon') {
      // Skill 1 - Gravity Axis Shift (Key U / SKILL 1)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= CMOON_GRAVITY_SHIFT_COST || isTraining)) {
        f.action = 'cmoon_gravity_shift';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill1 = CMOON_GRAVITY_SHIFT_COOLDOWN;
        if (!isTraining) f.energy -= CMOON_GRAVITY_SHIFT_COST;
        soundManager.playCmoonGravity();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🌌 GRAVITY AXIS SHIFT!', '#10b981');
        return true;
      }

      // Skill 2 - Surface Inversion Punch (Key I / SKILL 2)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= CMOON_INVERSION_PUNCH_COST || isTraining)) {
        f.action = 'cmoon_inversion_punch';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill2 = CMOON_INVERSION_PUNCH_COOLDOWN;
        if (!isTraining) f.energy -= CMOON_INVERSION_PUNCH_COST;
        f.isStandActive = true;
        soundManager.playCmoonInversion();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🌀 SURFACE INVERSION PUNCH!', '#10b981');
        return true;
      }

      // Skill 3 - Debris Gravitational Launch (Key O / SKILL 3)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= CMOON_DEBRIS_COST || isTraining)) {
        f.action = 'cmoon_debris_launch';
        f.actionTimer = 22;
        f.actionDuration = 22;
        f.cooldowns.skill3 = CMOON_DEBRIS_COOLDOWN;
        if (!isTraining) f.energy -= CMOON_DEBRIS_COST;
        soundManager.playCmoonGravity();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🪨 GRAVITATIONAL DEBRIS LAUNCH!', '#34d399');
        return true;
      }

      // Skill 4 - Gravity Repulsion Shield (Key P / SKILL 4)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= CMOON_SHIELD_COST || isTraining)) {
        f.action = 'cmoon_gravity_shield';
        f.actionTimer = 30;
        f.actionDuration = 30;
        f.cooldowns.skill4 = CMOON_SHIELD_COOLDOWN;
        f.cmoonShieldTimer = CMOON_SHIELD_DURATION;
        if (!isTraining) f.energy -= CMOON_SHIELD_COST;
        soundManager.playCmoonGravity();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🛡️ GRAVITY REPULSION SHIELD (3s)!', '#22c55e');
        return true;
      }

      // Skill 5 / Evolution - Made in Heaven (Cape Canaveral Evolution)
      if (input.skill5 && f.cooldowns.skill5 <= 0 && ((f.cmoonGauge || 0) >= 100 || isTraining)) {
        f.action = 'cmoon_evolve_mih';
        f.actionTimer = 80;
        f.actionDuration = 80;
        f.cooldowns.skill5 = 999;
        f.invulnerableTimer = 85;
        f.vx = 0;
        f.vy = 0;
        soundManager.playMiHAcceleration();
        this.addTextParticle(f.x + f.width / 2, f.y - 50, '🌕 CAPE CANAVERAL GRAVITY ALIGNED!', '#facc15');
        this.addTextParticle(f.x + f.width / 2, f.y - 25, '👑 ASCENDING TO HEAVEN...', '#facc15');
        return true;
      }
    } else if (form === 'made_in_heaven') {
      // Skill 1 - Speed Blitz (Key U / SKILL 1)
      if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= MIH_SPEED_BLITZ_COST || isTraining)) {
        f.action = 'mih_speed_blitz';
        f.actionTimer = 36;
        f.actionDuration = 36;
        f.cooldowns.skill1 = MIH_SPEED_BLITZ_COOLDOWN;
        if (!isTraining) f.energy -= MIH_SPEED_BLITZ_COST;
        soundManager.playMiHBlitz();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '⚡ SPEED BLITZ (6 HITS)!', '#facc15');
        return true;
      }

      // Skill 2 - Time Acceleration (Key I / SKILL 2)
      if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= MIH_TIME_ACCEL_COST || isTraining)) {
        f.action = 'mih_time_acceleration';
        f.actionTimer = 24;
        f.actionDuration = 24;
        f.cooldowns.skill2 = MIH_TIME_ACCEL_COOLDOWN;
        f.mihTimeAccelTimer = MIH_TIME_ACCEL_DURATION;
        if (!isTraining) f.energy -= MIH_TIME_ACCEL_COST;
        soundManager.playMiHAcceleration();
        this.addTextParticle(f.x + f.width / 2, f.y - 45, '⏱️ TIME ACCELERATION ACTIVATED (5s)!', '#facc15');
        this.addTextParticle(f.x + f.width / 2, f.y - 20, '⚡ ALL MIH SKILL COOLDOWNS ACCELERATED!', '#ffffff');
        return true;
      }

      // Skill 3 - Invisible Knife Throw (Key O / SKILL 3)
      if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= MIH_KNIFE_COST || isTraining)) {
        f.action = 'mih_knife_throw';
        f.actionTimer = 18;
        f.actionDuration = 18;
        f.cooldowns.skill3 = MIH_KNIFE_COOLDOWN;
        if (!isTraining) f.energy -= MIH_KNIFE_COST;
        soundManager.playMiHKnife();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🔪 ACCELERATED INVISIBLE KNIVES!', '#e2e8f0');
        return true;
      }

      // Skill 4 - Speed Teleport Strike (Key P / SKILL 4)
      if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= MIH_TELEPORT_COST || isTraining)) {
        f.action = 'mih_teleport_strike';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill4 = MIH_TELEPORT_COOLDOWN;
        if (!isTraining) f.energy -= MIH_TELEPORT_COST;
        soundManager.playMiHBlitz();
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🌀 SPEED TELEPORT AMBUSH!', '#facc15');
        return true;
      }

      // Ultimate - Universe Reset (Key Y / ULTIMATE or Key H / SKILL 5)
      const canReset = (input.ultimate || input.skill5) &&
        (f.cooldowns.ultimate <= 0 || f.cooldowns.skill5 <= 0) &&
        (f.energy >= MIH_UNIVERSE_RESET_COST || isTraining);
      if (canReset) {
        f.action = 'mih_universe_reset';
        f.actionTimer = 180; // 3 seconds
        f.actionDuration = 180;
        f.cooldowns.ultimate = MIH_UNIVERSE_RESET_COOLDOWN;
        f.cooldowns.skill5 = MIH_UNIVERSE_RESET_COOLDOWN;
        f.invulnerableTimer = 185;
        f.vx = 0;
        f.vy = 0;
        if (!isTraining) f.energy -= MIH_UNIVERSE_RESET_COST;
        soundManager.playUniverseReset();
        this.addTextParticle(f.x + f.width / 2, f.y - 55, '🌌 ★ UNIVERSE RESET: SINGULARITY ★ 🌌', '#facc15');
        return true;
      }
    }

    return false;
  }

  // --- JOSUKE HIGASHIKATA / GAPPY SKILLS & EXECUTION METHODS ---
  private handleGappySkills(f: Fighter, input: InputState, opponent: Fighter): boolean {
    const isTraining = this.matchConfig.mode === 'training';

    // Stand Toggle
    if (input.toggleStand && f.cooldowns.standToggle <= 0) {
      f.isStandActive = !f.isStandActive;
      f.cooldowns.standToggle = 25;
      soundManager.playBubblePop();
      this.addTextParticle(f.x + f.width / 2, f.y - 40, `🧼 SOFT & WET ${f.isStandActive ? 'MANIFESTED' : 'RETRACTED'}`, '#38bdf8');
      return true;
    }

    // Skill 1 - Bubble Plunder (Friction Strip) (Key U / SKILL 1)
    if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= GAPPY_BUBBLE_PLUNDER_COST || isTraining)) {
      f.action = 'gappy_bubble_plunder';
      f.actionTimer = 22;
      f.actionDuration = 22;
      f.cooldowns.skill1 = GAPPY_BUBBLE_PLUNDER_COOLDOWN;
      if (!isTraining) f.energy -= GAPPY_BUBBLE_PLUNDER_COST;
      f.isStandActive = true;
      soundManager.playBubblePlunder();
      this.addTextParticle(f.x + f.width / 2, f.y - 40, '🧼 BUBBLE PLUNDER: ZERO FRICTION STRIP!', '#38bdf8');
      return true;
    }

    // Skill 2 - Shave & Moisture Theft (Key I / SKILL 2)
    if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= GAPPY_SHAVE_MOISTURE_COST || isTraining)) {
      f.action = 'gappy_shave_moisture';
      f.actionTimer = 24;
      f.actionDuration = 24;
      f.cooldowns.skill2 = GAPPY_SHAVE_MOISTURE_COOLDOWN;
      if (!isTraining) f.energy -= GAPPY_SHAVE_MOISTURE_COST;
      f.isStandActive = true;
      soundManager.playBubblePop();
      this.addTextParticle(f.x + f.width / 2, f.y - 40, '✂️ SHAVE & MOISTURE THEFT (ATK DRAIN)!', '#0284c7');
      return true;
    }

    // Skill 3 - Bubble Shot Barrage (Key O / SKILL 3)
    if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= GAPPY_BUBBLE_BARRAGE_COST || isTraining)) {
      f.action = 'gappy_bubble_barrage';
      f.actionTimer = 44;
      f.actionDuration = 44;
      f.cooldowns.skill3 = GAPPY_BUBBLE_BARRAGE_COOLDOWN;
      if (!isTraining) f.energy -= GAPPY_BUBBLE_BARRAGE_COST;
      f.isStandActive = true;
      this.addTextParticle(f.x + f.width / 2, f.y - 40, '🧼 ORA ORA BUBBLE SHOT BARRAGE!', '#38bdf8');
      return true;
    }

    // Skill 4 - Bubble Shield & Trap (Key P / SKILL 4)
    if (input.skill4 && f.cooldowns.skill4 <= 0 && (f.energy >= GAPPY_BUBBLE_TRAP_COST || isTraining)) {
      f.action = 'gappy_bubble_trap';
      f.actionTimer = 24;
      f.actionDuration = 24;
      f.cooldowns.skill4 = GAPPY_BUBBLE_TRAP_COOLDOWN;
      if (!isTraining) f.energy -= GAPPY_BUBBLE_TRAP_COST;
      f.isStandActive = true;
      soundManager.playBubblePop();
      const dist = Math.abs((f.x + f.width / 2) - (opponent.x + opponent.width / 2));
      if (dist < 200) {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🫧 BUBBLE TRAP (SUSPENDED)!', '#7dd3fc');
      } else {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🫧 BUBBLE SHIELD ACTIVATED!', '#38bdf8');
      }
      return true;
    }

    // Skill 5 / Ultimate - Soft & Wet: Go Beyond (Key Y / ULTIMATE or Key H / SKILL 5)
    const canGoBeyond = (input.ultimate || input.skill5) &&
      (f.cooldowns.ultimate <= 0 || f.cooldowns.skill5 <= 0) &&
      (f.energy >= GAPPY_GO_BEYOND_COST || isTraining);
    if (canGoBeyond) {
      f.action = 'gappy_go_beyond';
      f.actionTimer = 90; // ~1.5s cast
      f.actionDuration = 90;
      f.cooldowns.ultimate = GAPPY_GO_BEYOND_COOLDOWN;
      f.cooldowns.skill5 = GAPPY_GO_BEYOND_COOLDOWN;
      f.invulnerableTimer = 95;
      f.gappyGoBeyondActive = true;
      f.gappyGoBeyondPhase = 'cast';
      f.gappyGoBeyondTimer = 90;
      f.gappyGoBeyondX = f.x + f.width / 2;
      f.gappyGoBeyondY = f.y + 20;
      if (!isTraining) f.energy -= GAPPY_GO_BEYOND_COST;
      soundManager.playGoBeyondLaunch();
      this.addTextParticle(f.x + f.width / 2, f.y - 55, '🌌 ★ SOFT & WET: GO BEYOND (見えないシャボン玉) ★', '#38bdf8');
      return true;
    }

    return false;
  }

  // --- FUNNY VALENTINE SKILLS & DUAL-DIMENSION MECHANICS (PART 7) ---
  private handleValentineSkills(f: Fighter, input: InputState, opponent: Fighter): boolean {
    const isTraining = this.matchConfig.mode === 'training';

    // Stand Toggle
    if (input.toggleStand && f.cooldowns.standToggle <= 0) {
      f.isStandActive = !f.isStandActive;
      f.cooldowns.standToggle = 25;
      soundManager.playDojyaaan();
      this.addTextParticle(f.x + f.width / 2, f.y - 40, `🇺🇸 D4C ${f.isStandActive ? 'MANIFESTED' : 'RETRACTED'}`, '#38bdf8');
      return true;
    }

    // Skill 1 - Change to Parallel / Paradox Pull (Key U / SKILL 1)
    if (input.skill1 && f.cooldowns.skill1 <= 0 && (f.energy >= VALENTINE_PARALLEL_COST || isTraining || f.isParallelWorld)) {
      if (f.isParallelWorld) {
        // Re-trigger: Paradox Pull! (Return to base dimension and pull parallel enemy clone to collide)
        soundManager.playFlagSandwich();
        soundManager.playDojyaaan();
        f.action = 'valentine_paradox_pull';
        f.actionTimer = 35;
        f.actionDuration = 35;
        f.cooldowns.skill1 = VALENTINE_PARALLEL_COOLDOWN;
        f.isParallelWorld = false; // Transition back to real world!
        f.isParadoxColliding = true;
        f.paradoxCollisionTimer = 35;

        if (f.parallelEnemyClone) {
          f.parallelEnemyClone.isParallelWorld = false; // Drag clone to real world for paradox collision!
          f.parallelEnemyClone.x = opponent.x + (f.facing === 'right' ? 120 : -120);
          f.parallelEnemyClone.y = opponent.y;
        }

        this.addTextParticle(f.x + f.width / 2, f.y - 40, '💥 D4C: PARADOX PULL! MAGNETIZING CLONES!', '#f472b6');
        return true;
      } else {
        // Change to Parallel World
        f.action = 'valentine_parallel_shift';
        f.actionTimer = 30;
        f.actionDuration = 30;
        f.cooldowns.skill1 = VALENTINE_PARALLEL_COOLDOWN;
        if (!isTraining) f.energy -= VALENTINE_PARALLEL_COST;
        f.isStandActive = true;
        f.isParallelWorld = true;
        f.parallelWorldTimer = VALENTINE_PARALLEL_DURATION;
        f.flagSandwichActive = true;
        f.flagSandwichTimer = 25;
        f.invulnerableTimer = 30;

        soundManager.playFlagSandwich();
        soundManager.playDojyaaan();

        // Spawn Active CPU Enemy Clone in Parallel World
        const cloneId = 'parallel_enemy_' + Date.now();
        const cloneX = Math.max(80, Math.min(ARENA_WIDTH - 80, f.x + (f.facing === 'right' ? 220 : -220)));
        f.parallelEnemyClone = createFighter(
          cloneId,
          cloneX,
          f.facing === 'right' ? 'left' : 'right',
          opponent.charId || 'jotaro',
          this.matchConfig
        );
        f.parallelEnemyClone.isParallelWorld = true;
        f.parallelEnemyClone.isClone = true;
        f.parallelEnemyClone.isStandActive = true;
        f.parallelEnemyClone.standAlpha = 1.0;
        f.parallelEnemyClone.team = f.team === 'teamA' ? 'teamB' : 'teamA';
        f.parallelEnemyClone.energy = 100;
        f.parallelEnemyClone.hp = Math.max(300, Math.min(opponent.hp || 500, 500));

        this.addTextParticle(f.x + f.width / 2, f.y - 40, '🌀 D4C: CHANGE TO PARALLEL WORLD (DOJYAA~~N)!', '#38bdf8');
        return true;
      }
    }

    // Skill 2 - Parallel Self Army (Key I / SKILL 2)
    if (input.skill2 && f.cooldowns.skill2 <= 0 && (f.energy >= VALENTINE_CLONE_ARMY_COST || isTraining)) {
      if (f.isClone) {
        // Clones cannot summon nested clones
        return false;
      }
      f.action = 'valentine_clone_summon';
      f.actionTimer = 25;
      f.actionDuration = 25;
      f.cooldowns.skill2 = VALENTINE_CLONE_ARMY_COOLDOWN;
      if (!isTraining) f.energy -= VALENTINE_CLONE_ARMY_COST;
      f.isStandActive = true;

      soundManager.playDojyaaan();
      soundManager.playFlagSandwich();

      // Spawn 2 Valentine Clones into Main World at distinct positions
      if (!f.valentineClones) f.valentineClones = [];
      const dir = f.facing === 'right' ? 1 : -1;
      const arenaW = this.getArenaWidth();
      const c1X = Math.max(60, Math.min(arenaW - 60, f.x - dir * 90));
      const c2X = Math.max(60, Math.min(arenaW - 60, f.x + dir * 110));

      const c1 = createFighter('val_clone_1_' + Date.now(), c1X, f.facing, 'funny_valentine', this.matchConfig);
      const c2 = createFighter('val_clone_2_' + Date.now(), c2X, f.facing, 'funny_valentine', this.matchConfig);

      c1.isStandActive = true;
      c1.standAlpha = 0.9;
      c1.cloneLifeTimer = VALENTINE_CLONE_DURATION;
      c1.team = f.team;
      c1.isClone = true;
      c1.isParallelWorld = !!f.isParallelWorld;

      c2.isStandActive = true;
      c2.standAlpha = 0.9;
      c2.cloneLifeTimer = VALENTINE_CLONE_DURATION;
      c2.team = f.team;
      c2.isClone = true;
      c2.isParallelWorld = !!f.isParallelWorld;

      for (let s = 0; s < 8; s++) {
        this.addSpark(c1X + 30, GROUND_Y - 40, '#f472b6');
        this.addSpark(c2X + 30, GROUND_Y - 40, '#f472b6');
      }

      f.valentineClones.push(c1, c2);

      this.addTextParticle(f.x + f.width / 2, f.y - 40, '👥 D4C: PARALLEL SELF ARMY (LIFE INSURANCE READY)!', '#f472b6');
      return true;
    }

    // Skill 3 - D4C Heavy Barrage (Key O / SKILL 3)
    if (input.skill3 && f.cooldowns.skill3 <= 0 && (f.energy >= VALENTINE_BARRAGE_COST || isTraining)) {
      f.action = 'valentine_d4c_barrage';
      f.actionTimer = 40;
      f.actionDuration = 40;
      f.cooldowns.skill3 = VALENTINE_BARRAGE_COOLDOWN;
      if (!isTraining) f.energy -= VALENTINE_BARRAGE_COST;
      f.isStandActive = true;

      soundManager.playBarrageHit();
      this.screenShake = Math.max(this.screenShake, 5);

      const dir = f.facing === 'right' ? 1 : -1;
      this.projectiles.push({
        id: this.projectileId++,
        ownerId: f.id,
        type: 'valentine_flag_whip',
        x: f.x + (dir === 1 ? f.width + 10 : -30),
        y: f.y + 15,
        vx: dir * 14,
        vy: 0,
        baseVx: dir * 14,
        baseVy: 0,
        width: 60,
        height: 40,
        damage: VALENTINE_BARRAGE_FINISHER_DAMAGE,
        knockbackX: dir * 16,
        knockbackY: -6,
        hitStun: 60,
        isFrozenInTime: false,
        life: 25,
        maxLife: 25,
        color: '#f472b6',
        subType: 'flag'
      });

      this.addTextParticle(f.x + f.width / 2, f.y - 40, '🇺🇸 D4C: DOJYAA~~N HEAVY BARRAGE!', '#38bdf8');
      return true;
    }

    // Ultimate - D4C: Love Train (Key Y / ULTIMATE or Key P / SKILL 4 / SKILL 5)
    const canLoveTrain = (input.ultimate || input.skill4 || input.skill5) &&
      (f.cooldowns.ultimate <= 0 || f.cooldowns.skill4 <= 0) &&
      (f.energy >= VALENTINE_LOVE_TRAIN_COST || isTraining);

    if (canLoveTrain) {
      f.action = 'valentine_love_train';
      f.actionTimer = 45;
      f.actionDuration = 45;
      f.cooldowns.ultimate = VALENTINE_LOVE_TRAIN_COOLDOWN;
      f.cooldowns.skill4 = VALENTINE_LOVE_TRAIN_COOLDOWN;
      if (!isTraining) f.energy -= VALENTINE_LOVE_TRAIN_COST;
      f.isStandActive = true;

      f.isLoveTrainActive = true;
      f.loveTrainTimer = VALENTINE_LOVE_TRAIN_DURATION;
      f.invulnerableTimer = VALENTINE_LOVE_TRAIN_DURATION;

      soundManager.playLoveTrainActivate();
      this.screenShake = 12;

      this.addTextParticle(f.x + f.width / 2, f.y - 45, '✨ D4C: LOVE TRAIN (ABSOLUTE REDIRECTION)!', '#eab308');
      return true;
    }

    return false;
  }

  // --- DIPEZ SKILLS & EVOLUTION MECHANICS ---
  private handleDipezSkills(f: Fighter, input: InputState, opponent: Fighter): boolean {
    const isTraining = this.matchConfig.mode === 'training';
    const isPureLight = f.dipezForm === 'pure_light';
    const hasNoArms = !isPureLight && (f.dipezArmLostTimer !== undefined && f.dipezArmLostTimer > 0);

    // Skill 1 - Photon Bullet (Base) / Photon Invisibility (Pure Light Form) (Key U / SKILL 1)
    if (input.skill1 && f.cooldowns.skill1 <= 0) {
      if (hasNoArms) {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'whaa!!! (ARMS LOST 5s)', '#ef4444');
        soundManager.playDipezWhaa();
        f.cooldowns.skill1 = 20;
        return true;
      }
      if (f.energy >= 20 || isTraining || isPureLight) {
        if (isPureLight) {
          // Evolved Skill 1: Photon Invisibility (6 seconds invisible to enemies)
          f.action = 'dipez_invisibility';
          f.actionTimer = 20;
          f.actionDuration = 20;
          f.cooldowns.skill1 = 90;
          f.dipezInvisibleTimer = 360; // 6 seconds
          soundManager.playDipezTch();
          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#fef08a');
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '✨ PHOTON INVISIBILITY (6s)!', '#fef08a');
          return true;
        }

        f.action = 'dipez_photon_bullet';
        f.actionTimer = 20;
        f.actionDuration = 20;
        f.cooldowns.skill1 = 40;
        if (!isTraining) f.energy -= 20;

        const dir = f.facing === 'right' ? 1 : -1;
        soundManager.playDipezTch();

        this.projectiles.push({
          id: this.projectileId++,
          ownerId: f.id,
          type: 'dipez_photon_bullet',
          x: f.x + (dir === 1 ? f.width + 10 : -35),
          y: f.y + 20,
          vx: dir * 28,
          vy: 0,
          baseVx: dir * 28,
          baseVy: 0,
          width: 35,
          height: 12,
          damage: 35,
          knockbackX: dir * 14,
          knockbackY: -4,
          hitStun: 30,
          isFrozenInTime: false,
          life: 45,
          maxLife: 45,
          color: '#fef08a',
        });

        this.addTextParticle(f.x + f.width / 2, f.y - 35, 'Tch', '#fef08a');
        return true;
      }
    }

    // Skill 2 - Flashbang (Base) / Omnipresent Map Laser (Pure Light Form) (Key I / SKILL 2)
    if (input.skill2 && f.cooldowns.skill2 <= 0) {
      if (hasNoArms) {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'whaa!!! (ARMS LOST 5s)', '#ef4444');
        soundManager.playDipezWhaa();
        f.cooldowns.skill2 = 20;
        return true;
      }
      if (f.energy >= 30 || isTraining || isPureLight) {
        if (isPureLight) {
          // Evolved Skill 2: Omnipresent Map Laser (Massive full map height & width laser beam!)
          f.action = 'dipez_map_laser';
          f.actionTimer = 60;
          f.actionDuration = 60;
          f.cooldowns.skill2 = 90;
          if (!isTraining) f.energy = Math.max(0, f.energy - 30);

          soundManager.playDipezDieYou();
          this.screenShake = 28;

          const arenaW = this.getArenaWidth();
          this.projectiles.push({
            id: this.projectileId++,
            ownerId: f.id,
            type: 'dipez_map_laser_beam',
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            baseVx: 0,
            baseVy: 0,
            width: arenaW,
            height: 540,
            damage: 140,
            knockbackX: (f.facing === 'right' ? 1 : -1) * 22,
            knockbackY: -10,
            hitStun: 60,
            isFrozenInTime: false,
            life: 60,
            maxLife: 60,
            color: '#38bdf8',
          });

          // Apply burn status to all opponents across map
          const targets = this.getAllActiveFighters().filter(t => t.id !== f.id && t.team !== f.team && t.hp > 0);
          for (const t of targets) {
            t.burnedTimer = Math.max(t.burnedTimer || 0, 240); // 4s burn
          }

          this.addTextParticle(f.x + f.width / 2, f.y - 40, '💥 OMNIPRESENT MAP LASER!!', '#38bdf8');
          return true;
        }

        f.action = 'dipez_flashbang';
        f.actionTimer = 25;
        f.actionDuration = 25;
        f.cooldowns.skill2 = 90;
        if (!isTraining) f.energy -= 30;

        soundManager.playDipezDieYou();
        this.screenShake = 12;

        const targets = this.getAllActiveFighters().filter(target => target.id !== f.id && target.team !== f.team && target.hp > 0);
        for (const target of targets) {
          const dx = (target.x + target.width / 2) - (f.x + f.width / 2);
          const dy = (target.y + target.height / 2) - (f.y + f.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 260) {
            target.blindedTimer = 90; // 1.5s Blind (screen goes pure white for opponent!)
            target.hitStun = 35;
            target.hp = Math.max(0, target.hp - 30);
            this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#ffffff');
          }
        }

        this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#ffffff');
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'Die you!!!', '#fef08a');
        return true;
      }
    }

    // Skill 3 - Arm Laser Cannon (Base) / Speed of Light Blitz (Pure Light Form) (Key O / SKILL 3)
    if (input.skill3 && f.cooldowns.skill3 <= 0) {
      if (hasNoArms && !isPureLight) {
        this.addTextParticle(f.x + f.width / 2, f.y - 40, 'whaa!!! (ARMS LOST 5s)', '#ef4444');
        soundManager.playDipezWhaa();
        f.cooldowns.skill3 = 20;
        return true;
      }
      if (f.energy >= 30 || isTraining || isPureLight) {
        if (isPureLight) {
          // Evolved Form Skill: Speed of Light Blitz (Photon Multi-Point Teleport Hit & Burn)
          f.action = 'dipez_light_speed_blitz';
          f.actionTimer = 75; // ~1.25s duration
          f.actionDuration = 75;
          f.cooldowns.skill3 = 90; // 1.5s CD
          soundManager.playDipezStarMaker();
          this.addTextParticle(f.x + f.width / 2, f.y - 40, '⚡ SPEED OF LIGHT BLITZ!!', '#fef08a');
          return true;
        }

        f.action = 'dipez_laser_cannon';
        f.actionTimer = 90; // 1.5 seconds laser duration
        f.actionDuration = 90;
        f.cooldowns.skill3 = 180;
        if (!isTraining) f.energy -= 40;

        const dir = f.facing === 'right' ? 1 : -1;
        soundManager.playDipezStarMaker();

        this.projectiles.push({
          id: this.projectileId++,
          ownerId: f.id,
          type: 'dipez_laser_beam',
          x: dir === 1 ? f.x + f.width : f.x - 450,
          y: f.y + 15,
          vx: 0,
          vy: 0,
          baseVx: 0,
          baseVy: 0,
          width: 450,
          height: 45,
          damage: 65,
          knockbackX: dir * 18,
          knockbackY: -5,
          hitStun: 50,
          isFrozenInTime: false,
          life: 90,
          maxLife: 90,
          color: '#38bdf8',
        });

        f.dipezArmLostTimer = 300; // 5 seconds drawback: Arms lost!
        this.addTextParticle(f.x + f.width / 2, f.y - 40, '⚡ ARM LASER CANNON!', '#38bdf8');
        return true;
      }
    }

    // Skill 4 - Evolution Gamble (Base Form) / Star Maker (Pure Light Form) (Key P / SKILL 4)
    if ((input.skill4 || input.ultimate) && f.cooldowns.skill4 <= 0) {
      if (!isPureLight) {
        f.cooldowns.skill4 = 180; // 3 seconds cooldown on fail
        const rollSuccess = Math.random() < 0.5; // 50% chance

        if (rollSuccess) {
          f.dipezForm = 'pure_light';
          f.action = 'dipez_evolution_startup';
          f.actionTimer = 120; // 2 seconds ascension cross pose
          f.actionDuration = 120;
          f.auraColor = 'gold';

          soundManager.playDipezEvolution();
          this.screenShake = 22;

          this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#ffffff');
          this.addTextParticle(
            f.x + f.width / 2,
            f.y - 50,
            'Finally, finally, my power has increased!!! GLOWING MAN!!',
            '#fef08a'
          );
        } else {
          if (!isTraining) f.energy = Math.max(0, f.energy - 20);
          soundManager.playDipezWhaa();
          this.addTextParticle(f.x + f.width / 2, f.y - 35, '❌ Evolution Failed... (50% Chance)', '#94a3b8');
        }
        return true;
      } else {
        // Evolved Form Skill 4: Star Maker (Apocalyptic White Burst + Continuous High Burn)
        if (f.energy >= 50 || isTraining) {
          f.action = 'dipez_star_maker';
          f.actionTimer = 180; // 3 seconds
          f.actionDuration = 180;
          f.cooldowns.skill4 = 300;
          if (!isTraining) f.energy -= 50;

          const arenaW = this.getArenaWidth();
          f.x = arenaW / 2 - f.width / 2;
          f.y = 180;
          f.vx = 0;
          f.vy = 0;

          f.dipezStarMakerActive = true;
          f.dipezStarMakerTimer = 180;
          f.dipezStarMakerFlash = 180; // 3 seconds arena super white flash

          soundManager.playDipezStarMaker();
          this.screenShake = 32;

          // Initial APOCALYPTIC STAR MAKER BURST DAMAGE to all enemies in arena!
          const targets = this.getAllActiveFighters().filter(t => t.id !== f.id && t.team !== f.team && t.hp > 0);
          for (const t of targets) {
            this.applyRawDamage(t, 140, (t.x > f.x ? 1 : -1) * 20, -14, f);
            t.burnedTimer = 300; // 5s burn
            t.hitStun = 60;
            this.addShockwave(t.x + t.width / 2, t.y + t.height / 2, '#ffffff');
          }

          this.addTextParticle(f.x + f.width / 2, f.y - 45, '🌟 STAR MAKER (HIGH DAMAGE WHITE BURST)! 🌟', '#ffffff');
          return true;
        }
      }
    }

    return false;
  }

  private executeValentineBasicRevolverShot(attacker: Fighter, target: Fighter) {
    const isStand = !!attacker.isStandActive;
    const damage = isStand ? VALENTINE_PISTOL_DAMAGE + 20 : VALENTINE_PISTOL_DAMAGE;
    const knockFwd = isStand ? 9 : 7;
    const knockUp = -2.5;
    const speed = 34;

    soundManager.playPucciGunshot();
    this.screenShake = Math.max(this.screenShake, isStand ? 4.5 : 3.5);

    const dir = attacker.facing === 'right' ? 1 : -1;
    // Exactly at the tip of the extended Presidential Revolver barrel (Arm reach 50px + Barrel 18px = 68px from body center)
    const muzzleOffset = 68;
    const muzzleX = attacker.x + attacker.width / 2 + dir * muzzleOffset;
    const muzzleY = attacker.y + 30;

    // Bullet Muzzle Spark & Gunpowder Smoke bursting forward from the gun's muzzle
    for (let s = 0; s < 6; s++) {
      this.addSpark(muzzleX + dir * (Math.random() * 8 + 2), muzzleY + (Math.random() * 6 - 3), '#facc15');
      this.addSpark(muzzleX + dir * (Math.random() * 12 + 4), muzzleY + (Math.random() * 6 - 3), '#ffffff');
    }

    const bulletWidth = 18;
    const bulletHeight = 8;
    // Position projectile so it starts cleanly from the gun's muzzle tip
    const spawnX = dir === 1 ? muzzleX : muzzleX - bulletWidth;
    const spawnY = muzzleY - bulletHeight / 2;

    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'pucci_bullet',
      subType: 'bullet',
      x: spawnX,
      y: spawnY,
      vx: dir * speed,
      vy: 0,
      baseVx: dir * speed,
      baseVy: 0,
      width: bulletWidth,
      height: bulletHeight,
      damage: damage,
      knockbackX: dir * knockFwd,
      knockbackY: knockUp,
      hitStun: 28,
      isFrozenInTime: false,
      life: 40,
      maxLife: 40,
      color: '#facc15',
      isParallelWorld: !!attacker.isParallelWorld
    });

    this.addTextParticle(muzzleX, attacker.y - 35, '🔫 BANG! REVOLVER SHOT!', '#fde047');
  }

  private executeValentineD4CPunch(attacker: Fighter, target: Fighter, hitNum: number) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const reach = hitNum === 1 ? 105 : 120;
    const damage = hitNum === 1 ? 38 : 52;
    const knockFwd = hitNum === 1 ? 4.5 : 8.5;
    const knockUp = hitNum === 1 ? 2.5 : 5.0;
    const hitStun = hitNum === 1 ? 20 : 28;

    const hitbox = this.createOrientedHitbox(attacker, reach, 65, damage, knockFwd, knockUp);
    hitbox.hitStun = hitStun;

    // Spawn oriented punch arm with D4C cyan theme
    this.spawnOrientedBarrageArm(attacker, reach, '#38bdf8', '#0284c7', false);

    soundManager.playHit(true);
    this.screenShake = Math.max(this.screenShake, hitNum === 1 ? 3.5 : 5.5);

    const punchX = attacker.x + (dir === 1 ? attacker.width + 30 : -40);
    const punchY = attacker.y + 15;
    this.addMenacingParticle(punchX, punchY, hitNum === 1 ? 'ド' : 'ドジャアアン', '#38bdf8');

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        
        // Impact Sparks & Shockwave
        const sparkCount = hitNum === 1 ? 7 : 12;
        for (let i = 0; i < sparkCount; i++) {
          this.addSpark(t.x + t.width / 2 + (Math.random() * 20 - 10), t.y + 20 + (Math.random() * 20 - 10), i % 2 === 0 ? '#38bdf8' : '#ffffff');
        }
        this.addShockwave(t.x + t.width / 2, t.y + 25, hitNum === 1 ? '#38bdf8' : '#0284c7');

        if (hitNum === 2) {
          this.addTextParticle(t.x + t.width / 2, t.y - 35, '💥 D4C COMBO FINISH!', '#38bdf8');
        }
      }
    }
  }

  private executeGappyBubblePlunder(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'gappy_plunder_bubble',
      x: attacker.x + (dir === 1 ? attacker.width : -32),
      y: attacker.y + 10,
      vx: dir * 9,
      vy: 2.5,
      baseVx: dir * 9,
      baseVy: 2.5,
      width: 32,
      height: 32,
      damage: 15,
      knockbackX: dir * 4,
      knockbackY: -2,
      isFrozenInTime: false,
      life: 45,
      maxLife: 45,
      color: '#38bdf8',
    });
    soundManager.playBubblePop();
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 40, '🧼 BUBBLE PLUNDER LAUNCHED!', '#38bdf8');
  }

  private executeGappyShaveMoisture(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'gappy_shave_bubble',
      x: attacker.x + (dir === 1 ? attacker.width : -38),
      y: attacker.y + 8,
      vx: dir * 14,
      vy: 0,
      baseVx: dir * 14,
      baseVy: 0,
      width: 38,
      height: 38,
      damage: GAPPY_SHAVE_MOISTURE_DAMAGE,
      knockbackX: dir * 6,
      knockbackY: -3,
      isFrozenInTime: false,
      life: 55,
      maxLife: 55,
      color: '#0284c7',
    });
    soundManager.playBubblePlunder();
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 40, '✂️ SHAVE BUBBLE SHOT!', '#0284c7');
  }

  private executeGappyBubbleBarrageHit(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const reach = 110;
    this.spawnOrientedBarrageArm(attacker, reach, '#38bdf8', '#7dd3fc', false);
    
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'gappy_barrage_bubble',
      x: attacker.x + (dir === 1 ? attacker.width + 5 : -28),
      y: attacker.y + 5 + Math.random() * 30,
      vx: dir * (14 + Math.random() * 4),
      vy: (Math.random() - 0.5) * 3,
      baseVx: dir * 14,
      baseVy: 0,
      width: 24,
      height: 24,
      damage: GAPPY_BUBBLE_BARRAGE_DAMAGE_PER_HIT,
      knockbackX: dir * 1.5,
      knockbackY: -0.5,
      isFrozenInTime: false,
      life: 28,
      maxLife: 28,
      color: '#38bdf8',
    });
    soundManager.playBubblePop();
  }

  private executeGappyBubbleBarrageFinisher(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'gappy_barrage_bubble',
      x: attacker.x + (dir === 1 ? attacker.width + 10 : -44),
      y: attacker.y + 10,
      vx: dir * 18,
      vy: 0,
      baseVx: dir * 18,
      baseVy: 0,
      width: 46,
      height: 46,
      damage: GAPPY_BUBBLE_BARRAGE_BURST_DAMAGE,
      knockbackX: dir * 14,
      knockbackY: -6,
      isFrozenInTime: false,
      life: 35,
      maxLife: 35,
      color: '#7dd3fc',
    });
    this.addShockwave(attacker.x + attacker.width / 2 + dir * 60, attacker.y + 30, '#38bdf8');
    this.screenShake = Math.max(this.screenShake, 5);
    soundManager.playBubblePop();
  }

  private executeGappyBubbleTrap(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'gappy_trap_bubble',
      x: attacker.x + (dir === 1 ? attacker.width : -42),
      y: attacker.y + 5,
      vx: dir * 10,
      vy: 0,
      baseVx: dir * 10,
      baseVy: 0,
      width: 44,
      height: 44,
      damage: 20,
      knockbackX: dir * 2,
      knockbackY: -4,
      isFrozenInTime: false,
      life: 65,
      maxLife: 65,
      color: '#7dd3fc',
    });
    soundManager.playBubblePop();
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 40, '🫧 BUBBLE TRAP SHOT!', '#7dd3fc');
  }

  private executeGappyGoBeyond(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const launchX = attacker.x + attacker.width / 2 + dir * 40;
    const launchY = attacker.y + 20;

    attacker.gappyGoBeyondPhase = 'launch';
    attacker.gappyGoBeyondX = launchX;
    attacker.gappyGoBeyondY = launchY;

    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'gappy_go_beyond',
      x: launchX,
      y: launchY,
      vx: dir * 26,
      vy: 0,
      baseVx: dir * 26,
      baseVy: 0,
      width: 48,
      height: 48,
      damage: GAPPY_GO_BEYOND_TRUE_DAMAGE,
      knockbackX: dir * 20,
      knockbackY: -10,
      isFrozenInTime: false,
      life: 75,
      maxLife: 75,
      color: '#ffffff',
    });

    soundManager.playGoBeyondLaunch();
    this.screenShake = 14;
    this.universeResetFlash = 16;
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 55, '🌌 ★ GO BEYOND: SPINNING BUBBLE LAUNCHED! ★', '#38bdf8');
  }

  // --- PUCCI EXECUTION METHODS ---
  private executePucciBasicPistolShot(attacker: Fighter, target: Fighter) {
    const isStand = !!attacker.isStandActive;
    const damage = isStand ? PUNCH_STAND_DAMAGE : PUNCH_DAMAGE;
    const knockFwd = isStand ? 8 : 6;
    const knockUp = isStand ? -2.5 : -2;
    const speed = 32;

    soundManager.playPucciGunshot();
    this.screenShake = Math.max(this.screenShake, isStand ? 4 : 3);

    const axis = this.activeGravityAxis || 'down';
    let spawnX = attacker.x;
    let spawnY = attacker.y + 25;
    let vx = (attacker.facing === 'right' ? 1 : -1) * speed;
    let vy = 0;
    let pWidth = 18;
    let pHeight = 8;
    let kbX = (attacker.facing === 'right' ? 1 : -1) * knockFwd;
    let kbY = knockUp;

    if (axis === 'down' || axis === 'up') {
      const dir = attacker.facing === 'right' ? 1 : -1;
      const forwardOffset = isStand ? 35 : 18;
      spawnX = attacker.x + attacker.width / 2 + dir * forwardOffset;
      spawnY = attacker.y + 28;
      vx = dir * speed;
      vy = 0;
      pWidth = 18;
      pHeight = 8;
      kbX = dir * knockFwd;
      kbY = axis === 'up' ? -knockUp : knockUp;
    } else if (axis === 'right') {
      const isUp = attacker.facing === 'right';
      const forwardOffset = isStand ? 35 : 18;
      spawnX = attacker.x - 15;
      spawnY = attacker.y + (isUp ? -forwardOffset : attacker.height + forwardOffset);
      vx = -5;
      vy = (isUp ? -1 : 1) * speed;
      pWidth = 8;
      pHeight = 18;
      kbX = -5;
      kbY = (isUp ? -1 : 1) * knockFwd;
    } else if (axis === 'left') {
      const isUp = attacker.facing === 'left';
      const forwardOffset = isStand ? 35 : 18;
      spawnX = attacker.x + attacker.width + 15;
      spawnY = attacker.y + (isUp ? -forwardOffset : attacker.height + forwardOffset);
      vx = 5;
      vy = (isUp ? -1 : 1) * speed;
      pWidth = 8;
      pHeight = 18;
      kbX = 5;
      kbY = (isUp ? -1 : 1) * knockFwd;
    }

    this.addSpark(spawnX, spawnY, isStand ? '#facc15' : '#ffffff');
    this.addSpark(spawnX, spawnY, '#fbbf24');

    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'pucci_bullet',
      x: spawnX - pWidth / 2,
      y: spawnY - pHeight / 2,
      vx: vx,
      vy: vy,
      baseVx: vx,
      baseVy: vy,
      width: pWidth,
      height: pHeight,
      damage: damage,
      knockbackX: kbX,
      knockbackY: kbY,
      isFrozenInTime: false,
      life: 90,
      maxLife: 90,
      color: isStand ? '#facc15' : '#e2e8f0',
    });
  }

  private executePucciPistol(attacker: Fighter, target: Fighter) {
    const isStand = !!attacker.isStandActive;
    const speed = 32;

    soundManager.playPucciGunshot();
    this.screenShake = 5;

    const axis = this.activeGravityAxis || 'down';
    let spawnX = attacker.x;
    let spawnY = attacker.y + 25;
    let vx = (attacker.facing === 'right' ? 1 : -1) * speed;
    let vy = 0;
    let pWidth = 20;
    let pHeight = 8;
    let kbX = (attacker.facing === 'right' ? 1 : -1) * 8;
    let kbY = -2;

    if (axis === 'down' || axis === 'up') {
      const dir = attacker.facing === 'right' ? 1 : -1;
      const forwardOffset = isStand ? 35 : 20;
      spawnX = attacker.x + attacker.width / 2 + dir * forwardOffset;
      spawnY = attacker.y + 28;
      vx = dir * speed;
      vy = 0;
      pWidth = 20;
      pHeight = 8;
      kbX = dir * 8;
      kbY = axis === 'up' ? 2 : -2;
    } else if (axis === 'right') {
      const isUp = attacker.facing === 'right';
      const forwardOffset = isStand ? 35 : 20;
      spawnX = attacker.x - 15;
      spawnY = attacker.y + (isUp ? -forwardOffset : attacker.height + forwardOffset);
      vx = -5;
      vy = (isUp ? -1 : 1) * speed;
      pWidth = 8;
      pHeight = 20;
      kbX = -5;
      kbY = (isUp ? -1 : 1) * 8;
    } else if (axis === 'left') {
      const isUp = attacker.facing === 'left';
      const forwardOffset = isStand ? 35 : 20;
      spawnX = attacker.x + attacker.width + 15;
      spawnY = attacker.y + (isUp ? -forwardOffset : attacker.height + forwardOffset);
      vx = 5;
      vy = (isUp ? -1 : 1) * speed;
      pWidth = 8;
      pHeight = 20;
      kbX = 5;
      kbY = (isUp ? -1 : 1) * 8;
    }

    this.addSpark(spawnX, spawnY, '#fbbf24');
    this.addSpark(spawnX, spawnY, '#ffffff');

    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'pucci_bullet',
      x: spawnX - pWidth / 2,
      y: spawnY - pHeight / 2,
      vx: vx,
      vy: vy,
      baseVx: vx,
      baseVy: vy,
      width: pWidth,
      height: pHeight,
      damage: PUCCI_PISTOL_DAMAGE,
      knockbackX: kbX,
      knockbackY: kbY,
      isFrozenInTime: false,
      life: 90,
      maxLife: 90,
      color: '#e2e8f0',
    });
  }

  private executePucciMemoryDisc(attacker: Fighter, target: Fighter) {
    const reach = 135;
    const hitbox = this.createOrientedHitbox(attacker, reach, 70, PUCCI_MEMORY_DISC_DAMAGE, 14, 5, {
      hitStun: 45,
    });
    this.screenShake = 8;
    soundManager.playPucciDisc();
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#c084fc');
    
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        // Force all opponent skill cooldowns to maximum
        t.cooldowns.skill1 = 180;
        t.cooldowns.skill2 = 180;
        t.cooldowns.skill3 = 180;
        t.cooldowns.skill4 = 180;
        t.cooldowns.skill5 = 180;
        t.silencedTimer = 90;
        this.addTextParticle(t.x + t.width / 2, t.y - 50, '💿 MEMORY DISC STOLEN! ALL SKILLS COOLDOWN!', '#c084fc');
      }
    }
  }

  private executePucciAcidMelt(attacker: Fighter, target: Fighter) {
    const poolX = attacker.x + (attacker.facing === 'right' ? 80 : -140);
    if (!this.acidPools) this.acidPools = [];
    this.acidPools.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      x: poolX,
      y: GROUND_Y - 14,
      width: 140,
      height: 20,
      damagePerTick: PUCCI_ACID_DAMAGE_PER_TICK,
      duration: PUCCI_ACID_DURATION,
      color: '#a855f7',
    });
    this.addShockwave(poolX + 70, GROUND_Y - 10, '#a855f7');
  }

  private executePucciStandDisc(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'pucci_disc',
      x: dir === 1 ? attacker.x + attacker.width : attacker.x - 30,
      y: attacker.y + 25,
      vx: dir * 18,
      vy: 0,
      baseVx: dir * 18,
      baseVy: 0,
      width: 28,
      height: 28,
      damage: PUCCI_STAND_DISC_DAMAGE,
      knockbackX: 0,
      knockbackY: 0,
      isFrozenInTime: false,
      life: 100,
      maxLife: 100,
      color: '#e2e8f0',
    });
    soundManager.playPucciDisc();
  }

  private handlePucciChantFrame(f: Fighter) {
    const WORDS_14 = [
      'Spiral Staircase (らせん階段)',
      'Rhinoceros Beetle (カブト虫)',
      'Desolation Row (廃墟の街)',
      'Fig Tart (イチジクのタルト)',
      'Rhinoceros Beetle (カブト虫)',
      'Via Dolorosa (ドロローサへの道)',
      'Rhinoceros Beetle (カブト虫)',
      'Singularity Point (特異点)',
      'Giotto (ジョット)',
      'Angel (天使)',
      'Hydrangea (紫陽花)',
      'Rhinoceros Beetle (カブト虫)',
      'Singularity Point (特異点)',
      'Secret Emperor (秘密の皇帝) ✨'
    ];

    const currentStep = Math.floor((252 - f.actionTimer) / 18) + 1;
    if (currentStep > (f.pucciChantStep || 0) && currentStep <= 14) {
      f.pucciChantStep = currentStep;
      const word = WORDS_14[currentStep - 1];
      soundManager.playPucciChant();
      this.addTextParticle(f.x + f.width / 2, f.y - 45 - ((currentStep % 2) * 15), `📿 [${currentStep}/14] ${word}`, '#c084fc');
      this.addMenacingParticle(f.x + (Math.random() * 60 - 30), f.y - 20, '★', '#c084fc');
      this.addSpark(f.x + f.width / 2, f.y + f.height / 2, '#c084fc');
    }

    if (f.actionTimer <= 2 && (f.pucciChantStep || 0) >= 14) {
      this.evolvePucciToCmoon(f);
    }
  }

  private evolvePucciToCmoon(f: Fighter) {
    f.pucciForm = 'cmoon';
    f.standName = 'C-Moon';
    f.color = '#10b981';
    f.cmoonGauge = 0;
    soundManager.playPucciEvolution();
    this.screenShake = 20;
    this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#10b981');
    this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#34d399');
    this.addTextParticle(f.x + f.width / 2, f.y - 65, '🌕 [EVOLUTION: C-MOON AWAKENED!]', '#34d399');
    this.addTextParticle(f.x + f.width / 2, f.y - 35, '🌌 GRAVITATIONAL SHIFT UNLOCKED!', '#10b981');
  }

  private executeCmoonGravityShift(attacker: Fighter) {
    // Cycles activeGravityAxis: down -> right -> up -> left -> down
    const nextAxisMap: Record<string, 'down' | 'up' | 'left' | 'right'> = {
      down: 'right',
      right: 'up',
      up: 'left',
      left: 'down',
    };
    const prevAxis = this.activeGravityAxis || 'down';
    this.activeGravityAxis = nextAxisMap[prevAxis] || 'down';
    this.screenShake = 22;
    soundManager.playCmoonGravity();

    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#10b981');
    this.addShockwave(this.getArenaWidth() / 2, 260, '#34d399');

    // Pucci gains Singularity focus (+15 gauge)
    if (attacker.cmoonGauge !== undefined) {
      attacker.cmoonGauge = Math.min(100, attacker.cmoonGauge + 15);
    }

    // Fling all opponents along the new gravity axis vector with gravity slam armed
    const candidates = [
      this.player,
      this.ai,
      ...(this.teammate ? [this.teammate] : []),
      ...this.vampires,
    ];

    for (const f of candidates) {
      if (f.id !== attacker.id && f.hp > 0) {
        f.isGrounded = false;
        f.gravitySlamArmed = true;
        f.hitStun = Math.max(f.hitStun || 0, 25);
        if (this.activeGravityAxis === 'right') {
          f.vx = 22;
          f.vy = -6;
        } else if (this.activeGravityAxis === 'left') {
          f.vx = -22;
          f.vy = -6;
        } else if (this.activeGravityAxis === 'up') {
          f.vy = -24;
        } else {
          f.vy = 20;
        }
      }
    }

    for (let i = 0; i < 12; i++) {
      this.addSpark(cx + (Math.random() - 0.5) * 120, cy + (Math.random() - 0.5) * 120, '#10b981');
    }
    this.addMenacingParticle(cx, cy - 60, 'ゴ', '#10b981');
    this.addMenacingParticle(cx + 40, cy - 80, 'ゴ', '#34d399');
    this.addTextParticle(this.getArenaWidth() / 2, 140, `🌌 C-MOON GRAVITATIONAL SHIFT: ${this.activeGravityAxis.toUpperCase()}!`, '#34d399');
  }

  private executeCmoonInversionPunch(attacker: Fighter, target: Fighter) {
    const reach = 140;
    const hitbox = this.createOrientedHitbox(attacker, reach, 75, CMOON_INVERSION_PUNCH_DAMAGE, 24, 12, {
      hitStun: 55,
      yOffset: 5,
    });

    this.screenShake = 18;
    soundManager.playCmoonInversion();
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#10b981');
    this.addTextParticle(cx, attacker.y - 45, '🌀 SURFACE INVERSION STRIKE!', '#10b981');

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        // Inversion effect: reverse and multiply target's velocity violently
        t.vx = -t.vx * 1.8;
        t.vy = -t.vy * 1.8;
        t.action = 'knockback';
        for (let i = 0; i < 8; i++) {
          this.addSpark(t.x + t.width / 2, t.y + t.height / 2, '#34d399');
        }
      }
    }
  }

  private executeCmoonDebrisLaunch(attacker: Fighter, target: Fighter) {
    const axis = this.activeGravityAxis || 'down';
    const dir = attacker.facing === 'right' ? 1 : -1;

    for (let d = 0; d < 3; d++) {
      let spawnX = attacker.x + (dir === 1 ? attacker.width + d * 20 : -30 - d * 20);
      let spawnY = attacker.y + 15 + d * 15;
      let vx = dir * (20 + d * 3);
      let vy = -4 + d * 3;

      if (axis === 'right') {
        const isUp = attacker.facing === 'right';
        spawnX = attacker.x - 20;
        spawnY = attacker.y + (isUp ? -30 - d * 20 : attacker.height + d * 20);
        vx = -8;
        vy = (isUp ? -1 : 1) * (20 + d * 3);
      } else if (axis === 'left') {
        const isUp = attacker.facing === 'left';
        spawnX = attacker.x + attacker.width + 10;
        spawnY = attacker.y + (isUp ? -30 - d * 20 : attacker.height + d * 20);
        vx = 8;
        vy = (isUp ? -1 : 1) * (20 + d * 3);
      } else if (axis === 'up') {
        spawnY = attacker.y + 10;
        vy = 4 - d * 3;
      }

      this.projectiles.push({
        id: this.projectileId++,
        ownerId: attacker.id,
        type: 'cmoon_debris',
        x: spawnX,
        y: spawnY,
        vx: vx,
        vy: vy,
        baseVx: vx,
        baseVy: vy,
        width: 34,
        height: 30,
        damage: Math.round(CMOON_DEBRIS_DAMAGE / 3),
        knockbackX: dir * 12,
        knockbackY: -6,
        isFrozenInTime: false,
        life: 85,
        maxLife: 85,
        color: '#6ee7b7',
      });
    }
    soundManager.playCmoonGravity();
    this.screenShake = 10;
  }

  private handlePucciMiHEvolutionFrame(f: Fighter) {
    this.screenShake = Math.max(this.screenShake, 10);
    if (this.frameCount % 5 === 0) {
      this.addSpark(f.x + f.width / 2 + (Math.random() * 80 - 40), f.y + f.height / 2 + (Math.random() * 80 - 40), '#facc15');
      this.addMenacingParticle(f.x + (Math.random() * 80 - 40), f.y - 30, '★', '#facc15');
    }
    // Ascending celestial levitation afterimages
    if (!f.afterimages) f.afterimages = [];
    if (this.frameCount % 3 === 0) {
      f.afterimages.push({
        x: f.x,
        y: f.y,
        alpha: 0.8,
        facing: f.facing,
        charId: 'pucci',
        color: 'rgba(250, 204, 21, 0.75)'
      });
    }
    if (f.actionTimer === 10) {
      this.evolvePucciToMiH(f);
    }
  }

  private evolvePucciToMiH(f: Fighter) {
    f.pucciForm = 'made_in_heaven';
    f.standName = 'Made in Heaven';
    f.color = '#facc15';
    this.activeGravityAxis = 'down';
    soundManager.playMiHAcceleration();
    this.screenShake = 24;
    this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#facc15');
    this.addShockwave(f.x + f.width / 2, f.y + f.height / 2, '#ffffff');
    this.addTextParticle(f.x + f.width / 2, f.y - 65, '👑 ★ MADE IN HEAVEN: FINAL EVOLUTION! ★ 👑', '#facc15');
    this.addTextParticle(f.x + f.width / 2, f.y - 35, '⚡ INFINITE SPEED ACCELERATION UNLOCKED!', '#ffffff');

    // Burst afterimages celebrating the ascension to Made in Heaven
    if (!f.afterimages) f.afterimages = [];
    for (let b = 0; b < 3; b++) {
      f.afterimages.push({
        x: f.x + (b - 1) * 16,
        y: f.y,
        alpha: 0.9 - b * 0.2,
        facing: f.facing,
        charId: 'pucci',
        color: b === 1 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(250, 204, 21, 0.8)'
      });
    }
  }

  private executeMihSpeedBlitzHit(attacker: Fighter, target: Fighter, count: number) {
    soundManager.playMiHBlitz();
    const reach = 120;
    this.spawnOrientedBarrageArm(attacker, reach, '#facc15', '#ffffff', true);

    const hitbox = this.createOrientedHitbox(attacker, reach, 75, MIH_SPEED_BLITZ_DAMAGE_PER_HIT, 2.5, 1, {
      isBarrage: true,
      yOffset: 10,
    });
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeMihKnifeThrow(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    for (let k = 0; k < 5; k++) {
      this.projectiles.push({
        id: this.projectileId++,
        ownerId: attacker.id,
        type: 'mih_knife',
        x: dir === 1 ? attacker.x + attacker.width + k * 10 : attacker.x - 30 - k * 10,
        y: attacker.y + 10 + k * 12,
        vx: dir * (36 + k * 2),
        vy: (k - 2) * 1.5,
        baseVx: dir * (36 + k * 2),
        baseVy: (k - 2) * 1.5,
        width: 32,
        height: 10,
        damage: MIH_KNIFE_DAMAGE / 5,
        knockbackX: dir * 8,
        knockbackY: -2,
        isFrozenInTime: false,
        life: 70,
        maxLife: 70,
        color: '#facc15',
      });
    }
    soundManager.playMiHKnife();
    this.screenShake = 6;
  }

  private executeMihTeleportStrike(attacker: Fighter, target: Fighter) {
    const origX = attacker.x;
    const origY = attacker.y;

    const dir = target.facing === 'right' ? -1 : 1;
    attacker.x = Math.max(40, Math.min(this.getArenaWidth() - 80, target.x + (dir * 70)));
    attacker.y = target.y;

    // Leave speed blitz displacement afterimages along the teleport trajectory
    if (!attacker.afterimages) attacker.afterimages = [];
    attacker.afterimages.push({
      x: origX,
      y: origY,
      alpha: 0.9,
      facing: attacker.facing,
      charId: 'pucci',
      color: 'rgba(250, 204, 21, 0.85)'
    });
    attacker.afterimages.push({
      x: (origX + attacker.x) * 0.5,
      y: (origY + attacker.y) * 0.5,
      alpha: 0.75,
      facing: attacker.facing,
      charId: 'pucci',
      color: 'rgba(255, 255, 255, 0.8)'
    });

    soundManager.playMiHBlitz();
    this.screenShake = 12;
    this.addShockwave(attacker.x + attacker.width / 2, attacker.y + attacker.height / 2, '#facc15');

    const hitbox = this.createOrientedHitbox(attacker, 110, 70, MIH_TELEPORT_DAMAGE, 20, 8, {
      hitStun: 45,
      yOffset: 10,
    });
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private handlePucciUniverseResetFrame(attacker: Fighter, target: Fighter) {
    this.screenShake = Math.max(this.screenShake, 18);
    if (this.frameCount % 3 === 0) {
      this.addMenacingParticle(Math.random() * this.getArenaWidth(), Math.random() * 400 + 40, '⏱️', '#facc15');
      this.addSpark(Math.random() * this.getArenaWidth(), Math.random() * 400 + 40, '#ffffff');
    }
    if (attacker.actionTimer === 10) {
      soundManager.playUniverseReset();
      this.screenShake = 30;
      const candidateFighters = [target, ...(this.teammate ? [this.teammate] : []), ...this.vampires];
      for (const t of candidateFighters) {
        if (t && t.hp > 0 && t.id !== attacker.id && t.team !== attacker.team) {
          this.applyRawDamage(t, MIH_UNIVERSE_RESET_DAMAGE, (t.x > attacker.x ? 1 : -1) * 26, -18, attacker);
          t.hitStun = 90;
          t.isGrounded = false;
          this.addShockwave(t.x + t.width / 2, t.y + t.height / 2, '#facc15');
        }
      }
      this.addTextParticle(this.getArenaWidth() / 2, 180, '🌌 ★ UNIVERSE RESET: SINGULARITY REACHED! ★ 🌌', '#facc15');
    }
  }

  private executeDipezLightSpeedBlitzFrame(f: Fighter, opponent: Fighter) {
    if (f.actionTimer > 0) {
      const origX = f.x;
      const origY = f.y;

      const arenaW = this.getArenaWidth();
      const arenaH = 540;

      // Only reposition, play sounds, spawn particles, and check damage every 3 frames to prevent browser/rendering lag!
      if (f.actionTimer % 3 === 0) {
        let targetX: number;
        let targetY: number;

        const hitStep = Math.floor((75 - f.actionTimer) / 3);
        if (hitStep % 2 === 0 && opponent && opponent.hp > 0) {
          // Dash around opponent from various surrounding angles
          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 90;
          targetX = Math.max(60, Math.min(arenaW - 100, opponent.x + Math.cos(angle) * dist));
          targetY = Math.max(120, Math.min(arenaH - 140, opponent.y + Math.sin(angle) * dist));
        } else {
          // Flash to extreme arena bounds to create multi-point screen illusion
          targetX = 60 + Math.random() * (arenaW - 120);
          targetY = 100 + Math.random() * 280;
        }

        f.x = targetX;
        f.y = targetY;
        f.facing = f.x < origX ? 'left' : 'right';

        // Push glowing afterimages (reduced from 3 to 2 for optimized stickman model drawing)
        if (!f.afterimages) f.afterimages = [];
        f.afterimages.push({
          x: origX,
          y: origY,
          alpha: 0.85,
          facing: f.facing,
          charId: 'dipez',
          color: '#ffffff'
        });
        f.afterimages.push({
          x: (origX + targetX) * 0.5,
          y: (origY + targetY) * 0.5,
          alpha: 0.70,
          facing: f.facing,
          charId: 'dipez',
          color: '#fef08a'
        });

        // Sound, Screen Shake & Particles
        soundManager.playMiHBlitz();
        this.screenShake = Math.max(this.screenShake, 8);
        this.addShockwave((origX + targetX) * 0.5, (origY + targetY) * 0.5, '#fef08a');
        this.addSpark(targetX + f.width / 2, targetY + f.height / 2, '#ffffff');

        // Check damage & burn hits on targets hit along or near the light speed path
        const targets = this.getTargetsForAttacker(f, opponent);
        for (const t of targets) {
          if (!t || t.hp <= 0 || t.id === f.id) continue;
          
          const distToTarget = Math.hypot((t.x + t.width / 2) - (targetX + f.width / 2), (t.y + t.height / 2) - (targetY + f.height / 2));
          if (distToTarget < 190) {
            const knockDir = targetX > origX ? 1 : -1;
            // Balanced damage: 7 damage per hit over 25 potential hits (total possible damage: ~175, but usually ~80-120 since target is moving)
            this.applyRawDamage(t, 7, knockDir * 12, -5, f);
            t.hitStun = 15;
            t.action = 'hit';
            
            // Apply Burn Status (Damage Terbakar!)
            t.burnedTimer = Math.max(t.burnedTimer || 0, 120); // 2 seconds burning duration
            
            if (Math.random() < 0.3) {
              this.addMenacingParticle(t.x + Math.random() * t.width, t.y + Math.random() * t.height, '🔥', '#f97316');
            }
            if (Math.random() < 0.15) {
              this.addTextParticle(t.x + t.width / 2, t.y - 35, '⚡ LIGHT BLITZ!', '#fef08a');
            }
          }
        }
      }
    }
  }

  private updateAcidPools() {
    if (!this.acidPools || this.acidPools.length === 0) return;
    for (let i = this.acidPools.length - 1; i >= 0; i--) {
      const pool = this.acidPools[i];
      pool.duration--;
      if (pool.duration <= 0) {
        this.acidPools.splice(i, 1);
        continue;
      }

      // Check all fighters standing inside acid pool
      const fighters = [this.player, this.ai, ...(this.teammate ? [this.teammate] : []), ...this.vampires];
      for (const f of fighters) {
        if (f && f.hp > 0 && f.id !== pool.ownerId && f.isGrounded) {
          const fCenter = f.x + f.width / 2;
          if (fCenter >= pool.x && fCenter <= pool.x + pool.width) {
            // Slow down movement
            f.vx *= 0.65;
            if (this.frameCount % 20 === 0) {
              f.hp = Math.max(0, f.hp - pool.damagePerTick);
              this.addSpark(f.x + f.width / 2, GROUND_Y - 10, pool.color);
              this.addTextParticle(f.x + f.width / 2, f.y - 25, '🧪 ACID MELT', '#a855f7');
            }
          }
        }
      }
    }
  }

  // --- HITBOX & COMBAT LOGIC ---
  private executePunch(attacker: Fighter, target: Fighter) {
    if (attacker.charId === 'pucci') {
      this.executePucciBasicPistolShot(attacker, target);
      return;
    }

    if (attacker.charId === 'funny_valentine') {
      this.executeValentineBasicRevolverShot(attacker, target);
      return;
    }

    if (attacker.charId === 'jonathan' && attacker.isSwordEquipped) {
      soundManager.playSwordSlash();
      const swordReach = 120;
      const hitbox = this.createOrientedHitbox(attacker, swordReach, 65, 110, 9, 4);
      this.spawnOrientedBarrageArm(attacker, swordReach, '#f8fafc', '#38bdf8', true);
      const targets = this.getTargetsForAttacker(attacker, target);
      for (const t of targets) {
        if (this.checkCollision(hitbox, t)) {
          this.applyHit(attacker, t, hitbox);
        }
      }
      return;
    }

    const reach = attacker.isStandActive ? 105 : 75;
    const damage = attacker.isStandActive ? PUNCH_STAND_DAMAGE : PUNCH_DAMAGE;
    const knockFwd = attacker.isStandActive ? 9 : 6;
    const knockUp = attacker.isStandActive ? 5 : 3;
    const hitbox = this.createOrientedHitbox(attacker, reach, 60, damage, knockFwd, knockUp);

    // Spawn Punch Menacing Particle
    const dir = attacker.facing === 'right' ? 1 : -1;
    const punchX = attacker.x + (dir === 1 ? attacker.width + 15 : -25);
    const punchY = attacker.y + 10;
    const punchGlyph = attacker.charId === 'jotaro' ? (Math.random() < 0.5 ? 'オラ' : 'ゴ')
      : attacker.charId === 'dio' ? (Math.random() < 0.5 ? '無駄' : 'ゴ')
      : attacker.charId === 'crazy_diamond' ? (Math.random() < 0.5 ? 'ドラ' : 'ゴ')
      : attacker.charId === 'gappy' ? (Math.random() < 0.5 ? 'オラ' : 'ゴ')
      : attacker.charId === 'king_crimson' ? (Math.random() < 0.5 ? 'ドゴ' : 'ゴ')
      : attacker.charId === 'silver_chariot' ? '⚔️'
      : 'ド';
    const punchColor = attacker.charId === 'dio' ? 'rgba(250, 204, 21, 0.95)'
      : attacker.charId === 'gappy' ? 'rgba(56, 189, 248, 0.95)'
      : attacker.charId === 'king_crimson' ? 'rgba(251, 113, 133, 0.95)'
      : 'rgba(239, 68, 68, 0.95)';
    this.addMenacingParticle(punchX, punchY, punchGlyph, punchColor);

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        if (attacker.charId === 'gappy' && Math.random() < GAPPY_PLUNDER_CHANCE) {
          const roll = Math.random();
          soundManager.playBubblePlunder();
          if (roll < 0.34) {
            t.gappyFrictionTheftTimer = GAPPY_PLUNDER_EFFECT_DURATION;
            this.addTextParticle(t.x + t.width / 2, t.y - 45, '🧼 PLUNDER: FRICTION THEFT!', '#38bdf8');
          } else if (roll < 0.67) {
            t.gappySightTheftTimer = GAPPY_PLUNDER_EFFECT_DURATION;
            this.addTextParticle(t.x + t.width / 2, t.y - 45, '👁️ PLUNDER: SIGHT THEFT!', '#0f172a');
          } else {
            t.gappySoundTheftTimer = GAPPY_PLUNDER_EFFECT_DURATION;
            this.addTextParticle(t.x + t.width / 2, t.y - 45, '🔇 PLUNDER: SOUND THEFT!', '#64748b');
          }
          for (let b = 0; b < 8; b++) {
            this.addSpark(t.x + t.width / 2 + (Math.random() * 40 - 20), t.y + t.height / 2 + (Math.random() * 40 - 20), '#7dd3fc');
          }
        }
      }
    }
  }

  private executeVampireDrainBite(attacker: Fighter, target: Fighter) {
    const reach = 110;
    const hitbox = this.createOrientedHitbox(attacker, reach, 60, 35, 4, 2);

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        soundManager.playRazorCut();
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 40);
        this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 30, '🩸 VAMPIRIC DRAIN! (+40 HP)', '#ef4444');
        this.addShockwave(t.x + t.width / 2, t.y + t.height / 2, '#dc2626');
        for (let i = 0; i < 6; i++) {
          this.addSpark(t.x + t.width / 2, t.y + t.height / 2, '#7f1d1d');
        }
      }
    }
  }

  private executeSpaceRipperSmall(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'space_ripper',
      subType: 'vampire_beam',
      x: dir === 1 ? attacker.x + attacker.width + 10 : attacker.x - 60,
      y: attacker.y + 25,
      vx: dir * 32,
      vy: 0,
      baseVx: dir * 32,
      baseVy: 0,
      width: 60,
      height: 18,
      damage: 45,
      knockbackX: dir * 12,
      knockbackY: -4,
      isFrozenInTime: false,
      life: 50,
      maxLife: 50,
      color: '#ef4444',
    });
    soundManager.playRazorCut();
  }

  private executeBarrageHit(attacker: Fighter, target: Fighter) {
    const isSilverChariot = attacker.charId === 'silver_chariot';
    const reach = attacker.isStandActive ? (isSilverChariot ? 95 : 85) : (isSilverChariot ? 80 : 70);

    if (isSilverChariot) {
      soundManager.playRapierThrust();
      this.spawnOrientedBarrageArm(
        attacker,
        reach,
        '#f1f5f9',
        '#38bdf8',
        true
      );
    } else {
      this.spawnOrientedBarrageArm(
        attacker,
        reach,
        attacker.isStandActive ? attacker.standColor : attacker.color,
        attacker.isStandActive ? '#facc15' : '#ffffff',
        false
      );
    }

    const damage = attacker.isStandActive ? BARRAGE_STAND_DAMAGE_PER_HIT : BARRAGE_DAMAGE_PER_HIT;
    const hitbox = this.createOrientedHitbox(attacker, reach, 55, damage, 1.8, 0.8, {
      isBarrage: true,
    });

    // Spawn Barrage Menacing / Shout Particles
    if (this.frameCount % 2 === 0) {
      const dir = attacker.facing === 'right' ? 1 : -1;
      const armX = attacker.x + (dir === 1 ? attacker.width + Math.random() * reach : -Math.random() * reach);
      const armY = attacker.y + Math.random() * 40 - 10;
      const bGlyph = attacker.charId === 'jotaro' ? (Math.random() < 0.7 ? 'オラ' : 'ゴ')
        : attacker.charId === 'dio' ? (Math.random() < 0.7 ? '無駄' : 'ゴ')
        : attacker.charId === 'crazy_diamond' ? (Math.random() < 0.7 ? 'ドラ' : 'ゴ')
        : attacker.charId === 'gappy' ? (Math.random() < 0.7 ? 'オラ' : 'ゴ')
        : attacker.charId === 'king_crimson' ? (Math.random() < 0.7 ? 'ドゴ' : 'ゴ')
        : attacker.charId === 'silver_chariot' ? (Math.random() < 0.7 ? '⚔️' : 'ゴ')
        : 'ゴ';
      const bColor = attacker.charId === 'dio' ? 'rgba(250, 204, 21, 0.95)'
        : attacker.charId === 'gappy' ? 'rgba(56, 189, 248, 0.95)'
        : attacker.charId === 'king_crimson' ? 'rgba(251, 113, 133, 0.95)'
        : 'rgba(192, 132, 252, 0.95)';
      this.addMenacingParticle(armX, armY, bGlyph, bColor);
    }

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeStarFinger(attacker: Fighter, target: Fighter) {
    const reach = STAR_FINGER_RANGE;
    const hitbox = this.createOrientedHitbox(attacker, reach, 40, STAR_FINGER_DAMAGE, 3.5, 1.5, {
      hitStun: STAR_FINGER_STUN,
      yOffset: 20,
    });

    this.screenShake = 6;
    const axis = this.activeGravityAxis || 'down';
    for (let i = 0; i < 6; i++) {
      let sparkX = attacker.x + attacker.width / 2;
      let sparkY = attacker.y + attacker.height / 2;
      if (axis === 'down' || axis === 'up') {
        const dir = attacker.facing === 'right' ? 1 : -1;
        sparkX = attacker.x + (dir === 1 ? attacker.width + i * 40 : -i * 40);
        sparkY = attacker.y + 35;
      } else if (axis === 'right') {
        const isUp = attacker.facing === 'right';
        sparkX = attacker.x - 20;
        sparkY = attacker.y + (isUp ? -i * 40 : attacker.height + i * 40);
      } else if (axis === 'left') {
        const isUp = attacker.facing === 'left';
        sparkX = attacker.x + attacker.width + 20;
        sparkY = attacker.y + (isUp ? -i * 40 : attacker.height + i * 40);
      }
      this.addSpark(sparkX, sparkY, '#c084fc');
    }

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private tryExecuteOraBeatdown(attacker: Fighter, target: Fighter) {
    if (attacker.team && target.team && attacker.team === target.team) {
      attacker.cooldowns.skill5 = 30; // Cannot grab teammate
      return;
    }
    const dist = Math.abs((attacker.x + attacker.width / 2) - (target.x + target.width / 2));
    if (dist <= ORA_BEATDOWN_GRAB_RANGE && !target.isInvulnerable && !target.isTimeEraseActive) {
      attacker.action = 'ora_beatdown';
      attacker.actionTimer = ORA_BEATDOWN_DURATION;
      attacker.actionDuration = ORA_BEATDOWN_DURATION;
      attacker.cooldowns.skill5 = ORA_BEATDOWN_COOLDOWN;
      attacker.grabbedTarget = target.id;
      attacker.isStandActive = true;
      if (this.matchConfig.mode !== 'training') attacker.energy -= ORA_BEATDOWN_COST;

      target.action = 'grabbed';
      target.x = attacker.facing === 'right' ? attacker.x + attacker.width + 10 : attacker.x - target.width - 10;
      target.y = attacker.y;

      this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 45, 'ORA BEATDOWN GRABBED!', '#facc15');
      this.screenShake = 8;
    } else {
      attacker.cooldowns.skill5 = 30; // Miss penalty
    }
  }

  private executeOraBeatdownHit(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const damage = 22;
    this.applyRawDamage(target, damage, dir * 0.5, -0.5);
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#facc15');
    this.spawnOrientedBarrageArm(attacker, 85, '#9333ea', '#facc15', false);
    this.screenShake = 4;
  }

  private executeOraBeatdownFinisher(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const finalDamage = 130;
    this.applyRawDamage(target, finalDamage, dir * 18, -6);
    target.action = 'knockdown';
    target.hitStun = 45;
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#9333ea');
    this.addTextParticle(target.x + target.width / 2, target.y - 40, 'RETIRED!! (BLAST AWAY)', '#facc15');
    this.screenShake = 12;
  }

  // --- DIO SKILL EXECUTIONS ---
  private spawnDIOKnives(dio: Fighter) {
    const axis = this.activeGravityAxis || 'down';
    const isInsideTimeStop = this.timeStopState.isActive;

    this.addTextParticle(dio.x + dio.width / 2, dio.y - 30, isInsideTimeStop ? 'SUSPENDED KNIVES!' : 'KNIFE THROW!', '#ef4444');

    for (let i = 0; i < KNIFE_THROW_COUNT; i++) {
      const angleOffset = (i - (KNIFE_THROW_COUNT - 1) / 2) * 0.15;
      const speed = KNIFE_SPEED;
      let vx = Math.cos(angleOffset) * speed * (dio.facing === 'right' ? 1 : -1);
      let vy = Math.sin(angleOffset) * speed;
      let spawnX = dio.facing === 'right' ? dio.x + dio.width + 10 : dio.x - 20;
      let spawnY = dio.y + 25 + i * 8;
      let pWidth = 24;
      let pHeight = 10;
      let kbX = (dio.facing === 'right' ? 1 : -1) * 4;
      let kbY = -2;

      if (axis === 'right') {
        const isUp = dio.facing === 'right';
        vx = -Math.abs(Math.sin(angleOffset) * speed) - 4;
        vy = (isUp ? -1 : 1) * Math.cos(angleOffset) * speed;
        spawnX = dio.x - 15;
        spawnY = dio.y + (isUp ? -15 - i * 6 : dio.height + i * 6);
        pWidth = 10;
        pHeight = 24;
        kbX = -4;
        kbY = (isUp ? -1 : 1) * 4;
      } else if (axis === 'left') {
        const isUp = dio.facing === 'left';
        vx = Math.abs(Math.sin(angleOffset) * speed) + 4;
        vy = (isUp ? -1 : 1) * Math.cos(angleOffset) * speed;
        spawnX = dio.x + dio.width + 10;
        spawnY = dio.y + (isUp ? -15 - i * 6 : dio.height + i * 6);
        pWidth = 10;
        pHeight = 24;
        kbX = 4;
        kbY = (isUp ? -1 : 1) * 4;
      }

      this.projectiles.push({
        id: this.projectileId++,
        ownerId: dio.id,
        type: 'knife',
        x: spawnX,
        y: spawnY,
        vx: isInsideTimeStop ? 0 : vx,
        vy: isInsideTimeStop ? 0 : vy,
        baseVx: vx,
        baseVy: vy,
        width: pWidth,
        height: pHeight,
        damage: KNIFE_DAMAGE,
        knockbackX: kbX,
        knockbackY: kbY,
        isFrozenInTime: isInsideTimeStop,
        life: 180,
        maxLife: 180,
        color: '#facc15',
      });
    }
  }

  private tryExecuteDrainBlood(dio: Fighter, target: Fighter) {
    if (dio.team && target.team && dio.team === target.team) {
      dio.cooldowns.skill2 = 35; // Cannot grab teammate
      return;
    }
    const dist = Math.abs((dio.x + dio.width / 2) - (target.x + target.width / 2));
    if (dist <= DRAIN_BLOOD_GRAB_RANGE && !target.isInvulnerable && !target.isTimeEraseActive) {
      dio.action = 'drain_blood';
      dio.actionTimer = DRAIN_BLOOD_DURATION;
      dio.actionDuration = DRAIN_BLOOD_DURATION;
      dio.cooldowns.skill2 = DRAIN_BLOOD_COOLDOWN;
      dio.grabbedTarget = target.id;
      if (this.matchConfig.mode !== 'training') dio.energy -= DRAIN_BLOOD_COST;

      target.action = 'grabbed';
      target.x = dio.facing === 'right' ? dio.x + dio.width + 5 : dio.x - target.width - 5;
      target.y = dio.y;

      this.addTextParticle(dio.x + dio.width / 2, dio.y - 45, 'WRYYYY! (BLOOD DRAIN)', '#ef4444');
      this.screenShake = 6;
    } else {
      dio.cooldowns.skill2 = 35;
    }
  }

  private executeDrainBloodTick(dio: Fighter, target: Fighter) {
    const tickDamage = 30;
    const healAmount = 25;
    this.applyRawDamage(target, tickDamage, 0, 0);
    dio.hp = Math.min(dio.maxHp, dio.hp + healAmount);

    this.addSpark(target.x + target.width / 2, target.y + 20, '#ef4444');
    this.addTextParticle(dio.x + dio.width / 2, dio.y - 20, `+${healAmount} HP`, '#4ade80');
  }

  private executeStreetSignChop(dio: Fighter, target: Fighter) {
    const hitbox = this.createOrientedHitbox(dio, STREET_SIGN_RANGE, 90, STREET_SIGN_DAMAGE, 12, 4, {
      isGuardBreak: true,
      yOffset: -10,
    });

    this.screenShake = 8;
    const cx = dio.x + dio.width / 2;
    const cy = dio.y + dio.height / 2;
    this.addShockwave(cx, cy, '#ef4444');

    const targets = this.getTargetsForAttacker(dio, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        t.guardBreakTimer = STREET_SIGN_GUARD_BREAK_FRAMES;
        this.applyHit(dio, t, hitbox);
        this.addTextParticle(t.x + t.width / 2, t.y - 30, 'GUARD BROKEN!', '#ef4444');
      }
    }
  }

  private executeSpaceRipperBeam(dio: Fighter, target: Fighter) {
    const reach = 850;
    const hitbox = this.createOrientedHitbox(dio, reach, 20, SPACE_RIPPER_DAMAGE, 14, 3, {
      yOffset: 12,
    });

    this.screenShake = 10;
    const cx = dio.x + dio.width / 2;
    const cy = dio.y + dio.height / 2;
    this.addShockwave(cx, cy, '#ef4444');

    const targets = this.getTargetsForAttacker(dio, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(dio, t, hitbox);
      }
    }
  }

  private executeRoadRollerPummelHit(dio: Fighter, target: Fighter) {
    const dir = dio.facing === 'right' ? 1 : -1;
    const damage = 25;
    this.applyRawDamage(target, damage, 0, 0);
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#eab308');
    this.screenShake = 6;
  }

  private executeRoadRollerExplosion(dio: Fighter, target: Fighter) {
    const dir = dio.facing === 'right' ? 1 : -1;
    const finalDamage = 220;
    this.applyRawDamage(target, finalDamage, dir * 20, -8);
    target.action = 'knockdown';
    target.hitStun = 60;
    this.screenShake = 18;
    this.addShockwave(target.x + target.width / 2, GROUND_Y - 40, '#f97316');
    this.addTextParticle(target.x + target.width / 2, target.y - 60, 'TANK ROLLER DETONATION!!', '#eab308');
  }

  // --- JONATHAN EXECUTION METHODS ---
  private executeZoomPunch(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const hitbox = this.createOrientedHitbox(attacker, ZOOM_PUNCH_RANGE, 50, ZOOM_PUNCH_DAMAGE, 4, 2, {
      hitStun: ZOOM_PUNCH_STUN,
      yOffset: 15,
    });
    this.screenShake = 6;
    soundManager.playHamonBuzz();
    for (let i = 0; i < 5; i++) {
      this.addSpark(attacker.x + (dir === 1 ? attacker.width + i * 45 : -i * 45), attacker.y + 30, '#facc15');
    }
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        this.addTextParticle(t.x + t.width / 2, t.y - 30, 'ZOOM PUNCH STUN!', '#facc15');
      }
    }
  }

  private executeLuckPluckSlash(attacker: Fighter, target: Fighter) {
    const hitbox = this.createOrientedHitbox(attacker, LUCK_PLUCK_RANGE, 70, LUCK_PLUCK_DAMAGE, 14, 5, {
      yOffset: 5,
    });
    this.screenShake = 8;
    soundManager.playSwordSlash();
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#38bdf8');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeSunlightYellowHit(attacker: Fighter, target: Fighter) {
    soundManager.playHamonBuzz();
    const reach = 120;
    this.spawnOrientedBarrageArm(attacker, reach, '#facc15', '#fb923c', false);

    const hitbox = this.createOrientedHitbox(attacker, reach, 75, 12, 1.5, 0.5, {
      isBarrage: true,
      yOffset: 10,
    });
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeSunlightYellowFinisher(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.applyRawDamage(target, 160, dir * 18, -8);
    target.action = 'knockdown';
    target.hitStun = 60;
    this.screenShake = 16;
    soundManager.playOverdriveExplosion();
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#facc15');
    this.addTextParticle(target.x + target.width / 2, target.y - 60, 'SUNLIGHT YELLOW OVERDRIVE DETONATION!!', '#facc15');
  }

  // --- PROJECTILE SPAWNERS ---
  private executePluckThrust(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const reach = 220;
    const hitbox = this.createOrientedHitbox(attacker, reach, 45, 165, 12, 3, {
      hitStun: 40,
      yOffset: 15,
    });

    this.screenShake = 8;
    soundManager.playSwordSlash();
    for (let i = 0; i < 7; i++) {
      this.addSpark(attacker.x + (dir === 1 ? attacker.width + i * 30 : -i * 30), attacker.y + 30, '#38bdf8');
    }

    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        this.addTextParticle(t.x + t.width / 2, t.y - 30, 'PLUCK STABBED!', '#38bdf8');
      }
    }
  }

  private spawnSwordCrescentWave(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'sendo_wave',
      x: dir === 1 ? f.x + f.width : f.x - 70,
      y: f.y + 15,
      vx: dir * (SENDO_WAVE_SPEED + 3),
      vy: 0,
      baseVx: dir * (SENDO_WAVE_SPEED + 3),
      baseVy: 0,
      width: 70,
      height: 45,
      damage: SENDO_WAVE_DAMAGE + 35,
      knockbackX: dir * 13,
      knockbackY: -5,
      isFrozenInTime: false,
      life: 90,
      maxLife: 90,
      color: '#38bdf8',
    });
  }

  private spawnSendoWave(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'sendo_wave',
      x: dir === 1 ? f.x + f.width : f.x - 60,
      y: GROUND_Y - 30,
      vx: dir * SENDO_WAVE_SPEED,
      vy: 0,
      baseVx: dir * SENDO_WAVE_SPEED,
      baseVy: 0,
      width: 60,
      height: 30,
      damage: SENDO_WAVE_DAMAGE,
      knockbackX: dir * 10,
      knockbackY: -4,
      isFrozenInTime: false,
      life: 90,
      maxLife: 90,
      color: '#facc15',
    });
  }

  private spawnJosukeShard(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    f.homingShardActive = true;
    f.homingShardState = 'out';
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'josuke_shard',
      x: dir === 1 ? f.x + f.width : f.x - 35,
      y: f.y + 25,
      vx: dir * JOSUKE_HOMING_SHARD_SPEED,
      vy: 0.5, // slight arc
      baseVx: dir * JOSUKE_HOMING_SHARD_SPEED,
      baseVy: 0.5,
      width: 35,
      height: 20,
      damage: JOSUKE_HOMING_SHARD_DAMAGE,
      knockbackX: dir * 2,
      knockbackY: -2,
      isFrozenInTime: false,
      life: 80,
      maxLife: 80,
      color: '#06b6d4',
    });
  }

  private spawnJosukeBearing(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'josuke_bearing',
      x: dir === 1 ? f.x + f.width : f.x - 20,
      y: f.y + 20,
      vx: dir * JOSUKE_BEARING_SHOT_SPEED,
      vy: 0,
      baseVx: dir * JOSUKE_BEARING_SHOT_SPEED,
      baseVy: 0,
      width: 20,
      height: 10,
      damage: JOSUKE_BEARING_SHOT_DAMAGE,
      knockbackX: dir * 10,
      knockbackY: -3,
      isFrozenInTime: false,
      life: 70,
      maxLife: 70,
      color: '#06b6d4',
    });
  }

  private spawnClackerVolley(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'clacker_volley',
      x: dir === 1 ? f.x + f.width : f.x - 45,
      y: f.y + 25,
      vx: dir * 13,
      vy: 0,
      baseVx: dir * 13,
      baseVy: 0,
      width: 45,
      height: 35,
      damage: CLACKER_VOLLEY_DAMAGE,
      knockbackX: dir * 8,
      knockbackY: -3,
      isFrozenInTime: false,
      life: 75,
      maxLife: 75,
      color: '#34d399',
    });
  }

  private spawnTommyGunBurst(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    for (let i = 0; i < 6; i++) {
      this.projectiles.push({
        id: this.projectileId++,
        ownerId: f.id,
        type: 'tommy_bullet',
        x: (dir === 1 ? f.x + f.width : f.x - 20) + (i * -dir * 10),
        y: f.y + 20 + (Math.random() * 12 - 6),
        vx: dir * (16 + i * 0.8),
        vy: (Math.random() - 0.5) * 1.5,
        baseVx: dir * 16,
        baseVy: 0,
        width: 18,
        height: 8,
        damage: TOMMY_GUN_BULLET_DAMAGE,
        knockbackX: dir * 2.5,
        knockbackY: -1,
        isFrozenInTime: false,
        life: 50,
        maxLife: 50,
        color: '#ef4444',
      });
    }
  }

  private spawnHermitVineGrab(f: Fighter) {
    const dir = f.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: f.id,
      type: 'hermit_vine_grab',
      x: dir === 1 ? f.x + f.width : f.x - 70,
      y: f.y + 20,
      vx: dir * 15,
      vy: 0,
      baseVx: dir * 15,
      baseVy: 0,
      width: 70,
      height: 40,
      damage: HERMIT_GRAPPLE_DAMAGE,
      knockbackX: -dir * 12,
      knockbackY: -2,
      isFrozenInTime: false,
      life: 45,
      maxLife: 45,
      color: '#c084fc',
    });
  }

  // --- YOUNG JOSEPH EXECUTION METHODS ---
  private executeHamonElbow(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const hitbox: Hitbox = {
      x: dir === 1 ? attacker.x + attacker.width : attacker.x - 110,
      y: attacker.y + 15,
      width: 110,
      height: 60,
      damage: HAMON_ELBOW_DAMAGE,
      knockbackX: dir * 12,
      knockbackY: -4,
    };
    this.screenShake = 6;
    soundManager.playHamonBuzz();
    if (this.checkCollision(hitbox, target)) {
      this.applyHit(attacker, target, hitbox);
    }
  }

  private executeClackerBoomerang(attacker: Fighter, target: Fighter) {
    const hitbox = this.createOrientedHitbox(attacker, attacker.width + 80, 60, 180, 10, 6, {
      yOffset: 0,
    });
    this.screenShake = 9;
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#34d399');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeRedStoneBeam(attacker: Fighter, target: Fighter) {
    const reach = 850;
    const hitbox = this.createOrientedHitbox(attacker, reach, 45, YOUNG_JOSEPH_ULTIMATE_DAMAGE, 18, 6, {
      yOffset: 10,
    });
    this.screenShake = 15;
    soundManager.playOverdriveExplosion();
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#ef4444');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  // --- OLD JOSEPH EXECUTION METHODS ---
  private executeHermitTrap(attacker: Fighter, target: Fighter) {
    const hitbox = this.createOrientedHitbox(attacker, 180, 45, HERMIT_TRAP_DAMAGE, 0, 0, {
      hitStun: 45,
      yOffset: 10,
    });
    this.screenShake = 6;
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#c084fc');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        this.addTextParticle(t.x + t.width / 2, t.y - 30, 'VINE BOUND!', '#c084fc');
      }
    }
  }

  private executeOverdriveTacticsWhip(attacker: Fighter, target: Fighter) {
    const reach = 190;
    const hitbox = this.createOrientedHitbox(attacker, reach, 70, OVERDRIVE_TACTICS_DAMAGE, 11, 4, {
      yOffset: 0,
    });
    this.screenShake = 7;
    soundManager.playHamonBuzz();
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeCameraSmash(attacker: Fighter, target: Fighter) {
    const hitbox = this.createOrientedHitbox(attacker, 85, 55, 165, 8, 2, {
      isGuardBreak: true,
      yOffset: 10,
    });
    this.screenShake = 8;
    soundManager.playSpiritPhotoFlash();
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        this.addTextParticle(t.x + t.width / 2, t.y - 30, 'CAMERA FLASH BLIND!', '#e2e8f0');
      }
    }
  }

  private executeHermitSurgeHit(attacker: Fighter, target: Fighter) {
    soundManager.playHamonBuzz();
    this.addSpark(target.x + target.width / 2, target.y + target.height / 2, '#c084fc');
    this.applyRawDamage(target, 22, 0, 0);
  }

  private executeHermitSurgeFinisher(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.applyRawDamage(target, 200, dir * 16, -7);
    target.action = 'knockdown';
    target.hitStun = 60;
    this.screenShake = 16;
    soundManager.playOverdriveExplosion();
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#c084fc');
    this.addTextParticle(target.x + target.width / 2, target.y - 60, 'HERMIT OVERDRIVE SURGE DETONATION!!', '#c084fc');
  }

  // --- DIAVOLO EXECUTION METHODS ---
  private executeDonutStrike(attacker: Fighter, target: Fighter) {
    const reach = 125;
    const hitbox = this.createOrientedHitbox(attacker, reach, 65, DONUT_STRIKE_DAMAGE, 18, 5, {
      hitStun: 40,
      yOffset: 10,
    });
    this.screenShake = 10;
    soundManager.playHit(true);
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#fb7185');
    this.addTextParticle(cx, attacker.y - 35, '🩸 LETHAL DONUT CHOP!', '#fb7185');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        if (!t.isTimeEraseActive && !t.isEpitaphActive && t.hp > 0) {
          // Impale/Grab mechanism:
          t.action = 'grabbed';
          t.vx = 0;
          t.vy = 0;
          t.hitStun = 45;
          attacker.grabbedTarget = t.id;
          t.x = attacker.x + (attacker.facing === 'right' ? 65 : -t.width - 65);
          t.y = attacker.y;
        }
      }
    }
  }

  private executeDonutThrow(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    target.action = 'knockback';
    target.vx = dir * 26; // Fly backward far away!
    target.vy = -9;       // Lifted high in the air!
    target.hitStun = 45;
    target.isGrounded = false;
    attacker.grabbedTarget = null;

    this.screenShake = 14;
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#e11d48');
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 50, '💀 DONUT SHATTER THROW!', '#e11d48');
    soundManager.playHit(true);
  }

  private executeFleshThrow(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'blood_blind',
      x: dir === 1 ? attacker.x + attacker.width : attacker.x - 20,
      y: attacker.y + 25,
      vx: dir * 18,
      vy: 0,
      baseVx: dir * 18,
      baseVy: 0,
      width: 30,
      height: 20,
      damage: FLESH_THROW_DAMAGE,
      knockbackX: dir * 6,
      knockbackY: -2,
      isFrozenInTime: false,
      life: 90,
      maxLife: 90,
      color: '#fb7185',
    });
    soundManager.playHit(false);
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 35, '🩸 BLOOD BLIND THROW!', '#fb7185');
  }

  private executeDonutStrikeAmbush(attacker: Fighter, target: Fighter) {
    const reach = 135;
    const hitbox = this.createOrientedHitbox(attacker, reach, 70, TIME_ERASE_AMBUSH_DAMAGE, 20, 7, {
      hitStun: 50,
      yOffset: 10,
    });
    this.screenShake = 15;
    soundManager.playHit(true);
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#e11d48');
    this.addTextParticle(cx, attacker.y - 45, '👑 KING CRIMSON: DONUT AMBUSH!!', '#e11d48');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
        if (!t.isTimeEraseActive && !t.isEpitaphActive && t.hp > 0) {
          // Impale/Grab mechanism:
          t.action = 'grabbed';
          t.vx = 0;
          t.vy = 0;
          t.hitStun = 45;
          attacker.grabbedTarget = t.id;
          t.x = attacker.x + (attacker.facing === 'right' ? 65 : -t.width - 65);
          t.y = attacker.y;
        }
      }
    }
  }

  // --- POLNAREFF EXECUTION METHODS ---
  private executeRayOfLightHit(attacker: Fighter, target: Fighter) {
    const reach = 145;
    soundManager.playRapierThrust();
    this.spawnOrientedBarrageArm(attacker, reach, '#f1f5f9', '#38bdf8', true);

    const hitbox = this.createOrientedHitbox(attacker, reach, 65, RAY_OF_LIGHT_DAMAGE_PER_HIT, 1.5, 0.5, {
      isBarrage: true,
      yOffset: 10,
    });
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeShootingSword(attacker: Fighter, target: Fighter) {
    const axis = this.activeGravityAxis || 'down';
    const dir = attacker.facing === 'right' ? 1 : -1;
    let spawnX = dir === 1 ? attacker.x + attacker.width : attacker.x - 30;
    let spawnY = attacker.y + 30;
    let vx = dir * 24;
    let vy = 0;
    let pWidth = 40;
    let pHeight = 12;
    let kbX = dir * 12;
    let kbY = -3;

    if (axis === 'right') {
      const isUp = attacker.facing === 'right';
      spawnX = attacker.x - 10;
      spawnY = isUp ? attacker.y - 30 : attacker.y + attacker.height + 10;
      vx = -6;
      vy = (isUp ? -1 : 1) * 24;
      pWidth = 12;
      pHeight = 40;
      kbX = -6;
      kbY = (isUp ? -1 : 1) * 12;
    } else if (axis === 'left') {
      const isUp = attacker.facing === 'left';
      spawnX = attacker.x + attacker.width + 10;
      spawnY = isUp ? attacker.y - 30 : attacker.y + attacker.height + 10;
      vx = 6;
      vy = (isUp ? -1 : 1) * 24;
      pWidth = 12;
      pHeight = 40;
      kbX = 6;
      kbY = (isUp ? -1 : 1) * 12;
    }

    this.projectiles.push({
      id: this.projectileId++,
      ownerId: attacker.id,
      type: 'rapier_blade',
      x: spawnX,
      y: spawnY,
      vx: vx,
      vy: vy,
      baseVx: vx,
      baseVy: vy,
      width: pWidth,
      height: pHeight,
      damage: SHOOTING_SWORD_DAMAGE,
      knockbackX: kbX,
      knockbackY: kbY,
      isFrozenInTime: false,
      life: 120,
      maxLife: 120,
      color: '#f1f5f9',
    });
    soundManager.playSwordSlash();
    this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 35, '🗡️ RAPIER LAUNCH!', '#38bdf8');
  }

  private executeUpwardThrust(attacker: Fighter, target: Fighter) {
    const hitbox = this.createOrientedHitbox(attacker, 100, 100, UPWARD_THRUST_DAMAGE, 6, 14, {
      hitStun: 45,
      yOffset: -20,
    });
    this.screenShake = 8;
    soundManager.playSwordSlash();
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;
    this.addShockwave(cx, cy, '#38bdf8');
    this.addTextParticle(cx, attacker.y - 35, '🗡️ UPWARD RAPIER LAUNCHER!', '#38bdf8');
    const targets = this.getTargetsForAttacker(attacker, target);
    for (const t of targets) {
      if (this.checkCollision(hitbox, t)) {
        this.applyHit(attacker, t, hitbox);
      }
    }
  }

  private executeAfterimageMirage(attacker: Fighter, target: Fighter) {
    const dir = attacker.facing === 'right' ? 1 : -1;
    const totalDamage = AFTERIMAGE_MIRAGE_DAMAGE;
    this.applyRawDamage(target, totalDamage, dir * 16, -7);
    target.action = 'knockdown';
    target.hitStun = 60;
    this.screenShake = 16;
    soundManager.playRapierThrust();
    soundManager.playSwordSlash();

    for (let i = 0; i < 5; i++) {
      const cloneX = target.x + (Math.random() * 160 - 80);
      const cloneY = target.y + (Math.random() * 80 - 40);
      this.addShockwave(cloneX, cloneY, '#34d399');
      this.addSpark(cloneX, cloneY, '#f1f5f9');
    }
    this.addTextParticle(target.x + target.width / 2, target.y - 50, '⚡ SILVER CHARIOT: AFTERIMAGE MIRAGE!!', '#34d399');
  }

  // --- DAMAGE & TIME STOP ACCUMULATION LOGIC ---
  public createOrientedHitbox(
    attacker: Fighter,
    reach: number,
    height: number,
    damage: number,
    knockbackFwd: number,
    knockbackUp: number,
    options: {
      hitStun?: number;
      isBarrage?: boolean;
      yOffset?: number;
      isGuardBreak?: boolean;
      isUnblockable?: boolean;
    } = {}
  ): Hitbox {
    const axis = this.activeGravityAxis || 'down';
    const dir = attacker.facing === 'right' ? 1 : -1;
    const yOff = options.yOffset !== undefined ? options.yOffset : 10;
    
    // Gravitational bonus for C-Moon Pucci (Singularity center empowerment)
    let finalDamage = damage;
    if (attacker.charId === 'pucci' && attacker.pucciForm === 'cmoon') {
      finalDamage = Math.round(damage * 1.15); // +15% gravitational force empowerment
    }

    if (axis === 'right') {
      // Floor on right wall. "Forward" along wall is Y:
      // facing === 'right' -> UP (-Y), facing === 'left' -> DOWN (+Y)
      const isUp = attacker.facing === 'right';
      return {
        x: attacker.x - 35,
        y: isUp ? attacker.y - reach : attacker.y + attacker.height,
        width: attacker.width + 70,
        height: reach,
        damage: finalDamage,
        knockbackX: -Math.abs(knockbackUp), // Pushes away from right wall into arena
        knockbackY: (isUp ? -1 : 1) * knockbackFwd,
        hitStun: options.hitStun,
        isBarrage: options.isBarrage,
        isGuardBreak: options.isGuardBreak,
        isUnblockable: options.isUnblockable,
      };
    } else if (axis === 'left') {
      // Floor on left wall. "Forward" along wall is Y:
      // facing === 'left' -> UP (-Y), facing === 'right' -> DOWN (+Y)
      const isUp = attacker.facing === 'left';
      return {
        x: attacker.x - 35,
        y: isUp ? attacker.y - reach : attacker.y + attacker.height,
        width: attacker.width + 70,
        height: reach,
        damage: finalDamage,
        knockbackX: Math.abs(knockbackUp), // Pushes away from left wall into arena
        knockbackY: (isUp ? -1 : 1) * knockbackFwd,
        hitStun: options.hitStun,
        isBarrage: options.isBarrage,
        isGuardBreak: options.isGuardBreak,
        isUnblockable: options.isUnblockable,
      };
    } else if (axis === 'up') {
      // Floor is ceiling. "Forward" along ceiling is X:
      return {
        x: dir === 1 ? attacker.x + attacker.width : attacker.x - reach,
        y: attacker.y + yOff,
        width: reach,
        height: height,
        damage: finalDamage,
        knockbackX: dir * knockbackFwd,
        knockbackY: Math.abs(knockbackUp), // Pushes down away from ceiling into arena
        hitStun: options.hitStun,
        isBarrage: options.isBarrage,
        isGuardBreak: options.isGuardBreak,
        isUnblockable: options.isUnblockable,
      };
    } else {
      // Normal down gravity
      return {
        x: dir === 1 ? attacker.x + attacker.width : attacker.x - reach,
        y: attacker.y + yOff,
        width: reach,
        height: height,
        damage: finalDamage,
        knockbackX: dir * knockbackFwd,
        knockbackY: -Math.abs(knockbackUp),
        hitStun: options.hitStun,
        isBarrage: options.isBarrage,
        isGuardBreak: options.isGuardBreak,
        isUnblockable: options.isUnblockable,
      };
    }
  }

  public getFighterAABB(f: Fighter): { x: number; y: number; width: number; height: number } {
    const axis = this.activeGravityAxis || 'down';
    const cx = f.x + f.width / 2;
    const cy = f.y + f.height / 2;

    if (axis === 'right' || axis === 'left') {
      const effW = f.height; // Rotated width = 80
      const effH = f.width;  // Rotated height = 40
      return {
        x: cx - effW / 2,
        y: cy - effH / 2,
        width: effW,
        height: effH,
      };
    }
    return {
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
    };
  }

  private checkCollision(hitbox: Hitbox, target: Fighter, attacker?: Fighter): boolean {
    const targetAABB = this.getFighterAABB(target);
    const axis = this.activeGravityAxis || 'down';

    // Standard AABB overlap check
    return (
      hitbox.x < targetAABB.x + targetAABB.width &&
      hitbox.x + hitbox.width > targetAABB.x &&
      hitbox.y < targetAABB.y + targetAABB.height &&
      hitbox.y + hitbox.height > targetAABB.y
    );
  }

  private triggerDipezAutoBlink(target: Fighter, attacker?: Fighter | null) {
    if (target.charId !== 'dipez' || target.dipezForm !== 'pure_light') return;

    // Immediately clear negative status effects because pure light cannot burn, bleed, freeze, or trap
    target.burnedTimer = 0;
    if (target.bleedTimer) target.bleedTimer = 0;
    if (target.blindedTimer) target.blindedTimer = 0;
    if (target.silencedTimer) target.silencedTimer = 0;
    if (target.discFrozenTimer) target.discFrozenTimer = 0;
    if (target.gappyTrappedTimer) target.gappyTrappedTimer = 0;

    // Don't trigger blink position jump if target is already mid-blink invulnerable
    if (target.invulnerableTimer > 15) return;

    if (!target.afterimages) target.afterimages = [];
    target.afterimages.push({
      x: target.x,
      y: target.y,
      alpha: 1.0,
      facing: target.facing,
      charId: 'dipez',
      color: 'rgba(255, 255, 255, 0.95)',
    });

    const refFighter = attacker || (this.player.id !== target.id ? this.player : this.ai);
    let blinkX = refFighter && refFighter.facing === 'right' ? refFighter.x - 70 : (refFighter ? refFighter.x + refFighter.width + 30 : target.x + 100);
    if (blinkX < 40 || blinkX > this.getArenaWidth() - 80) {
      blinkX = refFighter && refFighter.facing === 'right' ? refFighter.x + refFighter.width + 70 : (refFighter ? refFighter.x - 70 : target.x - 100);
    }
    target.x = Math.max(40, Math.min(this.getArenaWidth() - 80, blinkX));
    target.y = refFighter ? refFighter.y : target.y;
    target.vx = 0;
    target.vy = 0;
    target.invulnerableTimer = 25;

    soundManager.playDipezTch();
    this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#ffffff');
    this.addTextParticle(target.x + target.width / 2, target.y - 45, '✨ [PURE LIGHT: INVINCIBLE AUTO-BLINK!]', '#fef08a');
    for (let i = 0; i < 8; i++) {
      this.addSpark(target.x + Math.random() * target.width, target.y + Math.random() * target.height, '#ffffff');
    }
  }

  private applyHit(attacker: Fighter, target: Fighter, hitbox: Hitbox) {
    // Friendly Fire Check: Teammates cannot hit each other!
    if (attacker.team && target.team && attacker.team === target.team) {
      return;
    }

    // Dimension Separation: Attacks cannot hit targets across different dimensions!
    if (!!attacker.isParallelWorld !== !!target.isParallelWorld) {
      return;
    }

    // 0. Check if Target is Dipez in Pure Light Form (Invincible Auto-Blink)
    if (target.charId === 'dipez' && target.dipezForm === 'pure_light') {
      this.triggerDipezAutoBlink(target, attacker);
      return;
    }

    // 0. Check if Target is in Erased Time (Diavolo Time Erase Auto-Blink & Phase-Through)
    if (target.isTimeEraseActive || (target.charId === 'king_crimson' && target.isTimeEraseActive)) {
      // Record vivid crimson afterimage at origin
      if (!target.afterimages) target.afterimages = [];
      target.afterimages.push({
        x: target.x,
        y: target.y,
        alpha: 1.0,
        facing: target.facing,
        charId: 'king_crimson',
        color: 'rgba(225, 29, 72, 0.9)',
      });

      // Calculate blink reposition (behind the attacker or to safe opposite side)
      let blinkX = attacker.facing === 'right' ? attacker.x - 70 : attacker.x + attacker.width + 30;
      if (blinkX < 40 || blinkX > this.getArenaWidth() - 80) {
        blinkX = attacker.facing === 'right' ? attacker.x + attacker.width + 70 : attacker.x - 70;
      }
      target.x = Math.max(40, Math.min(this.getArenaWidth() - 80, blinkX));
      target.y = attacker.y;
      target.vx = 0;
      target.vy = 0;
      target.invulnerableTimer = 16;

      // Audio, particles & visual feedback
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#e11d48');
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '⏱️ [TIME ERASE: AUTO-BLINK PHASE!]', '#fb7185');
      for (let i = 0; i < 8; i++) {
        this.addSpark(target.x + target.width / 2, target.y + target.height / 2, '#fb7185');
      }
      soundManager.playPoseSound('king_crimson');
      this.screenShake = Math.max(this.screenShake, 4.0);
      return; // Attacker's hit completely phases through, 0 damage taken!
    }

    // 1. Check if Target has Epitaph Precognition Active (Diavolo Auto-Dodge Counter)
    if (target.isEpitaphActive) {
      target.isEpitaphActive = false;
      target.invulnerableTimer = 35;
      const shiftDir = target.facing === 'right' ? -1 : 1;
      target.x = Math.max(40, Math.min(this.getArenaWidth() - 80, target.x + shiftDir * 75));
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#fb7185');
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '🔮 [EPITAPH: PRECOGNITION AUTO-DODGE!]', '#fb7185');
      soundManager.playPoseSound('king_crimson');
      return; // Attacker's hit misses completely!
    }

    // 2. Check if Target is Parrying (Jotaro Inhale & Counter)
    if (target.isParrying) {
      target.isParrying = false;
      target.action = 'parry_counter';
      target.actionTimer = 25;
      target.actionDuration = 25;
      target.isStandActive = true;
      target.invulnerableTimer = 30;

      const dir = target.facing === 'right' ? 1 : -1;
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#facc15');
      this.addTextParticle(target.x + target.width / 2, target.y - 40, '★ PARRY COUNTER STRIKE! ★', '#c084fc');

      // Counter-attack hits attacker immediately
      this.applyRawDamage(attacker, PARRY_COUNTER_DAMAGE, dir * 14, -5);
      attacker.hitStun = 35;
      return;
    }

    // 2.5. Check if Target is Tooru with Calamity Counter Active (Traffic Hazard)
    if (!this.timeStopState.isActive && target.charId === 'tooru' && target.isCalamityCounterActive) {
      target.isCalamityCounterActive = false;
      target.invulnerableTimer = 25;
      const carDir = target.facing === 'right' ? 1 : -1;
      this.projectiles.push({
        id: this.projectileId++,
        ownerId: target.id,
        type: 'calamity_car',
        subType: 'car',
        x: attacker.x - (carDir * 180),
        y: GROUND_Y - 45,
        vx: carDir * 34,
        vy: 0,
        baseVx: carDir * 34,
        baseVy: 0,
        width: 90,
        height: 45,
        damage: CALAMITY_CAR_DAMAGE,
        knockbackX: carDir * 24,
        knockbackY: -10,
        isFrozenInTime: false,
        life: 80,
        maxLife: 80,
        color: '#ef4444',
      });
      soundManager.playCarCrash();
      this.screenShake = 12;
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#ef4444');
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '🚗 [CALAMITY COUNTER: TRAFFIC HAZARD!]', '#ef4444');
      return;
    }

    // 2.6. Check if Target is Tooru disguised as Head Doctor (Satoru Akefu)
    if (!this.timeStopState.isActive && target.charId === 'tooru' && target.isHeadDoctorDisguise) {
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '🎩 [HEAD DOCTOR: UNTOUCHABLE CALAMITY!]', '#94a3b8');
      this.triggerCalamity(target, attacker);
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#94a3b8');
      return; // Direct hits cannot harm the Head Doctor!
    }

    // 2.7. Check if Target is Tooru (Flow of Calamity: Passive Repulsion & Retribution Shield)
    if (!this.timeStopState.isActive && target.charId === 'tooru' && target.invulnerableTimer <= 0) {
      // The absolute logic of calamity repels attacks and punishes the attacker!
      this.triggerCalamity(target, attacker);
      target.invulnerableTimer = 22;

      // Heavy 85% damage reduction
      const reducedDamage = (target.isArmorOff ? hitbox.damage * ARMOR_OFF_DEFENSE_PENALTY : hitbox.damage) * 0.15;
      target.hp = Math.max(0, target.hp - reducedDamage);
      target.hitStun = 8;

      // Repel attacker backwards
      const repulseDir = target.x < attacker.x ? 1 : -1;
      attacker.vx = repulseDir * 10;
      attacker.vy = -4;
      attacker.hitStun = Math.max(attacker.hitStun, 28);
      attacker.isGrounded = false;

      soundManager.playTooruCalamity();
      this.screenShake = 8;
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#ef4444');
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '🛡️ [FLOW OF CALAMITY: RETRIBUTION SHIELD!]', '#ef4444');
      return;
    }

    // 2.8. Check if Target is Pucci reciting 14 Words (Interruptible Chant)
    if (target.charId === 'pucci' && target.action === 'pucci_14_words_chant') {
      target.action = 'hit';
      target.actionTimer = 0;
      target.pucciChantStep = 0;
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '❌ 14 WORDS CHANT INTERRUPTED!', '#ef4444');
    }

    // 2.9. Check if Target is C-Moon with Gravity Shield Active
    if (!this.timeStopState.isActive && target.charId === 'pucci' && target.pucciForm === 'cmoon' && target.cmoonShieldTimer && target.cmoonShieldTimer > 0) {
      target.invulnerableTimer = 16;
      const repulseDir = target.x < attacker.x ? 1 : -1;
      attacker.vx = repulseDir * 18;
      attacker.vy = -6;
      attacker.hitStun = 35;
      attacker.isGrounded = false;
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#22c55e');
      this.addTextParticle(target.x + target.width / 2, target.y - 40, '🛡️ GRAVITY REPULSION DEFLECT!', '#22c55e');
      soundManager.playCmoonGravity();
      return;
    }

    // 2.10. Check if Target has Gappy Bubble Shield Active
    if (target.gappyShieldActive && target.gappyShieldTimer && target.gappyShieldTimer > 0) {
      target.gappyShieldActive = false;
      target.gappyShieldTimer = 0;
      target.invulnerableTimer = 20;
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#7dd3fc');
      this.addTextParticle(target.x + target.width / 2, target.y - 40, '🫧 BUBBLE SHIELD ABSORBED HIT!', '#38bdf8');
      soundManager.playBubblePop();
      return;
    }

    // 2.11. Check if Target is Funny Valentine with D4C: Love Train Active
    if (target.isLoveTrainActive || (target.charId === 'funny_valentine' && target.loveTrainTimer && target.loveTrainTimer > 0)) {
      soundManager.playLoveTrainRedirect();
      this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#fbbf24');
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '✨ [D4C: LOVE TRAIN MISFORTUNE REDIRECTED!]', '#eab308');

      if (attacker) {
        attacker.hp = Math.max(0, attacker.hp - VALENTINE_LOVE_TRAIN_REDIRECT_DAMAGE);
        attacker.hitStun = 20;
        attacker.vx = (attacker.x > target.x ? 1 : -1) * 12;
        attacker.vy = -5;
        this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 35, `⚡ MISFORTUNE REFLECTED! -${VALENTINE_LOVE_TRAIN_REDIRECT_DAMAGE} HP`, '#eab308');
      }
      return;
    }

    if (target.invulnerableTimer > 0 && !hitbox.isBarrage) return;

    // Attacker gains combo & energy
    attacker.comboCount++;
    attacker.comboResetTimer = 70;
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + (hitbox.isBarrage ? 1.5 : 8));

    // Whitesnake Passive - Disc Steal on Basic/Barrage hit (chance to silence)
    if (attacker.charId === 'pucci' && (!attacker.pucciForm || attacker.pucciForm === 'whitesnake') && Math.random() < 0.35) {
      target.silencedTimer = 120; // 2 seconds silence
      soundManager.playPucciDisc();
      this.addTextParticle(target.x + target.width / 2, target.y - 45, '💿 DISC STOLEN! (SILENCED 2s)', '#e2e8f0');
    }

    // C-Moon Passive - Cape Canaveral Gauge accumulation on hit
    if (attacker.charId === 'pucci' && attacker.pucciForm === 'cmoon') {
      attacker.cmoonGauge = Math.min(100, (attacker.cmoonGauge || 0) + (hitbox.isBarrage ? 2.5 : 8));
      if (attacker.cmoonGauge >= 100 && (attacker.cmoonGauge - (hitbox.isBarrage ? 2.5 : 8)) < 100) {
        this.addTextParticle(attacker.x + attacker.width / 2, attacker.y - 40, '🌕 CAPE CANAVERAL 100% READY!', '#facc15');
      }
    }

    // Calculate damage with Attack Theft & Armor Off penalty
    let dmgMult = 1.0;
    if (attacker.gappyAttackTheftTimer && attacker.gappyAttackTheftTimer > 0) {
      dmgMult *= 0.50; // 50% Attack reduction from Gappy Shave & Moisture Theft
    }
    const baseDamage = hitbox.damage * dmgMult;
    const effectiveDamage = target.isArmorOff ? baseDamage * ARMOR_OFF_DEFENSE_PENALTY : baseDamage;

    // 3. IF TARGET IS FROZEN IN TIME STOP -> DAMAGE STACKING!
    if (this.timeStopState.isActive && target.isFrozenByTimeStop) {
      if (target.id === 'player') {
        this.timeStopState.accumulatedDamagePlayer += effectiveDamage;
        this.timeStopState.accumulatedKnockbackXPlayer += hitbox.knockbackX;
        this.timeStopState.accumulatedKnockbackYPlayer += hitbox.knockbackY;
      } else if (target.id === 'teammate') {
        this.timeStopState.accumulatedDamageTeammate += effectiveDamage;
        this.timeStopState.accumulatedKnockbackXTeammate += hitbox.knockbackX;
        this.timeStopState.accumulatedKnockbackYTeammate += hitbox.knockbackY;
      } else {
        this.timeStopState.accumulatedDamageAI += effectiveDamage;
        this.timeStopState.accumulatedKnockbackXAI += hitbox.knockbackX;
        this.timeStopState.accumulatedKnockbackYAI += hitbox.knockbackY;
      }

      const impactX = target.x + target.width / 2;
      const impactY = target.y + target.height / 3;
      this.addSpark(impactX, impactY, '#facc15');
      if (!hitbox.isBarrage) {
        this.addShockwave(impactX, impactY, '#facc15');
      }
      this.screenShake = Math.max(this.screenShake, 2.5);
      return;
    }

    // 4. Normal Damage Execution
    target.hp = Math.max(0, target.hp - effectiveDamage);

    // Life Insurance Passive Check (Conditional Dimension Swap)
    if (target.charId === 'funny_valentine' && target.hp <= 0 && !target.isLifeInsuranceReviving) {
      const activeClones = target.valentineClones ? target.valentineClones.filter(c => c.hp > 0) : [];
      if (activeClones.length > 0) {
        const substituteClone = activeClones[0];
        target.x = substituteClone.x;
        target.y = substituteClone.y;
        target.hp = Math.floor(target.maxHp * VALENTINE_LIFE_INSURANCE_HEAL_PCT);
        target.isLifeInsuranceReviving = true;
        target.lifeInsuranceTimer = 45;
        target.invulnerableTimer = 60;
        target.action = 'idle';

        const idx = target.valentineClones!.indexOf(substituteClone);
        if (idx !== -1) target.valentineClones!.splice(idx, 1);

        soundManager.playDojyaaan();
        soundManager.playFlagSandwich();
        this.screenShake = 10;

        this.addTextParticle(target.x + target.width / 2, target.y - 50, '🚩 PASSIVE: LIFE INSURANCE (DIMENSION SWAP!)', '#38bdf8');
        for (let i = 0; i < 20; i++) {
          this.addSpark(target.x + (Math.random() * 60 - 30), target.y + (Math.random() * 60 - 30), '#f472b6');
        }
        return;
      }
    }
    target.hitStun = hitbox.hitStun || (hitbox.isBarrage ? 9 : 20);
    target.vx = hitbox.knockbackX;
    target.vy = hitbox.knockbackY;
    target.isGrounded = false;

    // Audio SFX synthesis with zero latency
    if (hitbox.isBarrage) {
      if (attacker.charId === 'silver_chariot') {
        soundManager.playRapierThrust();
      } else {
        soundManager.playBarrageHit();
      }
    } else {
      soundManager.playHit(attacker.isStandActive);
    }

    if (!hitbox.isBarrage) {
      target.invulnerableTimer = 14;
      this.screenShake = attacker.isStandActive ? 7.5 : 4.5;
      const hitX = target.x + target.width / 2;
      const hitY = target.y + target.height / 3;
      const hitImpactGlyph = Math.random() < 0.35 ? 'ドゴォ' : (Math.random() < 0.5 ? 'ズドン' : 'ドドン');
      this.addMenacingParticle(hitX, hitY - 15, hitImpactGlyph, '#ef4444');
    } else {
      this.screenShake = Math.max(this.screenShake, 2.5);
    }

    const impactX = target.x + target.width / 2;
    const impactY = target.y + target.height / 3;
    this.addShockwave(impactX, impactY, attacker.isStandActive ? '#facc15' : '#ffffff');
    for (let i = 0; i < (hitbox.isBarrage ? 3 : 8); i++) {
      this.addSpark(impactX, impactY, attacker.isStandActive ? '#facc15' : '#ffffff');
    }
  }

  private applyRawDamage(target: Fighter, damage: number, knockX: number, knockY: number, attacker?: Fighter | null) {
    if (target.charId === 'dipez' && target.dipezForm === 'pure_light') {
      this.triggerDipezAutoBlink(target, attacker || null);
      return; // Pure light form is 100% immune to all raw damage & calamity!
    }

    if (attacker && attacker.team && target.team && attacker.team === target.team) {
      return; // Friendly Fire Protection
    }

    if (attacker && (!!attacker.isParallelWorld !== !!target.isParallelWorld)) {
      return; // Dimension isolation: attacks in different dimensions cannot affect target
    }

    if (target.isTimeEraseActive || (target.charId === 'king_crimson' && target.isTimeEraseActive)) {
      return; // Phased through completely during erased time
    }

    if (this.timeStopState.isActive && target.isFrozenByTimeStop) {
      if (target.id === 'player') {
        this.timeStopState.accumulatedDamagePlayer += damage;
        this.timeStopState.accumulatedKnockbackXPlayer += knockX;
        this.timeStopState.accumulatedKnockbackYPlayer += knockY;
      } else if (target.id === 'teammate') {
        this.timeStopState.accumulatedDamageTeammate += damage;
        this.timeStopState.accumulatedKnockbackXTeammate += knockX;
        this.timeStopState.accumulatedKnockbackYTeammate += knockY;
      } else {
        this.timeStopState.accumulatedDamageAI += damage;
        this.timeStopState.accumulatedKnockbackXAI += knockX;
        this.timeStopState.accumulatedKnockbackYAI += knockY;
      }
      return;
    }

    target.hp = Math.max(0, target.hp - damage);
    target.vx = knockX;
    target.vy = knockY;
    target.isGrounded = false;
  }

  private applyPhysics(f: Fighter) {
    let dt = this.currentDt;

    // Slow down opponent's physics/movements during Diavolo's Time Erase (Skip Time)
    const opponent = (f.id === 'player' || f.id === 'teammate') ? this.ai : this.player;
    if (opponent && opponent.charId === 'king_crimson' && opponent.isTimeEraseActive) {
      dt *= 0.28; // 28% speed (72% slowed down)
    }

    // Slow down opponent during Made in Heaven's Time Acceleration
    if (opponent && opponent.charId === 'pucci' && opponent.pucciForm === 'made_in_heaven' && opponent.mihTimeAccelTimer && opponent.mihTimeAccelTimer > 0 && f.charId !== 'pucci') {
      dt *= 0.35; // 35% speed (65% slowed down)
    }

    // DYNAMIC GRAVITY AXIS (C-MOON GRAVITY MECHANIC)
    const axis = this.activeGravityAxis || 'down';
    const arenaW = this.getArenaWidth();

    if (axis === 'up') {
      f.vy -= GRAVITY * dt * 1.2;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      // Standing on ceiling (y = 60)
      if (f.y <= 60) {
        f.y = 60;
        f.vy = 0;
        f.isGrounded = true;
      } else {
        f.isGrounded = false;
      }
      if (f.y + f.height >= GROUND_Y) {
        f.y = GROUND_Y - f.height;
        f.vy = 0;
      }

    } else if (axis === 'right') {
      // Standing on Right Wall (x = arenaW - 60 - height)
      f.vx += GRAVITY * dt * 1.5;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      const rightWallGround = arenaW - 60 - f.height;
      if (f.x >= rightWallGround) {
        f.x = rightWallGround;
        f.vx = 0;
        f.isGrounded = true;
      } else {
        f.isGrounded = false;
      }
      if (f.x <= 40) {
        f.x = 40;
        f.vx = 0;
      }
      if (f.y <= 40) f.y = 40;
      if (f.y + f.height >= GROUND_Y) f.y = GROUND_Y - f.height;

    } else if (axis === 'left') {
      // Standing on Left Wall (x = 60)
      f.vx -= GRAVITY * dt * 1.5;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      if (f.x <= 60) {
        f.x = 60;
        f.vx = 0;
        f.isGrounded = true;
      } else {
        f.isGrounded = false;
      }
      if (f.x + f.width >= arenaW - 40) {
        f.x = arenaW - 40 - f.width;
        f.vx = 0;
      }
      if (f.y <= 40) f.y = 40;
      if (f.y + f.height >= GROUND_Y) f.y = GROUND_Y - f.height;

    } else {
      // Default 'down' gravity
      f.vy += GRAVITY * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      if (f.y + f.height >= GROUND_Y) {
        f.y = GROUND_Y - f.height;
        f.vy = 0;
        f.isGrounded = true;
      } else {
        f.isGrounded = false;
      }
      if (f.y <= 40) {
        f.y = 40;
        f.vy = 0;
      }
    }

    // Check Gravity Slam Impact on surface landing
    if (f.gravitySlamArmed && f.isGrounded) {
      f.gravitySlamArmed = false;
      const slamDamage = 28;
      f.hp = Math.max(0, f.hp - slamDamage);
      this.screenShake = Math.max(this.screenShake, 16);
      soundManager.playHit(true);
      const cx = f.x + f.width / 2;
      const cy = f.y + f.height / 2;
      this.addShockwave(cx, cy, '#10b981');
      for (let i = 0; i < 8; i++) {
        this.addSpark(cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 40, '#34d399');
      }
      this.addTextParticle(cx, cy - 45, '💥 GRAVITY IMPACT SLAM! (-28 HP)', '#34d399');
    }

    const currentArenaWidth = this.getArenaWidth();

    if (f.x < 30) {
      f.x = 30;
      f.vx = 0;
    } else if (f.x + f.width > currentArenaWidth - 30) {
      f.x = currentArenaWidth - 30 - f.width;
      f.vx = 0;
    }
  }

  private updateStandState(f: Fighter) {
    if (!f.hasStand || f.charId === 'vampire') {
      f.isStandActive = false;
      f.standAlpha = 0;
      return;
    }
    const targetAlpha = f.isStandActive ? 1 : 0;
    if (f.standAlpha < targetAlpha) {
      f.standAlpha = Math.min(1, f.standAlpha + 0.1);
    } else if (f.standAlpha > targetAlpha) {
      f.standAlpha = Math.max(0, f.standAlpha - 0.1);
    }
  }

  // --- PROJECTILES UPDATE ---
  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // If time is stopped, frozen knives don't move
      if (p.isFrozenInTime) {
        // Floating vibration effect
        continue;
      }

      // 1. Check Rock Shield wall block
      const opponentFighter = (p.ownerId === 'player' || p.ownerId === 'teammate') ? this.ai : this.player;
      if (opponentFighter.rockShieldTimer && opponentFighter.rockShieldTimer > 0 && opponentFighter.rockShieldX !== undefined) {
        const wallX = opponentFighter.rockShieldX;
        // Check if projectile is crossing the wall
        const crossedWall = p.vx > 0 ? (p.x <= wallX && p.x + p.vx >= wallX) : (p.x >= wallX && p.x + p.vx <= wallX);
        if (crossedWall) {
          this.addSpark(wallX, p.y, '#06b6d4');
          this.addTextParticle(wallX, p.y - 15, '🚫 WALL BLOCKED!', '#06b6d4');
          soundManager.playHit(true);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // 2. Custom behavior for Josuke Homing Shard (restoring movement)
      if (p.type === 'josuke_shard') {
        const josuke = (p.ownerId === 'player' || p.ownerId === 'teammate') ? (p.ownerId === 'player' ? this.player : this.teammate) : this.ai;
        const targetFighter = (p.ownerId === 'player' || p.ownerId === 'teammate') ? this.ai : this.player;
        if (p.life < 42 && josuke.homingShardState !== 'restoring') {
          josuke.homingShardState = 'restoring';
        }

        if (josuke.homingShardState === 'restoring') {
          // Move towards Josuke's center coordinates
          const dx = (josuke.x + josuke.width / 2) - p.x;
          const dy = (josuke.y + josuke.height / 2) - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 15) {
            p.vx = (dx / dist) * JOSUKE_HOMING_SHARD_SPEED;
            p.vy = (dy / dist) * JOSUKE_HOMING_SHARD_SPEED;
          } else {
            p.life = 0; // Reached Josuke
            josuke.homingShardState = 'idle';
            josuke.homingShardActive = false;
          }

          // Fetch target if close to returning shard
          const targetDistX = Math.abs(targetFighter.x + targetFighter.width / 2 - p.x);
          const targetDistY = Math.abs(targetFighter.y + targetFighter.height / 2 - p.y);
          if (targetDistX < 50 && targetDistY < 60) {
            targetFighter.x = p.x - targetFighter.width / 2;
            targetFighter.y = p.y - targetFighter.height / 2;
            targetFighter.vx = p.vx;
            targetFighter.vy = p.vy;
            targetFighter.hitStun = Math.max(targetFighter.hitStun, 6);
            if (this.frameCount % 2 === 0) {
              this.addSpark(targetFighter.x + targetFighter.width / 2, targetFighter.y + targetFighter.height / 2, '#06b6d4');
            }
          }
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // Collision with fighters (Universal target detection - excludes owner and owner's team)
      const attacker = (p.ownerId === 'player' ? this.player : (p.ownerId === 'teammate' ? this.teammate : (p.ownerId === 'ai' ? this.ai : this.vampires.find(v => v.id === p.ownerId) || this.ai)));
      const attackerTeam = attacker ? attacker.team : (p.ownerId === 'player' || p.ownerId === 'teammate' ? 'teamA' : 'teamB');

      // Gappy bubble projectile particle trails
      if (p.type.startsWith('gappy_') && this.frameCount % 2 === 0) {
        this.addSpark(p.x + Math.random() * p.width, p.y + Math.random() * p.height, p.type === 'gappy_go_beyond' ? '#ffffff' : '#7dd3fc');
      }

      // Check Gappy Plunder Bubble ground landing
      if (p.type === 'gappy_plunder_bubble' && p.y >= GROUND_Y - 25) {
        const stripX = p.x;
        if (!attacker.gappyFrictionStrips) attacker.gappyFrictionStrips = [];
        attacker.gappyFrictionStrips.push({
          id: Date.now() + Math.random(),
          x: stripX,
          y: GROUND_Y - 10,
          width: 150,
          timer: GAPPY_FRICTION_STRIP_DURATION,
        });
        soundManager.playBubblePlunder();
        this.addShockwave(stripX, GROUND_Y - 15, '#38bdf8');
        this.addTextParticle(stripX, GROUND_Y - 35, '🧼 PLUNDER STRIP: FRICTION = 0', '#7dd3fc');
        for (let s = 0; s < 10; s++) {
          this.addSpark(stripX + (Math.random() * 80 - 40), GROUND_Y - 15, '#38bdf8');
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      const isAttackerParallel = p.isParallelWorld !== undefined ? p.isParallelWorld : (attacker ? !!attacker.isParallelWorld : false);
      const possibleTargets: Fighter[] = [];
      const candidateFighters = this.getAllActiveFighters();
      for (const f of candidateFighters) {
        if (f && f.hp > 0 && f.id !== attacker?.id && f.team !== attackerTeam) {
          if (!!f.isParallelWorld === isAttackerParallel) {
            possibleTargets.push(f);
          }
        }
      }

      // Special Meteor Ground & Proximity Impact
      if (p.type === 'calamity_meteor' && p.y >= GROUND_Y - 55) {
        soundManager.playMeteorExplosion();
        this.screenShake = 26;
        const meteorCenterX = p.x + p.width / 2;
        const meteorCenterY = GROUND_Y - 20;
        this.addShockwave(meteorCenterX, meteorCenterY, '#ef4444');
        this.addShockwave(meteorCenterX, meteorCenterY, '#f97316');
        this.addTextParticle(meteorCenterX, meteorCenterY - 45, '☄️💥 [EXTINCTION METEOR CRASH!]', '#ef4444');
        for (let s = 0; s < 8; s++) {
          this.addSpark(meteorCenterX + (Math.random() * 40 - 20), meteorCenterY + (Math.random() * 20 - 10), '#f97316');
        }

        for (const t of possibleTargets) {
          if (t.charId === 'dipez' && t.dipezForm === 'pure_light') {
            this.triggerDipezAutoBlink(t, attacker);
            continue;
          }
          const distToMeteor = Math.abs((t.x + t.width / 2) - meteorCenterX);
          if (distToMeteor < 280) {
            const blastDir = t.x > meteorCenterX ? 1 : -1;
            this.applyRawDamage(t, p.damage, blastDir * 24, -18, attacker);
            t.hitStun = 60;
            t.isGrounded = false;
          }
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      const hitbox: Hitbox = {
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        damage: p.damage,
        knockbackX: p.knockbackX,
        knockbackY: p.knockbackY,
      };

      // Special Calamity Car Multi-Target Penetration Impact ("mental gak nembus, universal untuk lawan")
      if (p.type === 'calamity_car') {
        if (p.life <= 0 || p.x < -100 || p.x > this.getArenaWidth() + 100) {
          this.projectiles.splice(i, 1);
          continue;
        }
        if (!p.hitTargetIds) {
          p.hitTargetIds = [];
        }
        for (const t of possibleTargets) {
          if (t.hp > 0 && !p.hitTargetIds.includes(t.id) && this.checkCollision(hitbox, t)) {
            p.hitTargetIds.push(t.id);
            if (t.charId === 'dipez' && t.dipezForm === 'pure_light') {
              this.triggerDipezAutoBlink(t, attacker);
              continue;
            }
            if (t.isTimeEraseActive || (t.charId === 'king_crimson' && t.isTimeEraseActive)) {
              this.applyHit(attacker, t, hitbox);
              this.addSpark(p.x, p.y, '#fb7185');
              continue;
            }
            soundManager.playCarCrash();
            this.screenShake = 18;
            this.addShockwave(t.x + t.width / 2, t.y + t.height / 2, p.color || '#ef4444');
            this.addTextParticle(t.x + t.width / 2, t.y - 45, '💥 [VEHICLE CALAMITY IMPACT!]', p.color || '#ef4444');
            t.isGrounded = false;
            t.hitStun = 50;
            t.action = 'knockback';
            t.actionTimer = 45;
            t.actionDuration = 45;
            t.vx = (p.vx > 0 ? 1 : -1) * 28;
            t.vy = -14;
            t.invulnerableTimer = 0;
            this.applyHit(attacker, t, hitbox);
          }
        }
        continue; // Continues traveling across arena hitting all targets in its path!
      }

      // Special Dipez Laser Beams (Multi-Target Penetration, Continuous Beams)
      if (p.type === 'dipez_laser_beam' || p.type === 'dipez_map_laser_beam') {
        if (p.life <= 0 || p.x < -100 || p.x > this.getArenaWidth() + 100) {
          this.projectiles.splice(i, 1);
          continue;
        }
        if (!p.hitTargetIds) {
          p.hitTargetIds = [];
        }
        for (const t of possibleTargets) {
          if (t.hp > 0 && !p.hitTargetIds.includes(t.id) && this.checkCollision(hitbox, t)) {
            p.hitTargetIds.push(t.id);
            if (t.charId === 'dipez' && t.dipezForm === 'pure_light') {
              this.triggerDipezAutoBlink(t, attacker);
              continue;
            }
            if (t.isTimeEraseActive || (t.charId === 'king_crimson' && t.isTimeEraseActive)) {
              this.applyHit(attacker, t, hitbox);
              this.addSpark(p.x + p.width / 2, p.y + p.height / 2, '#fb7185');
              continue;
            }
            
            // Apply laser impact visuals
            this.screenShake = p.type === 'dipez_map_laser_beam' ? 24 : 12;
            this.addShockwave(t.x + t.width / 2, t.y + t.height / 2, p.color || '#38bdf8');
            this.addTextParticle(t.x + t.width / 2, t.y - 45, p.type === 'dipez_map_laser_beam' ? '💥 [MAP LASER IMPACT!]' : '💥 [LASER IMPACT!]', p.color || '#38bdf8');
            
            t.isGrounded = false;
            t.hitStun = p.hitStun || 50;
            t.action = 'knockback';
            t.actionTimer = 40;
            t.actionDuration = 40;
            t.vx = (p.knockbackX !== undefined ? p.knockbackX : (attacker.facing === 'right' ? 18 : -18));
            t.vy = p.knockbackY !== undefined ? p.knockbackY : -5;
            t.invulnerableTimer = 0;
            
            this.applyHit(attacker, t, hitbox);
          }
        }
        continue; // Keep the laser in play for its full life duration!
      }

      let target: Fighter | null = null;

      for (const t of possibleTargets) {
        if (this.checkCollision(hitbox, t)) {
          target = t;
          break;
        }
      }

      if (target) {
        // GAPPY BUBBLE PROJECTILE IMPACTS
        if (p.type === 'gappy_shave_bubble') {
          this.applyHit(attacker, target, hitbox);
          soundManager.playBubblePop();
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + GAPPY_SHAVE_MOISTURE_LIFESTEAL);
          target.gappyAttackTheftTimer = GAPPY_SHAVE_MOISTURE_DURATION;
          this.addTextParticle(target.x + target.width / 2, target.y - 45, '✂️ ATTACK STOLEN (-50%)! (+45 HP)', '#0284c7');
          this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#0284c7');
          for (let s = 0; s < 10; s++) {
            this.addSpark(target.x + target.width / 2 + (Math.random() * 30 - 15), target.y + target.height / 2 + (Math.random() * 30 - 15), '#38bdf8');
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        if (p.type === 'gappy_barrage_bubble') {
          this.applyHit(attacker, target, hitbox);
          soundManager.playBubblePop();
          this.addShockwave(p.x, p.y, '#38bdf8');
          for (let s = 0; s < 5; s++) {
            this.addSpark(p.x + (Math.random() * 20 - 10), p.y + (Math.random() * 20 - 10), '#7dd3fc');
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        if (p.type === 'gappy_trap_bubble') {
          this.applyHit(attacker, target, hitbox);
          target.gappyTrappedTimer = GAPPY_TRAP_DURATION;
          soundManager.playBubblePop();
          this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#7dd3fc');
          this.addTextParticle(target.x + target.width / 2, target.y - 45, '🫧 SUSPENDED IN BUBBLE TRAP (3s)!', '#38bdf8');
          for (let s = 0; s < 14; s++) {
            this.addSpark(target.x + target.width / 2 + (Math.random() * 40 - 20), target.y + target.height / 2 + (Math.random() * 40 - 20), '#7dd3fc');
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        if (p.type === 'gappy_go_beyond') {
          if (target.charId === 'dipez' && target.dipezForm === 'pure_light') {
            this.triggerDipezAutoBlink(target, attacker);
            this.projectiles.splice(i, 1);
            continue;
          }
          target.hp = Math.max(0, target.hp - GAPPY_GO_BEYOND_TRUE_DAMAGE);
          target.hitStun = 60;
          target.vx = (p.vx > 0 ? 1 : -1) * 22;
          target.vy = -12;
          target.isGrounded = false;
          soundManager.playGoBeyondExplosion();
          this.screenShake = 24;
          this.universeResetFlash = 18;
          this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#ffffff');
          this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#38bdf8');
          this.addTextParticle(target.x + target.width / 2, target.y - 55, '🌌 ★ GO BEYOND: LOGIC PIERCED! ★', '#38bdf8');
          for (let b = 0; b < 24; b++) {
            this.addSpark(target.x + target.width / 2 + (Math.random() * 60 - 30), target.y + target.height / 2 + (Math.random() * 60 - 30), b % 2 === 0 ? '#38bdf8' : '#ffffff');
          }
          this.projectiles.splice(i, 1);
          continue;
        }
        if (target.charId === 'pucci' && target.pucciForm === 'cmoon' && target.cmoonShieldTimer && target.cmoonShieldTimer > 0) {
          p.vx = -p.vx * 1.2;
          p.ownerId = target.id;
          soundManager.playCmoonGravity();
          this.addShockwave(p.x, p.y, '#22c55e');
          this.addTextParticle(target.x + target.width / 2, target.y - 30, '🛡️ GRAVITY DEFLECT!', '#22c55e');
          continue;
        }
        if (p.type === 'pucci_disc') {
          target.discFrozenTimer = PUCCI_STAND_DISC_FREEZE_DURATION;
          soundManager.playPucciDisc();
          this.addTextParticle(target.x + target.width / 2, target.y - 35, '💿 DISC COMMAND: FREEZE 1.5s!', '#e2e8f0');
        }
        if (target.isTimeEraseActive || (target.charId === 'king_crimson' && target.isTimeEraseActive)) {
          this.applyHit(attacker, target, hitbox);
          this.addSpark(p.x, p.y, '#fb7185');
          this.projectiles.splice(i, 1);
          continue;
        }
        if (p.type === 'calamity_meteor') {
          soundManager.playMeteorExplosion();
          this.screenShake = 26;
          this.addShockwave(target.x + target.width / 2, GROUND_Y - 20, '#ef4444');
          this.addShockwave(target.x + target.width / 2, GROUND_Y - 20, '#f97316');
          this.addTextParticle(target.x + target.width / 2, target.y - 50, '☄️💥 [DIRECT METEOR EXTINCTION!]', '#ef4444');
          target.isGrounded = false;
          target.hitStun = 60;
          this.applyHit(attacker, target, hitbox);
          this.projectiles.splice(i, 1);
          continue;
        }
        if (p.type === 'blood_blind') {
          target.blindedTimer = FLESH_THROW_BLIND_DURATION;
          target.hitStun = 45;
          this.addTextParticle(target.x + target.width / 2, target.y - 30, '🩸 EYE BLINDED!', '#fb7185');
        }
        if (p.type === 'josuke_shard') {
          attacker.homingShardState = 'restoring';
          target.hitStun = Math.max(target.hitStun, 40);
          this.addTextParticle(target.x + target.width / 2, target.y - 35, '⏳ RESTORATION FETCH!', '#06b6d4');
          soundManager.playHamonBuzz();
          this.addShockwave(target.x + target.width / 2, target.y + target.height / 2, '#06b6d4');
        }
        this.applyHit(attacker, target, hitbox);
        this.addSpark(p.x, p.y, p.color || '#facc15');
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life <= 0 || p.x < -100 || p.x > this.getArenaWidth() + 100) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- PARTICLE HELPERS (HARD CAPPED FOR 60 FPS ZERO LAG) ---
  private readonly MAX_PARTICLES = 45;

  private addSpark(x: number, y: number, color: string) {
    if (this.particles.length >= this.MAX_PARTICLES) {
      this.particles.shift();
    }
    this.particles.push({
      id: this.particleId++,
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 1.5,
      life: 10,
      maxLife: 10,
      size: 3 + Math.random() * 3,
      color,
      type: 'spark',
    });
  }

  private addShockwave(x: number, y: number, color: string) {
    if (this.particles.length >= this.MAX_PARTICLES) {
      this.particles.shift();
    }
    this.particles.push({
      id: this.particleId++,
      x,
      y,
      vx: 0,
      vy: 0,
      life: 10,
      maxLife: 10,
      size: 25,
      color,
      type: 'shockwave',
    });
  }

  private spawnOrientedBarrageArm(
    attacker: Fighter,
    reach: number,
    armColor: string,
    glowColor: string,
    isRapier: boolean = false
  ) {
    const axis = this.activeGravityAxis || 'down';
    const cx = attacker.x + attacker.width / 2;
    const cy = attacker.y + attacker.height / 2;

    let originX = cx;
    let originY = cy;
    let targetX = cx;
    let targetY = cy;
    let dir = 1;

    if (axis === 'down' || axis === 'up') {
      dir = attacker.facing === 'right' ? 1 : -1;
      originX = cx + (attacker.isStandActive ? (dir === 1 ? -12 : 12) : 0);
      originY = attacker.y + 35 + (Math.random() * 16 - 8);
      targetX = originX + dir * (reach + Math.random() * 15);
      targetY = originY + (Math.random() * 24 - 12);
    } else if (axis === 'right') {
      const isUp = attacker.facing === 'right';
      dir = isUp ? -1 : 1;
      originX = attacker.x - 10 + (Math.random() * 16 - 8);
      originY = cy + (attacker.isStandActive ? (isUp ? 12 : -12) : 0);
      targetX = originX - (Math.random() * 20 - 10);
      targetY = originY + dir * (reach + Math.random() * 15);
    } else if (axis === 'left') {
      const isUp = attacker.facing === 'left';
      dir = isUp ? -1 : 1;
      originX = attacker.x + attacker.width + 10 + (Math.random() * 16 - 8);
      originY = cy + (attacker.isStandActive ? (isUp ? 12 : -12) : 0);
      targetX = originX + (Math.random() * 20 - 10);
      targetY = originY + dir * (reach + Math.random() * 15);
    }

    this.addBarrageArmParticle(
      originX,
      originY,
      targetX,
      targetY,
      dir,
      armColor,
      glowColor,
      isRapier
    );
    this.addSpark(targetX, targetY, glowColor);
  }

  private addBarrageArmParticle(
    originX: number,
    originY: number,
    targetX: number,
    targetY: number,
    dir: number,
    armColor: string,
    glowColor: string,
    isRapier: boolean = false
  ) {
    if (this.particles.length >= this.MAX_PARTICLES) {
      this.particles.shift();
    }
    this.particles.push({
      id: this.particleId++,
      x: targetX,
      y: targetY,
      originX,
      originY,
      vx: dir * (isRapier ? 6 : 4),
      vy: 0,
      life: isRapier ? 6 : 8,
      maxLife: isRapier ? 6 : 8,
      size: isRapier ? 6 : 12,
      color: armColor,
      armColor,
      glowColor,
      isRapier,
      type: 'barrage_arm',
    });
  }

  public addTextParticle(x: number, y: number, text: string, color: string) {
    // Only allow max 4 active text particles to prevent font drawing overhead
    const activeTextCount = this.particles.filter(p => p.type === 'text').length;
    if (activeTextCount >= 4) {
      const oldestTextIdx = this.particles.findIndex(p => p.type === 'text');
      if (oldestTextIdx !== -1) {
        this.particles.splice(oldestTextIdx, 1);
      }
    }
    this.particles.push({
      id: this.particleId++,
      x: Math.max(20, Math.min(this.getArenaWidth() - 200, x - 40)),
      y,
      vx: 0,
      vy: -1.2,
      life: 25,
      maxLife: 25,
      size: 18,
      color,
      type: 'text',
      text,
    });
  }

  private addMenacingParticle(x: number, y: number, text: string = 'ゴ', color: string = 'rgba(192, 132, 252, 0.85)') {
    if (this.particles.length >= this.MAX_PARTICLES) {
      this.particles.shift();
    }
    this.particles.push({
      id: this.particleId++,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1.4 - Math.random() * 0.6,
      life: 35,
      maxLife: 35,
      size: text === 'ゴ' ? 32 : 24,
      color,
      type: 'menacing',
      text,
    });
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}
