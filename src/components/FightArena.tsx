import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { ARENA_WIDTH, ARENA_HEIGHT } from '../game/constants';
import { networkManager, GamePacket } from '../game/networkManager';
import { FightHUD } from './FightHUD';
import { TouchControls } from './TouchControls';
import { MatchIntroCutscene } from './MatchIntroCutscene';
import { InputState, MatchConfig, Fighter } from '../types';
import { soundManager } from '../game/audio';
import { Trophy, Skull, RotateCcw, Home, ArrowLeft, Settings2, Sparkles, Zap, Flame, Clock, MessageSquareQuote, Bot } from 'lucide-react';

interface FightArenaProps {
  matchConfig: MatchConfig;
  onBackToMenu: () => void;
  onBackToSetup: () => void;
  onBackToMultiplayerLobby?: () => void;
  bgMusicEnabled: boolean;
  sfxEnabled: boolean;
  networkRole?: 'host' | 'client' | 'offline';
}

export const FightArena: React.FC<FightArenaProps> = ({ 
  matchConfig,
  onBackToMenu,
  onBackToSetup,
  onBackToMultiplayerLobby,
  sfxEnabled,
  networkRole = 'offline',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine>(new GameEngine(matchConfig));
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Cinematic Intro Cutscene State
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(!sfxEnabled);
  const [pingMs, setPingMs] = useState<number>(0);

  const isClient = networkRole === 'client';
  const isMultiplayer = networkRole !== 'offline';

  // Synchronized react states for UI
  const [hudState, setHudState] = useState<{
    player: Fighter;
    ai: Fighter;
    teammate?: Fighter;
    matchTime: number;
    isGameOver: boolean;
    winner: 'player' | 'ai' | 'draw' | null;
    survivalStreak: number;
    timeStopActive: boolean;
  }>({
    player: engineRef.current.player,
    ai: engineRef.current.ai,
    teammate: engineRef.current.teammate || undefined,
    matchTime: engineRef.current.matchTime,
    isGameOver: engineRef.current.isGameOver,
    winner: engineRef.current.winner,
    survivalStreak: engineRef.current.survivalStreak,
    timeStopActive: engineRef.current.timeStopState.isActive,
  });

  // Keep engine matchConfig updated
  useEffect(() => {
    engineRef.current.setMatchConfig(matchConfig);
    if (rendererRef.current) {
      rendererRef.current.setMap(matchConfig.map);
    }
    setShowIntro(true);
    setHudState({
      player: engineRef.current.player,
      ai: engineRef.current.ai,
      teammate: engineRef.current.teammate || undefined,
      matchTime: engineRef.current.matchTime,
      isGameOver: false,
      winner: null,
      survivalStreak: 0,
      timeStopActive: false,
    });
  }, [matchConfig]);

  // Track combined inputs (keyboard + touch)
  const inputRef = useRef<InputState>({
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
  });

  const clientInputRef = useRef<InputState>({
    left: false, right: false, jump: false, crouch: false, punch: false,
    barrage: false, toggleStand: false, pose: false, skill1: false, skill2: false,
    skill3: false, skill4: false, skill5: false, timeStop: false, ultimate: false
  });

  // P2P Network Data Sync handler
  useEffect(() => {
    if (!networkRole || networkRole === 'offline') return;

    const pingTimer = setInterval(() => {
      setPingMs(networkManager.pingMs);
    }, 500);

    networkManager.onDataReceived = (packet: GamePacket) => {
      if (networkRole === 'host') {
        if (packet.type === 'input' && packet.input) {
          clientInputRef.current = packet.input;
        }
        if (packet.type === 'rematch') {
          engineRef.current.reset();
          setShowIntro(true);
        }
      } else if (networkRole === 'client') {
        if (packet.type === 'state') {
          const engine = engineRef.current;
          if (packet.playerState) Object.assign(engine.player, packet.playerState);
          if (packet.aiState) Object.assign(engine.ai, packet.aiState);
          if (packet.projectiles) engine.projectiles = packet.projectiles;
          if (packet.particles) engine.particles = packet.particles;
          if (packet.timeStopState) engine.timeStopState = packet.timeStopState;
          if (packet.activeGravityAxis) engine.activeGravityAxis = packet.activeGravityAxis;
          if (packet.screenShake !== undefined) engine.screenShake = packet.screenShake;
          if (packet.matchTime !== undefined) engine.matchTime = packet.matchTime;
          if (packet.isGameOver !== undefined) engine.isGameOver = packet.isGameOver;
          engine.winner = (packet.winner as "ai" | "player" | "draw" | null) ?? null;
        }
        if (packet.type === 'rematch') {
          engineRef.current.reset();
          setShowIntro(true);
        }
      }
    };

    return () => {
      clearInterval(pingTimer);
      networkManager.onDataReceived = undefined;
    };
  }, [networkRole]);

  // Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      if (key === 'a' || e.code === 'ArrowLeft') inputRef.current.left = true;
      if (key === 'd' || e.code === 'ArrowRight') inputRef.current.right = true;
      if (key === 'w' || e.code === 'ArrowUp' || e.code === 'Space') inputRef.current.jump = true;
      if (key === 's' || e.code === 'ArrowDown') inputRef.current.crouch = true;
      
      if (key === 'j' || key === 'z') inputRef.current.punch = true;
      if (key === 'k' || key === 'x') inputRef.current.barrage = true;
      if (key === 'l' || key === 'c') inputRef.current.toggleStand = true;
      if (key === 'b') inputRef.current.pose = true;

      // Character skill keys
      if (key === 'u') inputRef.current.skill1 = true;
      if (key === 'i') inputRef.current.skill2 = true;
      if (key === 'o') inputRef.current.skill3 = true;
      if (key === 'p') inputRef.current.skill4 = true;
      if (key === 'h') inputRef.current.skill5 = true;
      if (key === 't') inputRef.current.timeStop = true;
      if (key === 'y') inputRef.current.ultimate = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || e.code === 'ArrowLeft') inputRef.current.left = false;
      if (key === 'd' || e.code === 'ArrowRight') inputRef.current.right = false;
      if (key === 'w' || e.code === 'ArrowUp' || e.code === 'Space') inputRef.current.jump = false;
      if (key === 's' || e.code === 'ArrowDown') inputRef.current.crouch = false;
      
      if (key === 'j' || key === 'z') inputRef.current.punch = false;
      if (key === 'k' || key === 'x') inputRef.current.barrage = false;
      if (key === 'l' || key === 'c') inputRef.current.toggleStand = false;
      if (key === 'b') inputRef.current.pose = false;

      // Character skill keys
      if (key === 'u') inputRef.current.skill1 = false;
      if (key === 'i') inputRef.current.skill2 = false;
      if (key === 'o') inputRef.current.skill3 = false;
      if (key === 'p') inputRef.current.skill4 = false;
      if (key === 'h') inputRef.current.skill5 = false;
      if (key === 't') inputRef.current.timeStop = false;
      if (key === 'y') inputRef.current.ultimate = false;
    };

    const handleBlur = () => {
      // Clear held keys when switching tabs or window loses focus
      inputRef.current = {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Virtual touch button handler
  const handleTouchInput = useCallback((key: keyof InputState, value: boolean) => {
    inputRef.current[key] = value;
  }, []);

  // Restart match
  const handleRestart = () => {
    if (networkRole === 'host' || networkRole === 'client') {
      networkManager.send({
        type: 'rematch',
        sender: networkRole,
      });
    }
    engineRef.current.reset();
    setShowIntro(true);
    setHudState({
      player: engineRef.current.player,
      ai: engineRef.current.ai,
      matchTime: engineRef.current.matchTime,
      isGameOver: false,
      winner: null,
      survivalStreak: engineRef.current.survivalStreak,
      timeStopActive: false,
    });
  };

  const handleBackToSetupOrLobby = () => {
    soundManager.stopTooruMatchBgm();
    soundManager.stopAllBgm();
    if (networkRole && networkRole !== 'offline') {
      if (onBackToMultiplayerLobby) {
        onBackToMultiplayerLobby();
      } else {
        onBackToSetup();
      }
    } else {
      onBackToSetup();
    }
  };

  const handleLeaveToTitle = () => {
    soundManager.stopTooruMatchBgm();
    soundManager.stopAllBgm();
    if (networkRole && networkRole !== 'offline') {
      networkManager.close();
    }
    onBackToMenu();
  };

  // Main 60 FPS Game Loop with Delta Time and Hardware Acceleration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    rendererRef.current.setMap(matchConfig.map);
    let tickCount = 0;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      try {
        // Calculate delta time normalized to 60 FPS (16.67ms = 1.0)
        const elapsedMs = currentTime - lastTime;
        lastTime = currentTime;
        const dt = Math.min(2.0, Math.max(0.5, elapsedMs / 16.67));

        tickCount++;
        const engine = engineRef.current;
        const renderer = rendererRef.current;

        // Only update game physics & AI if intro cutscene is finished
        if (!showIntro) {
          if (networkRole === 'host') {
            engine.update(inputRef.current, dt, clientInputRef.current);
            if (tickCount % 2 === 0) {
              networkManager.send({
                type: 'state',
                sender: 'host',
                playerState: engine.player,
                aiState: engine.ai,
                projectiles: engine.projectiles,
                particles: engine.particles,
                timeStopState: engine.timeStopState,
                activeGravityAxis: engine.activeGravityAxis,
                screenShake: engine.screenShake,
                matchTime: engine.matchTime,
                isGameOver: engine.isGameOver,
                winner: engine.winner
              });
            }
          } else if (networkRole === 'client') {
            networkManager.send({
              type: 'input',
              sender: 'client',
              input: inputRef.current
            });
            // Client relies on incoming state packets from host
          } else {
            engine.update(inputRef.current, dt);
          }
        }

        // Handle screen shake in canvas context
        ctx.save();
        if (engine.screenShake > 0) {
          const shakeX = (Math.random() - 0.5) * engine.screenShake * 3;
          const shakeY = (Math.random() - 0.5) * engine.screenShake * 3;
          ctx.translate(shakeX, shakeY);
        }

        // Render fighters, stands, projectiles, particles, and Time Stop overlays
        if (renderer) {
          renderer.activeGravityAxis = engine.activeGravityAxis;
          renderer.acidPools = engine.acidPools;
          renderer.isMultiplayer = isMultiplayer;
          renderer.localPlayerId = isClient ? 'ai' : 'player';
          const arenaWidth = engine.getArenaWidth();
          renderer.render(
            engine.player, 
            engine.ai, 
            engine.projectiles, 
            engine.particles, 
            tickCount, 
            engine.timeStopState,
            matchConfig.map,
            arenaWidth,
            engine.teammate,
            engine.vampires,
            engine.acidPools
          );
        }
        ctx.restore();

        // Sync React HUD state on alternating frames to keep 60 FPS main thread lightweight
        if (tickCount % 2 === 0) {
          setHudState({
            player: { ...engine.player },
            ai: { ...engine.ai },
            teammate: engine.teammate ? { ...engine.teammate } : undefined,
            matchTime: engine.matchTime,
            isGameOver: engine.isGameOver,
            winner: engine.winner,
            survivalStreak: engine.survivalStreak,
            timeStopActive: engine.timeStopState.isActive,
          });
        }

        animFrameIdRef.current = requestAnimationFrame(loop);
      } catch (gameError: any) {
        console.error("Critical game loop crash detected:", gameError);
        // Explicitly propagate crash to window error handler so ErrorBoundary catches it immediately
        window.dispatchEvent(new ErrorEvent('error', {
          error: gameError,
          message: gameError.message || 'Critical Gameplay Loop Crash'
        }));
      }
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    // Background tab continuity runner (keeps 60Hz physics & WebRTC network packets active when switching tabs)
    let backgroundInterval: any = null;

    const runBackgroundTick = () => {
      if (showIntro) return;
      tickCount++;
      const engine = engineRef.current;
      const dt = 1.0;

      if (networkRole === 'host') {
        engine.update(inputRef.current, dt, clientInputRef.current);
        if (tickCount % 2 === 0) {
          networkManager.send({
            type: 'state',
            sender: 'host',
            playerState: engine.player,
            aiState: engine.ai,
            projectiles: engine.projectiles,
            particles: engine.particles,
            timeStopState: engine.timeStopState,
            activeGravityAxis: engine.activeGravityAxis,
            screenShake: engine.screenShake,
            matchTime: engine.matchTime,
            isGameOver: engine.isGameOver,
            winner: engine.winner
          });
        }
      } else if (networkRole === 'client') {
        networkManager.send({
          type: 'input',
          sender: 'client',
          input: inputRef.current
        });
      } else {
        engine.update(inputRef.current, dt);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!backgroundInterval) {
          backgroundInterval = setInterval(runBackgroundTick, 16.6);
        }
      } else {
        if (backgroundInterval) {
          clearInterval(backgroundInterval);
          backgroundInterval = null;
        }
        lastTime = performance.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (backgroundInterval) {
        clearInterval(backgroundInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [matchConfig, showIntro]);

  const localFighter = isClient ? hudState.ai : hudState.player;
  const isJotaro = localFighter.charId === 'jotaro';
  const isDio = localFighter.charId === 'dio';
  const isCrazyDiamond = localFighter.charId === 'crazy_diamond';
  const isDiavolo = localFighter.charId === 'king_crimson';
  const isPolnareff = localFighter.charId === 'silver_chariot';
  const isJonathan = localFighter.charId === 'jonathan';
  const isYoungJoseph = localFighter.charId === 'joseph_young';
  const isOldJoseph = localFighter.charId === 'joseph_old';
  const isPucci = localFighter.charId === 'pucci';
  const isGappy = localFighter.charId === 'gappy';
  const isValentine = localFighter.charId === 'funny_valentine';
  const isDipez = localFighter.charId === 'dipez';
  const isArabianFat = localFighter.charId === 'arabian_fat';
  const isMichael = localFighter.charId === 'michael';
  const isPerstein = localFighter.charId === 'perstein';
  const pucciForm = localFighter.pucciForm || 'whitesnake';

  // Stop Tooru BGM & all sounds on match finish or arena unmount
  useEffect(() => {
    if (hudState.isGameOver) {
      soundManager.stopTooruMatchBgm();
    }
  }, [hudState.isGameOver]);

  useEffect(() => {
    return () => {
      soundManager.stopTooruMatchBgm();
      soundManager.stopAllBgm();
    };
  }, []);

  // Force reset window scroll and lock body overflow during match
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const isLocalWinner = isMultiplayer 
    ? (isClient ? hudState.winner === 'ai' : hudState.winner === 'player')
    : hudState.winner === 'player';

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] bg-[#07040d] flex flex-col justify-between items-center overflow-hidden touch-none select-none p-0 m-0">
      
      {/* Intro Cutscene Overlay */}
      {showIntro && (
        <MatchIntroCutscene 
          matchConfig={matchConfig}
          onFinish={() => setShowIntro(false)}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundManager.setMuted(next);
          }}
          networkRole={networkRole}
        />
      )}

      {/* Top Controls Bar */}
      <div className="w-full shrink-0 max-w-5xl mx-auto px-4 pt-1 flex items-center justify-between z-30 h-8 sm:h-9 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleBackToSetupOrLobby}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-yellow-500/60 text-slate-300 hover:text-yellow-400 text-[11px] font-bold uppercase cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">
              {networkRole !== 'offline' ? 'Kembali ke Lobby Room' : 'Change Character / Map'}
            </span>
            <span className="sm:hidden">
              {networkRole !== 'offline' ? 'Lobby' : 'Back'}
            </span>
          </button>

          <button
            onClick={() => setShowIntro(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-800 hover:border-purple-400 text-purple-300 hover:text-white text-[11px] font-bold uppercase cursor-pointer transition-all"
            title="Replay Character Dialogue Intro"
          >
            <MessageSquareQuote className="w-3 h-3" />
            <span className="hidden sm:inline">Intro Dialogue</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-hidden">
          {hudState.timeStopActive && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 animate-pulse whitespace-nowrap">
              <Clock className="w-3 h-3" />
              TIME STOPPED
            </span>
          )}
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 font-mono hidden md:inline truncate max-w-[220px]">
            {matchConfig.playerChar.userName} VS {matchConfig.enemyChar.userName}
          </span>
        </div>
      </div>

      {/* Top HUD (Health bars & Timer) */}
      <FightHUD 
        key={`hud-${hudState.player.charId}-${hudState.player.pucciForm || 'normal'}-${hudState.ai.charId}-${hudState.ai.pucciForm || 'normal'}`}
        player={hudState.player}
        ai={hudState.ai}
        teammate={hudState.teammate}
        matchTime={hudState.matchTime}
        mode={matchConfig.mode}
        survivalStreak={hudState.survivalStreak}
        mapName={matchConfig.map.name}
        networkRole={networkRole}
        pingMs={pingMs}
      />

      {/* Center 2D Game Arena Canvas */}
      <div className="relative w-full flex-1 min-h-[160px] max-w-5xl flex items-center justify-center px-1 sm:px-2 py-0.5 overflow-hidden">
        <div className="relative w-full h-full max-h-[60vh] sm:max-h-[68vh] aspect-[16/9] rounded-xl overflow-hidden border-2 border-purple-900/60 shadow-[0_0_40px_rgba(147,51,234,0.2)] bg-black transform-gpu flex items-center justify-center">
          
          <canvas
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            className="w-full h-full object-contain block transform-gpu"
          />

          {/* Desktop Keyboard Helper Overlay */}
          <div key={localFighter.charId} className="absolute top-2 left-2 hidden md:flex flex-wrap items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 border border-slate-800 text-[10px] text-slate-300 backdrop-blur-xs">
            {(() => {
              const items: React.ReactNode[] = [
                <span key="move" className="text-yellow-400 font-bold">A/D: Move</span>,
                <span key="jump" className="text-yellow-400 font-bold">W: Jump</span>,
                <span key="heavy" className="text-yellow-400 font-bold">J: Heavy</span>,
                <span key="barrage" className="text-yellow-400 font-bold">K: Barrage</span>,
                <span key="stand" className="text-yellow-400 font-bold">L: Stand</span>,
                <span key="pose" className="text-yellow-400 font-bold">B: Pose</span>
              ];

              if (isJotaro) {
                items.push(
                  <span key="jotaro-u" className="text-purple-300 font-bold">U: Star Finger</span>,
                  <span key="jotaro-i" className="text-purple-300 font-bold">I: Inhale</span>,
                  <span key="jotaro-o" className="text-purple-300 font-bold">O: Leap</span>,
                  <span key="jotaro-p" className="text-purple-300 font-bold">P: Parry</span>,
                  <span key="jotaro-h" className="text-purple-300 font-bold">H: Beatdown</span>,
                  <span key="jotaro-t" className="text-yellow-400 font-bold">T: Time Stop (5s)</span>
                );
              } else if (isDio) {
                items.push(
                  <span key="dio-u" className="text-yellow-300 font-bold">U: Knives</span>,
                  <span key="dio-i" className="text-red-400 font-bold">I: Drain</span>,
                  <span key="dio-o" className="text-yellow-300 font-bold">O: Sign</span>,
                  <span key="dio-p" className="text-rose-400 font-bold">P: Laser</span>,
                  <span key="dio-h" className="text-yellow-300 font-bold">H: Blink</span>,
                  <span key="dio-t" className="text-yellow-400 font-bold">T: Time Stop (9s)</span>,
                  <span key="dio-y" className="text-amber-300 font-bold">Y: Road Roller</span>
                );
              } else if (isCrazyDiamond) {
                items.push(
                  <span key="cd-u" className="text-sky-300 font-bold">U: Homing Shard</span>,
                  <span key="cd-i" className="text-sky-300 font-bold">I: Angelo Wall</span>,
                  <span key="cd-o" className="text-sky-300 font-bold">O: Bearing Shot</span>,
                  <span key="cd-p" className="text-sky-300 font-bold">P: Counter</span>,
                  <span key="cd-h" className="text-sky-300 font-bold">H: Rock Shield</span>,
                  <span key="cd-y" className="text-amber-300 font-bold">Y: Ground Punch</span>
                );
              } else if (isDiavolo) {
                items.push(
                  <span key="dia-u" className="text-rose-400 font-bold">U: Epitaph</span>,
                  <span key="dia-i" className="text-rose-400 font-bold">I: Time Erase</span>,
                  <span key="dia-o" className="text-red-500 font-bold">O: Donut Chop</span>,
                  <span key="dia-p" className="text-rose-400 font-bold">P: Flesh Throw</span>,
                  <span key="dia-h" className="text-purple-400 font-bold">H: Erase Ambush</span>,
                  <span key="dia-t" className="text-red-400 font-bold">T: Erase (7s)</span>
                );
              } else if (isPolnareff) {
                items.push(
                  <span key="pol-u" className="text-sky-400 font-bold">U: Ray Thrust</span>,
                  <span key="pol-i" className="text-emerald-400 font-bold">I: Armor Off</span>,
                  <span key="pol-o" className="text-sky-400 font-bold">O: Shoot Sword</span>,
                  <span key="pol-p" className="text-blue-400 font-bold">P: Upward Thrust</span>,
                  <span key="pol-h" className="text-teal-300 font-bold">H: Mirage Slash</span>
                );
              } else if (isJonathan) {
                items.push(
                  <span key="jo-u" className="text-sky-400 font-bold">U: Zoom Punch / Thrust</span>,
                  <span key="jo-i" className="text-emerald-400 font-bold">I: Hamon Breath / Heal</span>,
                  <span key="jo-o" className="text-amber-400 font-bold">O: Sendo Wave / Crescent</span>,
                  <span key="jo-p" className="text-orange-400 font-bold">P: Parry Stance</span>,
                  <span key="jo-h" className="text-red-400 font-bold">H: Luck/Pluck Rush</span>
                );
              } else if (isYoungJoseph) {
                items.push(
                  <span key="yj-u" className="text-emerald-400 font-bold">U: Clacker Volley</span>,
                  <span key="yj-i" className="text-green-400 font-bold">I: Bait Counter</span>,
                  <span key="yj-o" className="text-teal-400 font-bold">O: Tommy Gun</span>,
                  <span key="yj-p" className="text-rose-400 font-bold">P: Red Stone Beam</span>
                );
              } else if (isOldJoseph) {
                items.push(
                  <span key="oj-u" className="text-purple-400 font-bold">U: Hermit Grab</span>,
                  <span key="oj-i" className="text-violet-400 font-bold">I: Camera Smash</span>,
                  <span key="oj-o" className="text-amber-400 font-bold">O: Overdrive Surge</span>
                );
              } else if (isPucci && pucciForm === 'whitesnake') {
                items.push(
                  <span key="ws-u" className="text-slate-300 font-bold">U: Pistol Shot</span>,
                  <span key="ws-i" className="text-indigo-400 font-bold">I: Memory Disc</span>,
                  <span key="ws-o" className="text-lime-400 font-bold">O: Acid Melt</span>,
                  <span key="ws-p" className="text-sky-400 font-bold">P: Stand Disc Freeze</span>,
                  <span key="ws-h" className="text-purple-400 font-bold">H: 14 Words Recite ({Math.round(((localFighter.pucciChantProgress || 0) / 14) * 100)}%)</span>
                );
              } else if (isPucci && pucciForm === 'cmoon') {
                items.push(
                  <span key="cm-u" className="text-emerald-400 font-bold">U: Inversion Punch</span>,
                  <span key="cm-i" className="text-teal-400 font-bold">I: Gravity Shift ({localFighter.cmoonGravityAngle || 'NORMAL'})</span>,
                  <span key="cm-o" className="text-green-400 font-bold">O: Debris Repel</span>,
                  <span key="cm-p" className="text-cyan-400 font-bold">P: Gravity Slam</span>,
                  <span key="cm-h" className="text-yellow-400 font-bold">H: Cape Canaveral ({Math.round(localFighter.cmoonEvolutionGauge || 0)}%)</span>
                );
              } else if (isPucci && pucciForm === 'made_in_heaven') {
                items.push(
                  <span key="mih-u" className="text-yellow-400 font-bold">U: Speed Blitz</span>,
                  <span key="mih-i" className="text-amber-300 font-bold">I: Time Accel Passage</span>,
                  <span key="mih-o" className="text-sky-400 font-bold">O: Mirage Slice</span>,
                  <span key="mih-p" className="text-rose-400 font-bold">P: Accel Knives</span>,
                  <span key="mih-h" className="text-purple-300 font-bold">H: UNIVERSE RESET</span>
                );
              } else if (isGappy) {
                items.push(
                  <span key="gap-u" className="text-sky-400 font-bold">U: Plunder Strip</span>,
                  <span key="gap-i" className="text-cyan-400 font-bold">I: Moisture Theft</span>,
                  <span key="gap-o" className="text-blue-400 font-bold">O: Bubble Barrage</span>,
                  <span key="gap-p" className="text-indigo-400 font-bold">P: Bubble Shield/Trap</span>,
                  <span key="gap-h" className="text-sky-300 font-bold">H: GO BEYOND</span>
                );
              } else if (isValentine) {
                items.push(
                  <span key="val-u" className="text-sky-300 font-bold">U: Parallel Shift / Paradox Pull</span>,
                  <span key="val-i" className="text-pink-300 font-bold">I: Parallel Self Army</span>,
                  <span key="val-o" className="text-cyan-300 font-bold">O: D4C Barrage</span>,
                  <span key="val-y" className="text-yellow-300 font-bold">Y/P: Love Train</span>
                );
              } else if (isDipez) {
                items.push(
                  <span key="dip-u" className="text-yellow-300 font-bold">
                    {localFighter.dipezForm === 'pure_light' ? 'U: Photon Invisibility (6s)' : 'U: Photon Bullet'}
                  </span>,
                  <span key="dip-i" className="text-amber-200 font-bold">
                    {localFighter.dipezForm === 'pure_light' ? 'I: Omnipresent Map Laser' : 'I: Flashbang (1.5s Blind)'}
                  </span>,
                  <span key="dip-o" className="text-sky-300 font-bold">
                    {localFighter.dipezForm === 'pure_light' ? 'O: Speed of Light Blitz' : 'O: Arm Laser Cannon'}
                  </span>,
                  <span key="dip-p" className="text-white font-bold">P/Y: Evolution Gamble (50%) / Star Maker</span>
                );
              } else if (isArabianFat) {
                items.push(
                  <span key="af-u" className="text-amber-300 font-bold">U: Heat Ray Snipe</span>,
                  <span key="af-i" className="text-orange-300 font-bold">I: Desert Mirage (Invert Controls)</span>,
                  <span key="af-o" className="text-red-400 font-bold">O: Solar Bombardment</span>,
                  <span key="af-p" className="text-yellow-400 font-bold">P: Supernova Heatwave</span>,
                  <span key="af-j" className="text-emerald-300 font-bold">J: Mirror Camouflage</span>
                );
              } else if (isMichael) {
                const isOverdrive = (localFighter.michaelOverdriveTimer || 0) > 0;
                items.push(
                  <span key="mic-u" className="text-yellow-300 font-bold">U: Golden Palm Thrust</span>,
                  <span key="mic-i" className="text-amber-200 font-bold">
                    {localFighter.michaelCounterActive ? 'I: COUNTER PRIMED!' : 'I: Flash Step Counter'}
                  </span>,
                  <span key="mic-o" className="text-yellow-400 font-bold">O: Golden Axe Kick</span>,
                  <span key="mic-p" className={`font-bold ${isOverdrive ? 'text-amber-300 animate-pulse' : 'text-yellow-200'}`}>
                    P: Overdrive {isOverdrive ? `(${Math.ceil((localFighter.michaelOverdriveTimer || 0) / 60)}s)` : ''}
                  </span>,
                  <span key="mic-l" className="text-orange-300 font-bold">L: Gold Gale Rush</span>,
                  <span key="mic-y" className="text-amber-400 font-bold">Y: MAXIMUM PRICE</span>
                );
              } else if (isPerstein) {
                const isDeflect = (localFighter.persteinDeflectionTimer || 0) > 0;
                items.push(
                  <span key="per-u" className="text-sky-300 font-bold">U: 70m Drive Chain Snare (Screen Reach)</span>,
                  <span key="per-i" className="text-slate-200 font-bold">I: High-RPM Chain Shred</span>,
                  <span key="per-o" className="text-yellow-300 font-bold">O: Metal Spark Blast</span>,
                  <span key="per-p" className={`font-bold ${isDeflect ? 'text-sky-300 animate-pulse' : 'text-cyan-300'}`}>
                    P: Chain Deflection {isDeflect ? `(${Math.ceil((localFighter.persteinDeflectionTimer || 0) / 60)}s)` : '(Awaken 2)'}
                  </span>,
                  <span key="per-h" className="text-red-400 font-bold">H: Direct Flesh Tear (Awaken 1)</span>,
                  <span key="per-y" className="text-sky-100 font-bold">Y: Silence After The Storm</span>
                );
              } else {
                items.push(
                  <span key="generic-spec" className="text-slate-400 italic">Special Moves & Barrage Ready</span>
                );
              }

              return items.reduce<React.ReactNode[]>((acc, cur, idx) => {
                if (idx > 0) {
                  acc.push(<span key={`divider-${idx}`} className="text-slate-500 px-0.5">•</span>);
                }
                acc.push(cur);
                return acc;
              }, []);
            })()}
          </div>

          {/* GAME OVER / K.O. OVERLAY */}
          {hudState.isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-4 animate-in fade-in duration-300">
              
              <div className="flex flex-col items-center text-center max-w-md">
                {matchConfig.mode === 'cpu_vs_cpu' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-pulse">
                      <Bot className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-purple-300 font-serif uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                      {hudState.winner === 'player'
                        ? `P1 ${matchConfig.playerChar.userName} WINS!`
                        : hudState.winner === 'ai'
                        ? `P2 ${matchConfig.enemyChar.userName} WINS!`
                        : 'TIME OVER - DRAW!'}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-bold mt-2">
                      🤖 AUTOMATED CPU MATCH FINISHED
                    </p>
                  </div>
                ) : isLocalWinner ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(234,179,8,0.5)] animate-bounce">
                      <Trophy className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-yellow-400 font-serif uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                      YOU WIN!
                    </h2>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300 font-bold mt-1">
                      {isMultiplayer ? 'VICTORY IN P2P MULTIPLAYER!' : 'ENEMY STAND USER RETIRED!'}
                    </p>
                  </div>
                ) : hudState.winner ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
                      <Skull className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-red-500 font-serif uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                      RETIRED!
                    </h2>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mt-1">
                      {isMultiplayer 
                        ? 'YOU WERE DEFEATED BY OPPONENT' 
                        : (matchConfig.mode === 'survival' ? `Final Survival Streak: ${hudState.survivalStreak}` : 'YOU WERE DEFEATED BY CPU STAND')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-slate-200 font-serif uppercase">
                      TIME OVER - DRAW!
                    </h2>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.4)] cursor-pointer active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    REMATCH (MAIN LAGI)
                  </button>

                  <button
                    onClick={handleBackToSetupOrLobby}
                    className="py-3 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Settings2 className="w-4 h-4" />
                    {networkRole !== 'offline' ? 'LOBBY ROOM' : 'SELECT CHAR'}
                  </button>

                  <button
                    onClick={handleLeaveToTitle}
                    className="py-3 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    {networkRole !== 'offline' ? 'LEAVE' : 'TITLE'}
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Bottom Physical & Touch Controls for Mobile and Desktop click */}
      <TouchControls 
        key={`touch-${localFighter.charId}-${localFighter.pucciForm || 'normal'}`}
        onInputChange={handleTouchInput}
        player={localFighter}
      />

    </div>
  );
};
