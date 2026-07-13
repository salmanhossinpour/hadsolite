import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Coins,
  Trophy,
  Calendar,
  Volume2,
  VolumeX,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  RotateCcw,
  Check,
  X,
  User,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Flame,
  Star
} from "lucide-react";
import { getLevelById, getTotalLevelsCount } from "./levels";
import { sound } from "./components/SoundManager";
import Shop from "./components/Shop";
import Leaderboard from "./components/Leaderboard";
import DailyChallengeView, { getTodayChallenge } from "./components/DailyChallenge";
import AboutModal from "./components/AboutModal";
import { WordLevel, LeaderboardPlayer, DailyChallenge, UserGameState } from "./types";

// Seed data for leaderboard
const DEFAULT_LEADERBOARD_PLAYERS: LeaderboardPlayer[] = [
  { id: "p1", name: "جعفرخان تبریزی", level: 45, score: 2450, avatarColor: "oklch(0.577 0.245 27.325)" },
  { id: "p2", name: "مریم بانو", level: 34, score: 1850, avatarColor: "oklch(0.488 0.243 264.376)" },
  { id: "p3", name: "الناز شیرازی", level: 28, score: 1420, avatarColor: "oklch(0.704 0.191 22.216)" },
  { id: "p4", name: "سهراب سخندان", level: 21, score: 950, avatarColor: "oklch(0.439 0 0)" },
  { id: "p5", name: "کیان دانا", level: 14, score: 580, avatarColor: "oklch(0.371 0 0)" },
  { id: "p6", name: "کاتب جوان (شما)", level: 1, score: 150, isCurrentUser: true, avatarColor: "oklch(0.205 0 0)" },
  { id: "p7", name: "سارا واژه‌شناس", level: 8, score: 320, avatarColor: "oklch(0.269 0 0)" },
  { id: "p8", name: "امیر سخنور", level: 4, score: 180, avatarColor: "oklch(0.556 0 0)" }
];

