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
import { get, patch } from '../api/axios';
import toast from 'react-hot-toast';

const EditDistributionModal = ({
  isOpen,
  onClose,
  miqaatId,
  distributionData,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    counter_packing: '',
    ibadullah_count: '',
    mumin_count: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    counter_packings: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      setIsDropdownLoading(true);
      try {
        const [zonesRes, counterPackingsRes] = await Promise.all([
          get('/zone/list/'),
          get(`/counter-packing/${miqaatId}/`)
        ]);

        setDropdownOptions({
          zones: Array.isArray(zonesRes) ? zonesRes : zonesRes.results || [],
          counter_packings: Array.isArray(counterPackingsRes.counter_packing) ? 
            counterPackingsRes.counter_packing : 
            counterPackingsRes.counter_packing?.results || []
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

  // Set form data after dropdown options are loaded or distributionData changes
  useEffect(() => {
    if (distributionData && !isDropdownLoading) {
      setFormData({
        miqaat: miqaatId,
        zone: distributionData.zone_id || (distributionData.zone?.id ?? ''),
        counter_packing: distributionData.counter_packing_id || (distributionData.counter_packing?.id ?? ''),
        ibadullah_count: distributionData.ibadullah_count || '',
        mumin_count: distributionData.mumin_count || ''
      });
    }
  }, [distributionData, miqaatId, isDropdownLoading]);

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
      // Validate required fields
      const requiredFields = ['zone', 'counter_packing', 'ibadullah_count', 'mumin_count'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate dropdown selections
      if (!dropdownOptions.zones.some(zone => zone.id === parseInt(formData.zone))) {
        throw new Error('Please select a valid zone');
      }
      if (!dropdownOptions.counter_packings.some(cp => cp.id === parseInt(formData.counter_packing))) {
        throw new Error('Please select a valid counter packing');
      }

      // Validate numeric fields
      const ibadullahCount = parseInt(formData.ibadullah_count);
      const muminCount = parseInt(formData.mumin_count);
      if (isNaN(ibadullahCount) || ibadullahCount < 0) {
        throw new Error('Ibadullah count must be a non-negative number');
      }
      if (isNaN(muminCount) || muminCount < 0) {
        throw new Error('Mumin count must be a non-negative number');
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        miqaat: parseInt(miqaatId),
        zone: parseInt(formData.zone),
        counter_packing: parseInt(formData.counter_packing),
        ibadullah_count: ibadullahCount,
        mumin_count: muminCount
      };

      // Submit the form
      await patch(`/distribution/${distributionData.id}/`, submissionData);
      
      toast.success('Distribution record updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating distribution record:', err);
      setError(err.message || err.response?.data?.message || 'Failed to update distribution record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Distribution Record</ModalHeader>
      <ModalBody>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {isDropdownLoading ? (
          <p className="text-gray-700 dark:text-gray-400">Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Counter Packing Dropdown */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Counter Packing *</span>
                <Select
                  name="counter_packing"
                  value={formData.counter_packing}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Counter Packing</option>
                  {dropdownOptions.counter_packings.map(counterPacking => (
                    <option key={counterPacking.id} value={counterPacking.id}>
                      Zone: {counterPacking.zone_name}, Qty: {counterPacking.quantity} ({counterPacking.filled_percentage}%)
                    </option>
                  ))}
                </Select>
              </Label>

              {/* Ibadullah Count Input */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Ibadullah Count *</span>
                <Input
                  type="number"
                  name="ibadullah_count"
                  value={formData.ibadullah_count}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter Ibadullah count"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </Label>

              {/* Mumin Count Input */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Mumin Count *</span>
                <Input
                  type="number"
                  name="mumin_count"
                  value={formData.mumin_count}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter Mumin count"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </Label>
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

export default EditDistributionModal;