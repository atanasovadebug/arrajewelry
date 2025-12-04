import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import categoryHandmade from "@/assets/category-handmade.jpg";
import categorySteel from "@/assets/category-steel.jpg";
import categorySilver from "@/assets/category-silver.jpg";
import categoryMoissanite from "@/assets/category-moissanite.jpg";

const categories = [
  {
    name: "Handmade",
    description: "Artisan crafted with love",
    image: categoryHandmade,
    href: "/category/handmade",
  },
  {
    name: "Stainless Steel",
    description: "Modern & durable",
    image: categorySteel,
    href: "/category/stainless-steel",
  },
  {
    name: "Silver",
    description: "Timeless elegance",
    image: categorySilver,
    href: "/category/silver",
  },
  {
    name: "Moissanite",
    description: "Brilliant sparkle",
    image: categoryMoissanite,
    href: "/category/moissanite",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl md:text-4xl font-semibold mb-4"
          >
            Shop by Collection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground font-body max-w-md mx-auto"
          >
            Explore our carefully curated collections, each with its own unique character
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={itemVariants}>
              <Link
                to={category.href}
                className="group block relative aspect-square overflow-hidden rounded-sm"
              >
                <img
                  src={category.image}
                  alt={`${category.name} jewelry collection`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="font-heading text-xl font-semibold text-background mb-1">
                    {category.name}
                  </h3>
                  <p className="font-body text-sm text-background/80">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}