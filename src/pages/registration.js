import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Label, Button } from '@windmill/react-ui';
import { get, post } from '../api/axios';
import toast from 'react-hot-toast';
import { AiOutlineSearch } from 'react-icons/ai';
import { useHistory } from 'react-router-dom';
import logo from '../assets/img/mainLogo.png';

function MiqaatRegistrationPage() {
    const { miqaat_id } = useParams();
    const [its, setIts] = useState('');
    const [miqaatName, setMiqaatName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMiqaatName = async () => {
            try {
                const response = await get(`/miqaat/${miqaat_id}/`);
                setMiqaatName(response?.miqaat_name || 'Unknown Miqaat');
            } catch (err) {
                setError(err.error || 'An unexpected error occurred. Please try again.');
            }
        };

        fetchMiqaatName();
    }, [miqaat_id]);


    const history = useHistory();

    const handleNavigate = () => {
        history.push('/miqaat/history');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await post('/miqaat/register/', {
                its,
                miqaat_id,
            });
            toast.success(res.message || 'Registered successfully!');
            setIts('');
        } catch (err) {
            setError(err.error || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
<div
    className="relative min-h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/rice.jpg')" }}
>
    {/* CONTENT */}
    <div className="relative z-10 flex  items-center justify-center min-h-screen px-4 py-12">
<div
  className="w-full max-w-xl rounded-2xl shadow-xl p-10 sm:p-4 h-auto min-h-[450px] relative overflow-hidden"
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }}
>
            <div className="flex justify-center items-center">
                 <img src={logo} alt="Logo" className="h-25 w-auto"  />
            </div>
            {/* Heading */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 ">
                    Miqaat Registration
                </h1>
                <p className="mt-2 text-gray-600">
                    Miqaat:{' '}
                    <span className="font-semibold text-purple-700 ">
                        {miqaatName}
                    </span>
                </p>
            </div>

            {/* Form */}
            <form
  onSubmit={handleSubmit}
  className="flex flex-col sm:flex-row items-center gap-3 mb-8 justify-center w-full"
>
  <Label className="block text-gray-100 dark:text-gray-300 w-full sm:w-auto">
    <div className="relative mt-1">
      <Input
        type="text"
        value={its}
        onChange={(e) => setIts(e.target.value)}
        required
        placeholder="Enter your ITS number"
        className="w-full sm:w-64  rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
      />
    </div>
  </Label>

  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full sm:min-w-[160px] sm:w-auto flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
  >
    {isSubmitting ? 'Submitting...' : 'Register'}
  </button>

  <button
    onClick={handleNavigate}
    type="button"
    className="w-full sm:min-w-[160px] sm:w-auto flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
  >
    Attendance History
  </button>
</form>

            {error && (
                <p className="text-red-700 text-lg text-center mb-6 font-large animate-pulse">{error}</p>
            )}
        </div>
    </div>
</div>
    );


}

export default MiqaatRegistrationPage;
