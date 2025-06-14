import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import toast from 'react-hot-toast'

import ImageLight from '../assets/img/create-account-office.jpeg'
import ImageDark from '../assets/img/create-account-office-dark.jpeg'
import { GithubIcon, TwitterIcon } from '../icons'
import { Input, Label, Button, HelperText } from '@windmill/react-ui'
import { post } from '../api/axios'

function Signup() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      
      const response = await post('/signup/', payload);
      
      
      toast.success('Account created successfully!', {
        duration: 4000, 
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: 'white',
        },
      });
      
      history.push('/login');
    } catch (err) {
      console.error('Signup error:', err);
            toast.error(
        err.response?.data?.message || 
        'Failed to create account. Please try again.',
        {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#FF5252',
            color: 'white',
          },
        }
      );
      
      setError(
        err.response?.data?.message || 
        'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col overflow-y-auto md:flex-row">
          <main className="flex items-center justify-center p-6 sm:p-12 md:w-full">
            <form className="w-full" onSubmit={handleSubmit}>
              <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
                Create account
              </h1>
              
              {error && (
                <HelperText className="mt-1 mb-4" valid={false}>
                  {error}
                </HelperText>
              )}
              
              <Label>
                <span>Full Name</span>
                <Input 
                  className="mt-1" 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                />
              </Label>
              
              <Label className="mt-4">
                <span>Email</span>
                <Input 
                  className="mt-1" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@doe.com" 
                />
              </Label>
              
              <Label className="mt-4">
                <span>Password</span>
                <Input 
                  className="mt-1" 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="***************" 
                />
              </Label>
              
              <Label className="mt-4">
                <span>Confirm password</span>
                <Input 
                  className="mt-1" 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="***************" 
                />
              </Label>

              <Button 
                type="submit" 
                block 
                className="mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <hr className="my-8" />

              <p className="mt-4">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/login"
                >
                  Already have an account? Login
                </Link>
              </p>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Signup