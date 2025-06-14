import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { get, _delete } from '../api/axios';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
} from '@windmill/react-ui';
import {
  AiOutlinePlusCircle,
  AiOutlineArrowLeft,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineDown,
} from 'react-icons/ai';
import CreateDistributionModal from './CreateDistributionModal';
import EditDistributionModal from '../components/EditDistributionModal';
import toast from 'react-hot-toast';
import logo from '../assets/img/mainLogo.png';

function Distribution() {
  const { id } = useParams();
  const history = useHistory();

  const [distributionData, setDistributionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDistribution, setCurrentDistribution] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchDistributionData();
    fetchMiqaatDetails();
  }, [id]);

  const fetchDistributionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get(`/distribution/${id}/`);
      setDistributionData(response);
    } catch (err) {
      console.error('Error fetching distribution data:', err);
      setError('Failed to load distribution data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMiqaatDetails = async () => {
    try {
      const response = await get(`/miqaat/${id}/`);
      setMiqaatDetails(response);
    } catch (err) {
      console.error('Error fetching miqaat details:', err);
      // Don't set error state to avoid blocking UI
    }
  };

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddDistribution = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentDistribution(null);
  };

  const handleEditDistribution = (distributionItem) => {
    setCurrentDistribution(distributionItem);
    setIsEditModalOpen(true);
  };

  const handleDeleteDistribution = async (distributionId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this distribution record?');
      if (confirmDelete) {
        await _delete(`/distribution/${distributionId}/`);
        setDistributionData(prevData => ({
          ...prevData,
          distributions: prevData.distributions.filter(item => item.id !== distributionId),
        }));
        toast.success('Distribution record deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting distribution record:', error);
      toast.error('Failed to delete distribution record. Please try again.');
    }
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const calculateTotals = () => {
    if (!distributionData?.distributions) return { total: 0, ibadullah: 0, mumin: 0 };

    return distributionData.distributions.reduce(
      (acc, item) => {
        const ibadullah = item.ibadullah_count != null ? item.ibadullah_count : 0;
        const mumin = item.mumin_count != null ? item.mumin_count : 0;
        return {
          total: acc.total + ibadullah + mumin,
          ibadullah: acc.ibadullah + ibadullah,
          mumin: acc.mumin + mumin,
        };
      },
      { total: 0, ibadullah: 0, mumin: 0 }
    );
  };

  const totals = calculateTotals();

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={handleBackClick} className="mr-4">
            <AiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1
            style={{
              fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
            }}
            className="font-semibold dark:text-white"
          >
            Distribution
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </h1>
        </div>
        <button
          onClick={handleAddDistribution}
          className="flex items-center bg-purple-600 text-white rounded-lg"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem',
          }}
        >
          <AiOutlinePlusCircle
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`}
          />
          Add
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700 dark:text-gray-400">Loading data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDistributionData}
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
                  <TableCell>Menu</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Ibadullah</TableCell>
                  <TableCell>Mumin</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Zone</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {distributionData?.distributions?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{item.menu_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.quantity || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {item.ibadullah_count != null ? item.ibadullah_count : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {item.mumin_count != null ? item.mumin_count : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-bold">
                        {(item.ibadullah_count != null ? item.ibadullah_count : 0) +
                          (item.mumin_count != null ? item.mumin_count : 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.zone_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleEditDistribution(item)}
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 mr-2"
                      >
                        <AiOutlineEdit className="h-4 w-4 inline-block" />
                      </button>
                      <button
                        onClick={() => handleDeleteDistribution(item.id)}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
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
            {!distributionData?.distributions || distributionData.distributions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-400">No distribution records found</p>
              </div>
            ) : (
              distributionData.distributions.map((item, index) => (
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
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.menu_name || 'N/A'}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <AiOutlineDown
                        className={`h-4 w-4 transition-transform ${expandedItem === item.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {expandedItem === item.id && (
                    <div className="px-4 pb-4 pt-0 border-t dark:border-gray-700">
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quantity:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.quantity || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ibadullah Count:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.ibadullah_count != null ? item.ibadullah_count : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mumin Count:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.mumin_count != null ? item.mumin_count : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Count:</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {(item.ibadullah_count != null ? item.ibadullah_count : 0) +
                              (item.mumin_count != null ? item.mumin_count : 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Zone:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.zone_name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditDistribution(item)}
                          className="text-white px-4 py-1 rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center"
                        >
                          <AiOutlineEdit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDistribution(item.id)}
                          className="text-white px-4 py-1 rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 flex items-center"
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

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateDistributionModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          miqaatId={id}
          onSuccess={fetchDistributionData}
        />
      )}

      {isEditModalOpen && currentDistribution && (
        <EditDistributionModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          miqaatId={id}
          distributionData={currentDistribution}
          onSuccess={fetchDistributionData}
        />
      )}
    </div>
    </div>
  );
}

export default Distribution;