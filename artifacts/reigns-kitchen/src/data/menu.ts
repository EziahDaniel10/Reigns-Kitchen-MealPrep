// ✏️ UPDATE THIS MENU EACH MONTH

export const PRICES = {
  INDIVIDUAL: 14.99,
  FAMILY: 49.99
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  sides: string;
};

export type MenuCategory = {
  category: string;
  familyNote?: string;
  items: MenuItem[];
};

// Helper to generate consistent IDs from names
const generateId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const MENU: MenuCategory[] = [
  {
    category: "Chef Comfort Plates",
    items: [
      { id: generateId("Smothered Turkey Wings"), name: "Smothered Turkey Wings", description: "Braised turkey wings in onion gravy.", sides: "Braised kale • Maple glazed yams" },
      { id: generateId("Salmon Cakes"), name: "Salmon Cakes", description: "Pan-seared salmon cakes.", sides: "Mac & cheese • Braised kale" },
      { id: generateId("Cajun Shrimp & Grits Bowl"), name: "Cajun Shrimp & Grits Bowl", description: "Cajun sautéed shrimp over parmesan grits.", sides: "Braised kale" },
      { id: generateId("Grilled Chicken Parmesan"), name: "Grilled Chicken Parmesan", description: "Grilled chicken with marinara & mozzarella.", sides: "Roasted vegetables" },
      { id: generateId("Jerk Chicken Lasagna Roll-Ups"), name: "Jerk Chicken Lasagna Roll-Ups", description: "Lasagna roll-ups with jerk chicken in creamy jerk sauce.", sides: "Roasted vegetables" }
    ]
  },
  {
    category: "Performance Fuel Meals",
    items: [
      { id: generateId("Peruvian Chicken Power Bowl"), name: "Peruvian Chicken Power Bowl", description: "Peruvian roasted chicken with fried rice.", sides: "Aji sauce • Seasonal vegetables" },
      { id: generateId("Cajun Salmon Recovery Bowl"), name: "Cajun Salmon Recovery Bowl", description: "Cajun seared salmon with cauliflower rice.", sides: "Seasonal vegetables" },
      { id: generateId("Creole Chicken Power Bowl"), name: "Creole Chicken Power Bowl", description: "Herb grilled chicken with jasmine rice.", sides: "Roasted peppers" }
    ]
  },
  {
    category: "Plant Powered",
    items: [
      { id: generateId("Vegan Lasagna Roll-Ups"), name: "Vegan Lasagna Roll-Ups", description: "Plant-based lasagna roll-ups with marinara.", sides: "Roasted vegetables" },
      { id: generateId("Mushroom Steak Bowl"), name: "Mushroom Steak Bowl", description: "Balsamic roasted mushroom steak.", sides: "Sweet potato mash • Seasonal vegetables" }
    ]
  },
  {
    category: "Breakfast & Recovery",
    items: [
      { id: generateId("Suya Steak & Eggs"), name: "Suya Steak & Eggs", description: "Suya spiced steak with scrambled eggs.", sides: "Jollof potatoes" },
      { id: generateId("Mini Pancake Plate"), name: "Mini Pancake Plate", description: "Mini pancakes with scrambled eggs.", sides: "Choice of turkey or chicken sausage" },
      { id: generateId("Greek Yogurt Fruit Parfait"), name: "Greek Yogurt Fruit Parfait", description: "Greek yogurt layered with fruit and granola.", sides: "" },
      { id: generateId("Chia Power Parfait"), name: "Chia Power Parfait", description: "Coconut chia pudding with berries.", sides: "" }
    ]
  },
  {
    category: "Family Meals",
    familyNote: "Serves 3–4 people",
    items: [
      { id: generateId("Smothered Turkey Wings Family Meal"), name: "Smothered Turkey Wings Family Meal", description: "Braised turkey wings in onion gravy.", sides: "Braised kale • Maple glazed yams" },
      { id: generateId("Jerk Chicken Lasagna Roll-Ups Family Pan"), name: "Jerk Chicken Lasagna Roll-Ups Family Pan", description: "Lasagna roll-ups with jerk chicken in creamy jerk sauce.", sides: "Roasted vegetables" },
      { id: generateId("Grilled Chicken Parmesan Family Meal"), name: "Grilled Chicken Parmesan Family Meal", description: "Grilled chicken with marinara & mozzarella.", sides: "Roasted vegetables" },
      { id: generateId("Cajun Shrimp & Grits Family Meal"), name: "Cajun Shrimp & Grits Family Meal", description: "Cajun sautéed shrimp over parmesan grits.", sides: "Braised kale" }
    ]
  }
];
