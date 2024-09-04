import DashboardHeader from "@/components/DashboardHeader";
import EditUserModal from "@/components/EditUserModal";
import Loader from "@/components/Loader";
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
  downloadUrl: string;
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

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.passwordChanged ? "Configuré" : "Non configuré")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Liste Clients"
        count={filteredUsers?.length || 0}
        isClient
      />
      <div className="sticky top-0 z-10 flex flex-row justify-between bg-white px-8 pb-4 pt-8">
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
        <div className="h-[400px] overflow-y-auto px-8 2xl:h-[550px]">
          <table className="w-full border-gray-200">
            <thead className="sticky top-0 z-0 bg-background">
              <tr className="border-b text-left">
                <th className="w-[500px] px-6 py-3">Client</th>
                <th className="w-[500px] px-6 py-3 text-center">
                  Informations
                </th>
                <th className="w-[300px] px-6 py-3 text-center">Paramètres</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    Error:{" "}
                    {error instanceof Error ? error.message : "Unknown error"}
                  </td>
                </tr>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">{user.username}</td>
                    <td
                      className={`px-6 py-4 text-center font-medium ${
                        user.passwordChanged ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {user.passwordChanged ? "Configurées" : "Non configurées"}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                  <td colSpan={3} className="py-4 text-center">
                    Aucune donnée disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <EditUserModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Users;
