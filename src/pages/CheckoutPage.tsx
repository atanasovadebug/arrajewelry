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
import { CreditCard, Building2, ArrowLeft, ShoppingBag, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { formatDualCurrency, FREE_SHIPPING_THRESHOLD_EUR } from "@/lib/currency";

const paymentMethods = [
  {
    id: "card",
    name: "Дебитна/Кредитна карта",
    description: "Онлайн плащане с карта",
    icon: CreditCard,
  },
  {
    id: "bank",
    name: "Банков превод",
    description: "Превод по банкова сметка",
    icon: Building2,
  },
];

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Количката ви е празна");
      return;
    }

    setIsSubmitting(true);

    try {
      // If card payment, redirect to Stripe
      if (paymentMethod === "card") {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            items: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            customerEmail: formData.email,
            customerName: formData.name,
            customerPhone: formData.phone,
            shippingAddress: {
              city: formData.city,
              address: formData.address,
              postalCode: formData.postalCode,
            },
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
      }

      // Bank transfer - create order directly
      const sessionId = localStorage.getItem("cart_session_id") || crypto.randomUUID();

      // Only select the order ID to minimize PII exposure in the response
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          session_id: sessionId,
          status: "pending",
          payment_method: paymentMethod,
          subtotal,
          shipping_cost: shippingCost,
          total,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: {
            city: formData.city,
            address: formData.address,
            postalCode: formData.postalCode,
          },
          notes: formData.notes || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast.success("Поръчката е изпратена успешно!");
      navigate("/order-success", { state: { orderId: order.id } });
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
                    <Label htmlFor="address">Адрес *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Улица, номер, вход, етаж, апартамент"
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
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/50"
                        }`}
                      >
                        <RadioGroupItem value={method.id} />
                        <method.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
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
                    <span className="text-muted-foreground">Доставка (Speedy)</span>
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
                      Безплатна доставка над {FREE_SHIPPING_THRESHOLD_EUR} €
                    </p>
                  )}
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
                  С поръчката се съгласявате с общите условия
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
