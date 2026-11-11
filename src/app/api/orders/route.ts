import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { items, totalAmount, paymentMethod, deliveryAddress } = await req.json();

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        items: JSON.stringify(items),
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        deliveryAddress: JSON.stringify(deliveryAddress),
        status: 'confirmed',
        estimatedTime: 20,
      },
    });

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ orders });
}

