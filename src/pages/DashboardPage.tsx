import React, { useState, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
    icon: JSX.Element;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                {icon}
            </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

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
            setMessage(`'${selectedFile.name}' başarıyla yüklendi.`);
            
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
        <div className="space-y-12">
            {/* BÖLÜM 1: DOKÜMAN YÜKLEME ALANI */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Döküman Yükle</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Öğrenme sürecinizi hızlandırın. Ders notlarınızı, makalelerinizi veya herhangi bir dökümanı yükleyin, sizin için özetleyip kişiselleştirilmiş quizler oluşturalım.</p>
                
                <div className="mt-4 flex flex-col items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-indigo-300 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-sm text-indigo-700"><span className="font-semibold">Dosya seçmek için tıklayın</span> veya sürükleyip bırakın</p>
                            <p className="text-xs text-gray-500">PDF veya DOCX</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                    </label>
                    {selectedFile && <p className="mt-4 text-gray-700">Seçilen Dosya: <strong>{selectedFile.name}</strong></p>}
                    <button onClick={handleUpload} disabled={isLoading || !selectedFile} className="mt-4 w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105">
                        {isLoading && !uploadedDocument ? 'Yükleniyor...' : 'Yükle ve Analiz Et'}
                    </button>
                </div>
            </div>

            {/* BÖLÜM 2: QUIZ SEÇENEKLERİ (Dosya Yüklendikten Sonra Görünür) */}
            {uploadedDocument && (
                <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Quiz Seçenekleri</h3>
                    <p className="text-gray-600 mb-6"><strong>'{uploadedDocument.fileName}'</strong> için quiz oluşturmaya hazırsınız.</p>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="question-count" className="font-medium text-gray-700">Soru Sayısı:</label>
                            <select id="question-count" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option value={10}>10 Soru</option>
                                <option value={20}>20 Soru</option>
                                <option value={30}>30 Soru</option>
                            </select>
                        </div>
                        <button onClick={handlePdfDownload} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-green-400 transition-transform transform hover:scale-105">
                            {isLoading ? 'Oluşturuluyor...' : 'PDF Olarak İndir'}
                        </button>
                        <button onClick={() => navigate(`/quiz/${uploadedDocument.id}?count=${questionCount}`)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-blue-400 transition-transform transform hover:scale-105">
                            Web'de Çöz
                        </button>
                    </div>
                </div>
            )}

            {message && <p className="mt-4 text-center text-gray-600">{message}</p>}

            {/* BÖLÜM 3: UYGULAMA ÖZELLİKLERİ */}
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.696-2.696L11.25 18l1.938-.648a3.375 3.375 0 002.696-2.696L16.25 13.5l.648 1.938a3.375 3.375 0 002.696 2.696L21 18.75l-1.938.648a3.375 3.375 0 00-2.696 2.696z" /></svg>}
                    title="Anında Quiz Oluşturma"
                    description="Yapay zeka, dökümanınızın en önemli noktalarından saniyeler içinde zorlayıcı ve öğretici sorular üretir."
                />
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>}
                    title="Kişiselleştirilmiş Tekrar Planı"
                    description="Quiz'deki yanlışlarınıza göre, hangi konulara odaklanmanız gerektiğini gösteren özel bir çalışma planı alın."
                />
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>}
                    title="PDF Olarak İndirme"
                    description="Oluşturulan quiz'leri cevap anahtarıyla birlikte PDF olarak indirin ve istediğiniz zaman, istediğiniz yerde çalışın."
                />
            </div>
        </div>
    );
}
