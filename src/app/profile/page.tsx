'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ItemGrid } from '@/components/ItemGrid';
import { ItemDetail } from '@/components/ItemDetail';

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

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'favorites' | 'reservations'>('items');
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationRole, setReservationRole] = useState<'buyer' | 'seller'>('buyer');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUsername(user.name);
        setCurrentUserId(user.id);
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMyItems = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const res = await fetch(`/api/items?sellerId=${user.id}`);
        const data = await res.json();
        const mine = data.items || [];
        setMyItems(mine);
      } catch {
        setMyItems([]);
      }
    };

    fetchMyItems();
  }, [isLoggedIn]);

  // Prefetch all counts on login
  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem('token');

    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavorites(data);
      } catch { setFavorites([]); }
    };

    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/reservations?role=buyer', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReservations(data);
      } catch { setReservations([]); }
    };

    fetchFavorites();
    fetchReservations();
  }, [isLoggedIn]);

  // Refresh favorites when tab switches
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

  // Refresh reservations when tab switches
  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'reservations') return;

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/reservations?role=${reservationRole}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReservations(data);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn, activeTab, reservationRole]);

  const handleItemSelect = async (id: number) => {
    setSelectedItemId(id);
    setEditingItemId(null); // 关闭编辑模式
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();
      setDetailItem(data);
    } catch {
      console.error('Failed to fetch item detail');
    }
  };

  const handleEdit = (id: number) => {
    setEditingItemId(id);
  };

  const handleEditSaved = (updatedItem: Item) => {
    // Refresh my items list
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setMyItems((prev) => prev.map((item) => item.id === updatedItem.id ? updatedItem : item));
    // Update detail item
    setDetailItem(updatedItem);
    setEditingItemId(null);
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
    } catch { /* non-critical */ }
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
    } catch { /* non-critical */ }
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
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'reservations' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'
          }`}
        >
          预约记录 ({reservations.length})
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

      {activeTab === 'reservations' && (
        <>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setReservationRole('buyer')}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                reservationRole === 'buyer' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              我预约的
            </button>
            <button
              onClick={() => setReservationRole('seller')}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                reservationRole === 'seller' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              预约我的
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">暂无预约记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((r: any) => (
                <div key={r.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                  {r.item?.images ? (
                    <img src={r.item.images} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.item?.title || '商品已删除'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">¥{r.item?.price}</p>
                    {reservationRole === 'seller' && r.buyer ? (
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="text-amber-600 font-medium">预约人：</span>
                        {r.buyer.name}（{r.buyer.studentId}）
                        {r.buyer.phone && <span className="ml-2">{r.buyer.phone}</span>}
                      </div>
                    ) : reservationRole === 'buyer' && (
                      <p className="mt-1 text-xs text-green-600">
                        已预约 · {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      await fetch(`/api/reservations/${r.itemId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setReservations((prev) => prev.filter((x) => x.id !== r.id));
                    }}
                    className="text-xs text-red-400 hover:text-red-600 font-medium flex-shrink-0 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ItemDetail
        item={detailItem}
        isOpen={selectedItemId !== null}
        onClose={() => {
          setSelectedItemId(null);
          setDetailItem(null);
          setEditingItemId(null);
        }}
        currentUserId={currentUserId ?? undefined}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteItem}
        onEdit={handleEdit}
        onSaved={handleEditSaved}
      />
    </div>
  );
}
