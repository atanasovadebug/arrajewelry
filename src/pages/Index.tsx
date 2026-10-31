import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AboutSection } from "@/components/AboutSection";
import { BlackFridayBanner } from "@/components/BlackFridayBanner";

const Index = () => {
  return (
    <Layout>
      <BlackFridayBanner />
      <Hero />
      <CategoryGrid />
      <AboutSection />
    </Layout>
  );
};


export default Index;
