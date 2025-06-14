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
import { post, get } from '../api/axios';

function CreateRequestModal({ isOpen, onClose, onRequestCreated }) {
  const [formData, setFormData] = useState({
    its: '',
    type: '',
    meta: '',
    city: null,
    zone: null,
    toggle: null,
    pass_date: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [permissionsList, setPermissionsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingZones, setIsLoadingZones] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoadingPerms(true);
      try {
        const res = await get('/users/permissions/');
        setPermissionsList(Array.isArray(res) ? res : []);
      } catch {
        setErrors(prev => ({ ...prev, fetchPerms: 'Failed to load permissions' }));
      } finally {
        setIsLoadingPerms(false);
      }
    };

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await get('/requests/cities');
        setCitiesList(Array.isArray(res.results) ? res.results : []);
      } catch {
        setErrors(prev => ({ ...prev, fetchCities: 'Failed to load cities' }));
      } finally {
        setIsLoadingCities(false);
      }
    };

    const fetchZones = async () => {
      setIsLoadingZones(true);
      try {
        const res = await get('/requests/zones');
        setZonesList(Array.isArray(res.results) ? res.results : []);
      } catch {
        setErrors(prev => ({ ...prev, fetchZones: 'Failed to load zones' }));
      } finally {
        setIsLoadingZones(false);
      }
    };

    if (isOpen) {
      fetchPermissions();
      fetchCities();
      fetchZones();
    }
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({
      ...fd,
      [name]: value,
    }));
  };

  const valipass_dateForm = () => {
    const errs = {};
    if (!/^\d{8}$/.test(formData.its.trim())) {
      errs.its = 'ITS must be an 8-digit number.';
    }

    if (formData.type === 'pass_request') {
      if (!formData.toggle) errs.toggle = 'Please select waaz or majlis or bethak.';
      if (!formData.pass_date) errs.pass_date = 'Please pick a pass_date.';
    }
    if (formData.type === 'change_city_request') {
      if (!formData.city) errs.city = 'Please select a city.';
    }
    if (formData.type === 'change_zone_request') {
      if (!formData.zone) errs.zone = 'Please select a zone.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!valipass_dateForm()) return;

    try {
      setIsSubmitting(true);
      await post('/requests/create-request/', formData);
      setFormData({
    its: '',
    type: '',
    meta: '',
    city: null,
    zone: null,
    toggle: null,
    pass_date: null,
      });
      if (onRequestCreated) onRequestCreated();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data
        ? 'Failed to create request. Check the form.'
        : 'Failed to create request. Try again.';
      setErrors(prev => ({ ...prev, submit: msg, ...err.response?.data }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
    its: '',
    type: '',
    meta: '',
    city: null,
    zone: null,
    toggle: null,
    pass_date: null,
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const { type } = formData;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Add New Request</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          {/* ITS */}
          <div className="mb-4">
            <Label>
              <span>ITS *</span>
              <Input
                name="its"
                value={formData.its}
                onChange={handleChange}
                placeholder="Enter 8-digit ITS"
                maxLength={8}
              />
              {errors.its && <span className="text-xs text-red-600">{errors.its}</span>}
            </Label>
          </div>

          {/* Type */}
          <div className="mb-4">
            <Label>
              <span>Type *</span>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isLoadingPerms}
              >
                <option value="">Select a permission</option>
                {permissionsList.map((perm, i) => (
                  <option key={i} value={perm.code}>
                    {perm.description || perm.code}
                  </option>
                ))}
              </Select>
              {errors.type && <span className="text-xs text-red-600">{errors.type}</span>}
            </Label>
          </div>

          {/* Conditionally render inputs based on type */}
          {type === 'change_city_request' && (
            <div className="mb-4">
              <Label>
                <span>City *</span>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoadingCities}
                >
                  <option value="">Select a city</option>
                  {citiesList.map((c, i) => (
                    <option key={i} value={c.id || c.code || c}>
                      {c.name || c.description || c}
                    </option>
                  ))}
                </Select>
                {errors.city && <span className="text-xs text-red-600">{errors.city}</span>}
              </Label>
            </div>
          )}

          {type === 'change_zone_request' && (
            <div className="mb-4">
              <Label>
                <span>Zone *</span>
                <Select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  disabled={isLoadingZones}
                >
                  <option value="">Select a zone</option>
                  {zonesList.map((z, i) => (
                    <option key={i} value={z.id || z.code || z}>
                      {z.name || z.description || z}
                    </option>
                  ))}
                </Select>
                {errors.zone && <span className="text-xs text-red-600">{errors.zone}</span>}
              </Label>
            </div>
          )}

          {type === 'pass_request' && (
            <>
              <div className="mb-4">
                <Label>
                  <span>Waaz/Majlis/Bethak *</span>
                  <div className="mt-1 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="toggle"
                        value="waaz"
                        checked={formData.toggle === 'waaz'}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Waaz</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="toggle"
                        value="majlis"
                        checked={formData.toggle === 'majlis'}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Majlis</span>
                    </label>
                       <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="toggle"
                        value="bethak"
                        checked={formData.toggle === 'bethak'}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Bethak</span>
                    </label>
                  </div>
                  {errors.toggle && <span className="text-xs text-red-600">{errors.toggle}</span>}
                </Label>
              </div>

              {/* Date Picker */}
              <div className="mb-4">
                <Label>
                  <span>Date *</span>
                  <Input
                    type="date"
                    name="pass_date"
                    value={formData.pass_date}
                    onChange={handleChange}
                  />
                  {errors.pass_date && <span className="text-xs text-red-600">{errors.pass_date}</span>}
                </Label>
              </div>
            </>
          )}

          {/* Meta */}
          <div className="mb-4">
            <Label>
              <span>Meta</span>
              <textarea
                name="meta"
                value={formData.meta}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Additional info (optional)"
              />
            </Label>
          </div>

          {/* Errors */}
          {errors.fetchPerms && <p className="text-red-600 mb-2">{errors.fetchPerms}</p>}
          {errors.fetchCities && <p className="text-red-600 mb-2">{errors.fetchCities}</p>}
          {errors.fetchZones && <p className="text-red-600 mb-2">{errors.fetchZones}</p>}
          {errors.submit && <p className="text-red-600 mb-2">{errors.submit}</p>}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Request'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default CreateRequestModal;
