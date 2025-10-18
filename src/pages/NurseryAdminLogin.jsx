import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CubeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const NurseryAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://rubbereco-backend.onrender.com/api';
      const response = await fetch(`${API_BASE}/nursery-admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('nurseryAdminToken', data.token);
        localStorage.setItem('nurseryAdminUser', JSON.stringify(data.user));
        navigate('/nursery-admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CubeIcon className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Nursery Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your nursery operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Nursery Admin Login Credentials:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>1. GreenGrow Rubber Nursery:</strong></p>
                <p className="ml-4">📧 greengrownursery@gmail.com | 🔑 nursery@1</p>
                
                <p><strong>2. EcoRubber Nursery:</strong></p>
                <p className="ml-4">📧 ecorubbernursery@gmail.com | 🔑 nursery@2</p>
                
                <p><strong>3. Kerala Rubber Nursery:</strong></p>
                <p className="ml-4">📧 keralarubbernursery@gmail.com | 🔑 nursery@3</p>
                
                <p><strong>4. Farmers Choice Rubber Nursery:</strong></p>
                <p className="ml-4">📧 farmerschoicenursery@gmail.com | 🔑 nursery@4</p>
                
                <p><strong>5. Premium Rubber Nursery:</strong></p>
                <p className="ml-4">📧 premiumrubbernursery@gmail.com | 🔑 nursery@5</p>
                
                <p><strong>6. Kerala Agro Rubber Nursery:</strong></p>
                <p className="ml-4">📧 keralaagrorubbernursery@gmail.com | 🔑 nursery@6</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseryAdminLogin;
