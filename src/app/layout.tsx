import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { useState, useEffect } from 'react';

export const metadata: Metadata = {
  title: '校园二手市场',
  description: '发现校园内的闲置好物',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUsername(user.username);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <Navbar
          isLoggedIn={isLoggedIn}
          username={username}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
