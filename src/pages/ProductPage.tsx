import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Share2, Truck, CreditCard, Banknote, Building2, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Demo product data - in real app this would come from a database
const demoProduct = {
  id: "1",
  name: "Елегантен пръстен с моасанит",
  price: 189,
  originalPrice: 220,
  description: "Изящен пръстен с централен моасанитов камък, обрамчен в стерлингово сребро. Перфектен избор за специални моменти или ежедневна елегантност.",
  material: "Стерлингово сребро 925",
  stone: "Моасанит 1 карат",
  size: "Регулируем (16-18)",
  weight: "3.2 грама",
  color: "Сребрист",
  category: "moissanite",
  subcategory: "rings",
  images: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop",
  ],
  inStock: true,
};

export default function ProductPage() {
  const { productId } = useParams();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // In real app, fetch product by productId
  const product = demoProduct;

  const handleAddToCart = () => {
    toast({
      title: "Добавено в количката",
      description: `${product.name} x${quantity} беше добавен в количката ви.`,
    });
  };

  const handleBuyNow = () => {
    toast({
      title: "Преминаване към плащане",
      description: "Ще бъдете пренасочени към страницата за плащане.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Линкът е копиран",
      description: "Линкът към продукта е копиран в клипборда.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
        >
          <Link to="/" className="hover:text-primary transition-colors">Начало</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-primary transition-colors capitalize">
            {product.category === "moissanite" ? "Моасанит" : 
             product.category === "silver" ? "Сребро" :
             product.category === "steel" ? "Неръждаема стомана" : "Ръчна изработка"}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="aspect-square overflow-hidden rounded-sm bg-secondary/30">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0.8, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-sm overflow-hidden transition-all ${
                    selectedImage === idx 
                      ? "ring-2 ring-primary ring-offset-2" 
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-heading text-3xl md:text-4xl font-semibold">{product.name}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="btn-elevated"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-5 h-5 icon-subtle ${isFavorite ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" className="btn-elevated" onClick={handleShare}>
                    <Share2 className="w-5 h-5 icon-subtle" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4">
                <span className="font-heading text-3xl font-semibold text-primary">{product.price} лв.</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{product.originalPrice} лв.</span>
                )}
                {product.originalPrice && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>
              
              {product.inStock ? (
                <Badge variant="outline" className="mt-3 text-green-600 border-green-600/30 bg-green-50">
                  В наличност
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-3 text-red-600 border-red-600/30 bg-red-50">
                  Изчерпан
                </Badge>
              )}
            </div>

            <Separator />

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-5 rounded-sm">
              <div>
                <span className="text-sm text-muted-foreground">Материал</span>
                <p className="font-medium">{product.material}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Камък</span>
                <p className="font-medium">{product.stone}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Размер</span>
                <p className="font-medium">{product.size}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Тегло</span>
                <p className="font-medium">{product.weight}</p>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Количество:</span>
                <div className="flex items-center border border-border rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-secondary transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 btn-elevated bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  Добави в количката
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 btn-elevated"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  Купи сега
                </Button>
              </div>
            </div>

            <Separator />

            {/* Shipping & Payment Info */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-medium">Доставка и плащане</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary mt-0.5 icon-subtle" />
                  <div>
                    <p className="font-medium">Доставка със Spidy</p>
                    <p className="text-sm text-muted-foreground">Безплатна доставка за поръчки над 100€</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-primary mt-0.5 icon-subtle" />
                  <div>
                    <p className="font-medium">Наложен платеж</p>
                    <p className="text-sm text-muted-foreground">Плащане при доставка</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5 icon-subtle" />
                  <div>
                    <p className="font-medium">Дебитна/Кредитна карта</p>
                    <p className="text-sm text-muted-foreground">Сигурно онлайн плащане</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-primary mt-0.5 icon-subtle" />
                  <div>
                    <p className="font-medium">Банков превод</p>
                    <p className="text-sm text-muted-foreground">Директен превод по сметка</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 icon-subtle" />
                  <div>
                    <p className="font-medium">Капаро</p>
                    <p className="text-sm text-muted-foreground">Възможност за авансово плащане 30% при поръчка</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Link
            to={`/category/${product.category}/${product.subcategory}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Обратно към категорията
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
