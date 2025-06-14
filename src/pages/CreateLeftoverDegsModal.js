import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Select
} from '@windmill/react-ui';
import { get, post } from '../api/axios';

const CreateLeftoverDegsModal = ({ 
  isOpen, 
  onClose, 
  miqaatId, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    menu: '',
    unit: '',
    container: '',
    total_cooked: '',
    total_received: '',
    zone: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    menus: [],
    units: [],
    containers: [],
    zones: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [menusRes, unitsRes, containersRes, zonesRes] = await Promise.all([
          get('/menu/list/'),
          get('/unit/list/'),
          get('/container/list/'),
          get('/zone/list/')
        ]);

        setDropdownOptions({
          menus: menusRes,
          units: unitsRes,
          containers: containersRes,
          zones: zonesRes
        });
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
        setError('Failed to load dropdown options');
      }
    };

    if (isOpen) {
      fetchDropdownOptions();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        miqaat: miqaatId
      };

      // Validate required fields
      const requiredFields = ['menu', 'unit', 'container', 'total_cooked', 'total_received', 'zone'];
      const missingFields = requiredFields.filter(field => !submissionData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Convert string numbers to integers for backend
      submissionData.menu = parseInt(submissionData.menu, 10);
      submissionData.unit = parseInt(submissionData.unit, 10);
      submissionData.container = parseInt(submissionData.container, 10);
      submissionData.zone = parseInt(submissionData.zone, 10);
      submissionData.total_cooked = parseInt(submissionData.total_cooked, 10);
      submissionData.total_received = parseInt(submissionData.total_received, 10);
      submissionData.miqaat = parseInt(submissionData.miqaat, 10);

      // Submit data
      const response = await post('/leftover-degs/', submissionData);
      
      // Call success callback
      onSuccess(response);
      
      // Reset form and close modal
      setFormData({
        menu: '',
        unit: '',
        container: '',
        total_cooked: '',
        total_received: '',
        zone: ''
      });
      onClose();
    } catch (err) {
      console.error('Error creating leftover degs:', err);
      
      // Handle validation errors from backend
      if (err.response?.data) {
        const errorMessages = [];
        const errorData = err.response.data;
        
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
          }
        });
        
        if (errorMessages.length > 0) {
          setError(errorMessages.join('; '));
        } else {
          setError('Failed to create leftover degs. Please check your input.');
        }
      } else {
        setError('Failed to create leftover degs');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Create Leftover Degs</ModalHeader>
      <ModalBody>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Menu Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Menu</span>
              <Select
                name="menu"
                value={formData.menu}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Menu</option>
                {dropdownOptions.menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Unit Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Unit</span>
              <Select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Unit</option>
                {dropdownOptions.units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Container Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Container</span>
              <Select
                name="container"
                value={formData.container}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Container</option>
                {dropdownOptions.containers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Zone Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Zone</span>
              <Select
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Zone</option>
                {dropdownOptions.zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Total Cooked Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Total Cooked</span>
              <Input
                type="number"
                name="total_cooked"
                value={formData.total_cooked}
                onChange={handleInputChange}
                placeholder="Enter total cooked"
                className="mt-1"
                required
              />
            </Label>

            {/* Total Received Input */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Total Received</span>
              <Input
                type="number"
                name="total_received"
                value={formData.total_received}
                onChange={handleInputChange}
                placeholder="Enter total received"
                className="mt-1"
                required
              />
            </Label>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        
        <div className="hidden sm:block">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
        
        {/* Mobile buttons */}
        <div className="w-full sm:hidden">
         
          <Button 
            block 
            size="large" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CreateLeftoverDegsModal;