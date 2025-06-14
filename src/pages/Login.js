import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Label, Input, Button, HelperText } from '@windmill/react-ui'
import { get, post } from '../api/axios'
import Footer from "../components/Footer";
import logoLight from '../assets/img/mainLogo.png';
import logoDark from '../assets/img/mainLogo-dark.png';


function Login() {
  const history = useHistory();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [unitData, setInfoData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchInofData = async () => {
    try {
      setIsLoading(true);
      const response = await get('/users/me');

      if (response?.role) {
        localStorage.setItem("role", response.role);
      }

      setInfoData(response);
    } catch (err) {
      console.error('Error fetching permissions data:', err);
      setError('Failed to load permissions data');
    } finally {
      setIsLoading(false);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!credentials.username || !credentials.password) {
    setError('username and password are required');
    return;
  }

  setIsLoading(true);

  try {
    const response = await post('/users/login/', {
      username: credentials.username,
      password: credentials.password,
    });

    if (response) {
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('role', response.user.role); // Save role directly from login response
      }
    }

    // Fetch additional user info & role from /users/me if you need to update or verify
    // Await here to make sure it's done before redirecting
    await fetchInofData();

    // Now get the role from localStorage (should be set by either login or fetchInofData)
    const role = localStorage.getItem('role');
    let redirectPath = '/app/request'; // default for admin

    if (role === 'super_admin') {
      redirectPath = '/app/users';
    }

    history.push(redirectPath);

  } catch (err) {
    console.error('Login error:', err);
    setError(
      err?.response?.data?.detail || 'Invalid username or password. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};



  return (
    <>
      <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 h-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="overflow-y-auto">
            <main className="flex items-center justify-center p-6 sm:p-12 md:w-full">
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="flex justify-center items-center">
  {/* Light Mode Logo */}
  <img
    src={logoLight}
    alt="Logo Light"
    className="h-20 w-auto dark:hidden"
  />

  {/* Dark Mode Logo */}
  <img
    src={logoDark}
    alt="Logo Dark"
    className="h-20 w-auto hidden dark:block"
  />
</div>
                <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Login</h1>

                {error && (
                  <HelperText className="mb-4" valid={false}>
                    {error}
                  </HelperText>
                )}

                <Label>
                  <Input
                    className="mt-1"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="username"
                  />
                </Label>

                <Label className="mt-4">
                  <div className="relative">
                    <Input
                      className="mt-1 pr-10"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus:ring-0"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 focus:outline-none focus:ring-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 focus:outline-none focus:ring-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Label>

                <Button
                  className="mt-4"
                  block
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Button>

              </form>
            </main>
          </div>
          <hr />
          <Footer />
        </div>

      </div>
    </>
  )
}

export default Login