import { NextResponse } from 'next/server';
import { DISHES } from '@/lib/mealPlan';

export async function GET() {
  return NextResponse.json({ dishes: DISHES });
}

