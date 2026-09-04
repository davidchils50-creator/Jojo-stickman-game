import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Zap, 
  Flame, 
  Sparkles, 
  Swords, 
  Clock, 
  Crosshair, 
  Wind, 
  ShieldAlert, 
  Target, 
  Truck, 
  Eye, 
  Radio,
  Bug,
  CloudRain,
  Users,
  Sun
} from 'lucide-react';
import { InputState, Fighter } from '../types';

interface TouchControlsProps {
  onInputChange: (key: keyof InputState, value: boolean) => void;
  player: Fighter;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ 
  onInputChange, 
  player,
}) => {
  const [hudConfigs, setHudConfigs] = useState<Record<string, { dx: number; dy: number; scale: number }>>({});
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);

  const handleJoystickMove = (clientX: number, clientY: number, containerRect: DOMRect) => {
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxDist = 38;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(maxDist, dist);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setJoystickOffset({ x: knobX, y: knobY });

    // Directional thresholds
    onInputChange('left', knobX < -10);
    onInputChange('right', knobX > 10);
    onInputChange('jump', knobY < -14);
    onInputChange('crouch', knobY > 14);
  };

  const resetJoystick = () => {
    setJoystickOffset({ x: 0, y: 0 });
    setIsDraggingJoystick(false);
    onInputChange('left', false);
    onInputChange('right', false);
    onInputChange('jump', false);
    onInputChange('crouch', false);
  };

  const loadConfigs = () => {
    try {
      const saved = localStorage.getItem(`jojo_hud_config_${player.charId}`);
      if (saved) {
        setHudConfigs(JSON.parse(saved));
      } else {
        setHudConfigs({});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConfigs();
    window.addEventListener('jojo-hud-update', loadConfigs);
    return () => {
      window.removeEventListener('jojo-hud-update', loadConfigs);
    };
  }, [player.charId]);

  const getButtonStyle = (key: string) => {
    const config = hudConfigs[key];
    if (!config) return {};

    let baseTransform = '';
    // Preserve D-pad absolute translating class compatibility
    if (key === 'jump' || key === 'crouch') {
      baseTransform = 'translateX(-50%) ';
    } else if (key === 'left' || key === 'right') {
      baseTransform = 'translateY(-50%) ';
    }

    return {
      transform: `${baseTransform}translate(${config.dx}px, ${config.dy}px) scale(${config.scale})`,
      transformOrigin: 'center center',
    };
  };
  const bindButton = (key: keyof InputState) => ({
    tabIndex: -1,
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputChange(key, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputChange(key, false);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputChange(key, true);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputChange(key, false);
    },
    onMouseLeave: () => {
      onInputChange(key, false);
    },
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
    },
  });

  const isJotaro = player.charId === 'jotaro';
  const isDio = player.charId === 'dio';
  const isJonathan = player.charId === 'jonathan';
  const isYoungJoseph = player.charId === 'joseph_young';
  const isOldJoseph = player.charId === 'joseph_old';
  const isDiavolo = player.charId === 'king_crimson';
  const isPolnareff = player.charId === 'silver_chariot';
  const isCrazyDiamond = player.charId === 'crazy_diamond';
  const isTooru = player.charId === 'tooru';
  const isPucci = player.charId === 'pucci';
  const isGappy = player.charId === 'gappy';
  const isValentine = player.charId === 'funny_valentine';
  const isDipez = player.charId === 'dipez';
  const isArabianFat = player.charId === 'arabian_fat';
  const isMichael = player.charId === 'michael';
  const isPerstein = player.charId === 'perstein';
  const isHiding = isArabianFat && !!player.isHidingBehindMirror;
  const pucciForm = player.pucciForm || 'whitesnake';
  const hasStand = !isJonathan && !isYoungJoseph && !isTooru && !isArabianFat && !isMichael && player.charId !== 'stickman';

  return (
    <div className="w-full shrink-0 select-none z-30 px-1.5 sm:px-4 py-1 sm:py-1.5 max-w-6xl mx-auto flex items-center justify-between gap-1 sm:gap-4 touch-none bg-slate-950/90 backdrop-blur-md border-t border-purple-950/70 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] min-h-[90px] sm:min-h-[125px]">
      
      {/* 1. LEFT ARCADE CLUSTER: 360-DEGREE VIRTUAL TOUCH ANALOG JOYSTICK (DISABLED/HIDDEN WHILE HIDING) */}
      {isHiding ? (
        <div className="relative w-22 h-22 sm:w-32 sm:h-32 shrink-0 flex flex-col items-center justify-center p-1.5 rounded-xl bg-amber-950/60 border-2 border-amber-500/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9),0_0_15px_rgba(245,158,11,0.3)] text-center animate-pulse">
          <Sun className="w-5 h-5 text-amber-400 mb-0.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[7.5px] sm:text-[9px] font-black uppercase text-amber-300 tracking-tighter leading-tight">
            🪞 MIRROR CAMOUFLAGE
          </span>
          <span className="text-[6.5px] text-amber-200/70 mt-0.5 font-medium leading-none">
            No Analog (Skills Only)
          </span>
        </div>
      ) : (
        <div 
          className="relative w-22 h-22 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center touch-none select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDraggingJoystick(true);
            const rect = e.currentTarget.getBoundingClientRect();
            handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY, rect);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (isDraggingJoystick) {
              const rect = e.currentTarget.getBoundingClientRect();
              handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY, rect);
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            resetJoystick();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            resetJoystick();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingJoystick(true);
            const rect = e.currentTarget.getBoundingClientRect();
            handleJoystickMove(e.clientX, e.clientY, rect);
          }}
          onMouseMove={(e) => {
            if (isDraggingJoystick) {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              handleJoystickMove(e.clientX, e.clientY, rect);
            }
          }}
          onMouseUp={resetJoystick}
          onMouseLeave={resetJoystick}
        >
          {/* Outer Circular Ring */}
          <div className="absolute inset-0 rounded-full bg-slate-900/90 border-2 border-yellow-500/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9),0_0_15px_rgba(234,179,8,0.2)] flex items-center justify-center pointer-events-none">
            {/* Compass direction subtle indicators */}
            <ArrowUp className="absolute top-1 w-3.5 h-3.5 text-slate-500 opacity-60" />
            <ArrowDown className="absolute bottom-1 w-3.5 h-3.5 text-slate-500 opacity-60" />
            <ArrowLeft className="absolute left-1 w-3.5 h-3.5 text-slate-500 opacity-60" />
            <ArrowRight className="absolute right-1 w-3.5 h-3.5 text-slate-500 opacity-60" />
            
            {/* Inner ring track */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed border-slate-700/60" />
          </div>

          {/* Dynamic Analog Knob/Stick */}
          <div 
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-2 border-yellow-200 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center transition-transform duration-75 pointer-events-none z-10"
            style={{
              transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
            }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-950/40 border border-yellow-200/50 shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_6px_#fef08a]" />
            </div>
          </div>
        </div>
      )}

      {/* 2. CENTER CLUSTER: SPECIAL ABILITIES, STAND & TIME STOP */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-sm sm:max-w-md px-1 py-0.5">
        
        {/* Top Mini Utilities: Pose (B), Stand Toggle (L), Time Stop (T), Ultimate (Y) */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-center shrink-0">
          {/* Pose Circle (B) */}
          <button
            {...bindButton('pose')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-950/90 active:bg-indigo-600/50 border-2 border-indigo-500 text-indigo-200 flex flex-col items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer shrink-0"
            title="Pose for Energy (B)"
            style={getButtonStyle('pose')}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-[7px] font-black uppercase text-indigo-200 leading-tight">B:POSE</span>
          </button>

          {/* Stand Summon Circle (L) OR Jonathan Change Sword (L) OR Michael Mount George (L) */}
          {(hasStand || isJonathan || isMichael) && (
            <button
              {...bindButton('toggleStand')}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex flex-col items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer shrink-0 ${
                isMichael
                  ? player.isGeorgeMounted
                    ? 'bg-emerald-950 border-yellow-300 text-yellow-200 shadow-[0_0_14px_rgba(250,204,21,0.8)] animate-pulse'
                    : 'bg-slate-900 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : isJonathan
                    ? player.isSwordEquipped
                      ? 'bg-amber-900 border-amber-300 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.7)] animate-pulse'
                      : 'bg-slate-900 border-amber-600/70 text-amber-400'
                    : player.isStandActive
                      ? 'bg-purple-900 border-purple-300 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title={
                isMichael
                  ? player.isGeorgeMounted ? "SKILL CHANGE: DISMOUNT GEORGE (L)" : "SKILL CHANGE: MOUNT GEORGE (L)"
                  : isJonathan ? "CHANGE (Equip/Unequip Luck & Pluck Sword) (L)" : "Stand On/Off (L)"
              }
              style={getButtonStyle('toggleStand')}
            >
              {isMichael ? (
                <Zap className={`w-3.5 h-3.5 ${player.isGeorgeMounted ? 'text-yellow-300 fill-yellow-300' : 'text-amber-400'}`} />
              ) : isJonathan ? (
                <Swords className={`w-3.5 h-3.5 ${player.isSwordEquipped ? 'text-yellow-300 fill-yellow-300' : 'text-amber-400'}`} />
              ) : (
                <Zap className={`w-3.5 h-3.5 ${player.isStandActive ? 'text-yellow-300 fill-yellow-300' : 'text-slate-400'}`} />
              )}
              <span className="text-[7px] font-black uppercase leading-tight">
                {isMichael ? (player.isGeorgeMounted ? 'L:RIDING' : 'L:MOUNT') : isJonathan ? 'L:CHANGE' : 'L:STAND'}
              </span>
            </button>
          )}

          {/* TIME STOP CIRCLE (Exclusive to DIO, JOTARO & DIAVOLO) */}
          {(isDio || isJotaro || isDiavolo) && (
            <button
              {...bindButton('timeStop')}
              disabled={player.cooldowns.timeStop > 0}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer relative ${
                player.cooldowns.timeStop <= 0
                  ? isDiavolo
                    ? 'bg-gradient-to-br from-rose-600 to-red-800 border-rose-300 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.7)]'
                    : isDio
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-200 text-black animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.7)]'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-600 border-yellow-400 text-yellow-300 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.7)]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title={isDiavolo ? "King Crimson: Erased Time (T)" : isDio ? "The World Time Stop (T)" : "Star Platinum Time Stop (T)"}
              style={getButtonStyle('timeStop')}
            >
              <Clock className={`w-4 h-4 ${player.cooldowns.timeStop <= 0 ? (isDiavolo ? 'text-white' : isDio ? 'text-black' : 'text-yellow-300') : 'text-slate-600'}`} />
              <span className="text-[7px] font-black uppercase leading-tight">
                {player.cooldowns.timeStop > 0 ? `${Math.ceil(player.cooldowns.timeStop / 60)}s` : isDiavolo ? 'T:ERASE' : 'T:STOP'}
              </span>
            </button>
          )}

          {/* DIO ULTIMATE (Road Roller Y) */}
          {isDio && (
            <button
              {...bindButton('ultimate')}
              disabled={player.cooldowns.ultimate > 0 || player.energy < 100}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer ${
                player.energy >= 100 && player.cooldowns.ultimate <= 0
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-yellow-300 text-black shadow-yellow-500/50 animate-bounce'
                  : 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Road Roller Da! (Y)"
              style={getButtonStyle('ultimate')}
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="text-[7px] font-black uppercase">Y:ROLLER</span>
            </button>
          )}

          {/* JOSUKE ULTIMATE (Ground Punch Y) */}
          {isCrazyDiamond && (
            <button
              {...bindButton('ultimate')}
              disabled={player.cooldowns.ultimate > 0 || player.energy < 45}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer ${
                player.energy >= 45 && player.cooldowns.ultimate <= 0
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-white shadow-cyan-500/50 animate-bounce'
                  : 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Ground Smash Ultimate (Y)"
              style={getButtonStyle('ultimate')}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[7px] font-black uppercase">Y:SMASH</span>
            </button>
          )}

          {/* TOORU ULTIMATE (Rain of Calamity & Meteor Y) */}
          {isTooru && (
            <button
              {...bindButton('ultimate')}
              disabled={player.cooldowns.ultimate > 0 || player.energy < 75}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer ${
                player.energy >= 75 && player.cooldowns.ultimate <= 0
                  ? 'bg-gradient-to-br from-rose-600 to-red-800 border-rose-300 text-white shadow-[0_0_15px_rgba(225,29,72,0.7)] animate-bounce'
                  : 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Rain of Calamity & Extinction Meteor (Y)"
              style={getButtonStyle('ultimate')}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-[7px] font-black uppercase">Y:METEOR</span>
            </button>
          )}
        </div>

        {/* Bottom Skill Row */}
        <div key={`${player.charId}-${player.pucciForm || 'whitesnake'}`} className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
          {/* JOTARO SKILLS */}
          {isJotaro && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-purple-950 border-purple-400 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Star Finger (U)"
              >
                <Target className="w-3 h-3 text-purple-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Star Inhale (I)"
              >
                <Wind className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-indigo-950 border-indigo-400 text-indigo-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Stand Leap (O)"
              >
                <ArrowUp className="w-3 h-3 text-indigo-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-amber-950 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Parry (P)"
              >
                <ShieldAlert className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-red-950 border-red-400 text-red-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Beatdown (H)"
              >
                <Swords className="w-3 h-3 text-red-400" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* DIO SKILLS */}
          {isDio && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-yellow-950 border-yellow-400 text-yellow-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Knives (U)"
              >
                <Crosshair className="w-3 h-3 text-yellow-400" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-red-950 border-red-400 text-red-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Drain (I)"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-orange-950 border-orange-400 text-orange-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Sign (O)"
              >
                <ShieldAlert className="w-3 h-3 text-orange-400" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-rose-950 border-rose-400 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Laser (P)"
              >
                <Eye className="w-3 h-3 text-rose-400" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-purple-950 border-purple-400 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Blink (H)"
              >
                <Radio className="w-3 h-3 text-purple-400" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* JONATHAN SKILLS */}
          {isJonathan && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0
                    ? player.isSwordEquipped ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-amber-950 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={player.isSwordEquipped ? "Pluck Hamon Thrust (U)" : "Zoom Punch (U)"}
              >
                {player.isSwordEquipped ? <Swords className="w-3 h-3 text-sky-300" /> : <Target className="w-3 h-3 text-amber-300" />}
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-emerald-950 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={player.isSwordEquipped ? "Blade Resonance Heal (I)" : "Hamon Breathing Heal (I)"}
              >
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0
                    ? player.isSwordEquipped ? 'bg-amber-950 border-sky-400 text-sky-200' : 'bg-amber-950 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={player.isSwordEquipped ? "Sunlight Crescent Sword Wave (O)" : "Sendo Hamon Overdrive (O)"}
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-orange-950 border-orange-400 text-orange-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={player.isSwordEquipped ? "Pluck Blade Counter (P)" : "Scarlet Overdrive Stance (P)"}
              >
                <ShieldAlert className="w-3 h-3 text-orange-400" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-red-950 border-red-400 text-red-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={player.isSwordEquipped ? "Luck & Pluck Sword Barrage (H)" : "Sword of Luck & Pluck Rush (H)"}
              >
                <Swords className="w-3 h-3 text-red-400" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* YOUNG JOSEPH SKILLS */}
          {isYoungJoseph && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-emerald-950 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Clacker Volley (U)"
              >
                <Radio className="w-3 h-3 text-emerald-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-green-950 border-green-400 text-green-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Next You're Gonna Say! (I)"
              >
                <Sparkles className="w-3 h-3 text-green-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-teal-950 border-teal-400 text-teal-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Tommy Gun (O)"
              >
                <Crosshair className="w-3 h-3 text-teal-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-rose-950 border-rose-400 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Red Stone Beam (P)"
              >
                <Eye className="w-3 h-3 text-rose-400" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>
            </>
          )}

          {/* OLD JOSEPH SKILLS */}
          {isOldJoseph && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-purple-950 border-purple-400 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Hermit Vine Grab (U)"
              >
                <Target className="w-3 h-3 text-purple-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-violet-950 border-violet-400 text-violet-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Polaroid Smash (I)"
              >
                <Sparkles className="w-3 h-3 text-violet-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-amber-950 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Hermit Overdrive Surge (O)"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>
            </>
          )}

          {/* DIAVOLO SKILLS */}
          {isDiavolo && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-rose-950 border-rose-400 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Epitaph Dodge (U)"
              >
                <Eye className="w-3 h-3 text-rose-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-red-950 border-red-400 text-red-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Time Erase Skip (I)"
              >
                <Clock className="w-3 h-3 text-red-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-rose-900 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Lethal Donut Chop (O)"
              >
                <Swords className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Flesh Throw / Blood Blind (P)"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-purple-950 border-purple-400 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Time Erase Ambush (H)"
              >
                <Zap className="w-3 h-3 text-purple-300" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* JOSUKE (CRAZY DIAMOND) SKILLS */}
          {isCrazyDiamond && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Homing Shard (U)"
                style={getButtonStyle('skill1')}
              >
                <Target className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-emerald-950 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Angelo Wall Trap (I)"
                style={getButtonStyle('skill2')}
              >
                <Flame className="w-3 h-3 text-emerald-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-indigo-950 border-indigo-400 text-indigo-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Bearing Shot (O)"
                style={getButtonStyle('skill3')}
              >
                <Crosshair className="w-3 h-3 text-indigo-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-amber-950 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title={player.isEnraged ? "Enraged Tackle (P)" : "Dora Counter (P)"}
                style={getButtonStyle('skill4')}
              >
                <ShieldAlert className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-red-950 border-red-400 text-red-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Rock Shield Barrier (H)"
                style={getButtonStyle('skill5')}
              >
                <Swords className="w-3 h-3 text-red-300" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* POLNAREFF SKILLS */}
          {isPolnareff && (
            <>
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Ray of Light Thrust (U)"
              >
                <Zap className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isArmorOff
                    ? 'bg-emerald-900 border-emerald-300 text-emerald-100 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : player.cooldowns.skill2 <= 0 ? 'bg-emerald-950 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Armor Off Mode (I)"
              >
                <Wind className="w-3 h-3 text-emerald-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Shooting Sword (O)"
              >
                <Crosshair className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-blue-950 border-blue-400 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Upward Thrust (P)"
              >
                <ArrowUp className="w-3 h-3 text-blue-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isArmorOff && player.cooldowns.skill5 <= 0
                    ? 'bg-teal-950 border-teal-300 text-teal-200'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
                title="Afterimage Mirage (H)"
              >
                <Swords className="w-3 h-3 text-teal-300" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* TOORU SKILLS */}
          {isTooru && (
            <>
              {/* Skill 1 (U): Head Doctor Disguise (Satoru Akefu) */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isHeadDoctorDisguise
                    ? 'bg-slate-800 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                    : player.cooldowns.skill1 <= 0 ? 'bg-slate-900 border-slate-400 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Head Doctor Disguise (Satoru Akefu) - Invulnerable (U)"
                style={getButtonStyle('skill1')}
              >
                <Eye className="w-3 h-3 text-slate-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              {/* Skill 2 (I): Rock Insects (Dododo De Dadada) */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-lime-950 border-lime-400 text-lime-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Rock Insects (Dododo De Dadada) (I)"
                style={getButtonStyle('skill2')}
              >
                <Bug className="w-3 h-3 text-lime-400" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              {/* Skill 3 (O): Calamity Counter (Traffic Hazard) */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isCalamityCounterActive
                    ? 'bg-rose-900 border-rose-400 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse'
                    : player.cooldowns.skill3 <= 0 ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Calamity Counter (Traffic Hazard) (O)"
                style={getButtonStyle('skill3')}
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              {/* Skill 4 (P): Rain of Calamity */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Rain of Calamity (Piercing Rain) (P)"
                style={getButtonStyle('skill4')}
              >
                <CloudRain className="w-3 h-3 text-sky-400" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              {/* Skill 5 (H): Flow of Calamity / WoU Gaze */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-red-950 border-red-500 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Flow of Calamity (WoU Gaze) (H)"
                style={getButtonStyle('skill5')}
              >
                <Radio className="w-3 h-3 text-red-400" />
                <span className="text-[6px] font-black uppercase">H</span>
              </button>
            </>
          )}

          {/* PUCCI SKILLS (FORM 1: WHITESNAKE) */}
          {isPucci && pucciForm === 'whitesnake' && (
            <>
              {/* Skill 1 (U): Pistol Shot */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-slate-900 border-slate-400 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Pistol Shot (U)"
                style={getButtonStyle('skill1')}
              >
                <Crosshair className="w-3 h-3 text-slate-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              {/* Skill 2 (I): Memory Disc Extract */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-indigo-950 border-indigo-400 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Memory Disc Extract - Force Enemy CD (I)"
                style={getButtonStyle('skill2')}
              >
                <Target className="w-3 h-3 text-indigo-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              {/* Skill 3 (O): Acid Melt Illusion */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-lime-950 border-lime-400 text-lime-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Acid Melt Illusion Pool (O)"
                style={getButtonStyle('skill3')}
              >
                <CloudRain className="w-3 h-3 text-lime-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              {/* Skill 4 (P): Stand Disc Command */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Stand Disc Command - Freeze Enemy (P)"
                style={getButtonStyle('skill4')}
              >
                <ShieldAlert className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              {/* Skill 5 / Evolution (H): 14 Words Recitation */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0
                    ? 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={`14 Words Recitation (${Math.round(((player.pucciChantProgress || 0) / 14) * 100)}%) (H)`}
                style={getButtonStyle('skill5')}
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-[6px] font-black uppercase">H ({Math.round(((player.pucciChantProgress || 0) / 14) * 100)}%)</span>
              </button>
            </>
          )}

          {/* PUCCI SKILLS (FORM 2: C-MOON) */}
          {isPucci && pucciForm === 'cmoon' && (
            <>
              {/* Skill 1 (U): Surface Inversion Punch */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-emerald-950 border-emerald-400 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Surface Inversion Punch - 2x True Damage (U)"
                style={getButtonStyle('skill1')}
              >
                <Swords className="w-3 h-3 text-emerald-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              {/* Skill 2 (I): Gravitational Shift */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cmoonGravityAngle && player.cmoonGravityAngle !== 'down'
                    ? 'bg-teal-800 border-teal-300 text-teal-100 shadow-[0_0_10px_rgba(20,184,166,0.6)] animate-pulse'
                    : player.cooldowns.skill2 <= 0 ? 'bg-teal-950 border-teal-400 text-teal-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={`Gravitational Shift (${player.cmoonGravityAngle || 'down'}) (I)`}
                style={getButtonStyle('skill2')}
              >
                <ArrowUp className="w-3 h-3 text-teal-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              {/* Skill 3 (O): Debris Repulsion Wave */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isCmoonShieldActive
                    ? 'bg-green-800 border-green-300 text-green-100 shadow-[0_0_10px_rgba(34,197,94,0.6)]'
                    : player.cooldowns.skill3 <= 0 ? 'bg-green-950 border-green-400 text-green-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Debris Repulsion Wave - Gravitational Shield (O)"
                style={getButtonStyle('skill3')}
              >
                <ShieldAlert className="w-3 h-3 text-green-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              {/* Skill 4 (P): Gravitational Slam */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Gravitational Slam (P)"
                style={getButtonStyle('skill4')}
              >
                <ArrowDown className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              {/* Skill 5 / Evolution (H): New Moon Evolution (Cape Canaveral) */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  (player.cmoonEvolutionGauge || 0) >= 100
                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-200 text-slate-950 shadow-[0_0_14px_rgba(234,179,8,0.8)] animate-bounce'
                    : player.cooldowns.skill5 <= 0
                      ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={`Cape Canaveral Evolution (${Math.round(player.cmoonEvolutionGauge || 0)}%) (H)`}
                style={getButtonStyle('skill5')}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span className="text-[6px] font-black uppercase">H ({Math.round(player.cmoonEvolutionGauge || 0)}%)</span>
              </button>
            </>
          )}

          {/* PUCCI SKILLS (FORM 3: MADE IN HEAVEN) */}
          {isPucci && pucciForm === 'made_in_heaven' && (
            <>
              {/* Skill 1 (U): Infinite Speed Blitz */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-yellow-950 border-yellow-400 text-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Infinite Speed Blitz - Teleport Rush (U)"
                style={getButtonStyle('skill1')}
              >
                <Zap className="w-3 h-3 text-yellow-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              {/* Skill 2 (I): Time Acceleration Passage */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isMihTimeAccelerated
                    ? 'bg-amber-800 border-amber-300 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse'
                    : player.cooldowns.skill2 <= 0 ? 'bg-amber-950 border-amber-400 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Time Acceleration Passage (I)"
                style={getButtonStyle('skill2')}
              >
                <Clock className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              {/* Skill 3 (O): Afterimage Mirage Slice */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Afterimage Mirage Slice (O)"
                style={getButtonStyle('skill3')}
              >
                <Wind className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              {/* Skill 4 (P): Accelerated Knives Throw */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill4 <= 0 ? 'bg-rose-950 border-rose-400 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Accelerated Knives Throw (P)"
                style={getButtonStyle('skill4')}
              >
                <Crosshair className="w-3 h-3 text-rose-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              {/* Skill 5 (H): UNIVERSE RESET (Maiden Heaven) */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0
                    ? 'bg-gradient-to-br from-purple-800 via-amber-600 to-yellow-500 border-yellow-300 text-white shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="UNIVERSE RESET (Maiden Heaven) (H)"
                style={getButtonStyle('skill5')}
              >
                <Sparkles className="w-3 h-3 text-yellow-200" />
                <span className="text-[6px] font-black uppercase">H:RESET</span>
              </button>
            </>
          )}

          {/* GAPPY SKILLS (PART 8: JOJOLION) */}
          {isGappy && (
            <>
              {/* Skill 1 (U): Bubble Plunder */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Bubble Plunder: Friction Strip (U)"
                style={getButtonStyle('skill1')}
              >
                <Sparkles className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">U</span>
              </button>

              {/* Skill 2 (I): Shave & Moisture Theft */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Shave & Moisture Theft (I)"
                style={getButtonStyle('skill2')}
              >
                <Flame className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">I</span>
              </button>

              {/* Skill 3 (O): Bubble Barrage */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-blue-950 border-blue-400 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Bubble Shot Barrage (O)"
                style={getButtonStyle('skill3')}
              >
                <Swords className="w-3 h-3 text-blue-300" />
                <span className="text-[6px] font-black uppercase">O</span>
              </button>

              {/* Skill 4 (P): Bubble Shield & Trap */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.gappyShieldActive
                    ? 'bg-sky-800 border-sky-300 text-white shadow-[0_0_12px_rgba(56,189,248,0.8)] animate-pulse'
                    : player.cooldowns.skill4 <= 0 ? 'bg-indigo-950 border-indigo-400 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Bubble Shield & Trap (P)"
                style={getButtonStyle('skill4')}
              >
                <ShieldAlert className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">P</span>
              </button>

              {/* Skill 5 (H): GO BEYOND */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0
                    ? 'bg-gradient-to-br from-sky-800 via-blue-600 to-indigo-500 border-sky-300 text-white shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Soft & Wet: Go Beyond (H)"
                style={getButtonStyle('skill5')}
              >
                <Sparkles className="w-3 h-3 text-sky-200" />
                <span className="text-[6px] font-black uppercase">H:BEYOND</span>
              </button>
            </>
          )}

          {/* FUNNY VALENTINE SKILLS (PART 7: STEEL BALL RUN) */}
          {isValentine && (
            <>
              {/* Skill 1 (U): Change to Parallel / Paradox Pull */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isParallelWorld
                    ? 'bg-sky-700 border-sky-300 text-white shadow-[0_0_12px_rgba(56,189,248,0.9)] animate-bounce'
                    : player.cooldowns.skill1 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={player.isParallelWorld ? "Paradox Pull (Collision) (U)" : "Change to Parallel World (U)"}
                style={getButtonStyle('skill1')}
              >
                <Zap className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">{player.isParallelWorld ? 'U:PULL' : 'U:SHIFT'}</span>
              </button>

              {/* Skill 2 (I): Parallel Self Army (Clones) */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.valentineClones && player.valentineClones.length > 0
                    ? 'bg-pink-800 border-pink-300 text-pink-100 shadow-[0_0_10px_rgba(244,114,182,0.8)]'
                    : player.cooldowns.skill2 <= 0 ? 'bg-pink-950 border-pink-400 text-pink-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Parallel Self Army - Summon Clones (I)"
                style={getButtonStyle('skill2')}
              >
                <Users className="w-3 h-3 text-pink-300" />
                <span className="text-[6px] font-black uppercase">I:CLONES</span>
              </button>

              {/* Skill 3 (O): D4C Heavy Barrage */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-blue-950 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="D4C Heavy Barrage & Flag Whip (O)"
                style={getButtonStyle('skill3')}
              >
                <Flame className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">O:D4C</span>
              </button>

              {/* Ultimate (Y / P): D4C: Love Train */}
              <button
                {...bindButton('ultimate')}
                disabled={player.cooldowns.ultimate > 0 || player.energy < 85}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.isLoveTrainActive
                    ? 'bg-amber-600 border-amber-200 text-white shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-pulse'
                    : player.cooldowns.ultimate <= 0 && player.energy >= 85
                      ? 'bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 border-amber-300 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="D4C: Love Train - Golden Wall of Misfortune Reflection (Y)"
                style={getButtonStyle('ultimate')}
              >
                <Sparkles className="w-3 h-3 text-yellow-200" />
                <span className="text-[6px] font-black uppercase">Y:LOVE</span>
              </button>
            </>
          )}

          {/* DIPEZ SKILLS (PHOTON CONVERTER & PURE LIGHT MAN) */}
          {isDipez && (
            <>
              {/* Skill 1 (U): Photon Bullet / Photon Invisibility */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.dipezForm === 'pure_light'
                    ? 'bg-amber-950 border-amber-300 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse'
                    : player.cooldowns.skill1 <= 0 ? 'bg-yellow-950 border-yellow-400 text-yellow-200 shadow-[0_0_10px_rgba(254,240,138,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={player.dipezForm === 'pure_light' ? "Photon Invisibility (6s Invisible) (U)" : "Photon Bullet (Armor Piercing) (U)"}
                style={getButtonStyle('skill1')}
              >
                <Zap className="w-3 h-3 text-yellow-300" />
                <span className="text-[6px] font-black uppercase">{player.dipezForm === 'pure_light' ? 'U:INVIS' : 'U:BULLET'}</span>
              </button>

              {/* Skill 2 (I): Flashbang / Omnipresent Map Laser */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.dipezForm === 'pure_light'
                    ? 'bg-sky-950 border-sky-300 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.9)] animate-pulse'
                    : player.cooldowns.skill2 <= 0 ? 'bg-amber-950 border-amber-300 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.8)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={player.dipezForm === 'pure_light' ? "Omnipresent Map Laser (Full Screen Beam) (I)" : "Flashbang (Blinds Opponent 1.5s) (I)"}
                style={getButtonStyle('skill2')}
              >
                <Sun className="w-3 h-3 text-cyan-200" />
                <span className="text-[6px] font-black uppercase">{player.dipezForm === 'pure_light' ? 'I:MAP LASER' : 'I:FLASH'}</span>
              </button>

              {/* Skill 3 (O): Arm Laser Cannon / Speed of Light Blitz */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.dipezArmLostTimer && player.dipezArmLostTimer > 0 && player.dipezForm !== 'pure_light'
                    ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
                    : player.dipezForm === 'pure_light'
                      ? 'bg-yellow-950 border-yellow-300 text-yellow-100 shadow-[0_0_14px_rgba(254,240,138,0.9)] animate-pulse'
                      : player.cooldowns.skill3 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={player.dipezForm === 'pure_light' ? "Speed of Light Blitz (O)" : "Arm Laser Cannon (O)"}
                style={getButtonStyle('skill3')}
              >
                <Flame className="w-3 h-3 text-yellow-300" />
                <span className="text-[6px] font-black uppercase">{player.dipezForm === 'pure_light' ? 'O:BLITZ' : 'O:LASER'}</span>
              </button>

              {/* Skill 4 / Ultimate (P/Y): Evolution Gamble / Star Maker */}
              <button
                {...bindButton('ultimate')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.dipezForm === 'pure_light'
                    ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-white border-white text-slate-950 shadow-[0_0_16px_rgba(255,255,255,1)] animate-pulse'
                    : player.cooldowns.skill4 <= 0
                      ? 'bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-700 border-amber-300 text-slate-950 shadow-[0_0_12px_rgba(254,240,138,0.8)]'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title={player.dipezForm === 'pure_light' ? "Star Maker (Super White Burst) (P/Y)" : "Evolution Gamble (50% Chance Glowing Man) (P/Y)"}
                style={getButtonStyle('ultimate')}
              >
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[6px] font-black uppercase">{player.dipezForm === 'pure_light' ? 'P:MAKER' : 'P:EVOLVE'}</span>
              </button>
            </>
          )}

          {/* ARABIAN FAT & THE SUN SKILLS */}
          {isArabianFat && (
            <>
              {/* Skill 1 (U): Focused Heat Ray Snipe */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Focused Heat Ray Snipe (U)"
                style={getButtonStyle('skill1')}
              >
                <Crosshair className="w-3 h-3 text-amber-400" />
                <span className="text-[6px] font-black uppercase">U:SNIPE</span>
              </button>

              {/* Skill 2 (I): Desert Mirage Illusion */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-orange-950 border-orange-400 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Desert Mirage Illusion - Invert Controls (I)"
                style={getButtonStyle('skill2')}
              >
                <Eye className="w-3 h-3 text-orange-400" />
                <span className="text-[6px] font-black uppercase">I:MIRAGE</span>
              </button>

              {/* Skill 3 (O): Prominence Solar Bombardment */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-red-950 border-red-400 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.7)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Prominence Solar Bombardment (5 Solar Bombs) (O)"
                style={getButtonStyle('skill3')}
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span className="text-[6px] font-black uppercase">O:BOMBS</span>
              </button>

              {/* Skill 4 / Ultimate (P/Y): Supernova Heatwave */}
              <button
                {...bindButton('ultimate')}
                disabled={player.cooldowns.ultimate > 0 || (player.energy < 75 && !player.isHidingBehindMirror)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.ultimate <= 0
                    ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Supernova Heatwave (+35°C Global Burst) (Y/P)"
                style={getButtonStyle('ultimate')}
              >
                <Sun className="w-3 h-3 text-amber-100 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-[6px] font-black uppercase">Y:NOVA</span>
              </button>
            </>
          )}

          {/* MICHAEL JUNISTER & GHOST: HAT PRICE SKILLS */}
          {isMichael && (
            <>
              {/* Skill 1 (U): Golden Palm Thrust */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-amber-950 border-yellow-400 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Golden Palm Thrust (Guard Break) (U)"
                style={getButtonStyle('skill1')}
              >
                <Zap className="w-3 h-3 text-yellow-300" />
                <span className="text-[6px] font-black uppercase">U:PALM</span>
              </button>

              {/* Skill 2 (I): Flash Step Counter */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.michaelCounterActive
                    ? 'bg-amber-500 border-white text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse'
                    : player.cooldowns.skill2 <= 0
                    ? 'bg-yellow-950 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Flash Step Counter (I)"
                style={getButtonStyle('skill2')}
              >
                <ShieldAlert className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">I:CNTR</span>
              </button>

              {/* Skill 3 (O): Golden Axe Kick */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-amber-900 border-yellow-300 text-yellow-100 shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Golden Axe Kick (Seismic Slam Pop-Up) (O)"
                style={getButtonStyle('skill3')}
              >
                <Target className="w-3 h-3 text-yellow-400" />
                <span className="text-[6px] font-black uppercase">O:AXE</span>
              </button>

              {/* Skill 4 (P): Hat Price Overdrive */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  (player.michaelOverdriveTimer || 0) > 0
                    ? 'bg-yellow-400 border-yellow-200 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse'
                    : player.cooldowns.skill4 <= 0
                    ? 'bg-amber-950 border-yellow-400 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Hat Price Overdrive (Golden Limbs Surge) (P)"
                style={getButtonStyle('skill4')}
              >
                <Flame className="w-3 h-3 text-yellow-400" />
                <span className="text-[6px] font-black uppercase">P:SURGE</span>
              </button>

              {/* Skill 5 (L): Kinetic Rush: Gold Gale */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-amber-950 border-amber-300 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Kinetic Rush: Gold Gale (L)"
                style={getButtonStyle('skill5')}
              >
                <Wind className="w-3 h-3 text-amber-300" />
                <span className="text-[6px] font-black uppercase">L:GALE</span>
              </button>

              {/* Ultimate (Y): HAT PRICE: MAXIMUM PRICE */}
              <button
                {...bindButton('ultimate')}
                disabled={player.cooldowns.ultimate > 0 || player.energy < 75}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.ultimate <= 0 && player.energy >= 75
                    ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-yellow-200 text-slate-950 shadow-[0_0_16px_rgba(250,204,21,0.9)] animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="HAT PRICE: MAXIMUM PRICE (Y)"
                style={getButtonStyle('ultimate')}
              >
                <Sparkles className="w-3 h-3 text-yellow-200" />
                <span className="text-[6px] font-black uppercase">Y:MAX</span>
              </button>
            </>
          )}

          {/* WALLY WABLE / PERSTEIN (WABLE THE METAL CUTTER: 70m DRIVE CHAIN SKILLS) */}
          {isPerstein && (
            <>
              {/* Skill 1 (U): 70m Drive Chain Snare (Long Range Hook & Pull) */}
              <button
                {...bindButton('skill1')}
                disabled={player.cooldowns.skill1 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill1 <= 0 ? 'bg-sky-950 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.7)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="70m Drive Chain Snare (Long Range Screen Span Hook & Reel) (U)"
                style={getButtonStyle('skill1')}
              >
                <Crosshair className="w-3 h-3 text-sky-300" />
                <span className="text-[6px] font-black uppercase">U:SNARE</span>
              </button>

              {/* Skill 2 (I): High-RPM Drive Chain Shred */}
              <button
                {...bindButton('skill2')}
                disabled={player.cooldowns.skill2 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill2 <= 0 ? 'bg-slate-900 border-slate-300 text-slate-100 shadow-[0_0_10px_rgba(203,213,225,0.6)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="High-RPM Drive Chain Shred (Multi-Hit Chain Binding) (I)"
                style={getButtonStyle('skill2')}
              >
                <Zap className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">I:SHRED</span>
              </button>

              {/* Skill 3 (O): Metal Friction Spark Blast */}
              <button
                {...bindButton('skill3')}
                disabled={player.cooldowns.skill3 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill3 <= 0 ? 'bg-amber-950 border-yellow-400 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.7)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Metal Friction Spark Blast (Screen-Wide Hot Shrapnel Wave) (O)"
                style={getButtonStyle('skill3')}
              >
                <Sun className="w-3 h-3 text-yellow-300" />
                <span className="text-[6px] font-black uppercase">O:SPARK</span>
              </button>

              {/* Skill 4 (P): Absolute Chain Deflection (Awaken 2) */}
              <button
                {...bindButton('skill4')}
                disabled={player.cooldowns.skill4 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  (player.persteinDeflectionTimer || 0) > 0
                    ? 'bg-sky-400 border-white text-slate-950 shadow-[0_0_16px_rgba(56,189,248,1)] animate-pulse'
                    : player.cooldowns.skill4 <= 0
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.6)]'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Absolute Chain Deflection (Reflects Attacks & Projectiles) (Awaken 2) (P)"
                style={getButtonStyle('skill4')}
              >
                <ShieldAlert className="w-3 h-3 text-cyan-300" />
                <span className="text-[6px] font-black uppercase">P:DFLCT</span>
              </button>

              {/* Skill 5 (H): Direct Touch Flesh Tear (Awaken 1) */}
              <button
                {...bindButton('skill5')}
                disabled={player.cooldowns.skill5 > 0}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.skill5 <= 0 ? 'bg-red-950 border-red-500 text-red-200 shadow-[0_0_14px_rgba(239,68,68,0.8)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Direct Touch Flesh Tear (Armor-Ignoring True Damage) (Awaken 1) (H)"
                style={getButtonStyle('skill5')}
              >
                <Swords className="w-3 h-3 text-red-400" />
                <span className="text-[6px] font-black uppercase">H:TEAR</span>
              </button>

              {/* Ultimate (Y): Silence After The Storm: 70m Vortex Guillotine */}
              <button
                {...bindButton('ultimate')}
                disabled={player.cooldowns.ultimate > 0 || player.energy < 75}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
                  player.cooldowns.ultimate <= 0 && player.energy >= 75
                    ? 'bg-gradient-to-br from-sky-400 via-blue-600 to-slate-900 border-sky-300 text-white shadow-[0_0_18px_rgba(56,189,248,0.9)] animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
                title="Silence After The Storm: 70m Vortex Guillotine (Y)"
                style={getButtonStyle('ultimate')}
              >
                <Sparkles className="w-3 h-3 text-sky-200" />
                <span className="text-[6px] font-black uppercase">Y:SILENCE</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* 3. RIGHT ARCADE CLUSTER: ATTACK BUTTONS (ALWAYS VISIBLE & HIGH CONTRAST) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Barrage Rush Button (K) */}
        <button
          {...bindButton('barrage')}
          disabled={!isTooru && player.energy < 20}
          className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer ${
            isTooru
              ? player.cooldowns.barrage <= 0
                ? 'bg-gradient-to-br from-red-700 to-rose-900 border-red-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
              : player.energy >= 20
                ? 'bg-gradient-to-br from-amber-600 to-yellow-500 active:from-amber-500 active:to-yellow-400 border-yellow-300 text-white shadow-[0_0_18px_rgba(245,158,11,0.5)] animate-pulse'
                : 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          title={isTooru ? "Wonder of U: Calamity Gaze (K)" : "Stand Barrage (K)"}
          style={getButtonStyle('barrage')}
        >
          {isTooru ? <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-red-300" /> : <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200" />}
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight -mt-0.5 text-white">
            {isTooru ? 'K (FLOW)' : 'K (RUSH)'}
          </span>
        </button>

        {/* Heavy Attack Button (J) */}
        <button
          {...bindButton('punch')}
          className={`w-15 h-15 sm:w-18 sm:h-18 rounded-full border-2 text-white flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer ${
            isTooru
              ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.5)]'
              : 'bg-gradient-to-br from-red-600 to-rose-500 active:from-red-500 active:to-rose-400 border-red-200 shadow-[0_0_25px_rgba(225,29,72,0.7)]'
          }`}
          title={isTooru ? "Chill Step: Logic Acceleration (J)" : "Heavy Punch (J)"}
          style={getButtonStyle('punch')}
        >
          {isTooru ? <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300" /> : <Swords className="w-6 h-6 sm:w-7 sm:h-7" />}
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight -mt-0.5 text-white">
            {isTooru ? 'J (CHILL)' : 'J (PUNCH)'}
          </span>
        </button>

      </div>

    </div>
  );
};
