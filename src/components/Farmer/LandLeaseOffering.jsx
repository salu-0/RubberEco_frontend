import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationService } from '../../services/notificationService';
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Eye,
  Plus,
  TreePine,
  Ruler,
  FileText,
  Users,
  Star,
  Edit,
  Trash2
} from 'lucide-react';

const LandLeaseOffering = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('create-offering');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Verified lands (from registration) - will be loaded from API
  const [verifiedLands, setVerifiedLands] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadVerifiedLands();
    loadMyOfferings();
  }, []);

  const loadVerifiedLands = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🏞️ Loading verified lands - Token:', token ? 'Present' : 'Missing');

      if (!token) {
        console.log('❌ No authentication token found. Using dummy token for testing.');
        localStorage.setItem('token', 'dummy-token-for-testing');
        localStorage.setItem('currentUser', JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'farmer'
        }));
        setTimeout(() => loadVerifiedLands(), 100);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/land-registration/my-lands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🏞️ All lands from API:', data.data);

        // Only show verified lands that are not already offered for lease
        const verifiedOnly = (data.data || []).filter(land => {
          const isNotOffered = !land.isAvailableForTenancy;
          const isVerified = land.status === 'verified';
          console.log(`🏞️ Land ${land.id}: status=${land.status}, isNotOffered=${isNotOffered}, isVerified=${isVerified}`);
          return isVerified && isNotOffered;
        });

        console.log('🏞️ Verified lands available for tenancy:', verifiedOnly);
        setVerifiedLands(verifiedOnly);
      }
    } catch (error) {
      console.error('Error loading verified lands:', error);
    }
  };

  const loadMyOfferings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🏞️ Loading my offerings - Token:', token ? 'Present' : 'Missing');

      if (!token) {
        console.log('❌ No authentication token found. Please login first.');
        setMyOfferings([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tenancy-offerings/my-offerings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyOfferings(data.data || []);
      }
    } catch (error) {
      console.error('Error loading my offerings:', error);
    }
  };

  // Tenancy Offering Form State
  const [offeringForm, setOfferingForm] = useState({
    selectedLandId: '',
    tenancyDuration: '',
    minimumDuration: '',
    maximumDuration: '',
    tenancyRate: '',
    rateType: 'per_hectare_per_year',
    paymentTerms: 'annual',
    securityDeposit: '',
    
    // Tenancy Terms
    allowedActivities: ['rubber_tapping'],
    restrictions: '',
    maintenanceResponsibility: 'tenant',
    infrastructureProvided: [],

    // Availability
    availableFrom: '',
    preferredTenantType: 'any',
    minimumExperience: '',
    
    // Additional Terms
    renewalOption: 'negotiable',
    terminationClause: '',
    additionalTerms: '',
    
    // Contact Preferences
    contactMethod: 'phone',
    bestTimeToContact: 'morning',
    showContactDetails: true
  });

  // Existing offerings - will be loaded from API
  const [myOfferings, setMyOfferings] = useState([]);

  const handleInputChange = (field, value) => {
    setOfferingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, value, checked) => {
    setOfferingForm(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmitOffering = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // Call API to create tenancy offering
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tenancy-offerings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(offeringForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create tenancy offering');
      }

      // Add to local state for immediate UI update
      const selectedLand = verifiedLands.find(land => land.id === offeringForm.selectedLandId);
      const newOffering = {
        id: data.data.offeringId,
        landId: offeringForm.selectedLandId,
        landTitle: selectedLand?.landTitle || 'Unknown Land',
        landLocation: selectedLand?.landLocation || 'Unknown Location',
        totalArea: selectedLand?.totalArea || 'Unknown Area',
        leaseDuration: `${offeringForm.minimumDuration}-${offeringForm.maximumDuration} years`,
        leaseRate: `₹${offeringForm.tenancyRate} ${offeringForm.rateType.replace('_', ' ')}`,
        status: 'available',
        createdDate: new Date().toISOString().split('T')[0],
        inquiries: 0,
        views: 0,
        ...data.data
      };
      
      setMyOfferings(prev => [newOffering, ...prev]);

      // Send notification to admin, tappers, brokers, and workers
      const farmerData = {
        name: currentUser.name || 'Unknown Farmer',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      };

      const landData = {
        landTitle: selectedLand?.landTitle || 'Unknown Land',
        landLocation: selectedLand?.landLocation || 'Unknown Location',
        district: selectedLand?.district || 'Unknown District',
        totalArea: selectedLand?.totalArea || 'Unknown Area'
      };

      notificationService.addTenancyOfferingNotification(data.data, landData, farmerData);

      // Refresh the verified lands list (remove the offered land)
      loadVerifiedLands();

      // Reset form
      setOfferingForm({
        selectedLandId: '',
        leaseDuration: '',
        minimumDuration: '',
        maximumDuration: '',
        tenancyRate: '',
        rateType: 'per_hectare_per_year',
        paymentTerms: 'annual',
        securityDeposit: '',
        allowedActivities: ['rubber_tapping'],
        restrictions: '',
        maintenanceResponsibility: 'tenant',
        infrastructureProvided: [],
        availableFrom: '',
        preferredTenantType: 'any',
        minimumExperience: '',
        renewalOption: 'negotiable',
        terminationClause: '',
        additionalTerms: '',
        contactMethod: 'phone',
        bestTimeToContact: 'morning',
        showContactDetails: true
      });

      setNotification({
        show: true,
        message: 'Rubber tapping tenancy offering created successfully! It will be visible to potential tenants.',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);

    } catch (error) {
      console.error('Error creating offering:', error);
      setNotification({
        show: true,
        message: 'Failed to create offering. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active', icon: CheckCircle },
      paused: { color: 'bg-yellow-100 text-yellow-800', text: 'Paused', icon: AlertCircle },
      expired: { color: 'bg-red-100 text-red-800', text: 'Expired', icon: X }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const availableLands = verifiedLands.filter(land => !land.isAvailableForTenancy);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rubber Tapping Tenancy Offering</h2>
              <p className="text-blue-100">Offer your verified land for rubber tapping tenancy to potential tenants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <motion.div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('create-offering')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create-offering'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Offering
            </button>
            <button
              onClick={() => setActiveTab('my-offerings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-offerings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              My Offerings ({myOfferings.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'create-offering' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {availableLands.length === 0 ? (
                <div className="text-center py-12">
                  <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Lands</h3>
                  <p className="text-gray-500 mb-4">
                    You need to have <strong>admin-verified</strong> lands that are not currently offered for lease.
                    If you have registered lands, please wait for admin verification.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Register New Land
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitOffering} className="space-y-8">
                  {/* Land Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      Select Land to Offer
                    </h3>
                    <div className="grid gap-4">
                      {availableLands.map((land) => (
                        <div
                          key={land.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            offeringForm.selectedLandId === land.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleInputChange('selectedLandId', land.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {land.landTitle || `Land at ${land.landLocation}`}
                              </h4>
                              <p className="text-gray-600 flex items-center mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {land.landLocation}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Ruler className="h-4 w-4 text-gray-400" />
                                  <span>{land.totalArea}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400">Soil:</span>
                                  <span>{land.soilType}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400">Water:</span>
                                  <span>{land.waterSource}</span>
                                </div>
                                {land.existingTrees === 'yes' && (
                                  <div className="flex items-center space-x-2">
                                    <TreePine className="h-4 w-4 text-green-500" />
                                    <span>{land.numberOfTrees} trees</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              offeringForm.selectedLandId === land.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {offeringForm.selectedLandId === land.id && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lease Terms */}
                  {offeringForm.selectedLandId && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Tenancy Terms & Conditions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Tenancy Duration (Years) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="50"
                            value={offeringForm.minimumDuration}
                            onChange={(e) => handleInputChange('minimumDuration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Tenancy Duration (Years) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="50"
                            value={offeringForm.maximumDuration}
                            onChange={(e) => handleInputChange('maximumDuration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tenancy Rate *
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                              ₹
                            </span>
                            <input
                              type="number"
                              required
                              min="1"
                              value={offeringForm.tenancyRate}
                              onChange={(e) => handleInputChange('tenancyRate', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="25000"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rate Type *
                          </label>
                          <select
                            required
                            value={offeringForm.rateType}
                            onChange={(e) => handleInputChange('rateType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="per_hectare_per_year">Per Hectare Per Year</option>
                            <option value="per_acre_per_year">Per Acre Per Year</option>
                            <option value="total_per_year">Total Per Year</option>
                            <option value="per_hectare_per_month">Per Hectare Per Month</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Terms *
                          </label>
                          <select
                            required
                            value={offeringForm.paymentTerms}
                            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="annual">Annual Payment</option>
                            <option value="semi_annual">Semi-Annual Payment</option>
                            <option value="quarterly">Quarterly Payment</option>
                            <option value="monthly">Monthly Payment</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Security Deposit
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={offeringForm.securityDeposit}
                              onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="50000"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available From *
                          </label>
                          <input
                            type="date"
                            required
                            value={offeringForm.availableFrom}
                            onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Tenant Type
                          </label>
                          <select
                            value={offeringForm.preferredTenantType}
                            onChange={(e) => handleInputChange('preferredTenantType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="any">Any Qualified Tenant</option>
                            <option value="individual">Individual Farmers</option>
                            <option value="company">Companies/Organizations</option>
                            <option value="cooperative">Cooperatives</option>
                            <option value="experienced">Experienced Only</option>
                          </select>
                        </div>
                      </div>

                      {/* Allowed Activities */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Allowed Activities *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            'rubber_tapping',
                            'rubber_plantation',
                            'intercropping',
                            'livestock_grazing',
                            'beekeeping',
                            'organic_farming'
                          ].map((activity) => (
                            <label key={activity} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={offeringForm.allowedActivities.includes(activity)}
                                onChange={(e) => handleArrayInputChange('allowedActivities', activity, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {activity.replace('_', ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Additional Terms */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Terms & Conditions
                        </label>
                        <textarea
                          value={offeringForm.additionalTerms}
                          onChange={(e) => handleInputChange('additionalTerms', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter any additional terms, restrictions, or special conditions..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !offeringForm.selectedLandId}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Create Offering
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'my-offerings' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {myOfferings.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Offerings</h3>
                    <p className="text-gray-500 mb-4">You haven't created any lease offerings yet.</p>
                    <button
                      onClick={() => setActiveTab('create-offering')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Your First Offering
                    </button>
                  </div>
                ) : (
                  myOfferings.map((offering) => (
                    <div key={offering.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{offering.landTitle}</h3>
                            {getStatusBadge(offering.status)}
                          </div>
                          <p className="text-gray-600 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {offering.landLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="text-sm font-medium text-gray-900">{offering.createdDate}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Area: {offering.totalArea}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Duration: {offering.leaseDuration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Rate: {offering.leaseRate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{offering.inquiries} inquiries</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                          <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{offering.views} views</span>
                          <span>ID: {offering.id}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LandLeaseOffering;
