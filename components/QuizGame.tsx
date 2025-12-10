
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuizItem, WrongAnswer, Subject } from '../types';
import { playSFX } from '../services/audioService';

interface QuizGameProps {
  questions: QuizItem[];
  onFinish: (score: number, wrongAnswers: WrongAnswer[]) => void;
  onExit: () => void;
  subject: Subject;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, onFinish, onExit, subject }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [shake, setShake] = useState(false);

  const currentQ = questions[currentIdx];
  const isMath = subject === 'MATH';
  const isWriting = subject === 'WRITING';
  const shouldSpeak = !isMath && !isWriting;

  const handleSpeech = (text: string) => {
    // Disable speech for Math and Writing
    if (!shouldSpeak) return;

    if ('speechSynthesis' in window) {
      // Replace underscores with "blank" so it reads naturally
      const spokenText = text.replace(/_+/g, ' blank ');
      
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // Slower for kids
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Auto speak question when it loads (ONLY if NOT Math/Writing)
    if (shouldSpeak) {
      handleSpeech(questions[currentIdx].question);
    }
  }, [currentIdx, questions, shouldSpeak]);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);
    setShowFeedback(true);

    if (option === currentQ.correctAnswer) {
      setScore(s => s + 1);
      playSFX('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC107', '#4ECDC4', '#FF6B6B']
      });
    } else {
      playSFX('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      // Record wrong answer
      setWrongAnswers(prev => [...prev, {
        quizItem: currentQ,
        selectedAnswer: option
      }]);
    }
  };

  const nextQuestion = () => {
    playSFX('click');
    setIsAnswered(false);
    setSelectedAnswer(null);
    setShowFeedback(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(c => c + 1);
    } else {
      // Pass both score and wrong answers list
      // Play win sound if score is good
      if (score > questions.length / 2) {
        playSFX('win');
      }
      onFinish(score, wrongAnswers); 
    }
  };

  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4">
          <div 
            className="bg-secondary h-4 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-sm">
          ⭐ {score}
        </div>
      </div>

      {/* Question Card */}
      <div className={`bg-white rounded-3xl shadow-xl p-8 mb-6 text-center relative overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400"></div>
        
        <h2 className={`text-3xl font-bold text-gray-800 mb-4 leading-relaxed ${isMath ? 'font-mono text-4xl' : ''}`}>
          {currentQ.question}
        </h2>
        
        {shouldSpeak && (
          <button 
            onClick={() => handleSpeech(currentQ.question)}
            className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-flex items-center gap-2 transition-colors"
          >
            🔊 聽題目 (Listen)
          </button>
        )}

        <p className="text-gray-500 text-lg mb-2 font-medium">
          {currentQ.chineseTranslation}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQ.options.map((option, idx) => {
          let buttonStyle = "bg-white hover:bg-sky-50 border-b-4 border-gray-200 text-gray-700";
          
          if (isAnswered) {
            if (option === currentQ.correctAnswer) {
              buttonStyle = "bg-green-100 border-green-500 text-green-800 border-b-4";
            } else if (option === selectedAnswer) {
              buttonStyle = "bg-red-100 border-red-500 text-red-800 border-b-4";
            } else {
              buttonStyle = "bg-gray-50 text-gray-400 border-gray-100 border-b-4 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`
                ${buttonStyle}
                p-6 rounded-2xl text-xl font-bold shadow-sm
                transition-all duration-200 transform
                ${!isAnswered && 'hover:scale-[1.02] active:scale-95 active:border-b-0 active:translate-y-1'}
                ${isMath ? 'font-mono text-2xl' : ''}
              `}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback Overlay / Bottom Sheet */}
      {showFeedback && (
        <div className="mt-6 animate-fade-in-up">
          <div className={`
            p-6 rounded-2xl border-l-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-4
            ${selectedAnswer === currentQ.correctAnswer ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-400'}
          `}>
            <div className="text-left">
              <h3 className={`text-xl font-bold mb-1 ${selectedAnswer === currentQ.correctAnswer ? 'text-green-700' : 'text-orange-700'}`}>
                {selectedAnswer === currentQ.correctAnswer ? '🎉 答對了！ Awesome!' : '💪 再接再厲！ Try Again!'}
              </h3>
              <p className="text-gray-600">{currentQ.explanation}</p>
            </div>
            
            <button
              onClick={nextQuestion}
              className="bg-primary text-yellow-900 hover:bg-yellow-400 px-8 py-3 rounded-xl font-bold text-lg shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {currentIdx + 1 === questions.length ? '看成績 🏆' : '下一題 ➜'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
