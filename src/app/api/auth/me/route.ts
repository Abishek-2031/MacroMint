import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { profile: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      hasProfile: !!dbUser.profile,
    },
  });
}

