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
import { patch, get } from '../api/axios';
import toast from 'react-hot-toast';

function EditCounterModal({ 
  isOpen, 
  onClose, 
  onCounterUpdated, 
  counterData 
}) {
  const [formData, setFormData] = useState({
    name: '',
    zone: ''
  });

  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setZonesLoading(true); 
        const response = await get('/zone/list/');
        setZones(response);
      } catch (error) {
        console.error('Error fetching zones:', error);
        toast.error('Failed to load zones');
      } finally {
        setZonesLoading(false); 
      }
    };

    if (isOpen) {
      fetchZones();
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (isOpen && counterData) {
      setFormData({
        name: counterData.name || '',
        zone: counterData.zone_id ? counterData.zone_id.toString() : '' 
      });
      setErrors({}); 
    }
  }, [isOpen, counterData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Counter name is required';
    }
    if (!formData.zone) {
      newErrors.zone = 'Zone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dataToSubmit = {
        name: formData.name.trim(),
        zone: parseInt(formData.zone) 
      };
      
      await patch(`/counter/${counterData.id}/`, dataToSubmit);
      
      toast.success('Counter updated successfully');
      
      if (onCounterUpdated) {
        onCounterUpdated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating counter:', error);
      setErrors({ submit: 'Failed to update counter. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Counter</ModalHeader>
      <ModalBody>
        {zonesLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-700 dark:text-gray-300">Loading zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-600 dark:text-red-400">No zones available</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label>
                <span>Counter Name *</span>
                <Input 
                  className="mt-1"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter counter name"
                />
                {errors.name && (
                  <span className="text-xs text-red-600">{errors.name}</span>
                )}
              </Label>
            </div>
            
            <div className="mb-4">
              <Label>
                <span>Zone *</span>
                <Select
                  className="mt-1"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                >
                  <option value="">Select a zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </option>
                  ))}
                </Select>
                {errors.zone && (
                  <span className="text-xs text-red-600">{errors.zone}</span>
                )}
              </Label>
            </div>
            
            {errors.submit && (
              <div className="mb-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || zonesLoading || zones.length === 0} 
          >
            {isSubmitting ? 'Updating...' : 'Update Counter'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default EditCounterModal;