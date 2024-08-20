import React from "react";
import Nav from "./Nav";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-row">
      <Nav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
