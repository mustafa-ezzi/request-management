import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
} from '@windmill/react-ui';
import { patch } from '../api/axios';

function EditZoneModal({ isOpen, onClose, onZoneUpdated, zoneData }) {
  const [formData, setFormData] = useState({
    name: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or zoneData changes
  useEffect(() => {
    if (zoneData) {
      setFormData({
        name: zoneData.name || '',
      });
    }
  }, [zoneData]);

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
      newErrors.name = 'Zone name is required';
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
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        // Convert empty strings to null for optional fields
      };
      
      // Send PATCH request to update zone
      await patch(`requests/zones/${zoneData.id}/edit/`, dataToSubmit);
      
      // Call the callback to refresh the zone list
      if (onZoneUpdated) {
        onZoneUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating zone:', error);
      if (error.response && error.response.data) {
        // Display backend validation errors
        setErrors({ 
          ...errors,
          submit: 'Failed to update zone. Please check the form for errors.',
          ...error.response.data 
        });
      } else {
        setErrors({ submit: 'Failed to update zone. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Zone</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label>
              <span>Zone Name *</span>
              <Input 
                className="mt-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter zone name"
              />
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name}</span>
              )}
            </Label>
          </div>
          
          {errors.submit && (
            <div className="mb-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
       
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Zone'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default EditZoneModal;