import React from "react";

type LoaderProps = {
  isButtonSize?: boolean;
};

const Loader: React.FC<LoaderProps> = ({ isButtonSize = false }) => {
  const size = isButtonSize ? "size-6" : "size-10";

  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-200 border-t-foreground ${size}`}
    />
  );
};

export default Loader;
