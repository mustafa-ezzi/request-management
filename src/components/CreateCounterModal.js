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
import { post, get } from '../api/axios';
import toast from 'react-hot-toast';

function CreateCounterModal({ 
  isOpen, 
  onClose, 
  onCounterCreated 
}) {
  const [formData, setFormData] = useState({
    name: '',
    zone: ''
  });

  const [zones, setZones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset formData when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        zone: ''
      });
      setErrors({}); // Optionally reset errors
    }
  }, [isOpen]);

  // Fetch zones for the dropdown
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await get('/zone/list/'); // Adjust endpoint if needed
        setZones(response);
      } catch (error) {
        console.error('Error fetching zones:', error);
        toast.error('Failed to load zones');
      }
    };

    if (isOpen) {
      fetchZones();
    }
  }, [isOpen]);

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
        zone: parseInt(formData.zone) // Assuming zone ID is sent as integer
      };
      
      await post('/counter/', dataToSubmit);
      
      // Show success toast
      toast.success('Counter created successfully');
      
      if (onCounterCreated) {
        onCounterCreated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating counter:', error);
      setErrors({ submit: 'Failed to create counter. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Create New Counter</ModalHeader>
      <ModalBody>
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
                  <option key={zone.id} value={zone.id}>
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
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Counter'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default CreateCounterModal;