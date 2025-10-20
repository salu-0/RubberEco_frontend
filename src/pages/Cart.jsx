import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Cart() {
  const { items, totals, updateQty, removeItem } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-green-500">Rubber</span>
            <span className="text-gray-900">&nbsp;{t('cart.title')}</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600">{t('cart.subtitle')}</p>
          <div className="mt-5 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
          </div>
        </div>
      {items.length === 0 ? (
        <div className="mt-6 mb-12">
          <p className="text-gray-600">{t('cart.empty')}</p>
          <Link to="/shop" className="text-indigo-700">{t('cart.goToShop')}</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mt-6 mb-12">
          <div className="md:col-span-2">
            <ul className="divide-y border rounded">
              {items.map(item => (
                <li key={item.id} className="p-4 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">₹{item.price.toFixed(2)} {t('cart.each')}</div>
                  </div>
                  <input type="number" min="1" className="w-20 border rounded px-2 py-1" value={item.qty} onChange={e => updateQty(item.id, Math.max(1, Number(e.target.value)||1))} />
                  <div className="w-24 text-right font-semibold">₹{(item.price * item.qty).toFixed(2)}</div>
                  <button className="ml-2 text-red-600" onClick={() => removeItem(item.id)}>{t('cart.remove')}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded p-4 h-fit">
            <h2 className="font-medium mb-2">{t('cart.summary')}</h2>
            <div className="flex justify-between text-sm"><span>{t('cart.subtotal')}</span><span>${totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>{t('cart.shipping')}</span><span>${totals.shipping.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>{t('cart.tax')}</span><span>${totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold mt-2"><span>{t('cart.total')}</span><span>${totals.total.toFixed(2)}</span></div>
            <button className="mt-4 w-full px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => navigate('/checkout')}>{t('cart.checkout')}</button>
          </div>
        </div>
      )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2024 RubberEco. All rights reserved. Empowering sustainable rubber farming.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


