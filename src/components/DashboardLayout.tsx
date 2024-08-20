import React from "react";
import Nav from "./Nav";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-row py-12 items-center min-h-screen">
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
