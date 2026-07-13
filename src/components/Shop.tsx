import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, ShoppingBag, CreditCard, ShieldCheck, Check, Sparkles, X, Loader2, Copy, ExternalLink, Send } from "lucide-react";
import { CoinProduct } from "../types";
import { sound } from "./SoundManager";

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (coinsAmount: number) => void;
}

const COIN_PRODUCTS: CoinProduct[] = [
  {
    id: "pack_1",
    title: "بسته پیشکار حدسولایت",
    coins: 200,
    priceToman: 9000,
    description: "شروعی مناسب برای حل مراحل دشوار اولیه واژه‌ها"
  },
  {
    id: "pack_2",
    title: "بسته وزیر اعظم",
    coins: 600,
    priceToman: 19000,
    description: "بسیار محبوب! حل‌کننده گره‌های پیچیده کلمات",
    popular: true
  },
  {
    id: "pack_3",
    title: "بسته عالی‌جناب دانا",
    coins: 1500,
    priceToman: 39000,
    description: "برای شیفتگان واقعی ادبیات و معماهای بی‌پایان"
  },
  {
    id: "pack_4",
    title: "صندوقچه جواهرات شاهانه",
    coins: 4000,
    priceToman: 79000,
    description: "نامحدود بازی کنید، هرگز نگران خانه خالی نباشید!"
  }
];

