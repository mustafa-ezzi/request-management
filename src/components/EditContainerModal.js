import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label
} from '@windmill/react-ui';
import { patch } from '../api/axios';
import toast from 'react-hot-toast';

function EditContainerModal({ 
  isOpen, 
  onClose, 
  onContainerUpdated, 
  containerData 
}) {
  const [formData, setFormData] = useState({
    name: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or containerData changes
  useEffect(() => {
    if (containerData) {
      setFormData({
        name: containerData.name || ''
      });
    }
  }, [containerData]);

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
      newErrors.name = 'Container name is required';
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
        name: formData.name.trim()
      };
      
      // Send PATCH request to update container
      await patch(`/container/${containerData.id}/`, dataToSubmit);
      
      // Call the callback to refresh the container list
      if (onContainerUpdated) {
        onContainerUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating container:', error);
      setErrors({ submit: 'Failed to update container. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Container</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label>
              <span>Container Name *</span>
              <Input 
                className="mt-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter container name"
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
            {isSubmitting ? 'Updating...' : 'Update Container'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default EditContainerModal;