import Cookies from "js-cookie";
import { Files, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";

type User = {
  _id: string;
  username: string;
  role: string;
};

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose }) => {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isTextareaEnabled, setTextareaEnabled] = useState(false);

  const handleSave = async () => {
    if (user) {
      try {
        const token = Cookies.get("token");
        const response = await fetch(
          `https://crvo-back.onrender.com/api/users/${user._id}/password`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              newPassword: password,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du mot de passe.");
        }

        const updatedMessage = `Bonjour Mr ${username},\n\nVoici vos identifiants pour vous connecter sur la plateforme CRVO :\n\nNom d'utilisateur : ${username}\nMot de passe : ${password}\n\nBien Cordialement,\n\nDamien Jouve,`;

        setMessage(updatedMessage);
        setTextareaEnabled(true);

        toast({ title: "Mot de passe mis à jour avec succès" });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur lors de la mise à jour du mot de passe",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message)
      .then(() => {
        toast({ title: "Message copié dans le presse-papiers" });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Erreur lors de la copie",
          description: error instanceof Error ? error.message : "Unknown error",
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
        <h2 className="text-lg font-bold mb-4">Modifier le mot de passe</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <Label>Nom d'utilisateur</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded px-4 py-2 mt-1"
              placeholder="Nom d'utilisateur"
              disabled
            />
          </div>
          <div>
            <Label className="mb-1">Nouveau mot de passe</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-4 py-2 mt-1"
              placeholder="Nouveau mot de passe"
            />
          </div>

          <Button onClick={handleSave}>Sauvegarder</Button>

          <div className="">
            <div className="relative mt-6">
              <Label>Email Client</Label>
              <Textarea
                value={message}
                rows={12}
                className="w-full border rounded px-4 py-2 mt-1"
                placeholder="Le message s'affichera ici après la sauvegarde"
                disabled={!isTextareaEnabled}
              />
              {isTextareaEnabled && (
                <button
                  onClick={handleCopy}
                  className="absolute top-10 right-3 text-gray-600 hover:text-black"
                >
                  <Files  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
