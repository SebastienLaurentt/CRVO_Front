import React from "react";
import Nav from "./Nav";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen flex-row items-center py-12">
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
