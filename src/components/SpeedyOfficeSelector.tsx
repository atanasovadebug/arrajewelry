import { useEffect, useRef, useCallback, useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SpeedyOffice {
  id: string;
  name: string;
  address: string;
  city: string;
  type: "office" | "automat";
}

interface SpeedyOfficeSelectorProps {
  type: "office" | "automat";
  selectedOffice: SpeedyOffice | null;
  onSelect: (office: SpeedyOffice) => void;
  onClear: () => void;
}

export function SpeedyOfficeSelector({ type, selectedOffice, onSelect, onClear }: SpeedyOfficeSelectorProps) {
  const [showWidget, setShowWidget] = useState(!selectedOffice);

  const officeType = type === "automat" ? "APT" : "OFFICE";
  const buttonCaption = type === "automat"
    ? "Избери този автомат"
    : "Избери този офис";

  const iframeSrc = `https://services.speedy.bg/office_locator_widget_v3/office_locator.php?lang=bg&showOfficesList=1&officeType=${officeType}&selectOfficeButtonCaption=${encodeURIComponent(buttonCaption)}&dropOff=1&pickUp=1`;

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== "https://services.speedy.bg") return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && (data.id || data.name)) {
          const office: SpeedyOffice = {
            id: String(data.id ?? data.officeCode ?? ""),
            name: data.name ?? data.officeName ?? "",
            address: data.address?.fullAddressString ?? data.address ?? "",
            city: data.address?.siteName ?? data.siteName ?? data.city ?? "",
            type,
          };
          onSelect(office);
          setShowWidget(false);
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [onSelect, type]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  if (selectedOffice && !showWidget) {
    return (
      <div className="border rounded-lg p-4 bg-primary/5 border-primary">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {type === "automat" ? "Избран автомат" : "Избран офис"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{selectedOffice.name}</p>
            {selectedOffice.address && (
              <p className="text-xs text-muted-foreground">{selectedOffice.address}</p>
            )}
            {selectedOffice.city && (
              <p className="text-xs text-muted-foreground">{selectedOffice.city}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClear();
              setShowWidget(true);
            }}
          >
            Смени
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>
          {type === "automat"
            ? "Изберете Speedy автомат от картата"
            : "Изберете Speedy офис от картата"}
        </span>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={iframeSrc}
          width="100%"
          height="450"
          style={{ border: "none" }}
          title={type === "automat" ? "Speedy автомати" : "Speedy офиси"}
          allow="geolocation"
        />
      </div>
    </div>
  );
}
