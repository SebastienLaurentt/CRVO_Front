import React from "react";

interface DashboardHeaderProps {
  title: string;
  count?: number;
  isClient?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  count,
  isClient = false,
}) => {
  const label = isClient ? "Clients" : "Véhicules";

  return (
    <div className="rounded-tl-lg bg-black px-8 py-6 text-white 2xl:p-8">
      <h1 className="mb-2">{title}</h1>
      <span className="text-md font-semibold italic">
        {count !== undefined && count > 0 ? (
          `${count} ${label}`
        ) : (
          <span className="invisible">0 {label}</span>
        )}
      </span>
    </div>
  );
};

export default DashboardHeader;
