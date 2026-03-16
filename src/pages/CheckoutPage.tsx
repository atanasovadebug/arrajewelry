import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, ArrowLeft, ShoppingBag, Truck, Tag, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { formatDualCurrency, FREE_SHIPPING_THRESHOLD_EUR, FREE_SHIPPING_THRESHOLD_BGN, SHIPPING_TIME_INFO, SHIPPING_COST_OFFICE_BGN, SHIPPING_COST_AUTOMAT_BGN, SHIPPING_COST_ADDRESS_BGN } from "@/lib/currency";
import type { ShippingMethod } from "@/contexts/CartContext";
import { SpeedyOfficeSelector, type SpeedyOffice } from "@/components/SpeedyOfficeSelector";


const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sht",
  ъ: "a",
  ь: "y",
  ю: "yu",
  я: "ya",
};

const normalizeTextValue = (value: string) =>
  Array.from(value.trim().toLowerCase())
    .map((char) => CYRILLIC_TO_LATIN_MAP[char] ?? char)
    .join("")
    .replace(/[\s-]+/g, "");

const normalizePromoCode = (value: string) => normalizeTextValue(value);

const isMoissaniteCategory = (category?: string) => {
  const normalizedCategory = normalizeTextValue(category ?? "");
  return ["moissanite", "moisanite", "moysanit", "moasanit"].includes(normalizedCategory);
};

const getSofiaDateKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, clearCart, shippingMethod, setShippingMethod } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<SpeedyOffice | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: "all" | "moissanite";
    percent: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
    notes: "",
  });

  const sanitizePhoneInput = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, "");
    if (!cleaned.includes("+")) return cleaned;
    return cleaned.startsWith("+")
      ? "+" + cleaned.slice(1).replace(/\+/g, "")
      : cleaned.replace(/\+/g, "");
  };

  const isValidBulgarianPhone = (value: string) => {
    const v = value.replace(/\s+/g, "");
    if (/^0\d{9}$/.test(v)) return true;
    if (/^\+359\d{9}$/.test(v)) return true;
    if (/^359\d{9}$/.test(v)) return true;
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? sanitizePhoneInput(value) : value,
    }));
  };

  const handleShippingMethodChange = (value: ShippingMethod) => {
    setShippingMethod(value);
    // Clear selected office when switching methods
    if (value === "address") {
      setSelectedOffice(null);
    }
  };

  const handleApplyDiscount = () => {
    setDiscountError("");
    const code = normalizePromoCode(discountCode);
    const sofiaDate = getSofiaDateKey();

    if (code === "spring30") {
      // Valid 2026-03-16 to 2026-03-21 (Sofia time)
      if (sofiaDate < "2026-03-16" || sofiaDate > "2026-03-21") {
        setDiscountError("Този код вече не е валиден");
        return;
      }
      setAppliedDiscount({ code: "spring30", type: "all", percent: 30 });
    } else if (code === "arra10") {
      setAppliedDiscount({ code: "arra10", type: "all", percent: 10 });
    } else if (code === "radina15") {
      const hasMoissanite = items.some((item) => isMoissaniteCategory(item.category));
      if (!hasMoissanite) {
        setDiscountError("Този код е валиден само за бижута от категория Мойсанит");
        return;
      }
      setAppliedDiscount({ code: "radina15", type: "moissanite", percent: 15 });
    } else {
      setDiscountError("Грешен код, опитайте отново!");
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  // Calculate discount amount
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "all"
      ? subtotal * (appliedDiscount.percent / 100)
      : items
          .filter((item) => isMoissaniteCategory(item.category))
          .reduce((sum, item) => sum + item.price * item.quantity, 0) *
        (appliedDiscount.percent / 100)
    : 0;

  const discountedSubtotal = subtotal - discountAmount;
  const adjustedShippingCost =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD_BGN ? 0 : shippingCost;
  const discountedTotal = discountedSubtotal + adjustedShippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Количката ви е празна");
      return;
    }

    if (!isValidBulgarianPhone(formData.phone)) {
      toast.error("Моля, въведете валиден телефон (0896892555 или +359896892555)");
      return;
    }

    // Validate office/automat selection
    if ((shippingMethod === "office" || shippingMethod === "automat") && !selectedOffice) {
      toast.error(
        shippingMethod === "office"
          ? "Моля, изберете Speedy офис от картата"
          : "Моля, изберете Speedy автомат от картата"
      );
      return;
    }

    // Validate address fields for personal address delivery
    if (shippingMethod === "address") {
      if (!formData.city || !formData.address || !formData.postalCode) {
        toast.error("Моля, попълнете всички полета за адрес");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const shippingAddress =
        shippingMethod === "address"
          ? {
              city: formData.city,
              address: formData.address,
              postalCode: formData.postalCode,
            }
          : {
              city: selectedOffice!.city || "—",
              address: `${selectedOffice!.name}${selectedOffice!.address ? " - " + selectedOffice!.address : ""}`,
              postalCode: "—",
            };

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            color: item.color,
            category: item.category,
          })),
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          shippingAddress,
          shippingMethod: shippingMethod,
          notes: formData.notes,
          discountCode: appliedDiscount?.code || null,
          successUrl: `${window.location.origin}/order-success`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.url) {
        sessionStorage.setItem("pending_cart_items", JSON.stringify(items));
        window.location.href = data.url;
        return;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Order error:", error);
      }
      toast.error("Грешка при изпращане на поръчката. Моля, опитайте отново.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
          <h1 className="font-heading text-2xl font-semibold mb-4">Количката е празна</h1>
          <p className="text-muted-foreground mb-8">
            Добавете продукти в количката, за да продължите с поръчката.
          </p>
          <Button asChild>
            <Link to="/category/handmade">Разгледай продукти</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Обратно към магазина
        </Link>

        <h1 className="font-heading text-3xl font-semibold mb-8">Завършване на поръчка</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-lg p-6"
              >
                <h2 className="font-heading text-lg font-semibold mb-4">Информация за контакт</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Име и фамилия *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Имейл *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} required className="mt-1" />
                  </div>
                </div>
              </motion.div>

              {/* Shipping */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border rounded-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-lg font-semibold">Доставка</h2>
                </div>

                {/* Shipping Method Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">Метод на доставка</Label>
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={(v) => handleShippingMethodChange(v as ShippingMethod)}
                    className="space-y-2"
                  >
                    {/* Office */}
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${shippingMethod === "office" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="office" />
                        <div>
                          <p className="font-medium text-sm">Доставка до офис (Speedy)</p>
                          <p className="text-xs text-muted-foreground">{SHIPPING_TIME_INFO}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">
                        {subtotal >= FREE_SHIPPING_THRESHOLD_BGN ? (
                          <span className="text-green-600">Безплатна</span>
                        ) : (
                          formatDualCurrency(SHIPPING_COST_OFFICE_BGN)
                        )}
                      </span>
                    </label>

                    {/* Automat */}
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${shippingMethod === "automat" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="automat" />
                        <div>
                          <p className="font-medium text-sm">Speedy Автомат</p>
                          <p className="text-xs text-muted-foreground">{SHIPPING_TIME_INFO}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">
                        {subtotal >= FREE_SHIPPING_THRESHOLD_BGN ? (
                          <span className="text-green-600">Безплатна</span>
                        ) : (
                          formatDualCurrency(SHIPPING_COST_AUTOMAT_BGN)
                        )}
                      </span>
                    </label>

                    {/* Address */}
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${shippingMethod === "address" ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="address" />
                        <div>
                          <p className="font-medium text-sm">Доставка до адрес (Speedy)</p>
                          <p className="text-xs text-muted-foreground">{SHIPPING_TIME_INFO}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">
                        {subtotal >= FREE_SHIPPING_THRESHOLD_BGN ? (
                          <span className="text-green-600">Безплатна</span>
                        ) : (
                          formatDualCurrency(SHIPPING_COST_ADDRESS_BGN)
                        )}
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                {/* Speedy Widget for office/automat */}
                {(shippingMethod === "office" || shippingMethod === "automat") && (
                  <div className="mb-6">
                    <SpeedyOfficeSelector
                      type={shippingMethod === "automat" ? "automat" : "office"}
                      selectedOffice={selectedOffice}
                      onSelect={setSelectedOffice}
                      onClear={() => setSelectedOffice(null)}
                    />
                  </div>
                )}

                {/* Address fields for personal address */}
                {shippingMethod === "address" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Град *</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleChange} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Пощенски код *</Label>
                      <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Адрес *</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="Улица, номер, вход, етаж, апартамент" className="mt-1" />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mt-4">
                  <Label htmlFor="notes">Бележки към поръчката</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Допълнителни указания за доставка..." className="mt-1" />
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border rounded-lg p-6"
              >
                <h2 className="font-heading text-lg font-semibold mb-4">Метод на плащане</h2>
                <div className="flex items-center gap-4 p-4 border rounded-lg border-primary bg-primary/5">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Дебитна/Кредитна карта</p>
                    <p className="text-sm text-muted-foreground">
                      След "Завърши поръчката" ще бъдете пренасочени към защитена страница за въвеждане на картови данни.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-card border rounded-lg p-6">
                <h2 className="font-heading text-lg font-semibold mb-4">Вашата поръчка</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        <p className="text-sm font-semibold">{formatDualCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Междинна сума</span>
                    <span>{formatDualCurrency(subtotal)}</span>
                  </div>

                  {/* Discount Code Input */}
                  {!appliedDiscount ? (
                    <div className="py-2">
                      <Label className="text-sm text-muted-foreground flex items-center gap-1 mb-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Код за отстъпка
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={discountCode}
                          onChange={(e) => {
                            setDiscountCode(e.target.value);
                            setDiscountError("");
                          }}
                          placeholder="Въведете код"
                          className="h-9 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 px-3"
                          onClick={handleApplyDiscount}
                          disabled={!discountCode.trim()}
                        >
                          Приложи
                        </Button>
                      </div>
                      {discountError && (
                        <p className="text-xs text-destructive mt-1">{discountError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          {appliedDiscount.code.toUpperCase()} (−{appliedDiscount.percent}%)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Отстъпка</span>
                      <span>−{formatDualCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Доставка ({shippingMethod === "automat" ? "Speedy Автомат" : shippingMethod === "office" ? "Speedy Офис" : "Speedy до адрес"})
                    </span>
                    <span>
                      {adjustedShippingCost === 0 ? (
                        <span className="text-green-600">Безплатна</span>
                      ) : (
                        formatDualCurrency(adjustedShippingCost)
                      )}
                    </span>
                  </div>
                  {adjustedShippingCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Безплатна доставка над {FREE_SHIPPING_THRESHOLD_EUR} € / {FREE_SHIPPING_THRESHOLD_BGN.toFixed(2)} лв.
                    </p>
                  )}
                  <p className="text-xs text-primary font-medium">{SHIPPING_TIME_INFO}</p>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Общо</span>
                    <span>{formatDualCurrency(discountedTotal)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Изпращане..." : "Завърши поръчката"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  С поръчката се съгласявате с{' '}
                  <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
                    общите условия
                  </Link>
                  .
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
