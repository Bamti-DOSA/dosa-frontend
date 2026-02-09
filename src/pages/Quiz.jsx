import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Flag, Trophy, Target, TrendingUp } from 'lucide-react';
import { generateQuiz } from '../api/aiAPI';
import { saveQuizRecord } from '../db/quizDB';

// 모델 ID 매핑
const MODEL_IDS = {
  'Drone': '1',
  'Leaf Spring': '2',
  'Machine Vice': '3',
  'Robot Arm': '4',
  'Robot Gripper': '5',
  'Suspension': '6',
  'V4 Engine': '7'
};

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const model = searchParams.get('model');
  const difficulty = searchParams.get('difficulty');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordSaved, setRecordSaved] = useState(false);

  // 퀴즈 데이터 로드
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await generateQuiz(model, difficulty);
        console.log('📝 퀴즈 데이터:', data);
        setQuizData(data);
      } catch (err) {
        console.error('퀴즈 로드 실패:', err);
        setError('퀴즈를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (model && difficulty) {
      loadQuiz();
    }
  }, [model, difficulty]);

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.quizzes.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correct++;
      }
    });
    return correct;
  };

  const getCorrectAndWrongAnswers = () => {
    const correctAnswers = [];
    const wrongAnswers = [];

    quizData.quizzes.forEach((q, index) => {
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer === q.answer;

      if (isCorrect) {
        correctAnswers.push({
          question: q.question,
          answer: q.options[q.answer]
        });
      } else {
        wrongAnswers.push({
          question: q.question,
          userAnswer: userAnswer !== undefined ? q.options[userAnswer] : '선택 안 함',
          correctAnswer: q.options[q.answer],
          explanation: q.explanation
        });
      }
    });

    return { correctAnswers, wrongAnswers };
  };

  const handleSubmit = async () => {
    setShowResult(true);
    
    // 퀴즈 기록 저장
    if (!recordSaved) {
      try {
        const score = calculateScore();
        const totalQuestions = quizData.quizzes.length;
        const { correctAnswers, wrongAnswers } = getCorrectAndWrongAnswers();
        const modelId = MODEL_IDS[model] || model;

        console.log('💾 퀴즈 기록 저장 시작:', {
          modelId,
          model,
          score,
          totalQuestions,
          difficulty
        });

        await saveQuizRecord(
          modelId,
          model,
          score,
          totalQuestions,
          difficulty,
          correctAnswers,
          wrongAnswers
        );

        setRecordSaved(true);
        console.log('✅ 퀴즈 기록 저장 완료');
      } catch (error) {
        console.error('❌ 퀴즈 기록 저장 실패:', error);
        // 저장 실패해도 결과는 표시
      }
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="t-18-semi text-gray-600">퀴즈를 생성하는 중...</p>
          <p className="text-sm text-gray-500 mt-2">AI가 문제를 만들고 있어요</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="t-24-bold mb-2">문제가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/study-list')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
          >
            학습 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  const totalQuestions = quizData.quizzes.length;
  const currentQ = quizData.quizzes[currentQuestion];
  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-5xl mx-auto">
          {/* 상단 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="t-32-bold mb-2">퀴즈 결과</h1>
              <p className="text-gray-500 t-16-regular">
                {quizData.topic} · {difficulty === 'Hard' ? '어려움' : '일반'} 난이도
              </p>
              {recordSaved && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  ✅ 기록이 저장되었습니다
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/study-list')}
              className="p-3 hover:bg-white rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* 점수 카드 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {percentage >= 80 ? '🎉' : percentage >= 60 ? '😊' : '💪'}
                  </div>
                  <div>
                    <h2 className="t-24-bold">
                      {percentage >= 80 ? '훌륭해요!' : percentage >= 60 ? '잘했어요!' : '다시 도전!'}
                    </h2>
                    <p className="text-gray-500 t-14-regular">
                      {percentage >= 80 ? '완벽한 이해도를 보여주셨네요' : percentage >= 60 ? '조금만 더 공부하면 완벽!' : '복습 후 다시 도전해보세요'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Trophy className="text-blue-500" size={24} />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">총점</div>
                      <div className="t-20-bold text-blue-600">{percentage}점</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                      <Target className="text-green-500" size={24} />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">정답률</div>
                      <div className="t-20-bold text-green-600">{score}/{totalQuestions}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <TrendingUp className="text-purple-500" size={24} />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">난이도</div>
                      <div className="t-20-bold text-purple-600">{difficulty === 'Hard' ? '어려움' : '일반'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all t-16-semi"
                >
                  다시 풀기
                </button>
                <button
                  onClick={() => navigate('/study-list')}
                  className="px-8 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all t-16-semi"
                >
                  학습 목록
                </button>
              </div>
            </div>
          </div>

          {/* 문제별 결과 */}
          <div className="space-y-4">
            {quizData.quizzes.map((q, index) => {
              const isCorrect = selectedAnswers[index] === q.answer;
              const userAnswer = selectedAnswers[index];
              
              return (
                <div key={q.id} className={`p-4 rounded-xl border-2 bg-white ${
                  isCorrect ? 'border-blue-200' : 'border-red-100'
                }`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xl">
                      {isCorrect ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <p className="t-16-semi mb-2">문제 {index + 1}. {q.question}</p>
                      <p className="text-sm text-gray-600">
                        내 답: {q.options[userAnswer] || '선택 안 함'} / 정답: {q.options[q.answer]}
                      </p>
                      <p className="text-sm text-blue-600 mt-2">💡 {q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/study-list')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
          <div>
            <h1 className="t-20-bold">{quizData.topic} 퀴즈</h1>
            <p className="text-sm text-gray-500">
              난이도: {difficulty === 'Hard' ? '어려움' : '일반'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="t-16-medium text-gray-600">
            {currentQuestion + 1} / {totalQuestions}
          </span>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== totalQuestions}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
              Object.keys(selectedAnswers).length === totalQuestions
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Flag size={18} />
            제출하기
          </button>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="bg-white px-8 py-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl w-full max-w-3xl p-8 ">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                문제 {currentQuestion + 1}
              </span>
              {selectedAnswers[currentQuestion] !== undefined && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  답변 완료 ✓
                </span>
              )}
            </div>
            <h2 className="t-24-semi leading-relaxed">{currentQ.question}</h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="t-16-medium flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <ChevronLeft size={20} />
              이전
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === totalQuestions - 1}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                currentQuestion === totalQuestions - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              다음
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 문제 미리보기 (하단) */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="flex gap-2 justify-center flex-wrap">
          {quizData.quizzes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                currentQuestion === index
                  ? 'bg-blue-500 text-white'
                  : selectedAnswers[index] !== undefined
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;