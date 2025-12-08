import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import categoryHandmade from "@/assets/category-handmade.jpg";
import categorySteel from "@/assets/category-steel.jpg";
import categorySilver from "@/assets/category-silver.jpg";
import categoryMoissanite from "@/assets/category-moissanite.jpg";
import { VideoSparkleOverlay } from "./VideoSparkleOverlay";
const categories = [
  {
    name: "Ръчна изработка",
    description: "Уникални авторски творби",
    image: categoryHandmade,
    href: "/category/handmade",
  },
  {
    name: "Неръждаема стомана",
    description: "Модерни и издръжливи",
    image: categorySteel,
    href: "/category/stainless-steel",
  },
  {
    name: "Сребро",
    description: "Вечна елегантност",
    image: categorySilver,
    href: "/category/silver",
  },
  {
    name: "Моасанит",
    description: "Блестящо сияние",
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
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      <VideoSparkleOverlay />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-foreground/95 px-8 py-4 rounded-sm"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-background">
              Разгледай по колекция
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground font-body max-w-md mx-auto"
          >
            Открийте нашите внимателно подбрани колекции, всяка със свой уникален характер
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div 
              key={category.name} 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Link
                to={category.href}
                className="group block relative aspect-square overflow-hidden rounded-sm"
              >
                <motion.img
                  src={category.image}
                  alt={`Колекция ${category.name} бижута`}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: index * 0.1 }}
                  whileHover={{ scale: 1.08 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-[hsl(220,60%,15%)] via-[hsl(220,50%,20%)/60%] to-transparent"
                  whileHover={{ opacity: 0.95 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <motion.h3 
                    className="font-heading text-xl font-semibold text-background mb-1"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    {category.name}
                  </motion.h3>
                  <motion.p 
                    className="font-body text-sm text-background/80"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    {category.description}
                  </motion.p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
