import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Header } from '@/components/layout/Header';
import { Notification } from '@/components/ui/Notification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enterprise Ecommerce',
  description: 'Modern ecommerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>{children}</main>
            <footer className="bg-gray-800 text-white py-8 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p>&copy; 2024 Enterprise Ecommerce. All rights reserved.</p>
                </div>
              </div>
            </footer>
            <Notification />
          </div>
        </Providers>
      </body>
    </html>
  );
}
