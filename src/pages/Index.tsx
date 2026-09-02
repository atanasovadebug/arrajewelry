import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AboutSection } from "@/components/AboutSection";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

const Index = () => {
  return (
    <Layout>
      <AnnouncementBanner />
      <Hero />
      <CategoryGrid />
      <AboutSection />
    </Layout>

  );
};

export default Index;