import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { getUserProfileData } from '../utils/userProfileUtils';
import { Plus, Edit3, Trash2, Save, X, CreditCard, Loader } from 'lucide-react';
import razorpayService from '../services/razorpayService';

export default function Checkout() {
  const { items, totals, placeOrder } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [phones, setPhones] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfileData(true);
        setUser(userData);
        
        // Auto-populate form with user data
        setForm({
          name: userData.name || '',
          address: userData.location || '',
          phone: userData.phone || ''
        });
        
        // Initialize addresses and phones arrays
        setAddresses(userData.location ? [{ id: 1, address: userData.location, isDefault: true }] : []);
        setPhones(userData.phone ? [{ id: 1, phone: userData.phone, isDefault: true }] : []);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Helper functions for editing
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField === 'name') {
      setForm({ ...form, name: tempValue });
    } else if (editingField === 'phone') {
      setForm({ ...form, phone: tempValue });
    } else if (editingField === 'address') {
      setForm({ ...form, address: tempValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  // Address management
  const addAddress = () => {
    if (newAddress.trim()) {
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      setAddresses([...addresses, { id: newId, address: newAddress.trim(), isDefault: false }]);
      setNewAddress('');
      setShowAddAddress(false);
    }
  };

  const removeAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    const selectedAddress = addresses.find(a => a.id === id);
    if (selectedAddress) {
      setForm({ ...form, address: selectedAddress.address });
    }
  };

  // Phone management
  const addPhone = () => {
    if (newPhone.trim()) {
      const newId = Math.max(...phones.map(p => p.id), 0) + 1;
      setPhones([...phones, { id: newId, phone: newPhone.trim(), isDefault: false }]);
      setNewPhone('');
      setShowAddPhone(false);
    }
  };

  const removePhone = (id) => {
    setPhones(phones.filter(p => p.id !== id));
  };

  const setDefaultPhone = (id) => {
    setPhones(phones.map(p => ({ ...p, isDefault: p.id === id })));
    const selectedPhone = phones.find(p => p.id === id);
    if (selectedPhone) {
      setForm({ ...form, phone: selectedPhone.phone });
    }
  };

  // Process payment with Razorpay
  const processPayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      // Validate form
      if (!form.name || !form.phone || !form.address) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare order data
      const orderData = {
        items: items,
        totals: totals,
        shipping: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: user?.email || ''
        }
      };

      // Process payment with Razorpay
      const result = await razorpayService.processPayment(orderData);

      if (result.success) {
        // Clear cart after successful payment
        placeOrder({ 
          shipping: form,
          paymentId: result.paymentId,
          orderId: result.orderId,
          status: 'confirmed'
        });
        
        // Navigate to order success page
        navigate(`/orders/${result.orderId}?payment=success`);
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
        <p className="text-gray-600">Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-green-500">Check</span>
            <span className="text-gray-900">&nbsp;Out</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600">Complete your order with your details</p>
          <div className="mt-5 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
          </div>
        </div>
        
      <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
             <form onSubmit={processPayment} className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Customer Information</h2>
              
              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="flex items-center gap-2">
                  {editingField === 'name' ? (
                    <>
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={form.name}
                        readOnly
                        className="flex-1 border rounded px-3 py-2 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => startEditing('name', form.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Numbers</label>
                <div className="space-y-2">
                  {phones.map((phone) => (
                    <div key={phone.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={phone.phone}
                        readOnly
                        className={`flex-1 border rounded px-3 py-2 ${phone.isDefault ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}
                      />
                      {phone.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setDefaultPhone(phone.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Set as default"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhone(phone.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {showAddPhone ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={addPhone}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPhone(false)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddPhone(true)}
                      className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded border border-green-300"
                    >
                      <Plus className="h-4 w-4" />
                      Add Phone Number
                    </button>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Addresses</label>
                <div className="space-y-2">
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start gap-2">
                      <textarea
                        value={address.address}
                        readOnly
                        rows="3"
                        className={`flex-1 border rounded px-3 py-2 ${address.isDefault ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}
                      />
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                      )}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Set as default"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {showAddAddress ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter address"
                        rows="3"
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={addAddress}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded border border-green-300"
                    >
                      <Plus className="h-4 w-4" />
                      Add Address
                    </button>
                  )}
                </div>
               </div>

               {/* Payment Error Display */}
               {paymentError && (
                 <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                   <p className="text-red-600 text-sm">{paymentError}</p>
                 </div>
               )}

               <button
                 type="submit"
                 disabled={isProcessingPayment}
                 className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform ${
                   isProcessingPayment
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105'
                 } text-white flex items-center justify-center gap-2`}
               >
                 {isProcessingPayment ? (
                   <>
                     <Loader className="h-5 w-5 animate-spin" />
                     Processing Payment...
                   </>
                 ) : (
                   <>
                     <CreditCard className="h-5 w-5" />
                     Pay ₹{totals.total.toFixed(2)} with Razorpay
                   </>
                 )}
               </button>
        </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
            <ul className="divide-y border rounded mb-4">
            {items.map(i => (
              <li key={i.id} className="p-3 flex justify-between text-sm">
                <span>{i.name} x {i.qty}</span>
                  <span>₹{(i.qty * i.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{totals.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-4">
                <span>Total</span><span>₹{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


