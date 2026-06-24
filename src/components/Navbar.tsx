'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

export function Navbar() {
  const router = useRouter();
  const { lastSync, sync } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const syncAuth = () => {
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
          setIsLoggedIn(false);
          setUsername('');
        }
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  };

  useEffect(() => {
    syncAuth();
  }, [lastSync]);

  useEffect(() => {
    const handleStorage = () => syncAuth();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sync();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-primary-500 text-2xl font-bold">校园二手市场</span>
          </Link>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="搜索商品..."
            />
            <button
              onClick={handleSearch}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              搜索
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <>
                <Link
                  href="/post"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  发布
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-primary-500 text-sm font-medium transition-colors"
                >
                  我的
                </Link>
                <span className="text-gray-500 text-sm">欢迎, {username}</span>
                <button
                  onClick={handleLogout}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
