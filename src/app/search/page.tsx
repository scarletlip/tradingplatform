'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  const doSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  useEffect(() => {
    if (!initialQuery) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items?search=${encodeURIComponent(initialQuery)}`);
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [initialQuery]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="搜索商品标题或描述..."
        />
        <button
          onClick={doSearch}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          搜索
        </button>
      </div>

      {initialQuery && (
        <p className="text-gray-500 text-sm mb-4">
          搜索 "{initialQuery}" 的结果：{items.length} 件商品
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <ItemGrid items={items} onItemSelect={handleItemSelect} />
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

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
