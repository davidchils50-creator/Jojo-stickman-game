import React from 'react';
import { Fighter, GameMode } from '../types';
import { NetworkRole } from '../game/networkManager';
import { Shield, Zap, Sparkles, Flame, Trophy, Activity, Skull, Users, Compass, Wifi, Radio, User, Sun, Thermometer, Bot } from 'lucide-react';

interface FightHUDProps {
  player: Fighter;
  ai: Fighter;
  teammate?: Fighter;
  matchTime: number;
  mode?: GameMode;
  survivalStreak?: number;
  mapName?: string;
  networkRole?: NetworkRole;
  pingMs?: number;
}

export const FightHUD: React.FC<FightHUDProps> = ({ 
  player, 
  ai, 
  teammate,
  matchTime,
  mode = 'arcade',
  survivalStreak = 0,
  mapName,
  networkRole = 'offline',
  pingMs = 0
}) => {
  const playerHpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  const aiHpPercent = Math.max(0, (ai.hp / ai.maxHp) * 100);

  const playerEnergyPercent = Math.max(0, (player.energy / player.maxEnergy) * 100);
  const aiEnergyPercent = Math.max(0, (ai.energy / ai.maxEnergy) * 100);

  const playerHasStand = player.charId !== 'jonathan' && player.charId !== 'joseph_young';
  const aiHasStand = ai.charId !== 'jonathan' && ai.charId !== 'joseph_young';
  const isBossMode = mode === 'team_boss';
  const isSurvival = mode === 'survival' || mode === 'team_survival';
  const isMultiplayer = networkRole !== 'offline';
  const isClient = networkRole === 'client';

  // Environmental The Sun Stand check
  const sunUser = player.charId === 'arabian_fat' ? player : (ai.charId === 'arabian_fat' ? ai : (teammate?.charId === 'arabian_fat' ? teammate : null));
  const sunTemp = sunUser ? Math.min(100, Math.max(0, sunUser.sunTemperature || 0)) : 0;

  return (
    <div className="w-full shrink-0 select-none pointer-events-none z-20 px-1.5 sm:px-6 pt-0.5 pb-0.5 flex flex-col gap-0.5 overflow-hidden">
      {/* Top Map & Mode & Mobile Landscape Hint */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400">
        <div className="flex items-center gap-1.5">
          {mapName && <span className="text-yellow-400/90 font-mono text-[9px] sm:text-[10px] truncate max-w-[120px] sm:max-w-none">📍 {mapName}</span>}
          {isSurvival && (
            <span className="text-emerald-400 font-bold hidden sm:inline">
              🗺️ 2600px Arena
            </span>
          )}
        </div>

        {/* Mobile Landscape Hint & Network/Mode Badge */}
        <div className="flex items-center gap-1.5">
          <span className="sm:hidden text-[8px] text-amber-300 font-bold flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 animate-pulse">
            📱 Landscape = Max View
          </span>

          {isMultiplayer && (
            <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-mono text-[8px] sm:text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Wifi className="w-2.5 h-2.5 text-cyan-400" />
              <span className="font-bold">{isClient ? '2P' : '1P'}</span>
              <span className="text-slate-400">|</span>
              <span className={pingMs < 50 ? 'text-emerald-400 font-black' : pingMs < 120 ? 'text-amber-400 font-black' : 'text-rose-400 font-black'}>
                {pingMs > 0 ? `${pingMs}ms` : '<20ms'}
              </span>
            </div>
          )}

          {mode === 'arcade' && !isMultiplayer && (
            <span className="px-1.5 py-0.2 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1 text-[8px] sm:text-[10px]">
              <Trophy className="w-2.5 h-2.5" /> ARCADE
            </span>
          )}
          {mode === 'cpu_vs_cpu' && (
            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-400 text-purple-300 font-extrabold flex items-center gap-1 text-[8px] sm:text-[10px]">
              <Bot className="w-2.5 h-2.5 text-purple-400" /> BOT VS BOT
            </span>
          )}
          {mode === 'training' && (
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1 text-[8px] sm:text-[10px]">
              <Activity className="w-2.5 h-2.5" /> TRAINING
            </span>
          )}
          {isBossMode && (
            <span className="px-1.5 py-0.2 rounded bg-rose-950 border border-rose-500 text-rose-300 font-extrabold flex items-center gap-1 text-[8px] sm:text-[10px] animate-pulse">
              <Skull className="w-2.5 h-2.5 text-rose-400" /> BOSS RAID
            </span>
          )}
          {isSurvival && (
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold flex items-center gap-1 text-[8px] sm:text-[10px] animate-pulse">
              <Flame className="w-2.5 h-2.5 text-emerald-400" /> KILLS: {survivalStreak}
            </span>
          )}
        </div>
      </div>

      {/* THE SUN: ENVIRONMENTAL TEMPERATURE GAUGE & MIRROR CAMOUFLAGE HUD */}
      {sunUser && (
        <div className="w-full max-w-5xl mx-auto my-0.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-950/80 via-orange-950/90 to-red-950/80 border border-amber-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.3)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-400 font-black text-xs font-serif tracking-wider uppercase">
              <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>THE SUN (太陽)</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/80 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span>{Math.round(sunTemp)}°C</span>
            </div>
            <div className="w-24 sm:w-36 h-2 bg-slate-950 rounded-full border border-amber-600/60 overflow-hidden p-[1px]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-150 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                style={{ width: `${sunTemp}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-bold">
            {sunTemp > 0 && (
              <span className="text-orange-300/90 hidden sm:inline">
                🔥 Burn DoT: {Math.max(1, Math.floor((sunTemp / 100) * 8))} DMG/s
              </span>
            )}
            {sunTemp > 0 && (
              <span className="text-amber-200/90 hidden sm:inline">
                ⏳ Slow: -{Math.round((sunTemp / 100) * 55)}%
              </span>
            )}
            {sunUser.mirrorObject && (
              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase flex items-center gap-1 ${
                sunUser.mirrorObject.isDestroyed
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
              }`}>
                🪞 {sunUser.mirrorObject.isDestroyed ? 'MIRROR DESTROYED (EXPOSED!)' : `MIRROR: ${Math.ceil(sunUser.mirrorObject.hp)}/${sunUser.mirrorObject.maxHp} HP`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Row: HP & Match Timer */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-5xl mx-auto">
        
        {/* PLAYER 1 (Left) */}
        <div className="flex-1 flex flex-col items-start min-w-0">
          <div className="flex items-center justify-between w-full mb-0.5">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                {isMultiplayer ? (
                  <span className={`px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                    !isClient 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_8px_rgba(56,189,248,0.7)]' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {!isClient ? '★ 1P (YOU)' : '1P (HOST)'}
                  </span>
                ) : mode === 'cpu_vs_cpu' ? (
                  <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-0.5">
                    <Bot className="w-2.5 h-2.5" /> P1 BOT
                  </span>
                ) : null}
                <span className="text-xs sm:text-sm font-black tracking-wider text-yellow-400 uppercase font-serif truncate">
                  {player.name}
                </span>
                {player.isSwordEquipped && (
                  <span className="shrink-0 px-1 py-0.2 rounded bg-gradient-to-r from-sky-500 to-indigo-500 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5 shadow-[0_0_8px_rgba(56,189,248,0.7)] animate-pulse">
                    ⚔️ PLUCK
                  </span>
                )}
                {playerHasStand ? (
                  player.isStandActive && (
                    <span className="shrink-0 px-1 py-0.2 rounded bg-purple-600/80 text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-tighter flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-yellow-300" /> STAND ON
                    </span>
                  )
                ) : (
                  (!player.isSwordEquipped && (player.isStandActive || player.standAlpha > 0.2)) && (
                    <span className="shrink-0 px-1 py-0.2 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-[8px] sm:text-[9px] font-black text-slate-950 uppercase tracking-tighter flex items-center gap-0.5 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse">
                      <Sparkles className="w-2.5 h-2.5 fill-slate-950" /> HAMON AURA
                    </span>
                  )
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                {playerHasStand ? (
                  <span key="p-stand">Stand: <strong className="text-slate-200">{player.standName}</strong></span>
                ) : (
                  <span key="p-hamon">Technique: <strong className="text-yellow-300">Hamon Breathing (波紋呼吸)</strong></span>
                )}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300 font-bold shrink-0 ml-1">
              {Math.ceil(player.hp)}/{player.maxHp}
            </span>
          </div>

          {/* Player HP Bar */}
          <div className="w-full h-4 sm:h-5 bg-slate-900/90 border border-slate-700/80 rounded-sm p-[2px] shadow-lg relative overflow-hidden">
            <div 
              className={`h-full transition-all duration-150 rounded-xs ${
                playerHpPercent > 50 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                  : playerHpPercent > 25 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                    : 'bg-gradient-to-r from-red-600 to-rose-500'
              }`}
              style={{ width: `${playerHpPercent}%` }}
            />
            {/* Gloss shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          </div>

          {/* Player Energy Gauge */}
          <div className="w-full flex items-center gap-1 mt-1">
            <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden p-[1px]">
              <div 
                className={`h-full transition-all duration-100 ${
                  playerHasStand 
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-amber-600 via-yellow-400 to-emerald-400'
                }`}
                style={{ width: `${playerEnergyPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-yellow-400/90 font-bold whitespace-nowrap">
              {playerHasStand ? 'SP' : 'HAMON'} {Math.floor(player.energy)}%
            </span>
          </div>

          {/* MICHAEL JUNISTER DEDICATED KINETIC MOMENTUM METER */}
          {player.charId === 'michael' && (
            <div className="w-full mt-0.5 px-1.5 py-0.5 rounded bg-slate-950/90 border border-amber-500/50 flex flex-col gap-0.5 shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <div className="flex items-center justify-between text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 text-amber-300 font-serif truncate max-w-[150px] sm:max-w-none">
                  <Zap className="w-2.5 h-2.5 text-yellow-400 animate-pulse fill-yellow-400 shrink-0" />
                  KINETIC (HAT PRICE)
                </span>
                <span className="font-mono text-yellow-300 font-bold">
                  {Math.round(player.michaelKineticMeter || 0)}% ({player.michaelKineticStacks || 0}/5)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full border border-amber-600/50 p-[1px] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-100 transition-all duration-100 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  style={{ width: `${Math.min(100, Math.max(0, player.michaelKineticMeter || 0))}%` }}
                />
              </div>
              <div className="hidden sm:flex items-center justify-between text-[7.5px] font-bold text-amber-400/80">
                <span>⚡ ABSORBS RUN & IMPACT MOMENTUM</span>
                <span>+{Math.round((player.michaelKineticMeter || 0) * 0.35)}% IMPACT POWER</span>
              </div>
            </div>
          )}

          {/* Teammate/Partner Compact Status Bar */}
          {teammate && (
            <div className="w-full mt-1.5 pt-1 border-t border-slate-800/40 flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                <span>👥 Teammate: {teammate.name}</span>
                <span className="font-mono text-slate-300">{Math.ceil(teammate.hp)}/{teammate.maxHp} HP</span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-sm p-[1px] relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, (teammate.hp / teammate.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* CENTER MATCH TIMER */}
        <div className="flex flex-col items-center justify-center px-1 shrink-0">
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-950/90 border-2 flex items-center justify-center shadow-lg ${
            isBossMode ? 'border-rose-500 shadow-rose-500/30' : 'border-yellow-500/80 shadow-yellow-500/30'
          }`}>
            <span className={`text-base sm:text-2xl font-black font-mono tracking-tighter ${
              mode === 'training' 
                ? 'text-cyan-400' 
                : isBossMode
                  ? 'text-rose-400'
                  : matchTime <= 10 
                    ? 'text-rose-500 animate-pulse' 
                    : 'text-yellow-400'
            }`}>
              {mode === 'training' ? '∞' : matchTime}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 hidden sm:inline">
            {isMultiplayer ? '1P VS 2P' : (isBossMode ? 'BOSS RAID' : (isSurvival ? `KILLS: ${survivalStreak}` : 'ROUND 1'))}
          </span>
        </div>

        {/* ENEMY / BOSS / PLAYER 2 (Right) */}
        <div className="flex-1 flex flex-col items-end min-w-0">
          <div className="flex items-center justify-between w-full mb-0.5">
            <span className="text-[11px] font-mono text-slate-300 font-bold shrink-0 mr-1">
              {Math.ceil(ai.hp)}/{ai.maxHp}
            </span>
            <div className="flex flex-col items-end min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                {isMultiplayer ? (
                  <span className={`px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                    isClient 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {isClient ? '★ 2P (YOU)' : '2P (LAWAN)'}
                  </span>
                ) : mode === 'cpu_vs_cpu' ? (
                  <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-0.5">
                    <Bot className="w-2.5 h-2.5" /> P2 BOT
                  </span>
                ) : null}
                {ai.isSwordEquipped && (
                  <span className="shrink-0 px-1 py-0.2 rounded bg-gradient-to-r from-sky-500 to-indigo-500 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5 shadow-[0_0_8px_rgba(56,189,248,0.7)] animate-pulse">
                    ⚔️ PLUCK
                  </span>
                )}
                {isBossMode && (
                  <span className="shrink-0 px-1.5 py-0.2 rounded bg-rose-600 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-tighter flex items-center gap-0.5 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse">
                    👑 SUPREME BOSS
                  </span>
                )}
                {aiHasStand ? (
                  ai.isStandActive && !isBossMode && (
                    <span className="shrink-0 px-1 py-0.2 rounded bg-rose-600/80 text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-tighter flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-yellow-300" /> STAND ON
                    </span>
                  )
                ) : (
                  (!ai.isSwordEquipped && (ai.isStandActive || ai.standAlpha > 0.2)) && (
                    <span className="shrink-0 px-1 py-0.2 rounded bg-gradient-to-r from-emerald-500 to-teal-400 text-[8px] sm:text-[9px] font-black text-slate-950 uppercase tracking-tighter flex items-center gap-0.5 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse">
                      <Sparkles className="w-2.5 h-2.5 fill-slate-950" /> HAMON AURA
                    </span>
                  )
                )}
                <span className={`text-xs sm:text-sm font-black tracking-wider uppercase font-serif truncate ${
                  isBossMode ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'text-rose-400'
                }`}>
                  {ai.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                {ai.charId === 'vampire' ? (
                  <span key="ai-vampire">Type: <strong className="text-red-400 font-bold">Undead Vampire Horde (吸血鬼)</strong></span>
                ) : aiHasStand ? (
                  <span key="ai-stand">Stand: <strong className="text-slate-200">{ai.standName}</strong></span>
                ) : (
                  <span key="ai-hamon">Technique: <strong className="text-emerald-300">Hamon Breathing (波紋呼吸)</strong></span>
                )}
              </span>
            </div>
          </div>

          {/* AI HP Bar (Aligned Right) */}
          <div className="w-full h-4 sm:h-5 bg-slate-900/90 border border-slate-700/80 rounded-sm p-[2px] shadow-lg relative overflow-hidden flex justify-end">
            <div 
              className={`h-full transition-all duration-150 rounded-xs ${
                isBossMode
                  ? 'bg-gradient-to-l from-rose-600 via-red-500 to-amber-400 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                  : aiHpPercent > 50 
                    ? 'bg-gradient-to-l from-emerald-500 to-green-400' 
                    : aiHpPercent > 25 
                      ? 'bg-gradient-to-l from-yellow-500 to-amber-400' 
                      : 'bg-gradient-to-l from-red-600 to-rose-500'
              }`}
              style={{ width: `${aiHpPercent}%` }}
            />
            {/* Gloss shine */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          </div>

          {/* AI Energy Gauge */}
          <div className="w-full flex items-center justify-end gap-1 mt-1">
            <span className="text-[9px] font-mono text-rose-400/90 font-bold whitespace-nowrap">
              {aiHasStand ? 'SP' : 'HAMON'} {Math.floor(ai.energy)}%
            </span>
            <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden p-[1px] flex justify-end">
              <div 
                className={`h-full transition-all duration-100 ${
                  aiHasStand 
                    ? 'bg-gradient-to-l from-red-500 via-rose-500 to-orange-400' 
                    : 'bg-gradient-to-l from-emerald-500 via-teal-400 to-yellow-300'
                }`}
                style={{ width: `${aiEnergyPercent}%` }}
              />
            </div>
          </div>

          {/* AI MICHAEL JUNISTER KINETIC MOMENTUM METER */}
          {ai.charId === 'michael' && (
            <div className="w-full mt-1 px-2 py-1 rounded bg-slate-950/90 border border-amber-500/50 flex flex-col gap-0.5 shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                <span className="font-mono text-yellow-300 font-bold">
                  {Math.round(ai.michaelKineticMeter || 0)}% (STACK {ai.michaelKineticStacks || 0}/5)
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-serif">
                  KINETIC MOMENTUM (HAT PRICE)
                  <Zap className="w-3 h-3 text-yellow-400 animate-pulse fill-yellow-400" />
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full border border-amber-600/50 p-[1px] overflow-hidden flex justify-end">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-amber-500 via-yellow-400 to-yellow-100 transition-all duration-100 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  style={{ width: `${Math.min(100, Math.max(0, ai.michaelKineticMeter || 0))}%` }}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Combo Floating Banners */}
      <div className="flex justify-between w-full max-w-5xl mx-auto px-4 mt-1 pointer-events-none min-h-[28px]">
        {/* Player Combo */}
        <div>
          {player.comboCount > 1 && (
            <div className="animate-bounce inline-flex items-center gap-1.5 px-3 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 font-black text-xs uppercase italic tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              {player.comboCount} HITS COMBO!
            </div>
          )}
        </div>

        {/* AI Combo */}
        <div>
          {ai.comboCount > 1 && (
            <div className="animate-bounce inline-flex items-center gap-1.5 px-3 py-0.5 bg-rose-500/20 border border-rose-500/50 rounded text-rose-400 font-black text-xs uppercase italic tracking-wider shadow-lg">
              <Flame className="w-3.5 h-3.5" />
              {ai.comboCount} HITS COMBO!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

