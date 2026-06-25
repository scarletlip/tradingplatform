'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ----- Types -----
interface Stats {
  totalUsers: number;
  totalItems: number;
  activeItems: number;
  soldItems: number;
  offlineItems: number;
  categories: { name: string; count: number }[];
}

interface AdminUser {
  id: number;
  studentId: string;
  name: string;
  email: string | null;
  dormitory: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { items: number };
}

interface AdminItem {
  id: number;
  title: string;
  price: number;
  category: string;
  status: string;
  createdAt: string;
  seller: { id: number; studentId: string; name: string; dormitory: string | null; phone: string | null };
}

interface AdminCategory {
  id: number;
  name: string;
  sortOrder: number;
}

// ----- Main Component -----
export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'items' | 'categories'>('dashboard');
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!t || !userStr) { router.push('/login'); return; }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN') { router.push('/'); return; }
      setToken(t);
      setAuthorized(true);
    } catch { router.push('/login'); }
    setChecked(true);
  }, [router]);

  if (!checked) return null;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">管理后台</h1>
          <button onClick={() => router.push('/')} className="text-sm text-gray-400 hover:text-white transition-colors">
            返回首页
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex">
          {[
            { key: 'dashboard' as const, label: '数据概览' },
            { key: 'users' as const, label: '用户管理' },
            { key: 'items' as const, label: '商品管理' },
            { key: 'categories' as const, label: '分类管理' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard token={token} />}
        {activeTab === 'users' && <UserManagement token={token} />}
        {activeTab === 'items' && <ItemManagement token={token} />}
        {activeTab === 'categories' && <CategoryManagement token={token} />}
      </main>
    </div>
  );
}

// ==================== TAB: DASHBOARD ====================
function Dashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [token]);

  if (!stats) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  return (
    <div className="space-y-6">
      {/* Number cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="注册用户" value={stats.totalUsers} color="blue" />
        <StatCard label="商品总数" value={stats.totalItems} color="gray" />
        <StatCard label="在售" value={stats.activeItems} color="green" />
        <StatCard label="已售" value={stats.soldItems} color="yellow" />
        <StatCard label="已下架" value={stats.offlineItems} color="red" />
      </div>

      {/* Category distribution */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">分类分布</h3>
        <div className="space-y-2">
          {stats.categories.map((c) => {
            const pct = stats.totalItems > 0 ? Math.round((c.count / stats.totalItems) * 100) : 0;
            return (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">{c.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-primary-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{c.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color] || colors.gray}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-70">{label}</p>
    </div>
  );
}

// ==================== TAB: USERS ====================
function UserManagement({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadUsers = useCallback(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAction = async (userId: number, action: string, password?: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, password }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || '操作完成');
    if (res.ok) loadUsers();
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  return (
    <div>
      {msg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{msg}</div>}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">学号</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">姓名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">宿舍</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">手机</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{u.studentId}</td>
                <td className="px-4 py-3 text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.dormitory || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{u.phone || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{u._count.items}</td>
                <td className="px-4 py-3">
                  {u.role === 'BANNED' ? (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">已禁用</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">正常</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAction(u.id, 'reset-password')}
                      className="text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors"
                    >
                      重置密码
                    </button>
                    <button
                      onClick={() => handleAction(u.id, 'toggle-ban')}
                      className={`text-xs font-medium transition-colors ${
                        u.role === 'BANNED'
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      {u.role === 'BANNED' ? '解禁' : '禁用'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== TAB: ITEMS ====================
function ItemManagement({ token }: { token: string }) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 12;

  const loadItems = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (filterStatus !== 'ALL') params.set('status', filterStatus);
    fetch(`/api/admin/items?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setItems(data.items || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, page, filterStatus]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadItems();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定删除该商品？')) return;
    await fetch(`/api/admin/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadItems();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">状态筛选:</span>
        {['ALL', 'ACTIVE', 'SOLD', 'OFFLINE'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === s ? 'bg-primary-500 text-white' : 'bg-white border text-gray-600 hover:border-primary-400'
            }`}
          >
            {s === 'ALL' ? '全部' : s === 'ACTIVE' ? '在售' : s === 'SOLD' ? '已售' : '已下架'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">标题</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">价格</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">分类</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">卖家</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 max-w-40 truncate">{item.title}</td>
                  <td className="px-4 py-3 text-gray-900">¥{item.price}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-gray-500">{item.seller.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status !== 'OFFLINE' && (
                        <button onClick={() => handleStatus(item.id, 'OFFLINE')} className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                          下架
                        </button>
                      )}
                      {item.status === 'OFFLINE' && (
                        <button onClick={() => handleStatus(item.id, 'ACTIVE')} className="text-xs text-green-600 hover:text-green-700 font-medium">
                          恢复
                        </button>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40">上一页</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40">下一页</button>
          <span className="text-xs text-gray-400 ml-2">共 {total} 件</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-600',
    SOLD: 'bg-gray-100 text-gray-500',
    OFFLINE: 'bg-yellow-100 text-yellow-600',
  };
  const labels: Record<string, string> = { ACTIVE: '在售', SOLD: '已售', OFFLINE: '已下架' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
}

// ==================== TAB: CATEGORIES ====================
function CategoryManagement({ token }: { token: string }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [msg, setMsg] = useState('');

  const loadCategories = useCallback(() => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, [token]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    showMsg(res.ok ? '分类已添加' : data.error);
    if (res.ok) { setNewName(''); loadCategories(); }
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const data = await res.json();
    showMsg(res.ok ? '已更新' : data.error);
    if (res.ok) { setEditingId(null); loadCategories(); }
  };

  const handleMove = async (id: number, direction: 'up' | 'down') => {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'reorder', direction }),
    });
    loadCategories();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定删除该分类？')) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    showMsg(res.ok ? '已删除' : data.error);
    if (res.ok) loadCategories();
  };

  return (
    <div className="space-y-6">
      {msg && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">{msg}</div>}

      {/* Add new */}
      <div className="flex items-center gap-3">
        <input
          type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="新分类名称"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-primary-500 outline-none"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
          添加
        </button>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl border overflow-hidden max-w-md">
        {categories.map((cat, idx) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-6">{idx + 1}</span>
              {editingId === cat.id ? (
                <input
                  type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                  className="px-2 py-1 border border-gray-300 rounded text-sm w-32 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              ) : (
                <span className="text-sm text-gray-900">{cat.name}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {cat.name !== '全部' && (
                <>
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => handleRename(cat.id)} className="text-xs text-green-600 font-medium">保存</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">取消</button>
                    </>
                  ) : (
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-xs text-gray-500 hover:text-primary-600 font-medium">
                      编辑
                    </button>
                  )}
                  <button onClick={() => handleMove(cat.id, 'up')} disabled={idx === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30" title="上移">↑</button>
                  <button onClick={() => handleMove(cat.id, 'down')} disabled={idx === categories.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30" title="下移">↓</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    删除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
