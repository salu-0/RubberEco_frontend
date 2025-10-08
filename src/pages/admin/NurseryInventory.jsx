import React, { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw, Edit3, Save, X } from 'lucide-react';
import { products as catalog } from '../../data/products';
import notificationService from '../../services/notificationService';
import toastService from '../../services/toastService';

const NurseryInventory = ({ darkMode }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ price: 0, stock: 0 });

  const computedDarkMode = typeof darkMode === 'boolean'
    ? darkMode
    : (typeof window !== 'undefined' && (
        localStorage.getItem('admin_theme') === 'dark' ||
        document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ))
      ? true
      : false;

  const loadShopItems = () => {
    setLoading(true);
    // Seed from catalog; attach stock from localStorage if any
    const key = 'admin_shop_stock';
    const savedStock = JSON.parse(localStorage.getItem(key) || '{}');
    const merged = catalog.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price || 0),
      image: p.image,
      stock: Number(savedStock[p.id]?.stock || 0)
    }));
    setItems(merged);
    setLoading(false);
  };

  useEffect(() => { loadShopItems(); }, []);

  const persist = (next) => {
    const key = 'admin_shop_stock';
    const map = next.reduce((acc, it) => { acc[it.id] = { stock: it.stock }; return acc; }, {});
    localStorage.setItem(key, JSON.stringify(map));
  };

  const startEdit = (id) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    setEditingId(id);
    setForm({ price: it.price, stock: it.stock });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ price: 0, stock: 0 });
  };

  const saveEdit = () => {
    const next = items.map(i => i.id === editingId ? { ...i, price: Number(form.price || 0), stock: Math.max(0, parseInt(form.stock || 0, 10)) } : i);
    setItems(next);
    persist(next);
    // Alert when stock falls below threshold
    const edited = next.find(i => i.id === editingId);
    if (edited && edited.stock <= 100) {
      const message = `Stock low: ${edited.name} has only ${edited.stock} units remaining. Please restock.`;
      toastService.warning(message);
      notificationService.addNotification({
        type: 'inventory_low',
        title: 'Low Inventory Alert',
        message,
        priority: 'high',
        data: { productId: edited.id, productName: edited.name, stock: edited.stock }
      });
    }
    cancelEdit();
  };

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const byCategory = useMemo(() => {
    const map = new Map();
    items.forEach(i => {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category).push(i);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className={computedDarkMode ? 'min-h-screen bg-gray-900' : 'min-h-screen bg-gradient-to-br from-primary-50 to-accent-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`${computedDarkMode ? 'text-white' : 'text-gray-900'} text-xl font-bold`}>Inventory</h1>
          <button
            onClick={loadShopItems}
            disabled={loading}
            className={`${computedDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {byCategory.map(([category, list]) => (
          <div key={category} className={`${computedDarkMode ? 'bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-green-500/20' : 'bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100'} p-6 mb-6`}>
            <h2 className={`${computedDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-4`}>{category}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={computedDarkMode ? 'bg-gray-700/40' : 'bg-gray-100'}>
                  <tr className={computedDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                    <th className="px-4 py-3 text-left font-semibold">Item</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className={computedDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {list.map(it => (
                    <tr key={it.id} className={computedDarkMode ? 'text-white' : 'text-gray-900'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {it.image ? (
                            <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg ${computedDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[280px]">{it.name}</div>
                            <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{it.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === it.id ? (
                          <input type="number" min="0" step="0.5" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))}
                            className={`${computedDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-24 px-2 py-1 rounded border`} />
                        ) : (
                          <span className="font-medium">{formatCurrency(it.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === it.id ? (
                          <input type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f, stock:e.target.value}))}
                            className={`${computedDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-24 px-2 py-1 rounded border`} />
                        ) : (
                          <span className="font-medium">{it.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === it.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={saveEdit} className={`${computedDarkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1`}><Save className="h-3 w-3" />Save</button>
                            <button onClick={cancelEdit} className={`${computedDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1`}><X className="h-3 w-3" />Cancel</button>
                          </div>
                        ) : (
                          <button onClick={()=>startEdit(it.id)} className={`${computedDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1`}><Edit3 className="h-3 w-3" />Edit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NurseryInventory;
