export interface WordLevel {
  id: number;
  name: string;
  letters: string[];
  targetWords: string[];
  bonusWords: string[];
  clue?: string; // Standard clue or prompt
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  level: number;
  score: number;
  isCurrentUser?: boolean;
  avatarColor: string;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  letters: string[];
  targetWords: string[];
  bonusWords: string[];
  rewardCoins: number;
  completed: boolean;
}

export interface CoinProduct {
  id: string;
  title: string;
  coins: number;
  priceToman: number;
  description: string;
  popular?: boolean;
}

export interface UserGameState {
  coins: number;
  currentLevelId: number;
  foundWords: string[]; // For current level
  unlockedLevels: number[];
  revealedCells: { [wordIndex: number]: boolean[] }; // Track which letter indexes are revealed
  bonusWordsFound: string[]; // For current level
  totalBonusWordsCount: number; // Total across all time
  completedDailyDate?: string; // Last completed daily challenge date YYYY-MM-DD
  playerScore: number;
  playerName: string;
}
