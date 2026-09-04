import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  Sparkles,
  MapPin,
  Trophy,
  Activity,
  ArrowLeft,
  ChevronRight,
  Shuffle,
  Info,
  CheckCircle2,
  Clock,
  Crosshair,
  Truck,
  Users,
  Skull,
  Compass,
  Bot
} from 'lucide-react';
import { CharacterDef, MapDef, GameMode, MatchConfig, BossType } from '../types';
import { CHARACTERS, MAPS, BOSS_CHARACTERS } from '../game/constants';

// Safe Boss Selector Component for Single Player Pre-Match Mode (Game Mode Tengah - index 1)
interface PreMatchBossSelectorViewProps {
  selectedBossType: BossType | undefined | null;
  setSelectedBossType: (bType: BossType) => void;
}

export const PreMatchBossSelectorView: React.FC<PreMatchBossSelectorViewProps> = ({
  selectedBossType,
  setSelectedBossType,
}) => {
  // Defensive check
  if (!selectedBossType || !setSelectedBossType || !BOSS_CHARACTERS) return null;

  return (
    <div>
      <label className="text-xs font-extrabold uppercase text-rose-400 block mb-2 flex items-center gap-1.5">
        <Skull className="w-4 h-4" /> Pilih Supreme Boss:
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(BOSS_CHARACTERS || []).map(boss => {
          if (!boss) return null;
          const bossHp = boss.id === 'boss_dio' ? 4500 : boss.id === 'boss_diavolo' ? 3800 : boss.id === 'boss_pucci' ? 5000 : 4200;
          return (
            <button
              key={boss.id}
              onClick={() => setSelectedBossType(boss.id as BossType)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedBossType === boss.id
                  ? 'bg-rose-950/60 border-rose-500 shadow-lg'
                  : 'bg-slate-900 border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <div>
                <div className="text-xs font-black text-white">{boss.name || 'Raid Boss'}</div>
                <div className="text-[10px] text-rose-300 font-bold">{boss.standName || 'Supreme Stand'}</div>
              </div>
              <div className="mt-2 text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 w-fit">
                HP: {bossHp} (RAID BOSS)
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface PreMatchMenuProps {
  onStartFight: (config: MatchConfig) => void;
  onBackToTitle: () => void;
  sfxEnabled?: boolean;
}

export const PreMatchMenu: React.FC<PreMatchMenuProps> = ({
  onStartFight,
  onBackToTitle,
}) => {
  const defaultP1 = CHARACTERS.find(c => c.id === 'jotaro') || CHARACTERS[0];
  const defaultP2 = CHARACTERS.find(c => c.id === 'dio') || CHARACTERS[1] || CHARACTERS[0];
  const defaultTeammate = CHARACTERS.find(c => c.id === 'crazy_diamond') || CHARACTERS[2] || CHARACTERS[0];

  const [activeTab, setActiveTab] = useState<'character' | 'mode' | 'map'>('character');
  const [selectedPlayerChar, setSelectedPlayerChar] = useState<CharacterDef>(defaultP1);
  const [selectedEnemyChar, setSelectedEnemyChar] = useState<CharacterDef>(defaultP2);
  const [selectedTeammateChar, setSelectedTeammateChar] = useState<CharacterDef>(defaultTeammate);
  const [selectedMode, setSelectedMode] = useState<GameMode>('arcade');
  const [selectedBossType, setSelectedBossType] = useState<BossType>('boss_dio');
  const [selectedMap, setSelectedMap] = useState<MapDef>(MAPS[0]);

  const handleRandomOpponent = () => {
    const others = CHARACTERS.filter(c => c.id !== selectedPlayerChar.id);
    const randomChar = others[Math.floor(Math.random() * others.length)] || CHARACTERS[0];
    setSelectedEnemyChar(randomChar);
  };

  const handleStart = () => {
    let finalEnemy = selectedEnemyChar;
    if (selectedMode === 'team_boss') {
      const bossDef = BOSS_CHARACTERS.find(b => b.id === selectedBossType) || BOSS_CHARACTERS[0];
      finalEnemy = bossDef;
    }

    onStartFight({
      playerChar: selectedPlayerChar,
      enemyChar: finalEnemy,
      teammateChar: selectedTeammateChar,
      mode: selectedMode,
      bossType: selectedMode === 'team_boss' ? selectedBossType : undefined,
      map: selectedMap,
    });
  };

  const auraBorderColors: Record<string, string> = {
    purple: 'border-purple-500/60 shadow-purple-500/20 text-purple-400',
    gold: 'border-yellow-500/60 shadow-yellow-500/20 text-yellow-400',
    crimson: 'border-rose-500/60 shadow-rose-500/20 text-rose-400',
    cyan: 'border-cyan-500/60 shadow-cyan-500/20 text-cyan-400',
    emerald: 'border-emerald-500/60 shadow-emerald-500/20 text-emerald-400',
    grey: 'border-slate-500/60 shadow-slate-500/20 text-slate-400',
    calamity: 'border-rose-600/60 shadow-rose-600/20 text-rose-300',
    heaven: 'border-amber-400/60 shadow-amber-400/30 text-amber-300',
  };

  const auraGlowStyles: Record<string, string> = {
    purple: 'from-purple-900/40 to-slate-950',
    gold: 'from-yellow-950/40 to-slate-950',
    crimson: 'from-rose-950/40 to-slate-950',
    cyan: 'from-cyan-950/40 to-slate-950',
    emerald: 'from-emerald-950/40 to-slate-950',
    grey: 'from-slate-900/40 to-slate-950',
    calamity: 'from-rose-950/50 to-slate-950',
    heaven: 'from-amber-900/40 via-purple-950/40 to-slate-950',
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07050f] text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto pt-4 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTitle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-yellow-500/60 hover:text-yellow-400 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Title Menu
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-wider font-serif bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Battle Setup Hub
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('character')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'character'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Character
          </button>
          <button
            onClick={() => setActiveTab('mode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'mode'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Mode
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Map
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* TAB 1: CHARACTER SELECTION */}
          {activeTab === 'character' && (
            <motion.div
              key="tab-character"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Character List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-yellow-400" />
                      Select Fighter & Stand
                    </h2>
                    <p className="text-xs text-slate-400">Pilih User & Stand untuk pertarungan 2D Stickman</p>
                  </div>

                  <button
                    onClick={handleRandomOpponent}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-yellow-400 text-xs text-yellow-400 font-semibold cursor-pointer transition-all"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    Randomize CPU
                  </button>
                </div>

                {/* Character Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHARACTERS.map((char) => {
                    const isSelected = selectedPlayerChar.id === char.id;
                    const isCpuSelected = selectedEnemyChar.id === char.id;

                    return (
                      <div
                        key={char.id}
                        onClick={() => setSelectedPlayerChar(char)}
                        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none bg-gradient-to-b ${
                          isSelected
                            ? `border-yellow-400 shadow-lg shadow-yellow-500/10 bg-slate-900/90 ring-1 ring-yellow-400/50`
                            : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlayerChar(char);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            {isSelected ? '★ P1' : 'Select P1'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnemyChar(char);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                              isCpuSelected
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            {isCpuSelected ? '⚡ CPU' : 'Select CPU'}
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center border font-black text-sm shrink-0"
                            style={{
                              backgroundColor: `${char.standColor}20`,
                              borderColor: char.standColor,
                              color: char.standColor,
                            }}
                          >
                            <span className="text-xl">★</span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-slate-100 truncate flex items-center gap-1.5">
                              {char.name}
                            </h3>
                            <p className="text-xs font-semibold text-yellow-400/90 truncate">
                              Stand: {char.standName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              Cry: <span className="text-slate-300 italic font-mono font-bold">"{char.barrageCry}"</span>
                            </p>
                          </div>
                        </div>

                        {/* Special Features */}
                        {char.timeStopDurationSec && (
                          <div className="mt-2.5 px-2 py-1 rounded bg-yellow-500/15 border border-yellow-500/30 text-[10px] font-extrabold text-yellow-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            Time Stop: {char.timeStopDurationSec} Detik
                          </div>
                        )}

                        {/* Quick Stat badges */}
                        <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] font-bold text-center border-t border-slate-800/80 pt-2">
                          <div className="bg-slate-900/80 py-0.5 rounded text-slate-300">
                            PWR: <span className="text-rose-400">{char.stats.power}</span>
                          </div>
                          <div className="bg-slate-900/80 py-0.5 rounded text-slate-300">
                            SPD: <span className="text-yellow-400">{char.stats.speed}</span>
                          </div>
                          <div className="bg-slate-900/80 py-0.5 rounded text-slate-300">
                            RNG: <span className="text-cyan-400">{char.stats.range}</span>
                          </div>
                          <div className="bg-slate-900/80 py-0.5 rounded text-slate-300">
                            DUR: <span className="text-emerald-400">{char.stats.durability}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Character Showcase & Stand Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className={`rounded-2xl border bg-gradient-to-b ${auraGlowStyles[selectedPlayerChar.auraColor]} ${auraBorderColors[selectedPlayerChar.auraColor]} p-5 shadow-2xl relative overflow-hidden`}>
                  <div className="absolute -right-4 -bottom-6 text-8xl font-black text-white/5 pointer-events-none select-none font-serif italic">
                    ゴゴゴ
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3" />
                        Selected Fighter
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                        {selectedPlayerChar.name}
                      </h3>
                      <p className="text-xs text-yellow-400 font-semibold italic">
                        Stand: {selectedPlayerChar.standName} • {selectedPlayerChar.title}
                      </p>
                    </div>
                  </div>

                  {/* Visual Stickman & Stand Mockup */}
                  <div className="relative w-full h-40 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-center overflow-hidden mb-3">
                    {/* Stand Hologram / Spirit */}
                    <div
                      className="absolute w-24 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center opacity-70 translate-x-10 -translate-y-2 animate-pulse"
                      style={{ borderColor: selectedPlayerChar.standColor, backgroundColor: `${selectedPlayerChar.standColor}15` }}
                    >
                      {/* Stand Distinct Head Icon */}
                      <div
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg relative"
                        style={{ borderColor: selectedPlayerChar.standColor, backgroundColor: `${selectedPlayerChar.standColor}40` }}
                      >
                        {selectedPlayerChar.id === 'jotaro' && (
                          <div className="absolute -top-1 -right-3 text-[10px] text-purple-300 font-bold">★ MANE</div>
                        )}
                        {selectedPlayerChar.id === 'dio' && (
                          <div className="absolute -top-2 text-[10px] text-yellow-300 font-black">▲ CROWN</div>
                        )}
                        {selectedPlayerChar.id === 'crazy_diamond' && (
                          <div className="absolute -top-1 text-[10px] text-cyan-300 font-black">♥ HELM</div>
                        )}
                        {selectedPlayerChar.id === 'king_crimson' && (
                          <div className="absolute -top-2 text-[9px] bg-white text-black px-1 rounded-sm font-black">EPITAPH</div>
                        )}
                        {selectedPlayerChar.id === 'silver_chariot' && (
                          <div className="absolute -top-1 text-[9px] text-slate-200 font-black">⚔ RAPIER</div>
                        )}
                        {selectedPlayerChar.id === 'tooru' && (
                          <div className="absolute -top-1 text-[9px] text-red-400 font-black">🎩 WOU</div>
                        )}
                        <span className="text-xs font-black" style={{ color: selectedPlayerChar.standColor }}>
                          {selectedPlayerChar.standName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="w-1 h-12 rounded-full my-1" style={{ backgroundColor: selectedPlayerChar.standColor }} />
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: selectedPlayerChar.standColor }}>
                        {selectedPlayerChar.standName}
                      </span>
                    </div>

                    {/* Fighter Stickman Model */}
                    <div className="relative z-10 flex flex-col items-center -translate-x-6">
                      <div className="relative">
                        {/* Jotaro Cap */}
                        {selectedPlayerChar.id === 'jotaro' && (
                          <div className="absolute -top-2.5 -left-1 w-10 h-4 bg-slate-900 border border-slate-700 rounded-t-md flex items-center justify-between px-1 z-20">
                            <div className="w-1.5 h-2 bg-yellow-400 rounded-xs" />
                            <div className="w-2.5 h-1 bg-yellow-400 rounded-xs" />
                          </div>
                        )}
                        {/* DIO Blonde Hair & Heart */}
                        {selectedPlayerChar.id === 'dio' && (
                          <>
                            <div className="absolute -top-3 -left-2 w-12 h-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-t-full border border-yellow-600 z-10" />
                            <div className="absolute -top-1 left-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-emerald-300 z-20" />
                          </>
                        )}
                        {/* Josuke Pompadour */}
                        {selectedPlayerChar.id === 'crazy_diamond' && (
                          <div className="absolute -top-5 -left-1 w-14 h-6 bg-indigo-950 border-2 border-indigo-700 rounded-r-full rounded-tl-lg shadow-md z-20 flex flex-col justify-center px-1">
                            <div className="w-8 h-1 bg-indigo-400 rounded-full" />
                            <div className="w-4 h-0.5 bg-indigo-200 rounded-full mt-0.5" />
                          </div>
                        )}
                        {/* Diavolo Long Spotted Pink Hair */}
                        {selectedPlayerChar.id === 'king_crimson' && (
                          <div className="absolute -top-2 -left-3 w-14 h-12 bg-pink-600 border border-pink-400 rounded-t-2xl opacity-90 z-0 flex flex-wrap gap-1 p-1">
                            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                            <div className="w-2 h-2 bg-slate-950 rounded-full ml-auto" />
                            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full mt-2" />
                          </div>
                        )}
                        {/* Polnareff Tall Silver Flat-Top Hair & Broken Heart Earring */}
                        {selectedPlayerChar.id === 'silver_chariot' && (
                          <>
                            <div className="absolute -top-7 left-1 w-7 h-8 bg-gradient-to-b from-slate-100 to-slate-300 border border-slate-500 rounded-t-xs z-20 flex flex-col justify-around py-0.5 items-center">
                              <div className="w-5 h-0.5 bg-white" />
                              <div className="w-5 h-px bg-slate-400" />
                              <div className="w-5 h-px bg-slate-400" />
                            </div>
                            <div className="absolute top-4 -left-2 text-[9px] text-slate-300 font-bold z-20">💔</div>
                          </>
                        )}
                        {/* Stickman Headband */}
                        {selectedPlayerChar.id === 'stickman' && (
                          <div className="absolute top-1 -left-2 w-11 h-2 bg-white border border-red-500 rounded-sm z-20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          </div>
                        )}
                        {/* Tooru Afro Curls & Red Earphones */}
                        {selectedPlayerChar.id === 'tooru' && (
                          <>
                            <div className="absolute -top-3 -left-2 w-12 h-6 bg-slate-900 rounded-t-full border border-slate-700 z-10" />
                            <div className="absolute top-2 -left-3 w-2 h-4 bg-red-500 rounded-sm border border-red-300 z-20" />
                            <div className="absolute top-2 -right-3 w-2 h-4 bg-red-500 rounded-sm border border-red-300 z-20" />
                          </>
                        )}

                        <div
                          className="w-9 h-9 rounded-full border-2 border-slate-900 shadow-xl relative z-10 flex items-center justify-center"
                          style={{ backgroundColor: selectedPlayerChar.bodyColor }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        </div>
                      </div>

                      {/* Torso & Badges */}
                      <div className="w-1.5 h-14 bg-slate-300 rounded-full relative my-0.5">
                        {selectedPlayerChar.id === 'jotaro' && (
                          <div className="absolute top-1 -left-2 w-3.5 h-3.5 border-b-2 border-yellow-400 rounded-full" />
                        )}
                        {selectedPlayerChar.id === 'crazy_diamond' && (
                          <div className="absolute top-1 -left-2 text-[8px] text-yellow-400 font-bold">⚓ ☮</div>
                        )}
                        {selectedPlayerChar.id === 'dio' && (
                          <div className="absolute bottom-1 -left-1 w-2 h-2 bg-emerald-500 rounded-full" />
                        )}
                      </div>

                      {/* Legs */}
                      <div className="flex gap-4 -mt-2">
                        <div className="w-1 h-9 bg-slate-400 rotate-12 rounded-full" />
                        <div className="w-1 h-9 bg-slate-400 -rotate-12 rounded-full" />
                      </div>
                      <span className="text-[10px] font-black text-slate-200 uppercase mt-1 tracking-wider bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800">
                        {selectedPlayerChar.name}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-black italic font-mono">
                      "{selectedPlayerChar.barrageCry}"
                    </div>
                  </div>

                  {/* Character Move List */}
                  <div className="space-y-1.5 mb-4">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      Special Skill Arsenal (Mekanik & Jurus)
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {selectedPlayerChar.skillsList?.map((skill, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-yellow-300">{skill.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
                              {skill.command}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('mode')}
                    className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20 transition-all"
                  >
                    Next: Choose Game Mode
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: GAME MODE SELECTION */}
          {activeTab === 'mode' && (
            <motion.div
              key="tab-mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 max-w-4xl mx-auto w-full"
            >
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-yellow-400" />
                  Select Game Mode (Pilih Mode Pertarungan)
                </h2>
                <p className="text-xs text-slate-400">Pilih mode arcade standar, latihan jurus barrage & Time Stop, atau survival rush</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div
                  onClick={() => setSelectedMode('arcade')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedMode === 'arcade'
                      ? 'border-yellow-400 bg-gradient-to-b from-yellow-500/10 to-slate-950 shadow-xl shadow-yellow-500/10 ring-1 ring-yellow-400/60'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 mb-2">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-white mb-1">
                      Arcade 1v1 Match
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">
                      Pertarungan 1v1 dengan batas waktu 99 detik melawan AI Stickman cerdas.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">99s Timer</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-yellow-400">Classic</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMode('cpu_vs_cpu')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedMode === 'cpu_vs_cpu'
                      ? 'border-purple-400 bg-gradient-to-b from-purple-500/20 via-indigo-950/40 to-slate-950 shadow-xl shadow-purple-500/20 ring-1 ring-purple-400/60'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-2">
                      <Bot className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-white mb-1 flex items-center gap-1">
                      CPU VS CPU
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">
                      Pertarungan otomatis 2 AI Stickman (Bot P1 vs Bot P2) tanpa kontrol manual!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">AI VS AI</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-yellow-400">Spectate</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMode('training')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedMode === 'training'
                      ? 'border-cyan-400 bg-gradient-to-b from-cyan-500/10 to-slate-950 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/60'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-white mb-1">
                      Training Mode
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">
                      Latih kombo, animasi barrage, dan Time Stop counter dengan Stand Energy (SP) tak terbatas.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400">Infinite Energy</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">Practice</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMode('team_boss')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedMode === 'team_boss'
                      ? 'border-rose-400 bg-gradient-to-b from-rose-500/10 to-slate-950 shadow-xl shadow-rose-500/10 ring-1 ring-rose-400/60'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2">
                      <Skull className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-white mb-1">
                      Team VS Boss Raid
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">
                      Bertim 2 petarung melawan Supreme Boss dengan HP raksasa! Pemain bisa respawn!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-rose-400">Supreme Boss</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400">Respawn ON</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedMode('team_survival')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedMode === 'team_survival'
                      ? 'border-emerald-400 bg-gradient-to-b from-emerald-500/10 to-slate-950 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-400/60'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-white mb-1">
                      Team Survival
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">
                      Arena 2600px dengan Dynamic Camera! Bantai musuh sebanyak mungkin tanpa respawn!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400">2600px Arena</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-rose-400">Perma-death</span>
                  </div>
                </div>
              </div>

              {/* Sub-Options for Team Modes */}
              {(selectedMode === 'team_boss' || selectedMode === 'team_survival') && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  
                  {/* Choose Teammate */}
                  <div>
                    <label className="text-xs font-extrabold uppercase text-purple-400 block mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Pilih Karakter Teammate (Partner Tim):
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {CHARACTERS.map(char => (
                        <button
                          key={char.id}
                          onClick={() => setSelectedTeammateChar(char)}
                          className={`p-1.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            selectedTeammateChar.id === char.id
                              ? 'bg-purple-600/30 border-purple-500 shadow-md scale-105'
                              : 'bg-slate-900 border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px]" style={{ backgroundColor: char.bodyColor, color: '#fff' }}>
                            {char.name.charAt(0)}
                          </div>
                          <span className="text-[9px] font-bold truncate w-full">{char.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If Boss Mode: Choose Supreme Boss */}
                  {selectedMode === 'team_boss' ? (
                    <PreMatchBossSelectorView selectedBossType={selectedBossType} setSelectedBossType={setSelectedBossType} />
                  ) : (
                    <div className="flex flex-col justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400 mb-1">🎮 Dynamic Camera Scrolling System:</span>
                      Kamera akan otomatis melacak pergerakan kedua pemain dan musuh saat bergerak melewati batas layar di map luas (2600 pixel).
                    </div>
                  )}

                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('map')}
                  className="py-2.5 px-6 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20 transition-all"
                >
                  Next: Choose Map Arena
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MAP SELECTION */}
          {activeTab === 'map' && (
            <motion.div
              key="tab-map"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 max-w-5xl mx-auto w-full"
            >
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  Select Battle Arena (Pilih Map)
                </h2>
                <p className="text-xs text-slate-400">Pilih arena ikonik pertarungan dengan suasana visual khas</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MAPS.map((map) => {
                  const isSelected = selectedMap.id === map.id;

                  return (
                    <div
                      key={map.id}
                      onClick={() => setSelectedMap(map)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'border-yellow-400 bg-slate-900 shadow-xl shadow-yellow-500/10 ring-1 ring-yellow-400/70'
                          : 'border-slate-800 bg-slate-950/70 hover:bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-full h-24 rounded-xl mb-3 flex flex-col justify-end p-2 relative overflow-hidden border border-slate-800"
                        style={{
                          background: `linear-gradient(to bottom, ${map.skyGradient[0]}, ${map.skyGradient[2]})`,
                        }}
                      >
                        <div
                          className="h-3 w-full rounded"
                          style={{ backgroundColor: map.floorColors[0], borderTop: `2px solid ${map.lineColor}` }}
                        />
                        <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/60 text-white">
                          {map.landmarkType}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100 mb-0.5">
                          {map.name}
                        </h3>
                        <p className="text-[11px] text-yellow-400/90 font-medium mb-1">
                          {map.location}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {map.theme}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-yellow-400 uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected Arena
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Floating Action Bar */}
      <footer className="sticky bottom-0 z-30 w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 py-3 px-4 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Match Config:</span>
            <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 font-bold text-yellow-400">
              {selectedPlayerChar.name}
            </span>
            <span className="text-slate-500 font-black">VS</span>
            <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 font-bold text-rose-400">
              {selectedEnemyChar.name}
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 font-bold text-cyan-400 uppercase">
              Mode: {selectedMode}
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 font-bold text-emerald-400">
              Map: {selectedMap.name}
            </span>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Swords className="w-5 h-5 text-slate-950" />
            FIGHT! (MULAI PERTARUNGAN)
          </button>
        </div>
      </footer>
    </div>
  );
};
