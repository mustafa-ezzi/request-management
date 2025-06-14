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
  Textarea
} from '@windmill/react-ui';
import { patch, get } from '../api/axios';

function EditMemberModal({ isOpen, onClose, onMemberUpdated, memberData }) {
  const [formData, setFormData] = useState({
    its: '',
    full_name: '',
    zone: '',
    miqaat: '',
    contact_number: '',
    whatsapp_number: '',
    email_address: '',
    mohalla: ''
  });
  
  const [zones, setZones] = useState([]);
  const [miqaats, setMiqaats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Initialize form data when modal opens or memberData changes
  useEffect(() => {
    if (memberData) {
      setFormData({
        its: memberData.its || '',
        full_name: memberData.full_name || '',
        zone: memberData.zone ? memberData.zone.id : '',
        miqaat: memberData.miqaat ? memberData.miqaat.id : '',
        contact_number: memberData.contact_number || '',
        whatsapp_number: memberData.whatsapp_number || '',
        email_address: memberData.email_address || '',
        mohalla: memberData.mohalla || ''
      });
    }
  }, [memberData]);

  // Fetch zones and miqaats data when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptionsData();
    }
  }, [isOpen]);

  const fetchOptionsData = async () => {
    setIsLoadingOptions(true);
    try {
      // Fetch zones data (adjust the endpoint as per your API)
      const zonesResponse = await get('/zone/list/');
      setZones(zonesResponse);

      // Fetch miqaats data (adjust the endpoint as per your API)
      const miqaatsResponse = await get('/miqaat/list/');
      setMiqaats(miqaatsResponse);
    } catch (error) {
      console.error('Error fetching options data:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.its.trim()) {
      newErrors.its = 'ITS is required';
    } else if (formData.its.length > 8) {
      newErrors.its = 'ITS cannot exceed 8 characters';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (formData.email_address && !/^\S+@\S+\.\S+$/.test(formData.email_address)) {
      newErrors.email_address = 'Invalid email format';
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
        contact_number: formData.contact_number || null,
        whatsapp_number: formData.whatsapp_number || null,
        email_address: formData.email_address || null,
        mohalla: formData.mohalla || null,
        // Convert empty strings to null for foreign keys
        zone: formData.zone || null,
        miqaat: formData.miqaat || null
      };
      
      // Send PATCH request to update member
      await patch(`/member/${memberData.id}/`, dataToSubmit);
      
      // Call the callback to refresh the member list
      if (onMemberUpdated) {
        onMemberUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      setErrors({ submit: 'Failed to update member. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Member</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* ITS Number */}
            <div className="mb-4">
              <Label>
                <span>ITS Number *</span>
                <Input 
                  className="mt-1"
                  name="its"
                  value={formData.its}
                  onChange={handleChange}
                  placeholder="Enter ITS number"
                  maxLength={8}
                />
                {errors.its && (
                  <span className="text-xs text-red-600">{errors.its}</span>
                )}
              </Label>
            </div>
            
            {/* Full Name */}
            <div className="mb-4">
              <Label>
                <span>Full Name *</span>
                <Input 
                  className="mt-1"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <span className="text-xs text-red-600">{errors.full_name}</span>
                )}
              </Label>
            </div>

            {/* Zone */}
            <div className="mb-4">
              <Label>
                <span>Zone</span>
                <Select
                  className="mt-1"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  disabled={isLoadingOptions}
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </Select>
              </Label>
            </div>

            {/* Miqaat */}
            <div className="mb-4">
              <Label>
                <span>Miqaat</span>
                <Select
                  className="mt-1"
                  name="miqaat"
                  value={formData.miqaat}
                  onChange={handleChange}
                  disabled={isLoadingOptions}
                >
                  <option value="">Select Miqaat</option>
                  {miqaats.map((miqaat) => (
                    <option key={miqaat.id} value={miqaat.id}>
                      {miqaat.miqaat_name}
                    </option>
                  ))}
                </Select>
              </Label>
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <Label>
                <span>Contact Number</span>
                <Input 
                  className="mt-1"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </Label>
            </div>

            {/* WhatsApp Number */}
            <div className="mb-4">
              <Label>
                <span>WhatsApp Number</span>
                <Input 
                  className="mt-1"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                />
              </Label>
            </div>

            {/* Email Address */}
            <div className="mb-4">
              <Label>
                <span>Email Address</span>
                <Input 
                  className="mt-1"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  type="email"
                />
                {errors.email_address && (
                  <span className="text-xs text-red-600">{errors.email_address}</span>
                )}
              </Label>
            </div>
          </div>

          {/* Mohalla - Full width */}
          <div className="mb-4">
            <Label>
              <span>Mohalla</span>
              <Textarea 
                className="mt-1"
                name="mohalla"
                value={formData.mohalla}
                onChange={handleChange}
                placeholder="Enter mohalla details"
                rows="3"
              />
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
            {isSubmitting ? 'Updating...' : 'Update Member'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default EditMemberModal;