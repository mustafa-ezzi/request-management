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
    HelperText
} from '@windmill/react-ui';
import { get, post } from '../api/axios';

const CreateCounterPackingModal = ({
    isOpen,
    onClose,
    miqaatId,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        miqaat: miqaatId,
        zone: '',
        sub_zone:'',
        miqaat_menu: '',
        unit: '',
        container: '',
        quantity: '',
        filled_percentage: ''
    });

    const [dropdownOptions, setDropdownOptions] = useState({
        zones: [],
        sub_zone: [],
        miqaat_menus: [],
        units: [],
        containers: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch dropdown options
    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const [zonesRes,SubzonesRes, miqaatMenusRes, unitsRes, containersRes] = await Promise.all([
                    get('/zone/list/'),
                    get('/sub-zone/list/'),
                    get(`/miqaat-menu/list/`),
                    get('/unit/list/'),
                    get('/container/list/')
                ]);

                setDropdownOptions({
                    zones: zonesRes,
                    sub_zone: SubzonesRes,
                    miqaat_menus: miqaatMenusRes,
                    units: unitsRes,
                    containers: containersRes
                });
            } catch (err) {
                console.error('Error fetching dropdown options:', err);
                setError('Failed to load dropdown options');
            }
        };

        if (isOpen) {
            fetchDropdownOptions();
        }
    }, [isOpen, miqaatId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare submission data
            const submissionData = {
                ...formData,
                miqaat: parseInt(miqaatId),
                zone: parseInt(formData.zone),
                miqaat_menu: parseInt(formData.miqaat_menu),
                unit: parseInt(formData.unit),
                container: parseInt(formData.container),
                quantity: parseInt(formData.quantity),
                filled_percentage: parseFloat(formData.filled_percentage)
            };

            // Validate required fields
            const requiredFields = ['zone', 'miqaat_menu', 'unit', 'container', 'quantity', 'filled_percentage'];
            const missingFields = requiredFields.filter(field => !submissionData[field] && submissionData[field] !== 0);

            if (missingFields.length > 0) {
                setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
                setIsSubmitting(false);
                return;
            }

            // Validate filled_percentage range
            if (submissionData.filled_percentage < 0 || submissionData.filled_percentage > 100) {
                setError('Filled percentage must be between 0 and 100');
                setIsSubmitting(false);
                return;
            }

            // Submit data
            const response = await post('/counter-packing/', submissionData);

            // Call success callback
            onSuccess(response);

            // Reset form and close modal
            setFormData({
                miqaat: miqaatId,
                zone: '',
                miqaat_menu: '',
                unit: '',
                container: '',
                quantity: '',
                filled_percentage: ''
            });
            onClose();
        } catch (err) {
            console.error('Error creating counter packing:', err);
            setError(err.response?.data?.message || 'Failed to create counter packing');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>Add Counter Packing</ModalHeader>
            <ModalBody>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Menu Selection */}
                        <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Menu</span>
                            <Select
                                name="miqaat_menu"
                                value={formData.miqaat_menu}
                                onChange={handleInputChange}
                                className="mt-1"
                                required
                            >
                                <option value="">Select Menu</option>
                                {dropdownOptions.miqaat_menus.map(menu => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.description}
                                    </option>
                                ))}
                            </Select>
                        </Label>

                       

     {/* Container Selection */}
     <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Container</span>
                            <Select
                                name="container"
                                value={formData.container}
                                onChange={handleInputChange}
                                className="mt-1"
                                required
                            >
                                <option value="">Select Container</option>
                                {dropdownOptions.containers.map(container => (
                                    <option key={container.id} value={container.id}>
                                        {container.name}
                                    </option>
                                ))}
                            </Select>
                        </Label>
                        
                        {/* Unit Selection */}
                        <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Unit</span>
                            <Select
                                name="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                className="mt-1"
                                required
                            >
                                <option value="">Select Unit</option>
                                {dropdownOptions.units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </Select>
                        </Label>

                   

                        {/* Quantity Input */}
                        <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Quantity</span>
                            <Input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="Enter quantity"
                                className="mt-1"
                                min="0"
                                required
                            />
                        </Label>

                         {/* Zone Selection */}
                        <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Zone</span>
                            <Select
                                name="zone"
                                value={formData.zone}
                                onChange={handleInputChange}
                                className="mt-1"
                                required
                            >
                                <option value="">Select Zone</option>
                                {dropdownOptions.zones.map(zone => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </Select>
                        </Label>

                         {/* Sub-Zone Selection */}
                        <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Zone</span>
                            <Select
                                name="sub_zone"
                                value={formData.sub_zone}
                                onChange={handleInputChange}
                                className="mt-1"
                            >
                                <option value="">Select Sub Zone</option>
                                {dropdownOptions.sub_zone.map(sub_zone => (
                                    <option key={sub_zone.id} value={sub_zone.id}>
                                        {sub_zone.name}
                                    </option>
                                ))}
                            </Select>
                        </Label>

                         {/* Filled Percentage Input */}
                        <Label className="block text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Filled Percentage</span>
                            <Input
                                type="number"
                                name="filled_percentage"
                                value={formData.filled_percentage}
                                onChange={handleInputChange}
                                placeholder="Enter filled percentage"
                                className="mt-1"
                                min="0"
                                max="100"
                                step="0.1"
                                required
                            />
                            <HelperText>Enter value between 0 and 100</HelperText>
                        </Label>
                    </div>
                </form>
            </ModalBody>
            <ModalFooter>
                <div className="hidden sm:block">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create'}
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
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default CreateCounterPackingModal;