'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';

interface Seller {
  id: number;
  studentId: string;
  name: string;
  avatar: string | null;
  email: string | null;
  dormitory: string | null;
  phone: string | null;
}

interface ItemDetailProps {
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
    createdAt: string;
    campusLocation?: string | null;
    tradeMethod?: string | null;
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
  const [editForm, setEditForm] = useState({ title: item.title, price: String(item.price), category: item.category, images: item.images || '', description: item.description || '', originalPrice: String(item.originalPrice || ''), subCategory: item.subCategory || '', condition: item.condition || '', campusLocation: item.campusLocation || '', tradeMethod: item.tradeMethod || '面交' });
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
    setEditForm({ title: item.title, price: String(item.price), category: item.category, images: item.images || '', description: item.description || '', originalPrice: String(item.originalPrice || ''), subCategory: item.subCategory || '', condition: item.condition || '', campusLocation: item.campusLocation || '', tradeMethod: item.tradeMethod || '面交' });
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
      if (editForm.description) form.append('description', editForm.description);
      if (editForm.originalPrice) form.append('originalPrice', editForm.originalPrice);
      if (editForm.subCategory) form.append('subCategory', editForm.subCategory);
      if (editForm.condition) form.append('condition', editForm.condition);
      if (editForm.campusLocation) form.append('campusLocation', editForm.campusLocation);
      if (editForm.tradeMethod) form.append('tradeMethod', editForm.tradeMethod);
      if (editImageFile) form.append('image', editImageFile);

      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const updatedItem = await res.json();
      if (!res.ok) {
        setSaveError(updatedItem.error || '保存失败');
        return;
      }
      setShowEditModal(false);
      if (onSaved) onSaved(updatedItem);
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
              loading="lazy"
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
              <div className="text-right">
                <span className="text-2xl font-bold text-primary-600">¥{item.price}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <p className="text-sm text-gray-400 line-through">原价 ¥{item.originalPrice}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500">分类: {item.category}</p>
              {item.subCategory && <p className="text-sm text-gray-400">· {item.subCategory}</p>}
            </div>
            {item.condition && (
              <span className="inline-block mt-1 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded">
                {item.condition}
              </span>
            )}
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

          {(item.campusLocation || item.tradeMethod) && (
            <div className="flex gap-6 text-sm">
              {item.campusLocation && (
                <div>
                  <span className="text-gray-400">地址</span>
                  <p className="text-gray-700">{item.campusLocation}</p>
                </div>
              )}
              {item.tradeMethod && (
                <div>
                  <span className="text-gray-400">交易方式</span>
                  <p className="text-gray-700">{item.tradeMethod}</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">卖家信息</h4>
            <div className="flex items-center gap-3">
              {item.seller.avatar ? (
                <img src={item.seller.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {item.seller.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{item.seller.name}</p>
                <p className="text-xs text-gray-400">学号: {item.seller.studentId}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              {item.seller.dormitory && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{item.seller.dormitory}</span>
                </div>
              )}
              {item.seller.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{item.seller.phone}</span>
                </div>
              )}
              {item.seller.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{item.seller.email}</span>
                </div>
              )}
            </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">售价 (元) *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">原价 (元)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editForm.originalPrice}
                onChange={(e) => setEditForm((p) => ({ ...p, originalPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="选填"
              />
            </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">子分类</label>
            <input
              type="text"
              value={editForm.subCategory}
              onChange={(e) => setEditForm((p) => ({ ...p, subCategory: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="如：计算机教材"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成色</label>
            <div className="flex flex-wrap gap-2">
              {['99新', '95新', '9成新', '8成新', '有瑕疵'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditForm((p) => ({ ...p, condition: p.condition === c ? '' : c }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    editForm.condition === c
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在宿舍</label>
            <input
              type="text"
              value={editForm.campusLocation}
              onChange={(e) => setEditForm((p) => ({ ...p, campusLocation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="如：兰园2栋"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="描述一下商品"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">交易方式</label>
            <select
              value={editForm.tradeMethod}
              onChange={(e) => setEditForm((p) => ({ ...p, tradeMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="面交">面交</option>
              <option value="自取">自取</option>
              <option value="快递">快递</option>
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
              onClick={closeEditModal}
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
