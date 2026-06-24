'use client';

import { useState } from 'react';

interface Seller {
  id: number;
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface ItemCardProps {
  item: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    category: string;
    images: string | null;
    status: string;
    seller: Seller;
  };
  onClick: (id: number) => void;
  currentUserId?: number;
  onStatusChange?: (itemId: number, status: string) => void;
  onDelete?: (itemId: number) => void;
}

export function ItemCard({ item, onClick, currentUserId, onStatusChange, onDelete }: ItemCardProps) {
  const [showManage, setShowManage] = useState(false);
  const isSeller = currentUserId === item.seller.id;

  const imageUrl = item.images || '';

  const statusBadge = () => {
    switch (item.status) {
      case 'SOLD':
        return (
          <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            已售出
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="absolute top-2 right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded">
            已下架
          </span>
        );
      default:
        return null;
    }
  };

  const handleStatusToggle = (status: string) => {
    if (onStatusChange) {
      onStatusChange(item.id, status);
    }
    setShowManage(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
    setShowManage(false);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={() => !isSeller && onClick(item.id)}
    >
      {statusBadge()}

      {isSeller && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setShowManage(!showManage); }}
            className="bg-white/90 text-gray-600 hover:text-primary-500 text-xs px-2 py-1 rounded shadow-sm transition-colors"
          >
            管理
          </button>
        </div>
      )}

      {showManage && isSeller && (
        <div
          className="absolute top-10 left-2 z-20 bg-white rounded-lg shadow-lg border p-2 text-sm min-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          {item.status === 'ACTIVE' && (
            <button
              onClick={() => handleStatusToggle('OFFLINE')}
              className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-gray-700"
            >
              下架
            </button>
          )}
          {item.status === 'OFFLINE' && (
            <button
              onClick={() => handleStatusToggle('ACTIVE')}
              className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-gray-700"
            >
              恢复上架
            </button>
          )}
          {item.status === 'ACTIVE' && (
            <button
              onClick={() => handleStatusToggle('SOLD')}
              className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-gray-700"
            >
              标为已售
            </button>
          )}
          <hr className="my-1" />
          <button
            onClick={handleDelete}
            className="w-full text-left py-1.5 px-2 hover:bg-red-50 rounded text-red-600"
          >
            删除
          </button>
        </div>
      )}

      <div className="aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-gray-900 font-medium truncate mb-1">{item.title}</h3>
        <p className="text-primary-600 font-bold text-lg">¥{item.price}</p>
        <div className="flex items-center gap-2 mt-2">
          {item.seller.avatar ? (
            <img src={item.seller.avatar} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200" />
          )}
          <span className="text-xs text-gray-500 truncate">{item.seller.username}</span>
        </div>
      </div>
    </div>
  );
}
