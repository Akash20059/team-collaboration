import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Mission } from "@/components/site/Mission";
import { Gallery } from "@/components/site/Gallery";
import { About } from "@/components/site/About";
import { Cows } from "@/components/site/Cows";
import { Donate } from "@/components/site/Donate";
import { Products } from "@/components/site/Products";
import { Blog } from "@/components/site/Blog";
import { Connect } from "@/components/site/Connect";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const yOffset = -90; // offset for fixed navbar
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Mission />
        <Gallery />
        <About />
        <Cows />
        <Donate />
        <Products />
        <Blog />
        <Testimonials />
        <Connect />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Index;
