"use client";

import { useEffect } from "react";

import Navbar from "@/components/awal/Navbar";
import Hero from "@/components/awal/Hero";
import Features from "@/components/awal/Features";
import DashboardPreview from "@/components/awal/DashboardPreview";
import HowItWorks from "@/components/awal/HowItWorks";
import CTA from "@/components/awal/CTA";
import Footer from "@/components/awal/Footer";

export default function Home() {

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <HowItWorks />
      <Footer />
    </>
  );
}
