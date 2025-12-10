
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSFX } from '../services/audioService';

interface NumberPuzzleGameProps {
  onFinish: () => void;
  onExit: () => void;
}

// Simple 4x4 Sudoku Template (Top-left, Top-right, Bot-left, Bot-right quadrants)
const SOLVED_GRID = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1]
];

export const NumberPuzzleGame: React.FC<NumberPuzzleGameProps> = ({ onFinish, onExit }) => {
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>([]); // Track which cells were pre-filled
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState<boolean[][]>([]); // Track errors for visual feedback
  const [level, setLevel] = useState(1);

  // Initialize a new puzzle
  useEffect(() => {
    generatePuzzle();
  }, [level]);

  const generatePuzzle = () => {
    // 1. Permute numbers (Swap 1 with x, 2 with y...) to create variety
    const map = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
    const newSolved = SOLVED_GRID.map(row => row.map(num => map[num - 1]));

    // 2. Create the playable grid by removing numbers
    // Difficulty: Remove more numbers for higher levels (Level 1: remove 4, Level 2: remove 6, etc)
    const removeCount = 4 + level; 
    
    const newGrid: (number | null)[][] = newSolved.map(row => [...row]);
    const isInitial: boolean[][] = Array(4).fill(null).map(() => Array(4).fill(true));

    let removed = 0;
    while (removed < removeCount) {
      const r = Math.floor(Math.random() * 4);
      const c = Math.floor(Math.random() * 4);
      if (newGrid[r][c] !== null) {
        newGrid[r][c] = null;
        isInitial[r][c] = false;
        removed++;
      }
    }

    setGrid(newGrid);
    setInitialGrid(isInitial);
    setMistakes(Array(4).fill(null).map(() => Array(4).fill(false)));
    setSelectedCell(null);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;

    if (initialGrid[r][c]) return; // Cannot change initial cells

    const newGrid = [...grid];
    newGrid[r] = [...grid[r]];
    newGrid[r][c] = num;
    setGrid(newGrid);
    
    // Clear mistake if changing value
    const newMistakes = [...mistakes];
    newMistakes[r][c] = false;
    setMistakes(newMistakes);

    playSFX('click');
    checkCompletion(newGrid);
  };

  const checkCompletion = (currentGrid: (number | null)[][]) => {
    // Check if full
    let isFull = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === null) {
          isFull = false;
          break;
        }
      }
    }

    if (isFull) {
      if (validateGrid(currentGrid)) {
        playSFX('correct');
        confetti({
           particleCount: 150,
           spread: 70,
           origin: { y: 0.6 },
           colors: ['#4ECDC4', '#FFE66D', '#FF6B6B']
        });
        
        if (level < 3) {
           setTimeout(() => {
             setLevel(l => l + 1);
             playSFX('win');
           }, 1500);
        } else {
           setTimeout(onFinish, 2000);
        }
      } else {
        playSFX('wrong');
        // Mark mistakes
        // For simplicity in this mini-game, we just mark the board as 'shaking' or red
        // Or we could compare against our generated solution (which assumes unique solution, usually true for 4x4)
      }
    }
  };

  const validateGrid = (g: (number | null)[][]) => {
    // Validate rows, cols, and 2x2 blocks
    const isValidSet = (arr: (number | null)[]) => {
      const nums = arr.filter(n => n !== null) as number[];
      return new Set(nums).size === 4;
    };

    // Rows
    for (let r = 0; r < 4; r++) if (!isValidSet(g[r])) return false;
    
    // Cols
    for (let c = 0; c < 4; c++) {
      const col = [g[0][c], g[1][c], g[2][c], g[3][c]];
      if (!isValidSet(col)) return false;
    }

    // Blocks
    for (let br = 0; br < 4; br += 2) {
      for (let bc = 0; bc < 4; bc += 2) {
        const block = [
          g[br][bc], g[br][bc+1],
          g[br+1][bc], g[br+1][bc+1]
        ];
        if (!isValidSet(block)) return false;
      }
    }
    return true;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-black text-indigo-600 tracking-wider">
          🔢 數字拼圖 (Sudoku)
        </h2>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-bold">
          關卡 {level}/3
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border-b-8 border-indigo-100 mb-8">
        <div className="grid grid-cols-4 gap-2 aspect-square max-w-sm mx-auto bg-gray-800 p-2 rounded-xl border-4 border-gray-800">
           {grid.map((row, rIndex) => (
             row.map((cell, cIndex) => {
               // Determine borders for 2x2 blocks visual separation
               const borderR = cIndex === 1 ? 'border-r-4 border-r-gray-800' : '';
               const borderB = rIndex === 1 ? 'border-b-4 border-b-gray-800' : '';
               const isSelected = selectedCell?.[0] === rIndex && selectedCell?.[1] === cIndex;
               const isPreFilled = initialGrid[rIndex][cIndex];

               return (
                 <div 
                   key={`${rIndex}-${cIndex}`}
                   onClick={() => !isPreFilled && setSelectedCell([rIndex, cIndex])}
                   className={`
                     relative flex items-center justify-center text-3xl font-bold rounded-lg cursor-pointer transition-all
                     ${borderR} ${borderB}
                     ${isPreFilled ? 'bg-gray-200 text-gray-800' : 'bg-white text-indigo-600 hover:bg-indigo-50'}
                     ${isSelected ? 'ring-4 ring-yellow-400 z-10 scale-105' : ''}
                   `}
                   style={{ minHeight: '3rem' }}
                 >
                   {cell}
                 </div>
               );
             })
           ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3, 4].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-16 h-16 bg-indigo-500 text-white rounded-2xl text-3xl font-bold shadow-lg border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all hover:bg-indigo-400"
          >
            {num}
          </button>
        ))}
      </div>
      
      <p className="text-center text-gray-400 mt-6 text-sm font-bold">
        填滿格子，讓每一行、每一列和每個 2x2 方塊都有 1、2、3、4！
      </p>
    </div>
  );
};
