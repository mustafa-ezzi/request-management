import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { get, patch } from '../api/axios'
import PageTitle from '../components/Typography/PageTitle'
import SectionTitle from '../components/Typography/SectionTitle'
import { Input, Label, Select, Textarea, Button } from '@windmill/react-ui'
import { toast } from 'react-hot-toast'
import {
  AiOutlineArrowLeft,
} from "react-icons/ai";
const EditMiqaatForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    miqaat_name: '',
    miqaat_date: '',
    hijri_date: '',
    miqaat_type: 'general_miqaats',
    description: '',

  });

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
    if (formData.miqaat_date) {
      const hijriDate = convertToHijri(formData.miqaat_date);
      setFormData(prevData => ({
        ...prevData,
        hijri_date: hijriDate
      }));
    }
  }, [formData.miqaat_date]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchMiqaatData = async () => {
      try {
        const response = await get(`/miqaat/${id}/`);
        
        // Convert date to proper format for date input
        const formattedDate = response.miqaat_date 
          ? new Date(response.miqaat_date).toISOString().split('T')[0] 
          : '';

        // Update form data with fetched data
        setFormData({
          miqaat_name: response.miqaat_name || '',
          miqaat_date: formattedDate,
          hijri_date: response.hijri_date || '',
          miqaat_type: response.miqaat_type || 'general_miqaats',
          description: response.description || '',
          thaals_polled: response.thaals_polled || 0,
          thaals_cooked: response.thaals_cooked || 0,
          thaals_served: response.thaals_served || 0
        });
        
        // If miqaat_date exists but hijri_date is empty, calculate it
        if (formattedDate && !response.hijri_date) {
          const hijriDate = convertToHijri(formattedDate);
          setFormData(prev => ({
            ...prev,
            hijri_date: hijriDate
          }));
        }
      } catch (error) {
        console.error('Error fetching Miqaat data:', error);
        toast.error('Failed to load Miqaat data');
      }
    };

    fetchMiqaatData();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Skip updating hijri_date directly as it's now auto-calculated
    if (name !== 'hijri_date') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleBackClick = () => {
    history.goBack();
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        // Ensure numeric fields are converted to numbers
        thaals_polled: parseInt(formData.thaals_polled) || 0,
        thaals_cooked: parseInt(formData.thaals_cooked) || 0,
        thaals_served: parseInt(formData.thaals_served) || 0
      };

      // Submit the form
      await patch(`/miqaat/${id}/`, submissionData);
      
      // Show success message
      toast.success('Miqaat updated successfully');
      
      // Redirect based on miqaat_type
      history.push(`/app/tables?miqaat_type=${formData.miqaat_type}`);
    } catch (error) {
      console.error('Error updating Miqaat:', error);
      toast.error('Failed to update Miqaat');
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <>
      <PageTitle> <button onClick={handleBackClick} className="mr-4">
                  <AiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
                </button> Edit Miqaat</PageTitle>

     <form onSubmit={handleSubmit}>
  <SectionTitle>Miqaat Details</SectionTitle>

  <div className="px-4 py-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">

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
    </Label>

    {/* Miqaat Type */}
    <Label>
      <span>Miqaat Type</span>
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

    {/* Submit Button */}
    <div className="md:col-span-2 flex justify-center md:justify-end mt-6">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update Miqaat'}
      </Button>
    </div>

  </div>
</form>

    </>
  );
}

export default EditMiqaatForm