import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Share2, Truck, CreditCard, Building2 } from "lucide-react";
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

  // Color/Finish labels
  const colorLabels: Record<string, string> = {
    'silver': 'Сребристо',
    'gold': 'Златисто',
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

  // Fetch product variants for stock tracking
  const { data: productVariants } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("size, color, stock")
        .eq("product_id", productId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Get available sizes from variants
  const availableSizesFromVariants = productVariants 
    ? [...new Set(productVariants.map(v => v.size))].sort((a, b) => Number(a) - Number(b))
    : [];
  
  // Get available colors from variants
  const availableColorsFromVariants = productVariants 
    ? [...new Set(productVariants.map(v => v.color))]
    : [];

  // Check variant stock for selected combination
  const getVariantStock = (size: string, color: string) => {
    if (!productVariants) return 0;
    const variant = productVariants.find(v => v.size === size && v.color === color);
    return variant?.stock ?? 0;
  };

  // Check if a specific size has any stock (for any color)
  const getSizeStock = (size: string) => {
    if (!productVariants) return 0;
    return productVariants
      .filter(v => v.size === size)
      .reduce((sum, v) => sum + v.stock, 0);
  };

  // Check if a specific color has any stock (for any size)
  const getColorStock = (color: string) => {
    if (!productVariants) return 0;
    return productVariants
      .filter(v => v.color === color)
      .reduce((sum, v) => sum + v.stock, 0);
  };

  // Check if product has variants
  const hasVariants = productVariants && productVariants.length > 0;
  const requiresSize = hasVariants && availableSizesFromVariants.length > 0 && 
    (product?.subcategory === 'bracelets' || product?.subcategory === 'necklaces' || product?.subcategory === 'rings');
  const requiresColor = hasVariants && availableColorsFromVariants.length > 0 && 
    (product?.subcategory === 'bracelets' || product?.subcategory === 'necklaces' || product?.subcategory === 'rings');

  // Check if selected combination is in stock
  const selectedVariantStock = selectedSize && selectedType 
    ? getVariantStock(selectedSize, selectedType) 
    : 0;
  const isSelectedVariantInStock = selectedVariantStock > 0;

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
    if (requiresColor && !selectedType) {
      toast({
        title: "Изберете цвят",
        description: "Моля, изберете цвят/покритие преди да добавите продукта в количката.",
        variant: "destructive",
      });
      return;
    }
    if (hasVariants && !isSelectedVariantInStock) {
      toast({
        title: "Изчерпана наличност",
        description: "Този вариант не е наличен в момента.",
        variant: "destructive",
      });
      return;
    }
    
    // Build product name with size and color
    let productName = product.name;
    const extras: string[] = [];
    if (selectedSize) {
      extras.push(product.subcategory === 'rings' ? `размер ${selectedSize}` : `${selectedSize} см`);
    }
    if (selectedType) {
      extras.push(colorLabels[selectedType] || selectedType);
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
    if (requiresColor && !selectedType) {
      toast({
        title: "Изберете цвят",
        description: "Моля, изберете цвят/покритие преди да купите продукта.",
        variant: "destructive",
      });
      return;
    }
    if (hasVariants && !isSelectedVariantInStock) {
      toast({
        title: "Изчерпана наличност",
        description: "Този вариант не е наличен в момента.",
        variant: "destructive",
      });
      return;
    }
    
    // Build product name with size and color
    let productName = product.name;
    const extras: string[] = [];
    if (selectedSize) {
      extras.push(product.subcategory === 'rings' ? `размер ${selectedSize}` : `${selectedSize} см`);
    }
    if (selectedType) {
      extras.push(colorLabels[selectedType] || selectedType);
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
  const displaySpecs = specifications 
    ? Object.fromEntries(Object.entries(specifications).filter(([k]) => k !== 'available_sizes' && k !== 'available_types'))
    : null;
  
  // For products with variants, check if any variant is in stock
  // For products without variants, check the product stock
  const inStock = hasVariants 
    ? productVariants.some(v => v.stock > 0)
    : product.stock > 0;
  
  // Disable add to cart if variant product and no valid selection or out of stock
  const isAddToCartDisabled = hasVariants 
    ? (!selectedSize || !selectedType || !isSelectedVariantInStock)
    : !inStock;

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

            {/* Size Selection - Based on product variants */}
            {requiresSize && availableSizesFromVariants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  {product.subcategory === 'rings' ? 'Размер' : 'Дължина'}: <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizesFromVariants.map((size) => {
                    const sizeStock = selectedType ? getVariantStock(size, selectedType) : getSizeStock(size);
                    const isOutOfStock = sizeStock === 0;
                    const isSelected = selectedSize === size;
                    
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => { if (!isOutOfStock) { setSelectedSize(size); setQuantity(1); } }}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isOutOfStock
                              ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed line-through'
                              : 'bg-background border-border hover:border-primary'
                        }`}
                      >
                        {product.subcategory === 'rings' ? `Размер ${size}` : `${size} см`}
                        {isOutOfStock && ' (Изчерпан)'}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-destructive">Моля, изберете размер преди да добавите в количката</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Изборът на размер представлява индивидуална поръчка и не подлежи на връщане.
                </p>
              </div>
            )}

            {/* Color/Finish Selection - Based on product variants */}
            {requiresColor && availableColorsFromVariants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Цвят / Покритие: <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColorsFromVariants.map((color) => {
                    const colorStock = selectedSize ? getVariantStock(selectedSize, color) : getColorStock(color);
                    const isOutOfStock = colorStock === 0;
                    const isSelected = selectedType === color;
                    
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => { if (!isOutOfStock) { setSelectedType(color); setQuantity(1); } }}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isOutOfStock
                              ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed line-through'
                              : 'bg-background border-border hover:border-primary'
                        }`}
                      >
                        {colorLabels[color] || color}
                        {isOutOfStock && ' (Изчерпан)'}
                      </button>
                    );
                  })}
                </div>
                {!selectedType && (
                  <p className="text-xs text-destructive">Моля, изберете цвят преди да добавите в количката</p>
                )}
              </div>
            )}

            {/* Show selected variant stock status */}
            {hasVariants && selectedSize && selectedType && (
              <div className={`p-3 rounded-md text-sm ${
                isSelectedVariantInStock 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {isSelectedVariantInStock 
                  ? '✓ В наличност' 
                  : '✗ Изчерпана наличност за избрания вариант'}
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
                    onClick={() => {
                      const maxStock = hasVariants ? selectedVariantStock : product.stock;
                      if (quantity < maxStock) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={quantity >= (hasVariants ? selectedVariantStock : product.stock)}
                    className="px-3 py-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 btn-elevated bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={isAddToCartDisabled}
                >
                  Добави в количката
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 btn-elevated"
                  onClick={handleBuyNow}
                  disabled={isAddToCartDisabled}
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
