import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { isAuthenticated, removeToken, getUserEmail } from '../auth'; // getUserEmail'i import et
import { useState, useEffect } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  // Sayfa yüklendiğinde veya giriş durumu değiştiğinde kullanıcı e-postasını al
  useEffect(() => {
    if (loggedIn) {
      setUserEmail(getUserEmail());
    } else {
      setUserEmail(null);
    }
  }, [loggedIn]);

  const handleLogout = () => {
    removeToken();
    setIsDropdownOpen(false); // Menüyü kapat
    navigate('/login');
  };

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
            
            {/* --- YENİ LOGO VE BAŞLIK --- */}
            <Link to={loggedIn ? "/dashboard" : "/login"} className="flex items-center gap-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-indigo-600">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM5.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM5.25 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 015.25 12zM6.166 5.106a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 00-1.06-1.061L6.166 5.106z" />
              </svg>
              <span className="text-xl font-bold text-gray-800">Smart Learning Assistant</span>
            </Link>
            {/* --- BİTTİ --- */}

            <div className="flex items-center space-x-4">
              {loggedIn ? (
                // --- YENİ KULLANICI MENÜSÜ ---
                <div className="relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-gray-600 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
                  </button>
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <div className="px-4 py-3">
                          <p className="text-sm text-gray-900 font-medium">Giriş Yapan Kullanıcı</p>
                          <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                        </div>
                        <div className="border-t border-gray-100"></div>
                        <a href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                          Çıkış Yap
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                // --- BİTTİ ---
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClasses}>Giriş Yap</NavLink>
                  <NavLink to="/register" className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium shadow-sm text-sm">Kayıt Ol</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
