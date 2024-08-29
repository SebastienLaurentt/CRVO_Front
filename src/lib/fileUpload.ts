import * as XLSX from "xlsx";
import { toast } from "../components/ui/use-toast";

export const handleFileUpload = <T>(
  e: React.ChangeEvent<HTMLInputElement>,
  isValidFile: (sheetData: (string | number | null)[][]) => boolean,
  setFileName: React.Dispatch<React.SetStateAction<string | null>>,
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  setIsValidFile: React.Dispatch<React.SetStateAction<boolean>>,
  mapData: (sheetData: (string | number | null)[][]) => T[],
  invalidFileToastTitle: string
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setFileName(file.name);

  const reader = new FileReader();

  reader.onload = (event: ProgressEvent<FileReader>) => {
    const arrayBuffer = event.target?.result;
    if (!arrayBuffer) return;

    const data = new Uint8Array(arrayBuffer as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
      | string
      | number
      | null
    )[][];

    if (!isValidFile(sheetData)) {
      setIsValidFile(false);
      toast({
        variant: "destructive",
        title: invalidFileToastTitle,
      });
      return;
    }

    setIsValidFile(true);

    const fileData = mapData(sheetData);
    setData(fileData);
  };

  reader.readAsArrayBuffer(file);
};
