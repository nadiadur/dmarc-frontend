import Navbar from "@/components/awal/Navbar";
import Footer from "@/components/awal/Footer";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-screen">{children}</div>
      <Footer />
    </>
  );
}