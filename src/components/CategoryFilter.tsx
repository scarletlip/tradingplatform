'use client';

import { useRef, useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  icon?: string | null;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-cat="${selectedCategory}"]`) as HTMLElement;
    if (activeBtn) {
      const { offsetLeft, offsetWidth } = activeBtn;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [selectedCategory, categories]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative flex flex-wrap gap-2"
      >
        {/* Sliding indicator */}
        <div
          className="absolute top-0 h-full bg-primary-100/70 rounded-xl transition-all duration-300 ease-out pointer-events-none"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />

        {categories.map((cat) => (
          <button
            key={cat.id}
            data-cat={cat.name}
            onClick={() => onSelect(cat.name)}
            className={`relative z-10 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
              selectedCategory === cat.name
                ? 'text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
