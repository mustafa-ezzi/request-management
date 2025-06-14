import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Textarea,
  Select,
} from "@windmill/react-ui";
import { get, post } from "../api/axios";
import toast from "react-hot-toast";

const CreateMiqaatMenuModal = ({
  isOpen,
  onClose,
  miqaatId,
  onSuccess,
  existingMenuItems,
}) => {
  const [formData, setFormData] = useState({
    miqaat: miqaatId || "",
    menu: "",
    description: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    menus: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch miqaat and menu lists
        const menusRes = await get("/menu/list/");

        const filteredMenus = menusRes.filter(
          (menu) =>
            !existingMenuItems.some(
              (existingItem) => existingItem.menu_id === menu.id
            )
        );

        setDropdownOptions({
          menus: filteredMenus,
        });
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
        setError("Failed to load dropdown options");
      }
    };

    if (isOpen) {
      fetchDropdownOptions();
    }
  }, [isOpen, existingMenuItems]);

  const handleInputChange = (e) => {
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

    try {
      // Validate required fields
      if (!formData.miqaat || !formData.menu) {
        setError("Please select both Miqaat and Menu items");
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        miqaat: parseInt(formData.miqaat),
        menu: parseInt(formData.menu),
        description: formData.description || "",
      };

      // Submit the form
      const response = await post("/miqaat-menu/", submissionData);

      // Call success callback
      onSuccess(response);

      // Reset form
      setFormData({
        miqaat: miqaatId || "",
        menu: "",
      });
      onClose();

      toast.success("Menu item added successfully");
    } catch (err) {
      console.error("Error creating miqaat menu record:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to create menu record";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Add Menu Item</ModalHeader>
      <ModalBody>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            {/* Menu Dropdown */}
            <Label className="block text-sm">
              <span className="text-gray-700 dark:text-gray-400">
                Menu Item
              </span>
              <Select
                name="menu"
                value={formData.menu}
                onChange={handleInputChange}
                className="mt-1"
                required
              >
                <option value="">Select Menu Item</option>
                {dropdownOptions.menus.length === 0 ? (
                  <option disabled>No available menu items</option>
                ) : (
                  dropdownOptions.menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name || `Menu #${menu.id}`}
                    </option>
                  ))
                )}
              </Select>
            </Label>
            <Label>
              <span>Description</span>
              <Textarea
                className="mt-1"
                name="description"
                value={formData.description}
                placeholder="Enter Description"
                rows="3"
                onChange={handleInputChange}
              />
            </Label>{" "}
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <div className="hidden sm:block">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || dropdownOptions.menus.length === 0}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Mobile Buttons */}
        <div className="w-full sm:hidden">
          <Button
            block
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || dropdownOptions.menus.length === 0}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default CreateMiqaatMenuModal;