export default function App() {
  // Player identification and synchronization
  const [playerId, setPlayerId] = useState<string>(() => {
    return localStorage.getItem("hadsolite_player_id") || "";
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<UserGameState>(() => {
    const saved = localStorage.getItem("mirza_game_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          coins: parsed.coins ?? 150,
          currentLevelId: parsed.currentLevelId ?? 1,
          foundWords: parsed.foundWords ?? [],
          unlockedLevels: parsed.unlockedLevels ?? [1],
          revealedCells: parsed.revealedCells ?? {},
          bonusWordsFound: parsed.bonusWordsFound ?? [],
          totalBonusWordsCount: parsed.totalBonusWordsCount ?? 0,
          completedDailyDate: parsed.completedDailyDate ?? "",
          playerScore: parsed.playerScore ?? 150,
          playerName: parsed.playerName ?? "کاتب جوان"
        };
      } catch (e) {
        console.error("Failed to parse local fallback game state", e);
      }
    }
    return {
      coins: 150,
      currentLevelId: 1,
      foundWords: [],
      unlockedLevels: [1],
      revealedCells: {},
      bonusWordsFound: [],
      totalBonusWordsCount: 0,
      completedDailyDate: "",
      playerScore: 150,
      playerName: "کاتب جوان"
    };
  });

  // Sound settings
  const [isMuted, setIsMuted] = useState(() => sound.getMuteStatus());

  // Navigation & Modals
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"game" | "leaderboard" | "daily">("game");

  // Leaderboard players synchronized with server
  const [leaderboardPlayers, setLeaderboardPlayers] = useState<LeaderboardPlayer[]>([]);

  // Active playing level/challenge
  const [isPlayingDailyMode, setIsPlayingDailyMode] = useState(false);
  const [dailyChallengeData, setDailyChallengeData] = useState<DailyChallenge | null>(null);

  // Load state from NeDB database on startup
  useEffect(() => {
    const storedId = localStorage.getItem("hadsolite_player_id") || "";
    fetch(`/api/game-state?playerId=${storedId}`)
      .then(res => res.json())
      .then(data => {
        if (data.playerId) {
          localStorage.setItem("hadsolite_player_id", data.playerId);
          setPlayerId(data.playerId);
          if (data.state) {
            setGameState(data.state);
            localStorage.setItem("mirza_game_state", JSON.stringify(data.state));
          }
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("Failed to sync state with server, using localStorage fallback:", err);
        setIsLoaded(true);
      });
  }, []);

  // Sync leaderboard with NeDB
  const fetchLeaderboard = () => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const processed = data.map((player) => {
            const isMe = player.id === playerId;
            return {
              ...player,
              isCurrentUser: isMe,
              name: isMe ? gameState.playerName : player.name,
              level: isMe ? gameState.currentLevelId : player.level,
              score: isMe ? gameState.playerScore : player.score
            };
          });
          setLeaderboardPlayers(processed);
        }
      })
      .catch(err => {
        console.error("Failed to load leaderboard from NeDB database:", err);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [playerId, gameState.playerName, gameState.playerScore, gameState.currentLevelId]);

  // Active puzzle definition
  const activeLevel: WordLevel = useMemo(() => {
    if (isPlayingDailyMode && dailyChallengeData) {
      return {
        id: -1, // Special ID for daily
        name: "چالش روزانه دیوان",
        letters: dailyChallengeData.letters,
        targetWords: dailyChallengeData.targetWords,
        bonusWords: dailyChallengeData.bonusWords,
        clue: "معمای بزرگ روزانه برای پاداش طلا"
      };
    }
    return getLevelById(gameState.currentLevelId);
  }, [gameState.currentLevelId, isPlayingDailyMode, dailyChallengeData]);

  // Letters assembly & Guessing
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetterIndices, setSelectedLetterIndices] = useState<number[]>([]);
  const [errorWordMessage, setErrorWordMessage] = useState<string | null>(null);
  const [successWordMessage, setSuccessWordMessage] = useState<string | null>(null);
  const [showLevelCompleteScreen, setShowLevelCompleteScreen] = useState(false);
  
  // Specific Cell Reveal target
  const [cellToRevealTarget, setCellToRevealTarget] = useState<{ wordIdx: number; charIdx: number } | null>(null);

  // Save state helper (local fast-refresh + secure backend NeDB commit)
  const saveState = (newState: UserGameState) => {
    setGameState(newState);
    localStorage.setItem("mirza_game_state", JSON.stringify(newState));

    if (!isLoaded) return; // Prevent overwriting during initialization phase

    const activeId = playerId || localStorage.getItem("hadsolite_player_id") || "";
    if (activeId) {
      fetch("/api/game-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: activeId, state: newState })
      })
      .then(() => {
        // Automatically triggers fresh leaderboard reload
        fetchLeaderboard();
      })
      .catch(err => {
        console.error("Failed to save state to secure NeDB database:", err);
      });
    }
  };

  // Sound muter toggle
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Initialize and shuffle letters when level changes
  useEffect(() => {
    setShuffledLetters([...activeLevel.letters]);
    setSelectedLetterIndices([]);
    setErrorWordMessage(null);
    setSuccessWordMessage(null);
    setShowLevelCompleteScreen(false);
    setCellToRevealTarget(null);

    // Initialize revealed cells state for current level if not exist
    if (isLoaded && !gameState.revealedCells[activeLevel.id]) {
      const initialRevealed: { [wordIndex: number]: boolean[] } = {};
      activeLevel.targetWords.forEach((word, idx) => {
        initialRevealed[idx] = Array(word.length).fill(false);
      });
      saveState({
        ...gameState,
        revealedCells: {
          ...gameState.revealedCells,
          [activeLevel.id]: initialRevealed
        }
      });
    }
  }, [activeLevel, isPlayingDailyMode, isLoaded]);

  // Current Guess string assembled from indices
  const currentGuess = useMemo(() => {
    return selectedLetterIndices.map(idx => shuffledLetters[idx]).join("");
  }, [selectedLetterIndices, shuffledLetters]);

  // Letters arrangement position calculations
  const letterPositions = useMemo(() => {
    const count = shuffledLetters.length;
    const radius = 64; // in pixels
    return shuffledLetters.map((letter, idx) => {
      // Rotate by angle to spread nicely
      const angle = (idx * 2 * Math.PI) / count - Math.PI / 2;
      const x = Math.round(radius * Math.cos(angle));
      const y = Math.round(radius * Math.sin(angle));
      return { letter, x, y, index: idx };
    });
  }, [shuffledLetters]);

  // Interactive connection line path
  const connectionLinePath = useMemo(() => {
    if (selectedLetterIndices.length < 2) return "";
    return selectedLetterIndices
      .map((idx) => {
        const pos = letterPositions[idx];
        if (!pos) return "";
        // Convert local x, y offset to svg relative viewbox coords (center is 100, 100)
        return `${100 + pos.x},${100 + pos.y}`;
      })
      .filter(p => p !== "")
      .reduce((acc, curr, i) => (i === 0 ? `M ${curr}` : `${acc} L ${curr}`), "");
  }, [selectedLetterIndices, letterPositions]);

  // Shuffle letters
  const handleShuffleLetters = () => {
    sound.playTap();
    const arr = [...shuffledLetters];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledLetters(arr);
    setSelectedLetterIndices([]);
  };

  // Tap single letter circle
  const handleLetterTap = (idx: number) => {
    const foundIdx = selectedLetterIndices.indexOf(idx);
    if (foundIdx !== -1) {
      // If tapping the second to last letter, we can undo last step
      if (foundIdx === selectedLetterIndices.length - 1) {
        sound.playTap();
        setSelectedLetterIndices(prev => prev.slice(0, -1));
      } else if (foundIdx === 0 && selectedLetterIndices.length === 1) {
        // Tap first letter again clears guess
        sound.playTap();
        setSelectedLetterIndices([]);
      }
    } else {
      sound.playTap();
      setSelectedLetterIndices(prev => [...prev, idx]);
    }
    setErrorWordMessage(null);
  };

  // Submit guess
  const handleSubmitGuess = () => {
    if (currentGuess.length < 2) {
      sound.playError();
      setErrorWordMessage("حداقل دو حرف انتخاب کنید!");
      return;
    }

    const word = currentGuess;
    const targetIdx = activeLevel.targetWords.indexOf(word);

    if (targetIdx !== -1) {
      // Already found check
      if (gameState.foundWords.includes(word)) {
        sound.playError();
        setErrorWordMessage("این واژه را پیش‌تر پیدا کرده‌اید!");
        setSelectedLetterIndices([]);
        return;
      }

      // Add to found words
      const newFound = [...gameState.foundWords, word];
      sound.playCorrectWord();
      setSuccessWordMessage(`واژه عالی! «${word}» کشف شد.`);

      // Update state & score
      const scoreGain = word.length * 15;
      const updatedScore = gameState.playerScore + scoreGain;

      // Check if level completed
      const allFound = activeLevel.targetWords.every(w => newFound.includes(w) || w === word);
      
      let nextLevelUnlocked = [...gameState.unlockedLevels];
      let coinsGain = 0;

      if (allFound) {
        coinsGain = isPlayingDailyMode ? (dailyChallengeData?.rewardCoins ?? 150) : 30; // Level complete bonus
        sound.playLevelComplete();
        setTimeout(() => {
          setShowLevelCompleteScreen(true);
        }, 500);
      }

      saveState({
        ...gameState,
        foundWords: newFound,
        coins: gameState.coins + coinsGain,
        playerScore: updatedScore
      });

      setSelectedLetterIndices([]);

    } else if (activeLevel.bonusWords.includes(word)) {
      // Bonus word
      if (gameState.bonusWordsFound.includes(word)) {
        sound.playError();
        setErrorWordMessage("این کلمه اضافی را قبلاً یافته‌اید!");
        setSelectedLetterIndices([]);
        return;
      }

      const newBonus = [...gameState.bonusWordsFound, word];
      sound.playBonusWord();

      let reward = 0;
      let alertMsg = `واژه اضافی «${word}» به کیسه انداخته شد!`;

      // Sack gives coin bonus every 3 words
      if (newBonus.length >= 3) {
        reward = 25;
        alertMsg = `شگفت‌انگیز! کیسه کلمات اضافی پر شد و ۲۵ سکه طلا گرفتید!`;
        sound.playCoin();
      }

      saveState({
        ...gameState,
        bonusWordsFound: newBonus,
        totalBonusWordsCount: gameState.totalBonusWordsCount + 1,
        coins: gameState.coins + reward + 5, // 5 coins for finding bonus
        playerScore: gameState.playerScore + 10
      });

      setSuccessWordMessage(alertMsg);
      setSelectedLetterIndices([]);

    } else {
      // Wrong word
      sound.playError();
      setErrorWordMessage(`«${word}» در فرهنگ لغت میرزا یافت نشد!`);
      setSelectedLetterIndices([]);
    }
  };

  // Buy a random general hint
  const handleBuyGeneralHint = () => {
    if (gameState.coins < 50) {
      sound.playError();
      setErrorWordMessage("سکه‌های شما کافی نیست! سری به دکان بزنید.");
      setIsShopOpen(true);
      return;
    }

    // Find all unrevealed letters
    const unrevealedList: { wordIdx: number; charIdx: number }[] = [];
    activeLevel.targetWords.forEach((word, wordIdx) => {
      // Skip if word already completed
      const isWordFound = gameState.foundWords.includes(word);
      if (!isWordFound) {
        const cellRevealState = gameState.revealedCells[activeLevel.id]?.[wordIdx] || Array(word.length).fill(false);
        cellRevealState.forEach((isRev, charIdx) => {
          if (!isRev) {
            unrevealedList.push({ wordIdx, charIdx });
          }
        });
      }
    });

    if (unrevealedList.length === 0) {
      sound.playError();
      setErrorWordMessage("تمام حروف این مرحله قبلاً آشکار شده‌اند!");
      return;
    }

    // Pick random target
    const randomTarget = unrevealedList[Math.floor(Math.random() * unrevealedList.length)];
    sound.playHint();

    const currentRevealed = { ...gameState.revealedCells };
    if (!currentRevealed[activeLevel.id]) {
      currentRevealed[activeLevel.id] = {};
    }
    
    // Construct word cell array if not exists
    if (!currentRevealed[activeLevel.id][randomTarget.wordIdx]) {
      currentRevealed[activeLevel.id][randomTarget.wordIdx] = Array(activeLevel.targetWords[randomTarget.wordIdx].length).fill(false);
    }

    const updatedWordRevealed = [...(currentRevealed[activeLevel.id][randomTarget.wordIdx] || [])];
    updatedWordRevealed[randomTarget.charIdx] = true;
    currentRevealed[activeLevel.id][randomTarget.wordIdx] = updatedWordRevealed;

    saveState({
      ...gameState,
      coins: gameState.coins - 50,
      revealedCells: currentRevealed
    });
  };

  // Target specific cell click
  const handleCellClick = (wordIdx: number, charIdx: number) => {
    // Check if word already found
    const word = activeLevel.targetWords[wordIdx];
    if (gameState.foundWords.includes(word)) return;

    // Check if cell already revealed
    const isAlreadyRevealed = gameState.revealedCells[activeLevel.id]?.[wordIdx]?.[charIdx];
    if (isAlreadyRevealed) return;

    sound.playTap();
    setCellToRevealTarget({ wordIdx, charIdx });
  };

  // Buy specific cell hint
  const handleConfirmSpecificCellReveal = () => {
    if (!cellToRevealTarget) return;

    if (gameState.coins < 70) {
      sound.playError();
      setErrorWordMessage("برای گشایش این خانه به ۷۰ سکه طلا نیاز دارید!");
      setCellToRevealTarget(null);
      setIsShopOpen(true);
      return;
    }

    sound.playCoin();

    const currentRevealed = { ...gameState.revealedCells };
    if (!currentRevealed[activeLevel.id]) {
      currentRevealed[activeLevel.id] = {};
    }

    if (!currentRevealed[activeLevel.id][cellToRevealTarget.wordIdx]) {
      currentRevealed[activeLevel.id][cellToRevealTarget.wordIdx] = Array(activeLevel.targetWords[cellToRevealTarget.wordIdx].length).fill(false);
    }

    const updatedWordRevealed = [...(currentRevealed[activeLevel.id][cellToRevealTarget.wordIdx] || [])];
    updatedWordRevealed[cellToRevealTarget.charIdx] = true;
    currentRevealed[activeLevel.id][cellToRevealTarget.wordIdx] = updatedWordRevealed;

    saveState({
      ...gameState,
      coins: gameState.coins - 70,
      revealedCells: currentRevealed
    });

    setCellToRevealTarget(null);
  };

  // Progress to next level
  const handleNextLevel = () => {
    sound.playTap();
    if (isPlayingDailyMode) {
      // Daily completed, return to normal stages
      const todayStr = new Date().toISOString().split("T")[0];
      saveState({
        ...gameState,
        completedDailyDate: todayStr,
        foundWords: [],
        bonusWordsFound: []
      });
      setIsPlayingDailyMode(false);
    } else {
      const nextLevel = gameState.currentLevelId + 1;
      const unlocked = Array.from(new Set([...gameState.unlockedLevels, nextLevel]));
      saveState({
        ...gameState,
        currentLevelId: nextLevel,
        unlockedLevels: unlocked,
        foundWords: [],
        bonusWordsFound: []
      });
    }
    setShowLevelCompleteScreen(false);
  };

  // Handle coins purchase
  const handlePurchaseComplete = (amount: number) => {
    saveState({
      ...gameState,
      coins: gameState.coins + amount
    });
  };

  // Handle Daily Challenge launch
  const handleStartDailyChallenge = (challenge: DailyChallenge) => {
    setDailyChallengeData(challenge);
    setIsPlayingDailyMode(true);
    setMobileTab("game");
  };

  // Back to Main game from Daily Mode
  const handleQuitDailyMode = () => {
    sound.playTap();
    setIsPlayingDailyMode(false);
  };

  // Update Username
  const handleUpdatePlayerName = (newName: string) => {
    saveState({
      ...gameState,
      playerName: newName
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col bg-background text-foreground transition-all duration-300 antialiased font-sans">
      {/* 1. Header Navigation Panel */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Right Section: Brand Logo and Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-base border border-border animate-pulse shadow-xs">
              ح
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-foreground tracking-tight">دیوان واژگان حدسولایت</h1>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">حدس کلمات در بستر هنر مینیمال</span>
            </div>
          </div>

          {/* Center Section: Coin balance indicator */}
          <div className="flex items-center gap-1.5">
            <div
              onClick={() => {
                sound.playTap();
                setIsShopOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-secondary hover:bg-secondary/80 border border-border rounded-full cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs"
              title="برای ورود به دکان سکه کلیک کنید"
            >
              <Coins className="w-4 h-4 text-foreground animate-spin duration-10000" />
              <span className="font-extrabold text-xs text-foreground font-mono">
                {gameState.coins.toLocaleString("fa-IR")}
              </span>
              <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Left Section: Controls & Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded-md hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              title={isMuted ? "وصل کردن صدا" : "قطع کردن صدا"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setIsAboutOpen(true);
              }}
              className="p-1.5 rounded-md hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              title="راهنمای مکتب‌خانه"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold hidden sm:inline">راهنما</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Layout Matrix */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-3.5rem)] lg:max-h-[calc(100vh-3.5rem)] lg:overflow-hidden" dir="rtl">
        
        {/* Left Side: Desktop Sidebar (About & Leaderboard) */}
        <section className="hidden lg:flex lg:col-span-3 flex-col gap-4 lg:h-full lg:max-h-full lg:overflow-hidden">
          <div className="flex-1 lg:min-h-0">
            <Leaderboard
              players={leaderboardPlayers}
              currentScore={gameState.playerScore}
              currentLevel={gameState.currentLevelId}
              playerName={gameState.playerName}
              onUpdatePlayerName={handleUpdatePlayerName}
            />
          </div>
          <div className="h-[225px] shrink-0">
            <DailyChallengeView
              completedDate={gameState.completedDailyDate}
              isPlayingDaily={isPlayingDailyMode}
              onStartDaily={handleStartDailyChallenge}
            />
          </div>
        </section>

        {/* Center / Primary Game Field (Responsive Word Grid and letter wheel) */}
        <section className={`col-span-1 lg:col-span-6 flex flex-col justify-between space-y-4 lg:space-y-3 lg:h-full lg:max-h-full lg:overflow-hidden ${mobileTab === "game" ? "flex" : "hidden lg:flex"}`}>
          
          {/* Active Level Header/Notice */}
          <div className="bg-card border border-border p-3 lg:p-3.5 rounded-lg flex items-center justify-between shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-foreground animate-bounce" />
              <div>
                <h2 className="font-extrabold text-sm text-foreground">
                  {isPlayingDailyMode ? "چالش روزانه حدسولایت" : activeLevel.name}
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  راهنمای حکیم: {activeLevel.clue || "واژگان را یکی پس از دیگری متصل کنید."}
                </p>
              </div>
            </div>

            {isPlayingDailyMode && (
              <button
                onClick={handleQuitDailyMode}
                className="px-2.5 py-1 text-[10px] bg-secondary hover:bg-secondary-foreground hover:text-secondary border border-border text-foreground font-bold rounded-md transition-colors"
              >
                بازگشت به مراحل اصلی
              </button>
            )}
          </div>

          {/* Interactive Word grid of letters */}
          <div className="bg-card border border-border p-4 lg:p-5 rounded-lg flex-1 flex flex-col justify-center lg:min-h-0 lg:overflow-y-auto shadow-2xs relative">
            <div className="space-y-3 max-w-sm mx-auto w-full">
              {activeLevel.targetWords.map((word, wordIdx) => {
                const isFound = gameState.foundWords.includes(word);
                const isWordRevealedState = gameState.revealedCells[activeLevel.id]?.[wordIdx] || Array(word.length).fill(false);

                return (
                  <div key={wordIdx} className="flex justify-center items-center gap-1.5" dir="rtl">
                    {word.split("").map((char, charIdx) => {
                      const isSingleCellRevealed = isWordRevealedState[charIdx];
                      const shouldShowLetter = isFound || isSingleCellRevealed;

                      return (
                        <motion.div
                          key={charIdx}
                          onClick={() => handleCellClick(wordIdx, charIdx)}
                          whileHover={{ scale: shouldShowLetter ? 1 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-9 h-9 border rounded-md flex items-center justify-center font-extrabold text-base transition-all duration-200 cursor-pointer ${
                            shouldShowLetter
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-secondary/30 hover:bg-secondary/70 border-border text-muted-foreground/30 hover:border-foreground/30"
                          }`}
                        >
                          {shouldShowLetter ? (
                            char
                          ) : (
                            <span className="text-[9px] text-muted-foreground/40 font-bold opacity-0 hover:opacity-100 transition-opacity">
                              ۷۰🪙
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Hint Notice overlay or details */}
            <div className="absolute bottom-2 right-2 text-[9px] text-muted-foreground">
              * روی خانه‌های خالی کلیک کنید تا آن حرف را جداگانه بخرید (۷۰ سکه)
            </div>
          </div>

          {/* Letter preview box and Guess Actions */}
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Active connections visual path */}
            <div className="h-9 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentGuess ? (
                  <motion.div
                    key="active-guess"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="px-4 py-1.5 bg-secondary text-foreground font-extrabold text-base tracking-widest border border-border rounded-full flex items-center gap-2 shadow-xs"
                  >
                    <span>{currentGuess}</span>
                    <button
                      onClick={() => {
                        sound.playTap();
                        setSelectedLetterIndices([]);
                      }}
                      className="p-0.5 rounded-full hover:bg-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-xs text-muted-foreground italic"
                  >
                    برای حدس کلمه، حروف دایره را به ترتیب لمس کنید
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error / Success logs feedback */}
            <div className="h-6 flex items-center justify-center text-xs">
              {errorWordMessage && (
                <span className="text-destructive font-semibold flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  <span>{errorWordMessage}</span>
                </span>
              )}
              {successWordMessage && (
                <span className="text-foreground font-semibold flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" />
                  <span>{successWordMessage}</span>
                </span>
              )}
            </div>
          </div>

          {/* 3. Circular Assembly Letter Pad */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-52 h-52 rounded-full border border-border/80 bg-secondary/10 shadow-xs flex items-center justify-center">
              
              {/* Circular Letters positions */}
              {letterPositions.map((pos) => {
                const isSelected = selectedLetterIndices.includes(pos.index);
                const selectionOrderIndex = selectedLetterIndices.indexOf(pos.index);

                return (
                  <button
                    key={pos.index}
                    onClick={() => handleLetterTap(pos.index)}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px)`
                    }}
                    className={`absolute w-12 h-12 rounded-full font-black text-lg transition-all duration-200 border-2 select-none flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary scale-110 shadow-md"
                        : "bg-card text-foreground hover:bg-secondary/80 hover:border-primary border-border"
                    }`}
                  >
                    <span>{pos.letter}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center border border-border">
                        {(selectionOrderIndex + 1).toLocaleString("fa-IR")}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Central utility buttons */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                {currentGuess ? (
                  <button
                    onClick={handleSubmitGuess}
                    className="w-12 h-12 rounded-full bg-foreground text-background hover:opacity-95 shadow-md flex items-center justify-center transition-all duration-150 active:scale-90"
                    title="ثبت کلمه حدس زده شده"
                  >
                    <Check className="w-6 h-6 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    onClick={handleShuffleLetters}
                    className="w-10 h-10 rounded-full bg-card hover:bg-secondary border border-border shadow-xs flex items-center justify-center transition-all duration-150 active:scale-90"
                    title="مخلوط کردن حروف چرخ"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {currentGuess ? "تایید" : "مخلوط‌کن"}
                </span>
              </div>

              {/* Hints General button at bottom left of the pad */}
              <button
                onClick={handleBuyGeneralHint}
                className="absolute -bottom-2 -left-2 w-11 h-11 rounded-full bg-card hover:bg-secondary border border-border shadow-2xs flex flex-col items-center justify-center transition-all active:scale-95 text-foreground"
                title="خرید راهنمای کلی تصادفی (۵۰ سکه)"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-[8px] font-bold">۵۰🪙</span>
              </button>

              {/* Bonus sack bag display at bottom right of the pad */}
              <div
                className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-card border border-border shadow-2xs flex flex-col items-center justify-center cursor-help"
                title={`کیسه کلمات اضافی: ${gameState.bonusWordsFound.length}/۳ یافته شده`}
              >
                <div className="relative">
                  <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
                  {gameState.bonusWordsFound.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center border border-border">
                      {gameState.bonusWordsFound.length}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold text-muted-foreground">کیسه کلمات</span>
              </div>

            </div>
          </div>

          {/* Sack bonus words listed (if any) */}
          {gameState.bonusWordsFound.length > 0 && (
            <div className="p-3 bg-secondary/20 border border-border rounded-lg text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block mb-1">کیسه کلمات اضافی این مرحله:</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {gameState.bonusWordsFound.map((bw, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-card border border-border text-[11px] rounded-md text-foreground font-medium">
                    {bw}
                  </span>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* Right Side: Desktop Sidebar (Shop & Statistics for complex immersion) */}
        <section className="hidden lg:flex lg:col-span-3 flex-col gap-4 lg:h-full lg:max-h-full lg:overflow-y-auto pr-0.5">
          {/* Progress overview metrics */}
          <div className="bg-card border border-border p-4 rounded-lg flex flex-col gap-3 shadow-2xs">
            <h4 className="font-bold text-foreground text-sm border-b border-border pb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>دیوان‌خانه میرزا</span>
            </h4>
            
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>تعداد کل مراحل رفتـه:</span>
                <span className="font-bold text-foreground">{(gameState.currentLevelId - 1).toLocaleString("fa-IR")} مرحله</span>
              </div>
              <div className="flex justify-between">
                <span>امتیاز به دست آمده:</span>
                <span className="font-bold text-foreground">{gameState.playerScore.toLocaleString("fa-IR")} امتیاز</span>
              </div>
              <div className="flex justify-between">
                <span>کلمات اضافی یافته شده:</span>
                <span className="font-bold text-foreground">{gameState.totalBonusWordsCount.toLocaleString("fa-IR")} واژه</span>
              </div>
              <div className="flex justify-between">
                <span>وضعیت چالش روز:</span>
                <span className={`font-bold ${gameState.completedDailyDate === new Date().toISOString().split("T")[0] ? "text-emerald-600" : "text-amber-600"}`}>
                  {gameState.completedDailyDate === new Date().toISOString().split("T")[0] ? "حل شده" : "حل نشده"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                setIsShopOpen(true);
              }}
              className="w-full py-2 mt-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ورود مستقیم به دکان سکه</span>
            </button>
          </div>

          {/* Quick instructions panel */}
          <div className="bg-secondary/20 border border-border p-4 rounded-lg space-y-2.5">
            <h5 className="text-xs font-bold text-foreground flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <span>فرهنگ راهنمایی کلمات:</span>
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              اگر کلمه‌ای را حدس زدید که جزو جدول اصلی نبود، آن کلمه به «کیسه کلمات اضافی» می‌رود. با یافتن هر ۳ کلمه اضافی، ۲۵ سکه طلا از میرزا پاداش خواهید گرفت!
            </p>
          </div>
        </section>

        {/* Mobile-only swapped views for Leaderboard and Daily Challenge when active on mobile tab selection */}
        {mobileTab === "leaderboard" && (
          <div className="col-span-1 lg:hidden flex flex-col flex-1 min-h-[420px]">
            <Leaderboard
              players={leaderboardPlayers}
              currentScore={gameState.playerScore}
              currentLevel={gameState.currentLevelId}
              playerName={gameState.playerName}
              onUpdatePlayerName={handleUpdatePlayerName}
            />
          </div>
        )}

        {mobileTab === "daily" && (
          <div className="col-span-1 lg:hidden flex flex-col flex-1 min-h-[350px]">
            <DailyChallengeView
              completedDate={gameState.completedDailyDate}
              isPlayingDaily={isPlayingDailyMode}
              onStartDaily={handleStartDailyChallenge}
            />
          </div>
        )}

      </main>

      {/* 4. Mobile Bottom Tab-Bar */}
      <footer className="lg:hidden sticky bottom-0 z-40 bg-card border-t border-border" dir="rtl">
        <div className="grid grid-cols-3 text-center h-14">
          <button
            onClick={() => {
              sound.playTap();
              setMobileTab("game");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs ${
              mobileTab === "game" ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
            }`}
          >
            <Play className="w-4.5 h-4.5" />
            <span>مکتب‌خانه (بازی)</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setMobileTab("leaderboard");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs ${
              mobileTab === "leaderboard" ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
            <span>رده‌بندی کاربران</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setMobileTab("daily");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs ${
              mobileTab === "daily" ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>چالش روزانه</span>
          </button>
        </div>
      </footer>

      {/* 5. Modals Overlays */}

      {/* Specific Cell Hint Purchase confirmation overlay */}
      <AnimatePresence>
        {cellToRevealTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-5 rounded-lg w-full max-w-sm"
              dir="rtl"
            >
              <h4 className="font-extrabold text-foreground text-sm">گشایش خانه خالی هدفمند</h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                آیا مایلید این حرفِ به خصوص از جاهای خالی را به ازای <strong className="text-primary">۷۰ سکه طلا</strong> آشکار کنید؟
              </p>
              
              <div className="mt-4 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => {
                    sound.playTap();
                    setCellToRevealTarget(null);
                  }}
                  className="px-3.5 py-1.5 border border-border rounded-md hover:bg-secondary text-xs text-muted-foreground hover:text-foreground"
                >
                  انصراف
                </button>
                <button
                  onClick={handleConfirmSpecificCellReveal}
                  className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-md text-xs hover:opacity-90 flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>آشکارش کن!</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Level Completed Celebration Overlay Modal */}
      <AnimatePresence>
        {showLevelCompleteScreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-card border border-border p-6 rounded-lg w-full max-w-sm text-center space-y-4 shadow-2xl relative overflow-hidden"
              dir="rtl"
            >
              {/* Sparkly Background visuals */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-primary"></div>
              
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
                <Award className="w-9 h-9 animate-bounce" />
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">فرهنگستان دیوان</span>
                <h3 className="font-extrabold text-lg text-foreground mt-1">آفرین بر همت شما کاتب گرامی!</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {isPlayingDailyMode
                    ? `چالش روزانه امروز را به طور کامل حل کردید و پاداش شاهانه را گرفتید.`
                    : `تمام خانه‌های خالی مرحله ${gameState.currentLevelId.toLocaleString("fa-IR")} با موفقیت کشف شدند.`}
                </p>
              </div>

              {/* Reward values */}
              <div className="p-3 bg-secondary border border-border rounded-lg max-w-xs mx-auto flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground block">سکه دریافتی:</span>
                  <span className="font-extrabold text-foreground text-sm flex items-center gap-1 justify-center mt-0.5">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    <span>+{isPlayingDailyMode ? (dailyChallengeData?.rewardCoins ?? 150).toLocaleString("fa-IR") : "۳۰"}</span>
                  </span>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground block">امتیاز کسب‌شده:</span>
                  <span className="font-extrabold text-foreground text-sm flex items-center gap-1 justify-center mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>+{activeLevel.targetWords.join("").length * 15}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={handleNextLevel}
                className="w-full py-2.5 bg-primary text-primary-foreground font-extrabold text-sm rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>ادامه مسیر واژه‌یابی</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coin Shop Modal */}
      <Shop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />

      {/* About/Rules Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
}
