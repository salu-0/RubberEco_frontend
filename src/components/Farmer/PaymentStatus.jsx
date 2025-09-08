import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  FileText,
  RefreshCw,
  TrendingUp,
  Wallet
} from 'lucide-react';

const PaymentStatus = ({ isOpen, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadPayments();
    }
  }, [isOpen]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, typeFilter]);

  const loadPayments = async () => {
    try {
      // TODO: Replace with actual API call to fetch real payment data
      // For now, setting empty array - no mock data
      const payments = [];

      setPayments(payments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payments:', error);
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.type === typeFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Approved' },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Overdue' },
      failed: { color: 'bg-red-100 text-red-800', icon: X, text: 'Failed' },
      processing: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, text: 'Processing' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      rubber_sale: 'Rubber Sale',
      service_payment: 'Service Payment',
      subsidy: 'Government Subsidy',
      training_fee: 'Training Fee',
      equipment_purchase: 'Equipment Purchase',
      loan_payment: 'Loan Payment'
    };
    
    return typeLabels[type] || type;
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      rubber_sale: DollarSign,
      service_payment: User,
      subsidy: TrendingUp,
      training_fee: FileText,
      equipment_purchase: Wallet,
      loan_payment: CreditCard
    };
    
    return typeIcons[type] || DollarSign;
  };

  const refreshPayments = () => {
    setLoading(true);
    loadPayments();
  };

  const calculateSummary = () => {
    const completed = filteredPayments.filter(p => p.status === 'completed');
    const pending = filteredPayments.filter(p => p.status === 'pending' || p.status === 'approved');
    const overdue = filteredPayments.filter(p => p.status === 'overdue');

    const totalCompleted = completed.reduce((sum, p) => sum + parseFloat(p.amount.replace(/[₹,]/g, '')), 0);
    const totalPending = pending.reduce((sum, p) => sum + parseFloat(p.amount.replace(/[₹,]/g, '')), 0);
    const totalOverdue = overdue.reduce((sum, p) => sum + parseFloat(p.amount.replace(/[₹,]/g, '')), 0);

    return {
      completed: { count: completed.length, amount: totalCompleted },
      pending: { count: pending.length, amount: totalPending },
      overdue: { count: overdue.length, amount: totalOverdue }
    };
  };

  const summary = calculateSummary();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment Status</h2>
              <p className="text-green-100">Track all your payments and transactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshPayments}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-800">₹{summary.completed.amount.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{summary.completed.count} payments</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">₹{summary.pending.amount.toLocaleString()}</p>
                  <p className="text-xs text-yellow-600">{summary.pending.count} payments</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-800">₹{summary.overdue.amount.toLocaleString()}</p>
                  <p className="text-xs text-red-600">{summary.overdue.count} payments</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="rubber_sale">Rubber Sale</option>
                <option value="service_payment">Service Payment</option>
                <option value="subsidy">Government Subsidy</option>
                <option value="training_fee">Training Fee</option>
                <option value="equipment_purchase">Equipment Purchase</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-300px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">No payments match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment, index) => {
                const TypeIcon = getTypeIcon(payment.type);
                return (
                  <motion.div
                    key={payment.id}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Payment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          <TypeIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{payment.description}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>ID: {payment.id}</span>
                            <span>•</span>
                            <span>Type: {getTypeLabel(payment.type)}</span>
                            <span>•</span>
                            <span>Date: {payment.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{payment.amount}</p>
                        <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Payment Method</p>
                          <p className="text-sm font-medium text-gray-900">{payment.paymentMethod}</p>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <p className="text-xs text-gray-500">Transaction ID</p>
                            <p className="text-sm font-medium text-gray-900">{payment.transactionId}</p>
                          </div>
                        )}
                        {payment.invoiceNumber && (
                          <div>
                            <p className="text-xs text-gray-500">Invoice Number</p>
                            <p className="text-sm font-medium text-gray-900">{payment.invoiceNumber}</p>
                          </div>
                        )}
                        {payment.quantity && (
                          <div>
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="text-sm font-medium text-gray-900">{payment.quantity}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specific Details based on type */}
                    {payment.type === 'rubber_sale' && (
                      <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Sale Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-green-600">Buyer</p>
                            <p className="text-green-800 font-medium">{payment.buyer}</p>
                          </div>
                          <div>
                            <p className="text-green-600">Rate</p>
                            <p className="text-green-800 font-medium">{payment.rate}</p>
                          </div>
                          <div>
                            <p className="text-green-600">Tax Amount</p>
                            <p className="text-green-800 font-medium">{payment.taxAmount}</p>
                          </div>
                          <div>
                            <p className="text-green-600">Net Amount</p>
                            <p className="text-green-800 font-medium">{payment.netAmount}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {payment.type === 'service_payment' && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Service Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-blue-600">Service Provider</p>
                            <p className="text-blue-800 font-medium">{payment.serviceProvider}</p>
                          </div>
                          <div>
                            <p className="text-blue-600">Service Details</p>
                            <p className="text-blue-800 font-medium">{payment.serviceDetails}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {payment.type === 'subsidy' && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-purple-800 mb-2">Subsidy Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-purple-600">Department</p>
                            <p className="text-purple-800 font-medium">{payment.department}</p>
                          </div>
                          <div>
                            <p className="text-purple-600">Scheme Code</p>
                            <p className="text-purple-800 font-medium">{payment.schemeCode}</p>
                          </div>
                          <div>
                            <p className="text-purple-600">Application ID</p>
                            <p className="text-purple-800 font-medium">{payment.applicationId}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {payment.status === 'overdue' && payment.lateFee && (
                      <div className="bg-red-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <p className="text-sm text-red-800">
                            Late fee of {payment.lateFee} will be applied if not paid soon.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {payment.dueDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
                          <Eye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>
                        <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                          <Download className="h-4 w-4 inline mr-1" />
                          Download
                        </button>
                        {payment.status === 'pending' && (
                          <button className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentStatus;
