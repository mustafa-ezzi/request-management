import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Label,
    Input,
    Select
} from '@windmill/react-ui';
import { get, post } from '../api/axios';

function CreateDistributionModal({ isOpen, onClose, onSuccess }) {
    const { id } = useParams(); // Get miqaat ID if present in URL
    const [formData, setFormData] = useState({
        miqaat: id || '',
        zone: '',
        counter_packing: '',
        ibadullah_count: 0,
        mumin_count: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [zones, setZones] = useState([]);
    const [counterPackings, setCounterPackings] = useState([]);

    // Fetch zones and counter packings when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchZones();
            fetchCounterPackings();
        }
    }, [isOpen, id]);

    const fetchZones = async () => {
        try {
            const response = await get('/zone/list/');
            setZones(response);
        } catch (error) {
            console.error('Error fetching zones:', error);
            setError('Failed to load zones data');
        }
    };

    const fetchCounterPackings = async () => {
        try {
            let url = `/counter-packing/${id}/`;

            const response = await get(url);
            setCounterPackings(response.counter_packing);
        } catch (error) {
            console.error('Error fetching counter packings:', error);
            setError('Failed to load counter packings data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert string values to numbers where needed
            const payload = {
                ...formData,
                ibadullah_count: parseInt(formData.ibadullah_count, 10),
                mumin_count: parseInt(formData.mumin_count, 10),
                miqaat: parseInt(formData.miqaat, 10),
                zone: parseInt(formData.zone, 10),
                counter_packing: parseInt(formData.counter_packing, 10)
            };

            const response = await post('/distribution/', payload);

            // Reset form and close modal
            setFormData({
                miqaat: id || '',
                zone: '',
                counter_packing: '',
                ibadullah_count: 0,
                mumin_count: 0
            });

            onSuccess(response);
            onClose();
        } catch (error) {
            console.error('Error creating distribution:', error);
            setError('Failed to create distribution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>Add New Distribution</ModalHeader>
            <ModalBody>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Label className="mt-4">
                        <span>Zone</span>
                        <Select
                            className="mt-1"
                            name="zone"
                            value={formData.zone}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a zone</option>
                            {zones.map(zone => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                </option>
                            ))}
                        </Select>
                    </Label>

                    <Label className="mt-4">
                        <span>Counter Packing</span>
                        <Select
                            className="mt-1"
                            name="counter_packing"
                            value={formData.counter_packing}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a counter packing</option>
                            {counterPackings.map(cp => (
                                <option key={cp.id} value={cp.id}>
                                    {cp.menu_name},  Quantity: {cp.quantity} (Fill: {cp.filled_percentage}%)
                                </option>
                            ))}
                        </Select>
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Label>
                            <span>Ibadullah Count</span>
                            <Input
                                className="mt-1"
                                type="number"
                                name="ibadullah_count"
                                value={formData.ibadullah_count}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Label>

                        <Label>
                            <span>Mumin Count</span>
                            <Input
                                className="mt-1"
                                type="number"
                                name="mumin_count"
                                value={formData.mumin_count}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Label>
                    </div>

                    {/* Hidden input for miqaat ID if needed */}
                    <input
                        type="hidden"
                        name="miqaat"
                        value={formData.miqaat}
                    />
                </form>
            </ModalBody>
            <ModalFooter>
                <div className="flex justify-end space-x-2">

                    <Button disabled={loading} onClick={handleSubmit}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}

export default CreateDistributionModal;