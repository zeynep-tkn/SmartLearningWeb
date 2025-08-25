import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { isAuthenticated, removeToken } from '../auth';

export default function Layout() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  // Aktif link stili için bir yardımcı fonksiyon
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to={loggedIn ? "/dashboard" : "/login"} className="text-2xl font-bold text-indigo-600 hover:text-indigo-700">
                Akıllı Asistan
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {loggedIn ? (
                <>
                  <NavLink to="/dashboard" className={navLinkClasses}>
                    Dosya Yükle
                  </NavLink>
                  <button onClick={handleLogout} className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-medium shadow-sm text-sm">
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClasses}>
                    Giriş Yap
                  </NavLink>
                  <NavLink to="/register" className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium shadow-sm text-sm">
                    Kayıt Ol
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
          <Outlet /> {/* Sayfa içeriği burada görünecek */}
        </div>
      </main>
    </div>
  );
}
