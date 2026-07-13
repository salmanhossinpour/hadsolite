import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, HelpCircle, Star, Sparkles, Coins, RefreshCw, X, UserCheck } from "lucide-react";
import { sound } from "./SoundManager";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const handleClose = () => {
    sound.playTap();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden border border-border bg-card text-card-foreground shadow-2xl rounded-lg"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-foreground" />
              <h3 className="font-bold text-base text-foreground">راهنمای بازی حدسولایت</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs leading-relaxed text-muted-foreground">
            {/* Story/Theme Intro */}
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-1 animate-pulse" />
              <p className="font-bold text-foreground text-sm">به واژه‌بازی حدسولایت خوش‌آمدید!</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                در این بازی، شما در نقش کاتبی دانا به درگاه دیوان کلمات راه یافته‌اید. حدسولایت برایتان حروفی معلق چیده است تا با دانش خود، واژه‌های اصیل فارسی بسازید.
              </p>
            </div>

            {/* How to play list */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 border-b border-border pb-1">
                <BookOpen className="w-4 h-4" />
                <span>قوانین بازی و شیوه حدس واژه‌ها:</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center shrink-0">۱</div>
                  <p className="pt-0.5">
                    <strong>اتصال حروف:</strong> حروفی که در دایره پایین می‌بینید را به ترتیب لمس کنید تا واژه‌ای تشکیل شود. پس از اتمام، دکمه تایید یا رها کردن را بزنید تا کلمه بررسی گردد.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center shrink-0">۲</div>
                  <p className="pt-0.5">
                    <strong>خانه‌های خالی (کلمات هدف):</strong> کلمات درست در جاهای خالی بالای صفحه قرار می‌گیرند. وقتی تمام خانه‌ها پر شوند، به مرحله بعدی صعود خواهید کرد.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center shrink-0">۳</div>
                  <p className="pt-0.5">
                    <strong>کیسه کلمات اضافی:</strong> برخی کلمات در فرهنگ لغت حدسولایت وجود دارند اما جزو جدول اصلی نیستند. این واژه‌ها به عنوان «کلمات اضافی» شناخته شده و به کیسه ریخته می‌شوند. وقتی کیسه پر شود، سکه هدیه می‌گیرید!
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center shrink-0">۴</div>
                  <p className="pt-0.5">
                    <strong>راهنما و سکه‌ها:</strong> سکه آغازین شما ۱۵۰ عدد است. می‌توانید سکه بخرید یا کسب کنید. استفاده از دکمه «راهنمای کل» یک حرف تصادفی را فاش می‌کند (۵۰ سکه). کلیک روی هر خانه خالی خاص به صورت هدفمند آن حرف را فاش می‌کند (۷۰ سکه).
                  </p>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                <Coins className="w-4 h-4 text-primary" />
                <span>روش‌های کسب سکه رایگان:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li>حل کردن کامل هر مرحله (+۲۰ سکه)</li>
                <li>یافتن کلمات اضافی جدید (+۵ سکه به ازای هر کلمه)</li>
                <li>انجام چالش‌های روزانه تالار مشاهیر (+۱۲۰ الی +۱۵۰ سکه)</li>
                <li>کسب دستاوردهای رتبه‌ای در جدول رده‌بندی</li>
              </ul>
            </div>

            <div className="text-center pt-3 border-t border-border flex flex-col items-center justify-center gap-1 text-[10px]">
              <div className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>طراحی شده توسط سلمان حسین برای سرگرمی و خونوکی بازی</span>
              </div>
              <span className="text-muted-foreground opacity-60">بهار ۱۴۰۵ هجری خورشیدی</span>
            </div>
          </div>

          {/* Close Action */}
          <div className="p-3.5 border-t border-border bg-secondary/20 flex justify-end">
            <button
              onClick={handleClose}
              className="px-5 py-1.5 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-95 transition-opacity"
            >
              متوجه شدم، بزن بریم!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
