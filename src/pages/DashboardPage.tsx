import React, { useState, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [uploadedDocument, setUploadedDocument] = useState<{ id: number; fileName: string } | null>(null);
    const [questionCount, setQuestionCount] = useState(10);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setUploadedDocument(null);
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Lütfen önce bir dosya seçin.');
            return;
        }

        const token = getToken();
        if (!token) {
            setMessage('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setIsLoading(true);
        setMessage('Dosya yükleniyor...');

        try {
            const response = await axios.post('https://localhost:7101/api/document/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            const documentId = response.data.documentId;
            setUploadedDocument({ id: documentId, fileName: selectedFile.name });
            setMessage(`'${selectedFile.name}' başarıyla yüklendi. Şimdi quiz seçeneklerini kullanabilirsiniz.`);
            
            // Dosya seçme alanını temizle
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setSelectedFile(null);

        } catch (error) {
            setMessage('Dosya yüklenirken bir hata oluştu.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePdfDownload = async () => {
        if (!uploadedDocument) return;
        
        setIsLoading(true);
        setMessage("PDF oluşturuluyor, lütfen bekleyin...");
        const token = getToken();

        try {
            const response = await axios.post(
                `https://localhost:7101/api/pdf/generate-quiz/${uploadedDocument.id}?questionCount=${questionCount}`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob',
                }
            );

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            
            const link = document.createElement('a');
            link.href = fileURL;
            const fileName = uploadedDocument.fileName.replace(/\.[^/.]+$/, "");
            link.setAttribute('download', `${fileName}_quiz.pdf`);
            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            URL.revokeObjectURL(fileURL);
            
            setMessage("PDF başarıyla indirildi!");

        } catch (error) {
            setMessage("PDF oluşturulurken bir hata oluştu.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Döküman Yükle</h2>
                <p className="text-gray-600 mb-6">Analiz etmek ve quiz oluşturmak için bir .pdf veya .docx dosyası seçin.</p>
                
                <div className="flex items-center space-x-4">
                    <label className="w-full flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm tracking-wide border border-indigo-600 cursor-pointer hover:bg-indigo-600 hover:text-white">
                        <svg className="w-6 h-6 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V3h2v8z" />
                        </svg>
                        <span className="truncate max-w-xs">{selectedFile ? selectedFile.name : 'Dosya Seç'}</span>
                        <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button onClick={handleUpload} disabled={isLoading || !selectedFile} className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {isLoading && !uploadedDocument ? 'Yükleniyor...' : 'Yükle'}
                    </button>
                </div>
            </div>

            {uploadedDocument && (
                <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Quiz Seçenekleri</h3>
                    <p className="text-gray-600 mb-6"><strong>Yüklenen Dosya:</strong> {uploadedDocument.fileName}</p>
                    <div className="flex items-center space-x-4">
                        <div>
                            <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 mb-1">Soru Sayısı</label>
                            <select id="question-count" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option value={10}>10 Soru</option>
                                <option value={20}>20 Soru</option>
                                <option value={30}>30 Soru</option>
                            </select>
                        </div>
                        <button onClick={handlePdfDownload} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-green-400">
                            {isLoading ? 'Oluşturuluyor...' : 'PDF Olarak İndir'}
                        </button>
                       <button 
                           onClick={() => navigate(`/quiz/${uploadedDocument.id}?count=${questionCount}`)} 
                           disabled={isLoading} 
                           className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-blue-400">
                           Web'de Çöz
                        </button>
                    </div>
                </div>
            )}

            {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
        </div>
    );
}
