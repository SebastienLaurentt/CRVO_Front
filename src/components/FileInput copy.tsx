import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

type ExcelRow = {
  client: string | null;
  immatriculation: string | null;
  modele: string | null;
  joursDepuisReception: number | null;
};

const FileInput: React.FC = () => {
  const [data, setData] = useState<ExcelRow[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | null)[][];

      const filteredData: ExcelRow[] = sheetData
        .slice(1)  // Ignore the first row (header)
        .map(row => ({
          client: (row[1] as string)?.trim() || null,
          immatriculation: (row[2] as string)?.trim() || null,
          modele: (row[3] as string)?.trim() || null,
          joursDepuisReception: typeof row[13] === 'number' ? row[13] : null,
        }))
        .filter(row => row.client || row.immatriculation || row.modele || row.joursDepuisReception !== null);

      setData(filteredData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDataSubmit = () => {
    data.forEach(vehicle => {
      fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: vehicle.client,
          password: 'motdepasse',  // Mot de passe par défaut
          immatriculation: vehicle.immatriculation,
          modele: vehicle.modele,
          joursDepuisReception: vehicle.joursDepuisReception,
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    });
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {data.length > 0 && (
        <div>
          <table>
            <thead>
              <tr className='text-left'>
                <th className='px-4'>Client</th>
                <th className='px-4'>Immatriculation</th>
                <th className='px-4'>Modèle</th>
                <th className='px-4'>Jours depuis Reception</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className='px-4'>{row.client}</td>
                  <td className='px-4'>{row.immatriculation}</td>
                  <td className='px-4'>{row.modele}</td>
                  <td className='px-4'>{row.joursDepuisReception}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleDataSubmit}>Envoyer les Données</button>
        </div>
      )}
    </div>
  );
};

export default FileInput;