export default function Shop({ isOpen, onClose, onPurchaseComplete }: ShopProps) {
  const [selectedProduct, setSelectedProduct] = useState<CoinProduct | null>(null);
  const [step, setStep] = useState<"list" | "checkout" | "processing" | "success">("list");
  const [copied, setCopied] = useState(false);
  const [senderCard, setSenderCard] = useState("");
  const [senderName, setSenderName] = useState("");
  const [refNumber, setRefNumber] = useState("");

  const destCardNumber = "5859831839278644";
  const formattedDestCard = "۵۸۵۹ - ۸۳۱۸ - ۳۹۲۷ - ۸۶۴۴";

  const handleSelectProduct = (product: CoinProduct) => {
    sound.playTap();
    setSelectedProduct(product);
    setStep("checkout");
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(destCardNumber);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCardNumberInput = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumberInput(e.target.value);
    if (formatted.length <= 19) {
      setSenderCard(formatted);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    sound.playTap();
    setStep("processing");
    
    // Simulate verification of card-to-card bank transfer
    setTimeout(() => {
      sound.playCoin();
      setStep("success");
      onPurchaseComplete(selectedProduct.coins);
    }, 2500);
  };

  const resetShop = () => {
    setSelectedProduct(null);
    setStep("list");
    setSenderCard("");
    setSenderName("");
    setRefNumber("");
  };

  const handleCloseShop = () => {
    sound.playTap();
    resetShop();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden border border-border bg-card text-card-foreground shadow-2xl rounded-lg"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <h3 className="font-bold text-lg text-foreground">دکان سکه حدسولایت</h3>
            </div>
            <button
              onClick={handleCloseShop}
              className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 max-h-[75vh] overflow-y-auto">
            {step === "list" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    با افزایش سکه‌ها می‌توانید از حکیم راهنمایی بگیرید، حروف مبهم را باز کنید و سریع‌تر به صدر رده‌بندی صعود کنید.
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-foreground font-semibold shrink-0">
                    <Coins className="w-4 h-4 text-primary animate-pulse" />
                    <span>فروشگاه</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COIN_PRODUCTS.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className={`relative flex flex-col justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 group ${
                        prod.popular
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border hover:border-primary/50 bg-card hover:bg-secondary/20"
                      }`}
                    >
                      {prod.popular && (
                        <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold tracking-wider bg-primary text-primary-foreground rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>پیشنهاد ویژه</span>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                            {prod.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 font-extrabold text-foreground text-lg">
                          <Coins className="w-4.5 h-4.5 text-primary" />
                          <span>{prod.coins.toLocaleString("fa-IR")}</span>
                          <span className="text-xs text-muted-foreground font-normal">سکه</span>
                        </div>
                        <div className="px-2.5 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                          {prod.priceToman.toLocaleString("fa-IR")} تومان
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 py-2.5 text-xs text-muted-foreground border-t border-border/40">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>پشتیبانی و فعال‌سازی سریع از طریق تلگرام پشتیبان انجام می‌شود.</span>
                </div>
              </div>
            )}

            {step === "checkout" && selectedProduct && (
              <div className="space-y-4">
                <div className="p-3 bg-secondary/40 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">بسته انتخابی:</span>
                    <h4 className="font-bold text-foreground text-sm">{selectedProduct.title}</h4>
                    <span className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                      <Coins className="w-3.5 h-3.5" />
                      {selectedProduct.coins} سکه
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground block">مبلغ قابل پرداخت:</span>
                    <span className="font-bold text-primary text-base">{selectedProduct.priceToman.toLocaleString("fa-IR")} تومان</span>
                  </div>
                </div>

                {/* Card To Card Box */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">💳 کارت به کارت برای خرید سکه</span>
                    <span className="text-[10px] text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded-full">بانک ملی ایران</span>
                  </div>

                  <div className="text-center py-2 bg-card rounded-md border border-border/60 relative group">
                    <div className="text-[10px] text-muted-foreground mb-1">شماره کارت مقصد (سلمان حسین):</div>
                    <div className="font-mono text-lg font-bold text-foreground tracking-widest selection:bg-primary/20">
                      {formattedDestCard}
                    </div>
                    
                    <button
                      type="button"
                      onClick={copyCardNumber}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>کپی شد!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی کارت</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Telegram instructions block */}
                  <div className="bg-sky-500/5 border border-sky-500/15 rounded-lg p-3 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-sky-500 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 -rotate-45" />
                        ارسال فیش به تلگرام پشتیبانی
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        لطفاً پس از واریز، فیش واریزی خود را به آیدی تلگرام <strong className="text-foreground">@Salmanultra</strong> بفرستید.
                      </p>
                    </div>

                    <a
                      href="https://t.me/Salmanultra"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white font-bold text-xs rounded-md hover:bg-sky-600 active:scale-95 transition-all shadow-2xs shrink-0"
                    >
                      <span>ارسال در تلگرام</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Simulated payment submission for instant feedback */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <div className="text-xs font-bold text-foreground border-b border-border pb-1">
                    ثبت مشخصات پرداخت جهت تسریع در فعال‌سازی:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                        ۴ رقم آخر کارت شما
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="۱۲۳۴"
                        maxLength={4}
                        value={senderCard}
                        onChange={(e) => setSenderCard(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3 py-1.5 text-center text-sm border border-border rounded-lg bg-card focus:outline-hidden focus:border-primary font-mono text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                        نام واریز کننده
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="سلمان حسین"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3 py-1.5 text-center text-sm border border-border rounded-lg bg-card focus:outline-hidden focus:border-primary text-foreground font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1 font-semibold">
                      شماره پیگیری یا ارجاع (اختیاری)
                    </label>
                    <input
                      type="text"
                      placeholder="۱۲۳۴۵۶"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-1.5 text-center text-sm border border-border rounded-lg bg-card focus:outline-hidden focus:border-primary font-mono text-foreground"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>ثبت و ارسال گزارش پرداخت</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("list")}
                      className="w-full py-1.5 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      بازگشت به لیست بسته‌ها
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center">
                  <h4 className="font-bold text-foreground text-base">در حال بررسی و ثبت رسید دیوان...</h4>
                  <p className="text-xs text-muted-foreground mt-1">اطلاعات شما با موفقیت ثبت شد و برای تایید به تلگرام پشتیبان ارجاع داده می‌شود</p>
                </div>
              </div>
            )}

            {step === "success" && selectedProduct && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-lg">پرداخت ثبت و ارسال شد!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    کیسه سکه شما به مقدار <strong className="text-primary">{selectedProduct.coins} سکه</strong> شارژ گردید.
                  </p>
                </div>

                <div className="w-full max-w-xs p-4 bg-secondary/40 border border-border rounded-lg text-xs text-right space-y-2 font-mono">
                  <div className="flex justify-between border-b border-border/50 pb-1 text-muted-foreground">
                    <span>کد پیگیری دیوان:</span>
                    <span>HD-{Math.floor(Math.random() * 900000 + 100000)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1 text-muted-foreground">
                    <span>محصول خریداری شده:</span>
                    <span>{selectedProduct.title}</span>
                  </div>
                  <div className="flex justify-between text-foreground font-semibold pt-1">
                    <span>مبلغ پرداخت شده:</span>
                    <span>{selectedProduct.priceToman.toLocaleString("fa-IR")} تومان</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground leading-relaxed px-4">
                  جهت اطمینان نهایی و تسریع در تایید فیش، می‌توانید عکس رسید خود را به آیدی تلگرام <strong className="text-foreground">@Salmanultra</strong> ارسال کنید.
                </div>

                <button
                  onClick={handleCloseShop}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  بازگشت به بازی
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
