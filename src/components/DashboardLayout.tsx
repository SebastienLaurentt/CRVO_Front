import React from "react";
import Nav from "./Nav";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="ml-[240px] p-6 2xl:ml-[360px] 3xl:mx-auto 3xl:w-[2000px] 3xl:gap-x-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
