/**
 * Razorpay Payment Service
 * Handles payment processing using Razorpay payment gateway
 */

// Razorpay configuration
const RAZORPAY_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

class RazorpayService {
  constructor() {
    this.razorpay = null;
    this.loadRazorpay();
  }

  // Load Razorpay script dynamically
  loadRazorpay() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        this.razorpay = window.Razorpay;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpay = window.Razorpay;
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  // Create order on backend
  async createOrder(orderData) {
    try {
      const response = await fetch(`${RAZORPAY_BACKEND_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Process payment with Razorpay
  async processPayment(orderData) {
    try {
      // Ensure Razorpay is loaded
      await this.loadRazorpay();
      
      if (!this.razorpay) {
        throw new Error('Razorpay not loaded');
      }

      // Create order on backend first
      const orderResponse = await this.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const { orderId, amount, currency = 'INR', key } = orderResponse.data;

      // Prepare Razorpay options
      const options = {
        key: key, // use backend-provided public key
        amount: amount, // backend already returns paise
        currency: currency,
        name: 'RubberEco',
        description: `Order #${orderId}`,
        order_id: orderId,
        prefill: {
          name: orderData.shipping.name,
          email: orderData.shipping.email,
          contact: orderData.shipping.phone
        },
        theme: {
          color: '#059669' // Green theme to match RubberEco
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResponse = await fetch(`${RAZORPAY_BACKEND_URL}/api/orders/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId
              })
            });

            if (verificationResponse.ok) {
              const verificationResult = await verificationResponse.json();
              if (verificationResult.success) {
                return {
                  success: true,
                  paymentId: response.razorpay_payment_id,
                  orderId: orderId,
                  message: 'Payment successful'
                };
              } else {
                throw new Error('Payment verification failed');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
          }
        },
        modal: {
          ondismiss: () => {
            throw new Error('Payment cancelled by user');
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new this.razorpay(options);
      const result = await new Promise((resolve, reject) => {
        razorpayInstance.on('payment.failed', (response) => {
          reject(new Error('Payment failed'));
        });
        
        razorpayInstance.open();
        
        // Handle the payment result
        razorpayInstance.on('payment.success', async (response) => {
          try {
            const result = await options.handler(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      return result;

    } catch (error) {
      console.error('Razorpay payment error:', error);
      throw error;
    }
  }

  // Verify payment signature (alternative method)
  async verifyPayment(paymentData) {
    try {
      const response = await fetch(`${RAZORPAY_BACKEND_URL}/api/orders/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(orderId) {
    try {
      const response = await fetch(`${RAZORPAY_BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const razorpayService = new RazorpayService();
export default razorpayService;
