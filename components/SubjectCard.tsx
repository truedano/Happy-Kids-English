
import React from 'react';

interface SubjectCardProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ title, subtitle, icon, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${color} 
        w-full p-6 rounded-[2rem] shadow-xl border-b-8 border-black/10
        flex flex-col items-center justify-center 
        transform transition-all duration-300 
        hover:scale-105 hover:-translate-y-2 active:scale-95 active:border-b-0 active:translate-y-2
        group
        text-left
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

      <div className="z-10 flex flex-col items-center">
        <span className="text-7xl mb-4 filter drop-shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
          {icon}
        </span>
        <h3 className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-sm">
          {title}
        </h3>
        <p className="text-white/90 font-bold text-lg">
          {subtitle}
        </p>
      </div>
      
      <div className="mt-6 bg-white/20 px-6 py-2 rounded-full text-white font-bold text-sm backdrop-blur-sm group-hover:bg-white group-hover:text-current transition-colors">
        開始學習 Start ➜
      </div>
    </button>
  );
};
