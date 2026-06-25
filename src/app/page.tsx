'use client';

import { useState, useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ItemGrid } from '@/components/ItemGrid';
import { ItemDetail } from '@/components/ItemDetail';

interface Category {
  id: number;
  name: string;
  icon: string | null;
  sortOrder: number;
}

interface Seller {
  id: number;
  studentId: string;
  name: string;
  avatar: string | null;
  email: string | null;
  dormitory: string | null;
  phone: string | null;
}

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  category: string;
  subCategory?: string | null;
  condition?: string | null;
  images: string | null;
  status: string;
  createdAt: string;
  campusLocation?: string | null;
  tradeMethod?: string | null;
  seller: Seller;
}

const PAGE_SIZE = 12;

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUserId(user.id);
          // Load favorites
          fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((favs: any[]) => setFavoriteIds(new Set(favs.map((f: any) => f.id))))
            .catch(() => {});
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([{ id: 0, name: '全部', icon: null, sortOrder: 0 }]));
  }, []);

  // Fetch items with pagination
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(PAGE_SIZE));
        if (selectedCategory !== '全部') params.set('category', selectedCategory);

        const res = await fetch(`/api/items?${params.toString()}`);
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, page]);

  // When category changes, reset to page 1
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    setPageInput('1');
  };

  const handleItemSelect = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();

      try {
        const token = localStorage.getItem('token');
        if (token) {
          const favRes = await fetch('/api/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (favRes.ok) {
            const favItems = await favRes.json();
            setIsFavorite(favItems.some((fav: any) => fav.id === id));
          } else {
            setIsFavorite(false);
          }
        } else {
          setIsFavorite(false);
        }
      } catch {
        setIsFavorite(false);
      }

      setDetailItem(data);
      setSelectedItemId(id);
    } catch {
      console.error('Failed to fetch item detail');
    }
  };

  const handleFavorite = async (itemId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Handled by ItemCard toast

      const wasFav = favoriteIds.has(itemId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFav ? next.delete(itemId) : next.add(itemId);
        return next;
      });

      const res = await fetch(wasFav ? `/api/favorites/${itemId}` : '/api/favorites', {
        method: wasFav ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });

      // Revert on failure
      if (!res.ok) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          wasFav ? next.add(itemId) : next.delete(itemId);
          return next;
        });
      }
    } catch {
      // Silent fail
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (selectedItemId === itemId && detailItem) {
          const updated = { ...detailItem, status: newStatus };
          setDetailItem(updated);
          setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, status: newStatus } : item));
        }
      }
    } catch {
      // Silent fail - non-critical
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDetailItem(null);
        setSelectedItemId(null);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        setTotal((t) => t - 1);
      }
    } catch {
      // Silent fail - non-critical
    }
  };

  const goToPage = (targetPage: number) => {
    const p = Math.max(1, Math.min(targetPage, totalPages));
    setPage(p);
    setPageInput(String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput);
      if (!isNaN(n) && n >= 1) goToPage(n);
      else setPageInput(String(page));
    }
  };

  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleCategoryChange}
        />
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <>
              <ItemGrid items={items} onItemSelect={handleItemSelect} onFavorite={handleFavorite} favoriteIds={favoriteIds} />

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 mb-4">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>

                  <span className="text-sm text-gray-500">
                    第
                  </span>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={handlePageInputKey}
                    onBlur={() => {
                      const n = parseInt(pageInput);
                      if (!isNaN(n) && n >= 1 && n <= totalPages) goToPage(n);
                      else setPageInput(String(page));
                    }}
                    className="w-14 text-center px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <span className="text-sm text-gray-500">
                    / {totalPages} 页
                  </span>

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>

                  <span className="text-xs text-gray-400 ml-2">共 {total} 件</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ItemDetail
        item={detailItem}
        isOpen={selectedItemId !== null}
        onClose={() => {
          setSelectedItemId(null);
          setDetailItem(null);
        }}
        currentUserId={currentUserId ?? undefined}
        onFavorite={handleFavorite}
        isFavorite={isFavorite}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}
