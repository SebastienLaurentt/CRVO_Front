import React from "react";
import Nav from "./Nav";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="mx-auto flex min-h-screen flex-row items-center py-12 2xl:w-[1800px] 2xl:gap-x-8">
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
