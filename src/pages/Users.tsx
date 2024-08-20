import EditUserModal from "@/components/EditUserModal";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Settings } from "lucide-react";
import React, { useState } from "react";

interface User {
  _id: string;
  username: string;
  role: string;
  passwordChanged: boolean;
}

const fetchUsers = async (): Promise<User[]> => {
  const token = Cookies.get("token");
  const response = await fetch("https://crvo-back.onrender.com/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des utilisateurs.");
  }
  return response.json();
};

const Users: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.passwordChanged ? "Configuré" : "Non configuré").toLowerCase().includes(searchLower)
    );
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="flex flex-row gap-x-4 my-20 ml-8">
      <Nav />
      <div className="p-8 border rounded-l-lg flex-1 bg-primary">
        <h1>Liste des Clients</h1>
        <div className="flex flex-row justify-between pb-4 pt-8 sticky top-0 z-10 bg-white">
          <div className="flex flex-row gap-x-3">
            <Input
              placeholder="Recherche"
              className="text-sm"
              value={searchQuery}
              hasSearchIcon
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-[550px] overflow-y-auto">
            <table className="w-full border-gray-200">
              <thead className="bg-background sticky top-0 z-0">
                <tr className="text-left border-b">
                  <th className="py-3 px-6 w-[500px]">Client</th>
                  <th className="py-3 px-6 w-[500px] text-center">Mot de passe</th>
                  <th className="py-3 px-6 w-[300px] text-center">Paramètres</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-20">
                      <div className="flex items-center justify-center">
                        <Loader />
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">
                      Error: {error instanceof Error ? error.message : "Unknown error"}
                    </td>
                  </tr>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b last:border-b-0">
                      <td className="py-4 px-6">{user.username}</td>
                      <td
                        className={`py-4 px-6 text-center font-medium ${
                          user.passwordChanged ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.passwordChanged ? "Configuré" : "Non configuré"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-gray-600 hover:text-black"
                        >
                          <Settings size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      Aucune donnée disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <EditUserModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Users;
