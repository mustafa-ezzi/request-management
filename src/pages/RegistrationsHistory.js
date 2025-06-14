import React, { useState } from 'react';
import { post } from '../api/axios';
import { AiOutlineSearch } from 'react-icons/ai';
import logo from '../assets/img/mainLogo.png';

const AttendanceHistoryPage = () => {
  const [its, setIts] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAttendanceData([]);
    setLoading(true);

    try {
      const response = await post('/attendance/history/', { its });
      const dataArray = Array.isArray(response) ? response : [response];
      setAttendanceData(dataArray);
    } catch (err) {
      setError(err?.detail || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-gray-900" style={{ backgroundImage: "url('/rice.jpg')" }}>
      {/* BLUR LAYER */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-0"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div   className="w-full max-w-xl rounded-2xl shadow-xl p-10 sm:p-12 h-auto min-h-[450px] relative overflow-hidden"
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }}>
          {/* Logo */}
         <div className="flex justify-center items-center">
                 <img src={logo} alt="Logo" className="h-25 w-auto" />
          </div>
          {/* Heading */}
          <h2 className="text-3xl sm:text-3xl font-extrabold text-center text-gray-700  mb-6 tracking-tight">
            Miqaat Attendance History
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mb-8 justify-center">
            <input
              type="text"
              value={its}
              onChange={(e) => setIts(e.target.value)}
              placeholder="Enter ITS number"
              required
              className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AiOutlineSearch className="mr-1.5 text-base" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-lg text-center mb-6 font-medium animate-pulse">{error}</p>
          )}

          {/* Results */}
          {attendanceData.length > 0 ? (
            <div className="overflow-x-auto rounded-lg  border-gray-200 dark:border-gray-700">
              <table className="min-w-full table-auto text-sm text-left text-gray-700 dark:text-gray-200">
                <thead className="bg-indigo-600 text-white dark:bg-indigo-800">
                  <tr>
                    {['Miqaat Name', 'Miqaat Date', 'Zone', 'Sub Zone', 'Check-in', 'Check-out'].map((header) => (
                      <th key={header} className="px-4 sm:px-6 py-3 font-semibold tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {attendanceData.map((record, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="px-4 sm:px-6 py-3">{record.miqaat_name}</td>
                      <td className="px-4 sm:px-6 py-3">{record.miqaat_date}</td>
                      <td className="px-4 sm:px-6 py-3">{record.zone_name}</td>
                      <td className="px-4 sm:px-6 py-3">{record.sub_zone_name}</td>
                      <td className="px-4 sm:px-6 py-3">{record.checkin_time || '—'}</td>
                      <td className="px-4 sm:px-6 py-3">{record.checkout_time || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading &&
            !error && (
              <p className="text-center text-gray-700 mt-6 text-lg">
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;