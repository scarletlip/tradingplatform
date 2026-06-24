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
}

export function ItemDetail({ item, isOpen, onClose }: ItemDetailProps) {
  if (!item || !isOpen) return null;

  const images = item.images ? JSON.parse(item.images) : [];

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
          {images.length > 0 && (
            <img
              src={images[0]}
              alt={item.title}
              className="w-full aspect-square object-cover rounded-lg"
            />
          )}

          <div>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <span className="text-2xl font-bold text-primary-600">¥{item.price}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">分类: {item.category}</p>
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
            <button className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              联系卖家
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
