
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GradeLevel } from '../types';
import { playSFX } from '../services/audioService';

interface MathChallengeProps {
  grade: GradeLevel;
  onFinish: () => void;
  onExit: () => void;
}

interface MathProblem {
  question: string;
  answer: number | string;
  options: (number | string)[];
}

export const MathChallenge: React.FC<MathChallengeProps> = ({ grade, onFinish, onExit }) => {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Generate problems based on Grade Level
  useEffect(() => {
    const newProblems: MathProblem[] = [];
    const count = 10; // Number of questions

    for (let i = 0; i < count; i++) {
      newProblems.push(generateProblem(grade));
    }
    setProblems(newProblems);
  }, [grade]);

  const generateProblem = (g: GradeLevel): MathProblem => {
    const type = Math.random();
    let q = "";
    let a: number | string = 0;
    
    // Helper to get random int
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    if (g === 1) {
      // Grade 1: Add/Sub within 20
      if (type > 0.5) {
        const x = rand(1, 10);
        const y = rand(1, 10);
        q = `${x} + ${y} = ?`;
        a = x + y;
      } else {
        const x = rand(5, 15);
        const y = rand(1, x); // Ensure positive result
        q = `${x} - ${y} = ?`;
        a = x - y;
      }
    } else if (g === 2) {
      // Grade 2: Add/Sub within 100
      if (type > 0.5) {
        const x = rand(10, 50);
        const y = rand(10, 40);
        q = `${x} + ${y} = ?`;
        a = x + y;
      } else {
        const x = rand(20, 99);
        const y = rand(10, x);
        q = `${x} - ${y} = ?`;
        a = x - y;
      }
    } else if (g === 3) {
      // Grade 3: Multiplication (1-9) and simple division
      if (type > 0.3) {
        const x = rand(2, 9);
        const y = rand(2, 9);
        q = `${x} × ${y} = ?`;
        a = x * y;
      } else {
        // Simple division (exact)
        const y = rand(2, 9);
        const ans = rand(2, 9);
        const x = y * ans;
        q = `${x} ÷ ${y} = ?`;
        a = ans;
      }
    } else if (g === 4) {
      // Grade 4: Larger Multi/Div, Mixed
      if (type > 0.6) {
        const x = rand(11, 20);
        const y = rand(2, 9);
        q = `${x} × ${y} = ?`;
        a = x * y;
      } else if (type > 0.3) {
         const x = rand(50, 200);
         const y = rand(10, 50);
         q = `${x} + ${y} = ?`;
         a = x + y;
      } else {
        const x = rand(50, 100);
        const y = rand(10, 40);
        q = `${x} - ${y} = ?`;
        a = x - y;
      }
    } else {
      // Grade 5-6: Mixed operations, Brackets logic (simplified visual)
      const op = rand(0, 3);
      if (op === 0) { // x * y + z
        const x = rand(2, 9);
        const y = rand(2, 9);
        const z = rand(1, 20);
        q = `${x} × ${y} + ${z} = ?`;
        a = x * y + z;
      } else if (op === 1) { // (x + y) * z
        const x = rand(2, 10);
        const y = rand(2, 10);
        const z = rand(2, 5);
        q = `(${x} + ${y}) × ${z} = ?`;
        a = (x + y) * z;
      } else { // Big numbers
         const x = rand(100, 500);
         const y = rand(50, 200);
         const isPlus = Math.random() > 0.5;
         q = isPlus ? `${x} + ${y} = ?` : `${x} - ${y} = ?`;
         a = isPlus ? x + y : x - y;
      }
    }

    // Generate wrong options
    const correct = Number(a);
    let options = new Set<number>();
    options.add(correct);
    
    while (options.size < 3) {
      let offset = rand(1, 5); // small mistake
      if (Math.random() > 0.5) offset = rand(10, 20); // big mistake
      const wrong = Math.random() > 0.5 ? correct + offset : correct - offset;
      if (wrong >= 0) options.add(wrong); // Keep positive for simplicity usually
    }

    return {
      question: q,
      answer: a,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
  };

  const handleAnswer = (val: number | string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(val);

    const isCorrect = val === problems[currentIndex].answer;

    if (isCorrect) {
      setFeedback('correct');
      playSFX('correct');
      setScore(s => s + 10 + combo * 2); // Bonus for combo
      setCombo(c => c + 1);
      
      confetti({
        particleCount: 30 + (combo * 10),
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#4ECDC4', '#FFD166']
      });
    } else {
      setFeedback('wrong');
      playSFX('wrong');
      setCombo(0);
    }

    // Auto next
    setTimeout(() => {
      if (currentIndex < problems.length - 1) {
        setCurrentIndex(c => c + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        playSFX('win');
        onFinish();
      }
    }, 1200);
  };

  if (problems.length === 0) return <div>Loading Math...</div>;

  const currentP = problems[currentIndex];

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <div className="flex flex-col items-center">
             <h2 className="text-2xl font-black text-blue-600 italic tracking-wider">
               🚀 急速快算
            </h2>
            {combo > 1 && (
                <span className="text-orange-500 font-black text-sm animate-bounce">
                    🔥 {combo} 連擊!
                </span>
            )}
        </div>
        <div className="text-xl font-black bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full shadow-sm">
          {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex) / problems.length) * 100}%` }}
          ></div>
      </div>

      {/* Problem Card */}
      <div className={`
        bg-white rounded-3xl shadow-xl p-10 text-center mb-8 border-b-8 border-blue-200
        transform transition-all duration-300
        ${feedback === 'correct' ? 'border-green-400 bg-green-50 scale-105' : ''}
        ${feedback === 'wrong' ? 'border-red-400 bg-red-50 animate-shake' : ''}
      `}>
        <div className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Question {currentIndex + 1}</div>
        <div className="text-5xl font-mono font-bold text-gray-800 tracking-wider">
          {currentP.question}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-4">
        {currentP.options.map((opt, idx) => {
           let btnClass = "bg-white text-gray-700 hover:bg-blue-50 hover:-translate-y-1 border-b-4 border-gray-200";
           
           if (isAnswered) {
               if (opt === currentP.answer) {
                   btnClass = "bg-green-500 text-white border-green-700 border-b-4";
               } else if (opt === selectedOption) {
                   btnClass = "bg-red-500 text-white border-red-700 border-b-4";
               } else {
                   btnClass = "bg-gray-100 text-gray-300 border-gray-100 opacity-50";
               }
           }

           return (
            <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                disabled={isAnswered}
                className={`
                    py-6 rounded-2xl text-3xl font-bold font-mono shadow-md transition-all duration-200
                    ${btnClass}
                    active:scale-95 active:border-b-0 active:translate-y-1
                `}
            >
                {opt}
            </button>
           );
        })}
      </div>
    </div>
  );
};
