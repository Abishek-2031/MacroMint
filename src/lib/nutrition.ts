// Mifflin-St Jeor BMR Formula
export function calculateBMR(sex: string, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  fat_loss: -500,
  muscle_gain: 300,
  recomposition: 0,
  maintenance: 0,
};

const PROTEIN_G_PER_KG: Record<string, number> = {
  fat_loss: 2.2,
  muscle_gain: 2.0,
  recomposition: 2.4,
  maintenance: 1.6,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55);
}

export function calculateDailyCalories(tdee: number, goal: string): number {
  return tdee + (GOAL_ADJUSTMENTS[goal] || 0);
}

export function calculateMacros(dailyCalories: number, weightKg: number, goal: string) {
  const proteinG = Math.round(weightKg * (PROTEIN_G_PER_KG[goal] || 1.8));
  const proteinCals = proteinG * 4;
  const fatG = Math.round((dailyCalories * 0.28) / 9);
  const fatCals = fatG * 9;
  const carbsG = Math.round((dailyCalories - proteinCals - fatCals) / 4);

  return { proteinG, carbsG, fatG };
}

export function calculateAll(params: {
  sex: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
}) {
  const bmr = calculateBMR(params.sex, params.weightKg, params.heightCm, params.age);
  const tdee = calculateTDEE(bmr, params.activityLevel);
  const dailyCalories = calculateDailyCalories(tdee, params.goal);
  const { proteinG, carbsG, fatG } = calculateMacros(dailyCalories, params.weightKg, params.goal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories: Math.round(dailyCalories),
    proteinG,
    carbsG,
    fatG,
  };
}

