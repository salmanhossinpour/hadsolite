import React, { useState } from "react";
import { Trophy, Medal, Search, UserCheck, Sparkles, User, RefreshCw } from "lucide-react";
import { LeaderboardPlayer } from "../types";
import { sound } from "./SoundManager";

interface LeaderboardProps {
  players: LeaderboardPlayer[];
  currentScore: number;
  currentLevel: number;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
}

export default function Leaderboard({
  players,
  currentScore,
  currentLevel,
  playerName,
  onUpdatePlayerName
}: LeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  // Combine live state of player with the pre-populated leaderboard
  const allPlayers: LeaderboardPlayer[] = players.map(p => {
    if (p.isCurrentUser) {
      return {
        ...p,
        name: playerName,
        score: currentScore,
        level: currentLevel
      };
    }
    return p;
  });

  // Sort players by score
  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);

  // Find user rank
  const userRankIndex = sortedPlayers.findIndex(p => p.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 1;

  // Filter players based on search query
  const filteredPlayers = sortedPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      sound.playTap();
      onUpdatePlayerName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/10" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400 fill-slate-400/10" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-700 fill-amber-700/10" />;
      default:
        return <span className="text-xs font-mono text-muted-foreground">#{(index + 1).toLocaleString("fa-IR")}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden" dir="rtl">
      {/* Header Banner */}
      <div className="p-4 bg-secondary/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-foreground" />
          <h3 className="font-extrabold text-foreground text-base">تالار مشاهیر میرزا</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-full border border-primary/10 text-xs font-bold text-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>رتبه شما: {userRank.toLocaleString("fa-IR")}</span>
        </div>
      </div>

      {/* User Quick Info & Nickname Customizer */}
      <div className="p-3.5 bg-secondary/20 border-b border-border flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    maxLength={15}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-2 py-0.5 text-xs border border-border rounded bg-card focus:outline-hidden focus:border-primary text-foreground w-28 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded hover:opacity-90 font-bold"
                  >
                    ثبت
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">{playerName}</span>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setIsEditingName(true);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    ویرایش لقب
                  </button>
                </div>
              )}
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                مرحله {currentLevel.toLocaleString("fa-IR")} • امتیاز {currentScore.toLocaleString("fa-IR")}
              </span>
            </div>
          </div>

          <div className="text-left font-mono text-xs bg-card px-2.5 py-1 border border-border rounded-md">
            <span className="text-muted-foreground text-[10px] block">سطح توانمندی</span>
            <span className="font-bold text-foreground">
              {currentScore < 100
                ? "نوآموز مکتب"
                : currentScore < 400
                ? "واژه‌یاب جوان"
                : currentScore < 1000
                ? "کاتب دربار"
                : "وزیر سخن‌سنج"}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-border bg-card">
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی نام پهلوان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-md bg-secondary/20 focus:outline-hidden focus:border-primary text-foreground"
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player, index) => {
            const globalIndex = sortedPlayers.findIndex(p => p.id === player.id);
            const isMe = player.isCurrentUser;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 transition-colors ${
                  isMe ? "bg-primary/5 border-r-2 border-primary" : "hover:bg-secondary/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {getRankIcon(globalIndex)}
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 text-white"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-semibold ${isMe ? "text-primary font-bold" : "text-foreground"}`}>
                          {player.name}
                        </span>
                        {isMe && <UserCheck className="w-3 h-3 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        مرحله {player.level.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs font-bold text-foreground font-mono">
                    {player.score.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">امتیاز</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            هیچ سخنوری با این نام پیدا نشد!
          </div>
        )}
      </div>

      {/* Footer Notice */}
      <div className="p-2 border-t border-border bg-secondary/30 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
        <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
        <span>رده‌بندی هر ساعت بروزرسانی می‌شود.</span>
      </div>
    </div>
  );
}
