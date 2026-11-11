import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'MacroMint — Adaptive Nutrition for India',
  description: 'AI-powered adaptive nutrition plans with authentic Indian meal delivery. Calculate your BMR, TDEE, and get personalized meal plans delivered in 20 minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <FloatingChat />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

