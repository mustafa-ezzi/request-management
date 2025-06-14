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
    Button
} from '@windmill/react-ui';
import { 
    AiOutlinePlusCircle, 
    AiOutlineEdit, 
    AiOutlineDelete 
} from 'react-icons/ai';
import CreateContainerModal from '../components/CreateContainerModal';
import EditContainerModal from '../components/EditContainerModal';
import toast from 'react-hot-toast';
import logo from '../assets/img/mainLogo.png';

function Container() {
    const history = useHistory();

    const [containerData, setContainerData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentContainer, setCurrentContainer] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchContainerData = async () => {
            try {
                setIsLoading(true);
                const response = await get('/container/list/');
                setContainerData(response);
            } catch (err) {
                console.error('Error fetching container data:', err);
                setError('Failed to load container data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContainerData();
    }, [refreshTrigger]);

    const handleAddContainer = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
    };

    const handleEditClick = (container) => {
        setCurrentContainer(container);
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setCurrentContainer(null);
    };

    const handleContainerCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleContainerUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Container updated successfully');
    };

    const handleDeleteContainer = async (id) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this container?');

            if (confirmDelete) {
                await _delete(`/container/${id}/`);
                
                setContainerData(prevData => prevData.filter(item => item.id !== id));
                toast.success('Container deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting container:', error);
            toast.error('Failed to delete container. Please try again.');
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
        <div className="relative z-10">            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <PageTitle>Containers</PageTitle>
                <button 
                    onClick={handleAddContainer} 
                    className="flex items-center bg-purple-600 text-white rounded-lg"
                    style={{
                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
                        padding: window.innerWidth < 768 ? '0.5rem 1rem' : '0.75rem 1rem'
                    }}
                >
                    <AiOutlinePlusCircle 
                        className={`mr-1 ${window.innerWidth < 768 ? 'w-3 h-3' : 'w-4 h-4'}`} 
                    />
                    Add Container
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
                                {containerData.map((item, index) => (
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
                                                    onClick={() => handleDeleteContainer(item.id)}
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

                    {/* Mobile View - List with Container Cards */}
                    <div className="md:hidden space-y-3">
                        {containerData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No containers found
                            </div>
                        ) : (
                            containerData.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
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
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleEditClick(item)}
                                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded"
                                            >
                                                <AiOutlineEdit className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteContainer(item.id)}
                                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"
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

            {/* Create Container Modal */}
            <CreateContainerModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onContainerCreated={handleContainerCreated}
            />

            {/* Edit Container Modal */}
            {currentContainer && (
                <EditContainerModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    onContainerUpdated={handleContainerUpdated}
                    containerData={currentContainer}
                />
            )}
        </div>
        </div>
    );
}

export default Container;