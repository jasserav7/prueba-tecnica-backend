import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartApi } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // [{ product, qty }]
  const [loading, setLoading] = useState(false);

  // ── Fetch cart from backend ──────────────────────────────
  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await cartApi.get();
      // cart.items = [{ producto_id, cantidad }]
      // We need to cross-reference with products – but cart items only have producto_id.
      // Store them as-is; Home.jsx already has the product object when adding.
      setItems(
        cart.items.map((i) => ({ productoId: i.product_id, qty: i.quantity })),
      );
    } catch (e) {
      console.error("Error cargando carrito:", e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ── Cart actions ─────────────────────────────────────────
  const addItem = async (product, qty = 1) => {
    await cartApi.addItem(product.id, qty);
    // Keep local state in sync with full product objects for fast UI
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product?.id === product.id || i.productoId === product.id,
      );
      if (existing) {
        return prev.map((i) =>
          i.product?.id === product.id || i.productoId === product.id
            ? { product, qty: (i.qty || 0) + qty }
            : i,
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const updateQty = async (productId, qty) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    await cartApi.updateQty(productId, qty);
    setItems((prev) =>
      prev.map((i) =>
        i.product?.id === productId || i.productoId === productId
          ? { ...i, qty }
          : i,
      ),
    );
  };

  const removeItem = async (productId) => {
    await cartApi.removeItem(productId);
    setItems((prev) =>
      prev.filter(
        (i) => i.product?.id !== productId && i.productoId !== productId,
      ),
    );
  };

  const clearCart = async () => {
    await cartApi.clear();
    setItems([]);
  };

  // ── Computed values ──────────────────────────────────────
  const validItems = items.filter((i) => i.product); // only items with product objects
  const totalItems = validItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = validItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const totalIva = validItems.reduce(
    (s, i) => s + i.product.price * (i.product.iva / 100) * i.qty,
    0,
  );
  const total = subtotal + totalIva;

  return (
    <CartContext.Provider
      value={{
        items: validItems,
        loading,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        refreshCart,
        totalItems,
        subtotal,
        totalIva,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
