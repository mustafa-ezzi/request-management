import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Select,
} from '@windmill/react-ui';
import { get, patch } from '../api/axios';
import toast from 'react-hot-toast';

const EditCounterPackingModal = ({ 
  isOpen, 
  onClose, 
  miqaatId, 
  counterPackingData,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    sub_zone: '',
    miqaat_menu: '',
    unit: '',
    container: '',
    quantity: '',
    filled_percentage: '',
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    sub_zone:[],
    miqaat_menus: [],
    units: [],
    containers: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      setIsDropdownLoading(true);
      try {
        const [zonesRes,SubzonesRes, miqaatMenusRes, unitsRes, containersRes] = await Promise.all([
          get('/zone/list/'),
          get('/sub-zone/list/'),
      
          get(`/miqaat-menu/${miqaatId}/`),
          get('/unit/list/'),
          get('/container/list/'),
        ]);

        setDropdownOptions({
          zones: Array.isArray(zonesRes) ? zonesRes : zonesRes.results || [],
          sub_zone: Array.isArray(SubzonesRes) ? SubzonesRes : SubzonesRes.results || [],
          miqaat_menus: Array.isArray(miqaatMenusRes.miqaat_menu) ? miqaatMenusRes.miqaat_menu : miqaatMenusRes.miqaat_menu?.results || [],
          units: Array.isArray(unitsRes) ? unitsRes : unitsRes.results || [],
          containers: Array.isArray(containersRes) ? containersRes : containersRes.results || [],
        });
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
        setError('Failed to load dropdown options');
      } finally {
        setIsDropdownLoading(false);
      }
    };

    if (isOpen) {
      fetchDropdownOptions();
    }
  }, [isOpen, miqaatId]);

  // Set form data after dropdown options are loaded or counterPackingData changes
  useEffect(() => {
    if (counterPackingData && !isDropdownLoading) {
      setFormData({
        miqaat: miqaatId,
        zone: counterPackingData.zone_id || (counterPackingData.zone?.id ?? ''),
        sub_zone: counterPackingData.sub_zone_id || (counterPackingData.sub_zone?.id ?? ''),
        miqaat_menu: counterPackingData.miqaat_menu_id || (counterPackingData.miqaat_menu?.id ?? ''),
        unit: counterPackingData.unit_id || (counterPackingData.unit?.id ?? ''),
        container: counterPackingData.container_id || (counterPackingData.container?.id ?? ''),
        quantity: counterPackingData.quantity || '',
        filled_percentage: counterPackingData.filled_percentage || '',
      });
    }
  }, [counterPackingData, miqaatId, isDropdownLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['zone', 'miqaat_menu', 'unit', 'container', 'quantity', 'filled_percentage'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate dropdown selections
      if (!dropdownOptions.zones.some(zone => zone.id === parseInt(formData.zone))) {
        throw new Error('Please select a valid zone');
      }
      if (!dropdownOptions.miqaat_menus.some(menu => menu.id === parseInt(formData.miqaat_menu))) {
        throw new Error('Please select a valid miqaat menu');
      }
      if (!dropdownOptions.units.some(unit => unit.id === parseInt(formData.unit))) {
        throw new Error('Please select a valid unit');
      }
      if (!dropdownOptions.containers.some(container => container.id === parseInt(formData.container))) {
        throw new Error('Please select a valid container');
      }

      // Validate numeric fields
      const quantity = parseInt(formData.quantity);
      const filledPercentage = parseFloat(formData.filled_percentage);
      if (isNaN(quantity) || quantity < 0) {
        throw new Error('Quantity must be a non-negative number');
      }
      if (isNaN(filledPercentage) || filledPercentage < 0 || filledPercentage > 100) {
        throw new Error('Filled percentage must be between 0 and 100');
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        miqaat: parseInt(miqaatId),
        zone: parseInt(formData.zone),
        sub_zone: parseInt(formData.sub_zone),
        miqaat_menu: parseInt(formData.miqaat_menu),
        unit: parseInt(formData.unit),
        container: parseInt(formData.container),
        quantity: quantity,
        filled_percentage: filledPercentage,
      };

      // Submit the form
      await patch(`/counter-packing/${counterPackingData.id}/`, submissionData);
      
      toast.success('Counter packing record updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating counter packing record:', err);
      setError(err.message || err.response?.data?.message || 'Failed to update counter packing record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Counter Packing Record</ModalHeader>
      <ModalBody>
        {error && (
          <div className="bg-red-100 border border-red-400  text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {isDropdownLoading ? (
          <p className="text-gray-700 dark:text-gray-400">Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit}>
                  <div className="overflow-x-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             

              {/* Miqaat Menu Dropdown */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Miqaat Menu *</span>
                <Select
                  name="miqaat_menu"
                  value={formData.miqaat_menu}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Miqaat Menu</option>
                  {dropdownOptions.miqaat_menus.map(menu => (
                    <option key={menu.id} value={menu.id}>
                      {menu.menu_name}
                    </option>
                  ))}
                </Select>
              </Label>

              {/* Unit Dropdown */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Unit *</span>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
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
                <span className="text-gray-700 dark:text-gray-400">Container *</span>
                <Select
                  name="container"
                  value={formData.container}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Container</option>
                  {dropdownOptions.containers.map(container => (
                    <option key={container.id} value={container.id}>
                      {container.name}
                    </option>
                  ))}
                </Select>
              </Label>

              {/* Quantity Input */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Quantity *</span>
                <Input 
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter quantity"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </Label>

               {/* Zone Dropdown */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Zone *</span>
                <Select
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Zone</option>
                  {dropdownOptions.zones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </Select>
              </Label>


               {/* Sub-Zone Dropdown */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Sub Zone *</span>
                <Select
                  name="sub_zone"
                  value={formData.sub_zone}
                  onChange={handleInputChange}
                  className="mt-1"
                  disabled={isSubmitting}
                >
                  <option value="">Select Sub Zone</option>
                  {dropdownOptions.sub_zone.map(sub_zone => (
                    <option key={sub_zone.id} value={sub_zone.id}>
                      {sub_zone.name}
                    </option>
                  ))}
                </Select>
              </Label>

              {/* Filled Percentage Input */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Filled Percentage *</span>
                <Input 
                  type="number"
                  name="filled_percentage"
                  value={formData.filled_percentage}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter filled percentage"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  disabled={isSubmitting}
                />
              </Label>
            </div>
            </div>
          </form>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="hidden sm:block">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isDropdownLoading}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
        <div className="w-full sm:hidden">
          <Button 
            block 
            size="large" 
            onClick={handleSubmit}
            disabled={isSubmitting || isDropdownLoading}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default EditCounterPackingModal;