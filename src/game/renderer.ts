import { Fighter, Particle, MapDef, Projectile, TimeStopState } from '../types';
import { ARENA_WIDTH, ARENA_HEIGHT, GROUND_Y, MAPS, FIGHTER_WIDTH, FIGHTER_HEIGHT } from './constants';

export interface StickmanBones {
  headX: number;
  headY: number;
  headRadius: number;
  neckX: number;
  neckY: number;
  hipX: number;
  hipY: number;
  leftShoulderX: number;
  leftShoulderY: number;
  rightShoulderX: number;
  rightShoulderY: number;
  leftElbowX: number;
  leftElbowY: number;
  rightElbowX: number;
  rightElbowY: number;
  leftHandX: number;
  leftHandY: number;
  rightHandX: number;
  rightHandY: number;
  leftKneeX: number;
  leftKneeY: number;
  rightKneeX: number;
  rightKneeY: number;
  leftFootX: number;
  leftFootY: number;
  rightFootX: number;
  rightFootY: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private currentMap: MapDef = MAPS[0];
  public activeGravityAxis: string = 'down';
  public localPlayerId: 'player' | 'ai' | null = null;
  public isMultiplayer: boolean = false;
  private cameraX: number = 0;
  private currentArenaWidth: number = 960;

  // --- CELESTIAL DAY/NIGHT & MADE IN HEAVEN TIME ACCELERATION SYSTEM ---
  // Base 1 full cycle = 1 minute (60 seconds = 3600 frames at 60 FPS)
  private celestialProgress: number = 0.25; // 0.0=Dawn, 0.25=Day/Noon, 0.55=Dusk/Sunset, 0.75=Night/Midnight
  private currentSpeedMultiplier: number = 1.0;
  private stars: Array<{ x: number; y: number; size: number; phase: number; brightness: number }> = [];
  private clouds: Array<{ x: number; y: number; width: number; height: number; speed: number; opacity: number; shapeType: number }> = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initCelestialSkyObjects();
  }

  private initCelestialSkyObjects() {
    // Generate twinkling starfield
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * 1200,
        y: Math.random() * (GROUND_Y - 80),
        size: Math.random() * 1.8 + 0.8,
        phase: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.4 + 0.6,
      });
    }

    // Generate layered drifting clouds
    this.clouds = [
      { x: 40, y: 50, width: 180, height: 42, speed: 0.35, opacity: 0.65, shapeType: 0 },
      { x: 320, y: 85, width: 240, height: 50, speed: 0.25, opacity: 0.55, shapeType: 1 },
      { x: 680, y: 35, width: 190, height: 38, speed: 0.4, opacity: 0.6, shapeType: 0 },
      { x: 890, y: 110, width: 220, height: 46, speed: 0.3, opacity: 0.5, shapeType: 2 },
      { x: 1150, y: 65, width: 260, height: 54, speed: 0.28, opacity: 0.58, shapeType: 1 },
    ];
  }

  public setMap(map: MapDef) {
    this.currentMap = map;
  }

  public render(
    player: Fighter,
    ai: Fighter,
    projectiles: Projectile[],
    particles: Particle[],
    gameTime: number,
    timeStopState?: TimeStopState,
    map?: MapDef,
    arenaWidth?: number,
    teammate?: Fighter | null,
    vampires?: Fighter[]
  ) {
    if (map) {
      this.currentMap = map;
    }
    const ctx = this.ctx;
    const VIEWPORT_WIDTH = 960;
    const VIEWPORT_HEIGHT = 540;

    const currentArenaWidth = arenaWidth || 960;
    this.currentArenaWidth = currentArenaWidth;
    const playerCenterX = player.x + player.width / 2;
    const targetCameraX = Math.max(0, Math.min(currentArenaWidth - VIEWPORT_WIDTH, playerCenterX - VIEWPORT_WIDTH / 2));

    if (Math.abs(this.cameraX - targetCameraX) > 0.1) {
      this.cameraX += (targetCameraX - this.cameraX) * 0.12;
    } else {
      this.cameraX = targetCameraX;
    }
    const cameraX = this.cameraX;

    // --- CALCULATE PUCCI MADE IN HEAVEN TIME ACCELERATION MULTIPLIER ---
    let targetSpeed = 1.0;
    const allFighters = [player, ai, ...(teammate ? [teammate] : []), ...(vampires || [])];
    for (const f of allFighters) {
      if (!f || f.hp <= 0) continue;
      if (f.charId === 'pucci') {
        const form = f.pucciForm || 'whitesnake';
        if (f.action === 'mih_universe_reset') {
          // Hyper-speed Singularity: ramp rapidly up to 120x - 480x speed!
          const resetProgress = 1 - (f.actionTimer || 0) / (f.actionDuration || 180);
          const resetSpeed = 90 + resetProgress * resetProgress * 420;
          targetSpeed = Math.max(targetSpeed, resetSpeed);
        } else if (form === 'made_in_heaven') {
          if (f.mihTimeAccelTimer && f.mihTimeAccelTimer > 0) {
            // Active Skill 2 Time Acceleration: 55x speed!
            targetSpeed = Math.max(targetSpeed, 55.0);
          } else if (f.action === 'mih_speed_blitz' || f.action === 'mih_knife_throw' || f.action === 'mih_teleport_strike') {
            targetSpeed = Math.max(targetSpeed, 20.0);
          } else {
            // Made in Heaven Passive Time Acceleration: 8x speed!
            targetSpeed = Math.max(targetSpeed, 8.0);
          }
        } else if (form === 'cmoon') {
          if (f.action === 'cmoon_evolve_mih') {
            targetSpeed = Math.max(targetSpeed, 30.0);
          } else {
            // C-Moon Gravitational Time Dilation: 2.2x speed!
            targetSpeed = Math.max(targetSpeed, 2.2);
          }
        } else {
          // Whitesnake baseline
          targetSpeed = Math.max(targetSpeed, 1.0);
        }
      }
    }

    // Smooth speed ramping
    if (this.currentSpeedMultiplier < targetSpeed) {
      this.currentSpeedMultiplier += (targetSpeed - this.currentSpeedMultiplier) * 0.12;
    } else {
      this.currentSpeedMultiplier += (targetSpeed - this.currentSpeedMultiplier) * 0.06;
    }

    // Advance celestial day/night progress: 1 full cycle = 1 minute (3600 frames at 60 FPS)
    if (!timeStopState?.isActive) {
      const dt = (1 / 3600) * this.currentSpeedMultiplier;
      this.celestialProgress = (this.celestialProgress + dt) % 1.0;

      // Advance moving clouds
      for (const cloud of this.clouds) {
        const cloudSpeedBoost = 1 + Math.min(25, (this.currentSpeedMultiplier - 1) * 0.35);
        cloud.x += cloud.speed * cloudSpeedBoost;
        if (cloud.x > (this.currentArenaWidth || 960) + 300) {
          cloud.x = -cloud.width - 50;
        }
      }
    }

    // 1. Draw Arena Sky, Sun/Moon, Stars & Parallax Landmarks (Screen Space with Parallax shift)
    this.drawBackground(gameTime, timeStopState?.isActive, cameraX, currentArenaWidth);

    // Enter World Space (translated by camera)
    ctx.save();
    ctx.translate(-cameraX, 0);

    const localPOV = this.localPlayerId === 'ai' ? ai : player;
    const isLocalInParallel = !!localPOV?.isParallelWorld;

    // 2. Draw Floor & Shadows
    this.drawFloor(timeStopState?.isActive, currentArenaWidth, allFighters);
    this.drawShadow(player, isLocalInParallel);
    this.drawShadow(ai, isLocalInParallel);
    if (teammate && teammate.hp > 0) {
      this.drawShadow(teammate, isLocalInParallel);
    }
    if (vampires && vampires.length > 0) {
      for (const v of vampires) {
        if (v.hp > 0) this.drawShadow(v, isLocalInParallel);
      }
    }
    if (player.charId === 'tooru' && player.wouEntity && player.wouEntity.active) {
      this.drawWonderOfUShadow(player.wouEntity);
    }
    if (ai.charId === 'tooru' && ai.wouEntity && ai.wouEntity.active) {
      this.drawWonderOfUShadow(ai.wouEntity);
    }
    if (teammate && teammate.charId === 'tooru' && teammate.wouEntity && teammate.wouEntity.active) {
      this.drawWonderOfUShadow(teammate.wouEntity);
    }

    // Shadows for Valentine clones and parallel counterparts
    if (player.valentineClones) {
      for (const clone of player.valentineClones) {
        if (clone.hp > 0) this.drawShadow(clone, isLocalInParallel);
      }
    }
    if (ai.valentineClones) {
      for (const clone of ai.valentineClones) {
        if (clone.hp > 0) this.drawShadow(clone, isLocalInParallel);
      }
    }
    if (player.parallelEnemyClone && player.parallelEnemyClone.hp > 0) {
      const inViewerDimension = isLocalInParallel ? !!player.parallelEnemyClone.isParallelWorld : !player.parallelEnemyClone.isParallelWorld;
      if (inViewerDimension) this.drawShadow(player.parallelEnemyClone, isLocalInParallel);
    }
    if (ai.parallelEnemyClone && ai.parallelEnemyClone.hp > 0) {
      const inViewerDimension = isLocalInParallel ? !!ai.parallelEnemyClone.isParallelWorld : !ai.parallelEnemyClone.isParallelWorld;
      if (inViewerDimension) this.drawShadow(ai.parallelEnemyClone, isLocalInParallel);
    }

    // 3. Draw Fighters & Stands (Phased out if in different dimension than local POV)
    this.drawFighterWithStand(player, ai, gameTime, timeStopState, isLocalInParallel);
    this.drawFighterWithStand(ai, player, gameTime, timeStopState, isLocalInParallel);
    if (teammate && teammate.hp > 0) {
      this.drawFighterWithStand(teammate, ai, gameTime, timeStopState, isLocalInParallel);
    }
    if (vampires && vampires.length > 0) {
      for (const v of vampires) {
        if (v.hp > 0) {
          this.drawFighterWithStand(v, player, gameTime, timeStopState, isLocalInParallel);
        }
      }
    }
    if (player.charId === 'tooru' && player.wouEntity && player.wouEntity.active) {
      this.drawWonderOfUEntity(player.wouEntity, gameTime, timeStopState?.isActive);
    }
    if (ai.charId === 'tooru' && ai.wouEntity && ai.wouEntity.active) {
      this.drawWonderOfUEntity(ai.wouEntity, gameTime, timeStopState?.isActive);
    }
    if (teammate && teammate.charId === 'tooru' && teammate.wouEntity && teammate.wouEntity.active) {
      this.drawWonderOfUEntity(teammate.wouEntity, gameTime, timeStopState?.isActive);
    }

    // FUNNY VALENTINE MECHANICS: Clones, Parallel Enemy & Love Train Light Wall
    const mainFighters = [player, ai];
    if (teammate) mainFighters.push(teammate);

    for (const f of mainFighters) {
      if (f.isLoveTrainActive || (f.loveTrainTimer && f.loveTrainTimer > 0)) {
        this.drawLoveTrainOverlay(f, gameTime);
      }
      if (f.valentineClones && f.valentineClones.length > 0) {
        const cloneOpponent = f === player ? ai : player;
        for (const clone of f.valentineClones) {
          if (clone.hp > 0) this.drawFighterWithStand(clone, cloneOpponent, gameTime, timeStopState, isLocalInParallel);
        }
      }
      if (f.parallelEnemyClone && f.parallelEnemyClone.hp > 0) {
        const inViewerDimension = isLocalInParallel ? !!f.parallelEnemyClone.isParallelWorld : !f.parallelEnemyClone.isParallelWorld;
        if (inViewerDimension) {
          this.drawFighterWithStand(f.parallelEnemyClone, f, gameTime, timeStopState, isLocalInParallel);
        }
      }
    }

    // 4. Draw Projectiles (Knives, Lasers, Road Roller)
    this.drawProjectiles(projectiles, gameTime, isLocalInParallel);

    // 5. Draw Particles (Barrage Arms, Lines, Fists, Sparks, SFX)
    this.drawParticles(particles, gameTime);

    // 5.5. Draw Overhead Player Tags & Identifiers for Multiplayer & Clones
    if (this.isMultiplayer) {
      const isPlayer1Local = this.localPlayerId !== 'ai';
      this.drawOverheadPlayerBadge(player, isPlayer1Local ? 'YOU (1P)' : '1P', isPlayer1Local, gameTime);
      this.drawOverheadPlayerBadge(ai, !isPlayer1Local ? 'YOU (2P)' : '2P', !isPlayer1Local, gameTime);
      if (teammate && teammate.hp > 0) {
        this.drawOverheadPlayerBadge(teammate, 'ALLY', true, gameTime);
      }
    }

    // Draw Clone badges and HP bars
    if (player.valentineClones) {
      for (const clone of player.valentineClones) {
        if (clone.hp > 0) this.drawOverheadPlayerBadge(clone, 'CLONE', false, gameTime);
      }
    }
    if (ai.valentineClones) {
      for (const clone of ai.valentineClones) {
        if (clone.hp > 0) this.drawOverheadPlayerBadge(clone, 'CLONE', false, gameTime);
      }
    }
    if (player.parallelEnemyClone && player.parallelEnemyClone.hp > 0) {
      const inViewerDimension = isLocalInParallel ? !!player.parallelEnemyClone.isParallelWorld : !player.parallelEnemyClone.isParallelWorld;
      if (inViewerDimension) {
        this.drawOverheadPlayerBadge(player.parallelEnemyClone, 'PARALLEL ENEMY', false, gameTime);
      }
    }
    if (ai.parallelEnemyClone && ai.parallelEnemyClone.hp > 0) {
      const inViewerDimension = isLocalInParallel ? !!ai.parallelEnemyClone.isParallelWorld : !ai.parallelEnemyClone.isParallelWorld;
      if (inViewerDimension) {
        this.drawOverheadPlayerBadge(ai.parallelEnemyClone, 'PARALLEL ENEMY', false, gameTime);
      }
    }

    ctx.restore();

    // 6. Draw Time Stop / Time Erase / Calamity Rain Global Visual Overlays (Screen Space)
    if (timeStopState?.isActive) {
      this.drawTimeStopOverlay(timeStopState, player, ai, gameTime, cameraX);
    } else if (player.isTimeEraseActive || ai.isTimeEraseActive) {
      this.drawTimeEraseOverlay(gameTime);
    } else if ((player.calamityRainTimer && player.calamityRainTimer > 0) || (ai.calamityRainTimer && ai.calamityRainTimer > 0) || (teammate?.calamityRainTimer && teammate.calamityRainTimer > 0)) {
      this.drawCalamityRainOverlay(gameTime);
    } else if (player.isParallelWorld || ai.isParallelWorld) {
      this.drawParallelWorldOverlay(gameTime, isLocalInParallel);
    }

    // Player Sight Theft Blindness Overlay
    if (player.gappySightTheftTimer && player.gappySightTheftTimer > 0) {
      this.drawSightTheftOverlay();
    }

    // Player Blindness Overlay (from Flashbang / Blood Throw)
    if (player.blindedTimer && player.blindedTimer > 0) {
      this.drawBlindOverlay();
    }

    // Star Maker Arena Super White Flash Overlay
    const dipezFighter = [player, ai, teammate].find(f => f && f.charId === 'dipez' && (f.dipezStarMakerFlash || 0) > 0);
    if (dipezFighter && dipezFighter.dipezStarMakerFlash) {
      this.drawStarMakerFlashOverlay(dipezFighter, dipezFighter.dipezStarMakerFlash);
    }
  }

  private drawBlindOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.fillRect(0, 0, 960, 540);
    ctx.font = '900 24px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ BLINDED BY FLASHBANG (1.5s)! ⚡', 480, 270);
    ctx.restore();
  }

  private drawStarMakerFlashOverlay(dipez: Fighter, timer: number) {
    const ctx = this.ctx;
    ctx.save();

    // Total duration of Star Maker flash is 180 frames (3 seconds)
    const elapsed = 180 - timer;

    // Dipez center screen coordinates
    const centerX = (dipez.x + dipez.width / 2) - this.cameraX;
    const centerY = dipez.y + dipez.height / 2;

    // Expansion phase over first 40 frames (~0.67s)
    const expandProgress = Math.min(1.0, elapsed / 40);

    if (expandProgress < 1.0) {
      // 1. Spreading white energy burst outward from Dipez's body
      const maxRadius = 1250;
      const currentRadius = expandProgress * maxRadius;

      // Radial gradient centered at Dipez
      const radGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(1, currentRadius)
      );
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.98)');
      radGrad.addColorStop(0.92, 'rgba(254, 240, 138, 0.85)');
      radGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Expanding shockwave border ring
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = Math.max(1, 14 * (1 - expandProgress));
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Solar energy rays emanating from Dipez
      const rayCount = 16;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2 + elapsed * 0.05;
        const rLen = currentRadius * 0.9;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * rLen, centerY + Math.sin(angle) * rLen);
        ctx.stroke();
      }
    } else {
      // 2. Screen is completely white!
      const fadeOutAlpha = Math.min(1.0, timer / 20); // Fades in final 20 frames
      ctx.fillStyle = `rgba(255, 255, 255, ${fadeOutAlpha})`;
      ctx.fillRect(0, 0, 960, 540);

      // 3. Golden Text: "My power has reached its peak!!"
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text Pulsating & glowing effect
      const pulseScale = 1 + Math.sin(elapsed * 0.15) * 0.04;
      ctx.save();
      ctx.translate(480, 250);
      ctx.scale(pulseScale, pulseScale);

      // Deep Gold Glow Shadow
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 35;

      // Main Golden Line
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';

      // Thick White Outline for maximum pop
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeText("My power has reached its peak!!", 0, 0);

      // Deep Golden Fill
      ctx.fillStyle = '#facc15';
      ctx.fillText("My power has reached its peak!!", 0, 0);

      // Subtitle Line
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.shadowColor = '#b45309';
      ctx.shadowBlur = 18;

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.strokeText("🌟 STAR MAKER (PURE LIGHT FORM) 🌟", 0, 48);

      ctx.fillStyle = '#fef08a';
      ctx.fillText("🌟 STAR MAKER (PURE LIGHT FORM) 🌟", 0, 48);

      ctx.restore();
    }

    ctx.restore();
  }

  // --- CALAMITY STORM RAIN OVERLAY (FULL MAP WEATHER EFFECT) ---
  private drawCalamityRainOverlay(time: number) {
    const ctx = this.ctx;
    ctx.save();
    const VW = 960;
    const VH = 540;

    // 1. Dark Stormy Atmosphere with Crimson Calamity Tint
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(0, 0, VW, VH);

    const calamityGrad = ctx.createRadialGradient(VW / 2, VH / 2, 80, VW / 2, VH / 2, VW / 1.5);
    calamityGrad.addColorStop(0, 'rgba(220, 38, 38, 0.05)');
    calamityGrad.addColorStop(1, 'rgba(220, 38, 38, 0.28)');
    ctx.fillStyle = calamityGrad;
    ctx.fillRect(0, 0, VW, VH);

    // 2. Torrential Rain Slashing Down
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const rainDropCount = 90;
    for (let r = 0; r < rainDropCount; r++) {
      const rx = (r * 37 + time * 24) % VW;
      const ry = (r * 71 + time * 38) % VH;
      const rLen = 22 + (r % 15);
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + rLen);
    }
    ctx.stroke();

    // 3. Occasional Lightning Flash
    if (Math.floor(time * 0.15) % 38 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(0, 0, VW, VH);
    }

    // 4. Japanese Manga Onomatopoeia Text: Heavy Calamity Downpour
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.font = 'bold italic 22px sans-serif';
    ctx.fillText('ザアアアア...', 40, 60);
    ctx.fillText('ゴオオオオ...', VW - 150, 70);

    ctx.restore();
  }

  // --- SIGHT THEFT BLINDNESS OVERLAY (GAPPY PLUNDER EFFECT) ---
  private drawSightTheftOverlay() {
    const ctx = this.ctx;
    ctx.save();
    const VW = 960;
    const VH = 540;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
    ctx.fillRect(0, 0, VW, VH);

    // Vignette sight circle
    const grad = ctx.createRadialGradient(VW / 2, VH / 2, 40, VW / 2, VH / 2, 220);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VW, VH);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👁️ SIGHT STOLEN BY SOFT & WET! (BLINDED)', VW / 2, VH / 2);
    ctx.restore();
  }

  // --- FUNNY VALENTINE OVERLAYS (LOVE TRAIN & PARALLEL WORLD) ---
  private drawLoveTrainOverlay(f: Fighter, gameTime: number) {
    const ctx = this.ctx;
    ctx.save();
    const cx = f.x + f.width / 2;
    const wallWidth = 160;

    // 1. Core Divine Holy Pillar of Light (Pure White-Gold Gradient)
    const grad = ctx.createLinearGradient(cx - wallWidth / 2, 0, cx + wallWidth / 2, 0);
    grad.addColorStop(0, 'rgba(234, 179, 8, 0)');
    grad.addColorStop(0.15, 'rgba(254, 240, 138, 0.45)');
    grad.addColorStop(0.35, 'rgba(254, 252, 232, 0.85)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.65, 'rgba(254, 252, 232, 0.85)');
    grad.addColorStop(0.85, 'rgba(254, 240, 138, 0.45)');
    grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(cx - wallWidth / 2, 0, wallWidth, 540);

    // 2. Prism Rainbow Refraction Borders (Gap between Worlds / Dimensional Slit)
    const prismColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc'];
    for (let i = 0; i < prismColors.length; i++) {
      const offset = (i - prismColors.length / 2) * 4;
      ctx.strokeStyle = prismColors[i];
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - wallWidth * 0.45 + offset, 0);
      ctx.lineTo(cx - wallWidth * 0.45 + offset, 540);
      ctx.moveTo(cx + wallWidth * 0.45 - offset, 0);
      ctx.lineTo(cx + wallWidth * 0.45 - offset, 540);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // 3. Glowing Vertical Sacred Border Lines
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - wallWidth * 0.4, 0); ctx.lineTo(cx - wallWidth * 0.4, 540);
    ctx.moveTo(cx + wallWidth * 0.4, 0); ctx.lineTo(cx + wallWidth * 0.4, 540);
    ctx.stroke();

    // 4. Holy Crosses & Divine Sparkles floating upward along the Sacred Gap
    for (let i = 0; i < 10; i++) {
      const sparkY = (540 - (gameTime * 4 + i * 54) % 540);
      const sparkX = cx + Math.sin(gameTime * 0.08 + i * 1.5) * (wallWidth * 0.35);
      const sparkSize = 4 + (i % 3);

      // Holy Cross shape
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1;
      ctx.fillRect(sparkX - sparkSize, sparkY - 1, sparkSize * 2, 2);
      ctx.fillRect(sparkX - 1, sparkY - sparkSize, 2, sparkSize * 2);

      // Center sparkle glint
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Sacred Corpse Blessing Halo Aura around Valentine's Head
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, f.y - 8, 26, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '900 13px "Impact", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText('✨ 隙間 (LOVE TRAIN) - MISFORTUNE REDIRECTED ✨', cx, 32);
    ctx.fillText('✨ 隙間 (LOVE TRAIN) - MISFORTUNE REDIRECTED ✨', cx, 32);

    ctx.restore();
  }

  private drawParallelWorldOverlay(gameTime: number, isLocalParallelPOV: boolean = false) {
    const ctx = this.ctx;
    ctx.save();
    const VW = 960;
    const VH = 540;

    // Glowing Dimensional Rift Border (Cyan & Pink D4C theme)
    const borderGlow = ctx.createRadialGradient(VW / 2, VH / 2, VW * 0.3, VW / 2, VH / 2, VW * 0.55);
    borderGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    borderGlow.addColorStop(0.65, isLocalParallelPOV ? 'rgba(56, 189, 248, 0.16)' : 'rgba(244, 114, 182, 0.16)');
    borderGlow.addColorStop(1, isLocalParallelPOV ? 'rgba(244, 114, 182, 0.42)' : 'rgba(56, 189, 248, 0.42)');

    ctx.fillStyle = borderGlow;
    ctx.fillRect(0, 0, VW, VH);

    // Dimensional Frame with Corner Accents
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(6, 6, VW - 12, VH - 12);

    ctx.strokeStyle = 'rgba(244, 114, 182, 0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, VW - 24, VH - 24);

    // Floating dimensional Menger Sponge square shards
    for (let s = 0; s < 6; s++) {
      const shardX = (s * 170 + gameTime * 0.8) % VW;
      const shardY = 40 + Math.sin(gameTime * 0.05 + s) * 200 + s * 45;
      const shardSize = 10 + (s % 3) * 6;
      ctx.strokeStyle = s % 2 === 0 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(244, 114, 182, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(shardX, shardY, shardSize, shardSize);
      ctx.strokeRect(shardX + 2, shardY + 2, shardSize - 4, shardSize - 4);
    }

    // Floating dimensional scanlines
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.08)';
    ctx.lineWidth = 1;
    const scanOffset = (gameTime * 2) % 30;
    for (let y = scanOffset; y < VH; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VW, y);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    if (isLocalParallelPOV) {
      ctx.font = '900 14px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🌀 DIMENSI PARALEL D4C (KEBAL DARI DUNIA ASLI) 🌀', VW / 2, 28);
      ctx.font = '700 11px monospace';
      ctx.fillStyle = '#f472b6';
      ctx.fillText('Dunia Asli Terlihat Samar & Tidak Bisa Disentuh • Tekan [SKILL 1 / U] untuk Paradox Pull!', VW / 2, 44);
    } else {
      ctx.font = '900 14px monospace';
      ctx.fillStyle = '#f472b6';
      ctx.fillText('🌀 MUSUH BERADA DI DIMENSI PARALEL (FASE KEBAL / TIDAK BISA DISENTUH) 🌀', VW / 2, 28);
    }

    ctx.restore();
  }

  // --- TIME ERASED CRIMSON SPACE DISTORTION OVERLAY ---
  private drawTimeEraseOverlay(time: number) {
    const ctx = this.ctx;
    ctx.save();
    const VW = 960;
    const VH = 540;

    // 1. Crimson / Deep Red Space Distortion Overlay
    ctx.fillStyle = 'rgba(190, 18, 60, 0.22)';
    ctx.fillRect(0, 0, VW, VH);

    // 2. Erased Time Space Grid
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const gridStep = 45;
    const shift = (time * 2) % gridStep;

    for (let x = -gridStep; x < VW + gridStep; x += gridStep) {
      ctx.moveTo(x + shift, 0);
      ctx.lineTo(x + shift - 50, VH);
    }
    for (let y = 0; y < VH; y += gridStep) {
      ctx.moveTo(0, y);
      ctx.lineTo(VW, y);
    }
    ctx.stroke();

    // 3. Floating Crimson Clock Outlines
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const clockX = 160 + i * 320;
      const clockY = 110 + (i % 2) * 150;
      const radius = 42;
      
      ctx.beginPath();
      ctx.arc(clockX, clockY, radius, 0, Math.PI * 2);
      ctx.stroke();

      const handAngle = -time * 0.12 + i * 2;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + Math.cos(handAngle) * 28, clockY + Math.sin(handAngle) * 28);
      ctx.stroke();
    }

    // 4. Banner: "KING CRIMSON: ERASED TIME"
    ctx.fillStyle = 'rgba(159, 18, 57, 0.9)';
    ctx.fillRect(VW / 2 - 210, 14, 420, 32);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(VW / 2 - 210, 14, 420, 32);

    ctx.font = '900 16px "Impact", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('⏱️ ERASED TIME (TOKI WA KIESARU) ⏱️', VW / 2, 36);

    ctx.restore();
  }

  // --- MULTIPLAYER OVERHEAD PLAYER BADGE & ARROW ---
  private drawOverheadPlayerBadge(fighter: Fighter, label: string, isLocal: boolean, time: number) {
    if (!fighter || fighter.hp <= 0) return;
    const ctx = this.ctx;
    ctx.save();

    const centerX = fighter.x + fighter.width / 2;
    // Hovering with subtle harmonic bobbing
    const bobOffset = Math.sin(time * 0.12) * 3;
    const badgeY = fighter.y - 28 + bobOffset;

    const is1P = label.includes('1P');
    const primaryColor = isLocal ? '#38bdf8' : (is1P ? '#38bdf8' : '#ef4444');
    const glowColor = isLocal ? 'rgba(56, 189, 248, 0.6)' : (is1P ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)');
    const textColor = isLocal ? '#38bdf8' : (is1P ? '#7dd3fc' : '#fca5a5');

    // 1. Inverted Pointer Triangle (Pointing to head)
    ctx.fillStyle = primaryColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(centerX, badgeY + 14);
    ctx.lineTo(centerX - 6, badgeY + 6);
    ctx.lineTo(centerX + 6, badgeY + 6);
    ctx.closePath();
    ctx.fill();

    // 2. Tag Pill Background
    const badgeWidth = isLocal ? 68 : 36;
    const badgeHeight = 18;
    const badgeX = centerX - badgeWidth / 2;
    const badgeTopY = badgeY - 10;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = isLocal ? 2 : 1.5;
    
    // Rounded rect
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(badgeX + radius, badgeTopY);
    ctx.lineTo(badgeX + badgeWidth - radius, badgeTopY);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeTopY, badgeX + badgeWidth, badgeTopY + radius);
    ctx.lineTo(badgeX + badgeWidth, badgeTopY + badgeHeight - radius);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeTopY + badgeHeight, badgeX + badgeWidth - radius, badgeTopY + badgeHeight);
    ctx.lineTo(badgeX + radius, badgeTopY + badgeHeight);
    ctx.quadraticCurveTo(badgeX, badgeTopY + badgeHeight, badgeX, badgeTopY + badgeHeight - radius);
    ctx.lineTo(badgeX, badgeTopY + radius);
    ctx.quadraticCurveTo(badgeX, badgeTopY, badgeX + radius, badgeTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Text Label inside badge
    ctx.shadowBlur = 0;
    ctx.font = '900 10px "Impact", "Arial Black", sans-serif';
    ctx.fillStyle = isLocal ? '#ffffff' : textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, badgeTopY + badgeHeight / 2);

    // 4. Mini HP bar for clones
    if (label === 'CLONE' || label === 'PARALLEL') {
      const hpRatio = Math.max(0, fighter.hp / fighter.maxHp);
      const barW = 46;
      const barH = 4;
      const barX = centerX - barW / 2;
      const barY = badgeTopY - 6;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#eab308' : '#ef4444');
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(barX, barY, barW, barH);
    }

    ctx.restore();
  }

  // --- TIME STOP ZERO-LAG EXPANSION INVERSION & MANGA OVERLAY ---
  private drawTimeStopOverlay(
    timeStopState: TimeStopState,
    player: Fighter,
    ai: Fighter,
    time: number,
    cameraX: number = 0
  ) {
    const ctx = this.ctx;
    const VW = 960;
    const VH = 540;

    // 1. Difference / Inversion Ring Expansion Effect (Zero-Lag GPU accelerated composite operation)
    if (timeStopState.filterFlash > 0.05) {
      ctx.save();
      ctx.globalCompositeOperation = 'difference';
      
      const initiatorFighter = timeStopState.initiator === 'player' ? player : ai;
      const centerX = initiatorFighter ? (initiatorFighter.x + initiatorFighter.width / 2) - cameraX : VW / 2;
      const centerY = initiatorFighter ? (initiatorFighter.y + initiatorFighter.height / 2) : VH / 2;
      
      const maxRadius = VW * 0.8;
      const currentRadius = maxRadius * (1.05 - timeStopState.filterFlash);

      // Expanding difference shockwave bubble
      const radialGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(10, currentRadius));
      radialGrad.addColorStop(0, `rgba(255, 255, 255, ${timeStopState.filterFlash * 0.9})`);
      radialGrad.addColorStop(0.7, `rgba(200, 200, 255, ${timeStopState.filterFlash * 0.7})`);
      radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Comic Speedlines (Lightweight batch path)
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < VW; i += 90) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 20, VH);
    }
    ctx.stroke();

    // Top banner: "TIME STOPPED"
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(VW / 2 - 170, 14, 340, 32);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.strokeRect(VW / 2 - 170, 14, 340, 32);

    ctx.font = 'bold 15px "Impact", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText('⏳ TIME STOPPED (HITO TOKI) ⏳', VW / 2, 36);

    // 3. Accumulated Damage Stacks display over frozen targets
    if (timeStopState.accumulatedDamageAI > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 20px "Impact", sans-serif';
      const text = `💥 STACKED: ${Math.round(timeStopState.accumulatedDamageAI)} DMG`;
      ctx.strokeText(text, ai.x + ai.width / 2 - cameraX, ai.y - 35);
      ctx.fillText(text, ai.x + ai.width / 2 - cameraX, ai.y - 35);
    }

    if (timeStopState.accumulatedDamagePlayer > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 20px "Impact", sans-serif';
      const text = `💥 STACKED: ${Math.round(timeStopState.accumulatedDamagePlayer)} DMG`;
      ctx.strokeText(text, player.x + player.width / 2 - cameraX, player.y - 35);
      ctx.fillText(text, player.x + player.width / 2 - cameraX, player.y - 35);
    }

    ctx.restore();
  }

  // --- COLOR HELPER UTILITIES ---
  private hexToRgb(hex: string): [number, number, number] {
    let clean = (hex || '#0f172a').replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return [15, 23, 42];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  private lerpColorRgb(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
    const clampT = Math.max(0, Math.min(1, t));
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * clampT),
      Math.round(c1[1] + (c2[1] - c1[1]) * clampT),
      Math.round(c1[2] + (c2[2] - c1[2]) * clampT),
    ];
  }

  private rgbToString(rgb: [number, number, number], alpha: number = 1): string {
    if (alpha >= 1) {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
  }

  private drawBackground(time: number, isTimeStopped?: boolean, cameraX: number = 0, arenaWidth: number = ARENA_WIDTH) {
    const ctx = this.ctx;
    const map = this.currentMap;
    const progress = this.celestialProgress; // 0.0 - 1.0 (Full Day-Night Cycle)
    const speedMult = this.currentSpeedMultiplier;

    // --- 1. CALCULATE SKY PALETTE (Dawn -> Day -> Dusk -> Night -> Dawn) ---
    // Dawn keyframe (0.00 - 0.20)
    const dawnTop: [number, number, number] = [30, 27, 75];     // Twilight indigo
    const dawnMid: [number, number, number] = [157, 23, 77];    // Crimson rose
    const dawnBot: [number, number, number] = [245, 158, 11];   // Warm sunrise gold

    // Day / Noon keyframe (0.20 - 0.50)
    const dayTop: [number, number, number] = [2, 132, 199];     // Sky blue
    const dayMid: [number, number, number] = [56, 189, 248];    // Cyan azure
    const dayBot: [number, number, number] = [186, 230, 253];   // Bright horizon

    // Dusk / Sunset keyframe (0.50 - 0.70)
    const duskTop: [number, number, number] = [59, 7, 100];     // Deep purple
    const duskMid: [number, number, number] = [194, 65, 12];    // Burning coral orange
    const duskBot: [number, number, number] = [234, 88, 12];    // Sunset fire amber

    // Night / Midnight keyframe (0.70 - 1.00)
    const nightTop: [number, number, number] = [2, 6, 23];      // Deep space obsidian
    const nightMid: [number, number, number] = [9, 13, 22];     // Midnight navy
    const nightBot: [number, number, number] = [15, 23, 42];    // Indigo horizon

    let skyTopRgb: [number, number, number];
    let skyMidRgb: [number, number, number];
    let skyBotRgb: [number, number, number];
    let nightAlpha = 0; // 0 = full daylight, 1 = full midnight

    if (progress < 0.20) {
      // Dawn transition (Night -> Dawn -> Day)
      const t = progress / 0.20;
      skyTopRgb = this.lerpColorRgb(dawnTop, dayTop, t);
      skyMidRgb = this.lerpColorRgb(dawnMid, dayMid, t);
      skyBotRgb = this.lerpColorRgb(dawnBot, dayBot, t);
      nightAlpha = Math.max(0, 1 - t * 1.5);
    } else if (progress < 0.50) {
      // Full Day / High Noon
      const t = (progress - 0.20) / 0.30;
      skyTopRgb = this.lerpColorRgb(dayTop, dayTop, t);
      skyMidRgb = this.lerpColorRgb(dayMid, dayMid, t);
      skyBotRgb = this.lerpColorRgb(dayBot, dayBot, t);
      nightAlpha = 0;
    } else if (progress < 0.70) {
      // Dusk / Sunset transition (Day -> Dusk -> Night)
      const t = (progress - 0.50) / 0.20;
      skyTopRgb = this.lerpColorRgb(dayTop, duskTop, t);
      skyMidRgb = this.lerpColorRgb(dayMid, duskMid, t);
      skyBotRgb = this.lerpColorRgb(dayBot, duskBot, t);
      nightAlpha = t * 0.75;
    } else {
      // Night / Midnight (Dusk -> Night -> Dawn)
      const t = (progress - 0.70) / 0.30;
      skyTopRgb = this.lerpColorRgb(duskTop, nightTop, Math.min(1, t * 1.8));
      skyMidRgb = this.lerpColorRgb(duskMid, nightMid, Math.min(1, t * 1.8));
      skyBotRgb = this.lerpColorRgb(duskBot, nightBot, Math.min(1, t * 1.8));
      nightAlpha = Math.min(1, 0.75 + t * 0.25);
    }

    // Blend in 20% of map distinct signature colors so each stage keeps its lore identity
    const mapTopRgb = this.hexToRgb(map.skyGradient[0]);
    const mapMidRgb = this.hexToRgb(map.skyGradient[1]);
    const mapBotRgb = this.hexToRgb(map.skyGradient[2]);
    skyTopRgb = this.lerpColorRgb(skyTopRgb, mapTopRgb, 0.18);
    skyMidRgb = this.lerpColorRgb(skyMidRgb, mapMidRgb, 0.18);
    skyBotRgb = this.lerpColorRgb(skyBotRgb, mapBotRgb, 0.18);

    // Render Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    if (isTimeStopped) {
      skyGrad.addColorStop(0, '#050508');
      skyGrad.addColorStop(0.6, '#181824');
      skyGrad.addColorStop(1, '#0f0f18');
    } else {
      skyGrad.addColorStop(0, this.rgbToString(skyTopRgb));
      skyGrad.addColorStop(0.55, this.rgbToString(skyMidRgb));
      skyGrad.addColorStop(1, this.rgbToString(skyBotRgb));
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 960, ARENA_HEIGHT);

    // --- 2. CELESTIAL STARS & NEBULA DUST (Fades in during Dusk & Night) ---
    if (!isTimeStopped && nightAlpha > 0.05) {
      ctx.save();
      const starAlpha = Math.min(1, nightAlpha * 1.3);
      for (const star of this.stars) {
        const twinkle = Math.sin(time * 0.06 + star.phase) * 0.25 + 0.75;
        const alpha = starAlpha * star.brightness * twinkle;
        if (alpha <= 0.02) continue;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        if (speedMult >= 20) {
          // Stars streak into slight horizontal speed arcs during Made in Heaven acceleration
          const streakLen = Math.min(28, (speedMult - 15) * 0.45);
          ctx.fillRect(star.x % 960, star.y, streakLen, Math.max(1, star.size * 0.8));
        } else {
          ctx.beginPath();
          ctx.arc(star.x % 960, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // --- 3. CELESTIAL SUN & MOON ORBITAL ARCS ---
    // Sun arc (Visible between Dawn and Sunset: ~0.95 to ~0.65)
    const isSunVisible = progress >= 0.92 || progress <= 0.68;
    if (!isTimeStopped && isSunVisible) {
      const sunNorm = (progress >= 0.92 ? progress - 0.92 : progress + 0.08) / 0.76;
      const sunTheta = sunNorm * Math.PI;
      const sunX = 80 + (1 - Math.cos(sunTheta)) / 2 * (960 - 160);
      const sunY = (GROUND_Y - 20) - Math.sin(sunTheta) * (GROUND_Y - 80);

      ctx.save();
      // Made in Heaven Solar Motion Blur Trails
      if (speedMult >= 8) {
        const trailAlpha = Math.min(0.7, (speedMult - 5) * 0.02);
        ctx.strokeStyle = `rgba(251, 191, 36, ${trailAlpha})`;
        ctx.lineWidth = Math.min(14, speedMult * 0.25);
        ctx.beginPath();
        ctx.arc(480, GROUND_Y + 10, GROUND_Y - 70, Math.PI + 0.1, Math.PI * 2 - 0.1);
        ctx.stroke();
      }

      // Solar Corona Glow
      const isLowSun = sunY > GROUND_Y - 100;
      const coronaRad = isLowSun ? 65 : 45;
      const coronaGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, coronaRad);
      if (isLowSun) {
        // Warm sunset/sunrise flare
        coronaGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coronaGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.8)');
        coronaGrad.addColorStop(0.7, 'rgba(234, 88, 12, 0.35)');
        coronaGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      } else {
        // Bright midday sun
        coronaGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coronaGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.85)');
        coronaGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.3)');
        coronaGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      }
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, coronaRad, 0, Math.PI * 2);
      ctx.fill();

      // Sun Solar Disc Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, isLowSun ? 15 : 12, 0, Math.PI * 2);
      ctx.fill();

      // Sun Rays when high in the sky
      if (!isLowSun && speedMult < 30) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 8; a++) {
          const ang = (time * 0.015) + (a * Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(ang) * 16, sunY + Math.sin(ang) * 16);
          ctx.lineTo(sunX + Math.cos(ang) * 28, sunY + Math.sin(ang) * 28);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Moon arc (Visible between Dusk and Dawn: ~0.45 to ~0.15)
    const isMoonVisible = progress >= 0.45 || progress <= 0.18;
    if (!isTimeStopped && isMoonVisible) {
      const moonNorm = (progress >= 0.45 ? progress - 0.45 : progress + 0.55) / 0.73;
      const moonTheta = moonNorm * Math.PI;
      const moonX = 80 + (1 - Math.cos(moonTheta)) / 2 * (960 - 160);
      const moonY = (GROUND_Y - 20) - Math.sin(moonTheta) * (GROUND_Y - 80);

      ctx.save();
      // Made in Heaven Lunar Motion Blur Trails
      if (speedMult >= 8) {
        const trailAlpha = Math.min(0.65, (speedMult - 5) * 0.018);
        ctx.strokeStyle = `rgba(186, 230, 253, ${trailAlpha})`;
        ctx.lineWidth = Math.min(12, speedMult * 0.22);
        ctx.beginPath();
        ctx.arc(480, GROUND_Y + 10, GROUND_Y - 70, Math.PI + 0.1, Math.PI * 2 - 0.1);
        ctx.stroke();
      }

      // Moon Soft Silver Corona
      const moonCorona = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 36);
      moonCorona.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      moonCorona.addColorStop(0.4, 'rgba(186, 230, 253, 0.5)');
      moonCorona.addColorStop(0.8, 'rgba(56, 189, 248, 0.15)');
      moonCorona.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = moonCorona;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Silver Moon Disc
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 11, 0, Math.PI * 2);
      ctx.fill();

      // Soft Moon Craters (Maria)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.beginPath();
      ctx.arc(moonX - 2.5, moonY - 3, 2.5, 0, Math.PI * 2);
      ctx.arc(moonX + 3, moonY + 1.5, 3.2, 0, Math.PI * 2);
      ctx.arc(moonX - 1.5, moonY + 4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // --- 4. DRIFTING CLOUDS WITH DYNAMIC SUN/MOON ILLUMINATION ---
    if (!isTimeStopped) {
      ctx.save();
      for (const cloud of this.clouds) {
        const cx = cloud.x % (960 + cloud.width + 100) - cloud.width / 2;
        const cy = cloud.y;

        // Cloud color depends on time of day
        let cloudColor: string;
        if (nightAlpha > 0.5) {
          // Night clouds (Dark indigo silver)
          cloudColor = `rgba(30, 41, 59, ${(cloud.opacity * 0.45).toFixed(3)})`;
        } else if (progress > 0.45 && progress < 0.75) {
          // Sunset golden-coral clouds
          cloudColor = `rgba(251, 146, 60, ${(cloud.opacity * 0.7).toFixed(3)})`;
        } else if (progress < 0.20) {
          // Dawn apricot clouds
          cloudColor = `rgba(253, 186, 116, ${(cloud.opacity * 0.65).toFixed(3)})`;
        } else {
          // Bright white daylight clouds
          cloudColor = `rgba(255, 255, 255, ${(cloud.opacity * 0.6).toFixed(3)})`;
        }

        ctx.fillStyle = cloudColor;
        ctx.beginPath();
        ctx.arc(cx, cy, cloud.height * 0.5, 0, Math.PI * 2);
        ctx.arc(cx + cloud.width * 0.25, cy - cloud.height * 0.2, cloud.height * 0.55, 0, Math.PI * 2);
        ctx.arc(cx + cloud.width * 0.5, cy - cloud.height * 0.3, cloud.height * 0.65, 0, Math.PI * 2);
        ctx.arc(cx + cloud.width * 0.75, cy - cloud.height * 0.15, cloud.height * 0.5, 0, Math.PI * 2);
        ctx.arc(cx + cloud.width, cy, cloud.height * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // --- 5. MADE IN HEAVEN HYPER-SPEED SINGULARITY OVERLAY ---
    // Extreme Time Acceleration & Universe Reset visual effects
    if (speedMult >= 40) {
      ctx.save();
      // Blinding cosmic orbital light rings
      const ringAlpha = Math.min(0.85, (speedMult - 30) * 0.005);
      const ringGrad = ctx.createLinearGradient(0, 0, 960, 0);
      ringGrad.addColorStop(0, `rgba(251, 191, 36, ${ringAlpha})`);
      ringGrad.addColorStop(0.5, `rgba(255, 255, 255, ${ringAlpha * 1.2})`);
      ringGrad.addColorStop(1, `rgba(56, 189, 248, ${ringAlpha})`);
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = Math.min(18, speedMult * 0.08);
      ctx.beginPath();
      ctx.ellipse(480, GROUND_Y - 40, 440, GROUND_Y - 100, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Cosmic gravitational speed streaks
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 12; s++) {
        const sx = ((time * (speedMult * 0.4) + s * 80) % 960);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx - 30, GROUND_Y);
        ctx.stroke();
      }

      // Ethereal Roman Numeral Celestial Clock Ring in the sky
      const clockRadius = 60;
      const clockX = 480;
      const clockY = 110;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(clockX, clockY, clockRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Rapidly spinning celestial clock hands
      const fastHandAngle = (time * (speedMult * 0.15)) % (Math.PI * 2);
      const hourHandAngle = (fastHandAngle / 12);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + Math.cos(fastHandAngle) * 45, clockY + Math.sin(fastHandAngle) * 45);
      ctx.stroke();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + Math.cos(hourHandAngle) * 28, clockY + Math.sin(hourHandAngle) * 28);
      ctx.stroke();

      // HUD Singularity Banner
      ctx.font = '900 13px "Impact", sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ MADE IN HEAVEN: ${Math.round(speedMult)}x TIME ACCELERATION ⚡`, 480, 185);

      ctx.restore();
    }

    // --- 6. PARALLAX LANDMARKS & CITY ILLUMINATION ---
    const parallaxOffset = -(cameraX * 0.35);

    ctx.save();
    ctx.translate(parallaxOffset, 0);

    const totalLandmarkWidth = Math.max(960 + 600, arenaWidth * 0.6);
    const isNightCity = nightAlpha > 0.35;
    const windowFlicker = speedMult > 10 ? (Math.floor(time / 2) % 2 === 0) : true;

    if (map.landmarkType === 'bridge') {
      // Cairo Bridge / Nile River / Venice Waterfront
      const buildingBase = isTimeStopped 
        ? 'rgba(5, 5, 10, 0.9)' 
        : isNightCity ? 'rgba(8, 12, 24, 0.85)' : 'rgba(15, 23, 42, 0.65)';
      ctx.fillStyle = buildingBase;

      const count = Math.ceil(totalLandmarkWidth / 50) + 10;
      for (let i = 0; i < count; i++) {
        const bx = i * 50;
        const bh = 70 + ((i * 37) % 80);
        ctx.fillRect(bx, GROUND_Y - bh, 42, bh);

        // Windows: Illuminated in warm gold/amber during night
        if (isNightCity && windowFlicker) {
          ctx.fillStyle = (i % 2 === 0) ? 'rgba(250, 204, 21, 0.75)' : 'rgba(186, 230, 253, 0.6)';
        } else {
          ctx.fillStyle = isTimeStopped 
            ? 'rgba(200, 200, 200, 0.2)' 
            : 'rgba(147, 197, 253, 0.2)';
        }
        for (let wy = GROUND_Y - bh + 10; wy < GROUND_Y - 10; wy += 15) {
          ctx.fillRect(bx + 8, wy, 6, 8);
          ctx.fillRect(bx + 24, wy, 6, 8);
        }
        ctx.fillStyle = buildingBase;
      }

      // Suspension Bridge Towers & Cables
      ctx.strokeStyle = isTimeStopped 
        ? 'rgba(148, 163, 184, 0.25)' 
        : isNightCity ? 'rgba(250, 204, 21, 0.45)' : 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(180, GROUND_Y - 260, 30, 260);
      ctx.strokeRect(750, GROUND_Y - 260, 30, 260);
      ctx.strokeRect(1450, GROUND_Y - 260, 30, 260);
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y - 60);
      ctx.quadraticCurveTo(180, GROUND_Y - 260, 465, GROUND_Y - 90);
      ctx.quadraticCurveTo(750, GROUND_Y - 260, 1100, GROUND_Y - 70);
      ctx.quadraticCurveTo(1450, GROUND_Y - 260, totalLandmarkWidth, GROUND_Y - 60);
      ctx.stroke();

    } else if (map.landmarkType === 'colosseum') {
      // Rome Colosseum / Ancient Arches
      const stoneColor = isTimeStopped 
        ? 'rgba(15, 23, 42, 0.9)' 
        : isNightCity ? 'rgba(15, 23, 42, 0.8)' : 'rgba(51, 65, 85, 0.7)';
      ctx.fillStyle = stoneColor;

      const archCount = Math.ceil(totalLandmarkWidth / 90) + 6;
      for (let i = 0; i < archCount; i++) {
        const ax = i * 90;
        ctx.fillRect(ax, GROUND_Y - 140, 75, 140);
        // Arch cutouts
        ctx.fillStyle = isNightCity ? 'rgba(2, 6, 23, 0.95)' : 'rgba(15, 23, 42, 0.5)';
        ctx.beginPath();
        ctx.arc(ax + 37.5, GROUND_Y - 75, 22, Math.PI, 0);
        ctx.rect(ax + 15.5, GROUND_Y - 75, 44, 75);
        ctx.fill();

        // Torchlight Braziers burning at night
        if (isNightCity && i % 2 === 0) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(ax + 37.5, GROUND_Y - 145, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = stoneColor;
      }

    } else if (map.landmarkType === 'dojo') {
      // Stand Spirit Dojo / Mountain Shrine Pagodas & Torii Gates
      const dojoColor = isNightCity ? 'rgba(10, 25, 20, 0.85)' : 'rgba(20, 45, 35, 0.7)';
      ctx.fillStyle = dojoColor;

      const pagodas = Math.ceil(totalLandmarkWidth / 140) + 4;
      for (let i = 0; i < pagodas; i++) {
        const px = i * 140;
        // Pagoda roofs
        ctx.beginPath();
        ctx.moveTo(px - 10, GROUND_Y - 100);
        ctx.lineTo(px + 40, GROUND_Y - 130);
        ctx.lineTo(px + 90, GROUND_Y - 100);
        ctx.closePath();
        ctx.fill();

        ctx.fillRect(px + 10, GROUND_Y - 100, 60, 100);

        // Hanging Japanese paper lanterns at night
        if (isNightCity) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.beginPath();
          ctx.arc(px + 5, GROUND_Y - 88, 4.5, 0, Math.PI * 2);
          ctx.arc(px + 75, GROUND_Y - 88, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = dojoColor;
      }

    } else {
      // Morioh Suburb / Green Dolphin Prison / Standard City Skyline
      const bColor = isTimeStopped 
        ? 'rgba(15, 23, 42, 0.9)' 
        : isNightCity ? 'rgba(10, 15, 30, 0.85)' : 'rgba(30, 41, 59, 0.65)';
      ctx.fillStyle = bColor;

      const count = Math.ceil(totalLandmarkWidth / 70) + 8;
      for (let i = 0; i < count; i++) {
        const bx = i * 70;
        const bh = 60 + ((i * 29) % 85);
        ctx.fillRect(bx, GROUND_Y - bh, 58, bh);

        // Pitched roof for suburb homes
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(bx - 4, GROUND_Y - bh);
          ctx.lineTo(bx + 29, GROUND_Y - bh - 24);
          ctx.lineTo(bx + 62, GROUND_Y - bh);
          ctx.closePath();
          ctx.fill();
        }

        // Glowing house & prison windows
        if (isNightCity && windowFlicker) {
          ctx.fillStyle = (i % 3 === 0) ? 'rgba(250, 204, 21, 0.85)' : 'rgba(254, 240, 138, 0.55)';
          ctx.fillRect(bx + 12, GROUND_Y - bh + 14, 12, 14);
          ctx.fillRect(bx + 34, GROUND_Y - bh + 14, 12, 14);
        }
        ctx.fillStyle = bColor;
      }

      // Morioh Radio Transmission Tower
      ctx.strokeStyle = isNightCity ? '#ef4444' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(420, GROUND_Y);
      ctx.lineTo(445, GROUND_Y - 220);
      ctx.lineTo(470, GROUND_Y);
      ctx.stroke();
      if (isNightCity) {
        // Red flashing tower beacon
        ctx.fillStyle = (Math.floor(time * 0.1) % 2 === 0) ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(445, GROUND_Y - 222, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawFloor(isTimeStopped?: boolean, arenaWidth: number = ARENA_WIDTH, fighters?: Fighter[]) {
    const ctx = this.ctx;
    const map = this.currentMap;
    const progress = this.celestialProgress;

    // Dynamically tint floor between bright daytime and deep shadowed midnight
    const isNight = progress > 0.65 || progress < 0.15;
    const mapFloor0 = this.hexToRgb(map.floorColors[0]);
    const mapFloor1 = this.hexToRgb(map.floorColors[1]);
    const mapFloor2 = this.hexToRgb(map.floorColors[2]);

    const dayFloor0: [number, number, number] = [mapFloor0[0] + 25, mapFloor0[1] + 25, mapFloor0[2] + 25];
    const nightFloor0: [number, number, number] = [Math.max(4, mapFloor0[0] - 15), Math.max(6, mapFloor0[1] - 15), Math.max(12, mapFloor0[2] - 10)];

    const currentFloor0 = isNight ? nightFloor0 : dayFloor0;

    const floorGrad = ctx.createLinearGradient(0, GROUND_Y, 0, ARENA_HEIGHT);
    if (isTimeStopped) {
      floorGrad.addColorStop(0, '#1e293b');
      floorGrad.addColorStop(0.3, '#0f172a');
      floorGrad.addColorStop(1, '#020617');
    } else {
      floorGrad.addColorStop(0, this.rgbToString(currentFloor0));
      floorGrad.addColorStop(0.25, this.rgbToString(mapFloor1));
      floorGrad.addColorStop(1, this.rgbToString(mapFloor2));
    }
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GROUND_Y, arenaWidth, ARENA_HEIGHT - GROUND_Y);

    ctx.strokeStyle = isTimeStopped ? '#94a3b8' : map.lineColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(arenaWidth, GROUND_Y);
    ctx.stroke();

    // Render Gappy Zero-Friction Strips on Floor
    if (fighters && fighters.length > 0) {
      for (const f of fighters) {
        if (f && f.gappyFrictionStrips && f.gappyFrictionStrips.length > 0) {
          for (const strip of f.gappyFrictionStrips) {
            if (strip.timer > 0) {
              ctx.save();
              ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2;
              ctx.fillRect(strip.x - strip.width / 2, GROUND_Y - 4, strip.width, 8);
              ctx.strokeRect(strip.x - strip.width / 2, GROUND_Y - 4, strip.width, 8);

              // Soapy shimmer bubbles on strip
              ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
              for (let b = -40; b <= 40; b += 20) {
                ctx.beginPath();
                ctx.arc(strip.x + b, GROUND_Y - 2, 3, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            }
          }
        }
      }
    }
  }

  private drawShadow(fighter: Fighter, isLocalParallelPOV: boolean = false) {
    if (!fighter || fighter.hp <= 0) return;
    const ctx = this.ctx;
    const axis = this.activeGravityAxis || 'down';
    const cx = fighter.x + fighter.width / 2;
    const cy = fighter.y + fighter.height / 2;

    ctx.save();
    if ((!!fighter.isParallelWorld) !== isLocalParallelPOV) {
      ctx.globalAlpha *= 0.22;
    }

    if (axis === 'right') {
      const arenaW = this.currentArenaWidth || ARENA_WIDTH || 960;
      const distToWall = Math.max(0, arenaW - (fighter.x + fighter.width));
      const scale = Math.max(0.3, 1 - distToWall / 200);
      const alpha = Math.max(0.1, 0.45 * scale);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(arenaW - 2, cy, 8 * scale, (fighter.height * 0.45) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (axis === 'left') {
      const distToWall = Math.max(0, fighter.x);
      const scale = Math.max(0.3, 1 - distToWall / 200);
      const alpha = Math.max(0.1, 0.45 * scale);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(2, cy, 8 * scale, (fighter.height * 0.45) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (axis === 'up') {
      const distToCeiling = Math.max(0, fighter.y);
      const scale = Math.max(0.3, 1 - distToCeiling / 200);
      const alpha = Math.max(0.1, 0.45 * scale);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, 2, (fighter.width * 0.9) * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const distanceToGround = Math.max(0, GROUND_Y - (fighter.y + fighter.height));
      const scale = Math.max(0.3, 1 - distanceToGround / 200);
      const alpha = Math.max(0.1, 0.45 * scale);

      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        GROUND_Y + 2,
        (fighter.width * 0.9) * scale,
        8 * scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWonderOfUShadow(wou: { x: number; y: number; active: boolean }) {
    if (!wou.active) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(wou.x + FIGHTER_WIDTH / 2, GROUND_Y + 2, FIGHTER_WIDTH * 0.9, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawWonderOfUEntity(wou: { x: number; y: number; vx: number; facing: 'left' | 'right'; active: boolean }, time: number, isTimeStopped?: boolean) {
    if (!wou.active) return;
    const ctx = this.ctx;
    const isFacingRight = wou.facing === 'right';
    const direction = isFacingRight ? 1 : -1;
    const isWalking = Math.abs(wou.vx) > 0.1;
    const walkCycle = isWalking ? Math.sin(time * 0.14) : 0;

    ctx.save();

    // 1. Dark Menacing Aura for Wonder of U
    const auraGrad = ctx.createRadialGradient(
      wou.x + FIGHTER_WIDTH / 2,
      wou.y + FIGHTER_HEIGHT / 2,
      10,
      wou.x + FIGHTER_WIDTH / 2,
      wou.y + FIGHTER_HEIGHT / 2,
      70
    );
    auraGrad.addColorStop(0, 'rgba(71, 85, 105, 0.45)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(wou.x - 50, wou.y - 50, FIGHTER_WIDTH + 100, FIGHTER_HEIGHT + 100);

    // 2. Articulated Model Coordinates
    const headRadius = 13;
    const headX = wou.x + FIGHTER_WIDTH / 2;
    const headY = wou.y + headRadius + 4;
    const neckX = headX;
    const neckY = headY + headRadius;
    const hipX = headX;
    const hipY = neckY + 36;

    // Legs with smooth walking cycle
    const legSwing = walkCycle * 14;
    const leftFootX = hipX - direction * 10 - legSwing;
    const leftFootY = wou.y + FIGHTER_HEIGHT;
    const rightFootX = hipX + direction * 10 + legSwing;
    const rightFootY = wou.y + FIGHTER_HEIGHT;

    const leftKneeX = (hipX + leftFootX) / 2 - direction * 4;
    const leftKneeY = hipY + 18;
    const rightKneeX = (hipX + rightFootX) / 2 + direction * 4;
    const rightKneeY = hipY + 18;

    // Hands with calm swing
    const armSwing = walkCycle * 10;
    const leftHandX = hipX - direction * 14 + armSwing;
    const leftHandY = hipY + 6;
    const rightHandX = hipX + direction * 14 - armSwing;
    const rightHandY = hipY + 6;

    // 3. Draw Limbs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Left Leg
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // Spine
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // Charcoal Tailored Tuxedo Coat
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(neckX - 10, neckY);
    ctx.lineTo(neckX + 10, neckY);
    ctx.lineTo(hipX + 14 * direction, hipY + 12);
    ctx.lineTo(hipX - 14 * direction, hipY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crimson Ascot Scarf
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(neckX - 4, neckY + 2);
    ctx.lineTo(neckX + 4, neckY + 2);
    ctx.lineTo(neckX, neckY + 12);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(neckX, neckY + 4);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.moveTo(neckX, neckY + 4);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();

    // Head (Mannequin/Porcelain Robotic Head)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Crimson Eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(headX + direction * 4, headY - 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Hat (Tall Cylindrical Bowler Hat with Spiked Antenna Ribbon)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // Brim
    ctx.beginPath();
    ctx.ellipse(headX, headY - headRadius + 2, headRadius + 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crown
    ctx.fillRect(headX - headRadius - 1, headY - headRadius - 14, (headRadius + 1) * 2, 16);
    ctx.strokeRect(headX - headRadius - 1, headY - headRadius - 14, (headRadius + 1) * 2, 16);

    // Spiked Ribbon / Feather on Hat
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX - direction * 6, headY - headRadius - 4);
    ctx.lineTo(headX - direction * 12, headY - headRadius - 20);
    ctx.lineTo(headX - direction * 16, headY - headRadius - 24);
    ctx.stroke();

    // Dedicated Floating Menacing Katakana SFX surrounding Wonder of U ("ゴゴゴ", "災")
    ctx.save();
    const sfxTime = time * 0.18;
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 8;
    ctx.font = '900 22px "Impact", "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';

    const off1 = Math.sin(sfxTime) * 6;
    const off2 = Math.cos(sfxTime * 1.3) * 6;

    // "ゴ" on left & right sides of Wonder of U
    ctx.strokeText('ゴ', headX - 38, headY - 10 + off1);
    ctx.fillText('ゴ', headX - 38, headY - 10 + off1);

    ctx.strokeText('ゴ', headX + 38, headY - 24 + off2);
    ctx.fillText('ゴ', headX + 38, headY - 24 + off2);

    // "災" / "ド" above Wonder of U
    ctx.font = '900 18px "Impact", "Comic Sans MS", cursive, sans-serif';
    ctx.strokeText('災', headX + 28, headY - 45 + off1);
    ctx.fillText('災', headX + 28, headY - 45 + off1);

    ctx.strokeText('ゴ', headX - 22, headY - 42 + off2);
    ctx.fillText('ゴ', headX - 22, headY - 42 + off2);

    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }

  private drawFighterWithStand(fighter: Fighter, opponent: Fighter, time: number, timeStopState?: TimeStopState, isLocalParallelPOV: boolean = false) {
    const ctx = this.ctx;
    const isFacingRight = fighter.facing === 'right';
    const isFrozen = fighter.isFrozenByTimeStop;
    const isSameDimension = (!!fighter.isParallelWorld) === isLocalParallelPOV;

    ctx.save();
    if (!isSameDimension) {
      // Phased out into different dimension: render faint and translucent ("lebih samar")
      ctx.globalAlpha = 0.32;
    }

    // 0. Render Supreme Boss Aura & Visual Ornaments
    if (fighter.isBoss) {
      this.drawBossSupremeAura(fighter, time);
    }

    const isMihFloating = fighter.charId === 'pucci' && fighter.pucciForm === 'made_in_heaven';
    const mihFloatOffsetY = isMihFloating ? (isFrozen ? -22 : -22 + Math.sin(time * 0.14) * 6) : 0;

    // Celestial Levitating Ground Shadow & Speed Ring Ripples beneath floating Made in Heaven Pucci
    if (isMihFloating) {
      ctx.save();
      // Soft hovering shadow on floor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(fighter.x + fighter.width / 2, 420 - 4, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsating Celestial Wind / Singularity Speed Ripples on Ground
      const rippleRad = 10 + (time * 24) % 36;
      const rippleAlpha = Math.max(0, 1 - rippleRad / 46) * 0.45;
      ctx.strokeStyle = `rgba(250, 204, 21, ${rippleAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(fighter.x + fighter.width / 2, 420 - 4, rippleRad, rippleRad * 0.26, 0, 0, Math.PI * 2);
      ctx.stroke();

      const rippleRad2 = 10 + ((time * 24) + 18) % 36;
      const rippleAlpha2 = Math.max(0, 1 - rippleRad2 / 46) * 0.45;
      ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha2})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(fighter.x + fighter.width / 2, 420 - 4, rippleRad2, rippleRad2 * 0.26, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 1. Draw Stand / Hamon Aura / Hermit Purple Vines
    if (fighter.standAlpha > 0 || fighter.action === 'star_finger' || fighter.action.startsWith('valentine_')) {
      ctx.save();
      ctx.globalAlpha = (fighter.action === 'star_finger' || fighter.action.startsWith('valentine_')) ? 1.0 : fighter.standAlpha * 0.95;

      if (fighter.charId === 'jonathan' || fighter.charId === 'joseph_young') {
        // Hamon Masters (No Stand Stickman) - Render Golden/Emerald Sunburst Overdrive Aura!
        this.drawHamonOverdriveAura(fighter, time);
      } else if (fighter.charId === 'joseph_old') {
        // Old Joseph - Render Hermit Purple Thorny Vines & Hamon Lightning (No Humanoid Stand)
        this.drawHermitPurpleStand(fighter, time);
      } else if (fighter.charId === 'tooru' || fighter.charId === 'stickman' || fighter.charId === 'vampire' || !fighter.hasStand) {
        // No floating humanoid spirit model for Tooru, Stickman, Vampires, or non-Stand users
      } else {
        // Humanoid Stand Users (Jotaro, DIO, Josuke, Diavolo, Polnareff, Pucci)
        const floatY = isFrozen ? 0 : (isMihFloating ? Math.sin(time * 0.18 + 0.8) * 8 : Math.sin(time * 0.08) * 8);
        const axis = this.activeGravityAxis || 'down';

        // Compute forward and up vectors in world coordinates based on active gravity axis
        let forwardX = isFacingRight ? 1 : -1;
        let forwardY = 0;
        let headX = 0;
        let headY = -1;

        if (axis === 'up') {
          forwardX = isFacingRight ? 1 : -1;
          forwardY = 0;
          headX = 0;
          headY = 1;
        } else if (axis === 'right') {
          forwardX = 0;
          forwardY = isFacingRight ? -1 : 1; // Facing right is UP (-Y), facing left is DOWN (+Y)
          headX = -1;
          headY = 0;
        } else if (axis === 'left') {
          forwardX = 0;
          forwardY = isFacingRight ? 1 : -1; // Facing right is DOWN (+Y), facing left is UP (-Y)
          headX = 1;
          headY = 0;
        }

        let standX = fighter.x - 32 * forwardX + 20 * headX + (floatY * headX) + fighter.standOffset.x;
        let standY = fighter.y - 32 * forwardY + 20 * headY + (floatY * headY) + fighter.standOffset.y + (isMihFloating ? mihFloatOffsetY : 0);

        // Dynamic Stand Attack Movement (Rushing forward along the forward vector in front of user to strike!)
        let attackRushDist = 0;
        if (fighter.action === 'punch') {
          attackRushDist = 56;
        } else if ((fighter.action as string) === 'heavy_punch') {
          attackRushDist = 64;
        } else if (fighter.action === 'barrage' || fighter.action === 'ora_beatdown' || (fighter.action as string) === 'dora_barrage' || fighter.action === 'valentine_d4c_barrage' || fighter.action === 'valentine_parallel_shift' || fighter.action === 'valentine_paradox_pull' || fighter.action === 'valentine_clone_summon') {
          attackRushDist = 68;
        } else if (fighter.action === 'donut_strike' || fighter.action === 'time_erase_ambush') {
          attackRushDist = 74;
        } else if (fighter.action === 'star_finger') {
          attackRushDist = 77;
        } else if (fighter.action === 'street_sign') {
          attackRushDist = 60;
        } else if (fighter.action === 'ray_of_light' || fighter.action === 'shooting_sword' || fighter.action === 'upward_thrust') {
          attackRushDist = 70;
        } else if (fighter.action === 'road_roller_pummel') {
          attackRushDist = 45;
        }

        standX += forwardX * attackRushDist;
        standY += forwardY * attackRushDist;

        // Aura Glow
        const auraGrad = ctx.createRadialGradient(
          standX + fighter.width / 2,
          standY + fighter.height / 2,
          10,
          standX + fighter.width / 2,
          standY + fighter.height / 2,
          70
        );
        
        const auraGlowMap: Record<string, string> = {
          purple: 'rgba(168, 85, 247, 0.45)',
          gold: 'rgba(234, 179, 8, 0.45)',
          crimson: 'rgba(225, 29, 72, 0.45)',
          cyan: 'rgba(6, 182, 212, 0.45)',
          emerald: 'rgba(16, 185, 129, 0.45)',
          grey: 'rgba(148, 163, 184, 0.45)',
        };

        const glowColor = auraGlowMap[fighter.auraColor] || 'rgba(168, 85, 247, 0.45)';
        auraGrad.addColorStop(0, glowColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.fillRect(standX - 50, standY - 50, fighter.width + 100, fighter.height + 100);

        this.drawStickmanModel(
          standX,
          standY,
          fighter,
          isFacingRight,
          true, // isStand
          fighter.standColor || '#94a3b8',
          time
        );
      }

      ctx.restore();
    }

    // Draw trail/afterimages (e.g. Diavolo Time Erase red afterimages or Pucci Made in Heaven celestial speed echoes)
    if (fighter.afterimages && fighter.afterimages.length > 0) {
      fighter.afterimages.forEach(img => {
        ctx.save();
        ctx.globalAlpha = img.alpha;
        const isMiHEcho = (img.charId === 'pucci' || fighter.charId === 'pucci') && fighter.pucciForm === 'made_in_heaven';
        const imgHoverY = isMiHEcho ? (isFrozen ? -22 : -22 + Math.sin(time * 0.14) * 6) : 0;

        // Draw Fighter Silhouette Afterimage
        this.drawStickmanModel(
          img.x,
          img.y + imgHoverY,
          fighter,
          img.facing === 'right',
          false, // isStand
          img.color,
          time
        );

        // For Made in Heaven, also draw the Stand's floating speed duplicate afterimage!
        if (isMiHEcho) {
          const isFacingRight = img.facing === 'right';
          const forwardX = isFacingRight ? 1 : -1;
          const standAfterX = img.x - 32 * forwardX + fighter.standOffset.x;
          const standAfterY = img.y + imgHoverY - 20 + fighter.standOffset.y;
          this.drawStickmanModel(
            standAfterX,
            standAfterY,
            fighter,
            isFacingRight,
            true, // isStand
            img.color,
            time
          );
        }

        ctx.restore();
      });
    }

    // 2. Draw Fighter Model (Optimized rendering without CPU ctx.filter)
    ctx.save();
    if (fighter.invulnerableTimer > 0 && Math.floor(fighter.invulnerableTimer / 2) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const fighterColor = isFrozen 
      ? '#64748b' // Desaturated grey tone when frozen in time stop
      : (fighter.color || '#cbd5e1');

    this.drawStickmanModel(
      fighter.x,
      fighter.y + mihFloatOffsetY,
      fighter,
      isFacingRight,
      false, // isStand
      fighterColor,
      time
    );

    // If frozen, draw subtle crystal time overlay
    if (isFrozen) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(fighter.x - 5, fighter.y - 5, fighter.width + 10, fighter.height + 10);
    }

    ctx.restore();

    // 3. Draw Skill Overlay Effects (Star Finger, Street Sign, Parry, Blood Drain)
    this.drawSkillVisuals(fighter, opponent, time);

    // 3.5. Draw Floating Manga Menacing SFX "ゴゴゴ" (Posing, Stand Active, Walking, Attacking, or Tooru)
    if (fighter.isStandActive || fighter.action === 'pose' || fighter.action === 'walk' || fighter.action === 'punch' || fighter.action === 'barrage' || fighter.isBoss || fighter.charId === 'tooru') {
      ctx.save();
      const sfxTime = time * 0.15;
      const menacingColor = fighter.charId === 'dio' ? '#facc15'
        : fighter.charId === 'gappy' ? '#38bdf8'
        : fighter.charId === 'crazy_diamond' ? '#38bdf8'
        : fighter.charId === 'king_crimson' ? '#fb7185'
        : fighter.charId === 'tooru' ? '#ef4444'
        : '#c084fc';
      ctx.fillStyle = menacingColor;
      ctx.strokeStyle = fighter.charId === 'tooru' ? '#450a0a' : '#2e1065';
      ctx.lineWidth = 2.5;
      ctx.font = '900 20px "Impact", "Comic Sans MS", cursive, sans-serif';
      ctx.textAlign = 'center';

      const dir = isFacingRight ? 1 : -1;
      const headX = fighter.x + fighter.width / 2;
      const headY = fighter.y - 15;

      const off1 = Math.sin(sfxTime) * 6;
      const off2 = Math.cos(sfxTime * 1.2) * 6;

      if (fighter.isStandActive || fighter.isBoss || fighter.charId === 'tooru') {
        ctx.strokeText('ゴ', headX - dir * 42, headY - 10 + off1);
        ctx.fillText('ゴ', headX - dir * 42, headY - 10 + off1);

        ctx.strokeText('ゴ', headX + dir * 42, headY - 25 + off2);
        ctx.fillText('ゴ', headX + dir * 42, headY - 25 + off2);

        if (fighter.charId === 'tooru') {
          // Extra menacing Katakana specifically for Tooru floating on his sides
          ctx.font = '900 24px "Impact", "Comic Sans MS", cursive, sans-serif';
          ctx.strokeText('ゴ', headX - 58, headY - 32 + off2);
          ctx.fillText('ゴ', headX - 58, headY - 32 + off2);

          ctx.strokeText('ゴ', headX + 58, headY - 42 + off1);
          ctx.fillText('ゴ', headX + 58, headY - 42 + off1);

          ctx.font = '900 18px "Impact", "Comic Sans MS", cursive, sans-serif';
          ctx.strokeText('災', headX - 28, headY - 48 + off1);
          ctx.fillText('災', headX - 28, headY - 48 + off1);
        }
      }

      if (fighter.action === 'walk') {
        ctx.font = '900 16px "Impact", "Comic Sans MS", cursive, sans-serif';
        const footY = fighter.y + fighter.height;
        ctx.strokeText('ドド', headX - dir * 30, footY - 5 + off1);
        ctx.fillText('ドド', headX - dir * 30, footY - 5 + off1);
      } else if (fighter.action === 'punch' || fighter.action === 'barrage') {
        ctx.font = '900 22px "Impact", "Comic Sans MS", cursive, sans-serif';
        const fistX = headX + dir * 55;
        ctx.strokeText('ド', fistX, headY + 10 + off2);
        ctx.fillText('ド', fistX, headY + 10 + off2);
      }

      ctx.restore();
    }

    // 4. Draw Gappy Specific Visual Overlays (Bubble Shield, Bubble Trap, Go Beyond Lines)
    if (fighter.gappyShieldActive && fighter.gappyShieldTimer && fighter.gappyShieldTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(fighter.x + fighter.width / 2, fighter.y + fighter.height / 2, 38, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fighter.x + fighter.width / 2 - 14, fighter.y + fighter.height / 2 - 20, 12, Math.PI * 1.1, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();
    }

    if (fighter.gappyTrappedTimer && fighter.gappyTrappedTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#7dd3fc';
      ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(fighter.x + fighter.width / 2, fighter.y + fighter.height / 2 - 10, 44, 56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fighter.x + fighter.width / 2 + 15, fighter.y + fighter.height / 2 - 22, 10, Math.PI * 0.2, Math.PI * 0.7);
      ctx.stroke();
      ctx.restore();
    }

    if (fighter.gappyGoBeyondActive) {
      ctx.save();
      const gx = fighter.gappyGoBeyondX || (fighter.x + fighter.width / 2);
      const gy = fighter.gappyGoBeyondY || (fighter.y + 20);
      const spinAngle = time * 0.8;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.2) {
        const r = a * 4;
        const px = gx + Math.cos(spinAngle + a) * r;
        const py = gy + Math.sin(spinAngle + a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(224, 242, 254, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (!isSameDimension) {
      // Subtle ethereal dimensional chromatic ring for phased out entities
      ctx.strokeStyle = fighter.isParallelWorld ? 'rgba(244, 114, 182, 0.45)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(fighter.x - 3, fighter.y - 8, fighter.width + 6, fighter.height + 12);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private drawBossSupremeAura(fighter: Fighter, time: number) {
    const ctx = this.ctx;
    const cx = fighter.x + fighter.width / 2;
    const cy = fighter.y + fighter.height / 2;
    const dir = fighter.facing === 'right' ? 1 : -1;
    const isDio = fighter.bossType === 'boss_dio' || (fighter.charId === 'dio' && fighter.isBoss);
    const isTooru = fighter.bossType === 'boss_tooru' || (fighter.charId === 'tooru' && fighter.isBoss);
    const isPucci = fighter.bossType === 'boss_pucci' || (fighter.charId === 'pucci' && fighter.isBoss);
    const GROUND_Y = 560;

    ctx.save();

    if (isTooru) {
      // --- SUPREME BOSS TOORU (CALAMITY WONDER) ---
      // 1. Ethereal Calamity Cyan-Slate Void Field
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 130);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
      grad.addColorStop(0.4, 'rgba(14, 165, 233, 0.4)');
      grad.addColorStop(0.75, 'rgba(30, 41, 59, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 130 + Math.sin(time * 0.15) * 12, 0, Math.PI * 2);
      ctx.fill();

      // 2. Floating Calamity Doctor Emblem / Medical Halo
      const crownY = fighter.y - 25 + Math.sin(time * 0.08) * 5;
      ctx.fillStyle = '#0ea5e9';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, crownY - 10, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Medical Cross inside emblem
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3, crownY - 17, 6, 14);
      ctx.fillRect(cx - 7, crownY - 13, 14, 6);

      // 3. Eye Glint
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx + dir * 10, fighter.y + 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Calamity Floor Sigil
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 4, 80 + Math.sin(time * 0.2) * 8, 18, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else if (isDio) {
      // --- SUPREME BOSS DIO (AWAKENED VAMPIRIC LORD) ---
      // 1. Dual Swirling Infernal Golden-Crimson Fire Field
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 125);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
      grad.addColorStop(0.35, 'rgba(239, 68, 68, 0.5)');
      grad.addColorStop(0.75, 'rgba(180, 83, 9, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 125 + Math.sin(time * 0.2) * 14, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rising Golden Infernal Flame Tongues around feet
      ctx.fillStyle = 'rgba(250, 204, 21, 0.75)';
      for (let i = 0; i < 7; i++) {
        const flameX = cx + Math.sin(time * 0.25 + i * 1.5) * 50;
        const flameY = fighter.y + fighter.height - ((time * 20 + i * 14) % 100);
        const sz = 12 + (i % 4) * 5;
        ctx.beginPath();
        ctx.arc(flameX, flameY, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Floating Golden Vampiric Crown / Dark Halo with Ruby Gems
      const crownY = fighter.y - 22 + Math.sin(time * 0.1) * 4;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 28, crownY + 10);
      ctx.lineTo(cx - 28, crownY - 16);
      ctx.lineTo(cx - 14, crownY);
      ctx.lineTo(cx, crownY - 24); // Center high crown spike
      ctx.lineTo(cx + 14, crownY);
      ctx.lineTo(cx + 28, crownY - 16);
      ctx.lineTo(cx + 28, crownY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red Ruby Gems on Crown
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, crownY - 12, 5, 0, Math.PI * 2);
      ctx.arc(cx - 16, crownY - 6, 3.5, 0, Math.PI * 2);
      ctx.arc(cx + 16, crownY - 6, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Demonic Eye Glint & Red Light Trail
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx + dir * 10, fighter.y + 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 5. Dark Golden Floor Vortex under Boss feet
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 4, 75 + Math.sin(time * 0.3) * 10, 16, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else if (isPucci) {
      // --- SUPREME BOSS PUCCI (MAIDEN OF HEAVEN) ---
      // 1. Holy Cosmic Purple-Golden Void Vortex
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 130);
      grad.addColorStop(0, 'rgba(192, 132, 252, 0.7)');
      grad.addColorStop(0.4, 'rgba(124, 58, 237, 0.45)');
      grad.addColorStop(0.75, 'rgba(250, 204, 21, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 130 + Math.sin(time * 0.25) * 14, 0, Math.PI * 2);
      ctx.fill();

      // 2. Spinning Clock Gears / Celestial Clock Halo
      const haloY = fighter.y - 28 + Math.sin(time * 0.08) * 5;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, haloY, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Clock hands spinning crazily inside halo
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, haloY);
      ctx.lineTo(cx + Math.cos(time * 0.1) * 16, haloY + Math.sin(time * 0.1) * 16);
      ctx.moveTo(cx, haloY);
      ctx.lineTo(cx + Math.cos(time * 0.5) * 20, haloY + Math.sin(time * 0.5) * 20);
      ctx.stroke();

      // 3. Glowing Eyes
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx + dir * 10, fighter.y + 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Holy Cross particles
      ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
      for (let i = 0; i < 4; i++) {
        const pX = cx + Math.sin(time * 0.2 + i * 2) * 45;
        const pY = fighter.y + fighter.height - ((time * 18 + i * 25) % 110);
        ctx.fillRect(pX - 2, pY - 7, 4, 14);
        ctx.fillRect(pX - 7, pY - 2, 14, 4);
      }

      // 5. Cosmic Purple Floor Ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 4, 80 + Math.sin(time * 0.3) * 12, 16, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // --- SUPREME BOSS DIAVOLO (EMPEROR OF ERASED TIME) ---
      // 1. Deep Nightmare Crimson Void Vortex
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
      grad.addColorStop(0, 'rgba(225, 29, 72, 0.75)');
      grad.addColorStop(0.45, 'rgba(136, 19, 55, 0.55)');
      grad.addColorStop(0.8, 'rgba(69, 10, 10, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 120 + Math.cos(time * 0.2) * 12, 0, Math.PI * 2);
      ctx.fill();

      // 2. Epitaph Third Forehead Eye (Future Sight)
      const epY = fighter.y - 12;
      ctx.fillStyle = '#fda4af';
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, epY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(cx, epY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Upward Pink Future-Sight Beam from Epitaph Eye
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, epY);
      ctx.lineTo(cx + Math.sin(time * 0.3) * 18, epY - 50);
      ctx.stroke();

      // 3. Undulating Shadow Tendrils around Boss
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const tAngle = time * 0.15 + i * (Math.PI * 0.35);
        const tx = cx + Math.cos(tAngle) * 65;
        const ty = cy + Math.sin(tAngle) * 48;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + Math.sin(tAngle) * 35, cy + Math.cos(tAngle) * 35, tx, ty);
        ctx.stroke();
      }

      // 4. Crimson Ground Ring
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 4, 70 + Math.sin(time * 0.25) * 10, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawHamonOverdriveAura(fighter: Fighter, time: number) {
    const ctx = this.ctx;
    const isJonathan = fighter.charId === 'jonathan';
    const cx = fighter.x + fighter.width / 2;
    const cy = fighter.y + fighter.height / 2;
    const coreColor = isJonathan ? 'rgba(250, 204, 21, 0.7)' : 'rgba(52, 211, 153, 0.7)';
    const outerColor = isJonathan ? 'rgba(234, 179, 8, 0.25)' : 'rgba(16, 185, 129, 0.25)';

    // 1. Radiant Sunburst Overdrive Aura Glow
    const pulse = Math.sin(time * 0.25) * 12;
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 75 + pulse);
    grad.addColorStop(0, coreColor);
    grad.addColorStop(0.4, isJonathan ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.5)');
    grad.addColorStop(0.8, outerColor);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 80 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric Radiant Breathing Pulse Waves (Hamon Breathing Rhythm / 波紋呼吸)
    for (let r = 1; r <= 3; r++) {
      const ringRadius = ((time * 25 + r * 28) % 85);
      const ringAlpha = Math.max(0, 1 - ringRadius / 85);
      ctx.strokeStyle = isJonathan 
        ? `rgba(253, 224, 71, ${ringAlpha * 0.75})` 
        : `rgba(110, 231, 183, ${ringAlpha * 0.75})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 8, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Chest & Diaphragm Radiant Breathing Solar Core
    const chestY = fighter.y + 30;
    const chestGrad = ctx.createRadialGradient(cx, chestY, 2, cx, chestY, 28);
    chestGrad.addColorStop(0, isJonathan ? 'rgba(255, 255, 255, 0.95)' : 'rgba(209, 250, 229, 0.95)');
    chestGrad.addColorStop(0.5, isJonathan ? 'rgba(250, 204, 21, 0.85)' : 'rgba(52, 211, 153, 0.85)');
    chestGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.arc(cx, chestY, 28, 0, Math.PI * 2);
    ctx.fill();

    // 4. Solar Electrical Sparks & Lightning Arcs Crackling
    ctx.strokeStyle = isJonathan ? '#facc15' : '#34d399';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (time * 0.2 + i * (Math.PI / 4)) % (Math.PI * 2);
      const r = 40 + Math.sin(time * 0.5 + i) * 15;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }

    // 5. Rising Golden/Emerald Sunlight Dust Particles
    ctx.fillStyle = isJonathan ? '#fde047' : '#a7f3d0';
    for (let i = 0; i < 6; i++) {
      const px = cx + Math.sin(time * 0.15 + i * 1.8) * 35;
      const py = cy + 40 - ((time * 22 + i * 16) % 85);
      const pSize = 1.5 + (i % 3);
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawHermitPurpleStand(fighter: Fighter, time: number) {
    const ctx = this.ctx;
    const dir = fighter.facing === 'right' ? 1 : -1;
    const cx = fighter.x + fighter.width / 2;
    const cy = fighter.y + fighter.height / 2;

    // 1. Purple Hermit Aura Glow
    const auraGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
    auraGrad.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
    auraGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.15)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.fill();

    // 2. Thorny Purple Vine Tendrils wrapping hands, torso and extending outwards
    ctx.strokeStyle = '#c084fc'; // Hermit Purple Main Vine Color
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Vine 1: Right Hand Arm Coil
    const rx = cx + 18 * dir;
    const ry = fighter.y + 35;
    ctx.beginPath();
    ctx.moveTo(cx, fighter.y + 25);
    ctx.bezierCurveTo(cx + 10 * dir, ry - 15, rx - 5 * dir, ry + 15, rx + 25 * dir, ry);
    ctx.stroke();

    // Vine 2: Left Hand Arm Coil
    const lx = cx - 18 * dir;
    const ly = fighter.y + 42;
    ctx.beginPath();
    ctx.moveTo(cx, fighter.y + 25);
    ctx.bezierCurveTo(cx - 10 * dir, ly - 10, lx + 5 * dir, ly + 10, lx - 20 * dir, ly - 5);
    ctx.stroke();

    // Vine 3: Torso Spiral Vines
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      const vy = fighter.y + 20 + i * 15;
      const wave = Math.sin(time * 0.2 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(cx - 20, vy);
      ctx.bezierCurveTo(cx - 5, vy - wave, cx + 5, vy + wave, cx + 20, vy);
      ctx.stroke();
    }

    // 3. Sharp Green/Yellow Thorns along the Vines
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;

    const thornPoints = [
      { x: rx + 10 * dir, y: ry - 4 },
      { x: rx + 20 * dir, y: ry + 2 },
      { x: lx - 10 * dir, y: ly - 6 },
      { x: cx + 12, y: fighter.y + 30 },
      { x: cx - 12, y: fighter.y + 45 },
    ];

    thornPoints.forEach((tp) => {
      ctx.beginPath();
      ctx.moveTo(tp.x, tp.y);
      ctx.lineTo(tp.x + 4 * dir, tp.y - 5);
      ctx.lineTo(tp.x + 6 * dir, tp.y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 4. Yellow Hamon Electricity Crackling along Vines
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 15 * dir, ry - 8);
    ctx.lineTo(rx + 22 * dir, ry + 4);
    ctx.stroke();
  }

  private drawSkillVisuals(fighter: Fighter, opponent: Fighter, time: number) {
    const ctx = this.ctx;
    const dir = fighter.facing === 'right' ? 1 : -1;

    // A. Star Finger (Jotaro) - Physical Elongated Index & Middle Fingers from Star Platinum's hand
    if (fighter.action === 'star_finger') {
      ctx.save();
      const floatY = fighter.isFrozenByTimeStop ? 0 : Math.sin(time * 0.08) * 8;
      const standX = fighter.x + (dir === 1 ? 13 : -13) + fighter.standOffset.x;
      const standY = fighter.y - 18 + floatY + fighter.standOffset.y;
      
      const originX = standX + (dir === 1 ? fighter.width + 10 : -10);
      const originY = standY + 30;
      const fingerLength = 140;
      const targetX = originX + dir * fingerLength;

      const joints = [0, 0.35, 0.7, 1.0];

      // Finger 1 (Index Finger) - Dark outline first for 3D physical depth
      ctx.strokeStyle = '#3b0764'; // Deep purple outline
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, originY - 5);
      for (let i = 1; i < joints.length; i++) {
        const jx = originX + dir * fingerLength * joints[i];
        const jy = originY - 5 + Math.sin(i) * 4;
        ctx.lineTo(jx, jy);
      }
      ctx.stroke();

      ctx.strokeStyle = '#a855f7'; // Star Platinum purple skin
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(originX, originY - 5);
      for (let i = 1; i < joints.length; i++) {
        const jx = originX + dir * fingerLength * joints[i];
        const jy = originY - 5 + Math.sin(i) * 4;
        ctx.lineTo(jx, jy);
      }
      ctx.stroke();

      ctx.strokeStyle = '#22d3ee'; // Cyan muscular highlights
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX, originY - 5);
      for (let i = 1; i < joints.length; i++) {
        const jx = originX + dir * fingerLength * joints[i];
        const jy = originY - 5 + Math.sin(i) * 4;
        ctx.lineTo(jx, jy);
      }
      ctx.stroke();

      // Finger 2 (Middle Finger)
      ctx.strokeStyle = '#3b0764'; // Deep purple outline
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, originY + 5);
      for (let i = 1; i < joints.length; i++) {
        const jx = originX + dir * (fingerLength + 10) * joints[i];
        const jy = originY + 5 + Math.cos(i) * 4;
        ctx.lineTo(jx, jy);
      }
      ctx.stroke();

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(originX, originY + 5);
      for (let i = 1; i < joints.length; i++) {
        const jx = originX + dir * (fingerLength + 10) * joints[i];
        const jy = originY + 5 + Math.cos(i) * 4;
        ctx.lineTo(jx, jy);
      }
      ctx.stroke();

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX, originY + 5);
      for (let i = 1; i < joints.length; i++) {
        const jx = originX + dir * (fingerLength + 10) * joints[i];
        const jy = originY + 5 + Math.cos(i) * 4;
        ctx.lineTo(jx, jy);
      }
      ctx.stroke();

      // Knuckle joint rings along fingers (Physical gold plated knuckle armor!)
      joints.forEach((ratio) => {
        const jx1 = originX + dir * fingerLength * ratio;
        const jy1 = originY - 5 + Math.sin(joints.indexOf(ratio)) * 4;
        const jx2 = originX + dir * (fingerLength + 10) * ratio;
        const jy2 = originY + 5 + Math.cos(joints.indexOf(ratio)) * 4;

        // Draw physical circular knuckle armor
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(jx1, jy1, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(jx2, jy2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Sharp gold physical fingertips with a small starburst flare (no laser!)
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      const tip1X = targetX;
      const tip1Y = originY - 5 + Math.sin(3) * 4;
      const tip2X = targetX + dir * 10;
      const tip2Y = originY + 5 + Math.cos(3) * 4;

      ctx.beginPath();
      ctx.arc(tip1X, tip1Y, 8, 0, Math.PI * 2);
      ctx.arc(tip2X, tip2Y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Small star sparkles at fingertips
      ctx.fillStyle = '#ffffff';
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        ctx.beginPath();
        ctx.moveTo(tip1X, tip1Y);
        ctx.lineTo(tip1X + Math.cos(angle) * 12, tip1Y + Math.sin(angle) * 12);
        ctx.lineTo(tip1X + Math.cos(angle + 0.2) * 3, tip1Y + Math.sin(angle + 0.2) * 3);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tip2X, tip2Y);
        ctx.lineTo(tip2X + Math.cos(angle) * 12, tip2Y + Math.sin(angle) * 12);
        ctx.lineTo(tip2X + Math.cos(angle + 0.2) * 3, tip2Y + Math.sin(angle + 0.2) * 3);
        ctx.closePath();
        ctx.fill();
      }

      // "STAR FINGER!!" Manga SFX Text
      ctx.font = '900 24px "Impact", sans-serif';
      ctx.fillStyle = '#22d3ee';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText('STAR FINGER!!', targetX - (dir === 1 ? 20 : 140), originY - 30);
      ctx.fillText('STAR FINGER!!', targetX - (dir === 1 ? 20 : 140), originY - 30);

      ctx.restore();
    }

    // B. Zoom Punch (Jonathan Joestar)
    if (fighter.action === 'zoom_punch') {
      ctx.save();
      const originX = fighter.x + (dir === 1 ? fighter.width : 0);
      const originY = fighter.y + 30;
      const targetX = originX + dir * 210;

      // Disjointed elongated arm
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, originY);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, originY);
      ctx.stroke();

      // Hamon rings along the arm
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 4; i++) {
        const ringX = originX + (dir * (210 / 5) * i);
        ctx.beginPath();
        ctx.ellipse(ringX, originY, 6, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Massive Hamon Fist at tip
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, originY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // C. Pluck & Luck Sword Slash (Jonathan Joestar)
    if (fighter.action === 'pluck_sword') {
      ctx.save();
      const sx = fighter.x + fighter.width / 2 + dir * 40;
      const sy = fighter.y + 20;

      // Golden Slash Arc
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(sx, sy, 55, -Math.PI * 0.4, Math.PI * 0.4, dir === -1);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 55, -Math.PI * 0.4, Math.PI * 0.4, dir === -1);
      ctx.stroke();

      // "PLUCK" Sword Text Aura
      ctx.font = '900 22px "Impact", sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText('PLUCK & LUCK!!', sx - 40, sy - 40);
      ctx.fillText('PLUCK & LUCK!!', sx - 40, sy - 40);

      ctx.restore();
    }

    // D. Next You're Gonna Say! (Young Joseph)
    if (fighter.action === 'tsugi_ni_omae_wa') {
      ctx.save();
      const bx = fighter.x + fighter.width / 2;
      const by = fighter.y - 40;

      // Comic Speech Bubble Box
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(bx - 110, by - 30, 220, 36);
      ctx.fill();
      ctx.stroke();

      // Text inside bubble
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#15803d';
      ctx.fillText('次にお前は「…」と言う！', bx - 95, by - 14);
      ctx.font = '900 11px sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('NEXT YOU\'RE GONNA SAY...!', bx - 85, by - 2);

      // Prediction Emerald Ring below feet
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(bx, fighter.y + fighter.height + 5, 50 + Math.sin(time * 0.4) * 6, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // E. Red Stone of Aja Beam Blast (Young Joseph)
    if (fighter.action === 'red_stone_beam') {
      ctx.save();
      const originX = fighter.x + (dir === 1 ? fighter.width + 10 : -10);
      const originY = fighter.y + 25;
      const beamLength = 400;

      // Intense Crimson Red Laser Beam
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + dir * beamLength, originY);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + dir * beamLength, originY);
      ctx.stroke();

      // Red Stone Crystal Sparkle at origin
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(originX, originY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // F. Polaroid Smash Flash (Old Joseph)
    if (fighter.action === 'polaroid_smash') {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;
      const cy = fighter.y + 25;

      // Blinding White Camera Flash Burst
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '900 24px "Impact", sans-serif';
      ctx.fillStyle = '#c084fc';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText('SPIRIT PHOTOGRAPHY!!', cx - 90, cy - 60);
      ctx.fillText('SPIRIT PHOTOGRAPHY!!', cx - 90, cy - 60);

      ctx.restore();
    }

    // G. Hermit Overdrive Surge (Old Joseph)
    if (fighter.action === 'hermit_overdrive_surge') {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;
      const cy = fighter.y + fighter.height / 2;

      // Giant Thorny Purple Electric Cocoon
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 80 + Math.sin(time * 0.3) * 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const angle = i * (Math.PI / 4) + time * 0.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 90);
        ctx.stroke();
      }

      ctx.restore();
    }

    // H. Street Sign Attack (DIO) - Animated 180° Heavy Downward Smash Arc!
    if (fighter.action === 'street_sign') {
      ctx.save();
      const progress = (fighter.actionDuration ? (fighter.actionDuration - fighter.actionTimer) : 0) / (fighter.actionDuration || 26);
      const swingAngle = -Math.PI * 0.6 + progress * Math.PI * 1.2;

      const signX = fighter.x + fighter.width / 2 + dir * 25;
      const signY = fighter.y + 15;

      ctx.translate(signX, signY);
      ctx.rotate(dir * swingAngle);

      // Steel Pole
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(0, -110);
      ctx.stroke();

      // Red/White Octagonal STOP Street Sign
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.rect(-30, -160, 60, 60);
      ctx.fill();
      ctx.stroke();

      // STOP text
      ctx.font = '900 18px "Impact", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('STOP', 0, -125);

      // Crimson Motion Arc Trail
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 135, -Math.PI * 0.5, swingAngle, dir === -1);
      ctx.stroke();

      ctx.restore();
    }

    // K. Lethal Donut Chop (Diavolo / King Crimson) - Physical Impaling Spear-Hand
    if (fighter.action === 'donut_strike' || fighter.action === 'time_erase_ambush') {
      ctx.save();
      const originX = fighter.x + (dir === 1 ? fighter.width : 0);
      const originY = fighter.y + 32;
      const reach = 80;
      const targetX = originX + dir * reach;

      // Draw jointed muscular crimson arm (shoulder -> elbow -> hand)
      const shoulderX = originX;
      const shoulderY = originY;
      const elbowX = originX + dir * reach * 0.45;
      const elbowY = originY - 6;
      const handX = targetX;
      const handY = originY;

      // Outer thick outline
      ctx.strokeStyle = '#9f1239'; // Dark crimson outline
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(handX, handY);
      ctx.stroke();

      // Main arm color
      ctx.strokeStyle = '#be123c'; // King Crimson Crimson
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(handX, handY);
      ctx.stroke();

      // White/light-pink details on arm (muscle definition & grid-like patterns)
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(shoulderX + dir * 5, shoulderY - 2);
      ctx.lineTo(elbowX, elbowY - 2);
      ctx.lineTo(handX - dir * 5, handY - 1);
      ctx.stroke();

      // Draw diamond-like grid segments on bicep/forearm
      ctx.fillStyle = '#fb7185';
      const points = [
        { x: (shoulderX + elbowX) / 2, y: (shoulderY + elbowY) / 2 },
        { x: (elbowX + handX) / 2, y: (elbowY + handY) / 2 },
      ];
      points.forEach((pt) => {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - 4);
        ctx.lineTo(pt.x + dir * 4, pt.y);
        ctx.lineTo(pt.x, pt.y + 4);
        ctx.lineTo(pt.x - dir * 4, pt.y);
        ctx.closePath();
        ctx.fill();
      });

      // Sharp Knife-Hand / Spear-Hand Tip
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(handX + dir * 22, handY);
      ctx.lineTo(handX, handY - 10);
      ctx.lineTo(handX - dir * 14, handY);
      ctx.lineTo(handX, handY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blood Spray Particles at Impact Point
      ctx.fillStyle = '#9f1239';
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + time * 0.3;
        const dist = 12 + (i % 5) * 10;
        ctx.beginPath();
        ctx.arc(handX + Math.cos(angle) * dist, handY + Math.sin(angle) * dist, 3 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }

      // Back Shockwave Ring bursting from opponent's back
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(handX + dir * 15, handY, 14, 34, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Onomatopoeia SFX "ドゴォオ!! (DONUT CHOP)"
      ctx.font = '900 28px "Impact", sans-serif';
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText('ドゴォオ!! (DONUT CHOP)', handX - (dir === 1 ? 20 : 180), handY - 45);
      ctx.fillText('ドゴォオ!! (DONUT CHOP)', handX - (dir === 1 ? 20 : 180), handY - 45);

      ctx.restore();
    }

    // L. Road Roller Ultimate (DIO)
    if (
      fighter.action === 'road_roller_startup' ||
      fighter.action === 'road_roller_drop' ||
      fighter.action === 'road_roller_pummel' ||
      fighter.action === 'road_roller_explode'
    ) {
      ctx.save();
      const progress = (fighter.actionDuration ? (fighter.actionDuration - fighter.actionTimer) : 0) / (fighter.actionDuration || 90);
      
      // The Road Roller falls directly on the opponent's center X coordinate!
      const targetX = opponent.x + opponent.width / 2;
      const dropY = Math.min(GROUND_Y - 80, -220 + progress * (GROUND_Y + 140));

      // 1. Draw Ground Target Indicator Shadow Underneath Target
      if (dropY < GROUND_Y - 80) {
        const shadowOpacity = Math.min(0.6, progress * 0.8);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(targetX, GROUND_Y - 5, 80, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Target Reticle (Red glowing lines indicating crush zone)
        ctx.strokeStyle = `rgba(239, 68, 68, ${shadowOpacity * 1.5})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(targetX, GROUND_Y - 5, 80, 16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Exhaust smoke pipe & puffs
      ctx.fillStyle = '#334155';
      ctx.fillRect(targetX - (dir === 1 ? 40 : -30), dropY - 85, 8, 20);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(targetX - (dir === 1 ? 40 : -30), dropY - 85, 8, 20);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
      ctx.beginPath();
      ctx.arc(targetX - (dir === 1 ? 36 : -34) + Math.sin(time * 0.5) * 4, dropY - 95, 8, 0, Math.PI * 2);
      ctx.arc(targetX - (dir === 1 ? 32 : -38) + Math.cos(time * 0.5) * 4, dropY - 105, 12, 0, Math.PI * 2);
      ctx.fill();

      // 3. Giant Yellow Steamroller Body
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.fillRect(targetX - 75, dropY - 65, 150, 80);
      ctx.strokeRect(targetX - 75, dropY - 65, 150, 80);

      // Warning hazard stripes on bumper (Black and Yellow)
      ctx.save();
      ctx.beginPath();
      ctx.rect(targetX - 70, dropY + 5, 140, 12);
      ctx.clip();
      ctx.fillStyle = '#1e293b'; // Dark background
      ctx.fillRect(targetX - 70, dropY + 5, 140, 12);
      ctx.fillStyle = '#facc15'; // Yellow diagonal stripes
      for (let s = -100; s < 100; s += 16) {
        ctx.beginPath();
        ctx.moveTo(targetX + s, dropY + 18);
        ctx.lineTo(targetX + s + 10, dropY + 18);
        ctx.lineTo(targetX + s + 18, dropY + 5);
        ctx.lineTo(targetX + s + 8, dropY + 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeRect(targetX - 70, dropY + 5, 140, 12);

      // Front Steel Roller Cylinder
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(targetX + (dir === 1 ? 55 : -55), dropY + 18, 30, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rear Heavy Wheels
      ctx.beginPath();
      ctx.ellipse(targetX + (dir === 1 ? -50 : 50), dropY + 22, 26, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glass Cabin Window
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(targetX - 25, dropY - 55, 50, 32);
      ctx.strokeRect(targetX - 25, dropY - 55, 50, 32);

      // TANK LORRY Label
      ctx.font = '900 16px "Impact", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('ROAD ROLLER', targetX, dropY - 30);

      // DIO Punching Flurry on Top of Roller ("WRYYYYY!!")
      if (progress > 0.2) {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const px = targetX + (Math.random() - 0.5) * 120;
          const py = dropY - 65 + (Math.random() - 0.5) * 35;
          ctx.beginPath();
          ctx.arc(px, py, 9 + Math.random() * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.font = '900 28px "Impact", sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.strokeText('ROAD ROLLER DA!! WRYYYYYY!!', targetX, dropY - 95);
        ctx.fillText('ROAD ROLLER DA!! WRYYYYYY!!', targetX, dropY - 95);
      }

      // Ground Impact Shockwave
      if (dropY >= GROUND_Y - 90) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
        ctx.beginPath();
        ctx.ellipse(targetX, GROUND_Y - 5, 140, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // M. Polnareff Silver Chariot Afterimage Mirage Clones
    if (fighter.action === 'afterimage_mirage') {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const cloneAngle = (i / 4) * Math.PI * 2 + time * 0.15;
        const cloneX = fighter.x + Math.cos(cloneAngle) * 85;
        const cloneY = fighter.y + Math.sin(cloneAngle) * 25;

        ctx.globalAlpha = 0.55;
        this.drawStickmanModel(cloneX, cloneY, fighter, dir === 1, false, '#38bdf8', time);

        // Rapier thrust line
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cloneX + 20 * dir, cloneY + 30);
        ctx.lineTo(fighter.x + (dir === 1 ? 130 : -90), fighter.y + 30);
        ctx.stroke();
      }
      ctx.restore();
    }

    // I. Parry Counter Shield (Jotaro)
    if (fighter.action === 'parry_stance' || fighter.isParrying) {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;
      const cy = fighter.y + fighter.height / 2;

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 55 + Math.sin(time * 0.4) * 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 62, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // J. Blood Drain (DIO)
    if (fighter.action === 'drain_blood') {
      ctx.save();
      const fx = fighter.x + (dir === 1 ? fighter.width + 10 : -10);
      const fy = fighter.y + 30;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(fx, fy + i * 8);
        ctx.bezierCurveTo(
          fx - dir * 15, fy - 10,
          fx - dir * 25, fy + 20,
          fighter.x + fighter.width / 2, fighter.y + 20
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // N. JOSUKE HIGASHIKATA (CRAZY DIAMOND) SKILLS VISUALS
    // 1. Skill 1: Homing Shard (Dora Restoration Pull)
    if (fighter.action === 'homing_shard') {
      ctx.save();
      const hx = fighter.x + (dir === 1 ? fighter.width + 15 : -15);
      const hy = fighter.y + 25;

      // Glowing Cyan Restoration Magic Circle at hand
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 22 + Math.sin(time * 0.4) * 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Restoration Sparkle Hexagon Runes
      for (let i = 0; i < 6; i++) {
        const angle = i * (Math.PI / 3) + time * 0.2;
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(hx + Math.cos(angle) * 18, hy + Math.sin(angle) * 18, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shard release flash ray
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + dir * 65, hy);
      ctx.stroke();

      // Onomatopoeia
      ctx.font = '900 22px "Impact", sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText('ドララッ! (HOMING SHARD)', hx - (dir === 1 ? 20 : 150), hy - 30);
      ctx.fillText('ドララッ! (HOMING SHARD)', hx - (dir === 1 ? 20 : 150), hy - 30);

      ctx.restore();
    }

    // 2. Skill 2: Angelo Wall (Rock Trap Monolith encasing target)
    if (opponent.angeloWallTimer > 0 || fighter.action === 'rock_trap') {
      ctx.save();
      const targetFighter = opponent.angeloWallTimer > 0 ? opponent : opponent;
      const rockX = targetFighter.x + targetFighter.width / 2;
      const rockBaseY = GROUND_Y;
      const rockW = 90;
      const rockH = 115;

      // A. Ground Crack Shockwaves around base
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(rockX, rockBaseY - 5, rockW * 0.7, 18, 0, 0, Math.PI * 2);
      ctx.stroke();

      // B. Giant Carved Granite Angelo Monolith Rock
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rockX - rockW * 0.45, rockBaseY);
      ctx.lineTo(rockX - rockW * 0.5, rockBaseY - rockH * 0.5);
      ctx.lineTo(rockX - rockW * 0.35, rockBaseY - rockH * 0.85);
      ctx.lineTo(rockX - rockW * 0.15, rockBaseY - rockH);
      ctx.lineTo(rockX + rockW * 0.25, rockBaseY - rockH * 0.95);
      ctx.lineTo(rockX + rockW * 0.45, rockBaseY - rockH * 0.75);
      ctx.lineTo(rockX + rockW * 0.5, rockBaseY - rockH * 0.4);
      ctx.lineTo(rockX + rockW * 0.45, rockBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // C. Rock Texture & Cracks with Glowing Cyan Restoration Light Seams
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rockX - 25, rockBaseY - 30);
      ctx.lineTo(rockX - 5, rockBaseY - 60);
      ctx.lineTo(rockX + 20, rockBaseY - 45);
      ctx.moveTo(rockX - 10, rockBaseY - 80);
      ctx.lineTo(rockX + 15, rockBaseY - 95);
      ctx.stroke();

      // D. Iconic Carved "Angelo" Face embedded in the Stone
      const faceY = rockBaseY - rockH * 0.55;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;

      // Brow and nose
      ctx.fillRect(rockX - 14, faceY - 10, 28, 4);
      ctx.fillRect(rockX - 3, faceY - 10, 6, 18);
      // Depressed angry stone eyes
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(rockX - 12, faceY - 4, 6, 4);
      ctx.fillRect(rockX + 6, faceY - 4, 6, 4);
      // Stone mouth
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rockX - 10, faceY + 12, 20, 5);

      // E. Green Moss Patches on Stone
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(rockX - rockW * 0.35, rockBaseY - 20, 8, 0, Math.PI * 2);
      ctx.arc(rockX + rockW * 0.3, rockBaseY - 35, 10, 0, Math.PI * 2);
      ctx.arc(rockX - rockW * 0.1, rockBaseY - rockH + 12, 6, 0, Math.PI * 2);
      ctx.fill();

      // F. Comic Text: "Yo, Angelo! 🗿"
      ctx.font = '900 24px "Impact", sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.strokeText('🪨 YO, ANGELO!! (アンジェロ岩)', rockX, rockBaseY - rockH - 20);
      ctx.fillText('🪨 YO, ANGELO!! (アンジェロ岩)', rockX, rockBaseY - rockH - 20);

      ctx.restore();
    }

    // 3. Skill 3: Bearing Shot (Metallic Sniper Flick)
    if (fighter.action === 'bearing_shot') {
      ctx.save();
      const fx = fighter.x + (dir === 1 ? fighter.width + 12 : -12);
      const fy = fighter.y + 20;

      // Supersonic concentric rings bursting from finger
      for (let r = 1; r <= 3; r++) {
        const rad = r * 16 + (time * 20 % 20);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.9 - r * 0.25})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(fx + dir * (r * 12), fy, rad * 0.5, rad, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Laser trajectory line
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + dir * 300, fy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flash star on finger tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '900 22px "Impact", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText('🎯 BEARING SHOT! (弾丸弾き)', fx - (dir === 1 ? 20 : 160), fy - 30);
      ctx.fillText('🎯 BEARING SHOT! (弾丸弾き)', fx - (dir === 1 ? 20 : 160), fy - 30);

      ctx.restore();
    }

    // 4. Skill 4: Enraged Mode Aura & Dora Counter Shield
    if (fighter.action === 'enraged_stagger' || (fighter.isEnraged && fighter.charId === 'crazy_diamond')) {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;
      const cy = fighter.y + fighter.height / 2;

      // Billowing Fiery Crimson/Orange Fury Flames
      for (let i = 0; i < 8; i++) {
        const flameOffset = Math.sin(time * 0.3 + i) * 20;
        const flameH = 45 + Math.cos(time * 0.4 + i * 2) * 20;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(239, 68, 68, 0.65)' : 'rgba(249, 115, 22, 0.65)';
        ctx.beginPath();
        ctx.moveTo(cx + flameOffset - 12, fighter.y + fighter.height);
        ctx.quadraticCurveTo(cx + flameOffset, cy - flameH, cx + flameOffset + 12, fighter.y + fighter.height);
        ctx.fill();
      }

      // Glowing Red Eye glint & Anger Veins 💢
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(fighter.x + fighter.width / 2 + dir * 8, fighter.y + 14, 4, 0, Math.PI * 2);
      ctx.fill();

      // Comic Anger Mark 💢 over Pompadour
      ctx.font = '900 26px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText('💢', cx + dir * 14, fighter.y - 12);
      ctx.fillText('💢', cx + dir * 14, fighter.y - 12);

      // Iconic Quote
      ctx.font = '900 20px "Impact", sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.strokeText('俺の頭にケチつけたなーっ!!', cx - 110, fighter.y - 35);
      ctx.fillText('俺の頭にケチつけたなーっ!!', cx - 110, fighter.y - 35);

      ctx.restore();
    } else if (fighter.charId === 'crazy_diamond' && (fighter.action === 'parry_stance' || fighter.isParrying)) {
      ctx.save();
      const cx = fighter.x + fighter.width / 2 + dir * 28;
      const cy = fighter.y + fighter.height / 2;

      // Hexagonal Crystalline Diamond Shield
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const hexR = 54 + Math.sin(time * 0.3) * 4;
      for (let i = 0; i < 6; i++) {
        const angle = i * (Math.PI / 3);
        const hx = cx + Math.cos(angle) * hexR;
        const hy = cy + Math.sin(angle) * hexR;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heart Gem in Center of Shield
      this.drawHeart(ctx, cx, cy, 10, '#f43f5e', '#ffffff');

      ctx.restore();
    }

    // 5. Skill 5: Restored Rock Wall Barrier (Rock Shield)
    if (fighter.rockShieldTimer && fighter.rockShieldTimer > 0 && fighter.rockShieldX !== undefined) {
      ctx.save();
      const wallX = fighter.rockShieldX;
      const wallBaseY = GROUND_Y;
      const wallW = 44;
      const wallH = 125;

      // Masonry Stone Barrier Block
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.fillRect(wallX - wallW / 2, wallBaseY - wallH, wallW, wallH);
      ctx.strokeRect(wallX - wallW / 2, wallBaseY - wallH, wallW, wallH);

      // Stacked brick seams
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let y = wallBaseY - wallH + 20; y < wallBaseY; y += 20) {
        ctx.beginPath();
        ctx.moveTo(wallX - wallW / 2, y);
        ctx.lineTo(wallX + wallW / 2, y);
        ctx.stroke();
      }

      // Glowing Cyan Restoration Mortar & Seams
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wallX, wallBaseY - wallH);
      ctx.lineTo(wallX, wallBaseY);
      ctx.stroke();

      // Protective Heart Emblem on Barrier
      this.drawHeart(ctx, wallX, wallBaseY - wallH / 2, 7, '#06b6d4', '#e0f2fe');

      // Barrier glow aura
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 6;
      ctx.strokeRect(wallX - wallW / 2 - 4, wallBaseY - wallH - 4, wallW + 8, wallH + 8);

      ctx.restore();
    }

    // 6. Ultimate: Ground Punch (Crazy Diamond Earth Shatter & Restoration Wave)
    if (fighter.action === 'ground_punch') {
      ctx.save();
      const originX = fighter.x + (dir === 1 ? fighter.width + 10 : -10);
      const groundY = GROUND_Y;

      // Impact crater at Crazy Diamond's fists
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.ellipse(originX, groundY - 5, 55, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Multi-Tiered Shattered Rock Slabs Erupting from the Earth
      const progress = (fighter.actionDuration ? (fighter.actionDuration - fighter.actionTimer) : 0) / (fighter.actionDuration || 45);
      const slabCount = 7;
      for (let i = 1; i <= slabCount; i++) {
        const slabX = originX + dir * (i * 45);
        const slabProgress = Math.max(0, Math.min(1, progress * 2 - i * 0.12));
        const slabH = Math.sin(slabProgress * Math.PI) * (40 + (i % 3) * 20);
        const slabW = 28;

        if (slabH > 2) {
          // Rock slab
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(slabX - slabW / 2, groundY);
          ctx.lineTo(slabX - slabW * 0.4, groundY - slabH);
          ctx.lineTo(slabX + slabW * 0.4, groundY - slabH * 0.9);
          ctx.lineTo(slabX + slabW / 2, groundY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Restoration Energy Arcs connecting slabs
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(slabX, groundY - slabH);
          ctx.lineTo(slabX - dir * 30, groundY - 15);
          ctx.stroke();

          // Sparkle at peak
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(slabX, groundY - slabH, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Massive Manga Headline: "ドララララララァーーッ!! (DORARARA!!)"
      ctx.font = '900 32px "Impact", sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';
      const textX = originX + dir * 140;
      ctx.strokeText('ドララララララァーーッ!! (DORARARA SMASH!!)', textX, groundY - 120);
      ctx.fillText('ドララララララァーーッ!! (DORARARA SMASH!!)', textX, groundY - 120);

      ctx.restore();
    }

    // --- FUNNY VALENTINE (PART 7: STEEL BALL RUN) SKILLS ---

    // 1. Skill 1: Parallel World Shift / Flag Sandwich (DOJYAA~~N!)
    if (fighter.action === 'valentine_parallel_shift') {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;
      const cy = fighter.y + fighter.height / 2;

      // Spacetime Dimensional Fracture Vortex
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      for (let a = 0; a < 8; a++) {
        const angle = (time * 0.2 + a * (Math.PI / 4));
        const rad1 = 15;
        const rad2 = 55 + Math.sin(time * 0.4 + a) * 15;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * rad1, cy + Math.sin(angle) * rad1);
        ctx.lineTo(cx + Math.cos(angle) * rad2, cy + Math.sin(angle) * rad2);
        ctx.stroke();
      }

      // Glowing Dimensional Ring on Ground
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, fighter.y + fighter.height, 45, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Manga Text: "「どぎゃあああ〜〜〜ん!!」 (DOJYAA~~N!)"
      ctx.font = '900 24px "Impact", sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.strokeText('「どぎゃあああ〜〜〜ん!!」 (DOJYAA~~N!)', cx, fighter.y - 30);
      ctx.fillText('「どぎゃあああ〜〜〜ん!!」 (DOJYAA~~N!)', cx, fighter.y - 30);

      ctx.restore();
    }

    // 2. Skill 2: Paradox Pull (Gravitational Colliding Tether)
    if (fighter.action === 'valentine_paradox_pull' && opponent) {
      ctx.save();
      const valX = fighter.x + fighter.width / 2;
      const valY = fighter.y + fighter.height / 2;
      const oppX = opponent.x + opponent.width / 2;
      const oppY = opponent.y + opponent.height / 2;

      // Gravitational Lightning Arcs between Valentine and Opponent
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(valX, valY);
      const segments = 6;
      for (let s = 1; s < segments; s++) {
        const segX = valX + (oppX - valX) * (s / segments);
        const segY = valY + (oppY - valY) * (s / segments) + (Math.random() - 0.5) * 24;
        ctx.lineTo(segX, segY);
      }
      ctx.lineTo(oppX, oppY);
      ctx.stroke();

      // Inner cyan lightning core
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Magnetic Vortex Swirl at Opponent's Location
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.ellipse(oppX, oppY, r * 16, r * 8, time * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Manga Text: "「引力磁場ッ!! PARADOX PULL!」"
      ctx.font = '900 20px "Impact", sans-serif';
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      const midX = (valX + oppX) * 0.5;
      ctx.strokeText('「引力磁場ッ!! PARADOX COLLISION!」', midX, Math.min(valY, oppY) - 25);
      ctx.fillText('「引力磁場ッ!! PARADOX COLLISION!」', midX, Math.min(valY, oppY) - 25);

      ctx.restore();
    }

    // 3. Skill 3: Clone Reinforcements Summon
    if (fighter.action === 'valentine_clone_summon') {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;
      const cy = fighter.y + fighter.height / 2;

      // Twin Dimensional Portal Slits on Left and Right
      for (const side of [-1, 1]) {
        const portalX = cx + side * 50;
        const portalY = cy;

        // Dimensional Slit
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(portalX, portalY, 14, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Parting Flag Ribbon Sparks
        ctx.fillStyle = '#facc15';
        for (let sp = 0; sp < 4; sp++) {
          const spX = portalX + Math.sin(time * 0.3 + sp) * 12;
          const spY = portalY + Math.cos(time * 0.3 + sp) * 30;
          ctx.beginPath();
          ctx.arc(spX, spY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Manga Text: "「隣りの世界から!! CLONE REINFORCEMENTS!」"
      ctx.font = '900 20px "Impact", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.strokeText('「隣りの世界から!! CLONES DEPLOY!」', cx, fighter.y - 25);
      ctx.fillText('「隣りの世界から!! CLONES DEPLOY!」', cx, fighter.y - 25);

      ctx.restore();
    }

    // 4. Ultimate: Love Train Sacred Wall Awakening
    if (fighter.action === 'valentine_love_train') {
      ctx.save();
      const cx = fighter.x + fighter.width / 2;

      // Radiant Burst Pillar of Golden Light
      const grad = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 80, 0, 160, 540);

      // Holy Ascension Cross Particles
      for (let c = 0; c < 6; c++) {
        const crossY = (540 - (time * 6 + c * 80) % 540);
        const crossX = cx + Math.sin(time * 0.1 + c) * 40;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(crossX - 6, crossY - 1, 12, 2);
        ctx.fillRect(crossX - 1, crossY - 6, 2, 12);
      }

      // Massive Manga Headline: "「隙間 (LOVE TRAIN) 聖なる光の壁ッ!!」"
      ctx.font = '900 26px "Impact", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';
      ctx.strokeText('「隙間 (LOVE TRAIN) 聖なる光の壁ッ!!」', cx, 60);
      ctx.fillText('「隙間 (LOVE TRAIN) 聖なる光の壁ッ!!」', cx, 60);

      ctx.restore();
    }
  }

  private calcElbow(
    sx: number,
    sy: number,
    hx: number,
    hy: number,
    armSide: number,
    direction: number
  ) {
    const midX = (sx + hx) * 0.5;
    const midY = (sy + hy) * 0.5;
    const dx = hx - sx;
    const dy = hy - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Natural elbow flex outwards from body and downward
    const flex = Math.max(2, 8 - dist * 0.1);
    const elbowX = midX + armSide * direction * flex * 0.5;
    const elbowY = midY + flex * 0.8 + 2;

    return { x: elbowX, y: elbowY };
  }

  private drawStickmanModel(
    x: number,
    y: number,
    fighter: Fighter,
    facingRight: boolean,
    isStand: boolean,
    mainColor: string,
    time: number
  ) {
    const ctx = this.ctx;
    const gravityAxis = this.activeGravityAxis || 'down';
    let direction = facingRight ? 1 : -1;
    if (gravityAxis === 'up') {
      // In ceiling orientation, local X is inverted by the 180 degree rotation, so invert local direction
      direction = facingRight ? -1 : 1;
    }

    let actionToDraw: string = fighter.action;
    if (!isStand && (fighter.standAlpha > 0.5 || fighter.action.startsWith('valentine_'))) {
      // If the Stand is active and doing an attack, the user should stay in a commanding pose!
      if (
        actionToDraw === 'punch' || 
        actionToDraw === 'barrage' || 
        actionToDraw === 'ora_beatdown' || 
        (actionToDraw as string) === 'dora_barrage' ||
        actionToDraw === 'donut_strike' ||
        actionToDraw === 'time_erase_ambush' ||
        actionToDraw === 'star_finger' ||
        actionToDraw === 'street_sign' ||
        actionToDraw.startsWith('valentine_')
      ) {
        actionToDraw = 'command_pose';
      }
    }

    ctx.save();
    ctx.translate(x + fighter.width / 2, y + fighter.height / 2);

    if (fighter.dipezInvisibleTimer && fighter.dipezInvisibleTimer > 0) {
      ctx.globalAlpha = 0.18; // Translucent photon ghost contour for player visibility while invisible to enemies!
    }

    // Apply C-Moon Dynamic Gravity Axis rotation
    if (gravityAxis === 'right') {
      ctx.rotate(-Math.PI / 2);
    } else if (gravityAxis === 'left') {
      ctx.rotate(Math.PI / 2);
    } else if (gravityAxis === 'up') {
      ctx.rotate(Math.PI);
    }

    ctx.translate(0, -fighter.height / 2);

    ctx.lineWidth = isStand ? 4.5 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const auraOutlineMap: Record<string, string> = {
      purple: '#c084fc',
      gold: '#facc15',
      crimson: '#fb7185',
      cyan: '#38bdf8',
      emerald: '#34d399',
      grey: '#94a3b8',
    };
    
    ctx.strokeStyle = isStand 
      ? (auraOutlineMap[fighter.auraColor] || '#c084fc') 
      : '#0f172a';

    let headRadius = 14;
    let headX = 0;
    let headY = 16;
    let neckX = 0;
    let neckY = headY + headRadius; // 30
    let hipX = 0;
    let hipY = neckY + 36; // 66

    // Default Arm Positions (Lengthened down to waist level!)
    // When idle: Hands hang down naturally at waist/hip height (y = 64 to 68)
    let leftHandX = -14 * direction;
    let leftHandY = hipY - 2;
    let rightHandX = 14 * direction;
    let rightHandY = hipY + 2;

    let leftFootX = -14 * direction;
    let leftFootY = fighter.height;
    let rightFootX = 14 * direction;
    let rightFootY = fighter.height;

    // Default Knee Joints
    let leftKneeX = leftFootX * 0.5 - 3 * direction;
    let leftKneeY = hipY + (leftFootY - hipY) * 0.5;
    let rightKneeX = rightFootX * 0.5 + 3 * direction;
    let rightKneeY = hipY + (rightFootY - hipY) * 0.5;

    // --- ACTION POSES ---
    if (isStand) {
      // STAND FLOATING HOVER POSE (Stands float in mid-air above ground with aura glow)
      const floatBob = Math.sin(time * 0.12) * 6;
      headY = 10 - floatBob;
      neckY = headY + headRadius;
      hipY = neckY + 34;

      // Both legs float suspended gracefully in mid-air above ground
      leftFootX = -8 * direction;
      leftFootY = hipY + 32;
      leftKneeX = -12 * direction;
      leftKneeY = hipY + 16;

      rightFootX = 10 * direction;
      rightFootY = hipY + 28;
      rightKneeX = 8 * direction;
      rightKneeY = hipY + 14;

      if (actionToDraw === 'punch') {
        if (fighter.charId === 'funny_valentine') {
          // D4C Stand Combo: 2 consecutive powerful forward punches!
          const timer = fighter.actionTimer || 0;
          const dur = fighter.actionDuration || 26;
          if (timer > 11) {
            // Hit 1: D4C right arm thrusts forward
            const punch1Prog = Math.sin(Math.min(1, Math.max(0, (dur - 3 - timer) / 9)) * Math.PI);
            headX = 8 * direction;
            neckX = 4 * direction;
            rightHandX = (24 + punch1Prog * 62) * direction;
            rightHandY = neckY + 2;
            leftHandX = -10 * direction;
            leftHandY = hipY - 2;
          } else {
            // Hit 2: D4C left arm lunges forward forcefully
            const punch2Prog = Math.sin(Math.min(1, Math.max(0, (11 - timer) / 9)) * Math.PI);
            headX = 14 * direction;
            neckX = 8 * direction;
            leftHandX = (24 + punch2Prog * 68) * direction;
            leftHandY = neckY + 3;
            rightHandX = -6 * direction;
            rightHandY = hipY;
          }
        } else {
          const punchProgress = (fighter.actionDuration ? (fighter.actionDuration - fighter.actionTimer) : 0) / (fighter.actionDuration || 14);
          const reach = Math.sin(punchProgress * Math.PI) * 52;
          rightHandX = (24 + reach) * direction;
          rightHandY = neckY + 4;
          leftHandX = -10 * direction;
          leftHandY = hipY - 2;
        }
      } else if (actionToDraw === 'barrage' || actionToDraw === 'ora_beatdown' || (actionToDraw as string) === 'dora_barrage' || actionToDraw === 'valentine_d4c_barrage') {
        rightHandX = (40 + Math.random() * 16) * direction;
        rightHandY = neckY + Math.sin(time * 2.5) * 18;
        leftHandX = (34 + Math.random() * 14) * direction;
        leftHandY = neckY + Math.cos(time * 2.5) * 18;
        this.drawBarrageFlurryArms(ctx, neckX, neckY, direction, mainColor, time, fighter.charId);
      } else if (actionToDraw === 'donut_strike' || actionToDraw === 'time_erase_ambush') {
        headX = 22 * direction;
        neckX = 14 * direction;
        hipX = -8 * direction;
        rightHandX = 85 * direction;
        rightHandY = neckY + 2;
        leftHandX = -14 * direction;
        leftHandY = hipY;
      } else if (actionToDraw === 'star_finger') {
        headX = 16 * direction;
        neckX = 10 * direction;
        rightHandX = 65 * direction;
        rightHandY = neckY - 2;
        leftHandX = -12 * direction;
        leftHandY = hipY - 2;
      } else if (actionToDraw === 'star_vacuum') {
        headX = -10 * direction;
        neckX = -6 * direction;
        leftHandX = -45 * direction;
        rightHandX = 55 * direction;
        leftHandY = neckY - 10;
        rightHandY = neckY - 10;
      } else if (actionToDraw === 'street_sign') {
        headX = 14 * direction;
        neckX = 10 * direction;
        rightHandX = 40 * direction;
        rightHandY = neckY + 25;
        leftHandX = 28 * direction;
        leftHandY = neckY + 25;
      } else if (actionToDraw === 'homing_shard') {
        headX = 14 * direction;
        neckX = 8 * direction;
        rightHandX = 65 * direction;
        rightHandY = neckY - 2;
        leftHandX = -15 * direction;
        leftHandY = hipY;
      } else if (actionToDraw === 'bearing_shot') {
        headX = 16 * direction;
        neckX = 10 * direction;
        rightHandX = 72 * direction;
        rightHandY = neckY + 4;
        leftHandX = -12 * direction;
        leftHandY = hipY - 2;
      } else if (actionToDraw === 'rock_trap' || actionToDraw === 'rock_shield') {
        headX = 18 * direction;
        headY = 24;
        neckX = 12 * direction;
        neckY = headY + headRadius;
        hipX = -10 * direction;
        hipY = neckY + 28;
        rightHandX = 35 * direction;
        rightHandY = fighter.height - 4;
        leftHandX = 15 * direction;
        leftHandY = fighter.height - 8;
        leftFootX = -20 * direction;
        rightFootX = 24 * direction;
      } else if (actionToDraw === 'ground_punch') {
        headX = 22 * direction;
        headY = 26;
        neckX = 16 * direction;
        neckY = headY + headRadius;
        hipX = -14 * direction;
        hipY = neckY + 26;
        rightHandX = 42 * direction;
        rightHandY = fighter.height + 2;
        leftHandX = 36 * direction;
        leftHandY = fighter.height;
        leftFootX = -24 * direction;
        rightFootX = 28 * direction;
      } else if (actionToDraw === 'enraged_stagger') {
        headX = 24 * direction;
        neckX = 16 * direction;
        hipX = -8 * direction;
        rightHandX = 40 * direction;
        rightHandY = hipY;
        leftHandX = -20 * direction;
        leftHandY = hipY - 10;
        leftFootX = -22 * direction;
        rightFootX = 32 * direction;
      } else if (actionToDraw === 'ray_of_light' || actionToDraw === 'shooting_sword' || actionToDraw === 'upward_thrust') {
        headX = 18 * direction;
        neckX = 12 * direction;
        rightHandX = 75 * direction;
        rightHandY = neckY;
        leftHandX = -15 * direction;
        leftHandY = hipY + 4;
      } else if (actionToDraw === 'pose') {
        headX = 4 * direction;
        neckX = 2 * direction;
        rightHandX = 22 * direction;
        rightHandY = hipY + 8;
        leftHandX = -22 * direction;
        leftHandY = hipY + 8;
      } else {
        if (fighter.charId === 'gappy') {
          // Gappy signature JoJolion idle stance:
          // Hip cocked to the side, right hand near sailor collar/neck birthmark, left hand resting coolly near hip
          headX = 3 * direction;
          headY = 15;
          neckX = 1 * direction;
          neckY = headY + headRadius;
          hipX = -5 * direction;
          hipY = neckY + 35;

          rightHandX = 10 * direction;
          rightHandY = neckY + 4;
          leftHandX = -14 * direction;
          leftHandY = hipY + 2;

          leftFootX = -18 * direction;
          rightFootX = 14 * direction;
          leftKneeX = -10 * direction;
          rightKneeX = 8 * direction;
        } else {
          leftHandX = -16 * direction;
          leftHandY = hipY + 2;
          rightHandX = 16 * direction;
          rightHandY = hipY + 6;
        }
      }
    } else if (actionToDraw === 'walk') {
      if (fighter.charId === 'pucci' && fighter.pucciForm === 'made_in_heaven') {
        // MADE IN HEAVEN CELESTIAL FLIGHT GLIDE (No ground walk strides - smoothly glides airborne!)
        const flightHover = Math.sin(time * 0.16) * 3.5;
        headX = 12 * direction;
        headY = 14 - flightHover;
        neckX = 8 * direction;
        neckY = headY + headRadius;
        hipX = -6 * direction;
        hipY = neckY + 34;

        // Legs streamlined backwards gracefully in mid-air
        leftFootX = (-24 + Math.sin(time * 0.16) * 3) * direction;
        leftFootY = fighter.height - 16 + Math.cos(time * 0.16) * 3;
        rightFootX = (-10 + Math.cos(time * 0.16) * 3) * direction;
        rightFootY = fighter.height - 12 - Math.sin(time * 0.16) * 3;

        leftKneeX = -12 * direction;
        leftKneeY = hipY + 12;
        rightKneeX = -4 * direction;
        rightKneeY = hipY + 14;

        // Divine poise: arms flared back & forward in speed posture
        leftHandX = -26 * direction;
        leftHandY = hipY + 6;
        rightHandX = 32 * direction;
        rightHandY = neckY + 2;
      } else {
        const walkPhase = time * 0.28;
        const strideSin = Math.sin(walkPhase);
        const strideCos = Math.cos(walkPhase);

        // Smooth vertical body bobbing during stride (max 2.5px bounce)
        const bodyBob = Math.abs(strideSin) * 2.5;
        headY = 16 - bodyBob;
        neckY = headY + headRadius;
        hipY = neckY + 36;

        // Leg stride width (-15 to +15 relative to body center)
        const strideDist = 15;
        leftFootX = strideSin * strideDist * direction;
        rightFootX = -strideSin * strideDist * direction;

        // Lift stepping foot gracefully in an arc, plant back foot flat
        const leftLift = Math.max(0, strideSin * direction) * 6;
        const rightLift = Math.max(0, -strideSin * direction) * 6;

        leftFootY = fighter.height - leftLift;
        rightFootY = fighter.height - rightLift;

        // Knees bend forward naturally when stepping forward, straight when back
        leftKneeX = (leftFootX * 0.5) + (strideSin * direction > 0 ? 3 * direction : -1 * direction);
        leftKneeY = hipY + (leftFootY - hipY) * 0.5 - leftLift * 0.4;

        rightKneeX = (rightFootX * 0.5) + (-strideSin * direction > 0 ? 3 * direction : -1 * direction);
        rightKneeY = hipY + (rightFootY - hipY) * 0.5 - rightLift * 0.4;

        // Arm swing opposite to leg stride at natural waist height
        leftHandX = -strideSin * 14 * direction;
        leftHandY = hipY - 2 + strideCos * 4;
        rightHandX = strideSin * 14 * direction;
        rightHandY = hipY + 2 - strideCos * 4;
      }
    } else if (actionToDraw === 'jump') {
      const isAscending = fighter.vy < 0;
      if (isAscending) {
        // Tucked acrobatic jump pose
        leftFootX = -16 * direction;
        leftFootY = fighter.height - 22;
        leftKneeX = -18 * direction;
        leftKneeY = hipY + 10;

        rightFootX = 22 * direction;
        rightFootY = fighter.height - 12;
        rightKneeX = 14 * direction;
        rightKneeY = hipY + 14;

        // Arms flared upwards / outwards dynamically
        leftHandX = -24 * direction;
        leftHandY = neckY - 10;
        rightHandX = 24 * direction;
        rightHandY = neckY - 16;
      } else {
        // Aerodynamic landing descent pose
        leftFootX = -12 * direction;
        leftFootY = fighter.height - 8;
        rightFootX = 16 * direction;
        rightFootY = fighter.height - 4;

        leftHandX = -20 * direction;
        leftHandY = neckY - 8;
        rightHandX = 20 * direction;
        rightHandY = neckY - 4;
      }
    } else if (actionToDraw === 'punch') {
      if (fighter.charId === 'funny_valentine') {
        // President Funny Valentine: Extended Single Action Army Revolver Aim & Fire Stance
        const isRecoil = (fighter.actionTimer || 0) > (fighter.actionDuration ? fighter.actionDuration * 0.4 : 5);
        headX = 4 * direction;
        neckX = 2 * direction;
        rightHandX = (isRecoil ? 44 : 50) * direction;
        rightHandY = neckY + 1 - (isRecoil ? 3 : 0);
        leftHandX = -8 * direction;
        leftHandY = hipY - 2;
      } else if (fighter.charId === 'pucci') {
        // Pucci / Whitesnake sharp pistol aiming & shooting stance
        const isRecoil = (fighter.actionTimer || 0) > (fighter.actionDuration ? fighter.actionDuration * 0.35 : 4);
        headX = 4 * direction;
        neckX = 2 * direction;
        rightHandX = (isRecoil ? 42 : 48) * direction;
        rightHandY = neckY - 2 - (isRecoil ? 4 : 0);
        leftHandX = -6 * direction;
        leftHandY = hipY - 2;
      } else {
        const punchProgress = (fighter.actionDuration ? (fighter.actionDuration - fighter.actionTimer) : 0) / (fighter.actionDuration || 14);
        const reach = Math.sin(punchProgress * Math.PI) * 48;
        rightHandX = (22 + reach) * direction;
        rightHandY = neckY + 4;
        leftHandX = -10 * direction;
        leftHandY = hipY - 4; // Guard hand rests at waist
      }
    } else if (actionToDraw === 'pucci_pistol') {
      const isRecoil = (fighter.actionTimer || 0) > (fighter.actionDuration ? fighter.actionDuration * 0.35 : 4);
      headX = 4 * direction;
      neckX = 2 * direction;
      rightHandX = (isRecoil ? 42 : 48) * direction;
      rightHandY = neckY - 2 - (isRecoil ? 4 : 0);
      leftHandX = -6 * direction;
      leftHandY = hipY - 2;
    } else if (actionToDraw === 'barrage' || actionToDraw === 'ora_beatdown' || (actionToDraw as string) === 'dora_barrage' || actionToDraw === 'valentine_d4c_barrage') {
      rightHandX = (38 + Math.random() * 16) * direction;
      rightHandY = neckY + Math.sin(time * 2.5) * 18;
      leftHandX = (32 + Math.random() * 14) * direction;
      leftHandY = neckY + Math.cos(time * 2.5) * 18;
      this.drawBarrageFlurryArms(ctx, neckX, neckY, direction, mainColor, time, fighter.charId);
    } else if (actionToDraw === 'donut_strike' || actionToDraw === 'time_erase_ambush') {
      headX = 18 * direction;
      neckX = 12 * direction;
      hipX = -6 * direction;
      rightHandX = 65 * direction;
      rightHandY = neckY + 2;
      leftHandX = -12 * direction;
      leftHandY = hipY;
      leftFootX = -20 * direction;
      rightFootX = 28 * direction;
    } else if (actionToDraw === 'star_finger') {
      headX = 12 * direction;
      neckX = 8 * direction;
      rightHandX = 45 * direction;
      rightHandY = neckY - 4;
      leftHandX = -10 * direction;
      leftHandY = hipY - 2;
    } else if (actionToDraw === 'space_ripper') {
      headX = -10 * direction;
      headY = 12;
      neckX = -6 * direction;
      neckY = headY + headRadius;
      rightHandX = -22 * direction;
      rightHandY = headY - 10;
      leftHandX = -26 * direction;
      leftHandY = headY - 5;
    } else if (actionToDraw === 'knife_throw') {
      rightHandX = -28 * direction;
      rightHandY = headY - 18;
      leftHandX = 30 * direction;
      leftHandY = neckY;
    } else if (actionToDraw === 'drain_blood') {
      rightHandX = 42 * direction;
      rightHandY = neckY - 6;
      leftHandX = 32 * direction;
      leftHandY = neckY + 4;
    } else if (actionToDraw === 'street_sign') {
      headX = 14 * direction;
      neckX = 10 * direction;
      rightHandX = 40 * direction;
      rightHandY = neckY + 25;
      leftHandX = 28 * direction;
      leftHandY = neckY + 25;
    } else if (actionToDraw === 'zoom_punch') {
      headX = 22 * direction;
      neckX = 14 * direction;
      rightHandX = 120 * direction;
      rightHandY = neckY;
      leftHandX = -12 * direction;
      leftHandY = hipY;
    } else if (actionToDraw === 'pluck_sword' || actionToDraw === 'luck_pluck_slash' || actionToDraw === 'sendo_wave') {
      headX = 16 * direction;
      neckX = 10 * direction;
      rightHandX = 55 * direction;
      rightHandY = neckY + 2;
      leftHandX = -14 * direction;
      leftHandY = hipY;
    } else if (actionToDraw === 'clacker_volley' || actionToDraw === 'tommy_gun' || actionToDraw === 'red_stone_beam') {
      rightHandX = 48 * direction;
      rightHandY = neckY;
      leftHandX = 20 * direction;
      leftHandY = neckY + 10;
    } else if ((actionToDraw as string) === 'hermit_grapple' || actionToDraw === 'hermit_overdrive_surge' || actionToDraw === 'polaroid_smash') {
      rightHandX = 50 * direction;
      rightHandY = neckY;
      leftHandX = -15 * direction;
      leftHandY = hipY;
    } else if (actionToDraw === 'homing_shard') {
      headX = 8 * direction;
      neckX = 4 * direction;
      rightHandX = 52 * direction;
      rightHandY = neckY - 2;
      leftHandX = -14 * direction;
      leftHandY = hipY;
    } else if (actionToDraw === 'bearing_shot') {
      headX = 12 * direction;
      neckX = 8 * direction;
      rightHandX = 58 * direction;
      rightHandY = neckY + 2;
      leftHandX = -10 * direction;
      leftHandY = hipY - 2;
    } else if (actionToDraw === 'rock_trap' || actionToDraw === 'rock_shield') {
      headX = 10 * direction;
      neckX = 6 * direction;
      rightHandX = 44 * direction;
      rightHandY = hipY + 12;
      leftHandX = -14 * direction;
      leftHandY = hipY;
    } else if (actionToDraw === 'ground_punch') {
      headX = 14 * direction;
      neckX = 8 * direction;
      rightHandX = 48 * direction;
      rightHandY = hipY + 16;
      leftHandX = -16 * direction;
      leftHandY = hipY;
      leftFootX = -20 * direction;
      rightFootX = 24 * direction;
    } else if (actionToDraw === 'enraged_stagger') {
      headX = 26 * direction;
      headY = 22;
      neckX = 18 * direction;
      neckY = headY + headRadius;
      hipX = -6 * direction;
      rightHandX = 38 * direction;
      rightHandY = hipY + 2;
      leftHandX = -16 * direction;
      leftHandY = hipY - 8;
      leftFootX = -24 * direction;
      rightFootX = 30 * direction;
    } else if (actionToDraw === 'parry_stance') {
      headX = 2 * direction;
      neckX = 0;
      hipX = -4 * direction;
      rightHandX = 16 * direction;
      rightHandY = neckY + 6;
      leftHandX = 10 * direction;
      leftHandY = neckY + 2;
      leftFootX = -18 * direction;
      rightFootX = 18 * direction;
    } else if (actionToDraw === 'command_pose') {
      // Confident, powerful commanding pose (Jotaro pointing, DIO imposing, etc.)
      headX = 4 * direction;
      neckX = 2 * direction;
      hipX = -4 * direction;
      
      // Pointing arm straight forward
      rightHandX = 58 * direction;
      rightHandY = neckY - 4;
      
      // Hand on hip
      leftHandX = -12 * direction;
      leftHandY = hipY - 2;
      
      // Steady standing legs
      leftFootX = -18 * direction;
      leftFootY = fighter.height;
      rightFootX = 18 * direction;
      rightFootY = fighter.height;
    } else if (actionToDraw === 'pose') {
      if (fighter.charId === 'jotaro') {
        headX = 4 * direction;
        neckX = 2 * direction;
        rightHandX = 38 * direction;
        rightHandY = neckY - 2;
        leftHandX = 3 * direction;
        leftHandY = headY - 1;
        leftFootX = -18 * direction;
        rightFootX = 14 * direction;
      } else if (fighter.charId === 'dio') {
        // THE ICONIC "WRYYYYYY!" PHYSICAL BACK-BEND!
        // Throws torso backward, arches spine, hips forward, head tilted back, hands clutching head!
        headX = -26 * direction;
        headY = 46;
        neckX = -18 * direction;
        neckY = headY + headRadius;
        hipX = 15 * direction;
        hipY = neckY + 32;

        // Clawing hands near temples screaming WRYY
        rightHandX = -28 * direction;
        rightHandY = headY - 12;
        leftHandX = -12 * direction;
        leftHandY = neckY - 18;

        // Wide supportive leg placement
        leftFootX = -26 * direction;
        leftFootY = fighter.height;
        rightFootX = 24 * direction;
        rightFootY = fighter.height;

        leftKneeX = -14 * direction;
        leftKneeY = hipY + 12;
        rightKneeX = 18 * direction;
        rightKneeY = hipY + 10;
      } else if (fighter.charId === 'crazy_diamond') {
        headX = 6 * direction;
        neckX = 4 * direction;
        leftHandX = -14 * direction;
        leftHandY = hipY - 2;
        rightHandX = 12 * direction;
        rightHandY = headY - 14;
        leftFootX = -8 * direction;
        rightFootX = 22 * direction;
      } else if (fighter.charId === 'king_crimson') {
        headX = 0;
        neckX = 0;
        rightHandX = 24 * direction;
        rightHandY = hipY + 12;
        leftHandX = -24 * direction;
        leftHandY = hipY + 12;
        leftFootX = -16 * direction;
        rightFootX = 16 * direction;
      } else if (fighter.charId === 'silver_chariot') {
        headX = -4 * direction;
        neckX = -2 * direction;
        leftHandX = 14 * direction;
        leftHandY = neckY + 4;
        rightHandX = 17 * direction;
        rightHandY = neckY + 4;
        leftFootX = -18 * direction;
        leftFootY = fighter.height;
        rightFootX = 10 * direction;
        rightFootY = fighter.height - 12;
      } else if (fighter.charId === 'pucci') {
        const pForm = fighter.pucciForm || 'whitesnake';
        if (pForm === 'made_in_heaven') {
          // Celestial Levitation God Pose (Gracefully suspended in mid-air)
          const floatBob = Math.sin(time * 0.14) * 3;
          headX = -2 * direction;
          headY = 10 - floatBob;
          neckX = 0;
          neckY = headY + headRadius;
          hipY = neckY + 34;

          rightHandX = 32 * direction;
          rightHandY = neckY + 12;
          leftHandX = -28 * direction;
          leftHandY = neckY + 14;

          // Levitating feet suspended above floor with subtle float rhythm
          leftFootX = -10 * direction;
          leftFootY = fighter.height - 18;
          rightFootX = 12 * direction;
          rightFootY = fighter.height - 14;

          leftKneeX = -10 * direction;
          leftKneeY = hipY + 14;
          rightKneeX = 8 * direction;
          rightKneeY = hipY + 16;
        } else if (pForm === 'cmoon') {
          // Gravity Manipulation Pose
          headX = 4 * direction;
          neckX = 2 * direction;
          rightHandX = 45 * direction;
          rightHandY = neckY - 6;
          leftHandX = -45 * direction;
          leftHandY = neckY - 6;
          leftFootX = -16 * direction;
          rightFootX = 16 * direction;
        } else {
          // Priest Sacred Rosary Prayer Pose
          headX = 2 * direction;
          neckX = 0;
          rightHandX = 16 * direction;
          rightHandY = neckY - 8;
          leftHandX = 10 * direction;
          leftHandY = neckY - 12;
          leftFootX = -14 * direction;
          rightFootX = 14 * direction;
        }
      } else if (fighter.charId === 'gappy') {
        // ★ THE ICONIC JOJOLION SAILOR CAP TOUCH & SOFT & WET BUBBLE POSE ★
        // Spine arched, hips pushed sideways, right hand touching sailor cap brim, left hand extended splaying fingers gracefully!
        headX = 6 * direction;
        headY = 13;
        neckX = 3 * direction;
        neckY = headY + headRadius;
        hipX = -8 * direction;
        hipY = neckY + 34;

        // Right hand touching sailor cap brim (near upper head)
        rightHandX = 16 * direction;
        rightHandY = headY - 14;

        // Left hand extended gracefully outward with splayed fingers
        leftHandX = -28 * direction;
        leftHandY = neckY + 6;

        // Wide dynamic JoJo stance with bent knee
        leftFootX = -24 * direction;
        leftFootY = fighter.height;
        rightFootX = 18 * direction;
        rightFootY = fighter.height;
        leftKneeX = -14 * direction;
        leftKneeY = hipY + 14;
        rightKneeX = 10 * direction;
        rightKneeY = hipY + 16;
      } else if (fighter.charId === 'funny_valentine') {
        // ★ THE ICONIC "DOJYAA~~N!" AMERICAN FLAG REVEAL POSE ★
        // Back arched proud, head tilted back, arms thrown wide open opening the dimensional American flag!
        headX = -4 * direction;
        headY = 12;
        neckX = -2 * direction;
        neckY = headY + headRadius;
        hipX = 4 * direction;
        hipY = neckY + 34;

        rightHandX = 38 * direction;
        rightHandY = headY - 18;
        leftHandX = -34 * direction;
        leftHandY = headY - 14;

        leftFootX = -22 * direction;
        leftFootY = fighter.height;
        rightFootX = 22 * direction;
        rightFootY = fighter.height;
        leftKneeX = -12 * direction;
        leftKneeY = hipY + 14;
        rightKneeX = 12 * direction;
        rightKneeY = hipY + 14;
      } else {
        headX = 4 * direction;
        neckX = 2 * direction;
        rightHandX = 18 * direction;
        rightHandY = headY - 8;
        leftHandX = -20 * direction;
        leftHandY = hipY + 10;
        leftFootX = -22 * direction;
        rightFootX = 18 * direction;
      }
    } else if (actionToDraw === 'knockback') {
      // Flung backward in mid-air from impact!
      ctx.rotate(-0.4 * direction);
      headX = -10 * direction;
      headY = 12;
      neckX = -6 * direction;
      neckY = headY + headRadius;
      hipX = 0;
      hipY = neckY + 34;

      leftHandX = -34 * direction;
      leftHandY = neckY - 16;
      rightHandX = -28 * direction;
      rightHandY = neckY - 22;

      leftFootX = 24 * direction;
      leftFootY = fighter.height - 24;
      leftKneeX = 14 * direction;
      leftKneeY = hipY + 10;

      rightFootX = 16 * direction;
      rightFootY = fighter.height - 14;
      rightKneeX = 8 * direction;
      rightKneeY = hipY + 14;

      // Draw wind / impact lines trailing behind knockback
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const lineY = neckY + i * 15;
        ctx.beginPath();
        ctx.moveTo(30 * direction, lineY);
        ctx.lineTo((60 + Math.random() * 20) * direction, lineY);
        ctx.stroke();
      }
      ctx.strokeStyle = isStand ? (auraOutlineMap[fighter.auraColor] || '#c084fc') : '#0f172a';
      ctx.lineWidth = isStand ? 4.5 : 4;
    } else if (fighter.action === 'knockdown') {
      // Fallen lying flat on ground
      headX = -28 * direction;
      headY = fighter.height - 10;
      neckX = -16 * direction;
      neckY = fighter.height - 10;
      hipX = 0;
      hipY = fighter.height - 10;

      leftHandX = -42 * direction;
      leftHandY = fighter.height - 6;
      rightHandX = -12 * direction;
      rightHandY = fighter.height - 12;

      leftFootX = 28 * direction;
      leftFootY = fighter.height - 6;
      leftKneeX = 14 * direction;
      leftKneeY = fighter.height - 8;

      rightFootX = 22 * direction;
      rightFootY = fighter.height - 6;
      rightKneeX = 10 * direction;
      rightKneeY = fighter.height - 8;

      // Dust shockwave on floor
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, fighter.height - 4, 35, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = isStand ? (auraOutlineMap[fighter.auraColor] || '#c084fc') : '#0f172a';
      ctx.lineWidth = isStand ? 4.5 : 4;
    } else if (fighter.action === 'wakeup') {
      // Pushing up off floor into stance
      const progress = 1 - Math.max(0, (fighter.actionTimer || 25) / (fighter.actionDuration || 25));
      
      headX = -12 * (1 - progress) * direction;
      headY = 16 + (1 - progress) * 18;
      neckX = -8 * (1 - progress) * direction;
      neckY = headY + headRadius;
      hipX = 0;
      hipY = neckY + 34;

      leftHandX = -6 * direction;
      leftHandY = fighter.height - 4; // Palm on floor
      rightHandX = (14 + progress * 8) * direction;
      rightHandY = neckY + 8;

      leftFootX = -16 * direction;
      leftFootY = fighter.height;
      leftKneeX = -18 * direction;
      leftKneeY = fighter.height - 8;

      rightFootX = (12 + progress * 6) * direction;
      rightFootY = fighter.height;
      rightKneeX = 8 * direction;
      rightKneeY = hipY + 12;

      // Recovery golden sparkle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(headX + 5 * direction, headY - 15, 3 * progress, 0, Math.PI * 2);
      ctx.fill();
    } else if (fighter.action === 'dead') {
      // Defeat KO pose
      headX = -32 * direction;
      headY = fighter.height - 8;
      neckX = -20 * direction;
      neckY = fighter.height - 8;
      hipX = 0;
      hipY = fighter.height - 8;

      leftHandX = -46 * direction;
      leftHandY = fighter.height - 4;
      rightHandX = -14 * direction;
      rightHandY = fighter.height - 10;

      leftFootX = 32 * direction;
      leftFootY = fighter.height - 4;
      leftKneeX = 16 * direction;
      leftKneeY = fighter.height - 6;

      rightFootX = 24 * direction;
      rightFootY = fighter.height - 4;
      rightKneeX = 12 * direction;
      rightKneeY = fighter.height - 6;

      // Defeat shadow under fallen fighter
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-5 * direction, fighter.height - 2, 45, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Manga K.O. / RETIRED text
      if (!isStand) {
        ctx.save();
        ctx.font = '900 16px "Impact", sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText('K.O. (RETIRED)', 0, fighter.height - 35);
        ctx.fillText('K.O. (RETIRED)', 0, fighter.height - 35);
        ctx.restore();
      }
    } else if (fighter.action === 'hit') {
      headX = -6 * direction;
      rightHandX = -22 * direction;
      rightHandY = neckY - 10;
      leftHandX = -18 * direction;
      leftHandY = hipY - 4;
      leftFootX = -16 * direction;
      rightFootX = 20 * direction;
    } else if (fighter.action === 'dipez_photon_bullet') {
      // Finger-gun stance!
      headX = 4 * direction;
      neckX = 2 * direction;
      hipX = -4 * direction;
      rightHandX = 40 * direction;
      rightHandY = neckY + 4; // Finger pointed straight forward
      leftHandX = -8 * direction;
      leftHandY = hipY - 2;
      leftFootX = -18 * direction;
      rightFootX = 24 * direction;
    } else if (fighter.action === 'dipez_flashbang') {
      // Raised hands to forehead stance!
      headX = 0;
      neckX = 0;
      hipX = 0;
      rightHandX = 8 * direction;
      rightHandY = headY - 4;
      leftHandX = -8 * direction;
      leftHandY = headY - 4;
      leftFootX = -16 * direction;
      rightFootX = 16 * direction;
    } else if (fighter.action === 'dipez_laser_cannon') {
      // Recoil cannon stance!
      headX = -8 * direction;
      neckX = -6 * direction;
      hipX = -12 * direction;
      rightHandX = 44 * direction;
      rightHandY = neckY + 6;
      leftHandX = 40 * direction;
      leftHandY = neckY + 10;
      leftFootX = -26 * direction;
      rightFootX = 18 * direction;
    } else if (fighter.action === 'dipez_light_speed_blitz') {
      // Forward blitz dash pose with extended photon strikes
      headX = 14 * direction;
      headY = 8;
      neckX = 10 * direction;
      neckY = headY + headRadius;
      hipX = -10 * direction;
      hipY = neckY + 24;
      rightHandX = 36 * direction;
      rightHandY = neckY + 4;
      leftHandX = -22 * direction;
      leftHandY = neckY + 12;
      leftFootX = -30 * direction;
      leftFootY = hipY + 18;
      rightFootX = 24 * direction;
      rightFootY = hipY + 22;
    } else if (fighter.action === 'dipez_invisibility') {
      // Invisibility photon fade pose - arms crossed with glowing aura
      headX = 0;
      headY = 12;
      neckX = 0;
      neckY = headY + headRadius;
      hipX = 0;
      hipY = neckY + 32;
      rightHandX = 18 * direction;
      rightHandY = neckY + 4;
      leftHandX = -18 * direction;
      leftHandY = neckY + 4;
      leftFootX = -16 * direction;
      rightFootX = 16 * direction;
    } else if (fighter.action === 'dipez_map_laser') {
      // Omnipresent Map Laser pose - both arms thrust forward unleashing map beam
      headX = 6 * direction;
      headY = 10;
      neckX = 4 * direction;
      neckY = headY + headRadius;
      hipX = -8 * direction;
      hipY = neckY + 34;
      rightHandX = 48 * direction;
      rightHandY = neckY - 2;
      leftHandX = 44 * direction;
      leftHandY = neckY + 6;
      leftFootX = -28 * direction;
      rightFootX = 24 * direction;
    } else if (fighter.action === 'dipez_evolution_startup' || fighter.action === 'dipez_star_maker') {
      // Floating T-Pose / Ascension Cross Pose!
      headX = 0;
      headY = 12;
      neckX = 0;
      neckY = headY + headRadius;
      hipX = 0;
      hipY = neckY + 30;
      leftHandX = -42 * direction;
      leftHandY = neckY + 2;
      rightHandX = 42 * direction;
      rightHandY = neckY + 2;
      leftFootX = -10 * direction;
      leftFootY = hipY + 36;
      rightFootX = 10 * direction;
      rightFootY = hipY + 36;
    }

    // --- DRAWING STICKMAN SKELETON WITH ARTICULATED ELBOWS & KNEES ---
    // 1. Draw Legs
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // 2. Draw Torso
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // 3. Draw Articulated Arms (Shoulder -> Jointed Elbow -> Hand down to waist height!)
    const leftShoulderX = neckX - 7 * direction;
    const leftShoulderY = neckY + 4;
    const rightShoulderX = neckX + 7 * direction;
    const rightShoulderY = neckY + 4;

    const leftElbow = this.calcElbow(leftShoulderX, leftShoulderY, leftHandX, leftHandY, -1, direction);
    const rightElbow = this.calcElbow(rightShoulderX, rightShoulderY, rightHandX, rightHandY, 1, direction);

    const leftElbowX = leftElbow.x;
    const leftElbowY = leftElbow.y;
    const rightElbowX = rightElbow.x;
    const rightElbowY = rightElbow.y;

    const hideArms = fighter.charId === 'dipez' && fighter.dipezForm !== 'pure_light' && !!(fighter.dipezArmLostTimer && fighter.dipezArmLostTimer > 0);

    if (!hideArms) {
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftElbowX, leftElbowY);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightShoulderX, rightShoulderY);
      ctx.lineTo(rightElbowX, rightElbowY);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();
    }

    // --- INNER FILL FOR DUAL COLOR STICKMAN ---
    ctx.lineWidth = isStand ? 3 : 2.5;
    ctx.strokeStyle = mainColor;

    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    if (!hideArms) {
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftElbowX, leftElbowY);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightShoulderX, rightShoulderY);
      ctx.lineTo(rightElbowX, rightElbowY);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();
    }

    // 4. Head with outline and base fill
    ctx.fillStyle = mainColor;
    ctx.strokeStyle = isStand ? (auraOutlineMap[fighter.auraColor] || '#c084fc') : '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Draw Customized Character / Stand Accessories & Iconic Traits using unified Bones
    const bones: StickmanBones = {
      headX,
      headY,
      headRadius,
      neckX,
      neckY,
      hipX,
      hipY,
      leftShoulderX,
      leftShoulderY,
      rightShoulderX,
      rightShoulderY,
      leftElbowX,
      leftElbowY,
      rightElbowX,
      rightElbowY,
      leftHandX,
      leftHandY,
      rightHandX,
      rightHandY,
      leftKneeX,
      leftKneeY,
      rightKneeX,
      rightKneeY,
      leftFootX,
      leftFootY,
      rightFootX,
      rightFootY,
    };

    if (isStand) {
      this.drawStandAccessories(
        ctx,
        bones,
        direction,
        time,
        fighter
      );
    } else {
      this.drawCharacterAccessories(
        ctx,
        bones,
        direction,
        time,
        fighter
      );
    }

    // 6. Character-Specific Pose Special Visual Effects
    if (fighter.action === 'pose' && !isStand) {
      if (fighter.charId === 'jotaro') {
        // Golden JoJo Finger Point Laser Ray & Star Sparkle
        const fingerTipX = rightHandX + 16 * direction;
        const fingerTipY = rightHandY;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(rightHandX, rightHandY);
        ctx.lineTo(fingerTipX, fingerTipY);
        ctx.stroke();

        // 4-Point Golden Star Burst at fingertip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fingerTipX, fingerTipY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fingerTipX - 6, fingerTipY);
        ctx.lineTo(fingerTipX + 6, fingerTipY);
        ctx.moveTo(fingerTipX, fingerTipY - 6);
        ctx.lineTo(fingerTipX, fingerTipY + 6);
        ctx.stroke();

        // Face Shadow under Cap Brim
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.arc(headX + direction * 2, headY - 1, 6, 0, Math.PI);
        ctx.fill();
      } else if (fighter.charId === 'dio') {
        // Red Piercing Vampire Eye Laser Beams into the Heavens
        const eyeX = headX + 4 * direction;
        const eyeY = headY - 2;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(eyeX, eyeY);
        ctx.lineTo(eyeX - direction * 18, eyeY - 32);
        ctx.stroke();

        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(eyeX, eyeY);
        ctx.lineTo(eyeX - direction * 18, eyeY - 32);
        ctx.stroke();

        // Golden Vampire Aura Sparkle
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(eyeX - direction * 10, eyeY - 18, 2.5, 0, Math.PI * 2);
        ctx.arc(eyeX - direction * 22, eyeY - 36, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (fighter.charId === 'crazy_diamond') {
        // Sparkling 4-point Star on the Majestic Pompadour Quiff!
        const pompTipX = headX + direction * 20;
        const pompTipY = headY - headRadius - 14;
        const glintScale = 1 + Math.sin(time * 0.4) * 0.3;

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(pompTipX, pompTipY, 3 * glintScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pompTipX - 8 * glintScale, pompTipY);
        ctx.lineTo(pompTipX + 8 * glintScale, pompTipY);
        ctx.moveTo(pompTipX, pompTipY - 8 * glintScale);
        ctx.lineTo(pompTipX, pompTipY + 8 * glintScale);
        ctx.stroke();
      } else if (fighter.charId === 'king_crimson') {
        // Crimson Temporal Distortion Shockwave Ring
        const ringRadius = 24 + Math.sin(time * 0.3) * 6;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(neckX, neckY + 14, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (fighter.charId === 'silver_chariot') {
        // Golden Bravo Applause Clapping Sparkles
        const clapX = neckX + 16 * direction;
        const clapY = neckY + 4;
        const clapWave = (time * 0.5) % 1;

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(clapX, clapY, 6 + clapWave * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(clapX + 6, clapY - 4, 2, 0, Math.PI * 2);
        ctx.arc(clapX - 4, clapY - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawHeart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fill: string,
    stroke?: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurveHeight = size * 0.4;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(-size * 0.7, -topCurveHeight, -size * 1.1, size * 0.6, 0, size * 1.2);
    ctx.bezierCurveTo(size * 1.1, size * 0.6, size * 0.7, -topCurveHeight, 0, topCurveHeight);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawCharacterAccessories(
    ctx: CanvasRenderingContext2D,
    bones: StickmanBones,
    direction: number,
    time: number,
    fighter: Fighter
  ) {
    const {
      headX,
      headY,
      headRadius,
      neckX,
      neckY,
      hipX,
      hipY,
      leftKneeX,
      leftKneeY,
      rightKneeX,
      rightKneeY,
      leftHandX,
      leftHandY,
      rightHandX,
      rightHandY,
      leftFootX,
      leftFootY,
      rightFootX,
      rightFootY,
    } = bones;
    const charId = fighter.charId;

    // Face Eyes (Common Base)
    ctx.fillStyle = fighter.eyeColor || '#0f172a';
    ctx.beginPath();
    ctx.arc(headX + 4 * direction, headY - 1.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // CHARACTER-SPECIFIC RENDERING:

    // 1. JOTARO KUJO (Iconic Torn Cap, Gold Badge, Chain, High Collar Gakuran)
    if (charId === 'jotaro') {
      // High Collar Gakuran
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(neckX - direction * 5 - 3, neckY - 7, 10, 8);

      // Gold Chain from left collar across chest
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(neckX - direction * 6, neckY - 3);
      ctx.bezierCurveTo(neckX - direction * 12, neckY + 12, neckX + direction * 2, neckY + 16, neckX, neckY + 7);
      ctx.stroke();

      // Double Belts (Yellow & Green Zigzag / checker pattern)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(hipX - 8, hipY - 5, 16, 4);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(hipX - 4, hipY - 5, 8, 4);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(hipX - 8, hipY - 5, 16, 4);

      // Flowing Trenchcoat Tails
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - direction * 14 + Math.sin(time * 0.2) * 2, hipY + 28);
      ctx.stroke();

      // JOTARO'S TORN SCHOOL CAP
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;

      // Cap Dome
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 1, -Math.PI * 0.95, 0.05);
      ctx.lineTo(headX + direction * (headRadius + 8), headY - 1); // Visor bill
      ctx.lineTo(headX + direction * (headRadius + 6), headY + 3);
      ctx.lineTo(headX, headY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Hand / Palm Badge on front center of cap
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(headX + direction * 4 - 2, headY - 8, 5, 7);
      ctx.fill();
      ctx.stroke();

      // Iconic Torn Spiky Hair blending out the back of the cap
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      const backX = headX - direction * headRadius;
      ctx.moveTo(backX, headY - 6);
      ctx.lineTo(backX - direction * 7, headY - 3);
      ctx.lineTo(backX - direction * 3, headY + 1);
      ctx.lineTo(backX - direction * 8, headY + 6);
      ctx.lineTo(backX - direction * 2, headY + 8);
      ctx.lineTo(backX - direction * 6, headY + 13);
      ctx.lineTo(headX, headY + headRadius);
      ctx.closePath();
      ctx.fill();
    }

    // 2. DIO (Golden Spiky Hair, Green Heart Headband, Open Jacket, Knee Hearts)
    else if (charId === 'dio') {
      // Red Piercing Vampire Eye
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + 4 * direction, headY - 1.5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Golden Spiky Wild Vampiric Hair (Flowing & Voluminous)
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;

      // Top & Back hair spikes
      ctx.beginPath();
      ctx.moveTo(headX - direction * (headRadius + 2), headY + 4);
      ctx.lineTo(headX - direction * (headRadius + 12), headY - 2);
      ctx.lineTo(headX - direction * (headRadius + 6), headY - 8);
      ctx.lineTo(headX - direction * (headRadius + 14), headY - 14);
      ctx.lineTo(headX - direction * 4, headY - headRadius - 10);
      ctx.lineTo(headX, headY - headRadius - 6);
      ctx.lineTo(headX + direction * 6, headY - headRadius - 12);
      ctx.lineTo(headX + direction * 10, headY - headRadius - 4);
      ctx.lineTo(headX + direction * (headRadius + 4), headY - 2);
      ctx.lineTo(headX + direction * (headRadius + 2), headY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Forehead Gold Band
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 1, -Math.PI * 0.8, -Math.PI * 0.1);
      ctx.stroke();

      // Green Heart Headband Jewel at center
      this.drawHeart(ctx, headX + direction * 3, headY - 6, 4.5, '#22c55e', '#15803d');

      // Yellow Jacket Collar & Open V-Chest
      ctx.fillStyle = '#eab308';
      ctx.fillRect(neckX - 6, neckY - 4, 12, 6);
      ctx.fillStyle = '#0f172a'; // Black inner top
      ctx.beginPath();
      ctx.moveTo(neckX - 4, neckY + 2);
      ctx.lineTo(neckX + 4, neckY + 2);
      ctx.lineTo(neckX, neckY + 14);
      ctx.closePath();
      ctx.fill();

      // Green Heart Belt Buckle
      this.drawHeart(ctx, hipX, hipY - 2, 4.5, '#22c55e', '#15803d');

      // Green Heart Knee Pads directly on actual articulated knees
      this.drawHeart(ctx, leftKneeX, leftKneeY, 3.5, '#22c55e', '#15803d');
      this.drawHeart(ctx, rightKneeX, rightKneeY, 3.5, '#22c55e', '#15803d');
    }

    // 3. JOSUKE HIGASHIKATA (Huge Iconic Pompadour Quiff, Anchor & Peace Badges, Double Chains)
    else if (charId === 'crazy_diamond') {
      // Navy Blue Gakuran High Collar with Gold Trim
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(neckX - 8, neckY - 6, 16, 8);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(neckX - 8, neckY - 6, 16, 8);

      // Open V-Neck White Undershirt
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(neckX - 4, neckY + 1);
      ctx.lineTo(neckX + 4, neckY + 1);
      ctx.lineTo(neckX, neckY + 9);
      ctx.closePath();
      ctx.fill();

      // Gold Anchor Badge on Left Collar Lapel
      ctx.strokeStyle = '#facc15';
      ctx.fillStyle = '#facc15';
      ctx.lineWidth = 1.5;
      const anchorX = neckX - direction * 5;
      const anchorY = neckY - 2;
      ctx.beginPath();
      ctx.arc(anchorX, anchorY + 1, 2.5, 0, Math.PI); // Curved fluke
      ctx.moveTo(anchorX, anchorY - 4);
      ctx.lineTo(anchorX, anchorY + 2); // Shank
      ctx.moveTo(anchorX - 2, anchorY - 2);
      ctx.lineTo(anchorX + 2, anchorY - 2); // Crossbar
      ctx.stroke();

      // Gold Peace Sign Badge on Right Collar Lapel ☮
      const peaceX = neckX + direction * 5;
      const peaceY = neckY - 2;
      ctx.beginPath();
      ctx.arc(peaceX, peaceY, 3, 0, Math.PI * 2);
      ctx.moveTo(peaceX, peaceY - 3);
      ctx.lineTo(peaceX, peaceY + 3);
      ctx.moveTo(peaceX, peaceY);
      ctx.lineTo(peaceX - 2, peaceY + 2.5);
      ctx.moveTo(peaceX, peaceY);
      ctx.lineTo(peaceX + 2, peaceY + 2.5);
      ctx.stroke();

      // Double Gold Chain Belt at Waist
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hipX - 9, hipY - 3);
      ctx.lineTo(hipX + 9, hipY - 3);
      ctx.stroke();
      // Dangling gold chain loops
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hipX + direction * 2, hipY - 2);
      ctx.bezierCurveTo(hipX + direction * 4, hipY + 6, hipX + direction * 8, hipY + 6, hipX + direction * 9, hipY - 2);
      ctx.stroke();

      // Delinquent Baggy Pants Cuffs
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(leftFootX, leftFootY - 3, 4, 0, Math.PI * 2);
      ctx.arc(rightFootX, rightFootY - 3, 4, 0, Math.PI * 2);
      ctx.stroke();

      // ICONIC MASSIVE MAJESTIC POMPADOUR (REGENT) HAIRSTYLE
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;

      ctx.beginPath();
      // Back ducktail neck taper
      ctx.moveTo(headX - direction * (headRadius + 2), headY + 8);
      ctx.lineTo(headX - direction * (headRadius + 7), headY + 2);
      // Sweep upwards and outwards to form the massive front pomp crown
      ctx.bezierCurveTo(
        headX - direction * 6, headY - headRadius - 20,
        headX + direction * 26, headY - headRadius - 16,
        headX + direction * 22, headY - 2
      );
      // Front curved quiff curl tucking into forehead
      ctx.bezierCurveTo(
        headX + direction * 16, headY + 4,
        headX + direction * 8, headY - 4,
        headX, headY - headRadius
      );
      ctx.lineTo(headX - direction * headRadius, headY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Deep Shadow Arc on Pomp Underbelly
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX + direction * 4, headY - headRadius + 2);
      ctx.bezierCurveTo(
        headX + direction * 16, headY - headRadius - 2,
        headX + direction * 20, headY - 6,
        headX + direction * 18, headY - 1
      );
      ctx.stroke();

      // Dual Glossy Highlights on Majestic Pompadour
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - direction * 2, headY - headRadius - 12);
      ctx.bezierCurveTo(
        headX + direction * 10, headY - headRadius - 14,
        headX + direction * 18, headY - headRadius - 8,
        headX + direction * 16, headY - 4
      );
      ctx.stroke();

      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + direction * 4, headY - headRadius - 10);
      ctx.lineTo(headX + direction * 14, headY - headRadius - 6);
      ctx.stroke();
    }

    // 4. DIAVOLO (Long Pink Spotted Leopard Hair, Fishnet Mesh Harness)
    else if (charId === 'king_crimson') {
      // Mysterious Eyeliner Gaze
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(headX + 4 * direction, headY - 1.5, 3.5, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();

      // Black Fishnet Mesh Harness across Torso
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckX - 6, neckY + 4);
      ctx.lineTo(neckX + 6, neckY + 16);
      ctx.moveTo(neckX + 6, neckY + 4);
      ctx.lineTo(neckX - 6, neckY + 16);
      ctx.moveTo(neckX - 6, neckY + 18);
      ctx.lineTo(neckX + 6, neckY + 30);
      ctx.moveTo(neckX + 6, neckY + 18);
      ctx.lineTo(neckX - 6, neckY + 30);
      ctx.stroke();

      // Green Spiral Belt Buckle
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(hipX, hipY - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // LONG FLOWING PINK HAIR WITH BLACK DALMATIAN SPOTS
      const hairSway = Math.sin(time * 0.25) * 3;
      ctx.fillStyle = '#ec4899';
      ctx.strokeStyle = '#be185d';
      ctx.lineWidth = 1.5;

      // Big wild flowing pink hair locks cascading past shoulders
      ctx.beginPath();
      ctx.moveTo(headX + direction * 4, headY - headRadius - 2);
      ctx.bezierCurveTo(headX + direction * 12, headY - 4, headX + direction * 8, headY + 8, headX + direction * 4, headY + 14);
      ctx.lineTo(headX - direction * 2, headY + 16);
      // Flowing long back mane
      ctx.bezierCurveTo(
        headX - direction * (headRadius + 8), headY + 10,
        neckX - direction * (headRadius + 14) + hairSway, neckY + 22,
        neckX - direction * (headRadius + 10) + hairSway, neckY + 32
      );
      ctx.lineTo(neckX - direction * (headRadius + 4), neckY + 26);
      ctx.bezierCurveTo(
        neckX - direction * (headRadius + 10), neckY + 10,
        headX - direction * (headRadius + 4), headY - 4,
        headX - direction * 4, headY - headRadius - 4
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Black Dalmatian / Leopard Spot Patterns on Pink Hair
      ctx.fillStyle = '#0f172a';
      const spots = [
        { x: headX - direction * 12, y: headY + 2, r: 1.8 },
        { x: neckX - direction * 16 + hairSway * 0.5, y: neckY + 8, r: 2.2 },
        { x: neckX - direction * 13 + hairSway * 0.7, y: neckY + 20, r: 2.0 },
        { x: headX - direction * 6, y: headY - 8, r: 1.6 },
        { x: headX + direction * 6, y: headY + 4, r: 1.5 },
      ];
      spots.forEach(spot => {
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 5. JEAN PIERRE POLNAREFF (Towering Flat-Top Silver Hair & Broken Heart Earring)
    else if (charId === 'silver_chariot') {
      // TOWERING FLAT-TOP SILVER/GREY HAIRSTYLE
      const hairTopY = headY - headRadius - 20;
      const hairWidth = 14;
      const hairX = headX - direction * 3 - hairWidth / 2;

      // Base hair tower
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(hairX, headY - 2);
      ctx.lineTo(hairX - direction * 1, hairTopY);
      ctx.lineTo(hairX + hairWidth + direction * 1, hairTopY);
      ctx.lineTo(hairX + hairWidth, headY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vertical Hair Grain Texture Lines (Stylized Flat-Top Shading)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const xOffset = hairX + (hairWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(xOffset, hairTopY + 2);
        ctx.lineTo(xOffset, headY - 3);
        ctx.stroke();
      }

      // Flat Top Rim Highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hairX - direction * 1, hairTopY + 1);
      ctx.lineTo(hairX + hairWidth + direction * 1, hairTopY + 1);
      ctx.stroke();

      // Sharp Sideburns
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(headX - direction * (headRadius - 1), headY + 2);
      ctx.lineTo(headX - direction * (headRadius + 2), headY + 6);
      ctx.lineTo(headX - direction * (headRadius - 2), headY + 8);
      ctx.closePath();
      ctx.fill();

      // Black Tight Sleeveless Singlet & Diagonal Shoulder Strap
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(neckX - 6, neckY + 1, 12, 10);

      // Diagonal Metal Shoulder Strap & Buckle
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(neckX - direction * 7, neckY + 2);
      ctx.lineTo(neckX + direction * 5, neckY + 18);
      ctx.stroke();

      // Golden Strap Buckle
      ctx.fillStyle = '#facc15';
      ctx.fillRect(neckX + direction * 1 - 2, neckY + 8, 4, 4);

      // Silver Belt & Cuffs
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hipX - 7, hipY - 2);
      ctx.lineTo(hipX + 7, hipY - 2);
      ctx.stroke();

      // DANGLING BROKEN HEART SILVER EARRING WITH CHAIN
      const earX = headX - direction * (headRadius + 1);
      const earY = headY + 3;
      // Chain link
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(earX, earY);
      ctx.lineTo(earX - direction * 2, earY + 5);
      ctx.stroke();
      // Broken Heart Silver Earring
      this.drawHeart(ctx, earX - direction * 2, earY + 8, 3, '#e2e8f0', '#64748b');
      // Broken jagged split in center of earring
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(earX - direction * 2, earY + 6);
      ctx.lineTo(earX - direction * 2 - 1, earY + 8);
      ctx.lineTo(earX - direction * 2 + 1, earY + 9);
      ctx.lineTo(earX - direction * 2, earY + 11);
      ctx.stroke();
    }

    // 6. JONATHAN JOESTAR (Noble Voluminous Wavy Blue Hair, Brown Leather Vest, Shoulder Armor, Sword of Luck & Pluck)
    else if (charId === 'jonathan') {
      // Noble Wavy Dark Blue JoJo Hair (Multi-Layered Voluminous Spikes & Bangs)
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1.8;

      // Base Hair Mass (Cascading down nape and sweeping over brow)
      ctx.beginPath();
      ctx.moveTo(headX - direction * (headRadius + 2), headY + 8);
      ctx.lineTo(headX - direction * (headRadius + 8), headY + 2);
      ctx.lineTo(headX - direction * (headRadius + 12), headY - 6);
      ctx.lineTo(headX - direction * (headRadius + 6), headY - 14);
      ctx.lineTo(headX - direction * 2, headY - headRadius - 12);
      ctx.lineTo(headX + direction * 8, headY - headRadius - 10);
      ctx.lineTo(headX + direction * (headRadius + 10), headY - 4);
      ctx.lineTo(headX + direction * (headRadius + 4), headY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front Forehead Wavy Bangs (Jonathan's signature noble locks)
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.moveTo(headX, headY - headRadius);
      ctx.bezierCurveTo(headX + direction * 10, headY - headRadius + 2, headX + direction * 14, headY - 2, headX + direction * 6, headY + 1);
      ctx.bezierCurveTo(headX + direction * 4, headY - 4, headX + direction * 2, headY - 8, headX, headY - headRadius);
      ctx.fill();

      // Shiny Cyan Hair Highlight Strands
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX - direction * 4, headY - headRadius - 6);
      ctx.bezierCurveTo(headX + direction * 2, headY - headRadius - 8, headX + direction * 8, headY - headRadius - 4, headX + direction * 10, headY - 6);
      ctx.moveTo(headX - direction * 8, headY - 8);
      ctx.lineTo(headX - direction * 2, headY - 12);
      ctx.stroke();

      // Brown Leather Tank Top / Vest with Gold Trim & Cross Harness
      ctx.fillStyle = '#78350f';
      ctx.fillRect(neckX - 7, neckY + 1, 14, 14);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(neckX - 7, neckY + 1, 14, 14);

      // Leather Harness Straps across chest (X-Pattern)
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(neckX - 6, neckY + 2);
      ctx.lineTo(neckX + 6, neckY + 14);
      ctx.moveTo(neckX + 6, neckY + 2);
      ctx.lineTo(neckX - 6, neckY + 14);
      ctx.stroke();

      // Gold Shoulder Armor Guards & Studs
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 3, 4, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gold Wrist Gauntlets on hands
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 4, 0, Math.PI * 2);
      ctx.arc(rightHandX, rightHandY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // SWORD OF LUCK & PLUCK (Sheathed on back vs Unsheathed in Hand)
      if (fighter.isSwordEquipped) {
        // Empty Leather Scabbard on back
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(neckX - direction * 7, neckY - 4);
        ctx.lineTo(neckX + direction * 16, neckY + 30);
        ctx.stroke();

        // UNSHEATHED SWORD OF LUCK & PLUCK IN HAND WITH RADIANT HAMON AURA
        const hX = rightHandX;
        const hY = rightHandY;
        const swordAngle = direction > 0 ? -Math.PI / 4 : -Math.PI * 3 / 4;
        const bladeLen = 34;
        const tipX = hX + Math.cos(swordAngle) * bladeLen * direction;
        const tipY = hY + Math.sin(swordAngle) * bladeLen;

        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        // Radiant Outer Hamon Edge
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(hX, hY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Steel Blade Core
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Gold Crossguard & Grip in Hand
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hX, hY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      } else {
        // Sheathed diagonally on back
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(neckX - direction * 7, neckY - 4);
        ctx.lineTo(neckX + direction * 16, neckY + 30);
        ctx.stroke();

        // Gold Sword Crossguard & Pommel
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(neckX - direction * 7, neckY - 4, 3.5, 0, Math.PI * 2); // Pommel
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(neckX - direction * 10, neckY - 2);
        ctx.lineTo(neckX - direction * 4, neckY - 6);
        ctx.stroke();
      }

      // Golden Hamon Sparks around chest & sword
      ctx.fillStyle = '#facc15';
      const sparkOffset = Math.sin(time * 0.3) * 5;
      ctx.beginPath();
      ctx.arc(neckX + sparkOffset, neckY + 8, 2.5, 0, Math.PI * 2);
      ctx.arc(neckX - sparkOffset * 0.7, neckY + 16, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. YOUNG JOSEPH JOESTAR (Wild Spiky Brown Hair, Caesar's Triangle Headband & Ribbons, Long Green-Yellow Scarf, Clacker Volley)
    else if (charId === 'joseph_young') {
      // Dynamic Wild Spiky Chestnut Brown Hair
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(headX - direction * (headRadius + 2), headY + 6);
      ctx.lineTo(headX - direction * (headRadius + 10), headY - 1);
      ctx.lineTo(headX - direction * (headRadius + 6), headY - 10);
      ctx.lineTo(headX - direction * 4, headY - headRadius - 12);
      ctx.lineTo(headX + direction * 2, headY - headRadius - 8);
      ctx.lineTo(headX + direction * 8, headY - headRadius - 14);
      ctx.lineTo(headX + direction * (headRadius + 9), headY - 4);
      ctx.lineTo(headX + direction * (headRadius + 3), headY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spiky Front Hair Tuft Framing Forehead
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(headX - direction * 4, headY - headRadius + 2);
      ctx.lineTo(headX + direction * 2, headY - headRadius + 9);
      ctx.lineTo(headX + direction * 7, headY - headRadius + 4);
      ctx.fill();

      // CAESAR'S PATTERNED HEADBAND (Purple Band with Golden Triangles)
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(headX, headY - 1, headRadius + 1, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      // Distinct Golden Triangle Pattern on Headband
      ctx.fillStyle = '#facc15';
      for (let offset = -8; offset <= 8; offset += 5) {
        ctx.beginPath();
        ctx.moveTo(headX + offset * direction - 1.5, headY - headRadius + 5);
        ctx.lineTo(headX + offset * direction + 1.5, headY - headRadius + 5);
        ctx.lineTo(headX + offset * direction, headY - headRadius + 2);
        ctx.closePath();
        ctx.fill();
      }

      // Long Trailing Headband Ribbons Fluttering Behind Head
      const hbWave = Math.sin(time * 0.25) * 6;
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headX - direction * (headRadius + 2), headY - 5);
      ctx.bezierCurveTo(
        headX - direction * (headRadius + 12), headY - 8 + hbWave,
        headX - direction * (headRadius + 22), headY + hbWave,
        headX - direction * (headRadius + 28), headY + 8 - hbWave
      );
      ctx.stroke();

      ctx.strokeStyle = '#eab308'; // Golden Ribbon Trim
      ctx.lineWidth = 1;
      ctx.stroke();

      // LONG FLOWING GREEN & YELLOW STRIPED SCARF (Joseph's Signature Scarf!)
      const scarfWave = Math.sin(time * 0.2) * 7;
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;

      // Scarf Wrapped Around Neck
      ctx.beginPath();
      ctx.ellipse(neckX, neckY + 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Scarf Yellow Stripe Ring
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(neckX, neckY + 2, 9, 0, Math.PI);
      ctx.stroke();

      // Two Long Scarf Tails Fluttering Dramatically Behind Body
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckX - direction * 4, neckY + 4);
      ctx.bezierCurveTo(
        neckX - direction * 16, neckY + 10 + scarfWave,
        neckX - direction * 26, neckY + 22 - scarfWave,
        neckX - direction * 34, neckY + 32 + scarfWave
      );
      ctx.lineTo(neckX - direction * 28, neckY + 38 + scarfWave);
      ctx.bezierCurveTo(
        neckX - direction * 20, neckY + 26 - scarfWave,
        neckX - direction * 12, neckY + 14 + scarfWave,
        neckX, neckY + 7
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Yellow Stripes on Scarf Tails
      ctx.fillStyle = '#facc15';
      for (let s = 1; s <= 3; s++) {
        const stripeX = neckX - direction * (8 + s * 7);
        const stripeY = neckY + 10 + s * 7 + (s % 2 === 0 ? scarfWave : -scarfWave);
        ctx.beginPath();
        ctx.arc(stripeX, stripeY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // CLACKER VOLLEY (Steel Metallic Balls attached with cord at waist)
      ctx.strokeStyle = '#facc15'; // Cord
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hipX + direction * 7, hipY - 2);
      ctx.lineTo(hipX + direction * 10, hipY + 8);
      ctx.lineTo(hipX + direction * 14, hipY + 14);
      ctx.stroke();

      // Metallic Steel Clacker Balls
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hipX + direction * 10, hipY + 8, 3.5, 0, Math.PI * 2);
      ctx.arc(hipX + direction * 14, hipY + 14, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 8. OLD JOSEPH JOESTAR (Tan Fedora Hat, Handsome White Beard/Mustache, Khaki Safari Trench, White Gloves & Hermit Purple Vines)
    else if (charId === 'joseph_old') {
      // GREY HAIR & HANDSOME FULL BEARD / MUSTACHE
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;

      // Full Beard hugging jawline cleanly
      ctx.beginPath();
      ctx.arc(headX + direction * 2, headY + 3, 7.5, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Dashing White Mustache under nose
      ctx.fillRect(headX + direction * 2 - 4.5, headY - 1, 9, 3);

      // White Sideburns
      ctx.beginPath();
      ctx.moveTo(headX - direction * (headRadius - 1), headY - 2);
      ctx.lineTo(headX - direction * (headRadius + 2), headY + 5);
      ctx.lineTo(headX - direction * (headRadius - 2), headY + 6);
      ctx.fill();

      // ICONIC ADVENTURER FEDORA HAT (Tan Khaki with Indented Crown & Black Hatband)
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;

      // Wide Curved Fedora Hat Brim
      ctx.beginPath();
      ctx.ellipse(headX, headY - headRadius + 3, headRadius + 10, 4.5, -0.05 * direction, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Creased Fedora Crown
      ctx.beginPath();
      ctx.moveTo(headX - 8, headY - headRadius + 3);
      ctx.lineTo(headX - 7, headY - headRadius - 8);
      ctx.lineTo(headX - 2, headY - headRadius - 10); // Indented center top
      ctx.lineTo(headX + 2, headY - headRadius - 10);
      ctx.lineTo(headX + 7, headY - headRadius - 8);
      ctx.lineTo(headX + 8, headY - headRadius + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Stylish Black Ribbon Hatband
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(headX - 7.5, headY - headRadius + 1, 15, 3);

      // KHAKI SAFARI TRENCH COAT & OPEN COLLAR
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.5;

      // Lapel Collar
      ctx.fillRect(neckX - 8, neckY + 1, 16, 7);

      // Dark Undershirt inside open collar
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(neckX - 4, neckY + 1);
      ctx.lineTo(neckX + 4, neckY + 1);
      ctx.lineTo(neckX, neckY + 7);
      ctx.closePath();
      ctx.fill();

      // Open Coat Tails Flapping Past Hips
      const coatWave = Math.sin(time * 0.15) * 3;
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hipX - 9, hipY - 2);
      ctx.lineTo(hipX - direction * 18 + coatWave, hipY + 34);
      ctx.lineTo(hipX + direction * 14, hipY + 34);
      ctx.lineTo(hipX + 9, hipY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Leather Belt with Brass Buckle at Waist
      ctx.fillStyle = '#451a03';
      ctx.fillRect(hipX - 8, hipY - 4, 16, 4);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(hipX - 3, hipY - 4, 6, 4);

      // WHITE LEATHER GLOVES ON HANDS
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 4, 0, Math.PI * 2);
      ctx.arc(rightHandX, rightHandY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // HERMIT PURPLE (紫の隠者) Glowing Thorny Vines around Right Arm!
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(neckX + 5 * direction, neckY + 6);
      ctx.bezierCurveTo(
        (neckX + rightHandX) * 0.5 + 4 * direction, neckY + 14,
        rightHandX - 4 * direction, rightHandY - 6,
        rightHandX, rightHandY
      );
      ctx.stroke();

      // Thorns on Hermit Purple Vines
      ctx.fillStyle = '#a855f7';
      for (let t = 0.3; t <= 0.8; t += 0.25) {
        const vineX = (neckX + 5 * direction) * (1 - t) + rightHandX * t;
        const vineY = (neckY + 6) * (1 - t) + rightHandY * t;
        ctx.beginPath();
        ctx.arc(vineX, vineY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Yellow Hamon Sparks on Hermit Purple Vines
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(rightHandX + 2 * direction, rightHandY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. TOORU & SATORU AKEFU (HEAD DOCTOR) (PART 8: JOJOLION)
    else if (charId === 'tooru') {
      if (fighter.isHeadDoctorDisguise) {
        // Satoru Akefu / Head Doctor Disguise
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;

        // Hat Brim
        ctx.beginPath();
        ctx.ellipse(headX, headY - headRadius + 2, headRadius + 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hat Crown
        ctx.fillRect(headX - headRadius - 1, headY - headRadius - 12, (headRadius + 1) * 2, 14);
        ctx.strokeRect(headX - headRadius - 1, headY - headRadius - 12, (headRadius + 1) * 2, 14);

        // White Hat Ribbon
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(headX - headRadius - 1, headY - headRadius - 1, (headRadius + 1) * 2, 3);

        // Long Formal Black Doctor Trench Coat
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(neckX - 8, neckY);
        ctx.lineTo(neckX + 8, neckY);
        ctx.lineTo(hipX + 12 * direction, hipY + 20);
        ctx.lineTo(hipX - 12 * direction, hipY + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ascot Tie
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(neckX - 3, neckY + 1);
        ctx.lineTo(neckX + 3, neckY + 1);
        ctx.lineTo(neckX, neckY + 9);
        ctx.closePath();
        ctx.fill();

        // Walking Cane in hand
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(rightHandX, rightHandY);
        ctx.lineTo(rightHandX + direction * 4, fighter.height);
        ctx.stroke();
        // Golden Cane Knob
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(rightHandX, rightHandY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal Tooru: Stylish Rock-Human Afro Hair with Swirls, Earphones/Headphones, Chic Vest
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;

        // Central & side afro puffs
        ctx.beginPath();
        ctx.arc(headX, headY - headRadius - 2, 8, 0, Math.PI * 2);
        ctx.arc(headX - direction * 7, headY - headRadius + 3, 7, 0, Math.PI * 2);
        ctx.arc(headX + direction * 7, headY - headRadius + 3, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Afro spiral detailing
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(headX, headY - headRadius - 2, 4, 0, Math.PI);
        ctx.arc(headX - direction * 6, headY - headRadius + 3, 3, 0, Math.PI);
        ctx.stroke();

        // Chic Wine/Purple Tailored Vest
        ctx.fillStyle = '#581c87';
        ctx.strokeStyle = '#7e22ce';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(neckX - 8, neckY);
        ctx.lineTo(neckX + 8, neckY);
        ctx.lineTo(hipX + 8, hipY);
        ctx.lineTo(hipX - 8, hipY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Checkered badge on lapel
        ctx.fillStyle = '#facc15';
        ctx.fillRect(neckX - direction * 4 - 2, neckY + 2, 4, 4);

        // Retro Over-Ear Headphones / Earphones
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(headX, headY - 2, headRadius + 2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.stroke();

        // Ear Cushions (Cyan/Orange stylish pads)
        ctx.fillStyle = '#06b6d4';
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(headX - direction * (headRadius - 1), headY + 1, 3.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Earphone audio cord dangling down to pocket
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX - direction * (headRadius - 1), headY + 7);
        ctx.quadraticCurveTo(neckX - direction * 6, neckY + 12, hipX - direction * 2, hipY);
        ctx.stroke();
      }
    }

    // 10. ENRICO PUCCI (WHITESNAKE, C-MOON, MADE IN HEAVEN EVOLUTION FORMS)
    else if (charId === 'pucci') {
      const form = fighter.pucciForm || 'whitesnake';

      if (form === 'whitesnake') {
        // Form 1: Base Priest Whitesnake
        // Iconic Star-Pattern Trimmed White Hair & Sideburns
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(headX - direction * (headRadius + 1), headY - 2);
        ctx.lineTo(headX - direction * (headRadius + 4), headY - headRadius);
        ctx.lineTo(headX, headY - headRadius - 4);
        ctx.lineTo(headX + direction * (headRadius + 2), headY - headRadius + 2);
        ctx.lineTo(headX + direction * (headRadius - 1), headY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Star-shaped shaved hair pattern on crown
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(headX, headY - headRadius - 2);
        ctx.lineTo(headX + direction * 4, headY - headRadius + 4);
        ctx.lineTo(headX - direction * 3, headY - headRadius + 2);
        ctx.stroke();

        // Dark Priest Cassock / Vestment with Golden Cross Stitching
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(neckX - 7, neckY);
        ctx.lineTo(neckX + 7, neckY);
        ctx.lineTo(hipX + 9, hipY + 12);
        ctx.lineTo(hipX - 9, hipY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden Embroidered Cross down center of robe
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 2);
        ctx.lineTo(neckX, hipY + 8);
        ctx.moveTo(neckX - 6, neckY + 8);
        ctx.lineTo(neckX + 6, neckY + 8);
        ctx.stroke();

        // Gold rosary / crucifix in hand if idle or chanting, OR pistol when firing
        if ((fighter.action === 'punch' || fighter.action === 'pucci_pistol') && !fighter.isStandActive) {
          const isFiring = (fighter.actionTimer || 0) > (fighter.actionDuration ? fighter.actionDuration * 0.25 : 3);
          this.drawPucciPistolGun(ctx, rightHandX, rightHandY, direction, isFiring, false);
        } else {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(leftHandX, leftHandY, 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (form === 'cmoon') {
        // Form 2: C-Moon Awakened Priest (Green Baby Fused Hair & Emerald Gravity Robe)
        // Distinct Fused Spiky Star Crown Hair extending to eyebrows
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(headX - direction * (headRadius + 3), headY - 1);
        ctx.lineTo(headX - direction * (headRadius + 6), headY - headRadius - 3);
        ctx.lineTo(headX, headY - headRadius - 8);
        ctx.lineTo(headX + direction * 4, headY - headRadius - 6);
        ctx.lineTo(headX + direction * (headRadius + 5), headY - headRadius + 3);
        ctx.lineTo(headX + direction * (headRadius + 2), headY + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Green Baby fused star connector to eyebrows
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(headX + direction * 2, headY - headRadius + 2);
        ctx.lineTo(headX + direction * 5, headY - 2);
        ctx.lineTo(headX + direction * 1, headY - 1);
        ctx.fill();

        // Emerald / Dark Teal Shifted Priest Robes
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(neckX - 8, neckY);
        ctx.lineTo(neckX + 8, neckY);
        ctx.lineTo(hipX + 10, hipY + 14);
        ctx.lineTo(hipX - 10, hipY + 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Emerald Gravitational Rib lines on robe
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 2);
        ctx.lineTo(neckX, hipY + 10);
        ctx.moveTo(neckX - 7, neckY + 7);
        ctx.lineTo(neckX + 7, neckY + 7);
        ctx.moveTo(neckX - 6, neckY + 16);
        ctx.lineTo(neckX + 6, neckY + 16);
        ctx.stroke();

        // Floating Gravitational Pebble Sparkles around Pucci
        ctx.fillStyle = '#34d399';
        const floatP1 = Math.sin(time * 0.2) * 8;
        const floatP2 = Math.cos(time * 0.25) * 8;
        ctx.beginPath();
        ctx.arc(neckX - direction * 14, neckY + floatP1, 2.5, 0, Math.PI * 2);
        ctx.arc(neckX + direction * 16, neckY - 8 + floatP2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (form === 'made_in_heaven') {
        // Form 3: Made in Heaven (Ascended High Priest of Heaven)
        // Celestial Crown White Hair merging into Forehead Golden Cross
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(headX - direction * (headRadius + 2), headY - 2);
        ctx.lineTo(headX - direction * (headRadius + 5), headY - headRadius - 6);
        ctx.lineTo(headX, headY - headRadius - 12);
        ctx.lineTo(headX + direction * 6, headY - headRadius - 10);
        ctx.lineTo(headX + direction * (headRadius + 4), headY - headRadius + 2);
        ctx.lineTo(headX + direction * (headRadius + 1), headY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden Celestial Forehead Cross
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.fillRect(headX + direction * 3, headY - 6, 3, 7);
        ctx.fillRect(headX + direction * 1, headY - 4, 7, 2.5);

        // Radiant White & Gold Celestial Ascension Vestment
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(neckX - 8, neckY);
        ctx.lineTo(neckX + 8, neckY);
        ctx.lineTo(hipX + 11, hipY + 16);
        ctx.lineTo(hipX - 11, hipY + 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden Singularity Clock/Dial on Chest
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(neckX, neckY + 10, 5.5, 0, Math.PI * 2);
        ctx.stroke();
        // Clock Hands
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 10);
        ctx.lineTo(neckX + Math.sin(time * 0.8) * 3.5, neckY + 10 - Math.cos(time * 0.8) * 3.5);
        ctx.stroke();

        // Celestial Golden Light Halo over Head
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(headX, headY - headRadius - 16, 12, 3.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 11. JOSUKE HIGASHIKATA / GAPPY (PART 8: JOJOLION)
    else if (charId === 'gappy') {
      // Sailor Hat (White Sailor Cap with Navy Blue Rim & Golden Anchor/Star Emblem)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;

      // Cap Base
      ctx.beginPath();
      ctx.ellipse(headX, headY - headRadius - 3, headRadius + 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cap Crown (Fluffy top)
      ctx.beginPath();
      ctx.arc(headX, headY - headRadius - 6, headRadius, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Navy Blue Cap Band & Golden Anchor Emblem
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(headX - (headRadius + 3), headY - headRadius - 4, (headRadius + 3) * 2, 3);

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(headX + direction * 2, headY - headRadius - 4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Sailor Collar & Sailor Suit (White Top with Navy Blue Stripes)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckX - 8, neckY);
      ctx.lineTo(neckX + 8, neckY);
      ctx.lineTo(hipX + 8, hipY + 10);
      ctx.lineTo(hipX - 8, hipY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Navy Sailor Collar Flap with double stripes
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(neckX - 7, neckY);
      ctx.lineTo(neckX + 7, neckY);
      ctx.lineTo(neckX + direction * 9, neckY + 14);
      ctx.lineTo(neckX - direction * 3, neckY + 14);
      ctx.closePath();
      ctx.fill();

      // Glowing Golden Star Birthmark on neck/shoulder
      const starX = neckX - direction * 6;
      const starY = neckY + 4;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(starX, starY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Star birthmark light rays
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(starX - 5, starY); ctx.lineTo(starX + 5, starY);
      ctx.moveTo(starX, starY - 5); ctx.lineTo(starX, starY + 5);
      ctx.stroke();

      // ICONIC POSE SPECIAL VISUAL EFFECTS
      const isPosing = fighter.action === 'pose';
      
      // Orbiting Shimmering Soap Bubbles around Gappy
      const numBubbles = isPosing ? 6 : (fighter.isStandActive ? 4 : 2);
      for (let i = 0; i < numBubbles; i++) {
        const angle = time * 0.08 + (i * Math.PI * 2 / numBubbles);
        const orbitR = 24 + Math.sin(time * 0.1 + i) * 6;
        const bx = headX + Math.cos(angle) * orbitR;
        const by = headY + 15 + Math.sin(angle) * (orbitR * 0.6);
        const bRadius = isPosing ? (4 + (i % 3)) : 3;

        // Bubble Gradient
        const bGrad = ctx.createRadialGradient(bx - bRadius * 0.3, by - bRadius * 0.3, bRadius * 0.1, bx, by, bRadius);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.7)');
        bGrad.addColorStop(1, 'rgba(2, 132, 199, 0.8)');

        ctx.fillStyle = bGrad;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bx, by, bRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shiny Specular Point
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx - bRadius * 0.3, by - bRadius * 0.3, bRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // MANGA SFX & AURA WHEN POSING
      if (isPosing) {
        // Glowing cyan/purple ground ring
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(hipX, fighter.height - 2, 32, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Stylized Manga Menacing SFX "ゴゴゴ"
        ctx.font = '900 16px "Comic Sans MS", cursive, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';

        const sfxOffset1 = Math.sin(time * 0.15) * 4;
        const sfxOffset2 = Math.cos(time * 0.18) * 4;

        ctx.fillText('ゴ', headX - direction * 35, headY - 10 + sfxOffset1);
        ctx.fillText('ゴ', headX - direction * 45, headY - 30 + sfxOffset2);
        ctx.fillText('ゴ', headX + direction * 35, headY - 20 - sfxOffset1);

        // JoJolion Banner Label
        ctx.font = '900 11px monospace';
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText('★ SOFT & WET ★', headX, headY - headRadius - 22);
      }
    }

    // 12. FUNNY VALENTINE (PART 7: STEEL BALL RUN - 23RD PRESIDENT)
    else if (charId === 'funny_valentine') {
      // 1. Blonde Hair Volume with side-parted bangs
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;

      // Crown & Forehead hair
      ctx.beginPath();
      ctx.arc(headX, headY - 3, headRadius + 3.5, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.stroke();

      // Front Bangs swept elegantly to the side
      ctx.beginPath();
      ctx.moveTo(headX - 6 * direction, headY - 4);
      ctx.quadraticCurveTo(headX + 4 * direction, headY - 2, headX + 9 * direction, headY + 5);
      ctx.stroke();

      // 2. Iconic Voluminous Cylindrical Spring Ringlet Curls (3 on back, 2 on front)
      const curlOffsets = [-10, -5, 0, 6, 11];
      for (let i = 0; i < curlOffsets.length; i++) {
        const off = curlOffsets[i];
        const curlRootX = headX - direction * (8 + off * 0.8);
        const curlRootY = headY + 3;
        const wave = Math.sin(time * 0.18 + i * 0.9) * 3;
        const curlLen = 22 + (i % 2) * 6;

        // Coil cylinder segments
        for (let ring = 0; ring < 4; ring++) {
          const cy = curlRootY + ring * (curlLen / 4) + wave;
          const cx = curlRootX + Math.sin(ring * 1.5 + time * 0.15) * 2;
          
          ctx.fillStyle = ring % 2 === 0 ? '#fef08a' : '#fde047';
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 4, 3, 0.2 * direction, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Golden highlight gleam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(cx - 1, cy - 1, 1.8, 0, Math.PI * 0.8);
          ctx.stroke();
        }
      }

      // 3. High Presidential Collar & White Ruffled Cravat / Ascot with Gold Brooch
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(neckX - 6, neckY);
      ctx.lineTo(neckX + 6, neckY);
      ctx.lineTo(neckX + 3, neckY + 12);
      ctx.lineTo(neckX - 3, neckY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ruffle tiers on ascot
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(neckX - 4, neckY + 4); ctx.lineTo(neckX + 4, neckY + 4);
      ctx.moveTo(neckX - 3, neckY + 8); ctx.lineTo(neckX + 3, neckY + 8);
      ctx.stroke();

      // Oval Gold Brooch Cameo
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(neckX, neckY + 3, 2.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4. Double-Breasted Tailored Presidential Coat (Orchid Rose Pink #f472b6 & Violet Seams)
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(neckX - 9, neckY + 1);
      ctx.lineTo(neckX + 9, neckY + 1);
      ctx.lineTo(hipX + 11, hipY + 14);
      ctx.lineTo(hipX - 11, hipY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Flaring Coat Tails flapping in the wind behind hips
      const coatTailSwing = Math.sin(time * 0.2) * 5;
      ctx.fillStyle = '#be185d'; // Darker inner coat lining
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(hipX - 9, hipY + 12);
      ctx.quadraticCurveTo(hipX - 18 * direction + coatTailSwing, hipY + 28, hipX - 6 * direction + coatTailSwing, hipY + 34);
      ctx.lineTo(hipX + 6, hipY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Epaulets on both shoulders with Bullion Fringes
      for (const side of [-1, 1]) {
        const epX = neckX + side * 9;
        const epY = neckY + 2;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(epX, epY, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Fringe tassels
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(epX - 3, epY + 2); ctx.lineTo(epX - 3, epY + 6);
        ctx.moveTo(epX, epY + 2); ctx.lineTo(epX, epY + 7);
        ctx.moveTo(epX + 3, epY + 2); ctx.lineTo(epX + 3, epY + 6);
        ctx.stroke();
      }

      // 4 Double-Breasted Golden Eagle Buttons (2 columns)
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 0.8;
      for (let r = 0; r < 2; r++) {
        const by = neckY + 8 + r * 7;
        for (const col of [-1, 1]) {
          const bx = neckX + col * 4.5;
          ctx.beginPath();
          ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // 5. FLAG SANDWICH EFFECT (Authentic Star-Spangled Silk Flag wrapping around Valentine)
      if (fighter.action === 'pose' || fighter.flagSandwichActive || fighter.isLifeInsuranceReviving || fighter.action === 'valentine_parallel_shift' || fighter.action === 'valentine_paradox_pull') {
        const flagWave1 = Math.sin(time * 0.35) * 8;
        const flagWave2 = Math.cos(time * 0.4) * 6;
        ctx.save();

        // Spacetime rift tear aura around flag
        const riftGlow = ctx.createRadialGradient(hipX, headY + 15, 10, hipX, headY + 15, 55);
        riftGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        riftGlow.addColorStop(0.7, 'rgba(244, 114, 182, 0.35)');
        riftGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = riftGlow;
        ctx.fillRect(hipX - 45, headY - 25, 90, 80);

        // Silk Flag Sheet Body (Waving ripples)
        const flagLeft = hipX - 32;
        const flagTop = headY - 18 + flagWave1;
        const flagW = 64;
        const flagH = 68;

        // Base Red Background
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(flagLeft, flagTop);
        ctx.bezierCurveTo(flagLeft + 20, flagTop + flagWave2, flagLeft + 44, flagTop - flagWave2, flagLeft + flagW, flagTop + flagWave1 * 0.5);
        ctx.lineTo(flagLeft + flagW, flagTop + flagH + flagWave1 * 0.5);
        ctx.bezierCurveTo(flagLeft + 44, flagTop + flagH - flagWave2, flagLeft + 20, flagTop + flagH + flagWave2, flagLeft, flagTop + flagH);
        ctx.closePath();
        ctx.fill();

        // Alternating White Silk Stripes
        ctx.fillStyle = '#f8fafc';
        for (let s = 1; s < 7; s += 2) {
          const sy = flagTop + s * (flagH / 7);
          ctx.beginPath();
          ctx.moveTo(flagLeft, sy);
          ctx.bezierCurveTo(flagLeft + 20, sy + flagWave2, flagLeft + 44, sy - flagWave2, flagLeft + flagW, sy + flagWave1 * 0.5);
          ctx.lineTo(flagLeft + flagW, sy + (flagH / 14) + flagWave1 * 0.5);
          ctx.bezierCurveTo(flagLeft + 44, sy + (flagH / 14) - flagWave2, flagLeft + 20, sy + (flagH / 14) + flagWave2, flagLeft, sy + (flagH / 14));
          ctx.closePath();
          ctx.fill();
        }

        // Deep Navy Starfield Canton with Gold Tassels
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(flagLeft, flagTop, 28, 30);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(flagLeft, flagTop, 28, 30);

        // White Stars on Canton
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.fillText('★', flagLeft + 4, flagTop + 10);
        ctx.fillText('★', flagLeft + 16, flagTop + 10);
        ctx.fillText('★', flagLeft + 10, flagTop + 20);
        ctx.fillText('★', flagLeft + 4, flagTop + 26);
        ctx.fillText('★', flagLeft + 16, flagTop + 26);

        // Gold Fringe border along outer flag edge
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(flagLeft + flagW, flagTop + flagWave1 * 0.5);
        ctx.lineTo(flagLeft + flagW, flagTop + flagH + flagWave1 * 0.5);
        ctx.stroke();

        // Glowing Manga Caption "「DOJYAA~~N!」"
        ctx.font = '900 13px "Impact", sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText('「DOJYAA~~N!」', hipX, headY - 26);
        ctx.fillText('「DOJYAA~~N!」', hipX, headY - 26);

        ctx.restore();
      }

      // 6. Presidential Colt Single Action / Schofield Revolver (when firing standard shot)
      if (fighter.action === 'punch') {
        const isFiring = (fighter.actionTimer || 0) > (fighter.actionDuration ? fighter.actionDuration * 0.25 : 3);
        this.drawValentineRevolverGun(ctx, rightHandX, rightHandY, direction, isFiring, false);
      }
    }

    // 13. DIPEZ (PHOTON ATOM CONVERTER & PURE LIGHT MAN)
    else if (charId === 'dipez') {
      const isPureLight = fighter.dipezForm === 'pure_light';

      if (isPureLight) {
        // --- PURE LIGHT FORM (EVOLVED) ---
        // Sprite Stickman turns into total bright glowing white (#ffffff)
        // Eyes and mouth emit strong blinding light rays, complete glow/bloom aura!
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 35;

        // Blinding Light Rays radiating from Eyes & Mouth
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.lineWidth = 2.5;
        const rayCount = 10;
        for (let r = 0; r < rayCount; r++) {
          const angle = (r / rayCount) * Math.PI * 2 + time * 0.06;
          const rayLength = 40 + Math.sin(time * 0.25 + r) * 15;
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(headX + Math.cos(angle) * rayLength, headY + Math.sin(angle) * rayLength);
          ctx.stroke();
        }

        // Pure Light Head Flare
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius + 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Intense Blinding Eyes
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(headX + 4 * direction, headY - 2, 3.5, 0, Math.PI * 2);
        ctx.arc(headX - 2 * direction, headY - 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Pure Light Long Coat Fused with Body
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(neckX - 10, neckY);
        ctx.lineTo(neckX + 10, neckY);
        ctx.lineTo(hipX + 20 * direction, hipY + 32);
        ctx.lineTo(hipX - 20 * direction, hipY + 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      } else {
        // --- BASE FORM (MANLY ACTION HERO DIPEZ) ---
        // 1. Voluminous Clumped Male Hair ("Rambut Ngegumpal" - Rounded, Thick Hair Clumps)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.8;

        // Back & Top Hair Clump (Rounded volumetric hair mass behind & above head)
        ctx.beginPath();
        // Main puffy hair mass using connected bezier/arcs
        ctx.arc(headX - 6 * direction, headY - 10, headRadius + 3, Math.PI * 0.8, Math.PI * 1.8);
        ctx.arc(headX, headY - 14, headRadius + 2, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(headX + 6 * direction, headY - 9, headRadius + 2.5, Math.PI * 1.2, Math.PI * 0.2);
        ctx.arc(headX - 10 * direction, headY - 2, headRadius - 1, Math.PI * 0.5, Math.PI * 1.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Overlapping Front/Top Hair Clumps (3D hair volume layers)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;

        // Front puff clump 1 (Above forehead)
        ctx.beginPath();
        ctx.arc(headX + 2 * direction, headY - 11, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Front puff clump 2 (Top back crown)
        ctx.beginPath();
        ctx.arc(headX - 7 * direction, headY - 12, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Side hair clump (Near ear/temple)
        ctx.beginPath();
        ctx.arc(headX - 11 * direction, headY - 4, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Curved Clump Highlights (Soft white-blue highlight curves following rounded hair clumps)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(headX + 2 * direction, headY - 13, 5, Math.PI * 1.2, Math.PI * 1.7);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(headX - 7 * direction, headY - 14, 6, Math.PI * 1.1, Math.PI * 1.6);
        ctx.stroke();

        // Male Sideburn (Short thick clump)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(headX + 4 * direction, headY + 5, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Red Tactical Bandana Headband
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(headX - headRadius - 3, headY - 6, headRadius * 2 + 6, 6);
        ctx.fill();
        ctx.stroke();

        // Tail of headband fluttering behind head
        const bandWave = Math.sin(time * 0.22) * 6;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(headX - direction * (headRadius + 3), headY - 4);
        ctx.quadraticCurveTo(headX - direction * (headRadius + 16), headY + bandWave - 2, headX - direction * (headRadius + 28), headY + 6 + bandWave);
        ctx.lineTo(headX - direction * (headRadius + 24), headY + 11 + bandWave);
        ctx.closePath();
        ctx.fill();

        // 3. Chiseled Male Face Features (Angry Slanted Eyebrows & Glowing Eyes)
        // Slanted Male Eyebrow
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX + 1 * direction, headY - 5);
        ctx.lineTo(headX + 7 * direction, headY - 3);
        ctx.stroke();

        // Intense Glowing Photon Eye
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(headX + 4 * direction, headY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Muscular Male Chest & Abs (Visible inside open coat)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;

        // Pec Muscle Lines
        ctx.beginPath();
        ctx.moveTo(neckX - 6 * direction, neckY + 8);
        ctx.lineTo(neckX, neckY + 12);
        ctx.lineTo(neckX + 6 * direction, neckY + 8);
        ctx.stroke();

        // Abdominal Muscle Lines
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 12);
        ctx.lineTo(neckX, hipY - 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(neckX - 4, neckY + 18);
        ctx.lineTo(neckX + 4, neckY + 18);
        ctx.moveTo(neckX - 4, neckY + 24);
        ctx.lineTo(neckX + 4, neckY + 24);
        ctx.stroke();

        // 5. Broad Heavy Leather Coat (#1e293b) with Epaulets
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(neckX - 16, neckY + 2); // Broad shoulders
        ctx.lineTo(neckX + 16, neckY + 2);
        const coatWave = Math.sin(time * 0.15) * 5;
        ctx.lineTo(hipX + 22 * direction + coatWave, hipY + 34);
        ctx.lineTo(hipX - 22 * direction - coatWave, hipY + 34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Broad Shoulder Epaulets / Pads
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(neckX - 17, neckY + 1, 7, 4);
        ctx.rect(neckX + 10, neckY + 1, 7, 4);
        ctx.fill();
        ctx.stroke();

        // Coat Lapels & Golden Buckle Belt
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(neckX - 12, neckY + 2);
        ctx.lineTo(neckX - 4, neckY + 14);
        ctx.lineTo(neckX + 4, neckY + 14);
        ctx.lineTo(neckX + 12, neckY + 2);
        ctx.closePath();
        ctx.fill();

        // Tactical Belt & Gold Buckle
        ctx.fillStyle = '#020617';
        ctx.fillRect(hipX - 14, hipY - 2, 28, 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(hipX - 4, hipY - 4, 8, 8);

        // Drawback Visual Indicator if Arms are Lost (dipezArmLostTimer > 0)
        if (fighter.dipezArmLostTimer && fighter.dipezArmLostTimer > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.font = '900 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🚫 ARMS LOST (whaa!!!)', headX, headY - headRadius - 16);

          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(neckX - 10, neckY + 6, 6, 0, Math.PI * 2);
          ctx.arc(neckX + 10, neckY + 6, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 12. DEFAULT MARTIAL ARTS STICKMAN (White Headband with Red Ribbons & Belt)
    else {
      // White Martial Arts Headband
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 1, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      // Red Center Emblem
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + direction * 2, headY - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Fluttering Ribbon Tails
      const ribbonWave = Math.sin(time * 0.3) * 4;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - direction * headRadius, headY - 4);
      ctx.lineTo(headX - direction * (headRadius + 10), headY - 2 + ribbonWave);
      ctx.lineTo(headX - direction * (headRadius + 18), headY + 4 - ribbonWave);
      ctx.stroke();

      // Red Belt Tie
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(hipX - 6, hipY - 3, 12, 4);
    }
  }

  private drawStandAccessories(
    ctx: CanvasRenderingContext2D,
    bones: StickmanBones,
    direction: number,
    time: number,
    fighter: Fighter
  ) {
    const {
      headX,
      headY,
      headRadius,
      neckX,
      neckY,
      hipX,
      hipY,
      leftKneeX,
      leftKneeY,
      rightKneeX,
      rightKneeY,
      leftHandX,
      leftHandY,
      rightHandX,
      rightHandY,
    } = bones;
    const charId = fighter.charId;

    // 1. STAR PLATINUM (Wild Purple Flowing Mane, Gold Headband, Pauldrons, Scarf)
    if (charId === 'jotaro') {
      // Glowing Sharp Gold Eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(headX + 5 * direction, headY - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Wild Long Purple Flowing Mane
      const maneSway = Math.sin(time * 0.2) * 5;
      ctx.fillStyle = '#581c87';
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(headX, headY - headRadius);
      ctx.bezierCurveTo(
        headX - direction * 18, headY - headRadius - 10,
        headX - direction * 30 + maneSway, headY + 10,
        neckX - direction * 26 + maneSway, neckY + 36
      );
      ctx.lineTo(neckX - direction * 18, neckY + 24);
      ctx.bezierCurveTo(
        neckX - direction * 22, neckY + 10,
        headX - direction * 16, headY,
        headX - direction * 6, headY + headRadius
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Forehead Headband & Star Medallion
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 1, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(headX + direction * 4, headY - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Golden Warrior Shoulder Pauldrons
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 4, 5, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White Flowing Scarf & Waist Loincloth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(neckX - direction * 4, neckY + 5);
      ctx.lineTo(neckX - direction * 14 + maneSway * 0.6, neckY + 18);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hipX - 6, hipY - 2, 12, 6);
    }

    // 2. THE WORLD (Golden Diver Helmet with Triangular Crown, Twin Cables, Heart Belt)
    else if (charId === 'dio') {
      // Piercing Red Eyes / Visor Slits
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + 5 * direction, headY - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Golden Cybernetic Diver Helmet Shell
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;

      // Triangular Crown on top of helmet
      ctx.beginPath();
      ctx.moveTo(headX - 6, headY - headRadius);
      ctx.lineTo(headX, headY - headRadius - 10);
      ctx.lineTo(headX + 6, headY - headRadius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Diver Helmet Faceplate Rim
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius + 2, -Math.PI * 0.9, -Math.PI * 0.1);
      ctx.stroke();

      // Twin Oxygen / Power Cables running from cheeks to back & shoulders
      ctx.strokeStyle = '#15803d'; // Green power hoses
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headX + direction * 6, headY + 8);
      ctx.bezierCurveTo(headX + direction * 12, neckY + 6, neckX - direction * 8, neckY + 12, neckX - direction * 10, neckY + 2);
      ctx.stroke();

      // Golden Chest Armor with Green Heart
      ctx.fillStyle = '#eab308';
      ctx.fillRect(neckX - 8, neckY + 2, 16, 12);
      this.drawHeart(ctx, neckX, neckY + 5, 4, '#22c55e', '#15803d');

      // Golden Shoulder Spheres
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 4, 6, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Green Heart Belt on Stand Waist
      this.drawHeart(ctx, hipX, hipY - 2, 4.5, '#22c55e', '#15803d');
    }

    // 3. CRAZY DIAMOND (Heart-Crest Knight Helmet, Heart Plates, Conduit Pipes)
    else if (charId === 'crazy_diamond') {
      // Piercing Cyan Crystal Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(headX + 5 * direction, headY - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Heart-Crest Metallic Cyan-Silver Knight Helmet
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;

      // Tall Sculpted Heart Crest on Head
      ctx.beginPath();
      ctx.moveTo(headX - direction * 6, headY - headRadius);
      ctx.bezierCurveTo(
        headX - direction * 2, headY - headRadius - 14,
        headX + direction * 2, headY - headRadius - 16,
        headX + direction * 4, headY - headRadius - 8
      );
      ctx.bezierCurveTo(
        headX + direction * 8, headY - headRadius - 16,
        headX + direction * 12, headY - headRadius - 14,
        headX + direction * 10, headY - headRadius
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chrome Conduit Pipes wrapping around Neck, Shoulders & Chest
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(neckX - direction * 7, neckY + 4, 4.5, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 7, neckY + 4, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Conduit pipe from neck to back
      ctx.beginPath();
      ctx.moveTo(neckX - direction * 5, neckY + 6);
      ctx.bezierCurveTo(neckX - direction * 10, neckY + 12, neckX + direction * 6, neckY + 14, neckX + direction * 5, neckY + 6);
      ctx.stroke();

      // Segmented Cyan Breastplate with Central Glowing Magenta-Pink Heart Gem
      ctx.fillStyle = '#0891b2';
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.5;
      ctx.fillRect(neckX - 8, neckY + 2, 16, 12);
      ctx.strokeRect(neckX - 8, neckY + 2, 16, 12);

      // Large Glowing Center Heart with Specular Highlight
      this.drawHeart(ctx, neckX, neckY + 4, 4.5, '#f43f5e', '#be123c');
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(neckX + 1, neckY + 5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Large Shoulder Spheres with Cyan Crystals
      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 4, 6, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Heart Knuckle Guards on Fists
      this.drawHeart(ctx, leftHandX, leftHandY, 2.5, '#f43f5e', '#e0f2fe');
      this.drawHeart(ctx, rightHandX, rightHandY, 2.5, '#f43f5e', '#e0f2fe');

      // Heart Knee Plates
      this.drawHeart(ctx, leftKneeX, leftKneeY, 3.5, '#06b6d4', '#e0f2fe');
      this.drawHeart(ctx, rightKneeX, rightKneeY, 3.5, '#06b6d4', '#e0f2fe');
    }

    // 4. KING CRIMSON (Diamond Mesh Texture, Forehead Epitaph Face, Angry Yellow Bug Eyes)
    else if (charId === 'king_crimson') {
      // Bulging Sinister Yellow Eyes
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(headX + 5 * direction, headY - 1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Angry Eye Pupil slit
      ctx.fillStyle = '#000000';
      ctx.fillRect(headX + 5 * direction - 0.5, headY - 3, 1, 4);

      // Red Diamond Grid / Mesh on Face
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX - direction * 8, headY - 6);
      ctx.lineTo(headX + direction * 8, headY + 6);
      ctx.moveTo(headX + direction * 8, headY - 6);
      ctx.lineTo(headX - direction * 8, headY + 6);
      ctx.stroke();

      // FOREHEAD EPITAPH (Iconic Small White Forehead Face with Angry Eyes & Mouth)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(headX + direction * 2, headY - 8, 4.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Epitaph's tiny angry eyes and frown
      ctx.fillStyle = '#000000';
      ctx.fillRect(headX + direction * 2 - 2, headY - 9, 1.5, 1.5);
      ctx.fillRect(headX + direction * 2 + 1, headY - 9, 1.5, 1.5);
      ctx.fillRect(headX + direction * 2 - 1.5, headY - 6.5, 3, 1);

      // Angular White Shoulder Pauldrons
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckX - direction * 12, neckY + 6);
      ctx.lineTo(neckX - direction * 5, neckY);
      ctx.lineTo(neckX - direction * 4, neckY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(neckX + direction * 12, neckY + 6);
      ctx.lineTo(neckX + direction * 5, neckY);
      ctx.lineTo(neckX + direction * 4, neckY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 5. SILVER CHARIOT (Silver Knight Helmet, Eye Slot, Armor & Shiny Rapier Blade)
    else if (charId === 'silver_chariot') {
      // Silver Knight Helmet Visor Slot with Electric Blue Optic Slit
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(headX + direction * 2, headY - 3, 6, 2.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(headX + direction * 3, headY - 2.5, 4, 1.5);

      // Top Plume / Knight Helmet Crest
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX - direction * 6, headY - headRadius);
      ctx.lineTo(headX, headY - headRadius - 10);
      ctx.lineTo(headX + direction * 6, headY - headRadius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Articulated Silver Pauldrons (Layered Shoulder Plates)
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 4, 6, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gold Rivets on Shoulders
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 4, 1.5, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Silver Chest Cuirass with Knight Cross
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(neckX - 7, neckY + 2, 14, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(neckX - 7, neckY + 2, 14, 12);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckX, neckY + 4);
      ctx.lineTo(neckX, neckY + 12);
      ctx.moveTo(neckX - 4, neckY + 7);
      ctx.lineTo(neckX + 4, neckY + 7);
      ctx.stroke();

      // Gleaming Silver Rapier Sword held in hand!
      ctx.save();
      const hx = rightHandX;
      const hy = rightHandY;

      // Speed Afterimage Blade Effect (trailing silver ghost lines)
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx + direction * 4, hy - 4);
      ctx.lineTo(hx + direction * 34, hy - 7);
      ctx.moveTo(hx + direction * 4, hy + 4);
      ctx.lineTo(hx + direction * 34, hy + 2);
      ctx.stroke();

      // Sword Guard (Spherical Cup / Bell Hilt)
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx + direction * 4, hy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gold Trim on Cup Hilt
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(hx + direction * 4, hy, 3.5, 0, Math.PI * 2);
      ctx.stroke();

      // Razor-Sharp Needle Rapier Blade
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(hx + direction * 4, hy);
      ctx.lineTo(hx + direction * 36, hy - 2);
      ctx.stroke();

      // Rapier Tip 4-Point Cross Sparkle
      const tipX = hx + direction * 36;
      const tipY = hy - 2;
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cross Star Sparkle on Blade Tip
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tipX - 4, tipY);
      ctx.lineTo(tipX + 4, tipY);
      ctx.moveTo(tipX, tipY - 4);
      ctx.lineTo(tipX, tipY + 4);
      ctx.stroke();

      ctx.restore();
    }

    // 6. WONDER OF U (STAND MANIFESTATION)
    else if (charId === 'tooru') {
      // Crimson Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + 4 * direction, headY - 1, 3, 0, Math.PI * 2);
      ctx.fill();

      // Slit Mouth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX + 2 * direction, headY + 5);
      ctx.lineTo(headX + 7 * direction, headY + 5);
      ctx.stroke();

      // Bowler Top Hat
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(headX, headY - headRadius + 2, headRadius + 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillRect(headX - headRadius - 1, headY - headRadius - 13, (headRadius + 1) * 2, 15);
      ctx.strokeRect(headX - headRadius - 1, headY - headRadius - 13, (headRadius + 1) * 2, 15);

      // Spiked Antenna Feather
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - direction * 6, headY - headRadius - 3);
      ctx.lineTo(headX - direction * 14, headY - headRadius - 20);
      ctx.stroke();

      // Crimson Ascot Tie
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(neckX - 4, neckY + 1);
      ctx.lineTo(neckX + 4, neckY + 1);
      ctx.lineTo(neckX, neckY + 10);
      ctx.closePath();
      ctx.fill();
    }

    // 7. ENRICO PUCCI STANDS (WHITESNAKE, C-MOON, MADE IN HEAVEN)
    else if (charId === 'pucci') {
      const form = fighter.pucciForm || 'whitesnake';

      if (form === 'whitesnake') {
        // WHITESNAKE (White Executioner Mask, Horizontal Slits, Striped Pattern, Disc In Hand)
        // Executioner Mask Top & Visor Slits
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;

        // Striped executioner crown
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius + 1, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();

        // Horizontal Visor Slits on Mask
        ctx.fillStyle = '#0f172a';
        for (let s = -4; s <= 4; s += 3) {
          ctx.fillRect(headX + direction * 2, headY + s, 6, 1.5);
        }

        // Zebra-striped chest pattern (G-D-S-A Letters & Barcodes)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(neckX - 6, neckY + 4);
        ctx.lineTo(neckX + 6, neckY + 7);
        ctx.moveTo(neckX - 7, neckY + 10);
        ctx.lineTo(neckX + 5, neckY + 13);
        ctx.moveTo(neckX - 6, neckY + 16);
        ctx.lineTo(neckX + 6, neckY + 19);
        ctx.stroke();

        // Memory/Stand DISC held in hand when idle, OR pistol when punching/shooting
        if (fighter.action === 'punch' || fighter.action === 'pucci_pistol') {
          const isFiring = (fighter.actionTimer || 0) > (fighter.actionDuration ? fighter.actionDuration * 0.25 : 3);
          this.drawPucciPistolGun(ctx, rightHandX, rightHandY, direction, isFiring, true);
        } else {
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(rightHandX + direction * 4, rightHandY, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Disc Center Hole
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(rightHandX + direction * 4, rightHandY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (form === 'cmoon') {
        // C-MOON (Emerald/Green Alien Humanoid, Arrow Crown, Inversion Ribs)
        // Red Piercing Eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(headX + 4 * direction, headY - 1, 3, 0, Math.PI * 2);
        ctx.fill();

        // Arrow-shaped Crown Headpiece
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(headX - direction * 6, headY - headRadius);
        ctx.lineTo(headX, headY - headRadius - 12);
        ctx.lineTo(headX + direction * 6, headY - headRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Surface Inversion Spiral Ribs on Chest
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(neckX, neckY + 8, 5, 0, Math.PI);
        ctx.arc(neckX, neckY + 14, 6, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Green Shoulder Spikes
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(neckX - direction * 8, neckY);
        ctx.lineTo(neckX - direction * 14, neckY - 6);
        ctx.lineTo(neckX - direction * 6, neckY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(neckX + direction * 8, neckY);
        ctx.lineTo(neckX + direction * 14, neckY - 6);
        ctx.lineTo(neckX + direction * 6, neckY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (form === 'made_in_heaven') {
        // MADE IN HEAVEN (Celestial Centaur-Angel Entity, Clock Face, Feathers, Golden Crown)
        // Clock Face on Forehead
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(headX + direction * 3, headY - 2, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        // Clock needle
        ctx.beginPath();
        ctx.moveTo(headX + direction * 3, headY - 2);
        ctx.lineTo(headX + direction * 3 + Math.sin(time * 0.9) * 3, headY - 2 - Math.cos(time * 0.9) * 3);
        ctx.stroke();

        // Celestial Feather Wings on Shoulders
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(neckX - direction * 7, neckY);
        ctx.quadraticCurveTo(neckX - direction * 24, neckY - 14, neckX - direction * 18, neckY + 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(neckX + direction * 7, neckY);
        ctx.quadraticCurveTo(neckX + direction * 24, neckY - 14, neckX + direction * 18, neckY + 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Half-Centaur Horse Bridle and Mane at Hips
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hipX - 8, hipY);
        ctx.lineTo(hipX + 8, hipY);
        ctx.lineTo(hipX + direction * 16, hipY + 12);
        ctx.lineTo(hipX - direction * 6, hipY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Speed Ring Aura around Made in Heaven
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(headX, headY + 14, 28, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 8. SOFT & WET (GAPPY'S STAND)
    else if (charId === 'gappy') {
      // Split Visor Mask & Glowing Cyan Visor Line
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(headX + 4 * direction, headY - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Vertical Split Visor Line down center of head
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX, headY - headRadius - 2);
      ctx.lineTo(headX, headY + headRadius + 1);
      ctx.stroke();

      // Star Emblem on Chest
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(neckX, neckY + 8, 4, 0, Math.PI * 2);
      ctx.fill();

      // Shoulder Bubble Vents & Sleek Metallic Pads
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(neckX - direction * 8, neckY + 4, 4.5, 0, Math.PI * 2);
      ctx.arc(neckX + direction * 8, neckY + 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Floating Shimmering Bubbles around Soft & Wet
      for (let b = 0; b < 4; b++) {
        const bubbleX = headX + Math.sin(time * 0.15 + b) * 22;
        const bubbleY = neckY + Math.cos(time * 0.15 + b) * 18;
        ctx.strokeStyle = '#7dd3fc';
        ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // 9. D4C (DIRTY DEEDS DONE DIRT CHEAP - FUNNY VALENTINE)
    else if (charId === 'funny_valentine') {
      // 1. Tall Iconic Faceted Rabbit-Ear Horns with Cyan Metallic Shading
      for (const side of [-1, 1]) {
        const rootX = headX + side * 4.5;
        const rootY = headY - headRadius + 1;
        const tipX = headX + side * 14;
        const tipY = headY - headRadius - 28;
        const innerX = headX + side * 2;
        const innerY = headY - headRadius - 18;

        // Outer horn frame
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(innerX, innerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner metallic bevel ridge
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rootX + side * 1, rootY);
        ctx.lineTo(tipX - side * 1, tipY + 2);
        ctx.stroke();
      }

      // 2. White Cross-Stitch Diamond Lattice Mask covering entire face
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1.3;
      // Diamond criss-cross diagonals
      ctx.beginPath();
      ctx.moveTo(headX - headRadius * 0.8, headY - headRadius * 0.5);
      ctx.lineTo(headX + headRadius * 0.8, headY + headRadius * 0.5);
      ctx.moveTo(headX + headRadius * 0.8, headY - headRadius * 0.5);
      ctx.lineTo(headX - headRadius * 0.8, headY + headRadius * 0.5);
      ctx.moveTo(headX, headY - headRadius);
      ctx.lineTo(headX, headY + headRadius);
      ctx.stroke();

      // 3. Glowing Golden Slit Eyes (Menacing & Sharp)
      const eyeX = headX + 3.5 * direction;
      const eyeY = headY - 2;
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 3, 1.8, -0.2 * direction, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dark pupil slit
      ctx.fillStyle = '#78350f';
      ctx.fillRect(eyeX - 0.5, eyeY - 1.5, 1, 3);

      // 4. Quilted Diamond-Stitched Chest Plate & Shoulder Guards
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(neckX - 7, neckY + 3); ctx.lineTo(neckX + 7, neckY + 13);
      ctx.moveTo(neckX + 7, neckY + 3); ctx.lineTo(neckX - 7, neckY + 13);
      ctx.stroke();

      // Shoulder pads with cyan border
      for (const s of [-1, 1]) {
        const shX = neckX + s * 9;
        const shY = neckY + 4;
        ctx.fillStyle = '#bae6fd';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(shX, shY, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Small cross-stitch on shoulder
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(shX - 2, shY - 2); ctx.lineTo(shX + 2, shY + 2);
        ctx.moveTo(shX + 2, shY - 2); ctx.lineTo(shX - 2, shY + 2);
        ctx.stroke();
      }

      // 5. Dimensional Spacetime Shimmer particles surrounding D4C
      const shimmerX = headX + Math.sin(time * 0.3) * 20;
      const shimmerY = headY - 10 + Math.cos(time * 0.3) * 15;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(shimmerX, shimmerY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Stand Punch Strike visual effects when action is punch
      if (fighter.action === 'punch') {
        const timer = fighter.actionTimer || 0;
        const fistX = timer > 11 ? rightHandX : leftHandX;
        const fistY = timer > 11 ? rightHandY : leftHandY;

        ctx.save();
        // Cyan speed trail behind punching fist
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(fistX - 22 * direction, fistY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        // Punching fist body
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(fistX, fistY, 7, 5, direction * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // White cross-stitch on fist
        ctx.beginPath();
        ctx.moveTo(fistX - 3, fistY - 3); ctx.lineTo(fistX + 3, fistY + 3);
        ctx.moveTo(fistX + 3, fistY - 3); ctx.lineTo(fistX - 3, fistY + 3);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 9. DEFAULT STICKMAN SPIRIT
    else {
      // Ethereal glowing halo ring
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(headX, headY - headRadius - 6, 10, 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Spirit Chakra Core
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(neckX, neckY + 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBarrageFlurryArms(
    ctx: CanvasRenderingContext2D,
    neckX: number,
    neckY: number,
    direction: number,
    color: string,
    time: number,
    charId?: string
  ) {
    ctx.save();
    const isSilverChariot = charId === 'silver_chariot';

    if (charId === 'funny_valentine') {
      // D4C: Cyan & White Cross-Stitch Dimensional Fist Barrage with Flag Particles!
      const armCount = 6;
      for (let i = 0; i < armCount; i++) {
        const phase = (time * 0.5 + i * (Math.PI / 3)) % (Math.PI * 2);
        const extend = 32 + Math.sin(phase) * 42;
        const armY = neckY + Math.cos(phase * 1.7) * 20;
        const fistX = neckX + (extend + 20) * direction;
        const fistY = armY + (Math.sin(time * 2 + i) * 6);

        // Dimensional Teal Motion Trail
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + (fistX - neckX) * 0.5, armY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        // D4C Metallic Cyan Arm
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(neckX + (fistX - neckX) * 0.3, armY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        // Fist (Cyan with White Cross-Stitch Seam)
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(fistX, fistY, 8.5, 6, direction * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // White Cross Stitch Seam on Fist
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(fistX - 3, fistY - 3); ctx.lineTo(fistX + 3, fistY + 3);
        ctx.moveTo(fistX + 3, fistY - 3); ctx.lineTo(fistX - 3, fistY + 3);
        ctx.stroke();

        // Dimensional Sparkle Glint
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#f472b6';
        ctx.beginPath();
        ctx.arc(fistX + (Math.random() - 0.5) * 10, fistY + (Math.random() - 0.5) * 10, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (isSilverChariot) {
      // POLNAREFF & SILVER CHARIOT: Supersonic Needle Rapier Thrust Barrage!
      const bladeCount = 6;
      for (let i = 0; i < bladeCount; i++) {
        const phase = (time * 0.55 + i * (Math.PI / 3)) % (Math.PI * 2);
        const extend = 40 + Math.sin(phase) * 50;
        const bladeY = neckY + Math.cos(phase * 1.8) * 18;
        const tipX = neckX + (extend + 25) * direction;
        const tipY = bladeY + (Math.sin(time * 1.5 + i) * 5);
        const hiltX = neckX + 14 * direction;

        // Speed Afterimage Ghost Line
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hiltX, neckY + 4);
        ctx.lineTo(hiltX + (tipX - hiltX) * 0.8, bladeY - 2);
        ctx.lineTo(tipX + direction * 4, tipY);
        ctx.stroke();

        // Silver Bell Cup Hilt Guard
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(hiltX + direction * 4, bladeY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Gold Trim on Hilt
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hiltX + direction * 4, bladeY, 2.5, 0, Math.PI * 2);
        ctx.stroke();

        // Razor Rapier Blade
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(hiltX + direction * 6, bladeY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Glowing Needle Tip Glint
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 4-Point Diamond Sparkle Star at tip
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tipX - 5, tipY);
        ctx.lineTo(tipX + 5, tipY);
        ctx.moveTo(tipX, tipY - 5);
        ctx.lineTo(tipX, tipY + 5);
        ctx.stroke();
      }
    } else if (charId === 'crazy_diamond') {
      // CRAZY DIAMOND: Heart-Knuckle Cyan & Pink High-Speed DORA BARRAGE!
      const armCount = 6;
      for (let i = 0; i < armCount; i++) {
        const phase = (time * 0.45 + i * (Math.PI / 3)) % (Math.PI * 2);
        const extend = 30 + Math.sin(phase) * 40;
        const armY = neckY + Math.cos(phase * 1.6) * 20;
        const fistX = neckX + (extend + 18) * direction;
        const fistY = armY + (Math.sin(time * 1.8 + i) * 6);

        // Speed motion trail
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 6);
        ctx.lineTo(neckX + (fistX - neckX) * 0.5, armY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        // Arm Body (Cyan Metallic Conduit)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(neckX + (fistX - neckX) * 0.35, armY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        // Fist (Cyan Armored Hand with Pink Heart Knuckle Plate)
        ctx.fillStyle = '#0891b2';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(fistX, fistY, 8, 6, direction * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pink Heart on Knuckle
        this.drawHeart(ctx, fistX, fistY, 3, '#f43f5e', '#e0f2fe');

        // Diamond Dust Particle Sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fistX + (Math.random() - 0.5) * 8, fistY + (Math.random() - 0.5) * 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Standard Stand / Martial Arts Punch Barrage
      const armCount = 5;
      for (let i = 0; i < armCount; i++) {
        const phase = (time * 0.4 + i * (Math.PI / 2.5)) % (Math.PI * 2);
        const extend = 25 + Math.sin(phase) * 35;
        const armY = neckY + Math.cos(phase * 1.5) * 22;
        const fistX = neckX + (extend + 15) * direction;
        const fistY = armY + (Math.sin(time + i) * 6);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 6);
        ctx.lineTo(neckX + (fistX - neckX) * 0.5, armY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(neckX + (fistX - neckX) * 0.4, armY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(fistX, fistY, 7, 5, direction * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawProjectiles(projectiles: Projectile[], time: number, isLocalParallelPOV: boolean = false) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();
      if ((!!p.isParallelWorld) !== isLocalParallelPOV) {
        ctx.globalAlpha *= 0.28;
      }

      if (p.type === 'knife') {
        const dir = p.vx >= 0 ? 1 : -1;
        ctx.translate(p.x, p.y);

        // If frozen in stopped time, render floating yellow aura ring
        if (p.isFrozenInTime) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 16 + Math.sin(time * 0.3 + p.id) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Knife Blade
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10 * dir, -3);
        ctx.lineTo(12 * dir, 0);
        ctx.lineTo(-10 * dir, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden handle
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-16 * dir, -2, 6 * dir, 4);

      } else if (p.type === 'space_ripper_beam') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.width, p.y);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.width, p.y);
        ctx.stroke();

      } else if (p.type === 'sendo_wave') {
        // Jonathan's Sendo Hamon Overdrive Ground Ripple Wave
        const waveX = p.x;
        const waveY = p.y;
        
        // Golden Ground Sunburst Radial Wave
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(waveX + p.width / 2, waveY + 15, p.width / 2, 14, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath();
        ctx.ellipse(waveX + p.width / 2, waveY + 15, p.width / 3, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Solar Electricity Lightning Arcs shooting upward from ground
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const sparkX = waveX + (p.width / 4) * i;
          ctx.beginPath();
          ctx.moveTo(sparkX, waveY + 15);
          ctx.lineTo(sparkX + (Math.random() - 0.5) * 12, waveY - 15 - Math.random() * 20);
          ctx.stroke();
        }

      } else if (p.type === 'clacker_volley') {
        // Young Joseph's Clacker Volley Spinning Steel Balls
        const dir = p.vx >= 0 ? 1 : -1;
        const spin = time * 0.4 + p.id;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const ballR = 14;

        // Connecting String (Green/Purple)
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(spin) * ballR, cy + Math.sin(spin) * ballR);
        ctx.lineTo(cx - Math.cos(spin) * ballR, cy - Math.sin(spin) * ballR);
        ctx.stroke();

        // Steel Ball 1
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(spin) * ballR, cy + Math.sin(spin) * ballR, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Steel Ball 2
        ctx.beginPath();
        ctx.arc(cx - Math.cos(spin) * ballR, cy - Math.sin(spin) * ballR, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hamon Sparkle trail behind clackers
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(cx - dir * 18, cy, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'tommy_bullet') {
        // Young Joseph's Tommy Gun High-Velocity Bullets
        const dir = p.vx >= 0 ? 1 : -1;

        // Glowing Bullet Streak
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dir * p.width, p.y);
        ctx.stroke();

        // White Core Tracer
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dir * p.width, p.y);
        ctx.stroke();

        // Smoke/Spark particle head
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x + dir * p.width, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'hermit_vine_grab') {
        // Old Joseph's Hermit Purple Vine Whip
        const dir = p.vx >= 0 ? 1 : -1;
        const vx1 = p.x;
        const vy1 = p.y;
        const vx2 = p.x + dir * p.width;
        const vy2 = p.y;

        // Purple Thorny Vine Whip Body
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(vx1, vy1);
        ctx.bezierCurveTo(
          vx1 + dir * (p.width * 0.3), vy1 - 15,
          vx1 + dir * (p.width * 0.7), vy1 + 15,
          vx2, vy2
        );
        ctx.stroke();

        // Sharp Yellow Thorns along the vine
        ctx.fillStyle = '#facc15';
        for (let i = 1; i <= 3; i++) {
          const tx = vx1 + dir * (p.width * 0.25 * i);
          ctx.beginPath();
          ctx.arc(tx, vy1 + (i % 2 === 0 ? 5 : -5), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Crackling Hamon spark at tip of vine
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vx2, vy2, 5, 0, Math.PI * 2);
        ctx.stroke();

      } else if (p.type === 'blood_blind') {
        // Diavolo's Flesh Throw Blood Splash
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        ctx.fillStyle = '#fb7185';
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Blood droplets
        ctx.fillStyle = '#f43f5e';
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          ctx.arc(cx - (p.vx > 0 ? 1 : -1) * (12 + b * 6), cy + (b % 2 === 0 ? 4 : -4), 3, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (p.type === 'pucci_bullet') {
        // Pucci Whitesnake / C-Moon / MiH Pistol Fire Bullet (Bright Glowing Gold)
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const angle = Math.atan2(p.vy || 0, p.vx || (p.width > p.height ? 1 : 0));

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Muzzle streak trail behind bullet (tapered on first frames so it starts cleanly from the muzzle)
        const maxStreak = Math.min(45, Math.max(0, (p.maxLife - p.life) * 16));
        if (maxStreak > 2) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(-maxStreak, 0);
          ctx.lineTo(0, 0);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-Math.min(30, maxStreak * 0.7), 0);
          ctx.lineTo(0, 0);
          ctx.stroke();
        }

        // Glowing Brass/Gold Bullet Body
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // White hot tip ignition spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(7, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

      } else if (p.type === 'rapier_blade') {
        // Polnareff's Shooting Sword Flying Rapier Blade
        const dir = p.vx >= 0 ? 1 : -1;
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + p.height / 2);
        ctx.lineTo(p.x + dir * p.width, p.y + p.height / 2);
        ctx.stroke();

        // Silver Guard Hilt & Tip Spark
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x + dir * p.width, p.y + p.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'josuke_shard') {
        // JOSUKE HIGASHIKATA: Spinning Glass / Diamond Restoration Shard Projectile
        const dir = p.vx >= 0 ? 1 : -1;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const spin = time * 0.5 + p.id;

        ctx.translate(cx, cy);
        ctx.rotate(spin);

        // Glowing Cyan Outer Restoration Aura Ring
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + Math.sin(time * 0.4) * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Crystalline Diamond Shard Facets
        ctx.fillStyle = '#67e8f9';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, -4);
        ctx.lineTo(10, 12);
        ctx.lineTo(-10, 12);
        ctx.lineTo(-12, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pink Heart Jewel Core inside the Crystal Shard
        this.drawHeart(ctx, 0, 1, 4.5, '#f43f5e', '#ffffff');

        // Specular Glint Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Cross Star Sparkle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, -5);
        ctx.lineTo(0, -5);
        ctx.moveTo(-3, -8);
        ctx.lineTo(-3, -2);
        ctx.stroke();

      } else if (p.type === 'josuke_bearing') {
        // JOSUKE HIGASHIKATA: High-Velocity Sniper Steel Bearing Ball
        const dir = p.vx >= 0 ? 1 : -1;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;

        // Mach Speed Trail Streak
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 35, cy);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 25, cy);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Supersonic Conical Shockwave Rings behind bearing
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx - dir * 12, cy, 4, 12, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Polished Chrome Steel Bearing Sphere
        const grad = ctx.createRadialGradient(cx - dir * 2, cy - 2, 1, cx, cy, 9);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#cbd5e1');
        grad.addColorStop(0.8, '#475569');
        grad.addColorStop(1, '#0f172a');

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Lens Flare / Glint Star on Bearing
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - dir * 2, cy - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 2 - 5, cy - 2);
        ctx.lineTo(cx - dir * 2 + 5, cy - 2);
        ctx.moveTo(cx - dir * 2, cy - 7);
        ctx.lineTo(cx - dir * 2, cy + 3);
        ctx.stroke();

      } else if (p.type === 'rock_insect') {
        // TOORU: Rock Insect (Do Do Do De Da Da Da)
        const dir = p.vx >= 0 ? 1 : -1;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const legWiggle = Math.sin(time * 0.4 + p.id) * 4;

        // Stony Carapace Body
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Toxic Green Mandibles & Saliva
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cx + dir * 11, cy - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Spiked Segmented Insect Legs
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i++) {
          const legBaseX = cx + i * 6;
          ctx.beginPath();
          ctx.moveTo(legBaseX, cy + 3);
          ctx.lineTo(legBaseX - dir * 5, cy + 8 + (i % 2 === 0 ? legWiggle : -legWiggle));
          ctx.lineTo(legBaseX - dir * 9, cy + 12);
          ctx.stroke();
        }

      } else if (p.type === 'calamity_debris') {
        // CALAMITY EVENT: Falling Heavy Object
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        ctx.translate(cx, cy);
        if (p.rotation !== undefined) {
          ctx.rotate(p.rotation + time * 0.05);
        }

        if (p.subType === 'billboard') {
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.fillRect(-22, -15, 44, 30);
          ctx.strokeRect(-22, -15, 44, 30);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ CALAMITY', 0, 4);
        } else if (p.subType === 'pot') {
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.moveTo(-12, -12);
          ctx.lineTo(12, -12);
          ctx.lineTo(8, 12);
          ctx.lineTo(-8, 12);
          ctx.closePath();
          ctx.fill();
          // Plant sprout
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(0, -14, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.subType === 'plane_door') {
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.fillRect(-18, -25, 36, 50);
          ctx.strokeRect(-18, -25, 36, 50);
          // Window
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, -8, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Steel Street Pole
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-4, -25, 8, 50);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(-10, -25, 20, 8);
        }

      } else if (p.type === 'calamity_car') {
        // CALAMITY EVENT: Runaway Speeding Vehicles (🚙🚗🛻🚐🚚🚛)
        const dir = p.vx >= 0 ? 1 : -1;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        ctx.translate(cx, cy);

        const w = p.width;
        const h = p.height;
        const halfW = w / 2;
        const halfH = h / 2;
        const sub = p.subType || 'sedan';

        // Speed streaks & wind lines behind vehicle
        ctx.strokeStyle = p.color || 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-dir * (halfW + 10), -halfH * 0.4);
        ctx.lineTo(-dir * (halfW + 55), -halfH * 0.4);
        ctx.moveTo(-dir * (halfW + 5), 0);
        ctx.lineTo(-dir * (halfW + 70), 0);
        ctx.moveTo(-dir * (halfW + 15), halfH * 0.4);
        ctx.lineTo(-dir * (halfW + 60), halfH * 0.4);
        ctx.stroke();

        // 1. SEDAN (🚗)
        if (sub === 'sedan') {
          // Chassis
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(-halfW + 10, -halfH * 0.3, w - 20, halfH * 0.85, 6);
          ctx.fill();
          ctx.stroke();

          // Sport Roof & Tinted Windows
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.45, -halfH * 0.3);
          ctx.lineTo(-halfW * 0.2, -halfH * 0.85);
          ctx.lineTo(halfW * 0.25, -halfH * 0.85);
          ctx.lineTo(halfW * 0.5, -halfH * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Glass Glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.1, -halfH * 0.8);
          ctx.lineTo(halfW * 0.05, -halfH * 0.8);
          ctx.lineTo(-halfW * 0.08, -halfH * 0.35);
          ctx.lineTo(-halfW * 0.22, -halfH * 0.35);
          ctx.closePath();
          ctx.fill();

          // Spoiler
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(-dir * halfW * 0.85, -halfH * 0.55, 12, 4);

          // Headlight & Volumetric Light Cone
          const lightX = dir * (halfW - 8);
          const beamGrad = ctx.createLinearGradient(lightX, 0, lightX + dir * 180, 0);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
          beamGrad.addColorStop(0.6, 'rgba(253, 224, 71, 0.35)');
          beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lightX, -halfH * 0.2);
          ctx.lineTo(lightX + dir * 180, -halfH * 0.7);
          ctx.lineTo(lightX + dir * 180, halfH * 0.6);
          ctx.lineTo(lightX, halfH * 0.3);
          ctx.closePath();
          ctx.fill();

          // Wheels
          this.drawVehicleWheel(ctx, -halfW * 0.5, halfH * 0.65, 16);
          this.drawVehicleWheel(ctx, halfW * 0.5, halfH * 0.65, 16);
        }
        // 2. SUV (🚙)
        else if (sub === 'suv') {
          // Boxy SUV Body
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#075985';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(-halfW + 8, -halfH * 0.45, w - 16, halfH * 1.05, 8);
          ctx.fill();
          ctx.stroke();

          // High Roof & Windows
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-halfW * 0.75, -halfH * 0.45);
          ctx.lineTo(-halfW * 0.65, -halfH * 0.9);
          ctx.lineTo(halfW * 0.35, -halfH * 0.9);
          ctx.lineTo(halfW * 0.65, -halfH * 0.45);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Roof Rack Bars
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-halfW * 0.6, -halfH * 0.98, w * 0.5, 4);
          ctx.fillRect(-halfW * 0.5, -halfH * 0.95, 4, 6);
          ctx.fillRect(halfW * 0.2, -halfH * 0.95, 4, 6);

          // Front Bull Bar
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(dir * (halfW - 12), -halfH * 0.2, 6, 20);

          // Spare Wheel on rear
          this.drawVehicleWheel(ctx, -dir * (halfW - 5), -halfH * 0.25, 13);

          // Headlight Beam
          const lightX = dir * (halfW - 6);
          const beamGrad = ctx.createLinearGradient(lightX, 0, lightX + dir * 190, 0);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
          beamGrad.addColorStop(0.6, 'rgba(253, 224, 71, 0.35)');
          beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lightX, -halfH * 0.3);
          ctx.lineTo(lightX + dir * 190, -halfH * 0.8);
          ctx.lineTo(lightX + dir * 190, halfH * 0.7);
          ctx.lineTo(lightX, halfH * 0.4);
          ctx.closePath();
          ctx.fill();

          // Big Offroad Wheels
          this.drawVehicleWheel(ctx, -halfW * 0.55, halfH * 0.65, 18);
          this.drawVehicleWheel(ctx, halfW * 0.55, halfH * 0.65, 18);
        }
        // 3. PICKUP TRUCK (🛻)
        else if (sub === 'pickup') {
          // Front Cab
          ctx.fillStyle = '#d97706';
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(-halfW + 8, -halfH * 0.3, w - 16, halfH * 0.9, 6);
          ctx.fill();
          ctx.stroke();

          // Cab Cabin
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(dir > 0 ? -halfW * 0.2 : -halfW * 0.7, -halfH * 0.3);
          ctx.lineTo(dir > 0 ? -halfW * 0.15 : -halfW * 0.6, -halfH * 0.88);
          ctx.lineTo(dir > 0 ? halfW * 0.35 : halfW * 0.1, -halfH * 0.88);
          ctx.lineTo(dir > 0 ? halfW * 0.65 : halfW * 0.2, -halfH * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Open Truck Bed & Roll-bar
          ctx.fillStyle = '#451a03';
          ctx.fillRect(dir > 0 ? -halfW + 12 : halfW * 0.25, -halfH * 0.35, halfW * 0.7, 4);

          // Headlight Beam
          const lightX = dir * (halfW - 6);
          const beamGrad = ctx.createLinearGradient(lightX, 0, lightX + dir * 190, 0);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
          beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lightX, -halfH * 0.2);
          ctx.lineTo(lightX + dir * 190, -halfH * 0.7);
          ctx.lineTo(lightX + dir * 190, halfH * 0.6);
          ctx.lineTo(lightX, halfH * 0.3);
          ctx.closePath();
          ctx.fill();

          // Wheels
          this.drawVehicleWheel(ctx, -halfW * 0.55, halfH * 0.65, 18);
          this.drawVehicleWheel(ctx, halfW * 0.55, halfH * 0.65, 18);
        }
        // 4. DELIVERY VAN (🚐)
        else if (sub === 'van') {
          // Van Body
          ctx.fillStyle = '#64748b';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(-halfW + 8, -halfH * 0.85, w - 16, halfH * 1.45, 8);
          ctx.fill();
          ctx.stroke();

          // Front Windshield
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(dir > 0 ? halfW * 0.35 : -halfW * 0.75, -halfH * 0.75, halfW * 0.45, halfH * 0.45);

          // Sliding Door Seam & Handle
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.strokeRect(-halfW * 0.3, -halfH * 0.8, halfW * 0.6, halfH * 1.3);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(dir > 0 ? halfW * 0.15 : -halfW * 0.25, -halfH * 0.1, 6, 3);

          // Headlight Beam
          const lightX = dir * (halfW - 6);
          const beamGrad = ctx.createLinearGradient(lightX, 0, lightX + dir * 190, 0);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
          beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lightX, -halfH * 0.2);
          ctx.lineTo(lightX + dir * 190, -halfH * 0.8);
          ctx.lineTo(lightX + dir * 190, halfH * 0.7);
          ctx.lineTo(lightX, halfH * 0.4);
          ctx.closePath();
          ctx.fill();

          // Wheels
          this.drawVehicleWheel(ctx, -halfW * 0.55, halfH * 0.65, 17);
          this.drawVehicleWheel(ctx, halfW * 0.55, halfH * 0.65, 17);
        }
        // 5. CARGO FREIGHT TRUCK (🚚)
        else if (sub === 'truck') {
          // Front Driver Cab
          ctx.fillStyle = '#059669';
          ctx.strokeStyle = '#065f46';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(dir > 0 ? halfW * 0.3 : -halfW + 8, -halfH * 0.75, halfW * 0.65, halfH * 1.35, 6);
          ctx.fill();
          ctx.stroke();

          // Big Cargo Container Box
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(dir > 0 ? -halfW + 8 : -halfW * 0.35 + 8, -halfH * 0.95, halfW * 1.25, halfH * 1.55, 4);
          ctx.fill();
          ctx.stroke();

          // Container Hazard Stripes
          ctx.fillStyle = '#eab308';
          ctx.fillRect(dir > 0 ? -halfW + 8 : -halfW * 0.35 + 8, halfH * 0.35, halfW * 1.25, 10);
          ctx.fillStyle = '#0f172a';
          for (let s = 0; s < 5; s++) {
            const sx = (dir > 0 ? -halfW + 15 : -halfW * 0.35 + 15) + s * 22;
            ctx.fillRect(sx, halfH * 0.35, 10, 10);
          }

          // Headlight Beam
          const lightX = dir * (halfW - 4);
          const beamGrad = ctx.createLinearGradient(lightX, 0, lightX + dir * 210, 0);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lightX, -halfH * 0.2);
          ctx.lineTo(lightX + dir * 210, -halfH * 0.85);
          ctx.lineTo(lightX + dir * 210, halfH * 0.8);
          ctx.lineTo(lightX, halfH * 0.4);
          ctx.closePath();
          ctx.fill();

          // Wheels (Twin rear wheels + front cab wheel)
          this.drawVehicleWheel(ctx, dir > 0 ? -halfW * 0.65 : halfW * 0.4, halfH * 0.65, 18);
          this.drawVehicleWheel(ctx, dir > 0 ? -halfW * 0.3 : halfW * 0.75, halfH * 0.65, 18);
          this.drawVehicleWheel(ctx, dir > 0 ? halfW * 0.65 : -halfW * 0.65, halfH * 0.65, 18);
        }
        // 6. HEAVY SEMI TRAILER (🚛)
        else if (sub === 'semi') {
          // Massive Heavy Cab
          ctx.fillStyle = '#b91c1c';
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(dir > 0 ? halfW * 0.35 : -halfW + 8, -halfH * 0.8, halfW * 0.6, halfH * 1.4, 6);
          ctx.fill();
          ctx.stroke();

          // Chrome Exhaust Smoke Stack
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(dir > 0 ? halfW * 0.38 : -halfW * 0.38, -halfH * 1.05, 6, halfH * 0.7);

          // Giant Trailer Container
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.roundRect(dir > 0 ? -halfW + 8 : -halfW * 0.35 + 8, -halfH * 0.95, halfW * 1.3, halfH * 1.55, 4);
          ctx.fill();
          ctx.stroke();

          // Speedwagon / JoJo Emblem on Semi
          ctx.fillStyle = '#fbbf24';
          ctx.font = '900 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SPEEDWAGON', dir > 0 ? -halfW * 0.35 : halfW * 0.35, -halfH * 0.2);

          // Headlight Beam
          const lightX = dir * (halfW - 4);
          const beamGrad = ctx.createLinearGradient(lightX, 0, lightX + dir * 240, 0);
          beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lightX, -halfH * 0.25);
          ctx.lineTo(lightX + dir * 240, -halfH * 0.9);
          ctx.lineTo(lightX + dir * 240, halfH * 0.85);
          ctx.lineTo(lightX, halfH * 0.45);
          ctx.closePath();
          ctx.fill();

          // Triple Axle Heavy Wheels (6 big tires)
          this.drawVehicleWheel(ctx, dir > 0 ? -halfW * 0.7 : halfW * 0.35, halfH * 0.65, 19);
          this.drawVehicleWheel(ctx, dir > 0 ? -halfW * 0.45 : halfW * 0.6, halfH * 0.65, 19);
          this.drawVehicleWheel(ctx, dir > 0 ? -halfW * 0.2 : halfW * 0.85, halfH * 0.65, 19);
          this.drawVehicleWheel(ctx, dir > 0 ? halfW * 0.7 : -halfW * 0.7, halfH * 0.65, 19);
        }

      } else if (p.type === 'calamity_raindrop') {
        // Heavy Piercing Rain
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx, p.y + p.height);
        ctx.stroke();

      } else if (p.type === 'calamity_meteor') {
        // Giant Calamity Meteor with Blazing Fire Trail
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const radius = p.width / 2;

        // Trailing Fire Trail (Opposite of velocity)
        const trailLen = 80;
        const trailGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx - p.vx * 3, cy - p.vy * 3, radius * 2.5);
        trailGrad.addColorStop(0, 'rgba(249, 115, 22, 0.9)');
        trailGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
        trailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.arc(cx - p.vx * 2, cy - p.vy * 2, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Outer Fiery Corona
        const fireGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
        fireGrad.addColorStop(0, '#ffffff');
        fireGrad.addColorStop(0.25, '#fef08a');
        fireGrad.addColorStop(0.55, '#f97316');
        fireGrad.addColorStop(0.85, '#ef4444');
        fireGrad.addColorStop(1, 'rgba(127, 29, 29, 0.9)');

        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Molten Surface Cracks & Magma Veins
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 10, 16, 0, Math.PI);
        ctx.arc(cx + 14, cy + 8, 18, Math.PI * 0.5, Math.PI * 1.5);
        ctx.moveTo(cx - 18, cy + 6);
        ctx.lineTo(cx + 10, cy - 14);
        ctx.stroke();

      } else if (p.type === 'gappy_plunder_bubble') {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const r = p.width / 2;
        const pulse = Math.sin(time * 0.2 + p.id) * 2;

        // Soap Bubble Outer Translucent Sphere
        const bubbleGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bubbleGrad.addColorStop(0.35, 'rgba(186, 230, 253, 0.7)');
        bubbleGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.5)');
        bubbleGrad.addColorStop(1, 'rgba(2, 132, 199, 0.8)');

        ctx.fillStyle = bubbleGrad;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shiny White Crescent Specular Sheen
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Soap Suds Icon inside bubble (🧼)
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧼', cx, cy + 1);

      } else if (p.type === 'gappy_shave_bubble') {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const r = p.width / 2;
        const spin = time * 0.3 + p.id;

        // Royal Blue Plunder Moisture Bubble
        const bubbleGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        bubbleGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
        bubbleGrad.addColorStop(0.4, 'rgba(14, 165, 233, 0.75)');
        bubbleGrad.addColorStop(1, 'rgba(3, 105, 161, 0.9)');

        ctx.fillStyle = bubbleGrad;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spinning Scissors / Razor Symbol inside
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(spin);
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, 10);
        ctx.moveTo(10, -10);
        ctx.lineTo(-10, 10);
        ctx.stroke();
        ctx.restore();

        // Specular Sheen
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'gappy_barrage_bubble') {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const r = p.width / 2;
        const dir = p.vx >= 0 ? 1 : -1;

        // Motion blur line behind barrage bubble
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = r * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 25, cy);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Fast Cyan Soap Bubble
        const bubbleGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        bubbleGrad.addColorStop(0, '#ffffff');
        bubbleGrad.addColorStop(0.4, '#7dd3fc');
        bubbleGrad.addColorStop(1, '#0284c7');

        ctx.fillStyle = bubbleGrad;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Specular Dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'gappy_trap_bubble') {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const r = p.width / 2;
        const pulse = Math.sin(time * 0.25) * 3;

        // Large Light-Blue Trapping Sphere
        const bubbleGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bubbleGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.8)');
        bubbleGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.6)');
        bubbleGrad.addColorStop(1, 'rgba(2, 132, 199, 0.9)');

        ctx.fillStyle = bubbleGrad;
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Swirling Inner Bubble Fluid
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, time * 0.2, time * 0.2 + Math.PI * 1.2);
        ctx.stroke();

        // Specular Curve
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.25, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'gappy_go_beyond') {
        // ★ SOFT & WET: GO BEYOND (見えないシャボン玉) ★
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const r = p.width / 2;
        const dir = p.vx >= 0 ? 1 : -1;
        const spin = time * 0.7;

        // Trailing Spinning Thread launched from Gappy's Star Birthmark
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 120, cy);
        for (let t = -120; t <= 0; t += 10) {
          const waveY = cy + Math.sin(spin + t * 0.08) * 8;
          if (t === -120) ctx.moveTo(cx + dir * t, waveY);
          else ctx.lineTo(cx + dir * t, waveY);
        }
        ctx.stroke();

        // Spinning Spiral Thread Ring surrounding the non-existent core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.25) {
          const spiralR = (a / (Math.PI * 6)) * r;
          const px = cx + Math.cos(spin + a) * spiralR;
          const py = cy + Math.sin(spin + a) * spiralR;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Glowing Outer Cosmic Void Shell
        const goBeyondGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
        goBeyondGrad.addColorStop(0, '#ffffff');
        goBeyondGrad.addColorStop(0.3, '#7dd3fc');
        goBeyondGrad.addColorStop(0.65, '#0284c7');
        goBeyondGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.fillStyle = goBeyondGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Center Invisible Core Point
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Manga Text Label Indicator
        ctx.font = '900 12px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('GO BEYOND★', cx, cy - r - 4);

      } else if (p.type === 'valentine_flag_whip') {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const dir = p.vx >= 0 ? 1 : -1;
        const wave1 = Math.sin(time * 0.45) * 8;
        const wave2 = Math.cos(time * 0.5) * 6;

        ctx.save();
        ctx.translate(cx, cy);
        if (dir === -1) ctx.scale(-1, 1);

        // Dimensional Spacetime Motion Blur Trails
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-35, wave1 * 0.5);
        ctx.lineTo(25, -wave1 * 0.5);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-35, -wave2 * 0.5);
        ctx.lineTo(25, wave2 * 0.5);
        ctx.stroke();

        // Golden Flagstaff with Eagle Spearhead Finial
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(25, wave1 * 0.6);
        ctx.stroke();

        // Eagle Finial Spearhead
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(25, wave1 * 0.6);
        ctx.lineTo(32, wave1 * 0.6 - 4);
        ctx.lineTo(30, wave1 * 0.6 + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Waving Silk American Flag Cloth (Bezier Curved)
        const flagX = -20;
        const flagY = -18 + wave1;
        const flagW = 44;
        const flagH = 34;

        // Base Red Silk
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(flagX, flagY);
        ctx.bezierCurveTo(flagX + 15, flagY + wave2, flagX + 30, flagY - wave2, flagX + flagW, flagY + wave1 * 0.5);
        ctx.lineTo(flagX + flagW, flagY + flagH + wave1 * 0.5);
        ctx.bezierCurveTo(flagX + 30, flagY + flagH - wave2, flagX + 15, flagY + flagH + wave2, flagX, flagY + flagH);
        ctx.closePath();
        ctx.fill();

        // White Silk Stripes
        ctx.fillStyle = '#f8fafc';
        for (let s = 1; s < 5; s += 2) {
          const sy = flagY + s * (flagH / 5);
          ctx.beginPath();
          ctx.moveTo(flagX, sy);
          ctx.bezierCurveTo(flagX + 15, sy + wave2, flagX + 30, sy - wave2, flagX + flagW, sy + wave1 * 0.5);
          ctx.lineTo(flagX + flagW, sy + (flagH / 10) + wave1 * 0.5);
          ctx.bezierCurveTo(flagX + 30, sy + (flagH / 10) - wave2, flagX + 15, sy + (flagH / 10) + wave2, flagX, sy + (flagH / 10));
          ctx.closePath();
          ctx.fill();
        }

        // Navy Blue Canton
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(flagX, flagY, 18, 18);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.strokeRect(flagX, flagY, 18, 18);

        // White Stars
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.fillText('★', flagX + 2, flagY + 8);
        ctx.fillText('★', flagX + 10, flagY + 8);
        ctx.fillText('★', flagX + 6, flagY + 16);

        // Gold Tassel Outer Fringe
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(flagX + flagW, flagY + wave1 * 0.5);
        ctx.lineTo(flagX + flagW, flagY + flagH + wave1 * 0.5);
        ctx.stroke();

        ctx.restore();
      } else if (p.type === 'dipez_photon_bullet') {
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const dir = p.vx >= 0 ? 1 : -1;

        // Glowing Photon Laser Streak
        const streakGrad = ctx.createLinearGradient(cx - dir * 45, cy, cx + dir * 18, cy);
        streakGrad.addColorStop(0, 'rgba(254, 240, 138, 0)');
        streakGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.75)');
        streakGrad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 45, cy);
        ctx.lineTo(cx + dir * 18, cy);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - dir * 30, cy);
        ctx.lineTo(cx + dir * 18, cy);
        ctx.stroke();

        // Concentric Photon Shockwave Ring
        const shock = (time * 0.35 + p.id) % (Math.PI * 2);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 6 + Math.sin(shock) * 3, 14, 0, 0, Math.PI * 2);
        ctx.stroke();

        // High-Intensity Photon Core Sphere
        const coreGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 8);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#fef08a');
        coreGrad.addColorStop(1, '#eab308');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();

        // Solar Energy Sparkles
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
          const spAngle = time * 0.4 + i * (Math.PI * 2 / 3);
          const spX = cx + Math.cos(spAngle) * 12;
          const spY = cy + Math.sin(spAngle) * 12;
          ctx.beginPath();
          ctx.arc(spX, spY, 2, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (p.type === 'dipez_laser_beam') {
        const lx = p.x;
        const ly = p.y;
        const lw = p.width;
        const lh = p.height;
        const beamCenterY = ly + lh / 2;

        // 1. Massive Outer Sky-Blue Laser Aura
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = lh;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lx, beamCenterY);
        ctx.lineTo(lx + lw, beamCenterY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = lh * 0.6;
        ctx.beginPath();
        ctx.moveTo(lx, beamCenterY);
        ctx.lineTo(lx + lw, beamCenterY);
        ctx.stroke();

        // 2. Pure White Core Laser
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = lh * 0.3;
        ctx.beginPath();
        ctx.moveTo(lx, beamCenterY);
        ctx.lineTo(lx + lw, beamCenterY);
        ctx.stroke();

        // 3. Traveling Pulsating Energy Plasma Rings along beam length
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        const numRings = 8;
        for (let i = 0; i < numRings; i++) {
          const rx = lx + ((time * 14 + i * (lw / numRings)) % lw);
          ctx.beginPath();
          ctx.ellipse(rx, beamCenterY, 8, lh * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 4. Muzzle energy burst shockwave at laser source
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lx, beamCenterY, lh * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(lx, beamCenterY, lh * 0.95, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'dipez_map_laser_beam') {
        // ★ OMNIPRESENT MAP-WIDE SKY-LASER ★
        const fullW = p.width;
        const fullH = p.height;

        // 1. Full Screen Blinding Sky-Cyan Outer Laser Aura
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fillRect(0, 0, fullW, fullH);

        // 2. Central Super High-Intensity Blinding Golden-White Beam
        const beamGrad = ctx.createLinearGradient(0, 80, 0, fullH - 80);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.2)');
        beamGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.9)');
        beamGrad.addColorStop(0.5, '#ffffff');
        beamGrad.addColorStop(0.8, 'rgba(254, 240, 138, 0.9)');
        beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0.2)');

        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 60, fullW, fullH - 120);

        // 3. Horizontal Energy Waves & Plasma Currents
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        for (let i = 0; i < 6; i++) {
          const waveY = 100 + i * 65;
          ctx.beginPath();
          ctx.moveTo(0, waveY);
          for (let wx = 0; wx <= fullW; wx += 40) {
            const wy = waveY + Math.sin(time * 0.2 + wx * 0.05 + i) * 16;
            ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        // 4. Solar Plasma Sparkles raining across map
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 20; i++) {
          const px = (time * 18 + i * 73) % fullW;
          const py = (time * 12 + i * 47) % fullH;
          ctx.beginPath();
          ctx.arc(px, py, 3 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  private drawParticles(particles: Particle[], time: number) {
    const ctx = this.ctx;
    if (particles.length === 0) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const alpha = p.life / p.maxLife;
      if (alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      if (p.type === 'barrage_arm' || p.type === 'fist') {
        this.renderBarrageArmParticle(ctx, p, alpha);
      } else if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.6 - alpha * 0.6), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'text') {
        ctx.font = '900 20px "Impact", sans-serif';
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text || 'BAM!', p.x, p.y);
        ctx.fillText(p.text || 'BAM!', p.x, p.y);
      } else if (p.type === 'menacing') {
        const fontSize = p.size || 32;
        ctx.font = `900 ${fontSize}px "Impact", "Comic Sans MS", cursive, sans-serif`;
        ctx.fillStyle = p.color || 'rgba(192, 132, 252, 0.95)';
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = Math.max(2, fontSize / 10);
        ctx.shadowColor = '#581c87';
        ctx.shadowBlur = 6;
        ctx.strokeText(p.text || 'ゴ', p.x, p.y);
        ctx.fillText(p.text || 'ゴ', p.x, p.y);
        ctx.shadowBlur = 0;
      } else if (p.type === 'paradox_cube') {
        const size = (p.size || 10) * alpha;
        ctx.fillStyle = p.color || '#38bdf8';
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 0.1);
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeRect(-size / 2, -size / 2, size, size);

        // Inner Menger Sponge hole
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-size / 6, -size / 6, size / 3, size / 3);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  private renderBarrageArmParticle(
    ctx: CanvasRenderingContext2D,
    p: Particle,
    alpha: number
  ) {
    const originX = p.originX ?? (p.x - (p.vx > 0 ? 80 : -80));
    const originY = p.originY ?? p.y;
    const targetX = p.x;
    const targetY = p.y;
    const dir = p.vx >= 0 ? 1 : -1;

    if (p.isRapier) {
      // Silver Chariot Needle Rapier Thrust
      ctx.strokeStyle = p.glowColor || 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4 * alpha;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Silver Blade
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * alpha;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Bell Hilt Guard at origin
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(originX, originY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sparkling Star on Thrust Tip
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(targetX - 4, targetY);
      ctx.lineTo(targetX + 4, targetY);
      ctx.moveTo(targetX, targetY - 4);
      ctx.lineTo(targetX, targetY + 4);
      ctx.stroke();
    } else {
      ctx.strokeStyle = p.glowColor || 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 6 * alpha;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      ctx.strokeStyle = p.armColor || p.color;
      ctx.lineWidth = 3 * alpha;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(targetX, targetY, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawVehicleWheel(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    // Outer Rubber Tire
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tire Tread / Deep Rim
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Silver Alloy Rim Hub
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Alloy Wheel Spokes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    for (let sp = 0; sp < 4; sp++) {
      const angle = (sp * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * (radius * 0.2), y + Math.sin(angle) * (radius * 0.2));
      ctx.lineTo(x + Math.cos(angle) * (radius * 0.65), y + Math.sin(angle) * (radius * 0.65));
      ctx.stroke();
    }

    // Center Chrome Cap
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPucciPistolGun(
    ctx: CanvasRenderingContext2D,
    handX: number,
    handY: number,
    direction: number,
    isFiring: boolean,
    isStand: boolean
  ) {
    ctx.save();
    ctx.translate(handX, handY);
    ctx.scale(direction, 1);

    // Gun Body / Slide (Sleek Chrome & Shadowed Steel)
    ctx.fillStyle = isStand ? '#1e1b4b' : '#334155';
    ctx.strokeStyle = isStand ? '#c084fc' : '#0f172a';
    ctx.lineWidth = 1.2;

    // Slide & Barrel
    ctx.beginPath();
    ctx.rect(0, -3, 14, 5);
    ctx.fill();
    ctx.stroke();

    // Metallic barrel top highlight
    ctx.fillStyle = isStand ? '#facc15' : '#94a3b8';
    ctx.fillRect(2, -4, 11, 1.5);

    // Grip
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(-4, 9);
    ctx.lineTo(1, 10);
    ctx.lineTo(5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Trigger Guard
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(3, 4, 2.5, 0, Math.PI * 0.9);
    ctx.stroke();

    // Muzzle Flash & Spark Burst when firing
    if (isFiring) {
      const mx = 16;
      const my = -0.5;

      // Bright Golden / White Muzzle Blast Star
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(mx + 14, my);
      ctx.lineTo(mx + 4, my - 4);
      ctx.lineTo(mx + 6, my - 10);
      ctx.lineTo(mx + 2, my - 4);
      ctx.lineTo(mx - 2, my - 9);
      ctx.lineTo(mx, my - 2);
      ctx.lineTo(mx - 6, my);
      ctx.lineTo(mx, my + 2);
      ctx.lineTo(mx - 2, my + 9);
      ctx.lineTo(mx + 2, my + 4);
      ctx.lineTo(mx + 6, my + 10);
      ctx.lineTo(mx + 4, my + 4);
      ctx.closePath();
      ctx.fill();

      // White hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mx + 2, my, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Smoke puff
      ctx.fillStyle = 'rgba(226, 232, 240, 0.4)';
      ctx.beginPath();
      ctx.arc(mx + 8, my - 5, 4, 0, Math.PI * 2);
      ctx.arc(mx + 12, my + 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawValentineRevolverGun(
    ctx: CanvasRenderingContext2D,
    handX: number,
    handY: number,
    direction: number,
    isFiring: boolean,
    isStand: boolean
  ) {
    ctx.save();
    ctx.translate(handX, handY);
    ctx.scale(direction, 1);

    // Silver / Polished Chrome Revolver Frame & Long Barrel (Colt Single Action Army / Schofield style)
    ctx.fillStyle = isStand ? '#e0f2fe' : '#f1f5f9';
    ctx.strokeStyle = isStand ? '#0284c7' : '#475569';
    ctx.lineWidth = 1.2;

    // Long Barrel
    ctx.beginPath();
    ctx.rect(0, -3, 16, 4.5);
    ctx.fill();
    ctx.stroke();

    // Top rib sight & fine metal engraving highlight
    ctx.fillStyle = isStand ? '#38bdf8' : '#cbd5e1';
    ctx.fillRect(1, -4.5, 14, 1.5);

    // Revolver Cylinder (Fluted 6-shot cylinder)
    ctx.fillStyle = isStand ? '#bae6fd' : '#e2e8f0';
    ctx.strokeStyle = isStand ? '#0369a1' : '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(-6, -3.5, 6, 6);
    ctx.fill();
    ctx.stroke();

    // Cylinder flute notches
    ctx.fillStyle = isStand ? '#0284c7' : '#64748b';
    ctx.fillRect(-4.5, -2, 3, 1.2);
    ctx.fillRect(-4.5, 1, 3, 1.2);

    // Hammer (Cocked back)
    ctx.strokeStyle = isStand ? '#38bdf8' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(-9, -5);
    ctx.stroke();

    // Pearl / Polished Walnut Grip Handle
    ctx.fillStyle = isStand ? '#fde047' : '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(-8, 7, -3, 11);
    ctx.lineTo(2, 10);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Trigger Guard & Trigger
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-1, 4, 2.5, 0, Math.PI * 0.9);
    ctx.stroke();

    // Muzzle Flash & Gunpowder Blast Star when firing
    if (isFiring) {
      const mx = 18;
      const my = -0.8;

      // Bright Golden / White Muzzle Blast Star
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(mx + 16, my);
      ctx.lineTo(mx + 5, my - 5);
      ctx.lineTo(mx + 8, my);
      ctx.lineTo(mx + 5, my + 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mx + 4, my, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Gunpowder smoke puff
      ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
      ctx.beginPath();
      ctx.arc(mx + 9, my - 3, 4, 0, Math.PI * 2);
      ctx.arc(mx + 14, my - 1, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
