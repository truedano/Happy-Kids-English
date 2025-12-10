
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playSFX } from '../services/audioService';

interface GeometryBuilderGameProps {
  onFinish: () => void;
  onExit: () => void;
}

// Points are percentages of width/height (0-100)
interface Shape {
  name: string;
  points: {x: number, y: number}[];
}

const SHAPES: Shape[] = [
  { 
    name: "三角形 (Triangle)", 
    points: [{x: 50, y: 20}, {x: 80, y: 80}, {x: 20, y: 80}] 
  },
  { 
    name: "正方形 (Square)", 
    points: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 75, y: 75}, {x: 25, y: 75}] 
  },
  { 
    name: "梯形 (Trapezoid)", 
    points: [{x: 35, y: 30}, {x: 65, y: 30}, {x: 80, y: 80}, {x: 20, y: 80}] 
  },
  { 
    name: "五邊形 (Pentagon)", 
    points: [{x: 50, y: 15}, {x: 90, y: 45}, {x: 75, y: 85}, {x: 25, y: 85}, {x: 10, y: 45}] 
  },
];

export const GeometryBuilderGame: React.FC<GeometryBuilderGameProps> = ({ onFinish, onExit }) => {
  const [level, setLevel] = useState(0);
  const [userPoints, setUserPoints] = useState<number[]>([]); // Indices of points clicked in order
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentShape = SHAPES[level];

  useEffect(() => {
    // Reset for new level
    setUserPoints([]);
    drawCanvas([]);
  }, [level]);

  useEffect(() => {
    drawCanvas(userPoints);
  }, [userPoints]);

  const drawCanvas = (pointsIndices: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw Grid background (Blueprint style)
    ctx.strokeStyle = '#e0f2fe'; // Light sky blue
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Draw lines connecting user points
    if (pointsIndices.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#0284c7'; // Sky 600
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const startP = currentShape.points[pointsIndices[0]];
      ctx.moveTo(startP.x / 100 * w, startP.y / 100 * h);

      for (let i = 1; i < pointsIndices.length; i++) {
        const p = currentShape.points[pointsIndices[i]];
        ctx.lineTo(p.x / 100 * w, p.y / 100 * h);
      }
      
      // If completed (looped back to start), close the path
      if (pointsIndices.length === currentShape.points.length + 1) {
         ctx.closePath();
         ctx.fillStyle = 'rgba(14, 165, 233, 0.2)'; // Fill with transparent blue
         ctx.fill();
      }
      ctx.stroke();
    }

    // Draw Target Points
    currentShape.points.forEach((p, idx) => {
      const px = p.x / 100 * w;
      const py = p.y / 100 * h;

      const isClicked = pointsIndices.includes(idx);
      const isNext = !isClicked && (
        (pointsIndices.length === 0 && idx === 0) || // Simple logic: enforce 0 -> 1 -> 2 ...
        (pointsIndices.length > 0 && idx === pointsIndices[pointsIndices.length - 1] + 1) ||
        // Allow loop back to 0 at end
        (pointsIndices.length === currentShape.points.length && idx === 0)
      );

      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fillStyle = isClicked ? '#0ea5e9' : '#bae6fd'; // Darker blue if clicked
      if (isNext) {
        ctx.fillStyle = '#facc15'; // Yellow for next target
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#facc15';
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Label 1, 2, 3...
      ctx.fillStyle = isNext ? '#854d0e' : 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((idx + 1).toString(), px, py);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Scale factor is critical when canvas CSS size != attribute size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const w = canvas.width;
    const h = canvas.height;

    // Check distance to any point
    // Logic: Must click points in order 0 -> 1 -> 2 -> ... -> 0
    const nextExpectedIndex = userPoints.length;
    const targetPointIndex = nextExpectedIndex === currentShape.points.length ? 0 : nextExpectedIndex;

    const targetP = currentShape.points[targetPointIndex];
    const tx = targetP.x / 100 * w;
    const ty = targetP.y / 100 * h;
    
    const dist = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);

    if (dist < 30) { // Hit radius (internal pixels)
      playSFX('click');
      const newPoints = [...userPoints, targetPointIndex];
      setUserPoints(newPoints);

      // Check win condition: We have visited all points AND returned to 0
      if (newPoints.length === currentShape.points.length + 1) {
        handleLevelComplete();
      }
    } else {
       // Optional: play error sound if clicking wrong point
    }
  };

  const handleLevelComplete = () => {
    playSFX('correct');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0EA5E9', '#FACC15']
    });

    setTimeout(() => {
      if (level < SHAPES.length - 1) {
        setLevel(l => l + 1);
        playSFX('win');
      } else {
        onFinish();
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { playSFX('click'); onExit(); }} className="text-gray-500 hover:text-red-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
          ✕ 離開
        </button>
        <h2 className="text-2xl font-black text-sky-600 tracking-wider">
          📐 形狀建築師 (Builder)
        </h2>
        <div className="bg-sky-100 text-sky-700 px-4 py-1 rounded-full font-bold">
          關卡 {level + 1} / {SHAPES.length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-xl border-b-8 border-sky-100 relative">
        <h3 className="text-center text-xl font-bold text-gray-700 mb-4">
          畫出：{currentShape.name}
        </h3>
        <canvas 
          ref={canvasRef}
          width={400} 
          height={400} 
          onClick={handleCanvasClick}
          className="w-full h-auto rounded-xl bg-sky-50 cursor-crosshair touch-none"
        />
        <p className="text-center text-gray-400 mt-4 text-sm font-bold">
          請依照順序點擊數字 (1 ➜ 2 ➜ 3...) 來畫出形狀！
        </p>
      </div>
    </div>
  );
};
