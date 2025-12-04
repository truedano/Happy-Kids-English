import React, { useState, useEffect, useRef } from 'react';
import { VocabularyItem } from '../types';

interface SpellingGameProps {
  vocabulary: VocabularyItem[];
  onFinish: () => void;
  onExit: () => void;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({ vocabulary, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [hintIndex, setHintIndex] = useState<number | null>(null); // Show one letter index
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentWord = vocabulary[currentIndex];

  useEffect(() => {
    setUserInput('');
    setFeedback('neutral');
    setHintIndex(null);
    inputRef.current?.focus();
  }, [currentIndex]);

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback('correct');
      // Play sound
      speak("Correct!");
      setTimeout(() => {
        if (currentIndex < vocabulary.length - 1) {
          setCurrentIndex(p => p + 1);
        } else {
          onFinish(); // All done
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      speak("Try again");
      setTimeout(() => setFeedback('neutral'), 1000);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const showHint = () => {
    // Reveal a random index that isn't already revealed or first letter
    const len = currentWord.word.length;
    const randomIdx = Math.floor(Math.random() * len);
    setHintIndex(randomIdx);
    inputRef.current?.focus();
  };

  // Mask logic for visual aid (optional, here we just ask them to type whole word)
  // But let's show blank lines _ _ _ _ above
  
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-bold text-sky-600">
          ✏️ 拼字練習 Spelling Bee
        </h2>
        <div className="text-sm font-bold bg-sky-100 text-sky-600 px-3 py-1 rounded-full">
          {currentIndex + 1} / {vocabulary.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-b-8 border-gray-100">
        
        {/* Visual Cue */}
        <div className="text-8xl mb-4 animate-bounce-slow">
          {currentWord.emoji}
        </div>
        
        <p className="text-2xl font-medium text-gray-500 mb-8">
          {currentWord.chinese}
        </p>

        {/* Word Mask / Hint */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {currentWord.word.split('').map((char, idx) => (
             <div key={idx} className="w-8 h-12 border-b-4 border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-400">
               {/* Show letter if it's a space, or if hint is active for this index */}
               {(char === ' ' || idx === hintIndex) ? char : ''}
             </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={checkAnswer} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className={`
              w-full text-center text-3xl font-bold py-4 rounded-xl border-2 outline-none transition-all
              ${feedback === 'neutral' ? 'border-gray-200 focus:border-sky-400 text-gray-800' : ''}
              ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-600' : ''}
              ${feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-600 animate-wiggle' : ''}
            `}
            placeholder="Type the word..."
            autoFocus
          />
          
          <div className="flex justify-between items-center mt-6">
            <button 
              type="button" 
              onClick={() => speak(currentWord.word)}
              className="text-gray-400 hover:text-sky-500 font-bold text-sm flex items-center gap-1"
            >
              🔊 Listen
            </button>

            <button 
              type="button"
              onClick={showHint} 
              className="text-orange-400 hover:text-orange-500 font-bold text-sm"
            >
              💡 Hint
            </button>
          </div>

          <button
            type="submit"
            disabled={userInput.length === 0}
            className="w-full mt-6 bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sky-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer ✔️
          </button>
        </form>
      </div>
    </div>
  );
};