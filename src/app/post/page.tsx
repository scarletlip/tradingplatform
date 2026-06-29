'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage } from '@/lib/compressImage';

const CONDITION_OPTIONS = ['99新', '95新', '9成新', '8成新', '有瑕疵'];

// AI 模板引擎：根据输入拼装生成描述
function generateDescription(title: string, category: string, condition: string, originalPrice: string) {
  const conditionDescMap: Record<string, string[]> = {
    '99新': ['几乎全新，仅开封未使用', '准新品，买来几乎没用过', '保存极好，看不出使用痕迹'],
    '95新': ['使用次数极少，无明显使用痕迹', '入手后很少使用，成色很新', '轻微使用，外观完好'],
    '9成新': ['有轻微使用痕迹，功能完好', '正常使用过一段时间，各方面正常', '使用过但保养得很仔细'],
    '8成新': ['正常使用痕迹，功能无问题', '陪伴了一段时间，功能一切正常', '有使用痕迹但不影响正常使用'],
    '有瑕疵': ['有瑕疵但不影响正常使用', '部分磨损/小瑕疵，功能无碍', '适合实用主义者，性价比很高'],
  };
  const defaultCond = ['成色如图', '实物拍摄', '详见图片'];

  const conditions = conditionDescMap[condition] || defaultCond;
  const condText = conditions[Math.floor(Math.random() * conditions.length)];

  const origPrice = parseFloat(originalPrice) || 0;
  const rateMap: Record<string, number> = { '99新': 0.7, '95新': 0.6, '9成新': 0.5, '8成新': 0.35, '有瑕疵': 0.25 };
  const rate = rateMap[condition] || 0.4;
  const suggestedPrice = origPrice > 0 ? Math.max(1, Math.round(origPrice * rate)) : 0;

  const sellerNote = ['校内面交或自取', '当面验货满意再带走', '欢迎来宿舍看实物', '可站内联系我'][Math.floor(Math.random() * 4)];
  const emoji = { '教材': '📚', '数码': '💻', '生活': '🏠', '穿搭': '👔', '运动': '⚽', '乐器': '🎵' }[category] || '🎁';

  const templates: Record<string, string[]> = {
    '教材': [
      `${emoji} 课程必备！${title}，${condText}。${origPrice > 0 ? `原价¥${origPrice}购入，现¥${suggestedPrice}出。` : ''}适合学弟学妹继续使用，笔记整洁可翻阅。`,
      `${emoji} 出${title}。${condText}。${origPrice > 0 ? `当初¥${origPrice}买的，¥${suggestedPrice}转给有需要的同学。` : ''}教材保护得不错，${sellerNote}。`,
    ],
    '数码': [
      `${emoji} 闲置${title}，${condText}。${origPrice > 0 ? `原价¥${origPrice}，现¥${suggestedPrice}。` : ''}配件齐全，${sellerNote}。`,
      `${emoji} 出${title}一台。${condText}，无暗病。${origPrice > 0 ? `原价¥${origPrice}，二手价¥${suggestedPrice}。` : ''}支持当面验机。`,
    ],
    '生活': [
      `${emoji} 宿舍实用好物——${title}！${condText}。${origPrice > 0 ? `原价¥${origPrice}，现¥${suggestedPrice}出。` : ''}在校即可自提，方便快捷。`,
      `${emoji} ${title}，${condText}。${origPrice > 0 ? `花了¥${origPrice}入手，¥${suggestedPrice}转。` : ''}适合宿舍使用，${sellerNote}。`,
    ],
    '穿搭': [
      `${emoji} 出${title}。${condText}。${origPrice > 0 ? `原价¥${origPrice}，现¥${suggestedPrice}。` : ''}可约时间试穿/看实物，合身再带走！`,
      `${emoji} 闲置${title}，${condText}。${origPrice > 0 ? `买的时候¥${origPrice}，¥${suggestedPrice}转给喜欢的同学。` : ''}${sellerNote}。`,
    ],
    '运动': [
      `${emoji} 运动装备 ${title}！${condText}。${origPrice > 0 ? `原价¥${origPrice}，¥${suggestedPrice}出。` : ''}热爱运动的同学看过来，${sellerNote}。`,
      `${emoji} 出${title}，${condText}。${origPrice > 0 ? `当初¥${origPrice}入的，¥${suggestedPrice}转。` : ''}陪你一起动起来～`,
    ],
    '乐器': [
      `${emoji} 音乐爱好者的选择——${title}。${condText}。${origPrice > 0 ? `原价¥${origPrice}，现¥${suggestedPrice}。` : ''}欢迎来试音，喜欢再带走。`,
      `${emoji} ${title}，${condText}。${origPrice > 0 ? `入手¥${origPrice}，¥${suggestedPrice}转给热爱音乐的你。` : ''}${sellerNote}。`,
    ],
  };

  const choices = templates[category] || [
    `${emoji} ${title}，${condText}。${origPrice > 0 ? `原价¥${origPrice}，现¥${suggestedPrice}出。` : ''}有意请联系，${sellerNote}。`,
  ];
  const desc = choices[Math.floor(Math.random() * choices.length)];

  const genTitle = `${emoji} ${title} · ${condition || '闲置好物'}`;
  return { title: genTitle, description: desc, price: suggestedPrice };
}

