import EditUserModal from "@/components/EditUserModal";
import Loader from "@/components/Loader";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Settings } from "lucide-react";
import React, { useState } from "react";

interface User {
  _id: string;
  username: string;
  role: string;
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
  const data = await response.json();
  return data;
};

const Users: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center mt-60">
        <Loader />
      </div>
    );

  if (isError)
    return (
      <p>Error: {error instanceof Error ? error.message : "Unknown error"}</p>
    );

  return (
    <div className="flex flex-col items-center py-8 px-12">
      <div className="py-8 px-12 border rounded-lg shadow-2xl">
        <h1 className="mb-6">Liste des Clients</h1>
        <table className="border-gray-200">
          <thead>
            <tr className="text-left bg-primary border-b">
              <th className="py-3 px-6 w-[400px]">Client</th>
              <th className="py-3 px-6 w-[200px]">Rôle</th>
              <th className="py-3 px-6 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-4 px-6">{user.username}</td>
                  <td className="py-4 px-6">{user.role}</td>
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

      {selectedUser && (
        <EditUserModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Users;
