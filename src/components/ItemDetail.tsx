'use client';

import { useState } from 'react';

interface Seller {
  id: number;
  username: string;
  avatar: string | null;
  contact: string | null;
}

interface ItemDetailProps {
  item: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    category: string;
    images: string | null;
    status: string;
    createdAt: string;
    seller: Seller;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
  onFavorite?: (itemId: number) => void;
  isFavorite?: boolean;
  onStatusChange?: (itemId: number, status: string) => void;
  onDelete?: (itemId: number) => void;
}

export function ItemDetail({ item, isOpen, onClose, currentUserId, onFavorite, isFavorite, onStatusChange, onDelete }: ItemDetailProps) {
  if (!item || !isOpen) return null;

  const imageUrl = item.images || '';
  const isOwner = currentUserId === item.seller.id;

  const handleStatusToggle = (status: string) => {
    if (onStatusChange) onStatusChange(item.id, status);
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除此商品吗？')) {
      if (onDelete) onDelete(item.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">商品详情</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full aspect-square object-cover rounded-lg"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <span className="text-2xl font-bold text-primary-600">¥{item.price}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">分类: {item.category}</p>
            {item.status !== 'ACTIVE' && (
              <p className="text-sm text-gray-400 mt-1">
                状态: {item.status === 'SOLD' ? '已售出' : '已下架'}
              </p>
            )}
          </div>

          {item.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">描述</h4>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">卖家信息</h4>
            <div className="flex items-center gap-3">
              {item.seller.avatar ? (
                <img src={item.seller.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {item.seller.username.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{item.seller.username}</p>
                {item.seller.contact && (
                  <p className="text-sm text-gray-500">{item.seller.contact}</p>
                )}
              </div>
            </div>

            {/* 收藏按钮（非本人） */}
            {!isOwner && onFavorite && (
              <button
                onClick={() => onFavorite(item.id)}
                className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  isFavorite
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isFavorite ? '取消收藏' : '收藏'}
              </button>
            )}

            {/* 管理按钮（本人） */}
            {isOwner && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-500 text-center">这是你发布的商品</p>
                {item.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusToggle('OFFLINE')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      下架
                    </button>
                    <button
                      onClick={() => handleStatusToggle('SOLD')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      标为已售
                    </button>
                  </div>
                )}
                {item.status === 'OFFLINE' && (
                  <button
                    onClick={() => handleStatusToggle('ACTIVE')}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    恢复上架
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  删除商品
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
