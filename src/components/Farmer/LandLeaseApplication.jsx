
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import { motion } from 'framer-motion';
import { notificationService, getCurrentFarmer } from '../../services/notificationService';
import LandRegistration from './LandRegistration';
import LandLeaseOffering from './LandLeaseOffering';

import {
  MapPin,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Home,
  TreePine,
  Ruler,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Eye,
  Download,
  Plus,
  Trash2
} from 'lucide-react';

const LandLeaseApplication = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('land-registration');
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Modal states for new components
  const [showLandRegistration, setShowLandRegistration] = useState(false);
  const [showLeaseOffering, setShowLeaseOffering] = useState(false);

  
  // Application Form State
  const [applicationForm, setApplicationForm] = useState({
    // Personal Information
    applicantName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'male',
    phoneNumber: '',
    email: '',
    address: '',
    
    // Land Details
    desiredLocation: '',
    landSize: '',
    landType: 'agricultural',
    soilType: '',
    waterSource: '',
    accessibility: '',
    
    // Lease Details
    leaseDuration: '',
    proposedRent: '',
    paymentFrequency: 'monthly',
    intendedUse: 'rubber_plantation',
    
    // Experience & Financial
    farmingExperience: '',
    previousLandOwnership: 'no',
    financialCapacity: '',
    bankDetails: '',
    
    // Documents
    documents: [],
    
    // Additional Information
    references: '',
    additionalNotes: ''
  });

  // Existing applications - will be loaded from API
  const [myApplications, setMyApplications] = useState([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (field, value) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setApplicationForm(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Notification */}
      {notification.show && (
        <motion.div
          className={`fixed top-4 right-4 z-60 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notification.message}
        </motion.div>
      )}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-bold">{t('landLease.modalTitle')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">{t('landLease.modalSubtitle')}</p>
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'land-registration' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('land-registration')}
            >
              {t('landLease.tabLandRegistration')}
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'lease-offering' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('lease-offering')}
            >
              {t('landLease.tabTenancyOffering')}
            </button>
          </div>
          {activeTab === 'land-registration' && (
            <div className="text-center py-8">
              <p>{t('landLease.registerYourLandDesc')}</p>
              <button onClick={() => setShowLandRegistration(true)} className="mt-4 px-6 py-2 bg-green-500 text-white rounded">
                {t('landLease.registerNewLand')}
              </button>
            </div>
          )}
          {activeTab === 'lease-offering' && (
            <div className="text-center py-8">
              <p>{t('landLease.offerLandDesc')}</p>
              <button onClick={() => setShowLeaseOffering(true)} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded">
                {t('landLease.createTenancyOffer')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
      <LandRegistration isOpen={showLandRegistration} onClose={() => setShowLandRegistration(false)} />
      <LandLeaseOffering isOpen={showLeaseOffering} onClose={() => setShowLeaseOffering(false)} />
    </div>
  );
};

export default LandLeaseApplication;
