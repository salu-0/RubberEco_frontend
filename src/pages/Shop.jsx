import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { products as allProducts, categories } from '../data/products';
import { useCart } from '../context/CartContext';
import tappingToolIcon from '../assets/images/tapping_tool/Rubber-Tapping-Machine.png';

const Badge = ({ show, children }) => show ? (
  <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 border border-green-300">{children}</span>
) : null;

export default function Shop() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [price, setPrice] = useState(0);
  const [sort, setSort] = useState('pop');

  const stockMap = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_shop_stock') || '{}');
    } catch {
      return {};
    }
  }, []);

  const products = useMemo(() => {
    let list = allProducts.slice();
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (price > 0) list = list.filter(p => p.price <= price);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sort === 'pop') list.sort((a, b) => b.popularity - a.popularity);
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list.map(p => ({ ...p, stock: Number(stockMap[p.id]?.stock || 0) }));
  }, [search, category, price, sort, stockMap]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-green-500">Rubber</span>
            <span className="text-gray-900">&nbsp;Shop</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600">Tools, agrochemicals, protective gear, RPCs, and processing equipment.</p>
          <div className="mt-5 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end items-center">
          <input className="border rounded px-3 py-2" placeholder="Search products" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex items-center gap-2">
            <img 
              src={tappingToolIcon} 
              alt="Tapping Tools" 
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <select className="border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <select className="border rounded px-3 py-2" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="pop">Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Max Price</label>
            <input type="number" min="0" className="w-24 border rounded px-2 py-2" value={price} onChange={e => setPrice(Number(e.target.value)||0)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {products.map(p => (
          <div
            key={p.id}
            className="group relative border rounded-lg overflow-hidden bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-300/50 hover:border-green-400"
          >
            <Link to={`/shop/${p.id}`} className="block">
              <img src={p.image} alt={p.name} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  <Link to={`/shop/${p.id}`}>{p.name}</Link>
                </h3>
                <span className="font-semibold">₹{p.price.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">In stock: <span className="font-medium">{p.stock}</span></div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="uppercase">{p.brand}</span>
                <Badge show={p.rpcCertified}>RPC Certified</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
              <div className="mt-auto pt-4 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button
                  className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => addItem(p, 1)}
                >
                  Add to Cart
                </button>
                <button
                  className="px-3 py-2 rounded border border-green-600 text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => { addItem(p, 1); navigate('/cart'); }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}


