import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: '朝花夕拾 - 校园二手市场',
  description: '发现校园内的闲置好物',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f8fbf9]">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
