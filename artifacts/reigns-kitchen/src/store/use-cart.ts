import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isFamilyMeal: boolean;
}

interface CartState {
  items: Record<string, CartItem>;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: {},
  
  addItem: (item) => set((state) => {
    const existing = state.items[item.id];
    if (existing) {
      return {
        items: {
          ...state.items,
          [item.id]: { ...existing, quantity: existing.quantity + 1 }
        }
      };
    }
    return {
      items: {
        ...state.items,
        [item.id]: { ...item, quantity: 1 }
      }
    };
  }),

  removeItem: (id) => set((state) => {
    const { [id]: _, ...rest } = state.items;
    return { items: rest };
  }),

  updateQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) {
      const { [id]: _, ...rest } = state.items;
      return { items: rest };
    }
    
    return {
      items: {
        ...state.items,
        [id]: { ...state.items[id], quantity }
      }
    };
  }),

  clearCart: () => set({ items: {} }),

  getTotalItems: () => {
    return Object.values(get().items).reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return Object.values(get().items).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}));
