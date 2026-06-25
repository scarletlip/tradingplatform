import { ItemCard } from './ItemCard';

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
  seller: Seller;
}

interface ItemGridProps {
  items: Item[];
  onItemSelect: (id: number) => void;
  onFavorite?: (id: number) => void;
  favoriteIds?: Set<number>;
}

export function ItemGrid({ items, onItemSelect, onFavorite, favoriteIds }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-base font-medium">暂无商品</p>
        <p className="text-sm mt-1">换个分类试试吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={onItemSelect}
          onFavorite={onFavorite}
          isFavorite={favoriteIds?.has(item.id)}
        />
      ))}
    </div>
  );
}
