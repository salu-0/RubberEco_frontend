import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { CheckCircle, CreditCard, Package, Truck } from 'lucide-react';

function OrderList() {
  const { listOrders } = useCart();
  const orders = listOrders();
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-green-500">Your</span>
            <span className="text-gray-900">&nbsp;Orders</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600">Track and manage your orders</p>
          <div className="mt-5 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order {o.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed {new Date(o.createdAt).toLocaleString()} • {o.items.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      o.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {o.status}
                    </span>
                    <Link 
                      to={`/orders/${o.id}`} 
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{o.totals.total.toFixed(2)}
                  </div>
                  {o.paymentId && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CreditCard className="h-4 w-4" />
                      <span>Paid</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ orderId }) {
  const { listOrders } = useCart();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const order = listOrders().find(o => o.id === orderId);
  
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist</p>
            <Link 
              to="/orders" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
        {/* Payment Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold">Payment Successful!</h3>
              <p className="text-green-700 text-sm">Your order has been confirmed and payment processed.</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Order {order.id}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-gray-600">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Items</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              {order.items.map(i => (
                <div key={i.id} className="p-4 flex items-center justify-between border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    <img src={i.image} alt={i.name} className="w-16 h-16 object-cover rounded border" />
                    <div>
                      <h3 className="font-medium text-gray-900">{i.name}</h3>
                      <p className="text-sm text-gray-500">Qty {i.qty} • ₹{i.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">₹{(i.qty * i.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹{order.totals.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₹{order.totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{order.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {order.paymentId && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Payment Completed</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Payment ID: {order.paymentId}
                </p>
              </div>
            )}

            {/* Shipping Info */}
            {order.shipping && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{order.shipping.name}</p>
                  <p>{order.shipping.address}</p>
                  <p>Phone: {order.shipping.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const params = useParams();
  const orderId = params.orderId;
  if (orderId) return <OrderDetail orderId={orderId} />;
  return <OrderList />;
}


