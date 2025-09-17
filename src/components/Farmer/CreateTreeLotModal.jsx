import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  TreePine,
  DollarSign,
  Calendar,
  Upload,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { isRequired, numericValidator } from '../../utils/validation';

const CreateTreeLotModal = ({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    location: '',
    numberOfTrees: '',
    approximateYield: '',
    minimumPrice: '',
    description: '',
    biddingEndDate: '',
    treeAge: '',
    tappingSchedule: '',
    roadAccess: true,
    truckAccess: true,
    accessibilityDescription: '',
    additionalInfo: ''
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isEdit && initialData) {
      console.log('🔄 Edit mode - populating form with initial data:', initialData);
      const formDataToSet = {
        location: initialData.location || '',
        numberOfTrees: initialData.numberOfTrees || '',
        approximateYield: initialData.approximateYield || '',
        minimumPrice: initialData.minimumPrice || '',
        description: initialData.description || '',
        biddingEndDate: initialData.biddingEndDate ? new Date(initialData.biddingEndDate).toISOString().split('T')[0] : '',
        treeAge: initialData.treeAge || '',
        tappingSchedule: initialData.tappingSchedule || '',
        roadAccess: initialData.accessibility?.roadAccess ?? true,
        truckAccess: initialData.accessibility?.truckAccess ?? true,
        accessibilityDescription: initialData.accessibility?.description || '',
        additionalInfo: initialData.additionalInfo || ''
      };
      console.log('📝 Setting form data:', formDataToSet);
      setFormData(formDataToSet);
      // Normalize images to objects with a preview field
      const normalizedImages = (initialData.images || []).map((img, idx) =>
        typeof img === 'string' ? { file: null, preview: img, name: `image-${idx+1}` } : img
      );
      setImages(normalizedImages);
    } else {
      // Reset form for new lot
      setFormData({
        location: '',
        numberOfTrees: '',
        approximateYield: '',
        minimumPrice: '',
        description: '',
        biddingEndDate: '',
        treeAge: '',
        tappingSchedule: '',
        roadAccess: true,
        truckAccess: true,
        accessibilityDescription: '',
        additionalInfo: ''
      });
      setImages([]);
    }
    setErrors({});
  }, [isOpen, isEdit, initialData]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    const locErr = isRequired(formData.location, 'Location is required');
    if (locErr) newErrors.location = locErr;

    const treesErr = numericValidator(formData.numberOfTrees, { min: 1 });
    if (treesErr) newErrors.numberOfTrees = treesErr === 'This field is required' ? 'Number of trees is required' : treesErr;

    const yieldErr = isRequired(formData.approximateYield, 'Approximate yield is required');
    if (yieldErr) newErrors.approximateYield = yieldErr;

    const priceErr = numericValidator(formData.minimumPrice, { min: 1 });
    if (priceErr) newErrors.minimumPrice = priceErr === 'This field is required' ? 'Minimum price is required' : priceErr;

    if (!formData.biddingEndDate) newErrors.biddingEndDate = 'Bidding end date is required';
    if (formData.biddingEndDate) {
      const endDate = new Date(formData.biddingEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (endDate <= today) {
        newErrors.biddingEndDate = 'Bidding end date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    console.log(`📝 Input changed: ${name} = ${newValue}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submit started');
    console.log('📋 Current form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        numberOfTrees: parseInt(formData.numberOfTrees),
        minimumPrice: parseInt(formData.minimumPrice),
        treeAge: formData.treeAge && formData.treeAge.toString().trim() ? formData.treeAge.toString().trim() : '',
        tappingSchedule: formData.tappingSchedule && formData.tappingSchedule.trim() ? formData.tappingSchedule.trim() : '',
        images: [], // TODO: Implement proper image upload
        accessibility: {
          roadAccess: formData.roadAccess,
          truckAccess: formData.truckAccess,
          description: formData.accessibilityDescription || ''
        },
        additionalInfo: formData.additionalInfo && formData.additionalInfo.trim() ? formData.additionalInfo.trim() : ''
      };
      
      console.log('📤 Frontend sending data:', JSON.stringify(submitData, null, 2));
      

      const result = await onSubmit(submitData);
      
      if (result.success) {
        showNotification(result.message, 'success');
        onClose();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Tree Lot' : 'List New Tree Lot'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isEdit ? 'Update your tree lot information' : 'Create a new tree lot for bidding'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TreePine className="h-5 w-5 mr-2 text-green-600" />
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter location (e.g., Kottayam, Kerala)"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TreePine className="h-4 w-4 inline mr-1" />
                      Number of Trees *
                    </label>
                    <input
                      type="number"
                      name="numberOfTrees"
                      value={formData.numberOfTrees}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.numberOfTrees ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter number of trees"
                      min="1"
                    />
                    {errors.numberOfTrees && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.numberOfTrees}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approximate Yield *
                    </label>
                    <input
                      type="text"
                      name="approximateYield"
                      value={formData.approximateYield}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.approximateYield ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 2-3 kg per tree per day"
                    />
                    {errors.approximateYield && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.approximateYield}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Minimum Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="minimumPrice"
                      value={formData.minimumPrice}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.minimumPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter minimum price"
                      min="0"
                    />
                    {errors.minimumPrice && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.minimumPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Bidding End Date *
                    </label>
                    <input
                      type="date"
                      name="biddingEndDate"
                      value={formData.biddingEndDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.biddingEndDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.biddingEndDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.biddingEndDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Additional Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tree Age (years)
                    </label>
                    <input
                      type="number"
                      name="treeAge"
                      value={formData.treeAge}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter tree age"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tapping Schedule
                    </label>
                    <input
                      type="text"
                      name="tappingSchedule"
                      value={formData.tappingSchedule}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Daily, Alternate days"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe your tree lot..."
                    />
                  </div>
                </div>
              </div>

              {/* Accessibility */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="roadAccess"
                      checked={formData.roadAccess}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Road Access Available</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="truckAccess"
                      checked={formData.truckAccess}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Truck Access Available</label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessibility Description
                  </label>
                  <textarea
                    name="accessibilityDescription"
                    value={formData.accessibilityDescription}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe access conditions..."
                  />
                </div>
              </div>

              {/* Images */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Images
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload images</span>
                    <span className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB each</span>
                  </label>
                </div>
                {Array.isArray(images) && images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={typeof image === 'string' ? image : image?.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any additional information about your tree lot..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Lot' : 'Create Lot')}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Notification */}
          {notification.show && (
            <motion.div
              className="fixed top-4 right-4 z-60 px-6 py-3 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              style={{
                backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white'
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTreeLotModal;
