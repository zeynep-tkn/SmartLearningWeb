import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../auth';

// API'den gelen soru yapısını tanımlayalım
interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

// A, B, C, D, E harflerini oluşturmak için bir yardımcı dizi
const optionLetters = ['A', 'B', 'C', 'D', 'E'];

export default function QuizPage() {
    const { documentId } = useParams<{ documentId: string }>();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz etkileşimi için state'ler
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [score, setScore] = useState(0);
    
    // Tekrar planı için state'ler
    const [studyPlan, setStudyPlan] = useState<string | null>(null);
    const [isPlanLoading, setIsPlanLoading] = useState(false);

    // Quiz'i API'den çekme
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!documentId) return;
            const token = getToken();
            if (!token) {
                setError("Giriş yapılmamış.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.post(
                    `https://localhost:7101/api/quiz/generate-from-document/${documentId}`,
                    {},
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setQuestions(response.data);
            } catch (err) {
                setError("Quiz yüklenirken bir hata oluştu.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [documentId]);

    const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
        setUserAnswers({ ...userAnswers, [questionIndex]: optionIndex });
    };

    const handleQuizSubmit = () => {
        if (Object.keys(userAnswers).length !== questions.length) {
            alert("Lütfen tüm soruları cevaplayın!");
            return;
        }
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswerIndex) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setIsQuizFinished(true);
    };

    const handleGenerateStudyPlan = async () => {
        setIsPlanLoading(true);
        const wrongQuestionsText = questions
            .filter((q, index) => userAnswers[index] !== q.correctAnswerIndex)
            .map(q => q.questionText);

        if (wrongQuestionsText.length === 0) {
            setStudyPlan("Tebrikler, tüm soruları doğru bildiniz! Tekrar etmeniz gereken bir konu bulunmuyor.");
            setIsPlanLoading(false);
            return;
        }

        const token = getToken();
        try {
            const response = await axios.post(
                'https://localhost:7101/api/quiz/generate-study-plan',
                { wrongQuestionsText },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setStudyPlan(response.data.studyPlan);
        } catch (error) {
            console.error("Çalışma planı alınırken hata oluştu:", error);
            setStudyPlan("Çalışma planı oluşturulurken bir hata meydana geldi.");
        } finally {
            setIsPlanLoading(false);
        }
    };
    
    // Yükleme ve Hata durumları için arayüz
    if (loading) return <div className="text-center p-10">Quiz yükleniyor...</div>;
    if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">Hata: {error}</div>;

    // Ana Arayüz
    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Time!</h2>
            <p className="text-gray-600 mb-6">Bilgilerinizi test etme zamanı.</p>
            <hr className="mb-6"/>

            {!isQuizFinished ? (
                // --- QUIZ ÇÖZME EKRANI ---
                <>
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}></div>
                        </div>
                        <p className="text-sm text-right mt-1 text-gray-600">{Object.keys(userAnswers).length} / {questions.length} tamamlandı</p>
                    </div>

                    {questions.map((q, questionIndex) => (
                        <div key={questionIndex} className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">{questionIndex + 1}. {q.questionText}</h4>
                            <div className="space-y-3">
                                {q.options.map((option, optionIndex) => (
                                    <label key={optionIndex} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${userAnswers[questionIndex] === optionIndex ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                                        <input
                                            type="radio"
                                            name={`question-${questionIndex}`}
                                            value={optionIndex}
                                            onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                                            checked={userAnswers[questionIndex] === optionIndex}
                                            className="hidden"
                                        />
                                        <span className={`flex items-center justify-center w-6 h-6 mr-4 rounded-full text-sm font-bold ${userAnswers[questionIndex] === optionIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {optionLetters[optionIndex]}
                                        </span>
                                        <span className="text-gray-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleQuizSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                        Quizi Bitir
                    </button>
                </>
            ) : (
                // --- SONUÇ EKRANI ---
                <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold text-gray-800">Quiz Sonuçları</h3>
                    <div className="my-4 p-4 bg-indigo-100 rounded-lg text-center">
                        <p className="text-lg font-semibold text-indigo-800">
                            Skorunuz: <span className="text-2xl font-bold">{score}</span> / {questions.length}
                        </p>
                    </div>
                    
                    {questions.map((q, questionIndex) => {
                        const userAnswerIndex = userAnswers[questionIndex];
                        const isCorrect = userAnswerIndex === q.correctAnswerIndex;
                        return (
                            <div key={questionIndex} className={`mb-6 p-4 border-l-4 rounded-r-lg ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                <h4 className="font-semibold text-gray-800 mb-2">{questionIndex + 1}. {q.questionText}</h4>
                                <p className={`text-sm ${isCorrect ? 'text-gray-700' : 'text-red-700 line-through'}`}>
                                    <strong>Sizin Cevabınız:</strong> {q.options[userAnswerIndex]}
                                </p>
                                {!isCorrect && <p className="text-sm text-green-700 mt-1"><strong>Doğru Cevap:</strong> {q.options[q.correctAnswerIndex]}</p>}
                            </div>
                        );
                    })}

                    <hr className="my-8"/>
                    
                    <div className="bg-slate-50 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Kişiselleştirilmiş Tekrar Planı</h4>
                        {!studyPlan ? (
                            <button onClick={handleGenerateStudyPlan} disabled={isPlanLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:bg-green-400">
                                {isPlanLoading ? "Oluşturuluyor..." : "Tekrar Planı Oluştur"}
                            </button>
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-700">{studyPlan}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
