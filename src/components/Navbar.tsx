import Link from 'next/link';

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function Navbar({ isLoggedIn, username, onLoginClick, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary-500 text-2xl font-bold">校园二手市场</span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 text-sm">欢迎, {username}</span>
                <button
                  onClick={onLogout}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                  退出登录
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
