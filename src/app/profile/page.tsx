'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ItemGrid } from '@/components/ItemGrid';
import { ItemDetail } from '@/components/ItemDetail';

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

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'favorites'>('items');
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUsername(user.username);
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMyItems = async () => {
      try {
        const res = await fetch('/api/items');
        const allItems = await res.json();
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const mine = allItems.filter((item: any) => item.seller.id === user.id);
        setMyItems(mine);
      } catch {
        setMyItems([]);
      }
    };

    fetchMyItems();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'favorites') return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavorites(data);
      } catch {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, activeTab]);

  const handleItemSelect = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();
      setDetailItem(data);
      setSelectedItemId(id);
    } catch {
      console.error('Failed to fetch item detail');
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setMyItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)));
    } catch {
      alert('操作失败');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('确定要删除此商品吗？')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch {
      alert('删除失败');
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心 - {username}</h1>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'items' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'
          }`}
        >
          我发布的 ({myItems.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'favorites' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'
          }`}
        >
          我的收藏 ({favorites.length})
        </button>
      </div>

      {activeTab === 'items' && (
        <>
          {myItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">还没有发布商品</p>
              <button
                onClick={() => window.location.href = '/post'}
                className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                去发布 &rarr;
              </button>
            </div>
          ) : (
            <ItemGrid items={myItems} onItemSelect={handleItemSelect} />
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">还没有收藏商品</p>
            </div>
          ) : (
            <ItemGrid items={favorites} onItemSelect={handleItemSelect} />
          )}
        </>
      )}

      <ItemDetail
        item={detailItem}
        isOpen={selectedItemId !== null}
        onClose={() => {
          setSelectedItemId(null);
          setDetailItem(null);
        }}
      />
    </div>
  );
}
