import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateAll } from '@/lib/nutrition';
import { generateMealPlan } from '@/lib/mealPlan';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: user.userId } });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      sex, age, heightCm, weightKg,
      activityLevel, goal, weeklyPace,
      diet, regionalPref, allergies, dailyBudget,
    } = body;

    const calculated = calculateAll({ sex, age, heightCm, weightKg, activityLevel, goal });
    const mealPlan = generateMealPlan({
      diet,
      regionalPref,
      dailyCalories: calculated.dailyCalories,
      budget: dailyBudget,
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        sex, age, heightCm, weightKg,
        activityLevel, goal, weeklyPace,
        diet, regionalPref,
        allergies: JSON.stringify(allergies || []),
        dailyBudget,
        ...calculated,
        mealPlan: JSON.stringify(mealPlan),
      },
      update: {
        sex, age, heightCm, weightKg,
        activityLevel, goal, weeklyPace,
        diet, regionalPref,
        allergies: JSON.stringify(allergies || []),
        dailyBudget,
        ...calculated,
        mealPlan: JSON.stringify(mealPlan),
      },
    });

    return NextResponse.json({ profile, mealPlan });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

