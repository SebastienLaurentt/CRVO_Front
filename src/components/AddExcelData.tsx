import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

type ExcelRow = {
  client: string | null;
  immatriculation: string | null;
  modele: string | null;
  dateCreation: Date | null;
  mecanique: boolean; 
  carrosserie: boolean; 
  ct: boolean; 
  dsp: boolean; 
  jantes: boolean; 
};

interface FileInputProps {
  onClose: () => void;
};

const deleteExistingData = async () => {
  const response = await fetch("https://crvo-back.onrender.com/api/cleanup", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete existing data");
  }

  return response.json();
};

const uploadVehicleData = async (vehicle: ExcelRow) => {
  const response = await fetch("https://crvo-back.onrender.com/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: vehicle.client,
      password: "motdepasse",
      immatriculation: vehicle.immatriculation,
      modele: vehicle.modele,
      dateCreation: vehicle.dateCreation,
      mecanique: vehicle.mecanique,
      carrosserie: vehicle.carrosserie,
      ct: vehicle.ct,
      dsp: vehicle.dsp,
      jantes: vehicle.jantes,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload vehicle data");
  }

  return response.json();
};

// Fonction pour convertir un numéro de série Excel en Date avec inversion des jours et mois
const excelDateToJSDate = (serial: number): Date => {
  // Excel utilise le 30 décembre 1899 comme point de départ pour les dates
  const epoch = new Date(Date.UTC(1899, 11, 30)); // 30 décembre 1899
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial - days) * 86400000); // Fraction du jour en millisecondes

  // Calculer la date de base
  const baseDate = new Date(epoch.getTime() + days * 86400000 + milliseconds);

  // Récupérer le jour, le mois et l'année de la date de base
  const day = baseDate.getUTCDate();
  const month = baseDate.getUTCMonth(); // Les mois sont indexés de 0 à 11
  const year = baseDate.getUTCFullYear();

  // Créer une nouvelle date avec jour et mois inversés
  // Les mois en JavaScript sont indexés de 0 à 11, donc on ajuste cela pour obtenir le mois correct
  const correctedDate = new Date(Date.UTC(year, day - 1, month + 1)); // Inverser jour et mois

  console.log(`Converted Excel serial ${serial} to base date ${baseDate.toISOString()}`);
  console.log(`Corrected Excel serial ${serial} to date ${correctedDate.toISOString()}`);

  return correctedDate;
};

// Fonction améliorée pour convertir une chaîne de date ou un numéro de série en objet Date
const convertToDate = (value: string | number): Date | null => {
  if (typeof value === 'number') {
    // Traiter les dates sérielles avec inversion des jours et mois
    const date = excelDateToJSDate(value);
    console.log(`Converted Excel serial ${value} to date ${date.toISOString()}`);
    return date;
  }

  const dateString = String(value).trim();
  console.log(`Processing date string: ${dateString}`);

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    // Traitement des chaînes de dates en format DD/MM/YYYY
    const [day, month, year] = dateString.split("/");
    const date = new Date(`${year}-${month}-${day}`); // Format ISO 8601
    console.log(`Converted string ${dateString} to date ${date.toISOString()}`);
    return date;
  }

  console.error(`Invalid date format: ${value}`);
  return null;
};

const AddExcelData: React.FC<FileInputProps> = ({ onClose }) => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

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
  
      console.log('Raw sheet data:', sheetData);
  
      const filteredData: ExcelRow[] = sheetData
        .slice(1)
        .map((row) => ({
          client: row[1] ? String(row[1]).trim() : null,
          immatriculation: row[2] ? String(row[2]).trim() : null,
          modele: row[3] ? String(row[3]).trim() : null,
          dateCreation: row[8] ? convertToDate(row[8]) : null,
          mecanique: String(row[15]).trim().toLowerCase() === 'oui',
          carrosserie: String(row[16]).trim().toLowerCase() === 'oui',
          ct: String(row[17]).trim().toLowerCase() === 'oui',
          dsp: String(row[18]).trim().toLowerCase() === 'oui',
          jantes: String(row[19]).trim().toLowerCase() === 'oui',
        }))
        .filter((row) =>
          row.client || row.immatriculation || row.modele || row.dateCreation
        );
  
      console.log('Filtered data:', filteredData);
  
      setData(filteredData);
    };
  
    reader.readAsArrayBuffer(file);
  };

  const queryClient = useQueryClient();

  const { mutate: uploadVehicles, isPending } = useMutation({
    mutationFn: async () => {
      await deleteExistingData();
      const promises = data.map((vehicle) => uploadVehicleData(vehicle));
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({ title: "Données mises à jour avec succès !" });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour des données",
        description: (error as Error).message,
      });
    },
  });

  const handleDataSubmit = () => {
    uploadVehicles();
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
              <span className="font-bold">Fichier sélectionné :</span>{" "}
              {fileName}
            </span>
          ) : (
            <span className="mt-2 text-destructive text-center font-bold">
              Aucun fichier sélectionné
            </span>
          )}

          <Button
            className="mt-3"
            onClick={handleDataSubmit}
            disabled={!fileName || isPending}
          >
            {isPending ? "Chargement..." : "Mettre à jour"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExcelData;
