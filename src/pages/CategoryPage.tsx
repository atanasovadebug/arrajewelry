import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { SubcategoryNav } from "@/components/SubcategoryNav";
import { Instagram } from "lucide-react";

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
    title: "Моасанит",
    description: "Блестящи камъни с изключителен блясък и огън",
  },
};

const subcategoryNames: Record<string, string> = {
  rings: "пръстени",
  earrings: "обеци",
  necklaces: "колиета",
  bracelets: "гривни",
};

export default function CategoryPage() {
  const { category, subcategory } = useParams();
  const info = categoryInfo[category || ""] || {
    title: "Колекция",
    description: "Разгледайте нашата красива колекция бижута",
  };

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

          {/* Placeholder for products */}
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
        </div>
      </section>
    </Layout>
  );
}
