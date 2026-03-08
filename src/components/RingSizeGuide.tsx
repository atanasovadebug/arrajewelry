import { useState } from "react";
import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ringSizeChart from "@/assets/ring-size-chart.jpg";

export function RingSizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          <Ruler className="w-3.5 h-3.5" />
          Как да разбера размера си?
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Таблица с размери на пръстени</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <img
            src={ringSizeChart}
            alt="Таблица с размери на пръстени - обиколка и диаметър в милиметри"
            className="w-full rounded-md"
          />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Измерете обиколката или диаметъра на пръста си в милиметри и сравнете с таблицата, за да намерите вашия размер.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
