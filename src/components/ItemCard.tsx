'use client';

import { useState, useEffect } from 'react';

interface Seller {
  id: number;
  studentId: string;
  name: string;
  avatar: string | null;
  email: string | null;
  dormitory: string | null;
  phone: string | null;
}

interface ItemCardProps {
  item: {
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
    seller: Seller;
  };
  onClick: (id: number) => void;
  onFavorite?: (id: number) => void;
  isFavorite?: boolean;
}

export function ItemCard({ item, onClick, onFavorite, isFavorite }: ItemCardProps) {
  const imageUrl = item.images || '';
  const [faved, setFaved] = useState(isFavorite || false);

  useEffect(() => {
    setFaved(isFavorite || false);
  }, [isFavorite]);
  const [showToast, setShowToast] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    setFaved(!faved);
    onFavorite?.(item.id);
  };

  const statusBadge = () => {
    switch (item.status) {
      case 'SOLD':
        return (
          <span className="absolute top-2 left-2 bg-gray-400/90 text-white text-xs px-2 py-0.5 rounded-lg">
            已售出
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="absolute top-2 left-2 bg-gray-300/90 text-white text-xs px-2 py-0.5 rounded-lg">
            已下架
          </span>
        );
      case 'RESERVED':
        return (
          <span className="absolute top-2 left-2 bg-amber-400/90 text-white text-xs px-2 py-0.5 rounded-lg">
            已预约
          </span>
        );
      default:
        return null;
    }
  };

  const isReserved = item.status === 'RESERVED';

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => onClick(item.id)}
    >
      {/* Card */}
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ${isReserved ? 'opacity-70' : ''}`}>
        {/* Image area */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Top badges */}
          {statusBadge()}

          {/* Favorite heart */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4 transition-colors duration-200"
              fill={faved ? '#ef4444' : 'none'}
              stroke={faved ? '#ef4444' : '#9ca3af'}
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Condition badge — bottom right */}
          {item.condition && (
            <span className="absolute bottom-2 right-2 bg-white/85 backdrop-blur-sm text-primary-700 text-xs px-2 py-0.5 rounded-lg shadow-sm font-medium">
              {item.condition}
            </span>
          )}
        </div>

        {/* Info area */}
        <div className="p-3.5">
          <h3 className="text-sm font-medium text-gray-800 truncate">{item.title}</h3>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-primary-600">¥{item.price}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-gray-400 line-through">¥{item.originalPrice}</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1.5 min-w-0">
              {item.seller.avatar ? (
                <img src={item.seller.avatar} alt="" className="w-4 h-4 rounded-full" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-600 font-medium">
                  {item.seller.name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-400 truncate">{item.seller.name}</span>
            </div>
            {item.seller.dormitory && (
              <span className="text-xs text-gray-400 flex-shrink-0">{item.seller.dormitory}</span>
            )}
          </div>
        </div>
      </div>

      {/* Login toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg animate-fade-in-up">
          请先登录
        </div>
      )}
    </div>
  );
}
