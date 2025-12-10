
import React, { useState } from 'react';
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
import { MathTopicSelection } from './components/MathTopicSelection'; // Import new component
import { generateLessonForGrade } from './services/geminiService';
import { GradeLevel, AppState, WrongAnswer, Subject } from './types';
import { playSFX } from './services/audioService';

const INITIAL_STATE: AppState = {
  currentSubject: null,
  currentGrade: null,
  lessonData: null,
  isLoading: false,
  gameStatus: 'SUBJECT_SELECTION', // Start at Subject Selection
  score: 0,
  currentQuestionIndex: 0,
  wrongAnswers: []
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5); 
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined); // Track selected math topic

  const handleSubjectSelect = (subject: Subject) => {
    playSFX('click');
    setState(prev => ({
      ...prev,
      currentSubject: subject,
      gameStatus: 'MENU' // Go to Grade Selection
    }));
  };

  const handleBackToSubjects = () => {
    playSFX('click');
    setState(INITIAL_STATE);
  };

  const handleGradeSelect = async (grade: GradeLevel) => {
    playSFX('click');
    
    // If Math, go to Topic Selection first
    if (state.currentSubject === 'MATH') {
      setState(prev => ({ ...prev, currentGrade: grade, gameStatus: 'MATH_TOPIC_SELECTION' }));
      return;
    }

    // Otherwise (English/Writing), generate lesson immediately
    await generateLesson(grade, state.currentSubject!);
  };

  const handleMathTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    await generateLesson(state.currentGrade!, 'MATH', topic);
  };

  const generateLesson = async (grade: GradeLevel, subject: Subject, topic?: string) => {
    setState(prev => ({ ...prev, isLoading: true, currentGrade: grade, errorMsg: null }));
    setErrorMsg(null);
    
    try {
      const lesson = await generateLessonForGrade(grade, subject, questionCount, topic);
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
      setState(prev => ({ ...prev, isLoading: false, currentGrade: grade })); // Keep grade selected
    }
  };

  // Restart the current lesson with the same data
  const restartLesson = () => {
    playSFX('click');
    setState(prev => ({
      ...prev,
      gameStatus: 'STUDY', // Go back to Flashcards
      score: 0,
      currentQuestionIndex: 0,
      wrongAnswers: []
    }));
  };

  // Transition to Game Selection Screen
  const goToGameSelection = () => {
    setState(prev => ({ ...prev, gameStatus: 'GAME_SELECTION' }));
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
    setState(prev => ({ 
      ...prev, 
      gameStatus: 'FINISHED', 
      score: finalScore,
      wrongAnswers: wrongAnswers
    }));
  };

  const resetGame = () => {
    playSFX('click');
    setState(INITIAL_STATE);
  };

  const speak = (text: string) => {
    // Disable speech for Math and Chinese Writing (as browser TTS logic is typically English-focused here)
    if (state.currentSubject === 'MATH' || state.currentSubject === 'WRITING') return;

    if ('speechSynthesis' in window) {
      // Replace underscores with "blank" so it reads naturally
      const spokenText = text.replace(/_+/g, ' blank ');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper to get color/icon based on subject
  const getSubjectMeta = () => {
    switch(state.currentSubject) {
      case 'MATH': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: '📐', name: '數學 Math' };
      case 'WRITING': return { color: 'text-pink-600', bg: 'bg-pink-50', icon: '📝', name: '中文寫作 Writing' };
      default: return { color: 'text-teal-600', bg: 'bg-teal-50', icon: '🏰', name: '英語 English' };
    }
  };

  const meta = getSubjectMeta();
  const isMath = state.currentSubject === 'MATH';
  const isWriting = state.currentSubject === 'WRITING';
  const isEnglish = state.currentSubject === 'ENGLISH'; // Used to toggle English-specific games

  return (
    <div className={`min-h-screen font-sans selection:bg-yellow-200 ${meta.bg}`}>
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={resetGame}>
            <span className="text-3xl">🎓</span>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none">
                Happy Kids
              </h1>
              <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Learning App</span>
            </div>
          </div>
          
          {state.currentSubject && (
            <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-gray-100 shadow-sm`}>
              <span className="text-lg">{meta.icon}</span>
              <span className={`font-bold ${meta.color}`}>{meta.name}</span>
            </div>
          )}

          {state.currentGrade && state.gameStatus !== 'MENU' && state.gameStatus !== 'SUBJECT_SELECTION' && (
            <div className="flex items-center gap-2">
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
            <div className="text-6xl mb-4 animate-bounce">🤖</div>
            <h2 className={`text-2xl font-bold mb-2 ${meta.color}`}>正在準備你的課程...</h2>
            <p className="text-gray-500">Creating a fun {state.currentSubject?.toLowerCase()} lesson!</p>
          </div>
        )}

        {/* 1.5. SUBJECT SELECTION (New Portal) */}
        {!state.isLoading && state.gameStatus === 'SUBJECT_SELECTION' && (
           <div className="w-full max-w-6xl px-6">
             <div className="text-center mb-12">
               <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tight">
                 今天想學什麼呢？
               </h2>
               <p className="text-xl text-gray-500 font-medium">
                 What do you want to learn today?
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <SubjectCard 
                 title="英語 English" 
                 subtitle="單字、會話、聽力" 
                 icon="🦁" 
                 color="bg-teal-400" 
                 onClick={() => handleSubjectSelect('ENGLISH')}
               />
               <SubjectCard 
                 title="數學 Math" 
                 subtitle="加減乘除、幾何" 
                 icon="📐" 
                 color="bg-blue-500" 
                 onClick={() => handleSubjectSelect('MATH')}
               />
               <SubjectCard 
                 title="中文寫作 Writing" 
                 subtitle="修辭、成語、段落" 
                 icon="📝" 
                 color="bg-pink-400" 
                 onClick={() => handleSubjectSelect('WRITING')}
               />
             </div>
           </div>
        )}

        {/* 2. MENU State (Grade Selection) */}
        {!state.isLoading && state.gameStatus === 'MENU' && (
          <div className="w-full max-w-4xl px-6 animate-fade-in-up">
            <button 
              onClick={handleBackToSubjects}
              className="mb-8 text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2 transition-colors"
            >
              ⬅️ 選其他科目 (Change Subject)
            </button>

            <div className="text-center mb-8">
              <h2 className={`text-4xl font-bold mb-4 leading-tight ${meta.color}`}>
                {meta.icon} {meta.name}
              </h2>
              <p className="text-xl text-gray-500">
                選擇你的年級開始挑戰！
              </p>
            </div>

            {/* Question Count Selector */}
            <div className="flex flex-col items-center mb-10">
              <label className="text-gray-400 font-bold mb-3 uppercase tracking-wider text-sm">
                題目數量 (Number of Questions)
              </label>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-md border border-gray-100">
                {[3, 5, 8, 10].map(count => (
                  <button
                    key={count}
                    onClick={() => { playSFX('click'); setQuestionCount(count); }}
                    className={`
                      px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                      ${questionCount === count 
                        ? 'bg-gray-800 text-white shadow-sm scale-105' 
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

        {/* 2.5 Math Topic Selection */}
        {!state.isLoading && state.gameStatus === 'MATH_TOPIC_SELECTION' && state.currentGrade && (
          <MathTopicSelection
             grade={state.currentGrade}
             onSelectTopic={handleMathTopicSelect}
             onBack={() => setState(prev => ({ ...prev, gameStatus: 'MENU' }))}
          />
        )}

        {/* 3. Study Mode */}
        {!state.isLoading && state.gameStatus === 'STUDY' && state.lessonData && state.currentSubject && (
          <StudyMode 
            topic={state.lessonData.topic}
            chineseTopic={state.lessonData.chineseTopic}
            vocabulary={state.lessonData.vocabulary}
            onFinish={goToGameSelection} 
            onExit={resetGame}
            subject={state.currentSubject}
          />
        )}

        {/* 3.5 Game Selection Screen */}
        {!state.isLoading && state.gameStatus === 'GAME_SELECTION' && (
           <div className="w-full max-w-4xl px-6 text-center animate-fade-in-up">
             <div className="text-6xl mb-6 animate-bounce">🎮</div>
             <h2 className="text-3xl font-bold text-gray-800 mb-2">
               {isEnglish ? '選一個遊戲來複習！' : '複習挑戰'}
             </h2>
             <p className="text-gray-500 mb-10 text-lg">Practice what you just learned!</p>

             <div className={`grid grid-cols-1 ${isMath || isWriting ? 'md:grid-cols-2 lg:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
               {/* Matching Game - Available for everyone */}
               <button 
                 onClick={() => handleGameSelect('GAME_MATCHING')}
                 className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-teal-100 hover:-translate-y-2 hover:border-teal-300 hover:bg-teal-50 transition-all group"
               >
                 <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🧩</div>
                 <h3 className="text-xl font-bold text-teal-600 mb-2">{isEnglish ? '連連看' : '觀念連連看'}</h3>
                 <p className="text-gray-400 text-sm font-medium">{isEnglish ? 'Matching Game' : 'Concept Matching'}</p>
               </button>

               {/* Writing Challenge - ONLY FOR WRITING */}
               {isWriting && (
                 <>
                   <button 
                     onClick={() => handleGameSelect('GAME_SENTENCE_BUILDER')}
                     className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-pink-100 hover:-translate-y-2 hover:border-pink-300 hover:bg-pink-50 transition-all group"
                   >
                     <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                     <h3 className="text-xl font-bold text-pink-600 mb-2">句子積木工廠</h3>
                     <p className="text-gray-400 text-sm font-medium">Sentence Builder</p>
                   </button>

                   <button 
                     onClick={() => handleGameSelect('GAME_IDIOM_DOJO')}
                     className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-orange-100 hover:-translate-y-2 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                   >
                     <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🥋</div>
                     <h3 className="text-xl font-bold text-orange-600 mb-2">成語修煉場</h3>
                     <p className="text-gray-400 text-sm font-medium">Idiom Dojo</p>
                   </button>
                 </>
               )}

               {/* Math Challenge - ONLY FOR MATH */}
               {isMath && (
                 <>
                   <button 
                     onClick={() => handleGameSelect('GAME_MATH_CHALLENGE')}
                     className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-blue-100 hover:-translate-y-2 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                   >
                     <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
                     <h3 className="text-xl font-bold text-blue-600 mb-2">急速快算王</h3>
                     <p className="text-gray-400 text-sm font-medium">Speed Math</p>
                   </button>
                   
                   <button 
                     onClick={() => handleGameSelect('GAME_NUMBER_PUZZLE')}
                     className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-indigo-100 hover:-translate-y-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                   >
                     <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🔢</div>
                     <h3 className="text-xl font-bold text-indigo-600 mb-2">數字拼圖</h3>
                     <p className="text-gray-400 text-sm font-medium">Sudoku Puzzle</p>
                   </button>

                   <button 
                     onClick={() => handleGameSelect('GAME_GEOMETRY_BUILDER')}
                     className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-cyan-100 hover:-translate-y-2 hover:border-cyan-300 hover:bg-cyan-50 transition-all group"
                   >
                     <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📐</div>
                     <h3 className="text-xl font-bold text-cyan-600 mb-2">形狀建築師</h3>
                     <p className="text-gray-400 text-sm font-medium">Geometry Builder</p>
                   </button>
                 </>
               )}

               {/* Word Scramble Game - ONLY FOR ENGLISH */}
               {isEnglish && (
                 <button 
                   onClick={() => handleGameSelect('GAME_WORD_SCRAMBLE')}
                   className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-violet-100 hover:-translate-y-2 hover:border-violet-300 hover:bg-violet-50 transition-all group"
                 >
                   <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🔤</div>
                   <h3 className="text-xl font-bold text-violet-600 mb-2">字母大亂鬥</h3>
                   <p className="text-gray-400 text-sm font-medium">Word Scramble</p>
                 </button>
               )}

               {/* Spelling Game - ONLY FOR ENGLISH */}
               {isEnglish && (
                 state.currentGrade && state.currentGrade >= 4 ? (
                   <button 
                     onClick={() => handleGameSelect('GAME_SPELLING')}
                     className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-orange-100 hover:-translate-y-2 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                   >
                     <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">✏️</div>
                     <h3 className="text-xl font-bold text-orange-600 mb-2">拼字練習</h3>
                     <p className="text-gray-400 text-sm font-medium">Spelling Bee</p>
                   </button>
                 ) : (
                   <div className="bg-gray-100 p-6 rounded-3xl border-4 border-dashed border-gray-200 opacity-60 flex flex-col items-center justify-center">
                     <div className="text-4xl mb-4 grayscale">🔒</div>
                     <h3 className="text-lg font-bold text-gray-400 mb-1">拼字練習</h3>
                     <p className="text-gray-400 text-xs">4年級以上解鎖</p>
                   </div>
                 )
               )}
             </div>

             <button 
                onClick={startQuiz}
                className="mt-12 text-gray-400 hover:text-gray-600 font-bold underline decoration-2 underline-offset-4"
             >
               {isMath || isWriting ? '直接開始總測驗 (Final Quiz)' : '跳過遊戲，直接測驗 (Skip to Quiz)'}
             </button>
           </div>
        )}

        {/* 4a. Matching Game */}
        {!state.isLoading && state.gameStatus === 'GAME_MATCHING' && state.lessonData && state.currentSubject && (
          <MatchingGame 
            vocabulary={state.lessonData.vocabulary}
            onFinish={startQuiz}
            onExit={resetGame}
            subject={state.currentSubject}
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

        {/* 4c. Word Scramble Game (Replaces Speaking) */}
        {!state.isLoading && state.gameStatus === 'GAME_WORD_SCRAMBLE' && state.lessonData && (
          <WordScrambleGame
            vocabulary={state.lessonData.vocabulary}
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4d. Math Speed Game (Existing) */}
        {!state.isLoading && state.gameStatus === 'GAME_MATH_CHALLENGE' && state.currentGrade && (
          <MathChallenge
            grade={state.currentGrade}
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4e. Number Puzzle Game (NEW) */}
        {!state.isLoading && state.gameStatus === 'GAME_NUMBER_PUZZLE' && (
          <NumberPuzzleGame
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4f. Geometry Builder Game (NEW) */}
        {!state.isLoading && state.gameStatus === 'GAME_GEOMETRY_BUILDER' && (
          <GeometryBuilderGame
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4g. Sentence Builder Game (NEW) */}
        {!state.isLoading && state.gameStatus === 'GAME_SENTENCE_BUILDER' && (
          <SentenceBuilderGame
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 4h. Idiom Dojo Game (NEW) */}
        {!state.isLoading && state.gameStatus === 'GAME_IDIOM_DOJO' && (
          <IdiomDojoGame
            onFinish={startQuiz}
            onExit={resetGame}
          />
        )}

        {/* 5. Playing State (Final Quiz) */}
        {!state.isLoading && state.gameStatus === 'PLAYING' && state.lessonData && state.currentSubject && (
          <QuizGame 
            questions={state.lessonData.quiz} 
            onFinish={handleFinish} 
            onExit={resetGame}
            subject={state.currentSubject}
          />
        )}

        {/* 6. Finished State */}
        {!state.isLoading && state.gameStatus === 'FINISHED' && state.lessonData && (
          <div className="w-full max-w-2xl px-4 pb-12 animate-fade-in-up">
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
                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Score</div>
                <div className="text-6xl font-black text-sky-500 drop-shadow-sm">
                  {state.score} / {state.lessonData.quiz.length}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={restartLesson}
                  className="w-full bg-yellow-400 text-yellow-900 py-3 rounded-xl font-bold text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  🔄 重新複習此課程 (Retry Lesson)
                </button>

                <button 
                  onClick={() => {
                    if (state.currentSubject === 'MATH') {
                       // For Math, go back to topic selection for that grade
                       setState(prev => ({ ...prev, gameStatus: 'MATH_TOPIC_SELECTION', score: 0, wrongAnswers: [], lessonData: null }));
                    } else {
                       handleGradeSelect(state.currentGrade!);
                    }
                  }}
                  className="w-full bg-sky-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  ✨ 練習新的課程 (New Lesson)
                </button>
                
                <button 
                  onClick={resetGame}
                  className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
                >
                  回首頁 (Home)
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
                        {/* Only show listen button for English */}
                        {isEnglish && (
                          <button 
                            onClick={() => speak(wa.quizItem.question)}
                            className="text-sky-500 hover:text-sky-600 text-sm font-bold"
                          >
                            🔊 Listen
                          </button>
                        )}
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
      <footer className="fixed bottom-0 w-full p-2 text-center text-gray-400/50 text-xs pointer-events-none hidden sm:block">
        Powered by Google Gemini 2.5 Flash
      </footer>
    </div>
  );
}
