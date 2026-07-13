import React from "react";
import { Calendar, Award, Lock, CheckCircle, Flame, Star, Sparkles, Compass } from "lucide-react";
import { DailyChallenge } from "../types";
import { sound } from "./SoundManager";

interface DailyChallengeViewProps {
  completedDate?: string;
  onStartDaily: (challenge: DailyChallenge) => void;
  isPlayingDaily: boolean;
}

const DAILY_CHALLENGES_POOL = [
  {
    dayIndex: 0, // Sunday
    letters: ["پ", "ی", "م", "ا", "ن"],
    targetWords: ["پیمان", "پیام", "امین", "مینا", "نیم", "نیام", "پیمانه"],
    bonusWords: ["پا", "من", "یا", "پی"],
    rewardCoins: 120,
  },
  {
    dayIndex: 1, // Monday
    letters: ["ف", "ر", "ه", "ن", "گ"],
    targetWords: ["فرهنگ", "فرنگ", "هنر", "رنگ", "فنگ", "رگه", "نرگ"],
    bonusWords: ["نه", "هر", "ری", "من"],
    rewardCoins: 120,
  },
  {
    dayIndex: 2, // Tuesday
    letters: ["د", "ا", "ن", "ش", "م", "ن", "د"],
    targetWords: ["دانشمند", "دانش", "دشمن", "شمن", "مدد", "مناد", "ندا", "نماد"],
    bonusWords: ["ما", "شد", "آن", "مو"],
    rewardCoins: 150,
  },
  {
    dayIndex: 3, // Wednesday
    letters: ["ب", "ه", "س", "ت", "ی"],
    targetWords: ["بهشتی", "بهشت", "سیب", "بسی", "بست", "تهی", "شیب"],
    bonusWords: ["به", "بس", "تب", "ده"],
    rewardCoins: 120,
  },
  {
    dayIndex: 4, // Thursday
    letters: ["س", "پ", "ی", "د", "ه"],
    targetWords: ["سپیده", "پیدا", "سبد", "دیس", "پایه", "سایه", "سبه", "پند"],
    bonusWords: ["پا", "دی", "سی", "ده"],
    rewardCoins: 130,
  },
  {
    dayIndex: 5, // Friday
    letters: ["ف", "ر", "د", "و", "س", "ی"],
    targetWords: ["فردوسی", "فرد", "سفر", "سرد", "سیر", "روسی", "دیو", "سور"],
    bonusWords: ["رو", "مو", "ده", "دو"],
    rewardCoins: 150,
  },
  {
    dayIndex: 6, // Saturday
    letters: ["ش", "ا", "ه", "ن", "ا", "م", "ه"],
    targetWords: ["شاهنامه", "شاه", "نامه", "منش", "شانه", "مهان", "نما", "امان"],
    bonusWords: ["من", "ما", "نه", "شن"],
    rewardCoins: 150,
  }
];

export function getTodayChallenge(): DailyChallenge {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...

  const poolItem = DAILY_CHALLENGES_POOL.find(c => c.dayIndex === dayOfWeek) || DAILY_CHALLENGES_POOL[0];

  return {
    date: dateStr,
    letters: poolItem.letters,
    targetWords: poolItem.targetWords,
    bonusWords: poolItem.bonusWords,
    rewardCoins: poolItem.rewardCoins,
    completed: false
  };
}

export default function DailyChallengeView({
  completedDate,
  onStartDaily,
  isPlayingDaily
}: DailyChallengeViewProps) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const isCompletedToday = completedDate === dateStr;

  const currentChallenge = getTodayChallenge();

  // Simulated week status
  const weekDays = [
    { name: "ش", isToday: today.getDay() === 6, done: today.getDay() > 6 || (today.getDay() === 6 && isCompletedToday) },
    { name: "ی", isToday: today.getDay() === 0, done: today.getDay() > 0 || (today.getDay() === 0 && isCompletedToday) },
    { name: "د", isToday: today.getDay() === 1, done: today.getDay() > 1 || (today.getDay() === 1 && isCompletedToday) },
    { name: "س", isToday: today.getDay() === 2, done: today.getDay() > 2 || (today.getDay() === 2 && isCompletedToday) },
    { name: "چ", isToday: today.getDay() === 3, done: today.getDay() > 3 || (today.getDay() === 3 && isCompletedToday) },
    { name: "پ", isToday: today.getDay() === 4, done: today.getDay() > 4 || (today.getDay() === 4 && isCompletedToday) },
    { name: "ج", isToday: today.getDay() === 5, done: today.getDay() > 5 || (today.getDay() === 5 && isCompletedToday) }
  ];

  const handleLaunchChallenge = () => {
    sound.playTap();
    onStartDaily(currentChallenge);
  };

  const getPersianDateString = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("fa-IR", options).format(today);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full" dir="rtl">
      {/* Header Banner */}
      <div className="p-4 bg-secondary/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-foreground" />
          <h3 className="font-extrabold text-foreground text-base">چالشهای روزانه دیوان</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full text-[10px] font-bold text-foreground">
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>پاداش ویژه</span>
        </div>
      </div>

      <div className="p-3 lg:p-4 flex-1 flex flex-col justify-between space-y-3 lg:space-y-4 overflow-y-auto min-h-0">
        {/* Date Display */}
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">امروز در دیوان میرزا</span>
          <span className="font-bold text-sm text-foreground block mt-1">{getPersianDateString()}</span>
        </div>

        {/* Weekly Streaks */}
        <div className="p-3 bg-secondary/20 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-semibold text-muted-foreground">وضعیت چالش‌های هفتگی شما:</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
              <Flame className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>{isCompletedToday ? "۱ روز فعال" : "امروز بازی کنید"}</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`p-1.5 rounded-md flex flex-col items-center gap-1 border transition-colors ${
                  day.isToday
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : day.done
                    ? "border-border bg-secondary/40 text-muted-foreground"
                    : "border-border bg-card text-muted-foreground/60"
                }`}
              >
                <span className="text-[10px]">{day.name}</span>
                {day.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-foreground fill-foreground/5 shrink-0" />
                ) : (
                  <Star className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Challenge Action Section */}
        <div className="p-4 bg-secondary/30 rounded-lg border border-border/80 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
            <Award className="w-6 h-6 animate-bounce" />
          </div>

          <div>
            <h4 className="font-extrabold text-foreground text-sm">چالش بزرگ کلمات امروز</h4>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
              با حل جدول امروز، به عنوان کاتب نام‌آور دست پیدا کنید و <strong className="text-primary">{currentChallenge.rewardCoins} سکه طلا</strong> پاداش بگیرید.
            </p>
          </div>

          <div className="w-full pt-1">
            {isCompletedToday ? (
              <div className="w-full py-2.5 bg-secondary text-muted-foreground border border-border rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>امروز این چالش را با موفقیت حل کردید!</span>
              </div>
            ) : isPlayingDaily ? (
              <div className="w-full py-2.5 bg-primary/10 text-foreground border border-primary/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary animate-spin" />
                <span>در حال حل چالش امروز...</span>
              </div>
            ) : (
              <button
                onClick={handleLaunchChallenge}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>شروع چالش واژه‌یابی روزانه</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
