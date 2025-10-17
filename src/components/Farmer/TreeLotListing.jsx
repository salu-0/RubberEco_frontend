import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import CreateTreeLotModal from './CreateTreeLotModal';

const TreeLotListing = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [treeLots, setTreeLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadTreeLots();
  }, []);

  const loadTreeLots = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/tree-lots/farmer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Loaded tree lots:', data.data);
        setTreeLots(data.data || []);
      } else {
        console.error('Failed to load tree lots');
        setTreeLots([]);
      }
    } catch (error) {
      console.error('Error loading tree lots:', error);
      setTreeLots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (lotData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/tree-lots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lotData)
      });

      if (response.ok) {
        const data = await response.json();
        setTreeLots(prev => [data.data, ...prev]);
        setIsCreateModalOpen(false);
        return { success: true, message: 'Tree lot created successfully!' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to create tree lot' };
      }
    } catch (error) {
      console.error('Error creating tree lot:', error);
      return { success: false, message: 'Error creating tree lot' };
    }
  };

  const handleEditLot = async (lotId, lotData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tree-lots/${lotId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lotData)
      });

      if (response.ok) {
        const data = await response.json();
        setTreeLots(prev => prev.map(lot => 
          lot._id === lotId ? data.data : lot
        ));
        setIsEditModalOpen(false);
        setSelectedLot(null);
        return { success: true, message: 'Tree lot updated successfully!' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update tree lot' };
      }
    } catch (error) {
      console.error('Error updating tree lot:', error);
      return { success: false, message: 'Error updating tree lot' };
    }
  };

  const handleDeleteLot = async (lotId) => {
    if (!window.confirm('Are you sure you want to delete this tree lot?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/tree-lots/${lotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setTreeLots(prev => prev.filter(lot => lot._id !== lotId));
        return { success: true, message: 'Tree lot deleted successfully!' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to delete tree lot' };
      }
    } catch (error) {
      console.error('Error deleting tree lot:', error);
      return { success: false, message: 'Error deleting tree lot' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sold':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-gray-600">{t('treeLotManagement.loadingLots', 'Loading your tree lots...')}</p>
      </div>
    );
  }

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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('treeLotManagement.modalTitle', 'Tree Lot Management')}</h2>
                <p className="text-gray-600 mt-1">{t('treeLotManagement.modalSubtitle', 'Manage your rubber tree lots for lease or sale')}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t('treeLotManagement.myTreeLots', 'My Tree Lots')}</h3>
                    <p className="text-gray-600 mt-1">{t('treeLotManagement.myTreeLotsSubtitle', 'Manage your registered rubber tree lots for lease or sale')}</p>
                  </div>
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span>{t('treeLotManagement.addNewLot', 'Add New Lot')}</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TreePine className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('treeLotManagement.totalLots', 'Total Lots')}</p>
              <p className="text-2xl font-bold text-gray-900">{treeLots.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('treeLotManagement.lotStatusActive', 'Active')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {treeLots.filter(lot => lot.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('treeLotManagement.lotStatusDraft', 'Draft')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {treeLots.filter(lot => lot.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('treeLotManagement.lotStatusSold', 'Sold')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {treeLots.filter(lot => lot.status === 'sold').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Lots List */}
      <div className="space-y-4">
        {treeLots.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border-2 border-dashed border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TreePine className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('treeLotManagement.noLotsTitle', 'No tree lots yet')}</h3>
            <p className="text-gray-600 mb-4">{t('treeLotManagement.noLotsSubtitle', 'List your first rubber tree lot for bidding to get started')}</p>
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span>{t('treeLotManagement.listFirstLot', 'List your first lot')}</span>
            </motion.button>
          </motion.div>
        ) : (
          treeLots.map((lot, index) => {
            const daysRemaining = getDaysRemaining(lot.biddingEndDate);
            const isUrgent = daysRemaining <= 3 && lot.status === 'active';

            return (
              <motion.div
                key={lot._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Lot Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-lg font-bold text-gray-900">#{lot.lotId}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                          {getStatusIcon(lot.status)}
                          <span className="ml-1 capitalize">{lot.status}</span>
                        </span>
                        {isUrgent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('treeLotManagement.daysLeft', '{{count}} days left', { count: daysRemaining })}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{lot.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TreePine className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{lot.numberOfTrees} {t('treeLotManagement.trees','trees')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatCurrency(lot.minimumPrice)}</span>
                        </div>
                      </div>

                      {lot.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lot.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{lot.viewCount || 0} {t('treeLotManagement.views','views')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{lot.bidCount || 0} {t('treeLotManagement.bids','bids')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{t('treeLotManagement.ends','Ends')}: {new Date(lot.biddingEndDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-6">
                      <motion.button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          console.log('✏️ Edit button clicked for lot:', lot);
                          setSelectedLot(lot);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteLot(lot._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Tree Lot Modal */}
      <CreateTreeLotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLot}
      />

      {/* Edit Tree Lot Modal */}
      {selectedLot && (
        <CreateTreeLotModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLot(null);
          }}
          onSubmit={(lotData) => handleEditLot(selectedLot._id, lotData)}
          initialData={selectedLot}
          isEdit={true}
        />
      )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TreeLotListing;
