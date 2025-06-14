import React, { useState, useEffect } from 'react'; // Add useEffect import
import { useHistory } from 'react-router-dom';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label
} from '@windmill/react-ui';
import { post } from '../api/axios';
import { toast } from 'react-hot-toast';

const CreateCityModal = ({ 
  isOpen, 
  onClose,
  onCityCreated
}) => {
  const history = useHistory();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset formData when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        name: '',
      });
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('City name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        name: formData.name.trim(),
      };

      // Submit to backend
      const response = await post('requests/cities/', submissionData);
      // Show success toast
      toast.success('City created successfully');
      
      // Close the modal first
      onClose();
      
      // Trigger list refresh
      onCityCreated();
      
      // Then redirect to city list
      history.push('/app/city');
    } catch (error) {
      console.error('Error creating city:', error);
      toast.error(error.response?.data?.message || 'Failed to create city');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Create New City</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <Label className="block mb-4">
            <span>City Name</span>
            <Input 
              className="mt-1"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter city name" 
              required
            />
          </Label>

         
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="hidden sm:block">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create City'}
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
            {isSubmitting ? 'Creating...' : 'Create City'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CreateCityModal;