import React from 'react';
import { GradeLevel } from '../types';

interface GradeCardProps {
  grade: GradeLevel;
  onClick: (grade: GradeLevel) => void;
  color: string;
}

export const GradeCard: React.FC<GradeCardProps> = ({ grade, onClick, color }) => {
  return (
    <button
      onClick={() => onClick(grade)}
      className={`
        ${color} 
        w-full aspect-square rounded-3xl shadow-lg border-b-8 border-black/10
        flex flex-col items-center justify-center 
        transform transition-all duration-200 
        hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-2
        group
      `}
    >
      <span className="text-6xl mb-2 group-hover:animate-bounce">
        {grade === 1 ? '🐯' : 
         grade === 2 ? '🐰' : 
         grade === 3 ? '🦊' : 
         grade === 4 ? '🦁' : 
         grade === 5 ? '🦄' : '🐲'}
      </span>
      <span className="text-2xl font-bold text-white drop-shadow-md">
        {grade} 年級
      </span>
      <span className="text-white/80 text-sm font-medium">Level {grade}</span>
    </button>
  );
};