import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Share2, Truck, CreditCard, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDualCurrency, FREE_SHIPPING_THRESHOLD_EUR } from "@/lib/currency";

const categoryNames: Record<string, string> = {
  moissanite: "Мойсанит",
  silver: "Сребро",
  "stainless-steel": "Неръждаема стомана",
  handmade: "Ръчна изработка",
};

export default function ProductPage() {
  const { productId } = useParams();
  const { toast } = useToast();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Material type labels
  const typeLabels: Record<string, string> = {
    'silver': 'Сребро',
    'gold': 'Злато',
    'rose-gold': 'Розово злато',
    'white-gold': 'Бяло злато',
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Check if product has available sizes defined (will be properly evaluated after product loads)
  const specs = product?.specifications as Record<string, unknown> | null;
  const hasAvailableSizes = Array.isArray(specs?.available_sizes) && (specs?.available_sizes as string[]).length > 0;
  const requiresSize = hasAvailableSizes && (product?.subcategory === 'bracelets' || product?.subcategory === 'necklaces' || product?.subcategory === 'rings');

  // Check if product has available types defined
  const hasAvailableTypes = Array.isArray(specs?.available_types) && (specs?.available_types as string[]).length > 0;
  const requiresType = hasAvailableTypes && (product?.subcategory === 'bracelets' || product?.subcategory === 'necklaces' || product?.subcategory === 'rings');

  const handleAddToCart = () => {
    if (!product) return;
    if (requiresSize && !selectedSize) {
      toast({
        title: "Изберете размер",
        description: "Моля, изберете размер преди да добавите продукта в количката.",
        variant: "destructive",
      });
      return;
    }
    if (requiresType && !selectedType) {
      toast({
        title: "Изберете вид",
        description: "Моля, изберете вид преди да добавите продукта в количката.",
        variant: "destructive",
      });
      return;
    }
    const productName = requiresSize && selectedSize 
      ? `${product.name} (${product.subcategory === 'rings' ? `размер ${selectedSize}` : `${selectedSize} см`})` 
      : product.name;
    addItem({
      productId: product.id,
      name: productName,
      price: Number(product.price),
      image: product.images?.[0] || "/placeholder.svg",
      quantity,
    });
    toast({
      title: "Добавено в количката",
      description: `${productName} x${quantity} беше добавен в количката ви.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (requiresSize && !selectedSize) {
      toast({
        title: "Изберете размер",
        description: "Моля, изберете размер преди да купите продукта.",
        variant: "destructive",
      });
      return;
    }
    // Build product name with size and type
    let productName = product.name;
    const extras: string[] = [];
    if (requiresSize && selectedSize) {
      extras.push(product.subcategory === 'rings' ? `размер ${selectedSize}` : `${selectedSize} см`);
    }
    if (requiresType && selectedType) {
      extras.push(typeLabels[selectedType] || selectedType);
    }
    if (extras.length > 0) {
      productName = `${product.name} (${extras.join(', ')})`;
    }
    addItem({
      productId: product.id,
      name: productName,
      price: Number(product.price),
      image: product.images?.[0] || "/placeholder.svg",
      quantity,
    });
    navigate("/checkout");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Линкът е копиран",
      description: "Линкът към продукта е копиран в клипборда.",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-secondary/30 animate-pulse rounded-sm" />
            <div className="space-y-4">
              <div className="h-8 bg-secondary/30 animate-pulse rounded w-3/4" />
              <div className="h-6 bg-secondary/30 animate-pulse rounded w-1/4" />
              <div className="h-24 bg-secondary/30 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-heading text-2xl mb-4">Продуктът не е намерен</h1>
          <p className="text-muted-foreground mb-6">
            Съжаляваме, но този продукт не съществува или е премахнат.
          </p>
          <Link to="/">
            <Button>Обратно към началото</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"];
  const specifications = product.specifications as Record<string, unknown> | null;
  const availableSizes = specifications?.available_sizes as string[] | undefined;
  const availableTypes = specifications?.available_types as string[] | undefined;
  const displaySpecs = specifications 
    ? Object.fromEntries(Object.entries(specifications).filter(([k]) => k !== 'available_sizes' && k !== 'available_types'))
    : null;
  const inStock = product.stock > 0;

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
          <Link to={`/category/${product.category}`} className="hover:text-primary transition-colors">
            {categoryNames[product.category] || product.category}
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
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
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
            )}
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
              
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-heading text-2xl md:text-3xl font-semibold text-primary">
                    {formatDualCurrency(Number(product.price))}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      -{Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}%
                    </Badge>
                  )}
                </div>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatDualCurrency(Number(product.original_price))}
                  </span>
                )}
              </div>
              
              {inStock ? (
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

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Product Specifications */}
            {displaySpecs && Object.keys(displaySpecs).length > 0 && (
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-5 rounded-sm">
                {Object.entries(displaySpecs).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <p className="font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Size Selection - Required for bracelets, necklaces, and rings with available sizes */}
            {(product.subcategory === 'bracelets' || product.subcategory === 'necklaces' || product.subcategory === 'rings') && availableSizes && availableSizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Размер: <span className="text-destructive">*</span>
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className={`w-full ${!selectedSize ? 'border-destructive/50' : ''}`}>
                    <SelectValue placeholder="Изберете размер" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {product.subcategory === 'rings' ? `Размер ${size}` : `${size} см`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedSize && (
                  <p className="text-xs text-destructive">Моля, изберете размер преди да добавите в количката</p>
                )}
              </div>
            )}

            {/* Type/Material Selection - Required for bracelets, necklaces, and rings with available types */}
            {(product.subcategory === 'bracelets' || product.subcategory === 'necklaces' || product.subcategory === 'rings') && availableTypes && availableTypes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Вид: <span className="text-destructive">*</span>
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className={`w-full ${!selectedType ? 'border-destructive/50' : ''}`}>
                    <SelectValue placeholder="Изберете вид" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {typeLabels[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedType && (
                  <p className="text-xs text-destructive">Моля, изберете вид преди да добавите в количката</p>
                )}
              </div>
            )}

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
                  disabled={!inStock}
                >
                  Добави в количката
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 btn-elevated"
                  onClick={handleBuyNow}
                  disabled={!inStock}
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
                    <p className="font-medium">Доставка със Speedy</p>
                    <p className="text-sm text-muted-foreground">Безплатна доставка за поръчки над {FREE_SHIPPING_THRESHOLD_EUR} €</p>
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
            to={`/category/${product.category}${product.subcategory ? `/${product.subcategory}` : ''}`}
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
