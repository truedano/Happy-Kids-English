import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface SpeakingGameProps {
  vocabulary: VocabularyItem[];
  onFinish: () => void;
  onExit: () => void;
}

export const SpeakingGame: React.FC<SpeakingGameProps> = ({ vocabulary, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'success' | 'fail' | 'error'>('idle');
  
  const currentWord = vocabulary[currentIndex];

  // Browser compatibility check for SpeechRecognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  useEffect(() => {
    setTranscript('');
    setStatus('idle');
  }, [currentIndex]);

  const startListening = () => {
    if (!SpeechRecognition) {
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setStatus('listening');
    setTranscript('...');

    recognition.start();

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const spokenText = lastResult[0].transcript.toLowerCase().trim();
      const targetText = currentWord.word.toLowerCase().trim();

      setTranscript(spokenText);
      setIsListening(false);

      // Simple fuzzy match check (includes or equals)
      if (spokenText === targetText || spokenText.includes(targetText)) {
        setStatus('success');
        speak("Excellent!");
        setTimeout(() => {
          handleNext();
        }, 1500);
      } else {
        setStatus('fail');
        speak("Try again");
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setStatus('fail'); // Treat error as fail for simplicity to user
      setTranscript('聽不清楚，再試一次？');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'listening') {
        setStatus('idle');
      }
    };
  };

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(p => p + 1);
    } else {
      onFinish();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!SpeechRecognition) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">抱歉，您的瀏覽器不支援語音辨識。</h2>
        <button onClick={onFinish} className="mt-4 bg-gray-200 px-4 py-2 rounded">跳過此模式</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-bold text-purple-600">
          🎤 口說挑戰 Speaking
        </h2>
        <div className="text-sm font-bold bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
          {currentIndex + 1} / {vocabulary.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 text-center flex flex-col items-center">
        
        <div className="text-7xl mb-4">{currentWord.emoji}</div>
        <h1 className="text-4xl font-black text-gray-800 mb-2">{currentWord.word}</h1>
        <p className="text-gray-500 text-xl mb-8">{currentWord.chinese}</p>
        
        <button 
          onClick={() => speak(currentWord.word)}
          className="text-sky-500 font-bold mb-8 flex items-center gap-2 hover:bg-sky-50 px-3 py-1 rounded-full transition-colors"
        >
          🔊 聽聽看標準發音
        </button>

        {/* Mic Button */}
        <button
          onClick={startListening}
          disabled={isListening || status === 'success'}
          className={`
            w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-lg transition-all transform
            ${status === 'listening' ? 'bg-red-500 text-white animate-pulse scale-110' : ''}
            ${status === 'success' ? 'bg-green-500 text-white scale-100' : ''}
            ${status === 'fail' ? 'bg-gray-200 text-gray-400 animate-wiggle' : ''}
            ${status === 'idle' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-105' : ''}
          `}
        >
          {status === 'success' ? '✔' : status === 'listening' ? '🎙️' : '🎤'}
        </button>
        
        <p className="mt-6 text-lg font-bold min-h-[1.5em] text-gray-700">
          {status === 'listening' && "Listening..."}
          {status === 'success' && "Perfect! 🎉"}
          {status === 'fail' && "Oops! Try again."}
          {status === 'idle' && "點擊麥克風唸唸看！"}
        </p>

        {transcript && status !== 'listening' && status !== 'idle' && (
          <p className="text-sm text-gray-400 mt-2">
            I heard: "{transcript}"
          </p>
        )}

        {/* Skip button if stuck */}
        <button 
          onClick={handleNext}
          className="mt-8 text-gray-400 text-sm underline hover:text-gray-600"
        >
           太難了？跳過 (Skip)
        </button>
      </div>
    </div>
  );
};