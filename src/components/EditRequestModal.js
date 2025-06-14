import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Label, Select,
} from '@windmill/react-ui';
import { patch, get } from '../api/axios';

function EditRequestModal({ isOpen, onClose, onRequestUpdated, requestData }) {
  const [formData, setFormData] = useState({
    its: '',
    type: '',
    meta: '',
    city: '',
    zone: '',
    toggle: '',
    pass_date: '',
  });
  const [permissionsList, setPermissionsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch permissions, cities, zones when opened
  useEffect(() => {
    if (!isOpen) return resetForm();

    const fetchList = async (url, setList, setErr, setLoading) => {
      setLoading(true);
      try {
        const res = await get(url);
        setList(Array.isArray(res.results) ? res.results : Array.isArray(res) ? res : []);
      } catch {
        setErr(prev => ({ ...prev, [url]: `Failed to load ${url}` }));
      } finally {
        setLoading(false);
      }
    };

    fetchList('/users/permissions/', setPermissionsList, setErrors, setIsLoadingPerms);
    fetchList('/requests/cities', setCitiesList, setErrors, setIsLoadingCities);
    fetchList('/requests/zones', setZonesList, setErrors, setIsLoadingZones);
  }, [isOpen]);

  // Prefill when requestData changes
  useEffect(() => {
    if (isOpen && requestData) {
      setFormData({
        its: requestData.its || '',
        type: requestData.type || '',
        meta: requestData.meta || '',
        city: requestData.city || null,
        zone: requestData.zone || null,
        toggle: requestData.toggle || null,
        pass_date: requestData.pass_date || null,
      });
    }
  }, [isOpen, requestData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!/^\d{8}$/.test(formData.its.trim())) {
      errs.its = 'ITS must be an 8-digit number.';
    }

    if (formData.type === 'pass_request') {
      if (!formData.toggle) errs.toggle = 'Please select waaz or majlis or bethak';
      if (!formData.pass_date) errs.pass_date = 'Please pick a date.';
    }

    if (formData.type === 'change_city_request' && !formData.city) {
      errs.city = 'Please select a city.';
    }

    if (formData.type === 'change_zone_request' && !formData.zone) {
      errs.zone = 'Please select a zone.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await patch(`/requests/requests/${requestData.id}/edit/`, formData);
      if (typeof onRequestUpdated === 'function') {
        onRequestUpdated();
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data ? 'Check the fields.' : 'Try again.';
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

  const { type } = formData;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Request</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          {/* ITS */}
          <Label className="mb-4">
            <span>ITS *</span>
            <Input
              name="its"
              value={formData.its}
              onChange={handleChange}
              maxLength={8}
            />
            {errors.its && <span className="text-xs text-red-600">{errors.its}</span>}
          </Label>

          {/* Type */}
          <Label className="mb-4">
            <span>Type *</span>
            <Select name="type" value={formData.type} onChange={handleChange} disabled={isLoadingPerms}>
              <option value="">Select a type</option>
              {permissionsList.map((perm, idx) => (
                <option key={idx} value={perm.code}>{perm.description || perm.code}</option>
              ))}
            </Select>
            {errors.type && <span className="text-xs text-red-600">{errors.type}</span>}
          </Label>

          {/* Conditional fields */}
          {type === 'change_city_request' && (
            <Label className="mb-4">
              <span>City *</span>
              <Select name="city" value={formData.city} onChange={handleChange} disabled={isLoadingCities}>
                <option value="">Select a city</option>
                {citiesList.map((c, i) => (
                  <option key={i} value={c.id || c.code || c}>{c.name || c.description || c}</option>
                ))}
              </Select>
              {errors.city && <span className="text-xs text-red-600">{errors.city}</span>}
            </Label>
          )}

          {type === 'change_zone_request' && (
            <Label className="mb-4">
              <span>Zone *</span>
              <Select name="zone" value={formData.zone} onChange={handleChange} disabled={isLoadingZones}>
                <option value="">Select a zone</option>
                {zonesList.map((z, i) => (
                  <option key={i} value={z.id || z.code || z}>{z.name || z.description || z}</option>
                ))}
              </Select>
              {errors.zone && <span className="text-xs text-red-600">{errors.zone}</span>}
            </Label>
          )}

          {type === 'pass_request' && (
            <>
              <Label className="mb-4">
                <span>Waaz/Majlis/Bethak *</span>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio" name="toggle" value="waaz"
                      checked={formData.toggle === 'waaz'} onChange={handleChange}
                    />
                    <span className="ml-2">Waaz</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio" name="toggle" value="majlis"
                      checked={formData.toggle === 'majlis'} onChange={handleChange}
                    />
                    <span className="ml-2">Majlis</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio" name="toggle" value="bethak"
                      checked={formData.toggle === 'bethak'} onChange={handleChange}
                    />
                    <span className="ml-2">Bethak</span>
                  </label>
                </div>
                {errors.toggle && <span className="text-xs text-red-600">{errors.toggle}</span>}
              </Label>

              <Label className="mb-4">
                <span>Pass Date *</span>
                <Input type="date" name="pass_date" value={formData.pass_date} onChange={handleChange} />
                {errors.pass_date && <span className="text-xs text-red-600">{errors.pass_date}</span>}
              </Label>
            </>
          )}

          {/* Meta */}
          <Label className="mb-4">
            <span>Meta</span>
            <textarea
              name="meta" value={formData.meta} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </Label>

          {/* Errors */}
          {errors.submit && <p className="text-red-600 mb-2">{errors.submit}</p>}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update Request'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default EditRequestModal;
