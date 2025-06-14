import React, { useState, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { get, _delete, uploadFormData } from "../api/axios";
import { FaUpload, FaPlus } from "react-icons/fa";

import {
  AiOutlineArrowLeft,
  AiOutlineDown,
  AiOutlineDelete,
} from "react-icons/ai";
import toast from "react-hot-toast";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
} from "@windmill/react-ui";
import CreateMiqaatMenuModal from "../components/CreateMiqaatMenuModal";
import logo from '../assets/img/mainLogo.png';

function MiqaatMenu() {
  const { id } = useParams();
  const history = useHistory();

  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchMiqaatMenuData();
  }, [id]);

  const fetchMiqaatMenuData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get(`/miqaat-menu/${id}/`);
      setMenuData(response);
    } catch (err) {
      console.error("Error fetching menu data:", err);
      setError("Failed to load menu data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this menu item?"
      );

      if (confirmDelete) {
        await _delete(`/miqaat-menu/${menuItemId}/`);

        setMenuData((prevData) => ({
          ...prevData,
          miqaat_menu: prevData.miqaat_menu.filter(
            (item) => item.id !== menuItemId
          ),
        }));

        toast.success("Menu item deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item. Please try again.");
    }
  };

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddMenu = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleMenuCreated = () => {
    fetchMiqaatMenuData();
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const existingMenuItems =
    menuData?.miqaat_menu?.map((item) => ({
      menu_id: item.menu_id,
      menu_name: item.menu_name,
    })) || [];

  const fileInputRef = useRef(null);

  const handleMenuCSVUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadFormData("/upload-menu", formData);

      if (res.message) {
        toast.success(res.data.message);
      }
      fetchMiqaatMenuData();

      if (res.data?.errors?.length) {
        const errorMessages = res.data.errors
          .map((err) => `Row ${err.row}: ${err.error}`)
          .join("\n");

        toast.error(`⚠️ Errors:\n${errorMessages}`, { duration: 8000 });
        console.warn("CSV upload issues:", res.data.errors);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => `Row ${err.row}: ${err.error}`)
          .join("\n");

        toast.error(`⚠️ Upload failed:\n${errorMessages}`, { duration: 8000 });
      } else {
        toast.error("❌ Upload failed: " + (error.message || "Unknown error"));
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };
  return (
      <div className="relative w-full px-4 py-6">
            {/* Watermark Logo */}
        <img
          src={logo}
          alt="Watermark"
          className="absolute pointer-events-none select-none"
          style={{
            top: "50%",
            left: "50%",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            width: "70vw",
            maxWidth: "400px",
            height: "auto",
            opacity: 0.05,
            zIndex: 0,
          }}
        />
        
            {/* Content Overlay */}
            <div className="relative z-10">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button onClick={handleBackClick} className="mr-4">
            <AiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1
            style={{
              fontSize: window.innerWidth < 768 ? "1.25rem" : "1.5rem",
            }}
            className="font-semibold dark:text-white"
          >
            Miqaat Menu
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto"
            onClick={handleAddMenu}
          >
            <FaPlus className="mr-2" /> Create
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-4 py-2 rounded flex items-center justify-center w-full sm:w-[10px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload className="mr-2" /> Upload CSV
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleMenuCSVUpload}
            className="hidden"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700 dark:text-300">Loading data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMiqaatMenuData}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <TableContainer className="hidden md:block mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>MENU NAME</TableCell>
                  <TableCell>DESCRIPTION</TableCell>
                  <TableCell className="text-right">ACTIONS</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {menuData?.miqaat_menu?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {item.menu_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.description}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <AiOutlineDelete className="h-4 w-4 inline-block" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile View - Card Based Layout */}
          <div className="md:hidden space-y-3">
            {!menuData?.miqaat_menu || menuData.miqaat_menu.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-400">
                  No menu items found
                </p>
              </div>
            ) : (
              menuData.miqaat_menu.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 dark:bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
                        {index + 1}
                      </div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {item.menu_name}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <AiOutlineDown
                        className={`h-4 w-4 transition-transform ${
                          expandedItem === item.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {expandedItem === item.id && (
                    <div className="px-4 pb-4 pt-0 border-t dark:border-gray-700">
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Description:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {item.menu_description}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-white px-4 py-1 rounded-md bg-red-600 hover:bg-red-700 flex items-center"
                        >
                          <AiOutlineDelete className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {isModalOpen && (
        <CreateMiqaatMenuModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          miqaatId={id}
          onSuccess={handleMenuCreated}
          existingMenuItems={existingMenuItems}
        />
      )}
    </div>
    </div>
  );
}

export default MiqaatMenu;
