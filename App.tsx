
import React, { useState, useEffect } from 'react';
import packageJson from './package.json';
import { GradeCard } from './components/GradeCard';
import { SubjectCard } from './components/SubjectCard';
import { QuizGame } from './components/QuizGame';
import { StudyMode } from './components/StudyMode';
import { MatchingGame } from './components/MatchingGame';
import { SpellingGame } from './components/SpellingGame';
import { WordScrambleGame } from './components/WordScrambleGame';
import { MathChallenge } from './components/MathChallenge';
import { NumberPuzzleGame } from './components/NumberPuzzleGame';
import { GeometryBuilderGame } from './components/GeometryBuilderGame';
import { SentenceBuilderGame } from './components/SentenceBuilderGame';
import { IdiomDojoGame } from './components/IdiomDojoGame';
import { ScienceSortingGame } from './components/ScienceSortingGame';
import { ScienceProcessGame } from './components/ScienceProcessGame';
import { MathTopicSelection } from './components/MathTopicSelection';
import { EnglishTopicSelection } from './components/EnglishTopicSelection';
import { WritingTopicSelection } from './components/WritingTopicSelection';
import { ScienceTopicSelection } from './components/ScienceTopicSelection';
import { FinanceTopicSelection } from './components/FinanceTopicSelection';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ApiKeySettings } from './components/ApiKeySettings';
import { generateLessonForGrade } from './services/geminiService';
import { GradeLevel, AppState, WrongAnswer, Subject } from './types';
import { playSFX } from './services/audioService';
import { getApiKeyPool, saveApiKeyPool, clearApiKey } from './services/apiKeyManager';

