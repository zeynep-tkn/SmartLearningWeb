import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Navigate'i import et
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import QuizPage from './pages/QuizPage';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tüm sayfaları Layout bileşeniyle sarıyoruz */}
        <Route path="/" element={<Layout />}>
        
          {/* Ana sayfa (/) için login'e yönlendirme */}
          <Route index element={<Navigate to="/login" />} />

          {/* Herkese Açık Rotalar */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Korumalı Rotalar */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="quiz/:documentId" element={<QuizPage />} />
          </Route>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;