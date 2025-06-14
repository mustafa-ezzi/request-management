import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from '@windmill/react-ui';
import { get, put } from '../api/axios';
import toast from 'react-hot-toast';
import Select from 'react-select';

const EditUserModal = ({ isOpen, onClose, onUserUpdated, userData }) => {
    const [errors, setErrors] = useState({});
    const selectRef = useRef();


    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '58px',
            borderRadius: '0.375rem',
            borderColor: '#d1d5db',
            boxShadow: 'none',
        }),
        multiValue: (styles) => ({
            ...styles,
            backgroundColor: '#e5e7eb',
        }),
        multiValueLabel: (styles) => ({
            ...styles,
            color: '#1A1C23',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
            overflowY: 'auto',
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };




    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        precedence_level: '',
        custom_permissions: [],
    });

    const [permissionsList, setPermissionsList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Reset and populate form when modal opens or userData changes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
            return;
        }
        if (userData) {
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                username: userData.username || '',
                email: userData.email || '',
                password: '',
                precedence_level: userData.precedence_level || '',
                custom_permissions: Array.isArray(userData.custom_permissions) ? userData.custom_permissions : [],
            });
        }

        const fetchPermissionData = async () => {
            try {
                const response = await get('/users/seed-permissions/');
                setPermissionsList(response || []);
            } catch (err) {
                console.error('Error fetching permissions data:', err);
                setError('Failed to load permissions data');
            }
        };

        fetchPermissionData();
    }, [isOpen, userData]);

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            password: '',
            precedence_level: '',
            custom_permissions: [],
        });
        setErrors({});
        setError(null);
    };

    const handlePermissionsChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({
            ...prev,
            custom_permissions: selectedValues,
        }));
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const options = permissionsList.map(perm => ({
        value: perm.code,
        label: perm.description || perm.code,
    }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const precedence = parseInt(formData.precedence_level, 10);
        if (isNaN(precedence) || precedence < 1 || precedence > 5) {
            setError('Precedence level must be between 1 and 5.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                precedence_level: precedence,
                custom_permissions: formData.custom_permissions,
            };
            if (formData.password.trim() !== '') {
                payload.password = formData.password;
            }

            await put(`/users/update/${userData.id}/`, payload);
            toast.success('User updated successfully!');
            onUserUpdated();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to update user.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} style={{ maxWidth: '500px' }}>
            <ModalHeader>Edit User {formData.username}</ModalHeader>
            <ModalBody>
                {error && (
                    <div className="mb-4 text-sm text-red-600">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Two inputs per row */}
                    <div className="grid grid-cols-2 gap-4">
                        <Label>
                            <span>First Name</span>
                            <Input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </Label>
                        <Label>
                            <span>Last Name</span>
                            <Input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Label>
                            <span>ITS</span>
                            <Input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </Label>
                        <Label>
                            <span>Email</span>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Label>
                    </div>

                    {/* Single full-width fields */}
                    <Label>
                        <span>Password (leave empty to keep unchanged)</span>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </Label>

                    <Label>
                        <span>Precedence Level (1-5)</span>
                        <Input
                            type="number"
                            min="1"
                            max="5"
                            name="precedence_level"
                            value={formData.precedence_level}
                            onChange={handleChange}
                            required
                        />
                    </Label>

                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Permissions 
                        <Select
                            name="custom_permissions"
                            ref={selectRef}
                            isMulti
                            options={options}
                            value={options.filter(opt => formData.custom_permissions.includes(opt.value))}
                            onChange={handlePermissionsChange}
                            placeholder="Select permissions..."
                                                          menuPortalTarget={document.body}
  styles={customStyles}
                        />
                    </Label>



                </form>
            </ModalBody>

            <ModalFooter>
                <Button layout="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
            </ModalFooter>
        </Modal>

    );
};

export default EditUserModal;
