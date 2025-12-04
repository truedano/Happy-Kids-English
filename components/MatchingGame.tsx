import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface MatchingGameProps {
  vocabulary: VocabularyItem[];
  onFinish: () => void;
  onExit: () => void;
}

interface Card {
  id: string;
  content: string;
  type: 'word' | 'definition'; // 'word' is English, 'definition' is Emoji+Chinese
  vocabIndex: number; // To check matches
  isMatched: boolean;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ vocabulary, onFinish, onExit }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize game
  useEffect(() => {
    const newCards: Card[] = [];
    vocabulary.forEach((vocab, index) => {
      // Card 1: English Word
      newCards.push({
        id: `word-${index}`,
        content: vocab.word,
        type: 'word',
        vocabIndex: index,
        isMatched: false,
      });
      // Card 2: Emoji + Chinese
      newCards.push({
        id: `def-${index}`,
        content: `${vocab.emoji} ${vocab.chinese}`,
        type: 'definition',
        vocabIndex: index,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [vocabulary]);

  const handleCardClick = (card: Card) => {
    if (isProcessing || card.isMatched || selectedCardId === card.id) return;

    // First card selected
    if (!selectedCardId) {
      setSelectedCardId(card.id);
      speak(card.type === 'word' ? card.content : ''); // Speak if it's the English word
      return;
    }

    // Second card selected
    const prevCard = cards.find(c => c.id === selectedCardId);
    if (!prevCard) return;

    setIsProcessing(true);

    // Check Match
    if (prevCard.vocabIndex === card.vocabIndex) {
      // Match!
      speak("Great!");
      setCards(prev => prev.map(c => 
        (c.id === card.id || c.id === prevCard.id) 
          ? { ...c, isMatched: true } 
          : c
      ));
      setSelectedCardId(null);
      setIsProcessing(false);
    } else {
      // No Match
      setTimeout(() => {
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const speak = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const allMatched = cards.length > 0 && cards.every(c => c.isMatched);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
       {/* Header */}
       <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-bold text-secondary animate-bounce">
          🧩 連連看 Matching Game
        </h2>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <p className="text-center text-gray-500 mb-6">
        點擊卡片，把英文單字和中文意思配對起來！
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
             baseClasses += "bg-red-50 text-gray-400 cursor-not-allowed";
          } else {
             baseClasses += "bg-white hover:bg-sky-50 hover:-translate-y-1 cursor-pointer text-gray-700 border-b-4 border-gray-200";
          }

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={baseClasses}
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
              onClick={onFinish}
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