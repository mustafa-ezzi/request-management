import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from '@windmill/react-ui';
import { post, get } from '../api/axios';
import toast from 'react-hot-toast';
import Select from 'react-select';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
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
        precedence_level: '', // instead of null
        custom_permissions: [],
    });

    const [permissionsList, setPermissionsList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            password: '',
            precedence_level: '', // instead of null
            custom_permissions: [],
        });
        setErrors({});
    };

    React.useEffect(() => {
        if (!isOpen) {
            resetForm();
        }

        const fetchPermissionData = async () => {
            try {
                const response = await get('/users/seed-permissions/');
                setPermissionsList(response || []);

            } catch (err) {
                console.error('Error fetching permissions data:', err);
                setError('Failed to load permissions data');
            } finally {
            }
        };

        fetchPermissionData();
    }, [isOpen]);

    const options = permissionsList.map(perm => ({
        value: perm.code,
        label: perm.description || perm.code,
    }));
    const handlePermissionsChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({
            ...prev,
            custom_permissions: selectedValues,
        }));
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


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
                ...formData,
            };

            await post('/users/create/', payload);
            toast.success('User created successfully!');
            onUserCreated();
            onClose();

        }
        catch (error) {
            console.error('Error creating request:', error);
            if (error.response && error.response.data) {
                // Display backend validation errors
                setErrors({
                    ...error.response.data.username,
                    ...errors,
                    submit: error.response.data.username,
                });
                console.log(error.response.data.username)
            } else {
                setErrors({ submit: 'Failed to create request. Please try again.' });
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} style={{ maxWidth: '500px' }}>
            <ModalHeader>Create New User</ModalHeader>
            <ModalBody>
                {error && (
                    <div className="mb-4 text-sm text-red-600">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Use grid for pairs */}
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

                    {/* Single full width fields below */}
                    <Label>
                        <span>Password</span>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Label>

                    <Label>
                        <span>Precedence Level (1-5)</span>
                        <Input
                            type="number"
                            name="precedence_level"
                            value={formData.precedence_level}
                            onChange={handleChange}
                            required
                            min="1"
                            max="5"
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
                    {errors.fetch && (
                        <div className="mb-4">
                            <p className="text-sm text-red-600">{errors.fetch}</p>
                        </div>
                    )}
                    {errors.submit && (
                        <div className="mb-4">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}
                </form>
            </ModalBody>

            <ModalFooter>
                <Button layout="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
            </ModalFooter>
        </Modal>

    );
};

export default CreateUserModal;
