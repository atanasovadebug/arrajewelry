import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-jewelry.jpg";
import { SparkleEffect } from "./SparkleEffect";
import { VideoSparkleOverlay } from "./VideoSparkleOverlay";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImage}
          alt="Елегантна колекция бижута с пръстени и колиета"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
      </div>

      {/* Video Sparkle Overlay */}
      <VideoSparkleOverlay />
      
      {/* Falling Sparkles Effect */}
      <SparkleEffect />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-primary font-body text-sm tracking-widest uppercase mb-4"
          >
            Arra Jewelry • България
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6"
          >
            Вечна елегантност,{" "}
            <span className="italic text-primary">избрана за вас</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-lg text-muted-foreground mb-8 leading-relaxed"
          >
            Открийте внимателно подбрана колекция от бижута – авторски ръчно изработени творби и изискани модели от неръждаема стомана, сребро и мойсанит.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/category/handmade"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-sm hover:bg-primary/90 transition-colors group"
            >
              Разгледай колекцията
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://instagram.com/arra_jewelry_vt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 font-body font-medium rounded-sm hover:bg-foreground/5 transition-colors"
            >
              Последвай в Instagram
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
