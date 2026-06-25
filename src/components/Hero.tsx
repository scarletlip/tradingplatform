'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Hero() {
  const [stats, setStats] = useState({ items: 0, users: 0, categories: 0 });

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((d) => setStats({ items: d.items || 0, users: d.users || 0, categories: d.categories || 0 }))
      .catch(() => setStats({ items: 24, users: 15, categories: 8 }));
  }, []);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-green-50/60 to-emerald-50/40 py-12 sm:py-16">
      {/* Floating decoration circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary-200/30 animate-float" />
        <div className="absolute top-1/2 -right-8 w-28 h-28 rounded-full bg-emerald-200/25 animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-4 left-1/4 w-20 h-20 rounded-full bg-primary-300/20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-8 right-1/3 w-16 h-16 rounded-full bg-teal-200/30 animate-float-slow" style={{ animationDelay: '0.5s' }} />
        {/* Small leaf decorations */}
        <div className="absolute top-20 left-1/5 text-4xl opacity-20 animate-float select-none" style={{ animationDelay: '3s' }}>🍃</div>
        <div className="absolute bottom-8 right-1/5 text-3xl opacity-15 animate-float-slow select-none" style={{ animationDelay: '1.5s' }}>🌿</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            校园闲置<span className="text-primary-500">好物</span>一站淘
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            教材·数码·生活·穿搭<br className="sm:hidden" />让每件闲置都有新故事
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-6 sm:gap-10 mt-8 text-center"
        >
          {[
            { num: stats.items, label: '在售商品' },
            { num: stats.users, label: '活跃用户' },
            { num: stats.categories, label: '分类覆盖' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{s.num}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
