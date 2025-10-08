import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEYS = {
  CART: 'shop.cart.v1',
  ORDERS: 'shop.orders.v1',
};

const CartContext = createContext(null);

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const initialState = {
  items: [], // {id, name, price, qty, image}
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'ADD': {
      const existing = state.items.find(i => i.id === action.payload.id);
      let nextItems;
      if (existing) {
        nextItems = state.items.map(i => i.id === existing.id ? { ...i, qty: i.qty + (action.payload.qty || 1) } : i);
      } else {
        nextItems = [...state.items, { ...action.payload, qty: action.payload.qty || 1 }];
      }
      return { ...state, items: nextItems };
    }
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      const nextItems = state.items
        .map(i => i.id === id ? { ...i, qty } : i)
        .filter(i => i.qty > 0);
      return { ...state, items: nextItems };
    }
    case 'REMOVE': {
      const nextItems = state.items.filter(i => i.id !== action.payload);
      return { ...state, items: nextItems };
    }
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const stored = loadFromStorage(STORAGE_KEYS.CART, initialState);
    dispatch({ type: 'INIT', payload: stored });
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CART, state);
  }, [state]);

  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = state.items.length > 0 ? 5 : 0;
    const tax = +(subtotal * 0.07).toFixed(2);
    const total = +(subtotal + shipping + tax).toFixed(2);
    return { subtotal, shipping, tax, total };
  }, [state.items]);

  function addItem(product, qty = 1) {
    dispatch({ type: 'ADD', payload: { id: product.id, name: product.name, price: product.price, image: product.image, qty } });
  }
  function updateQty(id, qty) {
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  }
  function removeItem(id) {
    dispatch({ type: 'REMOVE', payload: id });
  }
  function clearCart() {
    dispatch({ type: 'CLEAR' });
  }

  function placeOrder(meta = {}) {
    const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
    const newOrder = {
      id: 'ord_' + Date.now(),
      status: 'Processing',
      createdAt: new Date().toISOString(),
      items: state.items,
      totals,
      ...meta,
    };
    const next = [newOrder, ...orders];
    saveToStorage(STORAGE_KEYS.ORDERS, next);
    clearCart();
    return newOrder.id;
  }

  function listOrders() {
    return loadFromStorage(STORAGE_KEYS.ORDERS, []);
  }

  function updateOrderStatus(orderId, status) {
    const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
    const next = orders.map(o => o.id === orderId ? { ...o, status } : o);
    saveToStorage(STORAGE_KEYS.ORDERS, next);
  }

  const value = {
    items: state.items,
    totals,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    placeOrder,
    listOrders,
    updateOrderStatus,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


