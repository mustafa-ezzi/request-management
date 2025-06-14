import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get, _delete } from '../api/axios';
import PageTitle from '../components/Typography/PageTitle';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
} from '@windmill/react-ui';
import {
  AiOutlinePlusCircle,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineDown,
  AiOutlineUp
} from 'react-icons/ai';
import CreateZoneModal from '../components/CreateZoneModal';
import EditZoneModal from '../components/EditZoneModal';
import logo from '../assets/img/mainLogo.png';

import toast from 'react-hot-toast';

function Zone() {
  const history = useHistory();
  

  const [zoneData, setZoneData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        setIsLoading(true);
        const response = await get('/requests/zones/');
        setZoneData(response.results);
      } catch (err) {
        console.error('Error fetching zone data:', err);
        setError('Failed to load zone data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchZoneData();
  }, [refreshTrigger]);




  const handleAddZone = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (zone) => {
    setCurrentZone(zone);
    setIsEditModalOpen(true);
    setExpandedItem(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentZone(null);
  };

  const handleZoneCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Zone created successfully');
  };

  const handleZoneUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Zone updated successfully');
  };

  const handleDeleteZone = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this zone?');

      if (confirmDelete) {
        await _delete(`requests/zones/${id}/delete/`);

        setZoneData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Zone deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone. Please try again.');
    }
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };


  


  return (
 <div className="relative w-full px-4 py-6">
 
    
        {/* Content Overlay */}
        <div className="relative z-10">      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Zones</PageTitle>
        <button
          onClick={handleAddZone}
          className="flex items-center bg-purple-600 text-white rounded-lg"
          style={{
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
          }}
        >
          <AiOutlinePlusCircle
            className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`}
          />
          Add Zone
        </button>
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
          <TableContainer className="hidden md:block mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
               
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {zoneData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.name}</span>
                    </TableCell>
                   
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Button
                          layout="link"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => handleEditClick(item)}
                        >
                          <AiOutlineEdit className="w-5 h-5" aria-hidden="true" />
                        </Button>
                        <Button
                          layout="link"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => handleDeleteZone(item.id)}
                        >
                          <AiOutlineDelete className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile View - List with Zone Cards */}
          <div className="md:hidden space-y-3">
            {zoneData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No zones found
              </div>
            ) : (
              zoneData.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center p-3">
                    <div
                      className="h-12 w-12 mr-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 
                      flex items-center justify-center font-medium"
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium dark:text-white truncate">{item.name}</p>
                      </div>
                    </div>
                    <button
                      className="text-gray-600 dark:text-gray-300"
                    >
                      {expandedItem === item.id ? <AiOutlineUp className="h-5 w-5" /> : <AiOutlineDown className="h-5 w-5" />}
                    </button>
                  </div>

                  {expandedItem === item.id && (
                    <div className="px-4 pb-4 pt-0 border-t dark:border-gray-700">
                      <div className="mt-2">
                        
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs flex items-center"
                          >
                            <AiOutlineEdit className="mr-1 h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteZone(item.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center"
                          >
                            <AiOutlineDelete className="mr-1 h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>


      )}

      {/* Create Zone Modal */}
      <CreateZoneModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onZoneCreated={handleZoneCreated}
      />

      {/* Edit Zone Modal */}
      {currentZone && (
        <EditZoneModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onZoneUpdated={handleZoneUpdated}
          zoneData={currentZone}
        />
      )}
    </div>
    </div>
  );
}

export default Zone;