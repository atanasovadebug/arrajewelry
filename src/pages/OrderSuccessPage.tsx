import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderId = location.state?.orderId;

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
