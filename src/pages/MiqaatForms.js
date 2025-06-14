import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { post, get } from '../api/axios'
import CTA from '../components/CTA'
import PageTitle from '../components/Typography/PageTitle'
import SectionTitle from '../components/Typography/SectionTitle'
import { Input, HelperText, Label, Select, Textarea, Button } from '@windmill/react-ui'
import { toast } from 'react-hot-toast'
import {
  AiOutlineArrowLeft,
} from "react-icons/ai";
function Forms() {
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedMiqaatType = queryParams.get('miqaat_type');
  const miqaatType = queryParams.get('miqaat_type');

  const [formData, setFormData] = useState({
    miqaat_name: '',
    miqaat_date: '',
    hijri_date: '',
    miqaat_type: preselectedMiqaatType || '',
    description: '',
    zones: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleBackClick = () => {
    history.goBack();
  };
  const convertToHijri = (gregorianDateString) => {
    const gregorianDate = new Date(gregorianDateString);

    if (isNaN(gregorianDate.getTime())) {
      return "";
    }

    const referenceGregorian = new Date(2025, 2, 13);
    const referenceHijri = { year: 1446, month: 9, day: 14 };

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const totalDaysDifference = Math.floor(
      (gregorianDate - referenceGregorian) / millisecondsPerDay
    );

    const hijriYearLength = 354;

    const yearDifference = Math.floor(totalDaysDifference / hijriYearLength);
    const remainingDays = totalDaysDifference % hijriYearLength;

    let currentYear = referenceHijri.year + yearDifference;
    let currentMonth = referenceHijri.month;
    let currentDay = referenceHijri.day + remainingDays;

    const monthNames = [
      "Moharramul Haram",
      "Safarul Muzaffar",
      "Rabiul Awwal",
      "Rabiul Akhar",
      "Jumadil Ula",
      "Jumadal Ukhra",
      "Rajabal Asab",
      "Shabanul Karim",
      "Ramadanal Moazzam",
      "Shawwalul Mukarram",
      "Ziqadatil Haram",
      "Zilhajatil Haram",
    ];

    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30];

    while (currentDay > monthLengths[currentMonth - 1]) {
      currentDay -= monthLengths[currentMonth - 1];
      currentMonth++;

      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    while (currentDay < 1) {
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
      currentDay += monthLengths[currentMonth - 1];
    }

    return `${currentDay} ${monthNames[currentMonth - 1]} ${currentYear}`;
  };

  // Update hijri_date automatically when miqaat_date changes
  useEffect(() => {
    fetchZones()

    if (formData.miqaat_date) {
      const hijriDate = convertToHijri(formData.miqaat_date);
      setFormData(prevData => ({
        ...prevData,
        hijri_date: hijriDate
      }));
    };
  }, [formData.miqaat_date]);

  // Function to get user-friendly filter name
  const getMiqaatTypeDisplayName = (filterValue) => {
    switch (filterValue) {
      case 'general_miqaats':
        return 'General Miqaats';
      case 'private_events':
        return 'Private Events';
      case 'ramadan':
        return 'Ramadan';
      default:
        return filterValue;
    }
  };
  const getPageTitle = () => {
    switch (miqaatType) {
      case 'general_miqaats':
        return 'Create General Miqaat';
      case 'ramadan':
        return 'Create Ramadan';
      case 'private_events':
        return 'Create Private Event';
      default:
        return 'Miqaats';
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only update if the field is not miqaat_type when it's preselected
    // And don't update hijri_date directly since it's read-only now
    if (!(preselectedMiqaatType && name === 'miqaat_type') && name !== 'hijri_date') {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = ['miqaat_name', 'miqaat_date', 'miqaat_type'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      console.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        // Ensure numeric fields are converted to numbers
        // thaals_polled: parseInt(formData.thaals_polled) || 0,
        // thaals_cooked: parseInt(formData.thaals_cooked) || 0,
        // thaals_served: parseInt(formData.thaals_served) || 0
      };

      // Submit the form
      const response = await post('/miqaat/', submissionData);

      // Show success toast
      toast.success('Miqaat created successfully');

      // Optionally redirect or reset form
      history.push(`/miqaat-menu/${response.id}`);
    } catch (err) {
      console.error('Error creating miqaat:', err);
      toast.error(err.response?.data?.message || 'Failed to create miqaat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [zones, setZones] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);

  const fetchZones = async () => {
    const zonesResponse = await get('/zone/list/');
    setZones(zonesResponse);
  }

  const handleZoneChange = (zoneId) => {
    setFormData((prevFormData) => {
      const isSelected = prevFormData.zones.includes(zoneId);
      const updatedZones = isSelected
        ? prevFormData.zones.filter(id => id !== zoneId)
        : [...prevFormData.zones, zoneId];

      return {
        ...prevFormData,
        zones: updatedZones,
      };
    });
  };

  return (
    <>
      <PageTitle> <button onClick={handleBackClick} className="mr-4">
        <AiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
      </button>{getPageTitle()}</PageTitle>

<form onSubmit={handleSubmit}>
  <div className="px-4 grid grid-cols-1 gap-6 md:grid-cols-2 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">

    {/* Miqaat Name */}
    <Label>
      <span>Miqaat Name</span>
      <Input
        className="mt-1"
        name="miqaat_name"
        value={formData.miqaat_name}
        onChange={handleChange}
        placeholder="Enter miqaat name"
        required
      />
    </Label>

    {/* Miqaat Type */}
    <Label>
      <span>Miqaat Type</span>
      {preselectedMiqaatType ? (
        <div className="mt-1 py-2 px-3 border rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {getMiqaatTypeDisplayName(preselectedMiqaatType)}
        </div>
      ) : (
        <Select
          className="mt-1"
          name="miqaat_type"
          value={formData.miqaat_type}
          onChange={handleChange}
          required
        >
          <option value="general_miqaats">General Miqaats</option>
          <option value="private_events">Private Events</option>
          <option value="ramadan">Ramadan</option>
        </Select>
      )}
      {preselectedMiqaatType && (
        <input type="hidden" name="miqaat_type" value={preselectedMiqaatType} />
      )}
    </Label>

    {/* Miqaat Date */}
    <Label>
      <span>Miqaat Date</span>
      <Input
        type="date"
        className="mt-1"
        name="miqaat_date"
        value={formData.miqaat_date}
        onChange={handleChange}
        required
      />
    </Label>

    {/* Hijri Date */}
    <Label>
      <span>Hijri Date</span>
      <Input
        className="mt-1"
        name="hijri_date"
        value={formData.hijri_date}
        readOnly
        disabled
        placeholder="Automatically calculated from Miqaat Date"
      />
      <HelperText>This field is automatically calculated from the Miqaat Date</HelperText>
    </Label>

    {/* Description - Full Width */}
    <div className="md:col-span-2">
      <Label>
        <span>Description</span>
        <Textarea
          className="mt-1"
          rows="4"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter miqaat description"
        />
      </Label>
    </div>

    {/* Zones - Full Width, Last */}
    <div className="md:col-span-2">
      <Label className="mt-4">
        <span>Select Zones</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {zones.map((zone) => (
            <label key={zone.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={zone.id}
                checked={formData.zones.includes(zone.id)}
                onChange={() => handleZoneChange(zone.id)}
                className="form-checkbox text-purple-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{zone.name}</span>
            </label>
          ))}
        </div>
      </Label>
    </div>

    {/* Submit */}
    <div className="md:col-span-2 flex md:justify-end justify-center mt-6">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Miqaat'}
      </Button>
    </div>
  </div>
</form>

    </>
  )
}

export default Forms;