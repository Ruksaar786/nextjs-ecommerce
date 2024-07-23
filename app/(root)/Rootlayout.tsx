import React from "react";

const Rootlayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>
    <h1>Navbar</h1>
    {children}
    <h2>Footer</h2>
    </div>;
};

export default Rootlayout;
