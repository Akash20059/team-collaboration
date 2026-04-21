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

const Index = () => {
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
