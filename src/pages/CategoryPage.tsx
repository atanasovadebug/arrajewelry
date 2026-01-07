import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { SubcategoryNav } from "@/components/SubcategoryNav";
import { Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDualCurrency } from "@/lib/currency";

const categoryInfo: Record<string, { title: string; description: string }> = {
  handmade: {
    title: "Ръчна изработка",
    description: "Уникални авторски бижута, изработени с внимание към детайла",
  },
  "stainless-steel": {
    title: "Неръждаема стомана",
    description: "Модерни и издръжливи бижута, създадени да издържат теста на времето",
  },
  silver: {
    title: "Сребърна колекция",
    description: "Класически сребърни бижута за вечна елегантност",
  },
  moissanite: {
    title: "Мойсанит",
    description: "Блестящи камъни с изключителен блясък и огън",
  },
};

const subcategoryNames: Record<string, string> = {
  rings: "пръстени",
  earrings: "обеци",
  necklaces: "колиета",
  bracelets: "гривни",
};

// Map URL slugs to database category values
const categorySlugToDb: Record<string, string> = {
  handmade: "handmade",
  "stainless-steel": "stainless-steel",
  silver: "silver",
  moissanite: "moissanite",
};

export default function CategoryPage() {
  const { category, subcategory } = useParams();
  const info = categoryInfo[category || ""] || {
    title: "Колекция",
    description: "Разгледайте нашата красива колекция бижута",
  };

  const dbCategory = categorySlugToDb[category || ""] || category;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", dbCategory, subcategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("category", dbCategory)
        .eq("is_active", true);

      if (subcategory) {
        query = query.eq("subcategory", subcategory);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const basePath = `/category/${category}`;
  const subcategoryLabel = subcategory ? subcategoryNames[subcategory] || subcategory : "колекцията";

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-3">
              {info.title}
            </h1>
            <p className="text-muted-foreground font-body max-w-md mx-auto">
              {info.description}
            </p>
          </motion.div>

          {/* Subcategory Navigation */}
          <SubcategoryNav basePath={basePath} />

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary/50 rounded-sm mb-3" />
                  <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary/50 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="group block"
                  >
                    <div className="aspect-square overflow-hidden rounded-sm bg-secondary/30 mb-3">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-body font-medium text-sm md:text-base group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="font-heading font-semibold text-primary text-sm">
                        {formatDualCurrency(Number(product.price))}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatDualCurrency(Number(product.original_price))}
                        </span>
                      )}
                    </div>
                    {product.stock <= 0 && (
                      <span className="text-xs text-red-500 mt-1">Изчерпан</span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-20 bg-secondary/30 rounded-sm"
            >
              <div className="max-w-md mx-auto">
                <h3 className="font-heading text-xl font-medium mb-3">
                  Очаквайте скоро
                </h3>
                <p className="text-muted-foreground font-body mb-6">
                  Нашите {subcategoryLabel} се подготвят. 
                  Посетете нашия Instagram за налични бижута!
                </p>
                <a
                  href="https://instagram.com/arra_jewelry_vt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-sm hover:bg-primary/90 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  Пазарувай в Instagram
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
