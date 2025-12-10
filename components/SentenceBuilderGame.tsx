
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSFX } from '../services/audioService';

interface SentenceBuilderGameProps {
  onFinish: () => void;
  onExit: () => void;
}

const LEVELS = [
  { text: "小狗 在 公園裡 快樂地 跑跳", emoji: "🐶" },
  { text: "彎彎的 月亮 像 一艘 小船", emoji: "🌙" },
  { text: "雖然 下雨了 但是 我 還是 去 上學", emoji: "☔" },
  { text: "圖書館裡 有 許多 有趣的 故事書", emoji: "📚" },
  { text: "勤勞的 螞蟻 在 地上 搬運 食物", emoji: "🐜" },
];

export const SentenceBuilderGame: React.FC<SentenceBuilderGameProps> = ({ onFinish, onExit }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [sourceWords, setSourceWords] = useState<string[]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const currentLevel = LEVELS[levelIndex];
  const correctOrder = currentLevel.text.split(' ');

  useEffect(() => {
    // Initialize level: shuffle words
    const words = [...correctOrder].sort(() => Math.random() - 0.5);
    setSourceWords(words);
    setTargetWords([]);
    setStatus('playing');
  }, [levelIndex]);

  const handleSourceClick = (word: string, index: number) => {
    if (status !== 'playing') return;
    playSFX('click');
    
    // Move from source to target
    const newSource = [...sourceWords];
    newSource.splice(index, 1);
    setSourceWords(newSource);
    setTargetWords([...targetWords, word]);
  };

  const handleTargetClick = (word: string, index: number) => {
    if (status !== 'playing') return;
    playSFX('click');

    // Move back from target to source
    const newTarget = [...targetWords];
    newTarget.splice(index, 1);
    setTargetWords(newTarget);
    setSourceWords([...sourceWords, word]);
  };

  const checkAnswer = () => {
    if (targetWords.join(' ') === currentLevel.text) {
      setStatus('correct');
      playSFX('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        if (levelIndex < LEVELS.length - 1) {
          setLevelIndex(p => p + 1);
        } else {
          playSFX('win');
          onFinish();
        }
      }, 1500);
    } else {
      setStatus('wrong');
      playSFX('wrong');
      setTimeout(() => setStatus('playing'), 1000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-black text-pink-600 tracking-wider">
          🧩 句子積木工廠
        </h2>
        <div className="bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-bold">
          {levelIndex + 1} / {LEVELS.length}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-pink-100 min-h-[400px] flex flex-col justify-between">
        <div className="text-center mb-4">
            <span className="text-6xl mb-2 block">{currentLevel.emoji}</span>
            <p className="text-gray-400 font-bold text-sm">請把積木排成通順的句子！</p>
        </div>

        {/* Target Area (Answer) */}
        <div className={`
          bg-gray-100 rounded-2xl p-4 min-h-[100px] flex flex-wrap gap-3 items-center justify-center border-4 border-dashed
          ${status === 'correct' ? 'border-green-400 bg-green-50' : 'border-gray-200'}
          ${status === 'wrong' ? 'border-red-400 bg-red-50 animate-shake' : ''}
        `}>
          {targetWords.length === 0 && (
            <span className="text-gray-400 font-medium">點擊下方積木來組裝句子...</span>
          )}
          {targetWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleTargetClick(word, idx)}
              className="bg-white text-gray-800 font-bold text-xl px-4 py-2 rounded-xl shadow-sm border-b-4 border-gray-200 hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Source Area (Pool) */}
        <div className="flex flex-wrap gap-3 justify-center mt-8 mb-4">
          {sourceWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleSourceClick(word, idx)}
              className="bg-pink-500 text-white font-bold text-xl px-5 py-3 rounded-xl shadow-md border-b-4 border-pink-700 hover:bg-pink-400 hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="mt-4">
           <button 
             onClick={checkAnswer}
             disabled={sourceWords.length > 0} // Must use all words
             className={`
               w-full py-3 rounded-xl font-bold text-lg transition-all
               ${sourceWords.length === 0 
                 ? 'bg-green-500 text-white shadow-lg hover:brightness-110' 
                 : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
             `}
           >
             {sourceWords.length === 0 ? '檢查答案 (Check) ✨' : '還沒排完喔...'}
           </button>
        </div>
      </div>
    </div>
  );
};
