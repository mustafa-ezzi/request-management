import React, { useState, useEffect } from 'react';
import { get, post, _delete } from '../api/axios';
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
  AiOutlineDelete,
  AiOutlineEdit
} from 'react-icons/ai';
import CreateRequestModal from '../components/CreateRequestModal';
import EditRequestModal from '../components/EditRequestModal';
import toast from 'react-hot-toast';
import logoLight from '../assets/img/mainLogo.png';
import logoDark from '../assets/img/mainLogo-dark.png';
function Request() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [applyFilterTrigger, setApplyFilterTrigger] = useState(0);
  const [batchName, setBatchName] = useState('');
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const [requestData, setRequestData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [createdByOptions, setCreatedByOptions] = useState([]);
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const resp = await get('/requests/filters');
        setStatusOptions(resp.statuses);
        setTypeOptions(resp.types);
        setCreatedByOptions(resp.creators);
      } catch (e) {
        console.error('Failed to load filter options', e);
      }
    };
    fetchFilters();

    const fetchRequestData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();

        if (!isBatchMode) {
          if (statusFilter) params.append('status', statusFilter);
          if (typeFilter) params.append('type', typeFilter);
          if (createdByFilter) params.append('created_by', createdByFilter);
        }

        const queryString = params.toString();
        const endpoint = isBatchMode ? 'requests/filter-requests/' : `/requests/requests${queryString ? `?${queryString}` : ''}`;

        const response = await get(endpoint);
        const results = response?.results || [];

        // If batch mode AND it's a flat list (first object has no `requests` array)
        if (isBatchMode && results.length && !Array.isArray(results[0].requests)) {
          // Group by ITS + type
          const grouped = results.reduce((acc, item) => {
            const key = `${item.its}-${item.type}`;
            if (!acc[key]) acc[key] = { its: item.its, type: item.type, requests: [] };
            acc[key].requests.push(item);
            return acc;
          }, {});

          setRequestData(Object.values(grouped));

          const selectedIds = Object.values(grouped).map(g => g.requests[0]?.id).filter(Boolean);
          setSelectedRequestIds(selectedIds);

        } else {
          setRequestData(results);
          // existing grouped logic:
          if (isBatchMode) {
            const selectedIds = results.flatMap(group => {
              const arr = Array.isArray(group.requests) ? group.requests : []
              const first = arr[0]
              return first?.id ? [first.id] : []
            })
            setSelectedRequestIds(selectedIds)
          }
        }
      } catch (err) {
        console.error('Error fetching request data:', err);
        setError('Failed to load request data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestData();
  }, [refreshTrigger, statusFilter, typeFilter, createdByFilter, refreshTrigger, applyFilterTrigger, isBatchMode]);

  const handleAddRequest = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditClick = (request) => {
    setCurrentRequest(request);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentRequest(null);
  };

  const handleRequestCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Request created successfully');
  };

  const handleRequestUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Request updated successfully');
  };
  const handleSwitchToBatchMode = () => {
    setIsBatchMode(true);
    setRefreshTrigger(trigger => trigger + 1);
  };

  const handleCreateBatch = async () => {
    try {
      await post('requests/batch/', {
        name: batchName,
        request_ids: selectedRequestIds,
      });
      toast.success('Batch created successfully');
      setBatchName('');
      setSelectedRequestIds([]);
      setIsBatchMode(false);
      setRefreshTrigger(trigger => trigger + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create batch');
    }
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const toggleSelectId = (id) => {
    setSelectedRequestIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-blue-400 text-white';
      case 'is_batch':
        return 'bg-purple-400 text-white';
      case 'discarded':
        return 'bg-yellow-400 text-white';
      case 'completed':
        return 'bg-green-400 text-white';
      case 'duplicate':
        return 'bg-red-400 text-white';
      default:
        return 'bg-gray-100 text-white';
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this request?');

      if (confirmDelete) {
        await _delete(`/requests/requests/${id}/delete/`);

        setRequestData(prevData => prevData.filter(item => item.id !== id));
        toast.success('Request deleted successfully');
      }
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  return (
    <div className="relative w-full px-4 py-6">
      {/* Content Overlay */}
      <div className="relative z-10">      {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PageTitle>Requests</PageTitle>

          <div className="flex space-x-2">
            {!isBatchMode ? (
              <>
                <div className="hidden md:flex space-x-2">
                  <button
                    onClick={handleSwitchToBatchMode}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Create Batch
                  </button>
                  <button
                    onClick={handleAddRequest}
                    className="px-4 py-2 flex items-center bg-purple-600 text-white rounded-lg"
                  >
                    Add Request
                  </button>
                </div>

                <div className='md:hidden'>
                  <button
                    onClick={handleSwitchToBatchMode}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >

                    Batch
                  </button>
                  <button
                    onClick={handleAddRequest}
                    className="px-4 py-2 mt-2 flex items-center bg-purple-600 text-white rounded-lg"
                  >
                    Request
                  </button>


                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter Batch Name"
                  className="border px-3 py-2 rounded"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={handleCreateBatch}
                  disabled={selectedRequestIds.length === 0 || !batchName.trim()}
                >
                  Confirm Batch
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => {
                    setIsBatchMode(false);
                    setBatchName('');
                    setSelectedRequestIds([]);
                    setRefreshTrigger(t => t + 1); // reset
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        {!isBatchMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" >

            <select className="w-full border rounded px-4 py-3 dark:bg-gray-700 dark:text-white dark:border-gray-700" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>

            <select className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <select className="w-full border rounded px-3 py-2  dark:bg-gray-700 dark:text-white dark:border-gray-700" value={createdByFilter} onChange={e => setCreatedByFilter(e.target.value)}>
              <option value="">All Creators</option>
              {createdByOptions.map(({ created_by__id: id, created_by__username: username }) => (
                <option key={id} value={id}>
                  {username}
                </option>
              ))}
            </select>

          </div>
        )}
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
                    {isBatchMode && (
                      <TableCell>Check</TableCell>
                    )}
                    <TableCell>#</TableCell>
                    <TableCell>ITS</TableCell>
                    <TableCell>Request Type</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell></TableCell> {/* Expand/Collapse button */}
                  </tr>
                </TableHeader>
                <TableBody>
                  {requestData.map((group, groupIndex) => {
                    const requestsArray = Array.isArray(group.requests) ? group.requests : [];
                    const firstRequest = requestsArray[0];

                    if (!firstRequest) {
                      return null; // skip this group if it's malformed or empty
                    }

                    const isExpanded = expandedGroups[groupIndex] || false;

                    return (
                      <React.Fragment key={`${group.its}-${group.type}`}>
                        <TableRow>
                          {isBatchMode && (
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedRequestIds.includes(firstRequest.id)}
                                onChange={() => toggleSelectId(firstRequest.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <span className="text-sm font-semibold">{groupIndex + 1}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{group.its}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{firstRequest.type.replace(/_/g, ' ')}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {firstRequest.type === 'change_city_request' && firstRequest.city_name}
                              {firstRequest.type === 'change_zone_request' && firstRequest.zone_name}
                              {firstRequest.type === 'pass_request' &&
                                `${firstRequest.toggle?.toUpperCase()} - ${firstRequest.pass_date}`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{firstRequest.created_by}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(firstRequest.status)}`}>
                              {formatStatus(firstRequest.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {firstRequest.status === 'todo' && (
                              <div className="flex items-center space-x-4">
                                <Button layout="link" size="icon" aria-label="Edit" onClick={() => handleEditClick(firstRequest)}>
                                  <AiOutlineEdit className="w-5 h-5" />
                                </Button>
                                <Button layout="link" size="icon" aria-label="Delete" onClick={() => handleDeleteRequest(firstRequest.id)}>
                                  <AiOutlineDelete className="w-5 h-5" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {group.requests.length > 1 && (
                              <button
                                onClick={() =>
                                  setExpandedGroups((prev) => ({
                                    ...prev,
                                    [groupIndex]: !prev[groupIndex],
                                  }))
                                }
                                className="text-purple-600 font-medium hover:underline text-sm"
                              >
                                {isExpanded ? 'Hide' : `Show ${group.requests.length - 1} more`}
                              </button>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expandable child rows */}
                        {isExpanded &&
                          group.requests.slice(1).map((req, subIndex) => (
                            <TableRow key={req.id} className="bg-gray-50 dark:bg-gray-700">
                              {isBatchMode && (
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedRequestIds.includes(req.id)}
                                    onChange={() => toggleSelectId(req.id)}
                                  />
                                </TableCell>
                              )}
                              <TableCell></TableCell>
                              <TableCell colSpan={2}>
                                <span className="text-sm">{req.its}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {req.type === 'change_city_request' && req.city_name}
                                  {req.type === 'change_zone_request' && req.zone_name}
                                  {req.type === 'pass_request' && `${req.toggle?.toUpperCase()} - ${req.pass_date}`}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{req.created_by}</span>
                              </TableCell>
                              <TableCell>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(req.status)}`}>
                                  {formatStatus(req.status)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {req.status === 'todo' && (
                                  <div className="flex items-center space-x-4">
                                    <Button layout="link" size="icon" aria-label="Edit" onClick={() => handleEditClick(req)}>
                                      <AiOutlineEdit className="w-5 h-5" />
                                    </Button>
                                    <Button layout="link" size="icon" aria-label="Delete" onClick={() => handleDeleteRequest(req.id)}>
                                      <AiOutlineDelete className="w-5 h-5" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>


            {/* Mobile View - List with Request Cards */}
            {/* Mobile View - Grouped Cards */}
            <div className="md:hidden space-y-3" style={{ opacity: 0.8, }}>
              {requestData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No requests found
                </div>
              ) : (
                requestData.map((group, groupIndex) => {
                  const requestsArray = Array.isArray(group.requests) ? group.requests : [];
                  const firstRequest = requestsArray[0];

                  if (!firstRequest) {
                    return null; // skip rendering this group if no request
                  }

                  const isExpanded = expandedGroups[groupIndex] || false;


                  return (
                    <div
                      key={`${group.its}-${group.type}-${group.status}`}
                      className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4"
                    >
                      {/* Top section */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            ITS: {group.its}
                          </p>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(firstRequest.status)}`}>
                            {formatStatus(firstRequest.status)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300">Type: {firstRequest.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Created By: {firstRequest.created_by}</p>

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {firstRequest.type === 'change_city_request' && `City: ${firstRequest.city_name}`}
                          {firstRequest.type === 'change_zone_request' && `Zone: ${firstRequest.zone_name}`}
                          {firstRequest.type === 'pass_request' && `Pass: ${firstRequest.toggle?.toUpperCase()} - ${firstRequest.pass_date}`}
                        </p>
                      </div>

                      {/* Actions */}
                      {firstRequest.status === 'todo' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleEditClick(firstRequest)}
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded"
                          >
                            <AiOutlineEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(firstRequest.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"
                          >
                            <AiOutlineDelete className="h-5 w-5" />
                          </button>
                        </div>
                      )}

                      {/* Expand/collapse */}
                      {group.requests.length > 1 && (
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              setExpandedGroups((prev) => ({
                                ...prev,
                                [groupIndex]: !prev[groupIndex],
                              }))
                            }
                            className="text-purple-600 font-medium hover:underline text-sm"
                          >
                            {isExpanded ? 'Hide' : `Show ${group.requests.length - 1} more`}
                          </button>
                        </div>
                      )}


                      {isExpanded &&
                        group.requests.slice(1).map((req) => (
                          <TableRow key={req.id} className="bg-gray-50 dark:bg-gray-700">
                            {isBatchMode && (
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedRequestIds.includes(req.id)}
                                  onChange={() => toggleSelectId(req.id)}
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <span className="text-sm">{groupIndex + 1}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{req.its}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{req.type.replace(/_/g, ' ')}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {req.type === 'change_city_request' && req.city_name}
                                {req.type === 'change_zone_request' && req.zone_name}
                                {req.type === 'pass_request' && `${req.toggle?.toUpperCase()} - ${req.pass_date}`}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{req.created_by}</span>
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(req.status)}`}>
                                {formatStatus(req.status)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {req.status === 'todo' && (
                                <div className="flex items-center space-x-4">
                                  <Button layout="link" size="icon" aria-label="Edit" onClick={() => handleEditClick(req)}>
                                    <AiOutlineEdit className="w-5 h-5" />
                                  </Button>
                                  <Button layout="link" size="icon" aria-label="Delete" onClick={() => handleDeleteRequest(req.id)}>
                                    <AiOutlineDelete className="w-5 h-5" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell></TableCell> {/* Expand button spacer */}
                          </TableRow>
                        ))}


                    </div>
                  );
                })
              )}
            </div>

          </>
        )}

        {/* Create Request Modal */}
        <CreateRequestModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          onRequestCreated={handleRequestCreated}
        />

        {/* Edit Request Modal */}
        {currentRequest && (
          <EditRequestModal
            isOpen={isEditModalOpen}
            onClose={handleEditModalClose}
            onRequestUpdated={handleRequestUpdated}
            requestData={currentRequest}
          />
        )}
      </div>
    </div>
  );
}

export default Request;