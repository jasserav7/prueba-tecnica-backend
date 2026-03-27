import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoriesApi, productsApi, ordersApi } from '../api/client';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // ── Bootstrap: load catalog on mount ──────────────────────
  const refreshCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const [cats, prods] = await Promise.all([
        categoriesApi.list(),
        productsApi.list(),
      ]);
      setCategories(cats.map(_normCat));
      setProducts(prods.map(_normProd));
    } catch (e) {
      console.error('Error cargando catálogo:', e.message);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => { refreshCatalog(); }, [refreshCatalog]);

  const refreshOrders = useCallback(async () => {
    try {
      const data = await ordersApi.list();
      setOrders(data.map(o => ({
        ...o,
        total_iva: Number(o.total_iva),
        total:     Number(o.total),
        subtotal:  Number(o.subtotal),
      })));
    } catch (e) {
      console.error('Error cargando pedidos:', e.message);
    }
  }, []);

  // ── Categories ────────────────────────────────────────────
  const addCategory = async (data) => {
    const cat = await categoriesApi.create({ name: data.name, description: data.description });
    setCategories(prev => [...prev, _normCat(cat)]);
    return cat;
  };

  const updateCategory = async (id, data) => {
    const cat = await categoriesApi.update(id, { name: data.name, description: data.description });
    setCategories(prev => prev.map(c => c.id === id ? _normCat(cat) : c));
  };

  const deleteCategory = async (id) => {
    await categoriesApi.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const getCategoryById = (id) => categories.find(c => c.id === id);

  // ── Products ──────────────────────────────────────────────
  const addProduct = async (data) => {
    const p = await productsApi.create(_toApi(data));
    setProducts(prev => [...prev, _normProd(p)]);
    return p;
  };

  const updateProduct = async (id, data) => {
    const p = await productsApi.update(id, _toApi(data));
    setProducts(prev => prev.map(x => x.id === id ? _normProd(p) : x));
  };

  const deleteProduct = async (id) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  const getProductsByCategory = (catId) => products.filter(p => p.categoryId === catId);

  // ── Orders ────────────────────────────────────────────────
  const placeOrder = async (cartItems, totals) => {
    const payload = {
      items: cartItems.map(({ product: p, qty }) => ({
        product_id:   p.id,
        product_name: p.name,
        unit_price:   p.price,
        iva_pct:      p.iva,
        quantity:     qty,
      })),
      subtotal:  totals.subtotal,
      total_iva: totals.totalIva,
      total:     totals.total,
    };
    const order = await ordersApi.create(payload);
    await refreshOrders();
    return order;
  };

  return (
    <StoreContext.Provider value={{
      categories, products, orders, loadingCatalog,
      addCategory, updateCategory, deleteCategory, getCategoryById,
      addProduct, updateProduct, deleteProduct, getProductsByCategory,
      placeOrder, refreshOrders,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

// ── Helpers: normalise API field names to frontend names ──────
function _normCat(c) {
  return { id: c.id, name: c.name, description: c.description };
}

function _normProd(p) {
  return {
    id:          p.id,
    name:        p.name,
    description: p.description,
    image:       p.image_url,
    size:        p.size,
    weight:      p.weight,
    price:       Number(p.price),
    iva:         Number(p.iva),
    categoryId:  p.category_id,
  };
}

function _toApi(data) {
  return {
    name:        data.name,
    description: data.description,
    image_url:   data.image,
    size:        data.size,
    weight:      data.weight,
    price:       data.price,
    iva:         data.iva,
    category_id: data.categoryId ?? null,
  };
}
