
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { VocabularyItem, Subject } from '../types';
import { playSFX } from '../services/audioService';

interface MatchingGameProps {
  vocabulary: VocabularyItem[];
  onFinish: () => void;
  onExit: () => void;
  subject: Subject;
}

interface Card {
  id: string;
  content: string;
  type: 'word' | 'definition'; // 'word' is English/ChineseConcept, 'definition' is Emoji+Desc/Formula
  vocabIndex: number; // To check matches
  isMatched: boolean;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ vocabulary, onFinish, onExit, subject }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isMath = subject === 'MATH';
  const isWriting = subject === 'WRITING';
  const shouldSpeak = !isMath && !isWriting; // Only speak for English

  // Initialize game
  useEffect(() => {
    const newCards: Card[] = [];
    vocabulary.forEach((vocab, index) => {
      // Card 1: Main Concept (English for ENG, Chinese for MATH/WRITING)
      newCards.push({
        id: `word-${index}`,
        content: vocab.word,
        type: 'word',
        vocabIndex: index,
        isMatched: false,
      });
      // Card 2: Definition (Emoji + Chinese for ENG, Formula for MATH, Example for WRITING)
      newCards.push({
        id: `def-${index}`,
        content: (isMath || isWriting) ? vocab.exampleSentence : `${vocab.emoji} ${vocab.chinese}`, 
        type: 'definition',
        vocabIndex: index,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [vocabulary, isMath, isWriting]);

  const speak = (text: string) => {
    if (!text || !shouldSpeak) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = (card: Card) => {
    if (isProcessing || card.isMatched || selectedCardId === card.id) return;

    // First card selected
    if (!selectedCardId) {
      playSFX('click');
      setSelectedCardId(card.id);
      if (card.type === 'word') {
         speak(card.content); 
      }
      return;
    }

    // Second card selected
    const prevCard = cards.find(c => c.id === selectedCardId);
    if (!prevCard) return;

    setIsProcessing(true);

    // Check Match
    if (prevCard.vocabIndex === card.vocabIndex) {
      // Match!
      playSFX('correct');
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        startVelocity: 30,
        gravity: 2,
      });
      if (shouldSpeak) speak("Great!");
      
      setCards(prev => prev.map(c => 
        (c.id === card.id || c.id === prevCard.id) 
          ? { ...c, isMatched: true } 
          : c
      ));
      setSelectedCardId(null);
      setIsProcessing(false);
    } else {
      // No Match
      playSFX('wrong');
      setTimeout(() => {
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const allMatched = cards.length > 0 && cards.every(c => c.isMatched);

  useEffect(() => {
    if (allMatched) {
      playSFX('win');
      confetti({
        particleCount: 200,
        spread: 160,
      });
    }
  }, [allMatched]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
       {/* Header */}
       <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-bold text-secondary animate-bounce">
          🧩 連連看 Matching Game
        </h2>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <p className="text-center text-gray-500 mb-6">
        {isMath 
          ? '請把「數學概念」和對應的「算式/圖形」連起來！' 
          : (isWriting ? '請把「寫作技巧」和對應的「範例」連起來！' : '點擊卡片，把英文單字和中文意思配對起來！')
        }
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => {
          const isSelected = selectedCardId === card.id;
          let baseClasses = "h-32 rounded-2xl text-lg font-bold shadow-md flex items-center justify-center p-4 transition-all duration-300 transform ";
          
          if (card.isMatched) {
            baseClasses += "bg-transparent border-2 border-dashed border-gray-300 text-gray-300 scale-95 opacity-50 cursor-default";
          } else if (isSelected) {
            baseClasses += "bg-blue-100 border-4 border-blue-400 text-blue-800 scale-105";
          } else if (selectedCardId && !isProcessing) {
             // Another card is selected, this is waiting
             baseClasses += "bg-white hover:bg-gray-50 cursor-pointer text-gray-700";
          } else if (isProcessing && !isSelected) {
             // Wrong match animation state (simplistic)
             baseClasses += "bg-red-50 text-gray-400 cursor-not-allowed animate-shake";
          } else {
             baseClasses += "bg-white hover:bg-sky-50 hover:-translate-y-1 cursor-pointer text-gray-700 border-b-4 border-gray-200";
          }

          // Use monospaced font for Math formulas or Writing examples for better readability
          const isSpecialFont = (isMath || isWriting) && card.type === 'definition';

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`${baseClasses} ${isSpecialFont ? 'font-mono text-sm md:text-lg' : ''}`}
              disabled={card.isMatched}
            >
              {card.content}
            </button>
          );
        })}
      </div>

      {/* Completion Modal */}
      {allMatched && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-slow">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">太棒了！全部配對成功！</h3>
            <p className="text-gray-500 mb-6">準備好進行最後的測驗了嗎？</p>
            <button
              onClick={() => { playSFX('click'); onFinish(); }}
              className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:brightness-110"
            >
              開始測驗 (Start Quiz) ➜
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
