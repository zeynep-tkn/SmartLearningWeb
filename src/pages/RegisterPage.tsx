
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axios.post('https://localhost:7101/api/account/register', { email, password });
            navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
        } catch (err: any) {
            if (err.response && err.response.data && Array.isArray(err.response.data)) {
                const errorMessages = err.response.data.map((e: any) => e.description).join(' ');
                setError(errorMessages || 'Kayıt başarısız oldu.');
            } else {
                setError('Kayıt başarısız oldu. Lütfen tekrar deneyin.');
            }
            console.error('Kayıt sırasında bir hata oluştu!', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Hesap Oluştur</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            E-posta Adresi
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                         <p className="text-xs text-gray-600">Şifreniz en az 6 karakter olmalı, büyük/küçük harf, rakam ve özel karakter (!, ?, * vb.) içermelidir.</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-indigo-400"
                        >
                            {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                        </button>
                    </div>
                </form>
                 <p className="text-center text-gray-600 text-sm mt-6">
                    Zaten bir hesabınız var mı?{' '}
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
                        Giriş Yapın
                    </Link>
                </p>
            </div>
        </div>
    );
}