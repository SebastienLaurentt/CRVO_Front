import { Trash2 } from "lucide-react";

const FileDisplay = ({
  fileName,
  handleRemove,
  label,
}: {
  fileName: string | null;
  handleRemove: () => void;
  label: string;
}) => (
  <div className="flex flex-row items-center justify-between">
    <span>
      <span className="font-bold">{label}</span>
      {fileName ? (
        <>{fileName}</>
      ) : (
        <span className="text-red-500">Aucun fichier sélectionné</span>
      )}
    </span>
    {fileName && (
      <button
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 />
      </button>
    )}
  </div>
);

export default FileDisplay;
