import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../auth'; // auth yardımcımızı kullanıyoruz

const ProtectedRoute = () => {
  // Kullanıcı giriş yapmış mı diye kontrol et
  if (!isAuthenticated()) {
    // Giriş yapmamışsa, /login sayfasına yönlendir
    return <Navigate to="/login" />;
  }

  // Giriş yapmışsa, bu component'in içine yerleştirilen asıl sayfayı (örn: Dashboard) göster
  return <Outlet />;
};

export default ProtectedRoute;