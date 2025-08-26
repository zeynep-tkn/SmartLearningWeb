import { jwtDecode } from 'jwt-decode';

// Token'dan okunacak kullanıcı bilgilerinin yapısını tanımlıyoruz
interface UserPayload {
    email: string;
    // Token'da olabilecek diğer alanlar (sub, jti vb.)
    [key: string]: any;
}

// Token'ı tarayıcının yerel deposuna kaydeder
export const saveToken = (token: string): void => {
    localStorage.setItem('authToken', token);
};

// Kayıtlı token'ı yerel depodan okur
export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// Çıkış yaparken token'ı siler
export const removeToken = (): void => {
    localStorage.removeItem('authToken');
};

// Kullanıcının giriş yapıp yapmadığını kontrol eder (token var mı?)
export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

// --- YENİ FONKSİYON ---
// Token'ı çözerek içindeki kullanıcı e-postasını döndürür
export const getUserEmail = (): string | null => {
    const token = getToken();
    if (!token) {
        return null;
    }
    try {
        const decodedToken = jwtDecode<UserPayload>(token);
        // Token'ın içindeki email alanını döndür
        return decodedToken.email;
    } catch (error) {
        console.error("Geçersiz token:", error);
        // Token çözülemezse (bozuksa), null döndür ve token'ı temizle
        removeToken();
        return null;
    }
};
