import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaUpload,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { post, get, _delete, uploadFormData, downloadBlob } from "../api/axios";
import toast from "react-hot-toast";
import { useModal } from "../context/ModalContext";
import logo from '../assets/img/mainLogo.png';

import { AiOutlineArrowLeft } from "react-icons/ai";
import { Button, Input, Label } from "@windmill/react-ui";

function Tables() {
  const location = useLocation();
  const history = useHistory();
  const { modalState, openModal, closeModal, clearModalState } = useModal();

  const queryParams = new URLSearchParams(location.search);
  const miqaatType = queryParams.get("miqaat_type");

  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showThaalsModal, setShowThaalsModal] = useState(false);
  const [selectedThaals, setSelectedThaals] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToSend, setEmailToSend] = useState("");
  const [targetMiqaatId, setTargetMiqaatId] = useState(null);
  const [sending, setSending] = useState(false);
  const prevMiqaatTypeRef = useRef();
  const fetchingRef = useRef(false);
  const initialRenderRef = useRef(true);
  const prevLocationKeyRef = useRef(location.key); // Track location changes

  const resultsPerPage = 10;
  const [isAdmin, setIsAdmin] = useState(false);

  const getPageTitle = () => {
    switch (miqaatType) {
      case "general_miqaats":
        return "General Miqaats";
      case "ramadan":
        return "Ramadan";
      case "private_events":
        return "Private Events";
      default:
        return "Miqaats";
    }
  };

  const fetchMiqaatData = async (page, type) => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setIsLoading(true);

    try {
      let url = "/miqaat/filter/";
      if (type) {
        url += `?miqaat_type=${type}`;
      }

      const response = await get(url);

      if (response && Array.isArray(response)) {
        setTableData(
          response.slice((page - 1) * resultsPerPage, page * resultsPerPage)
        );
        setTotalResults(response.length);
      } else {
        console.error("Unexpected response format:", response);
        setTableData([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Error fetching miqaat data:", error);
      setTableData([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    const shouldFetch =
      initialRenderRef.current || prevMiqaatTypeRef.current !== miqaatType;

    if (shouldFetch && !fetchingRef.current) {
      initialRenderRef.current = false;

      if (prevMiqaatTypeRef.current !== miqaatType) {
        setCurrentPage(1);
      }

      prevMiqaatTypeRef.current = miqaatType;
      fetchZones();
      setTimeout(() => {
        fetchMiqaatData(1, miqaatType);
      }, 0);
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setIsAdmin(user?.is_admin === true);
    } catch (err) {
      console.error("Error parsing is_admin from localStorage:", err);
    }
  }, [miqaatType]);

  // Handle modal state when navigating to Tables
  useEffect(() => {
    // Only proceed if the location has actually changed
    if (location.key === prevLocationKeyRef.current) {
      return;
    }

    prevLocationKeyRef.current = location.key;

    const isMobileView = window.innerWidth < 768;

    if (isMobileView) {
      if (
        modalState.fromFeatureModal &&
        modalState.selectedEvent &&
        !modalState.isDialogOpen
      ) {
        openModal(modalState.selectedEvent, true);
      } else if (modalState.isDialogOpen && !modalState.fromFeatureModal) {
        closeModal();
      }
    } else if (modalState.isDialogOpen) {
      closeModal();
    }
  }, [
    location.key,
    modalState.fromFeatureModal,
    modalState.selectedEvent,
    modalState.isDialogOpen,
    openModal,
    closeModal,
  ]);

  const onPageChange = (p) => {
    if (p !== currentPage && !fetchingRef.current) {
      setCurrentPage(p);
      setTimeout(() => {
        fetchMiqaatData(p, miqaatType);
      }, 0);
    }
  };

  const handleCreateClick = () => {
    if (miqaatType) {
      history.push(`/app/forms?miqaat_type=${miqaatType}`);
    } else {
      history.push("/app/forms");
    }
  };

  const handleFeatureClick = (
    featureType,
    miqaatId,
    e,
    fromFeatureModal = false
  ) => {
    if (e) {
      e.stopPropagation();
    }

    let navigationPath = "";

    switch (featureType) {
      case "miqaat-menu":
        navigationPath = `/app/miqaat-menu/${miqaatId}`;
        break;
      case "miqaat-attendance":
        navigationPath = `/app/miqaat-attendance/${miqaatId}`;
        break;
      case "counter-packing":
        navigationPath = `/app/counter-packing/${miqaatId}`;
        break;
      case "distribution":
        navigationPath = `/app/distribution/${miqaatId}`;
        break;
      case "leftover-degs":
        navigationPath = `/app/leftover-degs/${miqaatId}`;
        break;
      default:
        console.error("Unknown feature type:", featureType);
        return;
    }

    const navigationState = {
      fromFeatureModal: fromFeatureModal,
      selectedEvent: fromFeatureModal ? modalState.selectedEvent : null,
    };

    history.push(navigationPath, navigationState);
  };

  const handleDeleteMiqaat = async (id, e) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this Miqaat?"
      );

      if (confirmDelete) {
        const res = await _delete(`/miqaat/${id}/`);
        setTableData((prevData) => prevData.filter((item) => item.id !== id));
        toast.success("Miqaat deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting Miqaat:", error);
      alert("Failed to delete Miqaat. Please try again.");
    }
  };

  const handleRowClick = (event) => {
    openModal(event);
  };

  const getFeatureColor = (feature) => {
    const colorMap = {
      Menu: "bg-blue-500",
      Attendance: "bg-green-500",
      "Counter Packing": "bg-yellow-500",
      Distribution: "bg-purple-500",
      "Leftover Degs": "bg-teal-500",
    };
    return colorMap[feature] || "bg-gray-500";
  };
  const [thaalsByZone, setThaalsByZone] = useState({});

  const handleThaalChange = (zoneId, field, value) => {
    setThaalsByZone((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [field]: Number(value),
      },
    }));
  };

  const [zones, setZones] = useState([]);

  const fetchZones = async () => {
    const zonesResponse = await get("/zone/list/");
    setZones(zonesResponse);

    // Initialize each zone with 0 values
    const initialThaals = {};
    zonesResponse.forEach((zone) => {
      initialThaals[zone.id] = {
        thaals_polled: 0,
        thaals_cooked: 0,
        thaals_served: 0,
      };
    });
    setThaalsByZone(initialThaals);
  };

  const handleViewThaals = async (event, e) => {
    if (e) e.stopPropagation();

    const miqaatId = event.id;

    try {
      const zonesResponse = await get(`/miqaat/zones/${miqaatId}/`);
      setZones(zonesResponse);

      const initialThaals = {};
      zonesResponse.forEach((z) => {
        const zid = z.zone.id;
        initialThaals[zid] = {
          thaals_polled: z.thaals_polled || 0,
          thaals_cooked: z.thaals_cooked || 0,
          thaals_served: z.thaals_served || 0,
        };
      });
      setThaalsByZone(initialThaals);

      setSelectedThaals({
        miqaatName: event.miqaat_name,
        miqaatId: event.id,
      });
      setShowThaalsModal(true);
    } catch (error) {
      console.error("Failed to load zones for miqaat", error);
    }
  };

  const handleEditMiqaat = (id, e) => {
    if (e) {
      e.stopPropagation();
    }
    history.push(`/app/edit-miqaat/${id}`);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const miqaatId = selectedThaals?.miqaatId;
    if (!miqaatId) {
      console.error("Miqaat ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      for (const zoneWrapper of zones) {
        const zoneId = zoneWrapper.zone.id;
        const thaals = thaalsByZone[zoneId];

        await post("/miqaat-zone/update/", {
          miqaat_id: miqaatId,
          zone_id: zoneId,
          thaals_polled: thaals.thaals_polled,
          thaals_cooked: thaals.thaals_cooked,
          thaals_served: thaals.thaals_served,
        });
      }

      console.log("All MiqaatZone records updated");
      toast.success("Thaals updated successfully");
      setShowThaalsModal(false);
    } catch (err) {
      console.error("Error updating thaals:", err);
      toast.error("Failed to update thaals");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    const miqaatId = selectedThaals?.miqaatId;

    if (!miqaatId) {
      console.error("Miqaat ID not found");
      return;
    }

    try {
      await _delete(
        `/miqaat-zone/delete/?miqaat_id=${miqaatId}&zone_id=${zoneId}`
      );

      toast.success("Zone deleted from Miqaat ✔️");

      setZones((prev) => prev.filter((z) => z.zone.id !== zoneId));
      setThaalsByZone((prev) => {
        const updated = { ...prev };
        delete updated[zoneId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete zone:", error);
      toast.error("Failed to delete zone");
    }
  };
  const fileInputRef = useRef(null);

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCSVUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadFormData("/upload-miqaat-csv", formData);

      if (res.created_miqaats?.length) {
        toast.success(
          `${res.created_miqaats.length} Miqaats uploaded successfully.`
        );
      }

      if (res.data?.errors?.length) {
        const errorMessages = res.data.errors
          .map((err) => `Row ${err.row}: ${err.error}`)
          .join("\n");

        toast.error(`Some rows failed:\n${errorMessages}`, {
          duration: 5000,
        });
      }

      fetchMiqaatData(1, miqaatType);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => `Row ${err.row}: ${err.error}`)
          .join("\n");

        toast.error(`Upload validation failed:\n${errorMessages}`, {
          duration: 8000,
        });
      } else {
        toast.error("Upload failed: " + (error.message || "Unknown error"));
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleDownloadReport = async (miqaatId) => {
    try {
      await downloadBlob(
        `/report/download/${miqaatId}/`,
        `dana report - ${miqaatId}.pdf`
      );
    } catch (err) {
      toast.error("Failed to download report.");
    }
  };

  const openEmailModal = (miqaatId) => {
    setTargetMiqaatId(miqaatId);
    setEmailToSend("");
    setShowEmailModal(true);
  };

  const sendEmailReport = async () => {
    if (!emailToSend) return toast.error("Email is required.");
    setSending(true);
    try {
      await post(`/report/email/${targetMiqaatId}/`, {
        email_to: emailToSend,
      });
      toast.success("Email sent!");
      setShowEmailModal(false);
    } catch (err) {
      toast.error("Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const handleCopyRegistrationLink = (miqaatId) => {
    const url = `https://danadxb.com/registration/${miqaatId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Registration link copied!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const handleBackClick = () => {
    history.goBack();
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
        <h1 className="text-2xl font-semibold dark:text-white">
          {" "}
          <button onClick={handleBackClick} className="mr-4">
            <AiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          {getPageTitle()}
        </h1>

        <div className="flex gap-4">
          {isAdmin && (
            <>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto"
                onClick={handleCreateClick}
              >
                <FaPlus className="mr-2" /> Create
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto"
                onClick={triggerFilePicker}
              >
                <FaUpload className="mr-2" /> Upload CSV
              </button>
            </>
          )}
          {/* Hidden file input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVUpload}
            className="hidden"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700 dark:text-gray-400">Loading data...</p>
        </div>
      ) : tableData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700 dark:text-gray-400">No records found</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            <div className="w-full">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12"
                    >
                      SNO.
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      MIQAAT NAME
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      DATE
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      HIJRI DATE
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      FEATURES
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20"
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tableData.map((event, index) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">
                          {startIndex + index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                          {event.miqaat_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">
                          {new Date(event.miqaat_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">
                          {event.hijri_date}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {/* Always show Thaals button */}
                          <button
                            onClick={(e) => handleViewThaals(event, e)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md px-3 py-1"
                          >
                            Thaals
                          </button>

                          {/* Conditionally show Menu & Attendance only if isAdmin */}
                          {[
                            ...(isAdmin
                              ? [
                                  { name: "Menu", type: "miqaat-menu" },
                                  {
                                    name: "Attendance",
                                    type: "miqaat-attendance",
                                  },
                                ]
                              : []),
                            {
                              name: "Counter Packing",
                              type: "counter-packing",
                            },
                            { name: "Distribution", type: "distribution" },
                            { name: "Leftover Degs", type: "leftover-degs" },
                          ].map((feature) => (
                            <button
                              key={feature.name}
                              onClick={(e) =>
                                handleFeatureClick(feature.type, event.id, e)
                              }
                              className={`px-2 py-1 text-xs text-white transition-colors hover:brightness-90 focus:outline-none focus:ring-1 ${getFeatureColor(
                                feature.name
                              )} rounded`}
                            >
                              {feature.name}
                            </button>
                          ))}
                          {/* Download Dana Report */}
                          <button
                            onClick={() => handleDownloadReport(event.id)}
                            className="px-2 py-1 text-xs text-white bg-green-700 hover:bg-green-800 rounded transition-colors"
                          >
                            Download Report
                          </button>

                          {/* Email Dana Report */}
                          <button
                            onClick={() => openEmailModal(event.id)}
                            className="px-2 py-1 text-xs text-white bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
                          >
                            Email Report
                          </button>
                          {/* Registration link copy (always shown) */}
                          <button
                            onClick={() => handleCopyRegistrationLink(event.id)}
                            className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                          >
                            Registration
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAdmin && (
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              onClick={(e) => handleEditMiqaat(event.id, e)}
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              onClick={(e) => handleDeleteMiqaat(event.id, e)}
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {tableData.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
                onClick={() => handleRowClick(event)}
              >
                <div className="grid grid-cols-3 p-4 cursor-pointer">
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-300">
                      {event.miqaat_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.miqaat_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {isAdmin && (
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          onClick={(e) => handleEditMiqaat(event.id, e)}
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={(e) => handleDeleteMiqaat(event.id, e)}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-
              {Math.min(startIndex + resultsPerPage, totalResults)} OF{" "}
              {totalResults}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="px-4 py-2 bg-purple-600 text-white rounded">
                {currentPage}
              </div>
              <button
                className="p-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </>
      )}

      {modalState.isDialogOpen && modalState.selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300">
                {modalState.selectedEvent.miqaat_name}
              </h2>
              <button
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={closeModal}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(
                      modalState.selectedEvent.miqaat_date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hijri Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {modalState.selectedEvent.hijri_date}
                  </p>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {/* Thaals Button */}
                  <button
                    onClick={(e) =>
                      handleViewThaals(modalState.selectedEvent, e)
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-sm font-semibold transition-all"
                  >
                    Thaals
                  </button>

                  {/* Feature Buttons */}
                  {[
                    ...(isAdmin
                      ? [
                          {
                            name: "Menu",
                            type: "miqaat-menu",
                            color: "bg-blue-500",
                          },
                          {
                            name: "Attendance",
                            type: "miqaat-attendance",
                            color: "bg-green-500",
                          },
                        ]
                      : []),
                    {
                      name: "Counter Packing",
                      type: "counter-packing",
                      color: "bg-yellow-500",
                    },
                    {
                      name: "Distribution",
                      type: "distribution",
                      color: "bg-purple-500",
                    },
                    {
                      name: "Leftover Degs",
                      type: "leftover-degs",
                      color: "bg-teal-500",
                    },
                  ].map((feature) => (
                    <button
                      key={feature.name}
                      onClick={(e) =>
                        handleFeatureClick(
                          feature.type,
                          modalState.selectedEvent.id,
                          e,
                          true
                        )
                      }
                      className={`w-full py-3 text-white rounded-lg text-sm font-semibold ${feature.color} hover:opacity-90 transition-all`}
                    >
                      {feature.name}
                    </button>
                  ))}
                  {/* Download Dana Report */}
                  <button
                    onClick={() =>
                      handleDownloadReport(modalState.selectedEvent.id)
                    }
                    className="bg-red-400 hover:bg-red-600 text-white py-3 rounded-lg text-sm font-semibold transition-all"
                  >
                    Download Report
                  </button>

                  {/* Email Dana Report */}
                  <button
                    onClick={() => openEmailModal(modalState.selectedEvent.id)}
                    className="bg-yellow-300 hover:bg-yellow-500 text-white py-3 rounded-lg text-sm font-semibold transition-all"
                  >
                    Email Report
                  </button>

                  {/* Registration Button */}
                  <button
                    onClick={() =>
                      handleCopyRegistrationLink(modalState.selectedEvent.id)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-semibold transition-all col-span-2 sm:col-span-1"
                  >
                    Copy Registration Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {showThaalsModal && selectedThaals && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 px-2 sm:px-4 py-4 overflow-y-auto min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl shadow-xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thaals for {selectedThaals.miqaatName}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowThaalsModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {zones.map((zoneWrapper) => {
                  const zoneId = zoneWrapper.zone.id;
                  return (
                    <div key={zoneId} className="w-full">
                      <div className="p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-md">
                        <h3 className="text-sm sm:text-md font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 break-words">
                          {zoneWrapper.zone.name}
                        </h3>

                        {/* Mobile: Stack vertically, Desktop: Grid layout */}
                        <div className="flex flex-col space-y-3 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
                          <Label className="flex flex-col">
                            <span className="text-sm font-medium mb-1">
                              Thaals Polled
                            </span>
                            <Input
                              type="number"
                              className="w-full text-sm p-2 rounded-md border-gray-300 dark:border-gray-600 focus:ring focus:ring-blue-500"
                              value={thaalsByZone[zoneId]?.thaals_polled || 0}
                              min="0"
                              onChange={(e) =>
                                handleThaalChange(
                                  zoneId,
                                  "thaals_polled",
                                  e.target.value
                                )
                              }
                            />
                          </Label>

                          <Label className="flex flex-col">
                            <span className="text-sm font-medium mb-1 -mt-3">
                              Thaals Cooked
                            </span>
                            <Input
                              type="number"
                              className="w-full text-sm p-2 rounded-md border-gray-300 dark:border-gray-600 focus:ring focus:ring-blue-500"
                              value={thaalsByZone[zoneId]?.thaals_cooked || 0}
                              min="0"
                              onChange={(e) =>
                                handleThaalChange(
                                  zoneId,
                                  "thaals_cooked",
                                  e.target.value
                                )
                              }
                            />
                          </Label>

                          <Label className="flex flex-col">
                            <span className="text-sm font-medium mb-1 -mt-3">
                              Thaals Served
                            </span>
                            <Input
                              type="number"
                              className="w-full text-sm p-2 rounded-md border-gray-300 dark:border-gray-600 focus:ring focus:ring-blue-500"
                              value={thaalsByZone[zoneId]?.thaals_served || 0}
                              min="0"
                              onChange={(e) =>
                                handleThaalChange(
                                  zoneId,
                                  "thaals_served",
                                  e.target.value
                                )
                              }
                            />
                          </Label>
                        </div>

                        {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 sm:justify-end">
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm p-2 rounded-md order-2 sm:order-1"
                          >
                            {isSubmitting ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm p-2 rounded-md order-1 sm:order-2"
                            onClick={() => handleDeleteZone(zoneId)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </form>
          </div>
        
        </div>
      )}

    {showEmailModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Send Report via Email
          </h3>
          <input
            type="email"
            placeholder="Enter email"
            value={emailToSend}
            onChange={(e) => setEmailToSend(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
              onClick={() => setShowEmailModal(false)}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              onClick={sendEmailReport}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default Tables;
