import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Play, 
  Check, 
  Sliders, 
  Sparkles, 
  X, 
  Gamepad2, 
  Shield, 
  Zap,
  Swords,
  Info,
  MessageSquare,
  Users,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { FightArena } from "./components/FightArena";
import { PreMatchMenu } from "./components/PreMatchMenu";
import { InfoModal } from "./components/InfoModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { HudEditorModal } from "./components/HudEditorModal";
import { MultiplayerMenu } from "./components/MultiplayerMenu";
import { MatchConfig } from "./types";
import { CHARACTERS, MAPS } from "./game/constants";
import { soundManager } from "./game/audio";

// Types for settings
interface GameSettings {
  bgMusic: boolean;
  sfx: boolean;
  volume: number;
  graphics: "Performance" | "Standard" | "Bizarre (Ultra)";
}

export default function App() {
  const [screen, setScreen] = useState<"menu" | "prematch" | "multiplayer" | "fight_single" | "fight_multi">(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room') || params.get('join')) {
        return "multiplayer";
      }
    }
    return "menu";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHudEditorOpen, setIsHudEditorOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [networkRole, setNetworkRole] = useState<'host' | 'client' | 'offline'>('offline');

  const [matchConfig, setMatchConfig] = useState<MatchConfig>({
    playerChar: CHARACTERS[0],
    enemyChar: CHARACTERS[1],
    mode: "arcade",
    map: MAPS[0],
  });

  const [settings, setSettings] = useState<GameSettings>({
    bgMusic: true,
    sfx: true,
    volume: 80,
    graphics: "Bizarre (Ultra)",
  });

  // Protect against accidental page refresh or tab close during active room, matchmaking, or fighting
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (screen !== "menu") {
        e.preventDefault();
        e.returnValue = "Pertandingan atau koneksi multiplayer sedang aktif. Anda yakin ingin keluar?";
        return e.returnValue;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Warn on F5 or Ctrl+R / Cmd+R if inside active fight or lobby
      if (screen !== "menu" && (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r'))) {
        if (!window.confirm("Game sedang berlangsung! Refreshing tab akan memutus koneksi arena. Tetap refresh?")) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [screen]);

  // Floating manga sound effects ("ゴ" / Gogo)
  const menacingSymbols = [
    { text: "ゴ", size: "text-5xl", top: "15%", left: "10%", delay: 0, duration: 4 },
    { text: "ゴ", size: "text-7xl", top: "25%", left: "80%", delay: 1, duration: 5 },
    { text: "ゴ", size: "text-4xl", top: "70%", left: "15%", delay: 0.5, duration: 4.5 },
    { text: "ゴ", size: "text-6xl", top: "65%", left: "75%", delay: 1.5, duration: 6 },
    { text: "ゴ", size: "text-8xl", top: "45%", left: "85%", delay: 2, duration: 5.5 },
    { text: "ゴ", size: "text-5xl", top: "80%", left: "45%", delay: 0.8, duration: 5 },
  ];

  const handleStartSinglePlayer = () => {
    setNetworkRole('offline');
    setScreen("prematch");
  };

  const handleLaunchSingleFight = (config: MatchConfig) => {
    setMatchConfig(config);
    setNetworkRole('offline');
    setScreen("fight_single");
  };

  const handleOpenMultiplayer = () => {
    setScreen("multiplayer");
  };

  const handleStartMultiplayerMatch = (config: MatchConfig, role: 'host' | 'client') => {
    setMatchConfig(config);
    setNetworkRole(role);
    setScreen("fight_multi");
  };

  // Screen 1: Single Player PreMatch Character/Map/Mode Selection Hub
  if (screen === "prematch") {
    return (
      <PreMatchMenu
        onStartFight={handleLaunchSingleFight}
        onBackToTitle={() => setScreen("menu")}
        sfxEnabled={settings.sfx}
      />
    );
  }

  // Screen 2: Multiplayer 5-Player Room Hub
  if (screen === "multiplayer") {
    return (
      <MultiplayerMenu
        onStartMultiplayerMatch={handleStartMultiplayerMatch}
        onBack={() => setScreen("menu")}
      />
    );
  }

  // Screen 3: Single Player Fight Arena
  if (screen === "fight_single") {
    return (
      <FightArena
        matchConfig={matchConfig}
        onBackToMenu={() => {
          soundManager.stopAllBgm();
          setScreen("menu");
        }}
        onBackToSetup={() => {
          soundManager.stopAllBgm();
          setScreen("prematch");
        }}
        bgMusicEnabled={settings.bgMusic}
        sfxEnabled={settings.sfx}
        networkRole="offline"
      />
    );
  }

  // Screen 4: Multiplayer Online Fight Arena
  if (screen === "fight_multi") {
    return (
      <FightArena
        matchConfig={matchConfig}
        onBackToMenu={() => {
          soundManager.stopAllBgm();
          setScreen("menu");
        }}
        onBackToSetup={() => {
          soundManager.stopAllBgm();
          setScreen("multiplayer");
        }}
        onBackToMultiplayerLobby={() => {
          soundManager.stopAllBgm();
          setScreen("multiplayer");
        }}
        bgMusicEnabled={settings.bgMusic}
        sfxEnabled={settings.sfx}
        networkRole={networkRole}
      />
    );
  }

  // Screen 3: Title Menu ("Jojo game")
  return (
    <div className="relative min-h-screen w-full bg-[#0a0712] overflow-hidden text-slate-100 font-sans flex flex-col items-center justify-between selection:bg-yellow-500 selection:text-black">
      
      {/* Dynamic Background Rays & Aura */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Background Rays */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-black" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,10,36,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,10,36,0.3)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Ambient Purple/Yellow Stand Aura */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-r from-purple-600/30 via-amber-500/20 to-transparent filter blur-[80px] pointer-events-none animate-aura-gpu shadow-[0_0_50px_rgba(168,85,247,0.4)]" 
        />
      </div>

      {/* Menacing Floating Text Elements */}
      {menacingSymbols.map((sym, index) => (
        <div
          key={index}
          className={`absolute font-black select-none pointer-events-none text-purple-600/25 ${sym.size} ${index % 2 === 0 ? "animate-menacing-1" : "animate-menacing-2"}`}
          style={{ 
            top: sym.top, 
            left: sym.left, 
            fontFamily: "Impact, sans-serif",
            animationDelay: `${sym.delay}s`
          }}
        >
          {sym.text}
        </div>
      ))}

      {/* Header bar / Quick links */}
      <header className="relative w-full z-10 px-4 sm:px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-yellow-400" />
          <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold hidden sm:inline">
            2D Arcade Fighting Engine
          </span>
          <span className="text-xs font-bold text-yellow-400 sm:hidden">
            JJBA STICKMAN
          </span>
        </div>

        {/* Quick Access Utility Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInfoOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-yellow-400 text-slate-300 hover:text-yellow-400 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            title="Informasi Game & Legal Notice"
          >
            <Info className="w-3.5 h-3.5 text-yellow-400" />
            <span>Information</span>
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            title="Kirim Feedback ke Email"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Feedback</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-4xl flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-lg w-full"
          >
            {/* Eye-catching badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              2D Stickman Stand & Hamon Battle
            </motion.div>

            {/* Title Section */}
            <div className="relative mb-10 select-none group">
              {/* 3D layered text styling */}
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] relative z-10 leading-none">
                Jojo Game
              </h1>
              
              {/* Darker Purple back layer for 3D outline */}
              <span className="absolute top-[4px] left-[4px] text-7xl md:text-8xl font-black tracking-tighter uppercase font-serif italic text-purple-950 z-0 leading-none select-none">
                Jojo Game
              </span>
              {/* Magenta glow back layer */}
              <span className="absolute top-[-2px] left-[-2px] text-7xl md:text-8xl font-black tracking-tighter uppercase font-serif italic text-rose-500/20 blur-sm z-0 leading-none select-none">
                Jojo Game
              </span>

              {/* Decorative Japanese Manga Title Subtitle */}
              <div className="mt-2 text-center">
                <span className="text-sm font-semibold tracking-[0.5em] text-slate-400 uppercase pl-[0.5em]">
                  奇妙な冒険
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3.5 w-full max-w-xs relative">
              {/* START BUTTON (SINGLE PLAYER) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartSinglePlayer}
                className="group relative overflow-hidden py-4 px-8 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-lg tracking-widest uppercase shadow-[0_4px_20px_rgba(234,179,8,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 hover:from-yellow-300 hover:to-amber-400"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                <Play className="w-5 h-5 fill-slate-950 stroke-slate-950" />
                SINGLE PLAYER
              </motion.button>

              {/* ONLINE MULTIPLAYER P2P BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenMultiplayer}
                className="group relative overflow-hidden py-3.5 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(147,51,234,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 hover:from-purple-500 hover:to-indigo-500"
              >
                <Users className="w-4 h-4 text-purple-200" />
                MULTIPLAYER (5 PLAYERS)
              </motion.button>

              {/* INFORMATION & FEEDBACK BUTTONS ROW */}
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsInfoOpen(true)}
                  className="py-3 px-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-yellow-400 hover:bg-slate-800 text-slate-200 hover:text-yellow-300 font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4 text-yellow-400" />
                  INFO
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsFeedbackOpen(true)}
                  className="py-3 px-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  FEEDBACK
                </motion.button>
              </div>

              {/* SETTING BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSettingsOpen(true)}
                className="relative py-3.5 px-8 rounded-xl bg-slate-900/80 border-2 border-slate-700 hover:border-yellow-500/50 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                SETTINGS
              </motion.button>
            </div>

            {/* Subtitle helper */}
            <div className="mt-8 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
              <Swords className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>Tekan <strong>Start Game</strong> untuk memilih Karakter, Mode, & Map!</span>
            </div>
          </motion.div>

        </AnimatePresence>
      </main>

      {/* Decorative footer */}
      <footer className="relative w-full z-10 py-3 px-6 text-center border-t border-slate-900 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] text-slate-500 tracking-[0.2em] uppercase">
          © 2026 JoJo Stand Stickman Battle • Fan-Made 2D Engine
        </p>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
          <button onClick={() => setIsInfoOpen(true)} className="hover:text-yellow-400 cursor-pointer transition-colors">Information</button>
          <span>•</span>
          <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-cyan-400 cursor-pointer transition-colors">Feedback (davidchils50@gmail.com)</button>
        </div>
      </footer>

      {/* INFORMATION MODAL */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* FEEDBACK MODAL */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* HUD CUSTOMIZER MODAL */}
      <HudEditorModal 
        isOpen={isHudEditorOpen} 
        onClose={() => setIsHudEditorOpen(false)} 
        initialCharId={matchConfig.playerChar.id}
      />

      {/* SETTINGS OVERLAY MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-[#0f0d1a] border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl z-10 scrollbar-thin"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold tracking-wider text-slate-100 uppercase font-serif">
                    Game Settings
                  </h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Settings Fields */}
              <div className="space-y-6">
                
                {/* Audio: Background Music */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200">Background Music</span>
                    <span className="text-xs text-slate-400">Toggle Jojo battle music</span>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, bgMusic: !prev.bgMusic }))}
                    className={`relative w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${settings.bgMusic ? "bg-yellow-500" : "bg-slate-800"}`}
                  >
                    <span className={`w-4 h-4 bg-slate-950 rounded-full transition-transform duration-300 transform ${settings.bgMusic ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Audio: Sound Effects */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200">Combat SFX</span>
                    <span className="text-xs text-slate-400">Play punch & barrage impact sounds</span>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, sfx: !prev.sfx }))}
                    className={`relative w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${settings.sfx ? "bg-yellow-500" : "bg-slate-800"}`}
                  >
                    <span className={`w-4 h-4 bg-slate-950 rounded-full transition-transform duration-300 transform ${settings.sfx ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">Master Volume</span>
                    <span className="text-xs font-mono text-slate-400">{settings.volume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.volume}
                      onChange={(e) => setSettings(prev => ({ ...prev, volume: Number(e.target.value) }))}
                      className="w-full accent-yellow-400 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Graphics Mode selection */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200 block">Graphics Engine</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Performance", "Standard", "Bizarre (Ultra)"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setSettings(prev => ({ ...prev, graphics: g }))}
                        className={`py-1.5 px-2 text-xs font-semibold rounded border text-center transition-all cursor-pointer ${
                          settings.graphics === g
                            ? "bg-yellow-500 text-slate-950 border-yellow-400 shadow-md"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HUD Setting Option */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-sm font-semibold text-slate-200 block">Touch Gamepad HUD</span>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsHudEditorOpen(true);
                    }}
                    className="w-full py-2.5 bg-purple-950/50 hover:bg-purple-900 border border-purple-500 hover:border-purple-400 text-purple-300 hover:text-purple-100 font-extrabold text-xs tracking-wider rounded-lg transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  >
                    <Sliders className="w-4 h-4 text-purple-400" />
                    ATUR POSISI HUD (HUD SETTING)
                  </button>
                </div>

                {/* Reset LocalStorage Section */}
                <div className="pt-4 border-t border-rose-900/40 space-y-2">
                  <div className="flex items-start gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider">Troubleshooting Zone</span>
                      <span className="text-[10px] text-slate-400 leading-normal">
                        Mencurigai ada data localstorage yang rusak di browser Anda? Tekan tombol di bawah untuk membersihkan & memuat ulang game.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-500 text-rose-300 hover:text-rose-100 font-extrabold text-xs tracking-wider rounded-lg transition-all cursor-pointer uppercase flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.1)]"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400 animate-spin-slow" />
                    RESET DATA & LOCALSTORAGE
                  </button>
                </div>

              </div>

              {/* Close Button */}
              <div className="mt-8">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm tracking-widest rounded-lg transition-colors cursor-pointer uppercase shadow-[0_2px_10px_rgba(234,179,8,0.2)]"
                >
                  SAVE CHANGES
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
