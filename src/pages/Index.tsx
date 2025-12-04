import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AboutSection } from "@/components/AboutSection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <CategoryGrid />
      <AboutSection />
    </Layout>
  );
};

export default Index;