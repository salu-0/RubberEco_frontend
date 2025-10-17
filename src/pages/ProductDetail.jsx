import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const product = getProductById(id);
  const { addItem } = useCart();
  const stockMap = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('admin_shop_stock') || '{}'); } catch { return {}; }
  }, []);
  const relatedProducts = getRelatedProducts(id);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600">{t('shop.productNotFound', 'Product not found.')}</p>
        <Link to="/shop" className="text-indigo-700">{t('shop.backToShop', 'Back to shop')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 pt-24">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="aspect-video w-full overflow-hidden rounded border">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {/* Removed thumbnail strip as requested */}
        </div>
        <div>
          <h1 className="text-2xl font-semibold flex items-center">{t(`products.${product.id}.name`, product.name)}
            {product.rpcCertified && (
              <span className="ml-3 inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 border border-green-300">{t('shop.rpcCertified')}</span>
            )}
          </h1>
          <div className="mt-1 text-sm text-gray-500 uppercase">{t(`brands.${product.brand}`, product.brand)}</div>
          <div className="mt-3 text-2xl font-bold">₹{product.price.toFixed(2)}</div>
          <div className="mt-1 text-sm text-gray-600">{t('shop.inStock')}: <span className="font-medium">{Number(stockMap[product.id]?.stock || 0)}</span></div>
          <p className="mt-4 text-gray-700">{t(`products.${product.id}.description`, product.description)}</p>

          {product.specs?.length > 0 && (
            <ul className="mt-4 list-disc list-inside text-sm text-gray-700">
              {product.specs.map((s, i) => (
                <li key={i}>{t(`products.${product.id}.specs.${i}`, s)}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex gap-3 items-center">
            <label className="mr-2 text-sm font-medium" htmlFor="quantity-input">{t('shop.qty', 'Qty')}:</label>
            <input
              id="quantity-input"
              type="number"
              min={1}
              max={Number(stockMap[product.id]?.stock || 1)}
              value={quantity}
              onChange={e => {
                let val = Math.max(1, Math.min(Number(stockMap[product.id]?.stock || 1), Number(e.target.value)));
                setQuantity(val);
              }}
              className="w-16 px-2 py-1 border rounded text-center"
            />
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => addItem(product, quantity)}>{t('shop.addToCart')}</button>
            <Link to="/shop" className="px-4 py-2 rounded border">{t('shop.continueShopping', 'Continue Shopping')}</Link>
          </div>
        </div>
      </div>

      {/* Related Items Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('shop.relatedItems', 'Related Items')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="group relative border rounded-lg overflow-hidden bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-300/50 hover:border-green-400"
              >
                <Link to={`/shop/${relatedProduct.id}`} className="block">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase">{relatedProduct.brand}</span>
                    {relatedProduct.rpcCertified && (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 border border-green-300">{t('shop.rpcCertified')}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    <Link to={`/shop/${relatedProduct.id}`}>
                      {t(`products.${relatedProduct.id}.name`, relatedProduct.name)}
                    </Link>
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{t(`products.${relatedProduct.id}.description`, relatedProduct.description)}</p>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">₹{relatedProduct.price.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{t('shop.inStock')}: <span className="font-medium">{Number(stockMap[relatedProduct.id]?.stock || 0)}</span></div>
                    <div className="mt-2 flex items-center justify-end">
                      <button 
                        onClick={() => addItem(relatedProduct, 1)}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        {t('shop.addToCart')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


