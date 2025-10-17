import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/bookings/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const bookings = Array.isArray(data.data) ? data.data : [];

      const mapped = bookings.map(b => {
        const isAdvancePaid = Boolean(b?.payment?.advancePaid);
        const bookingStatus = b?.status || 'pending';
        const status = isAdvancePaid ? (bookingStatus === 'approved' ? 'completed' : 'approved') : 'pending';
        const createdAt = b?.createdAt ? new Date(b.createdAt) : new Date();
        const amountStr = `₹${Number(b.amountAdvance || 0).toLocaleString()}`;
        return {
          id: b._id,
          type: 'nursery_booking',
          description: `Nursery advance - ${b.plantName || 'Rubber Plant'}`,
          amount: amountStr,
          date: createdAt.toLocaleDateString(),
          dueDate: '-',
          status,
          paymentMethod: isAdvancePaid ? 'Razorpay' : 'Online',
          transactionId: b?.payment?.advancePaymentId || b?.payment?.advanceTxnId || '',
          quantity: b.quantity,
          meta: {
            plantName: b.plantName,
            advancePercent: b.advancePercent,
            unitPrice: b.unitPrice
          }
        };
      });

      setPayments(mapped);
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
      nursery_booking: 'Nursery Booking',
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
      nursery_booking: Wallet,
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
              <h2 className="text-xl font-bold text-white">{t('paymentStatus.title')}</h2>
              <p className="text-green-100">{t('paymentStatus.subtitle')}</p>
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

        {/* Summary cards removed as requested */}

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('paymentModal.searchPlaceholder')}
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
                <option value="all">{t('paymentModal.allStatus')}</option>
                <option value="completed">{t('paymentModal.paid')}</option>
                <option value="pending">{t('paymentModal.pending') || 'Pending'}</option>
                <option value="approved">{t('paymentModal.approved')}</option>
                <option value="overdue">{t('paymentModal.overdue') || 'Overdue'}</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">{t('paymentModal.allTypes')}</option>
                <option value="rubber_sale">{t('paymentModal.rubberSale') || 'Rubber Sale'}</option>
                <option value="service_payment">{t('paymentModal.servicePayment') || 'Service Payment'}</option>
                <option value="subsidy">{t('paymentModal.subsidy') || 'Government Subsidy'}</option>
                <option value="training_fee">{t('paymentModal.trainingFee') || 'Training Fee'}</option>
                <option value="equipment_purchase">{t('paymentModal.equipmentPurchase') || 'Equipment Purchase'}</option>
                <option value="nursery_booking">{t('paymentModal.nurseryBooking')}</option>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('paymentModal.noPaymentsFound', 'No payments found')}</h3>
              <p className="text-gray-600">{t('paymentModal.noPaymentsMatch', 'No payments match your current filters.')}</p>
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
                            <span>{t('paymentModal.id')}: {payment.id}</span>
                            <span>•</span>
                            <span>{t('paymentModal.type')}: {getTypeLabel(payment.type)}</span>
                            <span>•</span>
                            <span>{t('paymentModal.date')}: {payment.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{payment.amount}</p>
                        <p className="text-sm text-gray-500">{t('paymentModal.due')}: {payment.dueDate}</p>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">{t('paymentModal.paymentMethod')}</p>
                          <p className="text-sm font-medium text-gray-900">{payment.paymentMethod}</p>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <p className="text-xs text-gray-500">{t('paymentModal.transactionId')}</p>
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
                            <p className="text-xs text-gray-500">{t('paymentModal.quantity')}</p>
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

                    {payment.type === 'nursery_booking' && (
                      <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-emerald-600">{t('paymentModal.plant')}</p>
                            <p className="text-emerald-800 font-medium">{payment.meta?.plantName || '-'}</p>
                            <p className="text-emerald-600 mt-2">{t('paymentModal.quantity')}: <span className='text-emerald-800 font-medium'>{payment.quantity}</span></p>
                          </div>
                          <div>
                            <p className="text-emerald-600 font-semibold">{t('paymentModal.amount')}</p>
                            <p className="text-emerald-800">{t('paymentModal.amount')}: {payment.amount}</p>
                            <p className="text-emerald-800">{t('paymentModal.advance')}: {payment.amount} ({payment.meta?.advancePercent}%)</p>
                            <p className="text-emerald-800">{t('paymentModal.balance')}: ₹0</p>
                          </div>
                          <div>
                            <p className="text-emerald-600 font-semibold">{t('paymentModal.details')}</p>
                            <span className="font-bold text-emerald-900">{payment.status === 'completed' ? t('paymentModal.approved') : payment.status}</span>
                            <br/>
                            <span>{t('paymentModal.approvedStatus')}: <span className="font-bold">{payment.meta?.advancePercent === 100 ? t('common.yes') : t('common.no')}</span></span>
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

                    {/* Footer actions */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1"/> {t('paymentModal.due')}: {payment.dueDate}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center hover:text-gray-900" onClick={async () => {
                          try {
                            const token = localStorage.getItem('token') || '';
                            // only nursery booking receipts supported for now
                            if (payment.type === 'nursery_booking') {
                              const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/nursery/bookings/${payment.id}/receipt`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (!resp.ok) throw new Error('Failed to download receipt');
                              const blob = await resp.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `nursery-receipt-${payment.id}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}>
                          <Download className="h-4 w-4 mr-1"/> {t('paymentModal.downloadReceipt')}
                        </button>
                        <button className="flex items-center hover:text-gray-900"><Eye className="h-4 w-4 mr-1"/> {t('paymentModal.viewDetails')}</button>
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
