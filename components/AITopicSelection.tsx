
import React from 'react';
import { GradeLevel } from '../types';
import { AI_TOPICS } from '../data/aiTopics';
import { playSFX } from '../services/audioService';

interface AITopicSelectionProps {
    grade: GradeLevel;
    onSelectTopic: (topic: string) => void;
    onBack: () => void;
}

export const AITopicSelection: React.FC<AITopicSelectionProps> = ({ grade, onSelectTopic, onBack }) => {
    const topics = AI_TOPICS[grade] || [];

    // Determine stage description based on grade
    let stageTitle = "";
    let stageDesc = "";
    if (grade <= 2) {
        stageTitle = "AI 啟蒙期 (AI Discovery)";
        stageDesc = "從身邊的 AI 開始，探索機器人的奇妙世界！";
    } else if (grade <= 4) {
        stageTitle = "觀念建立期 (AI Literacy)";
        stageDesc = "了解機器如何學習，揭開人工智慧的神秘面紗！";
    } else {
        stageTitle = "探索與倫理期 (AI Exploration & Ethics)";
        stageDesc = "學習生成指令與倫理，成為未來的 AI 小達人！";
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-6 animate-fade-in-up">
            <button
                onClick={() => { playSFX('click'); onBack(); }}
                className="mb-8 text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2 transition-colors"
            >
                ⬅️ 重選年級 (Back to Grades)
            </button>

            <div className="text-center mb-10">
                <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold mb-2">
                    {stageTitle}
                </div>
                <h2 className="text-4xl font-bold text-indigo-600 mb-4">
                    {grade} 年級 AI 智慧課程
                </h2>
                <p className="text-xl text-gray-500">
                    {stageDesc}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-10">
                {topics.map((topic, idx) => (
                    <button
                        key={idx}
                        onClick={() => { playSFX('click'); onSelectTopic(topic); }}
                        className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-indigo-500 hover:bg-indigo-50 hover:scale-[1.02] hover:shadow-lg transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-700 group-hover:text-indigo-700">
                                {topic}
                            </span>
                            <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                🤖
                            </span>
                        </div>
                    </button>
                ))}

                {/* Surprise Me Option */}
                <button
                    onClick={() => { playSFX('click'); onSelectTopic("Surprise Me"); }}
                    className="bg-gradient-to-r from-indigo-400 to-purple-500 p-6 rounded-2xl shadow-md border-l-8 border-indigo-700 hover:brightness-110 hover:scale-[1.02] transition-all text-left group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">
                            ✨ 給我一個 AI 驚喜 (Surprise Me)
                        </span>
                        <span className="text-2xl text-white">
                            🎲
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};
