'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { lastSync: syncKey } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Read auth state from localStorage + sync key
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          return;
        } catch {}
      }
    }
    setIsLoggedIn(false);
  }, [syncKey]);

  // Listen for cross-tab / login page auth changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          setIsLoggedIn(!!user.id);
        } catch { setIsLoggedIn(false); }
      } else {
        setIsLoggedIn(false);
      }
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Re-check auth on route change (e.g. after login redirect)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setIsLoggedIn(!!user.id);
      } catch { setIsLoggedIn(false); }
    }
  }, [pathname]);

  // Scroll listener for frosted glass (throttled)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close search on Escape
  useEffect(() => {
    if (!searchFocus) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSearchFocus(false); searchInputRef.current?.blur(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchFocus]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchFocus(false);
    setSearchQuery('');
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setSearchFocus(false); setSearchQuery(''); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/');
    router.refresh();
    window.dispatchEvent(new StorageEvent('storage', { key: 'token' }));
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/75 glass border-b border-white/20 shadow-sm'
            : 'bg-white border-b border-green-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 group-hover:scale-105 transition-transform">
                <img src="/logo.jpg" alt="朝花夕拾" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-gray-800">朝花夕拾</span>
            </Link>

            {/* Right: search + user */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <motion.div
                  animate={{ width: searchFocus ? 280 : 180 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex items-center gap-2 px-3 h-9 rounded-xl border transition-colors ${
                    searchFocus
                      ? 'border-primary-400 bg-white shadow-lg shadow-primary-100/50 ring-2 ring-primary-100'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocus(true)}
                    onKeyDown={handleSearchKey}
                    placeholder="搜一搜..."
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0"
                  />
                  {searchFocus && searchQuery && (
                    <button onClick={handleSearch} className="flex-shrink-0 text-xs text-primary-500 font-medium hover:text-primary-600 transition-colors">
                      搜索
                    </button>
                  )}
                </motion.div>
              </div>

              {/* User area */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/post"
                    className="text-sm font-medium text-primary-600 hover:text-white bg-primary-50 hover:bg-primary-500 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    发布
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    个人中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
                    title="退出登录"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-1.5 rounded-lg transition-colors"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay backdrop */}
      <AnimatePresence>
        {searchFocus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchFocus(false)}
            className="fixed inset-0 bg-black/20 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
