import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Minus, 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toastService from '../../services/toastService';

const NurseryInventory = ({ darkMode }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPlant, setEditingPlant] = useState(null);
  const [editForm, setEditForm] = useState({ stockAvailable: 0, unitPrice: 0 });
  const [saving, setSaving] = useState(false);
  const [expandedPlant, setExpandedPlant] = useState(null);

  // Self-detect dark mode to match other admin sections if prop is not provided
  const computedDarkMode = typeof darkMode === 'boolean'
    ? darkMode
    : (typeof window !== 'undefined' && (
        localStorage.getItem('admin_theme') === 'dark' ||
        document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ))
      ? true
      : false;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    } catch {
      return `₹${amount || 0}`;
    }
  };

  const loadPlants = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/nursery/plants`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to load plants (${res.status})`);
      }
      const data = await res.json();
      setPlants(data.data || []);
    } catch (e) {
      console.error('Failed to load nursery plants:', e);
      setError(e.message || 'Failed to load plants');
      setPlants([]);
      toastService.error('Failed to load nursery inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlants(); }, []);

  const startEditing = (plant) => {
    setEditingPlant(plant._id);
    setEditForm({
      stockAvailable: plant.stockAvailable || 0,
      unitPrice: plant.unitPrice || 0
    });
  };

  const cancelEditing = () => {
    setEditingPlant(null);
    setEditForm({ stockAvailable: 0, unitPrice: 0 });
  };

  const updatePlant = async (plantId) => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/nursery/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update plant');
      }

      // Update local state
      setPlants(plants.map(plant => 
        plant._id === plantId 
          ? { ...plant, ...editForm }
          : plant
      ));

      setEditingPlant(null);
      setEditForm({ stockAvailable: 0, unitPrice: 0 });
      toastService.success('Plant inventory updated successfully!');
    } catch (e) {
      console.error('Failed to update plant:', e);
      toastService.error(e.message || 'Failed to update plant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const quickStockUpdate = async (plantId, change) => {
    try {
      const plant = plants.find(p => p._id === plantId);
      if (!plant) return;

      const newStock = Math.max(0, (plant.stockAvailable || 0) + change);
      
      const res = await fetch(`${API_BASE_URL}/nursery/plants/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ stockAvailable: newStock })
      });
      
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update stock');
      }

      // Update local state
      setPlants(plants.map(p => 
        p._id === plantId 
          ? { ...p, stockAvailable: newStock }
          : p
      ));

      toastService.success(`Stock ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} units`);
    } catch (e) {
      console.error('Failed to update stock:', e);
      toastService.error(e.message || 'Failed to update stock. Please try again.');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (stock < 10) return { status: 'low', color: 'yellow', text: 'Low Stock' };
    if (stock < 50) return { status: 'medium', color: 'blue', text: 'Medium Stock' };
    return { status: 'high', color: 'green', text: 'In Stock' };
  };

  const renderStockBadge = (stock) => {
    const stockInfo = getStockStatus(stock);
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    if (computedDarkMode) {
      switch (stockInfo.color) {
        case 'red':
          return <span className={`${base} bg-red-900/40 text-red-300 border border-red-500/30`}>{stockInfo.text}</span>;
        case 'yellow':
          return <span className={`${base} bg-yellow-900/40 text-yellow-300 border border-yellow-500/30`}>{stockInfo.text}</span>;
        case 'blue':
          return <span className={`${base} bg-blue-900/40 text-blue-300 border border-blue-500/30`}>{stockInfo.text}</span>;
        case 'green':
        default:
          return <span className={`${base} bg-green-900/40 text-green-300 border border-green-500/30`}>{stockInfo.text}</span>;
      }
    } else {
      switch (stockInfo.color) {
        case 'red':
          return <span className={`${base} bg-red-100 text-red-800`}>{stockInfo.text}</span>;
        case 'yellow':
          return <span className={`${base} bg-yellow-100 text-yellow-800`}>{stockInfo.text}</span>;
        case 'blue':
          return <span className={`${base} bg-blue-100 text-blue-800`}>{stockInfo.text}</span>;
        case 'green':
        default:
          return <span className={`${base} bg-green-100 text-green-800`}>{stockInfo.text}</span>;
      }
    }
  };

  return (
    <div className={computedDarkMode ? 'min-h-screen bg-gray-900' : 'min-h-screen bg-gradient-to-br from-primary-50 to-accent-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${computedDarkMode ? 'text-white' : 'bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent'}`}>
              Nursery Inventory
            </h1>
            <p className={computedDarkMode ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>
              Manage plant stock levels and pricing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadPlants}
              disabled={loading}
              className={`${computedDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className={`${computedDarkMode ? 'bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-green-500/20' : 'bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100'} p-6`}>
          {loading ? (
            <div className={computedDarkMode ? 'flex items-center justify-center py-16 text-gray-300' : 'flex items-center justify-center py-16 text-gray-500'}>
              <RefreshCw className="h-6 w-6 animate-spin mr-3" />
              Loading inventory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              {error && (
                <div className={`${computedDarkMode ? 'mb-4 p-4 rounded-xl border border-red-500/30 bg-red-900/30 text-red-200' : 'mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700'} text-sm`}>
                  {error}
                </div>
              )}
              {plants.length === 0 && !error ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-full max-w-lg text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full ${computedDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h2 className={`${computedDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-1`}>No plants found</h2>
                    <p className={computedDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                      Add some plants to the nursery to start managing inventory.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className={`${computedDarkMode ? 'bg-gray-700/50 border-b border-green-500/20' : 'bg-gray-50'}`}>
                    <tr className={computedDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      <th className="px-4 py-3 text-left font-semibold">Plant Details</th>
                      <th className="px-4 py-3 text-left font-semibold">Nursery Center</th>
                      <th className="px-4 py-3 text-left font-semibold">Clone/Variety</th>
                      <th className="px-4 py-3 text-left font-semibold">Unit Price</th>
                      <th className="px-4 py-3 text-left font-semibold">Stock</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Quick Actions</th>
                      <th className="px-4 py-3 text-left font-semibold">Manage</th>
                    </tr>
                  </thead>
                  <tbody className={computedDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}>
                    {plants.map(plant => (
                      <React.Fragment key={plant._id}>
                        <tr className={computedDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <div className="flex items-center gap-3">
                              {plant.imageUrl ? (
                                <img 
                                  src={plant.imageUrl} 
                                  alt={plant.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-lg ${computedDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{plant.name}</div>
                                {plant.description && (
                                  <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {plant.description.length > 40 ? `${plant.description.substring(0, 40)}...` : plant.description}
                                  </div>
                                )}
                                {plant.bestFor && (
                                  <div className={`text-xs ${computedDarkMode ? 'text-green-400' : 'text-green-600'} mt-1`}>
                                    Best for: {plant.bestFor}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setExpandedPlant(expandedPlant === plant._id ? null : plant._id)}
                                className={`p-1 rounded ${computedDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                              >
                                {expandedPlant === plant._id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {plant.nurseryCenterId?.name || 'N/A'}
                              </div>
                              {plant.nurseryCenterId?.email && (
                                <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {plant.nurseryCenterId.email}
                                </div>
                              )}
                              {plant.nurseryCenterId?.location && (
                                <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  📍 {plant.nurseryCenterId.location}
                                </div>
                              )}
                              {plant.nurseryCenterId?.contact && (
                                <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  📞 {plant.nurseryCenterId.contact}
                                </div>
                              )}
                              <div className={`text-xs ${computedDarkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                                🌱 2 unique varieties per center
                              </div>
                            </div>
                          </td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {plant.clone || plant.variety || '-'}
                            </div>
                            {plant.origin && (
                              <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Origin: {plant.origin}
                              </div>
                            )}
                            {plant.features && (
                              <div className={`text-xs ${computedDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {plant.features.length > 30 ? `${plant.features.substring(0, 30)}...` : plant.features}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {editingPlant === plant._id ? (
                            <input
                              type="number"
                              value={editForm.unitPrice}
                              onChange={(e) => setEditForm({ ...editForm, unitPrice: parseFloat(e.target.value) || 0 })}
                              className={`w-20 px-2 py-1 rounded border ${computedDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                              min="0"
                              step="0.01"
                            />
                          ) : (
                            formatCurrency(plant.unitPrice)
                          )}
                        </td>
                        <td className={`px-4 py-3 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {editingPlant === plant._id ? (
                            <input
                              type="number"
                              value={editForm.stockAvailable}
                              onChange={(e) => setEditForm({ ...editForm, stockAvailable: parseInt(e.target.value) || 0 })}
                              className={`w-20 px-2 py-1 rounded border ${computedDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                              min="0"
                            />
                          ) : (
                            <span className="font-medium">{plant.stockAvailable || 0}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {renderStockBadge(plant.stockAvailable || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => quickStockUpdate(plant._id, -1)}
                              disabled={editingPlant === plant._id}
                              className={`${computedDarkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'} p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => quickStockUpdate(plant._id, 1)}
                              disabled={editingPlant === plant._id}
                              className={`${computedDarkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {editingPlant === plant._id ? (
                              <>
                                <button
                                  onClick={() => updatePlant(plant._id)}
                                  disabled={saving}
                                  className={`${computedDarkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50`}
                                >
                                  <Save className="h-3 w-3" />
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className={`${computedDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1`}
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditing(plant)}
                                className={`${computedDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1`}
                              >
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                        </tr>
                        
                        {/* Expanded Row with Detailed Information */}
                        {expandedPlant === plant._id && (
                          <tr className={computedDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}>
                            <td colSpan="7" className="px-4 py-4">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`${computedDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg p-4 border ${computedDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className={`font-semibold mb-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      Plant Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Name:</span>
                                        <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.name}</span>
                                      </div>
                                      {plant.clone && (
                                        <div>
                                          <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Clone:</span>
                                          <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.clone}</span>
                                        </div>
                                      )}
                                      {plant.variety && (
                                        <div>
                                          <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Variety:</span>
                                          <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.variety}</span>
                                        </div>
                                      )}
                                      {plant.origin && (
                                        <div>
                                          <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Origin:</span>
                                          <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.origin}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className={`font-semibold mb-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      Characteristics
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      {plant.features && (
                                        <div>
                                          <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Features:</span>
                                          <div className={`mt-1 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.features}</div>
                                        </div>
                                      )}
                                      {plant.bestFor && (
                                        <div>
                                          <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Best For:</span>
                                          <div className={`mt-1 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.bestFor}</div>
                                        </div>
                                      )}
                                      {plant.description && (
                                        <div>
                                          <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Description:</span>
                                          <div className={`mt-1 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.description}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className={`font-semibold mb-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      Inventory Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Unit Price:</span>
                                        <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(plant.unitPrice)}</span>
                                      </div>
                                      <div>
                                        <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stock Available:</span>
                                        <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.stockAvailable || 0} units</span>
                                      </div>
                                      <div>
                                        <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Min Order Qty:</span>
                                        <span className={`ml-2 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>{plant.minOrderQty || 1} units</span>
                                      </div>
                                      <div>
                                        <span className={`font-medium ${computedDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status:</span>
                                        <span className="ml-2">{renderStockBadge(plant.stockAvailable || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Variety Management Section */}
        {plants.length > 0 && (
          <div className={`${computedDarkMode ? 'bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-green-500/20' : 'bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100'} p-6 mt-6`}>
            <h2 className={`text-xl font-bold mb-4 ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🌱 Nursery Center Variety Management
            </h2>
            <p className={`text-sm mb-4 ${computedDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Each nursery center has exactly 2 unique varieties from a pool of 6 different varieties. Below shows the current variety distribution across centers.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Group plants by nursery center
                const centersMap = new Map();
                plants.forEach(plant => {
                  if (plant.nurseryCenterId) {
                    const centerId = plant.nurseryCenterId._id;
                    if (!centersMap.has(centerId)) {
                      centersMap.set(centerId, {
                        center: plant.nurseryCenterId,
                        plants: [],
                        varieties: new Set()
                      });
                    }
                    centersMap.get(centerId).plants.push(plant);
                    const variety = plant.variety || plant.clone || plant.name;
                    if (variety) {
                      centersMap.get(centerId).varieties.add(variety);
                    }
                  }
                });

                return Array.from(centersMap.values()).map(({ center, plants, varieties }) => (
                  <div key={center._id} className={`${computedDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 border ${computedDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${computedDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {center.name}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        varieties.size >= 2 
                          ? (computedDarkMode ? 'bg-red-900/30 text-red-300 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200')
                          : (computedDarkMode ? 'bg-green-900/30 text-green-300 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200')
                      }`}>
                        {varieties.size}/2 varieties
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`text-sm ${computedDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        📍 {center.location}
                      </div>
                      <div className={`text-sm ${computedDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        📧 {center.email}
                      </div>
                      
                      <div className="mt-3">
                        <div className={`text-sm font-medium mb-2 ${computedDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Current Varieties:
                        </div>
                        <div className="space-y-1">
                          {Array.from(varieties).map((variety, index) => (
                            <div key={index} className={`text-sm px-2 py-1 rounded ${computedDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                              {variety}
                            </div>
                          ))}
                          {varieties.size === 0 && (
                            <div className={`text-sm ${computedDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              No varieties assigned
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className={`text-sm font-medium mb-1 ${computedDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total Plants: {plants.length}
                        </div>
                        <div className={`text-xs ${computedDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Total Stock: {plants.reduce((sum, plant) => sum + (plant.stockAvailable || 0), 0)} units
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseryInventory;
