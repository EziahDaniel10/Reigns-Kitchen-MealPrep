import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { type CategoryItem } from '@/data/menu';
import { useCart } from '@/store/use-cart';
import { formatPrice } from '@/lib/utils';

const FALLBACK_PHOTOS = [
  "photo-1547592180-85f173990554",
  "photo-1565299585323-38d6b0865b47",
  "photo-1519708227418-c8fd9a32b7a2",
  "photo-1567620905732-2d1ec7ab7445",
  "photo-1512621776951-a57141f2eefd",
  "photo-1504674900247-0877df9cc836"
];

const MEAL_PHOTOS: Record<string, string> = {
  // Standard Meals
  "braised-turkey-wings":    "photo-1548943487-a2e4e43b4853",
  "jerk-chicken-lasagna":    "photo-1574894709920-11b28e7367e3",
  "grilled-chicken-parm":    "photo-1632778149955-e80f8ceca2e8",
  "peruvian-chicken-bowl":   "photo-1512058564366-18510be2db19",
  "creole-chicken-bowl":     "photo-1604908176997-125f25cc6f3d",
  "vegan-lasagna":           "photo-1621996346565-e3dbc646d9a9",
  "mushroom-steak-bowl":     "photo-1504544750208-dc0358e63f7f",
  // Signature Meals
  "southern-salmon-cakes":   "photo-1519708227418-c8fd9a32b7a2",
  "cajun-shrimp-grits":      "photo-1571091718767-18b5b1457add",
  "cajun-salmon-bowl":       "photo-1467003909585-2f8a72700288",
  // Chef's Featured
  "lobster-herb-rice":       "photo-1553361371-9b22f78e8b1d",
  "lamb-chops-mash":         "photo-1529694157872-4e0c0f3b238b",
  "surf-turf-special":       "photo-1558030006-450675393462",
  // Breakfast
  "suya-steak-eggs":         "photo-1482049016688-2d3e1b311543",
  "mini-pancake-plate":      "photo-1567620905732-2d1ec7ab7445",
  "greek-yogurt-parfait":    "photo-1488477181946-6428a0291777",
  "chia-power-parfait":      "photo-1490474418585-ba9bad8fd0ea",
  // Family Meals
  "turkey-wings-family":     "photo-1548943487-a2e4e43b4853",
  "jerk-chicken-family":     "photo-1574894709920-11b28e7367e3",
  "chicken-parm-family":     "photo-1555949258-eb67b1ef0ceb",
  "cajun-shrimp-family":     "photo-1571091718767-18b5b1457add",
};

interface MealCardProps {
  item: CategoryItem;
  itemIndex: number;
  isFamily: boolean;
}

export function MealCard({ item, itemIndex, isFamily }: MealCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items[item.id];
  const quantity = cartItem?.quantity || 0;

  const photoId = MEAL_PHOTOS[item.id] ?? FALLBACK_PHOTOS[itemIndex % FALLBACK_PHOTOS.length];
  const photoUrl = `https://images.unsplash.com/${photoId}?w=400&h=280&fit=crop&q=80`;

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      isFamily
    });
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <img src={photoUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-semibold text-sm text-foreground leading-tight flex-1">
            {item.name}
          </h3>
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
            {formatPrice(item.price)}
          </span>
        </div>
        
        {item.tag && (
          <div>
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                item.tag === "Chef's Featured"
                  ? "bg-[#c9a84c] text-[#1a1a1a]"
                  : item.tag === "Signature"
                  ? "border border-[#c9a84c] text-[#c9a84c]"
                  : "border border-accent text-accent"
              }`}
            >
              {item.tag}
            </span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 flex-1">
          {item.description}
        </p>
        
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(item.price)}
          </span>

          <div className="flex items-center justify-end">
            {quantity === 0 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="bg-secondary text-secondary-foreground text-xs px-4 py-2 rounded font-semibold hover:brightness-110 transition-all cursor-pointer min-h-[36px]"
              >
                Add to Order
              </motion.button>
            ) : (
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-background text-foreground transition-colors cursor-pointer"
                >
                  {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-destructive" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
                <span className="w-5 text-center text-xs font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-background text-foreground transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
