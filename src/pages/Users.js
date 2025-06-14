import React, { useEffect, useState } from "react";
import { get, _delete } from "../api/axios";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
} from "@windmill/react-ui";
import toast from "react-hot-toast";
import logo from '../assets/img/mainLogo.png';

import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import CreateUserModal from "../components/createusers";
import EditUserModal from "../components/EditUser";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]); // 👈 This is the key

  const fetchData = async () => {
    try {
      const [usersRes, zonesRes] = await Promise.all([
        get("/users/read/"),
        // get("/zone/list/"),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setZones(Array.isArray(zonesRes) ? zonesRes : []);
    } catch (err) {
      console.error("Error fetching users or zones:", err);
      setError("Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this User?"
      );

      if (confirmDelete) {
        await _delete(`/users/delete/${userId}/`);

        setUsers((prev) => prev.filter((user) => user.id !== userId));
        toast.success("User deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting User:", error);
      toast.error("Failed to delete User. Please try again.");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleMemberCreated = () => {
    setIsCreateModalOpen(false);

    setRefreshTrigger((prev) => prev + 1); // 🔁 Triggers the useEffect to call fetchData
  };
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const renderUserZones = (user) => {
    return Array.isArray(user.zones) && user.zones.length > 0
      ? user.zones
        .map((zid) => zones.find((z) => z.id === zid)?.name || "Unknown")
        .join(", ")
      : "—";
  };

  return (
    <div className="relative w-full px-4 py-6">

      {/* Content Overlay */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold  dark:text-white">
            User Management
          </h2>

          <button
            onClick={handleCreate}
            className="flex items-center bg-purple-600 text-white rounded-lg"
            style={{
              fontSize: window.innerWidth < 768 ? "0.875rem" : "1rem",
              padding: window.innerWidth < 768 ? "0.5rem 1rem" : "0.75rem 1rem",
            }}
          >
            <AiOutlinePlusCircle
              className={`mr-1 ${window.innerWidth < 768 ? "w-3 h-3" : "w-4 h-4"
                }`}
            />
            Create User
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
           <>
          <TableContainer className="hidden md:block mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Name</TableCell>
                  <TableCell>ITS</TableCell>
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {Array.isArray(users) && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => handleEdit(user)}
                          >
                            <AiOutlineEdit className="w-5 h-5" />
                          </Button>
                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => handleDelete(user.id)}
                          >
                            <AiOutlineDelete className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>


                    <div className="md:hidden space-y-3">
                      {users.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-700 dark:text-gray-300">No city items found</p>
                        </div>
                      ) : (
                        users.map((user, index) => (
                          <div 
                            key={user.id} 
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded">
                                    #{user.id }
                                  </span>
                                </div>
                                <h3 className="font-medium text-lg dark:text-white">{user.first_name} {user.last_name}</h3>
<p className="font-medium dark:text-white truncate">{user.username}</p>

                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEdit(user)}
                                  className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 p-1 rounded"
                                >
                                  <AiOutlineEdit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 p-1 rounded"
                                >
                                  <AiOutlineDelete className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
           </>
        )} 
        {/* Create Member Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          onUserCreated={handleMemberCreated}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={() => setRefreshTrigger((prev) => prev + 1)}
          userData={selectedUser}
        />
      </div>
    </div>
  );
};

export default UserManagement;
