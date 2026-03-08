import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-primary font-body text-sm tracking-widest uppercase mb-4"
          >
            Нашата история
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl font-semibold mb-6"
          >
            Създадено със страст
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground font-body text-lg leading-relaxed mb-8"
          >
            От България, Arra Jewelry ви предлага внимателно подбрана селекция от красиви бижута. 
            Авторски ръчно изработени творби, както и специално селектирани модели от неръждаема стомана, 
            сребро и мойсанит – всяко изделие е избрано за своето качество и вечна красота.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="https://instagram.com/arra_jewelry_vt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-body font-medium hover:underline"
            >
              <Instagram className="w-5 h-5" />
              Последвай ни @arra_jewelry_vt
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
