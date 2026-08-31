import React from 'react';
import { Fighter, GameMode } from '../types';
import { NetworkRole } from '../game/networkManager';
import { Shield, Zap, Sparkles, Flame, Trophy, Activity, Skull, Users, Compass, Wifi, Radio, User } from 'lucide-react';

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

  return (
    <div className="w-full shrink-0 select-none pointer-events-none z-20 px-2 sm:px-6 pt-1 pb-0.5 flex flex-col gap-0.5 overflow-hidden">
      {/* Top Map & Mode & Multiplayer Network Quality pill */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto text-[10px] uppercase font-bold tracking-widest text-slate-400">
        <div className="flex items-center gap-2">
          {mapName && <span className="text-yellow-400/90 font-mono">📍 {mapName}</span>}
          {isSurvival && (
            <span className="text-emerald-400 font-bold hidden sm:inline">
              🗺️ 2600px Arena (Camera Follow)
            </span>
          )}
        </div>

        {/* Center / Right Multiplayer Latency Badge */}
        <div className="flex items-center gap-2">
          {isMultiplayer && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span className="font-bold">{isClient ? '2P CLIENT' : '1P HOST'}</span>
              <span className="text-slate-400">|</span>
              <span className={pingMs < 50 ? 'text-emerald-400 font-black' : pingMs < 120 ? 'text-amber-400 font-black' : 'text-rose-400 font-black'}>
                {pingMs > 0 ? `${pingMs}ms` : '<20ms'}
              </span>
            </div>
          )}

          {mode === 'arcade' && !isMultiplayer && (
            <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> ARCADE MATCH
            </span>
          )}
          {mode === 'training' && (
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1">
              <Activity className="w-3 h-3" /> TRAINING (INFINITE SP)
            </span>
          )}
          {isBossMode && (
            <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-300 font-extrabold flex items-center gap-1 animate-pulse shadow-md">
              <Skull className="w-3 h-3 text-rose-400" /> SUPREME BOSS RAID (RESPAWN ON)
            </span>
          )}
          {isSurvival && (
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3 text-emerald-400" /> KILLS: {survivalStreak}
            </span>
          )}
        </div>
      </div>

      {/* Top Row: HP & Match Timer */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-5xl mx-auto">
        
        {/* PLAYER 1 (Left) */}
        <div className="flex-1 flex flex-col items-start min-w-0">
          <div className="flex items-center justify-between w-full mb-0.5">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                {isMultiplayer && (
                  <span className={`px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                    !isClient 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_8px_rgba(56,189,248,0.7)]' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {!isClient ? '★ 1P (YOU)' : '1P (HOST)'}
                  </span>
                )}
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
        <div className="flex flex-col items-center justify-center px-2">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-950/90 border-2 flex items-center justify-center shadow-lg ${
            isBossMode ? 'border-rose-500 shadow-rose-500/30' : 'border-yellow-500/80 shadow-yellow-500/30'
          }`}>
            <span className={`text-xl sm:text-2xl font-black font-mono tracking-tighter ${
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
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
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
                {isMultiplayer && (
                  <span className={`px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                    isClient 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {isClient ? '★ 2P (YOU)' : '2P (LAWAN)'}
                  </span>
                )}
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

