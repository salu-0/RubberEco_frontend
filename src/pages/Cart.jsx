import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function Cart() {
  const { items, totals, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-green-500">Rubber</span>
            <span className="text-gray-900">&nbsp;Cart</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600">Review your items and proceed to checkout</p>
          <div className="mt-5 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
          </div>
        </div>
      {items.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link to="/shop" className="text-indigo-700">Go to shop</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <ul className="divide-y border rounded">
              {items.map(item => (
                <li key={item.id} className="p-4 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                  </div>
                  <input type="number" min="1" className="w-20 border rounded px-2 py-1" value={item.qty} onChange={e => updateQty(item.id, Math.max(1, Number(e.target.value)||1))} />
                  <div className="w-24 text-right font-semibold">${(item.price * item.qty).toFixed(2)}</div>
                  <button className="ml-2 text-red-600" onClick={() => removeItem(item.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded p-4 h-fit">
            <h2 className="font-medium mb-2">Summary</h2>
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>${totals.shipping.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
            <button className="mt-4 w-full px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => navigate('/checkout')}>Checkout</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


