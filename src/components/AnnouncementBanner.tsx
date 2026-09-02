import { motion } from "framer-motion";
import { Info } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="status"
      className="bg-foreground text-background"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
        <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
        <p className="font-body text-sm leading-relaxed">
          Важно: в периода <strong className="font-medium">17.09 – 07.10</strong> няма да изпращаме поръчки.
          Можете да поръчате онлайн, а изпращането ще бъде след 07.10.
        </p>
      </div>
    </motion.aside>
  );
}
