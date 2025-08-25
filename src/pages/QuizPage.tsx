import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../auth';

// API'den gelen soru yapısı
interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function QuizPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

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
        const response = await axios.post<QuizQuestion[]>(
          `https://localhost:7101/api/quiz/generate-from-document/${documentId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
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
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: optionIndex,
    });
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
      .map((q) => q.questionText);

    if (wrongQuestionsText.length === 0) {
      setStudyPlan(
        "Tebrikler, tüm soruları doğru bildiniz! Tekrar etmeniz gereken bir konu bulunmuyor."
      );
      setIsPlanLoading(false);
      return;
    }

    const token = getToken();
    try {
      const response = await axios.post<{ studyPlan: string }>(
        "https://localhost:7101/api/quiz/generate-study-plan",
        { wrongQuestionsText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudyPlan(response.data.studyPlan);
    } catch (error) {
      console.error("Çalışma planı alınırken hata oluştu:", error);
      setStudyPlan("Çalışma planı oluşturulurken bir hata meydana geldi.");
    } finally {
      setIsPlanLoading(false);
    }
  };

  if (loading) return <div>Quiz yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div>
      <h2>Quiz Time!</h2>

      {!isQuizFinished ? (
        <div>
          {questions.map((q, questionIndex) => (
            <div key={questionIndex} style={{ marginBottom: "20px" }}>
              <h4>
                {questionIndex + 1}. {q.questionText}
              </h4>
              {q.options.map((option, optionIndex) => (
                <label key={optionIndex} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={`q-${questionIndex}`}
                    value={optionIndex}
                    checked={userAnswers[questionIndex] === optionIndex}
                    onChange={() =>
                      handleAnswerChange(questionIndex, optionIndex)
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleQuizSubmit}>Quizi Bitir</button>
        </div>
      ) : (
        <div>
          <h3>Quiz Sonuçları</h3>
          <p style={{ fontWeight: "bold", fontSize: "1.2em" }}>
            Skorunuz: {score} / {questions.length}
          </p>

          {questions.map((q, questionIndex) => {
            const userAnswerIndex = userAnswers[questionIndex];
            const isCorrect = userAnswerIndex === q.correctAnswerIndex;
            return (
              <div
                key={questionIndex}
                style={{
                  marginBottom: "20px",
                  border: `2px solid ${isCorrect ? "green" : "red"}`,
                  padding: "10px",
                  backgroundColor: isCorrect ? "#e9fce9" : "#ffeaea",
                }}
              >
                <h4>
                  {questionIndex + 1}. {q.questionText}
                </h4>
                <p>
                  <strong>Sizin Cevabınız: </strong>
                  <span
                    style={{
                      textDecoration: isCorrect ? "none" : "line-through",
                    }}
                  >
                    {q.options[userAnswerIndex]}
                  </span>
                </p>
                {!isCorrect && (
                  <p>
                    <strong>Doğru Cevap: </strong>
                    {q.options[q.correctAnswerIndex]}
                  </p>
                )}
              </div>
            );
          })}

          <hr />

          <h4>Kişiselleştirilmiş Tekrar Planı</h4>
          {!studyPlan && (
            <button onClick={handleGenerateStudyPlan} disabled={isPlanLoading}>
              {isPlanLoading ? "Oluşturuluyor..." : "Tekrar Planı Oluştur"}
            </button>
          )}
          {studyPlan && (
            <div
              style={{
                whiteSpace: "pre-wrap",
                backgroundColor: "#f0f0f0",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              {studyPlan}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
