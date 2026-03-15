export const CONFIG = {
  brand: "Reigns Kitchen",
  // ✏️ UPDATE: WhatsApp number for order notifications (no + or spaces)
  whatsappNumber: "2348106032846",
  tagline: "Real Food. Bold Flavor.",
  subTagline: "Chef-Crafted for Your Week.",
  heroDescription: "Inspired by Southern comfort and global flavors. Reigns Kitchen meals are prepared fresh each week and portioned for real life — whether you're fueling a workout, feeding the family, or just want great food ready when you are.",
  weekLabel: "Week 1 Menu",
  orderDeadline: "Order Friday – Sunday by 4 PM",
  deliveryNote: "Chef-prepared meals delivered fresh every Friday.",
  pickupNote: "Pickup or delivery available.",
  bundles: [
    { meals: 4, price: 59.96, label: "Starter", highlighted: false },
    { meals: 5, price: 74.95, label: "Popular", highlighted: true },
    { meals: 8, price: 119.92, label: "Best Value", highlighted: false },
    { meals: 10, price: 149.90, label: "Power Week", highlighted: false }
  ],
  pricePerMeal: 14.99,
  premiumUpcharge: 3.00,
  familyMealPrice: 49.99,
  breakfastPlatePrice: 12.99,
  parfaitPrice: 8.99,
  promoBanner: "Grand Opening Special — First 50 Clients Get Priority Scheduling!",
  categories: [
    {
      id: "chef-comfort",
      name: "Chef Comfort",
      icon: "dish",
      subtitle: "Soulful chef-crafted comfort meals with balanced portions.",
      isFamily: false,
      items: [
        { id: "braised-turkey-wings", name: "Braised Turkey Wings Plate", description: "Slow-braised turkey wings in savory onion gravy served with braised kale and maple glazed yams.", price: 14.99, tag: null },
        { id: "southern-salmon-cakes", name: "Southern Salmon Cakes Plate", description: "Golden pan-seared salmon cakes served with creamy mac and cheese and tender braised kale.", price: 14.99, tag: null },
        { id: "cajun-shrimp-grits", name: "Cajun Shrimp and Grits Bowl", description: "Cajun sautéed shrimp served over creamy parmesan grits with braised kale.", price: 14.99, tag: "Premium" },
        { id: "jerk-chicken-lasagna", name: "Caribbean Jerk Chicken Lasagna Roll-Ups", description: "Jerk-seasoned chicken rolled in lasagna pasta with creamy Caribbean jerk sauce and roasted vegetables.", price: 14.99, tag: null },
        { id: "grilled-chicken-parm", name: "Grilled Chicken Parmesan Plate", description: "Herb grilled chicken topped with marinara and melted mozzarella served with roasted seasonal vegetables.", price: 14.99, tag: null }
      ]
    },
    {
      id: "global-power",
      name: "Global Power Bowls",
      icon: "bolt",
      subtitle: "Balanced meals designed for energy and performance.",
      isFamily: false,
      items: [
        { id: "peruvian-chicken-bowl", name: "Peruvian Aji Chicken Bowl", description: "Peruvian roasted chicken served with fried rice, seasonal vegetables, and house-made aji verde sauce.", price: 14.99, tag: null },
        { id: "cajun-salmon-bowl", name: "Blackened Cajun Salmon Bowl", description: "Blackened Cajun salmon served with cauliflower rice and roasted seasonal vegetables.", price: 14.99, tag: "Premium" },
        { id: "creole-chicken-bowl", name: "Creole Herb Chicken Bowl", description: "Herb grilled chicken served with jasmine rice and roasted peppers.", price: 14.99, tag: null }
      ]
    },
    {
      id: "plant-powered",
      name: "Plant Powered",
      icon: "leaf",
      subtitle: "Flavorful plant-forward meals made with fresh ingredients.",
      isFamily: false,
      items: [
        { id: "vegan-lasagna", name: "Vegan Lasagna Roll-Ups", description: "Lasagna pasta filled with plant-based ricotta and roasted vegetables finished with marinara sauce.", price: 14.99, tag: null },
        { id: "mushroom-steak-bowl", name: "Balsamic Mushroom Steak Bowl", description: "Roasted mushroom steak served with sweet potato mash and seasonal vegetables.", price: 14.99, tag: null }
      ]
    },
    {
      id: "breakfast",
      name: "Rise and Reign Breakfast",
      icon: "sunrise",
      subtitle: "Breakfast meals designed to fuel your morning.",
      isFamily: false,
      items: [
        { id: "suya-steak-eggs", name: "Suya Steak and Eggs", description: "West African suya-spiced steak served with scrambled eggs and roasted jollof potatoes.", price: 12.99, tag: "Breakfast" },
        { id: "mini-pancake-plate", name: "Mini Pancake Breakfast Plate", description: "Fluffy mini pancakes served with scrambled eggs and turkey sausage.", price: 12.99, tag: "Breakfast" },
        { id: "greek-yogurt-parfait", name: "Greek Yogurt Fruit Parfait", description: "Creamy Greek yogurt layered with seasonal fruit and crunchy granola.", price: 8.99, tag: "Parfait" },
        { id: "chia-power-parfait", name: "Coconut Chia Power Parfait", description: "Coconut chia pudding layered with fresh berries.", price: 8.99, tag: "Parfait" }
      ]
    },
    {
      id: "family",
      name: "Family Comfort Meals",
      icon: "family",
      subtitle: "Chef-crafted comfort meals designed to feed the table. Serves 3-4.",
      isFamily: true,
      items: [
        { id: "turkey-wings-family", name: "Braised Turkey Wings Family Meal", description: "Our signature braised turkey wings in savory onion gravy — family sized.", price: 49.99, tag: "Serves 3-4" },
        { id: "jerk-chicken-family", name: "Caribbean Jerk Chicken Lasagna Roll-Ups Family Pan", description: "A full pan of our jerk chicken lasagna roll-ups with creamy Caribbean sauce.", price: 49.99, tag: "Serves 3-4" },
        { id: "chicken-parm-family", name: "Grilled Chicken Parmesan Family Meal", description: "Family-sized herb grilled chicken parmesan with marinara and roasted vegetables.", price: 49.99, tag: "Serves 3-4" },
        { id: "cajun-shrimp-family", name: "Cajun Shrimp and Grits Family Meal", description: "A generous family pan of Cajun shrimp over creamy parmesan grits.", price: 49.99, tag: "Serves 3-4" }
      ]
    }
  ]
};

// Type exports for the app
export type BundleOption = typeof CONFIG.bundles[0];
export type CategoryItem = typeof CONFIG.categories[0]['items'][0];
export type Category = typeof CONFIG.categories[0];
