import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { get, _delete, post, patch } from '../api/axios';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,

} from '@windmill/react-ui';
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import CreateMiqaatAttendanceModal from '../components/CreateMiqaatAttendanceModal';
import logo from '../assets/img/mainLogo.png';

import EditMiqaatAttendanceModal from '../components/EditMiqaatAttendanceModal';
import toast from 'react-hot-toast';
// import { Input, Label, Select, Textarea, Button } from '@windmill/react-ui'


function MiqaatAttendance() {
  const { id } = useParams();
  const history = useHistory();

  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miqaatDetails, setMiqaatDetails] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [editZone, setEditZone] = useState(null);
  const [editSubZone, setEditSubZone] = useState(null);
  const [zones, setZones] = useState([]);
  const [subZones, setSubZones] = useState([]);


  const handleEditAttendance = (attendanceItem) => {
    setCurrentAttendance(attendanceItem);
    setEditZone(attendanceItem.zone);
    setEditSubZone(attendanceItem.sub_zone);
  };


  const handlePatchAttendance = async () => {
    if (!currentAttendance) return;
    try {
      await patch(`/miqaat-attendance/${currentAttendance.id}/`, {
        zone: editZone,
        sub_zone: editSubZone,
      }, 'patch'); // Make sure your axios handles patch
      toast.success('Attendance updated successfully');
      setCurrentAttendance(null);
      fetchAttendanceData();
    } catch (error) {
      console.error('Patch failed:', error);
      toast.error('Failed to update attendance');
    }
  };


  const handleDeleteAttendance = async (attendanceId) => {
    try {
      const confirmDelete = window.confirm('Are you sure?');
      if (confirmDelete) {
        await _delete(`/miqaat-attendance/${attendanceId}/`);
        toast.success('Deleted');
        fetchAttendanceData(); // Refresh to reflect the absence and allow "Add" again
      }
    } catch (e) {
      toast.error('Delete failed');
    }
  };


  const handleAddAttendanceForMember = async (member) => {
    try {
      const response = await post('/miqaat-attendance/', {
        member: member.id,
        miqaat: parseInt(id, 10), // 👈 fix here
        zone: member.zone,
        sub_zone: member.sub_zone,
      });
      toast.success('Attendance created successfully');
      fetchAttendanceData(); // Refresh the table
    } catch (error) {
      console.error('Failed to create attendance:', error);
      toast.error('Failed to create attendance. Please try again.');
    }
  };
  useEffect(() => {
    fetchAttendanceData();
    fetchMiqaatDetails();

    const fetchZones = async () => {
      const zonesResponse = await get('/zone/list/');
      setZones(zonesResponse);
    };

    const fetchSubZones = async () => {
      const subzonesResponse = await get('/sub-zone/list/');
      setSubZones(subzonesResponse);
    };

    fetchZones();
    fetchSubZones();
  }, [id]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get(`/miqaat/member-attendance/?miqaat_id=${id}`);
      setAttendanceData(response);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again.');
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

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return 'N/A';

    const [hours, minutes] = timeString.split(':');

    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${ampm}`;
  };
  ;

  const handleBackClick = () => {
    history.goBack();
  };

  const handleAddAttendance = () => {
    setIsCreateModalOpen(true);
  };


  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };


  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentAttendance(null);
  };

  const handleAttendanceCreated = () => {
    fetchAttendanceData();
  };

  const handleAttendanceUpdated = () => {
    fetchAttendanceData();
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
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
            Attendance
            {miqaatDetails && ` - ${miqaatDetails.miqaat_name}`}
          </h1>
        </div>
      </div>

      {/* Loading/Error State */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <p className="text-gray-700 dark:text-gray-400">Loading data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAttendanceData}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <TableContainer className="mb-8 min-w-[600px]">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>ITS</TableCell>
                  <TableCell>Zone</TableCell>
                  <TableCell>Sub Zone</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {attendanceData?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-sm">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{item.full_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.its}</span>
                    </TableCell>
                    <TableCell>
                      {item.is_attendance && currentAttendance?.id === item.id ? (
                        <select
                          value={editZone}
                          onChange={(e) => setEditZone(parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="">Select Zone</option>
                          {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm">{item.zone_name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.is_attendance && currentAttendance?.id === item.id ? (
                        <select
                          value={editSubZone}
                          onChange={(e) => setEditSubZone(parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="">Select Sub-zone</option>
                          {subZones.map((subZone) => (
                            <option key={subZone.id} value={subZone.id}>{subZone.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm">{item.sub_zone_name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.is_attendance ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          {currentAttendance?.id === item.id ? (
                            <>
                              <button
                                onClick={handlePatchAttendance}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-600 flex items-center space-x-1"
                              >
                                <AiOutlineEdit className="h-4 w-4" />
                                <span className="text-sm">Save</span>
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentAttendance(null);
                                  setEditZone(null);
                                  setEditSubZone(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1"
                              >
                                <span className="text-sm">Cancel</span>
                              </button>
                            </>
                          ) : (

                            <>
                              <button
                                onClick={() => handleEditAttendance(item)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 flex items-center space-x-1"
                              >
                                <AiOutlineEdit className="h-4 w-4" />
                                <span className="text-sm">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAttendance(item.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 flex items-center space-x-1"
                              >
                                <AiOutlineDelete className="h-4 w-4" />
                                <span className="text-sm">Delete</span>
                              </button>
                            </>
                          )}
                        </div>

                      ) : (
                                                <div className="flex flex-wrap justify-end gap-2">

                        <button
                          onClick={() => handleAddAttendanceForMember(item)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-600 flex items-center space-x-1"
                        >
                          <AiOutlinePlusCircle className="w-4 h-4" />
                          <span className="text-sm">save</span>

                        </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateMiqaatAttendanceModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          miqaatId={id}
          onSuccess={handleAttendanceCreated}
        />
      )}

      {isEditModalOpen && currentAttendance && (
        <EditMiqaatAttendanceModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          miqaatId={id}
          attendanceData={currentAttendance}
          onSuccess={handleAttendanceUpdated}
        />
      )}
    </div>
    </div>
  );

}

export default MiqaatAttendance;