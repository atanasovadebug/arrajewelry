import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import promoImage from "@/assets/promo-womens-day.png";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show only between 2026-03-07 and 2026-03-08 (inclusive), Sofia time
    const dismissed = sessionStorage.getItem("promo_popup_dismissed");
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("promo_popup_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 rounded-full bg-black/30 backdrop-blur-sm p-1.5 text-white/80 hover:text-white hover:bg-black/50 transition-all duration-200"
              aria-label="Затвори"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sparkle overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: `0 0 ${4 + Math.random() * 8}px ${2 + Math.random() * 4}px hsl(36 40% 90% / 0.5)`,
                  }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Promo image */}
            <motion.img
              src={promoImage}
              alt="Промоция на подбрани бижута до -50% до 08.03.2026"
              className="w-full h-auto block relative z-0"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Subtle shimmer sweep */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, hsl(36 40% 95% / 0.15) 45%, hsl(36 40% 95% / 0.25) 50%, transparent 55%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 3,
                delay: 1,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
