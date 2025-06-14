import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { get, _delete } from "../api/axios";
import PageTitle from "../components/Typography/PageTitle";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
} from "@windmill/react-ui";
import {
  AiOutlineDelete,
} from "react-icons/ai";
import CreateBatchModal from "../components/CreateBatchModal";
import EditBatchModal from "../components/EditBatchModal";
import toast from "react-hot-toast";
import logoLight from '../assets/img/mainLogo.png';
import logoDark from '../assets/img/mainLogo-dark.png';
function Batch() {
  const history = useHistory();

  const [batchData, setBatchData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const BatchActionButtons = ({ batchId }) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateBatchStatus(batchId, 'todo');
        }}
        className="bg-blue-100 mb-2 text-blue-700 rounded-full ml-2 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 px-2 py-1 text-xs "
        title="Delete (TODO)"
      >
Todo      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateBatchStatus(batchId, 'completed');
        }}
        className="bg-green-100 mb-2 text-green-700 rounded-full ml-2 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 px-2 py-1 text-xs "
        title="Mark Completed"
      >
        Completed
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateBatchStatus(batchId, 'duplicate');
        }}
        className="bg-yellow-100 mb-2 text-yellow-700 rounded-full  hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 px-2 py-1 text-xs ml-2"
        title="Mark Duplicate"
      >
        Duplicate
      </button>
    </>
  );

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setIsLoading(true);
        const response = await get("/requests/batch/");
        setBatchData(response.results);
      } catch (err) {
        console.error("Error fetching batch data:", err);
        setError("Failed to load batch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchData();
  }, [refreshTrigger]);

  const handleAddBatch = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleBatchDetails = (batch) => {
    setSelectedBatch(batch);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setSelectedBatch(null);
    setIsDetailsModalOpen(false);
  };

  const handleEditClick = (batch) => {
    setCurrentBatch(batch);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentBatch(null);
  };

  const handleBatchCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBatchUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Batch updated successfully");
  };

  const handleUpdateBatchStatus = async (id, status) => {
    try {
      const confirmMsg =
        status === 'todo'
          ? 'Are you sure you want to delete this batch and reset requests to TODO?'
          : `Are you sure you want to mark this batch as "${status}" and keep it?`;

      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;

      await _delete(`requests/batches/${id}/delete/?status=${status}`);

      setBatchData((prev) => {
        if (status === 'todo') {
          // Remove batch from UI if deleted
          return prev.filter((batch) => batch.id !== id);
        }
        // Otherwise just update the UI or leave as-is
        return prev;
      });

      toast.success(
        status === 'todo'
          ? 'Batch deleted and requests set to TODO'
          : `Batch marked as "${status}" successfully`
      );
    } catch (err) {
      console.error('Batch update failed:', err);
      toast.error('Failed to update batch. Please try again.');
    }
  };


  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative w-full px-4 py-6">
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PageTitle>Batches </PageTitle>
        </div>
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center my-8">
            <p className="text-gray-700 dark:text-gray-300">Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <TableContainer className="hidden md:block mb-8" style={{opacity: 0.97,}}>
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>S.No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Request IDs</TableCell>
                    <TableCell>Actions</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {batchData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.request_ids}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">


                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Mark as Todo"
                            onClick={() => handleUpdateBatchStatus(item.id, 'todo')}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                          >
                             TODO
                          </Button>

                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Mark as Completed"
                            onClick={() => handleUpdateBatchStatus(item.id, 'completed')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                          >
                            COMPLETED
                          </Button>

                          <Button
                            layout="link"
                            size="icon"
                            aria-label="Mark as Duplicate"
                            onClick={() => handleUpdateBatchStatus(item.id, 'duplicate')}
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 dark:bg-yellow-500 dark:text-yellow-200 dark:hover:bg-yellow-700"
                          >
                            DUPLICATE
                          </Button>


                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {batchData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No batches found
                </div>
              ) : (
                batchData.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
                    onClick={() => handleBatchDetails(item)}
                  >
                    <div className="flex items-center p-3">
                      <div className="h-12 w-12 mr-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium dark:text-white truncate">
                            {item.full_name}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="truncate">Name: {item.name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="truncate">Request IDs: {item.request_ids}</span>
                        </div>
                      </div>
                    </div>
                      <div className="flex justify-center">
                        <BatchActionButtons batchId={item.id} />
                      </div>
                  </div>
                ))
              )}
            </div>


          </>
        )}
      </div>
      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onBatchCreated={handleBatchCreated}
      />
      {/* Edit Batch Modal */}
      {currentBatch && (
        <EditBatchModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onBatchUpdated={handleBatchUpdated}
          batchData={currentBatch}
        />
      )}
    </div>
  );
}

export default Batch;
