import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export type CartItemType = "coworking" | "accommodation" | "mobility" | "activity";

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  quantity: number;
  carbonImpact: number;
  /** Present only when this item is backed by a real availability slot. */
  scheduleId?: string;
  holdId?: string;
  holdExpiresAt?: string;
}

interface AddToCartInput extends Omit<CartItem, "quantity" | "holdId" | "holdExpiresAt"> {
  scheduleId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: AddToCartInput) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  /** Marks every held item as consumed (booking confirmed) without releasing capacity. */
  confirmHolds: () => Promise<void>;
  totalPrice: number;
  totalCarbon: number;
}

const STORAGE_KEY = "amani-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    // Drop holds that expired while the app was closed — the DB has already
    // (or will) release that capacity on its own via expire_stale_holds.
    const now = Date.now();
    return parsed.filter((item) => {
      if (!item.holdExpiresAt) return true;
      return new Date(item.holdExpiresAt).getTime() > now;
    });
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // best-effort persistence only
    }
  }, [items]);

  // Auto-expire holds client-side so the UI (and the cart) never shows a slot
  // as reserved past its TTL, even if the tab stays open.
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const now = Date.now();
        const stillValid = prev.filter(
          (item) => !item.holdExpiresAt || new Date(item.holdExpiresAt).getTime() > now,
        );
        return stillValid.length === prev.length ? prev : stillValid;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = useCallback(async (item: AddToCartInput) => {
    if (!item.scheduleId) {
      // No time-slot concept for this item yet: keep the legacy, hold-free behavior.
      setItems((prev) => {
        const existing = prev.find((c) => c.id === item.id && !c.scheduleId);
        if (existing) {
          return prev.map((c) =>
            c.id === item.id && !c.scheduleId ? { ...c, quantity: c.quantity + 1 } : c,
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      return;
    }

    const { data, error } = await supabase.rpc("create_hold", {
      p_schedule_id: item.scheduleId,
      p_quantity: 1,
      p_ttl_seconds: 600,
    });

    if (error) {
      if (error.message?.includes("unavailable")) {
        throw new Error("Créneau indisponible, choisissez un autre créneau.");
      }
      throw new Error(error.message || "Impossible de réserver ce créneau.");
    }

    const hold = data as { id: string; expires_at: string };
    setItems((prev) => [
      ...prev,
      {
        ...item,
        quantity: 1,
        holdId: hold.id,
        holdExpiresAt: hold.expires_at,
      },
    ]);
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    const target = items.find((c) => c.id === itemId);
    if (target?.holdId) {
      try {
        // Best-effort: the hold self-expires anyway if this call fails.
        await supabase.rpc("release_hold", { p_hold_id: target.holdId });
      } catch (err) {
        console.warn("release_hold failed:", err);
      }
    }
    setItems((prev) => prev.filter((c) => c.id !== itemId));
  }, [items]);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== itemId) return c;
        // Held items are capacity-checked one at a time; changing quantity would
        // require an additional hold, not yet supported here.
        if (c.holdId) return c;
        return { ...c, quantity: Math.max(1, c.quantity + delta) };
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const confirmHolds = useCallback(async () => {
    const held = items.filter((c) => c.holdId);
    await Promise.all(
      held.map((c) =>
        supabase
          .rpc("confirm_hold_without_payment", { p_hold_id: c.holdId })
          .then(({ error }) => {
            if (error) console.warn("confirm_hold_without_payment failed:", error.message);
          }),
      ),
    );
  }, [items]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCarbon = items.reduce((sum, item) => sum + item.carbonImpact * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        confirmHolds,
        totalPrice,
        totalCarbon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
