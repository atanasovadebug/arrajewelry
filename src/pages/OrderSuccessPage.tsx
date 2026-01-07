import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Mail, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderId, setOrderId] = useState<string | null>(location.state?.orderId || null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Handle Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (sessionId && !orderId) {
      setIsVerifying(true);
      
      // Get cart items from sessionStorage
      const pendingCartItems = sessionStorage.getItem("pending_cart_items");
      const cartItems = pendingCartItems ? JSON.parse(pendingCartItems) : [];
      
      // Verify payment and create order
      supabase.functions.invoke("verify-payment", {
        body: { sessionId, cartItems },
      })
        .then(({ data, error }) => {
          if (error) {
            console.error("Payment verification error:", error);
            toast.error("Грешка при потвърждаване на плащането");
            return;
          }
          
          if (data?.success) {
            setOrderId(data.orderId);
            clearCart();
            sessionStorage.removeItem("pending_cart_items");
            toast.success("Плащането е успешно!");
          }
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [searchParams, orderId, clearCart]);

  if (isVerifying) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Потвърждаване на плащането...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-3xl md:text-4xl font-semibold mb-4"
        >
          Благодарим за поръчката!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
        >
          Вашата поръчка беше получена успешно. Ще получите имейл с потвърждение скоро.
        </motion.p>

        {orderId && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground mb-8"
          >
            Номер на поръчка: <span className="font-mono font-medium">{orderId.slice(0, 8).toUpperCase()}</span>
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button asChild>
            <Link to="/" className="inline-flex items-center gap-2">
              Продължи пазаруването
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid sm:grid-cols-2 gap-6 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Mail className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-medium">Потвърждение</p>
              <p className="text-sm text-muted-foreground">Ще получите имейл</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Package className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-medium">Доставка</p>
              <p className="text-sm text-muted-foreground">2-5 работни дни</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
