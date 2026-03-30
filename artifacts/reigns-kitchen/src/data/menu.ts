export const CONFIG = {
  brand: "Reigns Kitchen",
  whatsappNumber: "2348106032846",
  contactPhone: "2028396203",
  contactEmail: "catering@reignskitchen.com",
  tagline: "Real Food. Bold Flavor.",
  subTagline: "Chef-crafted meals by Chef April Winston.",
  heroDescription: "Inspired by Southern, Creole, and international flavors — Reigns Kitchen delivers chef-crafted meal prep that nourishes, excites, and feels like it was made just for you.",
  weekLabel: "Week 1 Menu",
  orderDeadline: "Order Friday – Sunday by 4 PM",
  deliveryNote: "Chef-prepared meals delivered fresh every Friday.",
  pickupNote: "Pickup or delivery available.",
  priceNote: "Signature meals include premium proteins such as steak and seafood. Chef's Featured meals are elevated, limited-availability dishes designed for a premium experience.",
  bundles: [
    { meals: 5, price: 70, label: "Popular", highlighted: true },
    { meals: 10, price: 135, label: "Best Value", highlighted: false },
  ],
  pricePerMeal: 14.99,
  signatureMealPrice: 17.99,
  featuredMealPrice: 32.99,
  premiumUpcharge: 3.00,
  familyMealPrice: 54.99,
  breakfastPlatePrice: 12.99,
  parfaitPrice: 8.99,
  promoBanner: "Grand Opening Special — First 50 Clients Get Priority Scheduling!",
  categories: [
    {
      id: "standard-meals",
      name: "Standard Meals",
      icon: "dish",
      subtitle: "Chef-crafted meals at $14.99 each — chicken, turkey, fish, and plant-based options.",
      isFamily: false,
      isFeatured: false,
      items: [
        { id: "braised-turkey-wings", name: "Braised Turkey Wings Plate", description: "Slow-braised turkey wings in savory onion gravy served with braised kale and maple glazed yams.", price: 14.99, tag: null },
        { id: "jerk-chicken-lasagna", name: "Caribbean Jerk Chicken Lasagna Roll-Ups", description: "Jerk-seasoned chicken rolled in lasagna pasta with creamy Caribbean jerk sauce and roasted vegetables.", price: 14.99, tag: null },
        { id: "grilled-chicken-parm", name: "Grilled Chicken Parmesan Plate", description: "Herb grilled chicken topped with marinara and melted mozzarella served with roasted seasonal vegetables.", price: 14.99, tag: null },
        { id: "peruvian-chicken-bowl", name: "Peruvian Aji Chicken Bowl", description: "Peruvian roasted chicken served with fried rice, seasonal vegetables, and house-made aji verde sauce.", price: 14.99, tag: null },
        { id: "creole-chicken-bowl", name: "Creole Herb Chicken Bowl", description: "Herb grilled chicken served with jasmine rice and roasted peppers.", price: 14.99, tag: null },
        { id: "vegan-lasagna", name: "Vegan Lasagna Roll-Ups", description: "Lasagna pasta filled with plant-based ricotta and roasted vegetables finished with marinara sauce.", price: 14.99, tag: null },
        { id: "mushroom-steak-bowl", name: "Balsamic Mushroom Steak Bowl", description: "Roasted mushroom steak served with sweet potato mash and seasonal vegetables.", price: 14.99, tag: null },
      ]
    },
    {
      id: "signature-meals",
      name: "Signature Meals",
      icon: "star",
      subtitle: "Premium proteins at $17.99 each — salmon, shrimp, and specialty plant-based options. +$3 in bundles.",
      isFamily: false,
      isFeatured: false,
      items: [
        { id: "southern-salmon-cakes", name: "Southern Salmon Cakes Plate", description: "Golden pan-seared salmon cakes served with creamy mac and cheese and tender braised kale.", price: 17.99, tag: "Signature" },
        { id: "cajun-shrimp-grits", name: "Cajun Shrimp and Grits Bowl", description: "Cajun sautéed shrimp served over creamy parmesan grits with braised kale.", price: 17.99, tag: "Signature" },
        { id: "cajun-salmon-bowl", name: "Blackened Cajun Salmon Bowl", description: "Blackened Cajun salmon served with cauliflower rice and roasted seasonal vegetables.", price: 17.99, tag: "Signature" },
      ]
    },
    {
      id: "chefs-featured",
      name: "Chef's Featured",
      icon: "crown",
      subtitle: "Elevated chef creations at $32.99 each — lobster, crab, lamb, and surf & turf. Bundle pricing does not apply.",
      isFamily: false,
      isFeatured: true,
      items: [
        { id: "lobster-herb-rice", name: "Lobster Bisque & Herb-Buttered Rice", description: "Rich, velvety lobster bisque served alongside aromatic herb-buttered jasmine rice.", price: 32.99, tag: "Chef's Featured" },
        { id: "lamb-chops-mash", name: "Lamb Chops with Roasted Garlic Mash", description: "Herb-crusted lamb chops seared to perfection, served with roasted garlic mashed potatoes and seasonal greens.", price: 32.99, tag: "Chef's Featured" },
        { id: "surf-turf-special", name: "Surf & Turf Special", description: "Grilled prime steak paired with garlic butter shrimp, roasted seasonal vegetables, and herbed potatoes.", price: 32.99, tag: "Chef's Featured" },
      ]
    },
    {
      id: "breakfast",
      name: "Rise and Reign Breakfast",
      icon: "sunrise",
      subtitle: "Breakfast meals designed to fuel your morning.",
      isFamily: false,
      isFeatured: false,
      items: [
        { id: "suya-steak-eggs", name: "Suya Steak and Eggs", description: "West African suya-spiced steak served with scrambled eggs and roasted jollof potatoes.", price: 17.99, tag: "Breakfast" },
        { id: "mini-pancake-plate", name: "Mini Pancake Breakfast Plate", description: "Fluffy mini pancakes served with scrambled eggs and turkey sausage.", price: 12.99, tag: "Breakfast" },
        { id: "greek-yogurt-parfait", name: "Greek Yogurt Fruit Parfait", description: "Creamy Greek yogurt layered with seasonal fruit and crunchy granola.", price: 8.99, tag: "Parfait" },
        { id: "chia-power-parfait", name: "Coconut Chia Power Parfait", description: "Coconut chia pudding layered with fresh berries.", price: 8.99, tag: "Parfait" },
      ]
    },
    {
      id: "family",
      name: "Family Comfort Meals",
      icon: "family",
      subtitle: "Chef-crafted comfort meals designed to feed the table. Serves 3–4.",
      isFamily: true,
      isFeatured: false,
      items: [
        { id: "turkey-wings-family", name: "Braised Turkey Wings Family Meal", description: "Our signature braised turkey wings in savory onion gravy — family sized.", price: 54.99, tag: "Serves 3-4" },
        { id: "jerk-chicken-family", name: "Caribbean Jerk Chicken Lasagna Roll-Ups Family Pan", description: "A full pan of our jerk chicken lasagna roll-ups with creamy Caribbean sauce.", price: 54.99, tag: "Serves 3-4" },
        { id: "chicken-parm-family", name: "Grilled Chicken Parmesan Family Meal", description: "Family-sized herb grilled chicken parmesan with marinara and roasted vegetables.", price: 54.99, tag: "Serves 3-4" },
        { id: "cajun-shrimp-family", name: "Cajun Shrimp and Grits Family Meal", description: "A generous family pan of Cajun shrimp over creamy parmesan grits.", price: 54.99, tag: "Serves 3-4" },
      ]
    }
  ]
};

export type BundleOption = typeof CONFIG.bundles[0];
export type CategoryItem = typeof CONFIG.categories[0]['items'][0];
export type Category = typeof CONFIG.categories[0];
