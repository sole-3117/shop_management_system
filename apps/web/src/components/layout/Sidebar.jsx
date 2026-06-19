import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const nav = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/products', icon: '📦', label: 'Mahsulotlar' },
  { to: '/categories', icon: '🏷️', label: 'Kategoriyalar' },
  { to: '/orders', icon: '🛒', label: 'Buyurtmalar' },
  { to: '/customers', icon: '👥', label: 'Mijozlar' },
  { to: '/inventory', icon: '🏪', label: 'Ombor' },
  { to: '/analytics', icon: '📈', label: 'Statistika' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-white font-bold text-xl">🏪 Shop Admin</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>⚙️</span>
            <span>Sozlamalar</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <span>🚪</span>
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}
