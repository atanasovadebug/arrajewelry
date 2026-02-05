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
import { CreditCard, ArrowLeft, ShoppingBag, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { formatDualCurrency, FREE_SHIPPING_THRESHOLD_EUR, FREE_SHIPPING_THRESHOLD_BGN, SHIPPING_TIME_INFO, SHIPPING_COST_STANDARD_BGN, SHIPPING_COST_AUTOMAT_BGN } from "@/lib/currency";
import type { ShippingMethod } from "@/contexts/CartContext";


export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, clearCart, shippingMethod, setShippingMethod } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    // allow only digits and a single leading +
    const cleaned = value.replace(/[^0-9+]/g, "");
    if (!cleaned.includes("+")) return cleaned;
    return cleaned.startsWith("+")
      ? "+" + cleaned.slice(1).replace(/\+/g, "")
      : cleaned.replace(/\+/g, "");
  };

  const isValidBulgarianPhone = (value: string) => {
    const v = value.replace(/\s+/g, "");

    // 0XXXXXXXXX (10 digits) e.g. 0896892555
    if (/^0\d{9}$/.test(v)) return true;

    // +359XXXXXXXXX (13 chars, + + 12 digits) e.g. +359896892555
    if (/^\+359\d{9}$/.test(v)) return true;

    // 359XXXXXXXXX (12 digits) e.g. 359896892555
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

    setIsSubmitting(true);

    try {
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
          })),
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          shippingAddress: {
            city: formData.city,
            address: formData.address,
            postalCode: formData.postalCode,
          },
          shippingMethod: shippingMethod,
          notes: formData.notes,
          successUrl: `${window.location.origin}/order-success`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });

      if (error) throw new Error(error.message);
      
      if (data?.url) {
        // Store cart items in sessionStorage for order creation after payment
        sessionStorage.setItem("pending_cart_items", JSON.stringify(items));
        // Redirect to Stripe Checkout
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
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Имейл *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border rounded-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-lg font-semibold">Адрес за доставка</h2>
                </div>
                
                {/* Shipping Method Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">Метод на доставка</Label>
                  <RadioGroup 
                    value={shippingMethod} 
                    onValueChange={(value) => setShippingMethod(value as ShippingMethod)}
                    className="space-y-2"
                  >
                    <label
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === "standard"
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" />
                        <div>
                          <p className="font-medium text-sm">Доставка до адрес (Speedy)</p>
                          <p className="text-xs text-muted-foreground">{SHIPPING_TIME_INFO}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">
                        {subtotal >= FREE_SHIPPING_THRESHOLD_BGN ? (
                          <span className="text-green-600">Безплатна</span>
                        ) : (
                          formatDualCurrency(SHIPPING_COST_STANDARD_BGN)
                        )}
                      </span>
                    </label>
                    <label
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === "automat"
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
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
                  </RadioGroup>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Град *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Пощенски код *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">
                      {shippingMethod === "automat" ? "Адрес на автомат *" : "Адрес *"}
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder={shippingMethod === "automat" ? "Номер на Speedy автомат" : "Улица, номер, вход, етаж, апартамент"}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="notes">Бележки към поръчката</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Допълнителни указания за доставка..."
                      className="mt-1"
                    />
                  </div>
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
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        <p className="text-sm font-semibold">
                          {formatDualCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Междинна сума</span>
                    <span>{formatDualCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Доставка ({shippingMethod === "automat" ? "Speedy Автомат" : "Speedy"})
                    </span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Безплатна</span>
                      ) : (
                        formatDualCurrency(shippingCost)
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Безплатна доставка над {FREE_SHIPPING_THRESHOLD_EUR} € / {FREE_SHIPPING_THRESHOLD_BGN.toFixed(2)} лв.
                    </p>
                  )}
                  <p className="text-xs text-primary font-medium">{SHIPPING_TIME_INFO}</p>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Общо</span>
                    <span>{formatDualCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  size="lg"
                  disabled={isSubmitting}
                >
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
