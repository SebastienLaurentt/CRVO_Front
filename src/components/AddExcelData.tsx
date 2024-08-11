import { X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";

type ExcelRow = {
  client: string | null;
  immatriculation: string | null;
  modele: string | null;
  joursDepuisReception: number | null;
};

interface FileInputProps {
  onClose: () => void;
}

const AddExcelData: React.FC<FileInputProps> = ({ onClose }) => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null); // Ajouter un état pour le nom du fichier

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
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

      const filteredData: ExcelRow[] = sheetData
        .slice(1)
        .map((row) => ({
          client: (row[1] as string)?.trim() || null,
          immatriculation: (row[2] as string)?.trim() || null,
          modele: (row[3] as string)?.trim() || null,
          joursDepuisReception: typeof row[13] === "number" ? row[13] : null,
        }))
        .filter(
          (row) =>
            row.client ||
            row.immatriculation ||
            row.modele ||
            row.joursDepuisReception !== null
        );

      setData(filteredData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDataSubmit = () => {
    data.forEach((vehicle) => {
      fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: vehicle.client,
          password: "motdepasse",
          immatriculation: vehicle.immatriculation,
          modele: vehicle.modele,
          joursDepuisReception: vehicle.joursDepuisReception,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-lg">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="flex flex-col">
          <FileUploader onChange={handleFileUpload} />

          {fileName ? (
            <span className="mt-2 text-gray-700 flex flex-col items-center">
              <span className="font-bold">Fichier sélectionné :</span> {fileName}
            </span>
          ) : (
            <span className="mt-2 text-destructive text-center font-bold">
              Aucun fichier sélectionné
            </span>
          )}

          <Button
            className="mt-3"
            onClick={handleDataSubmit}
            disabled={!fileName}  
          >
            Mettre à jour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExcelData;
