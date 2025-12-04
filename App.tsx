import React, { useState } from 'react';
import { GradeCard } from './components/GradeCard';
import { QuizGame } from './components/QuizGame';
import { StudyMode } from './components/StudyMode';
import { MatchingGame } from './components/MatchingGame';
import { SpellingGame } from './components/SpellingGame';
import { SpeakingGame } from './components/SpeakingGame';
import { generateLessonForGrade } from './services/geminiService';
import { GradeLevel, AppState, WrongAnswer } from './types';

const INITIAL_STATE: AppState = {
  currentGrade: null,
  lessonData: null,
  isLoading: false,
  gameStatus: 'MENU',
  score: 0,
  currentQuestionIndex: 0,
  wrongAnswers: []
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5); 

  const handleGradeSelect = async (grade: GradeLevel) => {
    setState(prev => ({ ...prev, isLoading: true, currentGrade: grade, errorMsg: null }));
    setErrorMsg(null);
    
    try {
      const lesson = await generateLessonForGrade(grade, questionCount);
      if (!lesson) {
        throw new Error("No lesson generated");
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lessonData: lesson,
        gameStatus: 'STUDY', 
        score: 0,
        currentQuestionIndex: 0,
        wrongAnswers: []
      }));
    } catch (error) {
      console.error(error);
      setErrorMsg("哎呀！AI 老師現在有點忙碌，請稍後再試試看！(API Error)");
      setState(prev => ({ ...prev, isLoading: false, currentGrade: null }));
    }
  };

  // Transition to Game Selection Screen
  const goToGameSelection = () => {
    setState(prev => ({ ...prev, gameStatus: 'GAME_SELECTION' }));
  };

  const handleGameSelect = (gameMode: 'GAME_MATCHING' | 'GAME_SPELLING' | 'GAME_SPEAKING') => {
    setState(prev => ({ ...prev, gameStatus: gameMode }));
  };

  const startQuiz = () => {
    setState(prev => ({ ...prev, gameStatus: 'PLAYING' }));
  };

  const handleFinish = (finalScore: number, wrongAnswers: WrongAnswer[]) => {
    setState(prev => ({ 
      ...prev, 
      gameStatus: 'FINISHED', 
      score: finalScore,
      wrongAnswers: wrongAnswers
    }));
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans selection:bg-yellow-200">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={resetGame}>
            <span className="text-3xl">🏰</span>
            <h1 className="text-2xl font-bold text-sky-600 tracking-tight">
              Happy Kids English
            </h1>
          </div>
          {state.currentGrade && state.gameStatus !== 'MENU' && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-gray-400 font-medium">Topic:</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold truncate max-w-[150px]">
                {state.lessonData?.topic || `${state.currentGrade} Grade`}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="py-8 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl max-w-md text-center shadow-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* 1. Loading State */}
        {state.isLoading && (
          <div className="flex flex-col items-center animate-pulse px-4 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎨</div>
            <h2 className="text-2xl font-bold text-sky-600 mb-2">正在準備今天的課程...</h2>
            <p className="text-gray-500">Creating a fun lesson with {questionCount} words!</p>
          </div>
        )}

        {/* 2. Menu State (Grade Selection) */}
        {!state.isLoading && state.gameStatus === 'MENU' && (
          <div className="w-full max-w-4xl px-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                Hi! 歡迎來到快樂小學堂
              </h2>
              <p className="text-xl text-gray-500">
                設定好題目數量，再選一個年級開始吧！ ✨
              </p>
            </div>

            {/* Question Count Selector */}
            <div className="flex flex-col items-center mb-10">
              <label className="text-sky-600 font-bold mb-3 uppercase tracking-wider text-sm">
                題目數量 (Number of Questions)
              </label>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-md border border-gray-100">
                {[3, 5, 8, 10].map(count => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`
                      px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                      ${questionCount === count 
                        ? 'bg-secondary text-white shadow-sm scale-105' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
                    `}
                  >
                    {count} 題
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <GradeCard grade={GradeLevel.ONE} onClick={handleGradeSelect} color="bg-red-400" />
              <GradeCard grade={GradeLevel.TWO} onClick={handleGradeSelect} color="bg-orange-400" />
              <GradeCard grade={GradeLevel.THREE} onClick={handleGradeSelect} color="bg-yellow-400" />
              <GradeCard grade={GradeLevel.FOUR} onClick={handleGradeSelect} color="bg-green-400" />
              <GradeCard grade={GradeLevel.FIVE} onClick={handleGradeSelect} color="bg-cyan-400" />
              <GradeCard grade={GradeLevel.SIX} onClick={handleGradeSelect} color="bg-purple-400" />
            </div>
          </div>
        )}

        {/* 3. Study Mode */}
        {!state.isLoading && state.gameStatus === 'STUDY' && state.lessonData && (
          <StudyMode 
            topic={state.lessonData.topic}
            chineseTopic={state.lessonData.chineseTopic}
            vocabulary={state.lessonData.vocabulary}
            onFinish={goToGameSelection} // Change: Go to Game Selection
            onExit={resetGame}
          />
        )}

        {/* 3.5 Game Selection Screen */}
        {!state.isLoading && state.gameStatus === 'GAME_SELECTION' && (
           <div className="w-full max-w-4xl px-6 text-center">
             <div className="text-6xl mb-6 animate-bounce">🎮</div>
             <h2 className="text-3xl font-bold text-gray-800 mb-2">
               選一個遊戲來玩吧！
             </h2>
             <p className="text-gray-500 mb-10 text-lg">Choose a game to practice your English!</p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Matching Game - Available for everyone */}
               <button 
                 onClick={() => handleGameSelect('GAME_MATCHING')}
                 className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-teal-100 hover:-translate-y-2 hover:border-teal-300 hover:bg-teal-50 transition-all group"
               >
                 <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🧩</div>
                 <h3 className="text-2xl font-bold text-teal-600 mb-2">連連看</h3>
                 <p className="text-gray-400 font-medium">Matching Game</p>
               </button>

               {/* Speaking Game - Available for everyone */}
               <button 
                 onClick={() => handleGameSelect('GAME_SPEAKING')}
                 className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-purple-100 hover:-translate-y-2 hover:border-purple-300 hover:bg-purple-50 transition-all group"
               >
                 <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🎤</div>
                 <h3 className="text-2xl font-bold text-purple-600 mb-2">口說挑戰</h3>
                 <p className="text-gray-400 font-medium">Speaking Challenge</p>
               </button>

               {/* Spelling Game - Available for Grade 4+ */}
               {state.currentGrade && state.currentGrade >= 4 ? (
                 <button 
                   onClick={() => handleGameSelect('GAME_SPELLING')}
                   className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-orange-100 hover:-translate-y-2 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                 >
                   <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">✏️</div>
                   <h3 className="text-2xl font-bold text-orange-600 mb-2">拼字練習</h3>
                   <p className="text-gray-400 font-medium">Spelling Bee</p>
                 </button>
               ) : (
                 <div className="bg-gray-100 p-8 rounded-3xl border-4 border-dashed border-gray-200 opacity-60 flex flex-col items-center justify-center">
                   <div className="text-5xl mb-4 grayscale">🔒</div>
                   <h3 className="text-xl font-bold text-gray-400 mb-1">拼字練習</h3>
                   <p className="text-gray-400 text-sm">4年級以上解鎖</p>
                 </div>
               )}
             </div>

             <button 
                onClick={startQuiz}
                className="mt-12 text-gray-400 hover:text-gray-600 font-bold underline decoration-2 underline-offset-4"
             >
               跳過遊戲，直接測驗 (Skip to Quiz)
             </button>
           </div>
        )}

        {/* 4a. Matching Game */}
        {!state.isLoading && state.gameStatus === 'GAME_MATCHING' && state.lessonData && (
          <MatchingGame 
            vocabulary={state.lessonData.vocabulary}
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4b. Spelling Game */}
        {!state.isLoading && state.gameStatus === 'GAME_SPELLING' && state.lessonData && (
          <SpellingGame
            vocabulary={state.lessonData.vocabulary}
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4c. Speaking Game */}
        {!state.isLoading && state.gameStatus === 'GAME_SPEAKING' && state.lessonData && (
          <SpeakingGame
            vocabulary={state.lessonData.vocabulary}
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 5. Playing State (Final Quiz) */}
        {!state.isLoading && state.gameStatus === 'PLAYING' && state.lessonData && (
          <QuizGame 
            questions={state.lessonData.quiz} 
            onFinish={handleFinish} 
            onExit={resetGame}
          />
        )}

        {/* 6. Finished State */}
        {!state.isLoading && state.gameStatus === 'FINISHED' && state.lessonData && (
          <div className="w-full max-w-2xl px-4 pb-12">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border-b-8 border-gray-100 mb-8">
              <div className="text-8xl mb-6 animate-bounce-slow">
                {state.score === state.lessonData.quiz.length ? '🌟' : state.score > state.lessonData.quiz.length / 2 ? '👍' : '💪'}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                課程完成！ Lesson Complete!
              </h2>
              
              <p className="text-gray-500 text-lg mb-6">
                主題：{state.lessonData.chineseTopic}
              </p>
              
              <div className="bg-sky-50 rounded-2xl p-6 mb-8">
                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Quiz Score</div>
                <div className="text-6xl font-black text-secondary drop-shadow-sm">
                  {state.score} / {state.lessonData.quiz.length}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleGradeSelect(state.currentGrade!)}
                  className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-lg shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  學習新課程 (New Lesson)
                </button>
                
                <button 
                  onClick={resetGame}
                  className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
                >
                  回主選單 (Home)
                </button>
              </div>
            </div>

            {/* MISTAKE REVIEW SECTION */}
            {state.wrongAnswers.length > 0 && (
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">
                  📝 錯題複習 (Review Mistakes)
                </h3>
                <div className="space-y-4">
                  {state.wrongAnswers.map((wa, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border-l-8 border-red-400">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Question {idx + 1}</span>
                        <button 
                          onClick={() => speak(wa.quizItem.question)}
                          className="text-sky-500 hover:text-sky-600 text-sm font-bold"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      
                      <p className="text-lg font-bold text-gray-800 mb-4">{wa.quizItem.question}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                          <span className="text-xs text-red-400 font-bold uppercase block mb-1">你選了 (You Chose)</span>
                          <span className="text-red-700 font-medium text-lg">❌ {wa.selectedAnswer}</span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                          <span className="text-xs text-green-500 font-bold uppercase block mb-1">正確答案 (Correct)</span>
                          <span className="text-green-700 font-bold text-lg">✅ {wa.quizItem.correctAnswer}</span>
                        </div>
                      </div>
                      
                      <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                        💡 {wa.quizItem.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer decorative */}
      <footer className="fixed bottom-0 w-full p-2 text-center text-gray-300 text-xs pointer-events-none hidden sm:block">
        Powered by Google Gemini 2.5 Flash
      </footer>
    </div>
  );
}