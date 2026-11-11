import knowledgeBase from '@/data/nutrition_knowledge.json';

const DISHES = knowledgeBase.dishes;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function getDishesForType(mealType: string, diet: string, regional: string) {
  return DISHES.filter(d => {
    const typeMatch = d.type === mealType;
    const dietMatch = diet === 'non_veg' 
      ? true  // non-veg can eat everything
      : d.diet.some(dt => dt === diet || (diet === 'eggetarian' && (dt === 'veg' || dt === 'eggetarian')));
    return typeMatch && dietMatch;
  });
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMealPlan(params: {
  diet: string;
  regionalPref: string;
  dailyCalories: number;
  budget: number;
}) {
  const plan: Record<string, { breakfast: (typeof DISHES)[0]; lunch: (typeof DISHES)[0]; dinner: (typeof DISHES)[0] }> = {};

  for (const day of DAYS) {
    const breakfastOptions = getDishesForType('breakfast', params.diet, params.regionalPref);
    const lunchOptions = getDishesForType('lunch', params.diet, params.regionalPref);
    const dinnerOptions = getDishesForType('dinner', params.diet, params.regionalPref);

    plan[day] = {
      breakfast: pickRandom(breakfastOptions.length > 0 ? breakfastOptions : DISHES.filter(d => d.type === 'breakfast')),
      lunch: pickRandom(lunchOptions.length > 0 ? lunchOptions : DISHES.filter(d => d.type === 'lunch')),
      dinner: pickRandom(dinnerOptions.length > 0 ? dinnerOptions : DISHES.filter(d => d.type === 'dinner')),
    };
  }

  return plan;
}

export function getSwapOptions(currentDishId: string, mealType: string, diet: string) {
  return DISHES.filter(d => 
    d.id !== currentDishId && 
    d.type === mealType &&
    (diet === 'non_veg' || d.diet.includes(diet))
  ).slice(0, 3);
}

export { DISHES };

