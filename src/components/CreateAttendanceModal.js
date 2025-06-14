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
import toast from 'react-hot-toast';

const CreateAttendanceModal = ({
  isOpen,
  onClose,
  miqaatId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    member: '',
    zone: '',
    sub_zone: '',
    counter: '',
    checkin_time: '',
    checkout_time: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    members: [],
    counters: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch members and counters when modal opens
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [membersRes, countersRes] = await Promise.all([
          get('/member/list/'),
          get('/counter/list/')
        ]);

        setDropdownOptions({
          members: membersRes,
          counters: countersRes
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

    // If member is changed, update zone and sub_zone accordingly
    if (name === 'member') {
      const selectedMember = dropdownOptions.members.find(
        (member) => member.id.toString() === value
      );
      setFormData((prev) => ({
        ...prev,
        member: value,
        zone: selectedMember?.zone?.id || '',
        sub_zone: selectedMember?.sub_zone?.id || ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateTimes = (checkin, checkout) => {
    if (!checkin || !checkout) return true;

    const today = new Date().toISOString().split('T')[0];
    const checkinDate = new Date(`${today}T${checkin}`);
    const checkoutDate = new Date(`${today}T${checkout}`);

    return checkinDate <= checkoutDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['member', 'counter'];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Validate time range
      if (
        formData.checkin_time &&
        formData.checkout_time &&
        !validateTimes(formData.checkin_time, formData.checkout_time)
      ) {
        setError('Check-in time must be before or equal to check-out time');
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        miqaat: parseInt(miqaatId),
        member: parseInt(formData.member),
        zone: formData.zone ? parseInt(formData.zone) : null,
        sub_zone: formData.sub_zone ? parseInt(formData.sub_zone) : null,
        counter: parseInt(formData.counter),
        checkin_time: formData.checkin_time || null,
        checkout_time: formData.checkout_time || null
      };

      // Submit the form
      const response = await post('/miqaat-attendance/', submissionData);

      // Show success toast
      toast.success('Attendance record created successfully');

      // Call success callback
      onSuccess(response);

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error creating attendance record:', err);
      setError(err.response?.data?.message || 'Failed to create attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Add Attendance Record</ModalHeader>
      <ModalBody>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Member *</span>
              <Select
                name="member"
                value={formData.member}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Member</option>
                {dropdownOptions.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.its || `Member #${member.id}`}
                  </option>
                ))}
              </Select>
            </Label>

            {/* Zone Display */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Zone</span>
              <Input
                type="text"
                name="zone"
                value={
                  dropdownOptions.members.find(
                    (member) => member.id.toString() === formData.member
                  )?.zone?.name || ''
                }
                className="mt-1"
                readOnly
              />
            </Label>

            {/* Sub-Zone Display */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Sub-Zone</span>
              <Input
                type="text"
                name="sub_zone"
                value={
                  dropdownOptions.members.find(
                    (member) => member.id.toString() === formData.member
                  )?.sub_zone?.name || ''
                }
                className="mt-1"
                readOnly
              />
            </Label>

            {/* Check-in Time */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Check-in Time</span>
              <Input
                type="time"
                name="checkin_time"
                value={formData.checkin_time}
                onChange={handleInputChange}
                className="mt-1"
              />
            </Label>

            {/* Check-out Time */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">Check-out Time</span>
              <Input
                type="time"
                name="checkout_time"
                value={formData.checkout_time}
                onChange={handleInputChange}
                className="mt-1"
              />
            </Label>

            {/* Counter Dropdown */}
            <Label className="block text-sm col-span-1 md:col-span-2">
              <span className="text-gray-700 dark:text-gray-400">Counter *</span>
              <Select
                name="counter"
                value={formData.counter}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Counter</option>
                {dropdownOptions.counters.map((counter) => (
                  <option key={counter.id} value={counter.id}>
                    {counter.name || `Counter #${counter.id}`}
                  </option>
                ))}
              </Select>
            </Label>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="hidden sm:block">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Mobile buttons */}
        <div className="w-full sm:hidden">
          <Button block size="large" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CreateAttendanceModal;
