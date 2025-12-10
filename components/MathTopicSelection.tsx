
import React from 'react';
import { GradeLevel } from '../types';
import { MATH_SYLLABUS } from '../data/mathSyllabus';
import { playSFX } from '../services/audioService';

interface MathTopicSelectionProps {
  grade: GradeLevel;
  onSelectTopic: (topic: string) => void;
  onBack: () => void;
}

export const MathTopicSelection: React.FC<MathTopicSelectionProps> = ({ grade, onSelectTopic, onBack }) => {
  const topics = MATH_SYLLABUS[grade] || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 animate-fade-in-up">
      <button 
        onClick={() => { playSFX('click'); onBack(); }}
        className="mb-8 text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2 transition-colors"
      >
        ⬅️ 重選年級 (Back to Grades)
      </button>

      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-blue-600 mb-4">
           {grade} 年級數學挑戰
        </h2>
        <p className="text-xl text-gray-500">
          請選擇一個單元來練習！
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic, idx) => (
          <button
            key={idx}
            onClick={() => { playSFX('click'); onSelectTopic(topic); }}
            className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-blue-400 hover:bg-blue-50 hover:scale-[1.02] hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-700 group-hover:text-blue-700">
                {topic}
              </span>
              <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                🚀
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
