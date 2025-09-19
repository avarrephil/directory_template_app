"use client";

import Navbar from "@/app/components/public/Navbar";
import HeroSection from "@/app/components/public/HeroSection";
import ByStateSection from "@/app/components/public/ByStateSection";
import ByCitiesSection from "@/app/components/public/ByCitiesSection";
import Footer from "@/app/components/public/Footer";
import HomepageDataWrapper from "@/app/components/HomepageDataWrapper";

export default function HomePage() {
  return (
    <HomepageDataWrapper>
      <main className="min-h-screen">
        <Navbar />
        <HeroSection />
        <ByStateSection />
        <ByCitiesSection />
        <Footer />
      </main>
    </HomepageDataWrapper>
  );
}
