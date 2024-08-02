import React from "react";
import Header from "@/components/ui/shared/Header";
import Footer from "@/components/ui/shared/Footer";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 wrapper">{children}</main>
      <Footer />
    </div>
  );
};

export default RootLayout;
