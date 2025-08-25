import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import QuizPage from './pages/QuizPage';
import Layout from './components/Layout'; // Layout'u import ediyoruz

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tüm sayfaları Layout bileşeniyle sarıyoruz */}
        <Route path="/" element={<Layout />}>
        
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