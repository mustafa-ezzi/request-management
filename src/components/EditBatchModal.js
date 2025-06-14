import React, { useState, useEffect } from "react";
import { patch, get } from "../api/axios";
import toast from "react-hot-toast";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
} from "@windmill/react-ui";

function EditBatchModal({ isOpen, onClose, onBatchUpdated, batchData }) {
  const [name, setName] = useState("");
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  const fetchRequests = async () => {
    try {
      const res = await get("requests/requests");
      const unbatched = Array.isArray(res.results) ? res.results : [];

      // Combine current batch's requests with unbatched
      const assigned = batchData?.requests || [];
      const combined = [...assigned, ...unbatched.filter(r => !assigned.some(a => a.id === r.id))];

      setRequests(combined);
    } catch (e) {
      console.error("Error fetching requests:", e);
    }
  };

  if (isOpen) {
    fetchRequests();
    setName(batchData?.name || "");
    setSelectedIds(batchData?.request_ids || []);
    setErrors({});
  }
}, [isOpen, batchData]);


  const handleCheckbox = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (selectedIds.length === 0) errs.requests = "Select at least one request";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await patch(`requests/batch/${batchData.id}/edit/`, {
        name,
        request_ids: selectedIds,
      });
      toast.success("Batch updated successfully");

      if (typeof onBatchUpdated === "function") {
        onBatchUpdated();
      }

      onClose();
    } catch (e) {
      console.error("Submit error:", e);
      setErrors({ submit: "Failed to update batch. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <ModalHeader>Edit Batch</ModalHeader>
          <button onClick={onClose}>✖️</button>
        </div>

        <div className="p-6">
          <Label className="block mb-4">
            <span>Batch Name *</span>
            <Input
              className="mt-1"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter batch name"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </Label>

          <div className="mb-4 overflow-x-auto border rounded-md">
            <label className="block text-sm font-medium mb-2 dark:text-white">Select Requests *</label>
            <table className="min-w-full text-sm text-left table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === requests.length}
                      onChange={(e) =>
                        setSelectedIds(e.target.checked ? requests.map(r => r.id) : [])
                      }
                    />
                  </th>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(req.id)}
                        onChange={() => handleCheckbox(req.id)}
                      />
                    </td>
                    <td className="px-3 py-2">{req.id}</td>
                    <td className="px-3 py-2">{req.type || '—'}</td>
                    <td className="px-3 py-2">{req.type === 'change_city_request' && req.city_name}
                      {req.type === 'change_zone_request' && req.zone_name}
                      {req.type === 'pass_request' &&
                        `${req.toggle?.toUpperCase()} - ${req.pass_date}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.requests && (
              <p className="text-xs text-red-600 mt-2">{errors.requests}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600 mt-2">{errors.submit}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSubmitting ? "Updating..." : "Update Batch"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditBatchModal;
