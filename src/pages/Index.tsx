import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AboutSection } from "@/components/AboutSection";
import { PromoPopup } from "@/components/PromoPopup";

const Index = () => {
  return (
    <Layout>
      <PromoPopup />
      <Hero />
      <CategoryGrid />
      <AboutSection />
    </Layout>
  );
};

export default Index;