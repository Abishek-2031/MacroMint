import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const entries = await prisma.knowledgeBase.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { category, name, data } = await req.json();

    const entry = await prisma.knowledgeBase.create({
      data: {
        category,
        name,
        data: typeof data === 'string' ? data : JSON.stringify(data),
      },
    });

    return NextResponse.json({ entry, success: true });
  } catch (error) {
    console.error('Knowledge base error:', error);
    return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.knowledgeBase.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

