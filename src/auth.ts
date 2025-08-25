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
    return !!token; // Token varsa true, yoksa false döndürür
};