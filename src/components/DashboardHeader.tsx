import React from "react";

interface DashboardHeaderProps {
  title: string;
  count?: number;
  isClient?: boolean; 
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, count, isClient = false }) => {
  const label = isClient ? "Clients" : "Véhicules";

  return (
    <div className="rounded-tl-lg bg-black p-8 text-white">
      <h1 className="mb-2">{title}</h1>
      {count !== undefined && count > 0 && (
        <span className="text-md font-semibold italic">
          {count} {label}
        </span>
      )}
    </div>
  );
};

export default DashboardHeader;
