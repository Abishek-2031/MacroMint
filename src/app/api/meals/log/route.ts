import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const logs = await prisma.mealLog.findMany({
    where: { userId: user.userId, date },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { date, mealId, eaten } = await req.json();

    const log = await prisma.mealLog.upsert({
      where: { userId_date_mealId: { userId: user.userId, date, mealId } },
      create: { userId: user.userId, date, mealId, eaten },
      update: { eaten },
    });

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Meal log error:', error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}

