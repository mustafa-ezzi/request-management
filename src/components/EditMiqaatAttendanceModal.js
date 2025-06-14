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
  HelperText,
} from '@windmill/react-ui';
import { get, patch } from '../api/axios';
import toast from 'react-hot-toast';

const EditMiqaatAttendanceModal = ({
  isOpen,
  onClose,
  miqaatId,
  attendanceData,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId,
    zone: '',
    member: '',
    counter: '',
    checkin_time: '',
    checkout_time: '',
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    zones: [],
    members: [],
    counters: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      setIsDropdownLoading(true);
      try {
        const [zonesRes, membersRes, countersRes] = await Promise.all([
          get('/zone/list/'),
          get('/member/list/'),
          get('/counter/list/'),
        ]);

        setDropdownOptions({
          zones: Array.isArray(zonesRes) ? zonesRes : zonesRes.results || [],
          members: Array.isArray(membersRes) ? membersRes : membersRes.results || [],
          counters: Array.isArray(countersRes) ? countersRes : countersRes.results || [],
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
  }, [isOpen]);

  // Set form data after dropdown options are loaded or attendanceData changes
  useEffect(() => {
    if (attendanceData && !isDropdownLoading) {
      setFormData({
        miqaat: miqaatId,
        zone: attendanceData.zone_id || (attendanceData.zone?.id ?? ''),
        member: attendanceData.member_id || (attendanceData.member?.id ?? ''),
        counter: attendanceData.counter_id || (attendanceData.counter?.id ?? ''),
        checkin_time: attendanceData.checkin_time || '',
        checkout_time: attendanceData.checkout_time || '',
      });
    }
  }, [attendanceData, miqaatId, isDropdownLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateTimes = (checkin, checkout) => {
    if (!checkin || !checkout) return true;

    const today = new Date().toISOString().split('T')[0];
    const checkinDate = new Date(`${today}T${checkin}`);
    const checkoutDate = new Date(`${today}T${checkout}`);

    return checkoutDate >= checkinDate; // Ensure checkout is after checkin
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['zone', 'member', 'counter', 'checkin_time', 'checkout_time'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate dropdown selections
      if (!dropdownOptions.zones.some(zone => zone.id === parseInt(formData.zone))) {
        throw new Error('Please select a valid zone');
      }
      if (!dropdownOptions.members.some(member => member.id === parseInt(formData.member))) {
        throw new Error('Please select a valid member');
      }
      if (!dropdownOptions.counters.some(counter => counter.id === parseInt(formData.counter))) {
        throw new Error('Please select a valid counter');
      }

      // Validate time range
      if (!validateTimes(formData.checkin_time, formData.checkout_time)) {
        throw new Error('Check-out time must be after check-in time');
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        miqaat: parseInt(miqaatId),
        zone: parseInt(formData.zone),
        member: parseInt(formData.member),
        counter: parseInt(formData.counter),
      };

      // Submit the form
      await patch(`/miqaat-attendance/${attendanceData.id}/`, submissionData);

      toast.success('Attendance record updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating attendance record:', err);
      setError(err.message || 'Failed to update attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Attendance Record</ModalHeader>
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
              {/* Member Dropdown */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Member *</span>
                <Select
                  name="member"
                  value={formData.member}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Member</option>
                  {dropdownOptions.members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.its || `Member #${member.id}`}
                    </option>
                  ))}
                </Select>
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



              {/* Check-in Time */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Check-in Time *</span>
                <Input
                  type="time"
                  name="checkin_time"
                  value={formData.checkin_time}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                />
              </Label>

              {/* Check-out Time */}
              <Label className="block text-sm">
                <span className="text-gray-700 dark:text-gray-400">Check-out Time *</span>
                <Input
                  type="time"
                  name="checkout_time"
                  value={formData.checkout_time}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <option value="">Select Counter</option>
                  {dropdownOptions.counters.map(counter => (
                    <option key={counter.id} value={counter.id}>
                      {counter.name || `Counter #${counter.id}`}
                    </option>
                  ))}
                </Select>
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

export default EditMiqaatAttendanceModal;