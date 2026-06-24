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
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface Item {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string;
  images: string | null;
  status: string;
  createdAt: string;
  seller: Seller;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUserId(user.id);
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

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items${selectedCategory === '全部' ? '' : `?category=${encodeURIComponent(selectedCategory)}`}`);
        const data = await res.json();
        setItems(data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory]);

  const handleItemSelect = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();

      // Check if favorited
      try {
        const token = localStorage.getItem('token');
        const favRes = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favItems = await favRes.json();
        setIsFavorite(favItems.some((fav: any) => fav.id === id));
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
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`/api/favorites/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });

      if (res.ok || res.status === 200) {
        setIsFavorite(!isFavorite);
      }
    } catch {
      console.error('Favorite toggle failed');
    }
  };

  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <ItemGrid
              items={items}
              onItemSelect={handleItemSelect}
              currentUserId={currentUserId ?? undefined}
            />
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
      />
    </div>
  );
}