export default function PostPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    condition: '',
    campusLocation: '',
    tradeMethod: '面交',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 生成状态
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ title: string; description: string; price: number } | null>(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.filter((c: any) => c.name !== '全部')))
      .catch(() => {});
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImageFile(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // AI 智能生成描述
  const handleAIGenerate = async () => {
    setAiError('');
    if (!formData.title && !formData.category) {
      setAiError('请至少填写标题和分类');
      return;
    }
    setAiLoading(true);
    // 模拟 AI 延迟
    await new Promise((r) => setTimeout(r, 800));
    const generated = generateDescription(formData.title, formData.category, formData.condition, formData.originalPrice);
    setAiResult(generated);
    setAiLoading(false);
  };

  const applyAIResult = () => {
    if (!aiResult) return;
    if (aiResult.title) setFormData((p) => ({ ...p, title: aiResult.title }));
    if (aiResult.description) setFormData((p) => ({ ...p, description: aiResult.description }));
    if (aiResult.price && !formData.price) setFormData((p) => ({ ...p, price: String(aiResult.price) }));
    setAiResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('category', formData.category);
      if (formData.originalPrice) form.append('originalPrice', formData.originalPrice);
      if (formData.subCategory) form.append('subCategory', formData.subCategory);
      if (formData.condition) form.append('condition', formData.condition);
      if (formData.campusLocation) form.append('campusLocation', formData.campusLocation);
      if (formData.tradeMethod) form.append('tradeMethod', formData.tradeMethod);
      if (imageFile) form.append('image', imageFile);

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '发布失败');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">发布闲置</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-sm border p-6">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="给你的商品起个名字"
            required
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            required
          >
            <option value="">请选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 子分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">子分类</label>
          <input
            type="text"
            value={formData.subCategory}
            onChange={(e) => handleChange('subCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="如：计算机教材、耳机等"
          />
        </div>

        {/* 价格行 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">售价 (元) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原价 (元)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => handleChange('originalPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="原价（选填）"
            />
          </div>
        </div>

        {/* 成色 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">成色</label>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleChange('condition', formData.condition === c ? '' : c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  formData.condition === c
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 地址 + 交易方式 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在宿舍</label>
            <input
              type="text"
              value={formData.campusLocation}
              onChange={(e) => handleChange('campusLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="如：兰园2栋"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">交易方式</label>
            <select
              value={formData.tradeMethod}
              onChange={(e) => handleChange('tradeMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="面交">面交</option>
              <option value="自取">自取</option>
              <option value="快递">快递</option>
            </select>
          </div>
        </div>

        {/* 图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
          >
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="预览" className="w-full h-48 object-contain rounded-lg p-2" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  type="button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">点击或拖拽上传图片</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* AI 智能生成描述 */}
        <div className="border border-purple-200 bg-purple-50/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-purple-700">AI 智能生成描述</span>
          </div>

          {!aiResult ? (
            <>
              <p className="text-xs text-gray-400 mb-3">根据标题、分类、成色和原价自动生成商品标题、描述和建议售价</p>
              {aiError && (
                <p className="text-xs text-red-500 mb-2">{aiError}</p>
              )}
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {aiLoading ? 'AI 思考中...' : '✨ 生成描述与建议售价'}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">📝 生成标题</p>
                <p className="text-sm text-gray-800">{aiResult.title}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">📄 生成描述</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult.description}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">💰 建议售价</p>
                <p className="text-lg font-bold text-primary-600">¥{aiResult.price}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyAIResult}
                  className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  一键填入表单
                </button>
                <button
                  type="button"
                  onClick={() => setAiResult(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  放弃
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="描述一下商品的状况、使用情况等"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? '发布中...' : '发布'}
        </button>
      </form>
    </div>
  );
}
