
import { FileUp } from "lucide-react";
import { ChangeEvent } from "react";
import { Label } from "./ui/label";

interface FileUploaderProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader = ({ onChange }: FileUploaderProps) => {
  return (
    <div className="space-y-1 text-left">
      <Label>
        <div className="flex h-40 mt-12 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-slate-50 ">
          <FileUp size={56} />
          <span className="mx-auto mt-3 w-[260px] text-center text-sm leading-5">
            <span className="font-bold">Cliquer</span>  pour importer votre nouveau fichier excel
          </span>
        </div>
        <input type="file" onChange={onChange} className="hidden" />
      </Label>
    </div>
  );
};

export default FileUploader;
