import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface StudyModeProps {
  topic: string;
  chineseTopic: string;
  vocabulary: VocabularyItem[];
  onFinish: () => void;
  onExit: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({ topic, chineseTopic, vocabulary, onFinish, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentWord = vocabulary[currentIdx];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-speak when sliding to a new card
  useEffect(() => {
    speak(currentWord.word);
  }, [currentIdx, currentWord]);

  const handleNext = () => {
    if (currentIdx < vocabulary.length - 1) {
      setCurrentIdx(p => p + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(p => p - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-400 hover:text-red-500 font-bold px-3">
          ✕ 離開
        </button>
        <div className="text-center">
          <h2 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Today's Lesson</h2>
          <div className="text-xl font-bold text-sky-600">{topic} <span className="text-base font-normal text-gray-500">({chineseTopic})</span></div>
        </div>
        <div className="text-sm font-bold bg-sky-100 text-sky-600 px-3 py-1 rounded-full">
          {currentIdx + 1} / {vocabulary.length}
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-b-8 border-sky-100 mb-8 transform transition-all">
        {/* Visual Header */}
        <div className="bg-sky-50 p-8 flex justify-center items-center h-48 relative">
           <div className="absolute top-4 right-4 text-sky-200 text-6xl opacity-20 font-black">
             {currentIdx + 1}
           </div>
           <span className="text-9xl drop-shadow-md filter hover:scale-110 transition-transform duration-300 cursor-default">
             {currentWord.emoji}
           </span>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          
          {/* Word & Pronunciation */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-black text-gray-800 tracking-tight">{currentWord.word}</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-serif italic text-lg">{currentWord.partOfSpeech}</span>
              <button 
                onClick={() => speak(currentWord.word)}
                className="bg-primary hover:bg-yellow-400 text-yellow-900 rounded-full p-2 transition-transform hover:scale-110 active:scale-95 shadow-sm"
                aria-label="Play pronunciation"
              >
                🔊
              </button>
            </div>
            <p className="text-2xl text-gray-600 font-medium mt-1">{currentWord.chinese}</p>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* Sentence */}
          <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Example</span>
              <button onClick={() => speak(currentWord.exampleSentence)} className="text-sky-500 hover:text-sky-600 text-sm font-bold">
                🔊 Listen
              </button>
            </div>
            <p className="text-lg text-gray-800 font-medium leading-relaxed mb-1">
              {currentWord.exampleSentence}
            </p>
            <p className="text-gray-500">
              {currentWord.exampleTranslation}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`
            flex-1 py-4 rounded-2xl font-bold text-lg transition-all
            ${currentIdx === 0 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white text-gray-600 shadow-md hover:bg-gray-50 active:scale-95'}
          `}
        >
          ⬅️ 上一個
        </button>

        <button 
          onClick={handleNext}
          className="flex-[2] bg-secondary text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-teal-200/50 hover:brightness-105 active:scale-95 transition-all"
        >
          {currentIdx === vocabulary.length - 1 ? '我學會了，開始測驗！ 🚀' : '下一個 (Next) ➜'}
        </button>
      </div>
    </div>
  );
};