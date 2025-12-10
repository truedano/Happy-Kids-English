
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { VocabularyItem } from '../types';
import { playSFX } from '../services/audioService';

interface WordScrambleGameProps {
  vocabulary: VocabularyItem[];
  onFinish: () => void;
  onExit: () => void;
}

interface LetterObj {
  char: string;
  id: number; // Unique ID to handle duplicate letters
}

export const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ vocabulary, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [poolLetters, setPoolLetters] = useState<LetterObj[]>([]);
  const [answerLetters, setAnswerLetters] = useState<LetterObj[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const currentWord = vocabulary[currentIndex];

  useEffect(() => {
    // Reset for new word
    const word = currentWord.word.trim();
    // Create letter objects with unique IDs
    const letters = word.split('').map((char, idx) => ({ char, id: idx }));
    // Shuffle for the pool
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    
    setPoolLetters(shuffled);
    setAnswerLetters([]);
    setStatus('playing');
  }, [currentIndex, currentWord]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePoolClick = (letter: LetterObj) => {
    if (status !== 'playing') return;
    playSFX('click');
    setPoolLetters(prev => prev.filter(l => l.id !== letter.id));
    setAnswerLetters(prev => [...prev, letter]);
  };

  const handleAnswerClick = (letter: LetterObj) => {
    if (status !== 'playing') return;
    playSFX('click');
    setAnswerLetters(prev => prev.filter(l => l.id !== letter.id));
    setPoolLetters(prev => [...prev, letter]);
  };

  // Auto-check when all letters are used
  useEffect(() => {
    if (poolLetters.length === 0 && answerLetters.length > 0 && status === 'playing') {
      checkAnswer();
    }
  }, [poolLetters, answerLetters, status]);

  const checkAnswer = () => {
    const currentString = answerLetters.map(l => l.char).join('');
    const targetString = currentWord.word.trim(); // Case sensitive? Usually keep original casing or lowercase.
    
    // Check ignoring case usually safer for kids, but let's try exact match first or normalize
    if (currentString === targetString) {
      setStatus('correct');
      playSFX('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      speak("Correct!");
      
      setTimeout(() => {
        if (currentIndex < vocabulary.length - 1) {
          setCurrentIndex(p => p + 1);
        } else {
          playSFX('win');
          onFinish();
        }
      }, 1500);
    } else {
      setStatus('wrong');
      playSFX('wrong');
      speak("Try again");
      
      // Auto-reset after a short delay if wrong
      setTimeout(() => {
        setStatus('playing');
        // Optional: Move all letters back? Or keep them there?
        // Let's move them back to help them restart
        setPoolLetters([...poolLetters, ...answerLetters].sort(() => Math.random() - 0.5));
        setAnswerLetters([]);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-black text-violet-600 tracking-wider">
          🔤 字母大亂鬥
        </h2>
        <div className="bg-violet-100 text-violet-700 px-4 py-1 rounded-full font-bold">
          {currentIndex + 1} / {vocabulary.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-b-8 border-violet-100 min-h-[400px] flex flex-col items-center justify-between">
        
        <div className="w-full">
            <div className="text-8xl mb-4 animate-bounce-slow filter drop-shadow-sm">
            {currentWord.emoji}
            </div>
            <p className="text-2xl font-bold text-gray-500 mb-2">
            {currentWord.chinese}
            </p>
            <button 
                onClick={() => speak(currentWord.word)}
                className="text-violet-400 hover:text-violet-600 font-bold text-sm flex items-center justify-center gap-1 mx-auto mb-6"
            >
                🔊 聽發音 (Listen)
            </button>
        </div>

        {/* Answer Slots */}
        <div className={`
            flex flex-wrap justify-center gap-2 mb-8 p-4 rounded-xl transition-colors min-h-[80px] w-full items-center
            ${status === 'correct' ? 'bg-green-100' : 'bg-gray-100'}
            ${status === 'wrong' ? 'bg-red-100 animate-shake' : ''}
        `}>
            {answerLetters.length === 0 && (
                <span className="text-gray-400 font-medium">點擊下方字母來拼字...</span>
            )}
            {answerLetters.map((l) => (
                <button
                    key={l.id}
                    onClick={() => handleAnswerClick(l)}
                    className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl shadow-sm border-b-4 border-gray-200 text-2xl font-bold text-gray-800 flex items-center justify-center hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all"
                >
                    {l.char}
                </button>
            ))}
        </div>

        {/* Letter Pool */}
        <div className="flex flex-wrap justify-center gap-3">
            {poolLetters.map((l) => (
                <button
                    key={l.id}
                    onClick={() => handlePoolClick(l)}
                    className="w-14 h-14 md:w-16 md:h-16 bg-violet-500 text-white rounded-2xl shadow-lg border-b-4 border-violet-700 text-3xl font-bold flex items-center justify-center hover:bg-violet-400 hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all"
                >
                    {l.char}
                </button>
            ))}
        </div>

      </div>
    </div>
  );
};
