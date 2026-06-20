// ✅ ACTIVE — SEAFOOD POP-UP MENU CONFIG
// Single source of truth. Update this file each week.

export interface MainItem {
  id: string;
  name: string;
  description: string;
  price: number;
  badge: 'House Favorite' | 'Vegan' | null;
  priceNote?: string;
  addOn: { label: string; price: number } | null;
  hasSideUpgrade: boolean;
}

export interface SimpleItem {
  id: string;
  name: string;
  price: number;
}

export const SEAFOOD_MENU = {
  brand: 'Reigns Kitchen',
  tagline: 'Premium Seafood. Royal Flavor.',
  thankYouNote: 'Thank You For Supporting!',
  preorderNote: 'Pre-order to skip the line and help us serve you faster!',
  instagram: '@chefapril_w',

  mains: [
    {
      id: 'southern-fried-whiting',
      name: 'Southern Fried Whiting',
      description: 'Crispy fried whiting.',
      price: 20.00,
      badge: null,
      addOn: null,
      hasSideUpgrade: false,
    },
    {
      id: 'hot-honey-catfish',
      name: 'Hot Honey Catfish Nugget Plate',
      description: 'Crispy catfish nuggets, hot honey drizzle, smoked mac & braised kale.',
      price: 26.00,
      badge: 'House Favorite',
      addOn: null,
      hasSideUpgrade: true,
    },
    {
      id: 'reigns-combo',
      name: 'Reigns Combo',
      description: 'Crispy fried fish, catfish nuggets, jumbo seasoned shrimp, hush puppies.',
      price: 28.00,
      badge: null,
      addOn: null,
      hasSideUpgrade: false,
    },
    {
      id: 'crispy-shrimp-basket',
      name: 'Crispy Fried Jumbo Shrimp Basket',
      description: 'Jumbo seasoned shrimp, hush puppies.',
      price: 20.00,
      badge: null,
      addOn: null,
      hasSideUpgrade: false,
    },
    {
      id: 'seafood-egg-rolls',
      name: 'Seafood Egg Rolls',
      description: 'Crispy seafood egg rolls, dipping sauce.',
      price: 20.00,
      priceNote: '2 for $20',
      badge: null,
      addOn: null,
      hasSideUpgrade: false,
    },
    {
      id: 'fries-hush-puppies',
      name: 'Fries & Hush Puppies Basket',
      description: 'Fries & hush puppies, dipping sauce.',
      price: 8.00,
      badge: null,
      addOn: null,
      hasSideUpgrade: false,
    },
    {
      id: 'grilled-jerk-wings',
      name: 'Grilled Jerk Wings',
      description: 'Grilled jerk wings, passion fruit dipping sauce.',
      price: 20.00,
      badge: null,
      addOn: { label: 'Add 4 Hush Puppies', price: 3.00 },
      hasSideUpgrade: false,
    },
    {
      id: 'crispy-cauliflower',
      name: 'Crispy Cauliflower Basket',
      description: 'Crispy cauliflower, vegan comeback sauce.',
      price: 18.00,
      badge: 'Vegan',
      addOn: { label: 'Add 4 Hush Puppies', price: 3.00 },
      hasSideUpgrade: false,
    },
  ] as MainItem[],

  comboAddOn: {
    label: 'Make It a Combo',
    price: 4.00,
    description: 'Includes your choice of a drink',
    choices: ['Passion Fruit Iced Tea', 'Strawberry Lemonade Iced Tea'],
  },

  sideUpgrades: [
    { label: 'Upgrade to Smoked Mac & Cheese', price: 3.50 },
    { label: 'Upgrade to Braised Kale or Southern Potato Salad', price: 2.00 },
  ],

  sauceOptions: ['Tartar Sauce', 'Comeback Sauce', 'Vegan Comeback Sauce', 'Passion Fruit Sauce'],

  sides: [
    { id: 'smoked-mac', name: 'Smoked Mac & Cheese', price: 7.00 },
    { id: 'braised-kale', name: 'Braised Kale', price: 6.00 },
    { id: 'potato-salad', name: 'Southern Potato Salad (8oz)', price: 6.00 },
  ] as SimpleItem[],

  desserts: [
    { id: 'peach-cobbler', name: 'Peach Cobbler Cake Cup', price: 10.00 },
    { id: 'banana-pudding', name: 'Strawberry Banana Pudding', price: 10.00 },
  ] as SimpleItem[],

  drinks: [
    { id: 'passion-fruit-tea', name: 'Passion Fruit Tea', price: 5.00 },
    { id: 'strawberry-lemonade', name: 'Strawberry Lemonade Tea', price: 5.00 },
    { id: 'bottled-water', name: 'Bottled Water', price: 2.50 },
  ] as SimpleItem[],
};
