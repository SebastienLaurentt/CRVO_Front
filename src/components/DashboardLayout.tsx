import React from "react";
import Nav from "./Nav";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="flex-1 p-6 3xl:mx-auto 3xl:w-[2000px] 3xl:gap-x-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
