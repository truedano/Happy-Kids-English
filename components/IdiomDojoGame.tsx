
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSFX } from '../services/audioService';

interface IdiomDojoGameProps {
  onFinish: () => void;
  onExit: () => void;
}

interface IdiomQuestion {
  parts: string[]; // ["畫", "蛇", "添", "_"]
  answer: string;  // "足"
  options: string[]; // ["足", "腳", "手", "頭"]
  meaning: string;
}

const QUESTIONS: IdiomQuestion[] = [
  { parts: ["畫", "蛇", "添", "_"], answer: "足", options: ["足", "腳", "手", "頭"], meaning: "比喻多此一舉，反而把事情弄壞。" },
  { parts: ["_", "羊", "補", "牢"], answer: "亡", options: ["亡", "忘", "望", "往"], meaning: "比喻犯錯後及時更正，還來得及補救。" },
  { parts: ["一", "石", "二", "_"], answer: "鳥", options: ["鳥", "魚", "心", "用"], meaning: "比喻做一件事獲得兩種好處。" },
  { parts: ["井", "底", "之", "_"], answer: "蛙", options: ["蛙", "娃", "挖", "哇"], meaning: "比喻見識淺薄的人。" },
  { parts: ["半", "途", "而", "_"], answer: "廢", options: ["廢", "飛", "費", "肺"], meaning: "比喻事情做到一半就停止，沒有完成。" },
  { parts: ["守", "株", "待", "_"], answer: "兔", options: ["兔", "吐", "土", "圖"], meaning: "比喻拘泥守成，不知變通或妄想不勞而獲。" },
];

export const IdiomDojoGame: React.FC<IdiomDojoGameProps> = ({ onFinish, onExit }) => {
  const [qIndex, setQIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const currentQ = QUESTIONS[qIndex];

  const handleOptionClick = (opt: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(opt);

    if (opt === currentQ.answer) {
      playSFX('correct');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      playSFX('wrong');
    }
  };

  const handleNext = () => {
    playSFX('click');
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(p => p + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      playSFX('win');
      onFinish();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-black text-orange-600 tracking-wider">
          🥋 成語修煉場
        </h2>
        <div className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full font-bold">
          {qIndex + 1} / {QUESTIONS.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-b-8 border-orange-100">
        <h3 className="text-gray-400 font-bold uppercase tracking-wider mb-8">
          請補上缺少的字
        </h3>

        {/* Idiom Display */}
        <div className="flex justify-center gap-2 mb-10">
          {currentQ.parts.map((char, idx) => {
            const isMissing = char === "_";
            // If answered and this is the missing slot, show the selected option
            const displayChar = isMissing 
              ? (isAnswered ? selectedOption : "?") 
              : char;
            
            let boxColor = "bg-gray-100 text-gray-800 border-gray-300";
            if (isMissing) {
                if (isAnswered) {
                    boxColor = selectedOption === currentQ.answer 
                        ? "bg-green-100 text-green-600 border-green-400 scale-110" 
                        : "bg-red-100 text-red-600 border-red-400 scale-110";
                } else {
                    boxColor = "bg-orange-50 text-orange-400 border-orange-300 border-dashed animate-pulse";
                }
            }

            return (
              <div 
                key={idx} 
                className={`
                   w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl font-black rounded-2xl border-b-4 transition-all
                   ${boxColor}
                `}
              >
                {displayChar}
              </div>
            );
          })}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = "bg-white border-gray-200 text-gray-700 hover:bg-orange-50";
            if (isAnswered) {
                if (opt === currentQ.answer) btnStyle = "bg-green-500 text-white border-green-700";
                else if (opt === selectedOption) btnStyle = "bg-red-500 text-white border-red-700 opacity-50";
                else btnStyle = "bg-gray-100 text-gray-300 opacity-30";
            }

            return (
                <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                disabled={isAnswered}
                className={`
                    py-4 rounded-xl text-3xl font-bold shadow-sm border-b-4 transition-all
                    ${btnStyle}
                    ${!isAnswered && 'active:scale-95 active:border-b-0 active:translate-y-1'}
                `}
                >
                {opt}
                </button>
            );
          })}
        </div>

        {/* Explanation / Next Button */}
        <div className={`transition-all duration-300 overflow-hidden ${isAnswered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-orange-50 p-4 rounded-xl text-left mb-4 border border-orange-100">
                <span className="font-bold text-orange-600 block mb-1">💡 意思是：</span>
                <span className="text-gray-600">{currentQ.meaning}</span>
            </div>
            <button 
                onClick={handleNext}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110"
            >
                {qIndex < QUESTIONS.length - 1 ? '下一題 (Next) ➜' : '完成修煉 (Finish) 🏆'}
            </button>
        </div>

      </div>
    </div>
  );
};