const INITIAL_STATE: AppState = {
  currentSubject: null,
  currentGrade: null,
  lessonData: null,
  isLoading: false,
  gameStatus: 'SUBJECT_SELECTION',
  score: 0,
  currentQuestionIndex: 0,
  wrongAnswers: []
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 初始化時檢查是否有儲存的 API Key 池
  useEffect(() => {
    const pool = getApiKeyPool();
    setApiKeys(pool);
    if (pool.length === 0) {
      setShowApiKeyModal(true);
    }
  }, []);

  // API Key 管理函數
  const handleSaveApiKeys = (newPool: string[]) => {
    saveApiKeyPool(newPool);
    setApiKeys(newPool);
    setShowApiKeyModal(false);
    setErrorMsg(null);
  };

  const handleUpdateApiKeys = (newPool: string[]) => {
    saveApiKeyPool(newPool);
    setApiKeys(newPool);
  };

  const handleClearApiKeys = () => {
    clearApiKey();
    setApiKeys([]);
    setShowApiKeyModal(true);
    setState(INITIAL_STATE);
  };

  const handleSubjectSelect = (subject: Subject) => {
    playSFX('click');
    setState(prev => ({ ...prev, currentSubject: subject, gameStatus: 'MENU' }));
  };

  const handleBackToSubjects = () => {
    playSFX('click');
    setState(INITIAL_STATE);
  };

  const handleGradeSelect = async (grade: GradeLevel) => {
    playSFX('click');
    if (state.currentSubject === 'MATH') {
      setState(prev => ({ ...prev, currentGrade: grade, gameStatus: 'MATH_TOPIC_SELECTION' }));
    } else if (state.currentSubject === 'ENGLISH') {
      setState(prev => ({ ...prev, currentGrade: grade, gameStatus: 'ENGLISH_TOPIC_SELECTION' }));
    } else if (state.currentSubject === 'WRITING') {
      setState(prev => ({ ...prev, currentGrade: grade, gameStatus: 'WRITING_TOPIC_SELECTION' }));
    } else if (state.currentSubject === 'SCIENCE') {
      setState(prev => ({ ...prev, currentGrade: grade, gameStatus: 'SCIENCE_TOPIC_SELECTION' }));
    } else if (state.currentSubject === 'FINANCE') {
      setState(prev => ({ ...prev, currentGrade: grade, gameStatus: 'FINANCE_TOPIC_SELECTION' }));
    }
  };

  const handleMathTopicSelect = (topic: string) => generateLesson(state.currentGrade!, 'MATH', topic);
  const handleEnglishTopicSelect = (topic: string) => generateLesson(state.currentGrade!, 'ENGLISH', topic);
  const handleWritingTopicSelect = (topic: string) => generateLesson(state.currentGrade!, 'WRITING', topic);
  const handleScienceTopicSelect = (topic: string) => generateLesson(state.currentGrade!, 'SCIENCE', topic);
  const handleFinanceTopicSelect = (topic: string) => generateLesson(state.currentGrade!, 'FINANCE', topic);

  const generateLesson = async (grade: GradeLevel, subject: Subject, topic?: string) => {
    // 檢查 API Key 池
    if (apiKeys.length === 0) {
      setErrorMsg("❌ 請先設定 API Key 才能使用 AI 功能");
      setShowApiKeyModal(true);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, currentGrade: grade, errorMsg: null }));
    setErrorMsg(null);
    try {
      const lesson = await generateLessonForGrade(grade, subject, questionCount, topic);
      if (!lesson) throw new Error("No lesson generated");
      setState(prev => ({
        ...prev, isLoading: false, lessonData: lesson, gameStatus: 'STUDY', score: 0, currentQuestionIndex: 0, wrongAnswers: []
      }));
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('API Key')) {
        setErrorMsg("❌ API Key 無效或已過期，請重新設定");
        setShowApiKeyModal(true);
      } else if (error.message?.includes('quota')) {
        setErrorMsg("⚠️ API 配額已用完，請檢查您的 Google Cloud 帳單");
      } else {
        setErrorMsg("哎呀！AI 老師現在有點忙碌，請稍後再試試看！");
      }
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const restartLesson = () => {
    playSFX('click');
    setState(prev => ({ ...prev, gameStatus: 'STUDY', score: 0, currentQuestionIndex: 0, wrongAnswers: [] }));
  };

  const retakeQuiz = () => {
    playSFX('click');
    setState(prev => ({ ...prev, gameStatus: 'PLAYING', score: 0, currentQuestionIndex: 0, wrongAnswers: [] }));
  };

  const handleGameSelect = (gameMode: AppState['gameStatus']) => {
    playSFX('click');
    setState(prev => ({ ...prev, gameStatus: gameMode }));
  };

  const startQuiz = () => {
    playSFX('click');
    setState(prev => ({ ...prev, gameStatus: 'PLAYING' }));
  };

  const handleFinish = (finalScore: number, wrongAnswers: WrongAnswer[]) => {
    setState(prev => ({ ...prev, gameStatus: 'FINISHED', score: finalScore, wrongAnswers }));
  };

  const resetGame = () => {
    playSFX('click');
    setState(INITIAL_STATE);
  };

  const speak = (text: string, speed: number = 0.9) => {
    if (state.currentSubject !== 'ENGLISH') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const spokenText = text.replace(/_+/g, ' blank ');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'en-US';
      utterance.rate = speed;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getSubjectMeta = () => {
    switch (state.currentSubject) {
      case 'MATH': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: '📐', name: '數學 Math' };
      case 'WRITING': return { color: 'text-pink-600', bg: 'bg-pink-50', icon: '📝', name: '寫作 Writing' };
      case 'SCIENCE': return { color: 'text-green-600', bg: 'bg-green-50', icon: '🔬', name: '自然 Science' };
      case 'FINANCE': return { color: 'text-amber-600', bg: 'bg-amber-50', icon: '💰', name: '理財 Finance' };
      default: return { color: 'text-teal-600', bg: 'bg-teal-50', icon: '🦁', name: '英語 English' };
    }
  };

  const meta = getSubjectMeta();
  const isMath = state.currentSubject === 'MATH';
  const isWriting = state.currentSubject === 'WRITING';
  const isEnglish = state.currentSubject === 'ENGLISH';
  const isScience = state.currentSubject === 'SCIENCE';

  return (
    <div className={`min-h-screen font-sans selection:bg-yellow-200 ${meta.bg}`}>
      {/* API Key 設定彈窗 */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onSave={handleSaveApiKeys}
        onClose={apiKeys.length > 0 ? () => setShowApiKeyModal(false) : undefined}
      />

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetGame}>
            <span className="text-3xl">🎓</span>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 leading-none text-nowrap">Happy Kids</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Learning App</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md border border-gray-200 font-mono font-black scale-90 origin-left">
                  V{packageJson.version}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {state.currentSubject && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-gray-100">
                <span className="text-lg">{meta.icon}</span>
                <span className={`font-bold ${meta.color}`}>{meta.name}</span>
              </div>
            )}
            {state.currentGrade && state.gameStatus !== 'MENU' && state.gameStatus !== 'SUBJECT_SELECTION' && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold truncate max-w-[120px]">
                {state.lessonData?.topic || `${state.currentGrade} Grade`}
              </span>
            )}
            {/* API Key 設定按鈕 */}
            <div className="relative">
              <ApiKeySettings
                apiKeys={apiKeys}
                onUpdate={handleUpdateApiKeys}
                onClear={handleClearApiKeys}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        {errorMsg && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl max-w-md text-center shadow-lg border border-red-200">{errorMsg}</div>}

        {state.isLoading && (
          <div className="flex flex-col items-center animate-pulse text-center">
            <div className="text-6xl mb-4 animate-bounce">🤖</div>
            <h2 className={`text-2xl font-bold mb-2 ${meta.color}`}>正在準備課程...</h2>
          </div>
        )}

        {!state.isLoading && state.gameStatus === 'SUBJECT_SELECTION' && (
          <div className="w-full max-w-6xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tight">今天想學什麼呢？</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <SubjectCard title="英語 English" subtitle="單字與會話" icon="🦁" color="bg-teal-400" onClick={() => handleSubjectSelect('ENGLISH')} />
              <SubjectCard title="數學 Math" subtitle="加減乘除幾何" icon="📐" color="bg-blue-500" onClick={() => handleSubjectSelect('MATH')} />
              <SubjectCard title="自然 Science" subtitle="觀察實驗原理" icon="🔬" color="bg-green-500" onClick={() => handleSubjectSelect('SCIENCE')} />
              <SubjectCard title="寫作 Writing" subtitle="修辭成語段落" icon="📝" color="bg-pink-400" onClick={() => handleSubjectSelect('WRITING')} />
              <SubjectCard title="理財 Finance" subtitle="儲蓄消費觀念" icon="💰" color="bg-amber-500" onClick={() => handleSubjectSelect('FINANCE')} />
            </div>
          </div>
        )}

        {!state.isLoading && state.gameStatus === 'MENU' && (
          <div className="w-full max-w-4xl px-6 animate-fade-in-up text-center">
            <button onClick={handleBackToSubjects} className="mb-8 text-gray-400 font-bold hover:text-gray-600 transition-colors">⬅️ 選其他科目</button>
            <h2 className={`text-4xl font-bold mb-4 ${meta.color}`}>{meta.icon} {meta.name}</h2>

            <div className="flex flex-col items-center mb-10">
              <label className="text-gray-400 font-bold mb-3 uppercase tracking-wider text-sm">題目數量 (Number of Questions)</label>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-md border border-gray-100">
                {[5, 10, 20].map(count => (
                  <button
                    key={count}
                    onClick={() => { playSFX('click'); setQuestionCount(count); }}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 ${questionCount === count ? 'bg-gray-800 text-white shadow-sm scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                  >
                    {count} 題
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(g => <GradeCard key={g} grade={g} onClick={handleGradeSelect} color={['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-cyan-400', 'bg-purple-400'][g - 1]} />)}
            </div>
          </div>
        )}

        {!state.isLoading && state.gameStatus === 'MATH_TOPIC_SELECTION' && <MathTopicSelection grade={state.currentGrade!} onSelectTopic={handleMathTopicSelect} onBack={() => setState(p => ({ ...p, gameStatus: 'MENU' }))} />}
        {!state.isLoading && state.gameStatus === 'ENGLISH_TOPIC_SELECTION' && <EnglishTopicSelection grade={state.currentGrade!} onSelectTopic={handleEnglishTopicSelect} onBack={() => setState(p => ({ ...p, gameStatus: 'MENU' }))} />}
        {!state.isLoading && state.gameStatus === 'WRITING_TOPIC_SELECTION' && <WritingTopicSelection grade={state.currentGrade!} onSelectTopic={handleWritingTopicSelect} onBack={() => setState(p => ({ ...p, gameStatus: 'MENU' }))} />}
        {!state.isLoading && state.gameStatus === 'SCIENCE_TOPIC_SELECTION' && <ScienceTopicSelection grade={state.currentGrade!} onSelectTopic={handleScienceTopicSelect} onBack={() => setState(p => ({ ...p, gameStatus: 'MENU' }))} />}
        {!state.isLoading && state.gameStatus === 'FINANCE_TOPIC_SELECTION' && <FinanceTopicSelection grade={state.currentGrade!} onSelectTopic={handleFinanceTopicSelect} onBack={() => setState(p => ({ ...p, gameStatus: 'MENU' }))} />}

        {!state.isLoading && state.gameStatus === 'STUDY' && state.lessonData && (
          <StudyMode topic={state.lessonData.topic} chineseTopic={state.lessonData.chineseTopic} vocabulary={state.lessonData.vocabulary} onFinish={() => setState(p => ({ ...p, gameStatus: 'GAME_SELECTION' }))} onExit={resetGame} subject={state.currentSubject!} />
        )}

        {!state.isLoading && state.gameStatus === 'GAME_SELECTION' && (
          <div className="w-full max-w-4xl px-6 text-center animate-fade-in-up">
            <div className="text-6xl mb-6 animate-bounce">🎮</div>
            <h2 className="text-3xl font-bold mb-10">複習挑戰</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => handleGameSelect('GAME_MATCHING')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-teal-100 hover:-translate-y-2"><div className="text-4xl mb-2">🧩</div><h3 className="font-bold">連連看</h3></button>
              {isEnglish && (
                <>
                  <button onClick={() => handleGameSelect('GAME_WORD_SCRAMBLE')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-violet-100 hover:-translate-y-2"><div className="text-4xl mb-2">🔤</div><h3 className="font-bold">字母大亂鬥</h3></button>
                  {state.currentGrade! >= 4 && <button onClick={() => handleGameSelect('GAME_SPELLING')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-orange-100 hover:-translate-y-2"><div className="text-4xl mb-2">✏️</div><h3 className="font-bold">拼字練習</h3></button>}
                </>
              )}
              {isMath && (
                <>
                  <button onClick={() => handleGameSelect('GAME_MATH_CHALLENGE')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-blue-100 hover:-translate-y-2"><div className="text-4xl mb-2">🚀</div><h3 className="font-bold">急速快算</h3></button>
                  <button onClick={() => handleGameSelect('GAME_NUMBER_PUZZLE')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-indigo-100 hover:-translate-y-2"><div className="text-4xl mb-2">🔢</div><h3 className="font-bold">數字拼圖</h3></button>
                  <button onClick={() => handleGameSelect('GAME_GEOMETRY_BUILDER')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-cyan-100 hover:-translate-y-2"><div className="text-4xl mb-2">📐</div><h3 className="font-bold">形狀建築師</h3></button>
                </>
              )}
              {isWriting && (
                <>
                  <button onClick={() => handleGameSelect('GAME_SENTENCE_BUILDER')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-pink-100 hover:-translate-y-2"><div className="text-4xl mb-2">📝</div><h3 className="font-bold">句子積木</h3></button>
                  <button onClick={() => handleGameSelect('GAME_IDIOM_DOJO')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-orange-100 hover:-translate-y-2"><div className="text-4xl mb-2">🥋</div><h3 className="font-bold">成語修煉</h3></button>
                </>
              )}
              {isScience && (
                <>
                  <button onClick={() => handleGameSelect('GAME_SCIENCE_SORT')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-green-100 hover:-translate-y-2"><div className="text-4xl mb-2">🧪</div><h3 className="font-bold">分類大挑戰</h3></button>
                  <button onClick={() => handleGameSelect('GAME_SCIENCE_CYCLE')} className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-emerald-100 hover:-translate-y-2"><div className="text-4xl mb-2">🌱</div><h3 className="font-bold">流程排序王</h3></button>
                </>
              )}
            </div>
            <button onClick={startQuiz} className="mt-12 text-gray-400 font-bold underline hover:text-gray-600 transition-colors">直接開始總測驗 ➜</button>
          </div>
        )}

        {!state.isLoading && state.gameStatus === 'GAME_MATCHING' && <MatchingGame vocabulary={state.lessonData!.vocabulary} onFinish={startQuiz} onExit={resetGame} subject={state.currentSubject!} />}
        {!state.isLoading && state.gameStatus === 'GAME_SPELLING' && <SpellingGame vocabulary={state.lessonData!.vocabulary} onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_WORD_SCRAMBLE' && <WordScrambleGame vocabulary={state.lessonData!.vocabulary} onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_MATH_CHALLENGE' && <MathChallenge grade={state.currentGrade!} onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_NUMBER_PUZZLE' && <NumberPuzzleGame onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_GEOMETRY_BUILDER' && <GeometryBuilderGame onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_SENTENCE_BUILDER' && <SentenceBuilderGame onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_IDIOM_DOJO' && <IdiomDojoGame onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_SCIENCE_SORT' && <ScienceSortingGame vocabulary={state.lessonData!.vocabulary} onFinish={startQuiz} onExit={resetGame} />}
        {!state.isLoading && state.gameStatus === 'GAME_SCIENCE_CYCLE' && <ScienceProcessGame vocabulary={state.lessonData!.vocabulary} onFinish={startQuiz} onExit={resetGame} />}

        {!state.isLoading && state.gameStatus === 'PLAYING' && <QuizGame questions={state.lessonData!.quiz} onFinish={handleFinish} onExit={resetGame} subject={state.currentSubject!} />}

        {!state.isLoading && state.gameStatus === 'FINISHED' && (
          <div className="w-full max-w-2xl px-4 pb-12 animate-fade-in-up text-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-b-8 border-gray-100 mb-8">
              <div className="text-8xl mb-6 animate-bounce-slow">🏆</div>
              <h2 className="text-3xl font-bold mb-2">測驗完成！</h2>
              <p className="text-gray-500 mb-6 font-medium">主題：{state.lessonData?.chineseTopic}</p>

              <div className="bg-sky-50 rounded-2xl p-6 mb-8 flex flex-col items-center">
                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">您的總分</div>
                <div className="text-8xl font-black text-primary mb-2">
                  {Math.round((state.score / state.lessonData!.quiz.length) * 100)}
                  <span className="text-4xl ml-1">分</span>
                </div>
                <div className="text-xl font-bold text-sky-600 bg-white px-4 py-1 rounded-full shadow-sm border border-sky-100">
                  答對 {state.score} / {state.lessonData!.quiz.length} 題
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onClick={retakeQuiz} className="bg-secondary text-white py-3 rounded-xl font-bold text-lg shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                  ✍️ 直接重測 (Retake Quiz)
                </button>
                <button onClick={restartLesson} className="bg-yellow-400 text-yellow-900 py-3 rounded-xl font-bold text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                  🔄 重新溫習 (Review Cards)
                </button>
                <button onClick={() => handleGradeSelect(state.currentGrade!)} className="bg-sky-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                  ✨ 練習新主題 (New Lesson)
                </button>
                <button onClick={resetGame} className="bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors">
                  🏠 回首頁 (Home)
                </button>
              </div>
            </div>

            {/* MISTAKE REVIEW SECTION */}
            {state.wrongAnswers.length > 0 && (
              <div className="animate-fade-in-up mt-10">
                <h3 className="text-2xl font-black text-gray-700 mb-6 text-center flex items-center justify-center gap-2">
                  📝 錯題詳解 (Review Mistakes)
                </h3>
                <div className="space-y-6">
                  {state.wrongAnswers.map((wa, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl border-l-8 border-red-500 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-red-50 text-red-500 font-bold text-xs rounded-bl-xl">
                        #{idx + 1}
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-gray-800 pr-8">{wa.quizItem.question}</h4>
                        {isEnglish && (
                          <button onClick={() => speak(wa.quizItem.question)} className="text-sky-500 hover:text-sky-600 transition-colors">
                            🔊
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                          <span className="text-xs text-red-400 font-black uppercase block mb-1">您的回答 (You Chose)</span>
                          <span className="text-red-700 font-bold">❌ {wa.selectedAnswer}</span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                          <span className="text-xs text-green-500 font-black uppercase block mb-1">正確答案 (Correct)</span>
                          <span className="text-green-700 font-bold">✅ {wa.quizItem.correctAnswer}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">💡</span>
                          <span className="text-sm font-black text-gray-400">老師解析 (Explanation)</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                          {wa.quizItem.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
