'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';

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
  onEdit?: (itemId: number) => void;
  onSaved?: (item: NonNullable<ItemDetailProps['item']>) => void;
  editing?: boolean;
}

export function ItemDetail({ item, isOpen, onClose, currentUserId, onFavorite, isFavorite, onStatusChange, onDelete, onEdit, onSaved, editing }: ItemDetailProps) {
  if (!item || !isOpen) return null;

  const imageUrl = item.images || '';
  const isOwner = currentUserId === item.seller.id;
  const canEdit = isOwner && !!onEdit;
  const [editForm, setEditForm] = useState({ title: item.title, price: String(item.price), category: item.category, images: item.images || '' });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [saveError, setSaveError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.filter((c: any) => c.name !== '全部')))
      .catch(() => {});
  }, []);

  const startEdit = () => {
    if (!canEdit) return;
    setEditForm({ title: item.title, price: String(item.price), category: item.category, images: item.images || '' });
    setSaveError('');
    setShowEditModal(true);
    onEdit?.(item.id);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditImageFile(null);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  const removeEditImage = () => {
    setEditImageFile(null);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    setEditPreviewUrl('');
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!editForm.title.trim()) { setSaveError('标题不能为空'); return; }
    if (!editForm.price || isNaN(parseFloat(editForm.price)) || parseFloat(editForm.price) <= 0) { setSaveError('请输入有效价格'); return; }
    if (!editForm.category) { setSaveError('请选择分类'); return; }

    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('title', editForm.title.trim());
      form.append('price', editForm.price);
      form.append('category', editForm.category);
      if (editImageFile) form.append('image', editImageFile);

      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error || '保存失败');
        return;
      }
      setShowEditModal(false);
      if (onSaved) onSaved(item);
    } catch {
      setSaveError('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

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
                <button
                  onClick={startEdit}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  编辑 &rsaquo;
                </button>
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
      {/* 编辑弹窗 */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="编辑商品"
      >
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{saveError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="商品标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">价格 (元) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editForm.price}
              onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
            <div
              onClick={() => editFileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
            >
              {editPreviewUrl ? (
                <div className="relative">
                  <img src={editPreviewUrl} alt="预览" className="w-full h-40 object-contain rounded-lg p-2" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeEditImage(); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">点击上传图片</p>
                </div>
              )}
            </div>
            <input
              ref={editFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleEditImageSelect}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2 rounded-lg font-medium transition-colors"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
