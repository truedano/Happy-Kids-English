
import React from 'react';
import { GradeLevel } from '../types';
import { FINANCE_TOPICS } from '../data/financeTopics';
import { playSFX } from '../services/audioService';

interface FinanceTopicSelectionProps {
    grade: GradeLevel;
    onSelectTopic: (topic: string) => void;
    onBack: () => void;
}

export const FinanceTopicSelection: React.FC<FinanceTopicSelectionProps> = ({ grade, onSelectTopic, onBack }) => {
    const topics = FINANCE_TOPICS[grade] || [];

    // Determine stage description based on grade
    let stageTitle = "";
    let stageDesc = "";
    if (grade <= 2) {
        stageTitle = "錢幣認識期 (Money Basics)";
        stageDesc = "從認識錢幣開始，建立正確的儲蓄與消費基礎！";
    } else if (grade <= 4) {
        stageTitle = "觀念建立期 (Finance Concepts)";
        stageDesc = "學習智慧消費與計畫，了解銀行與金錢的流動！";
    } else {
        stageTitle = "理財實踐期 (Financial Literacy)";
        stageDesc = "設計預算並了解投資風險，培養未來小財商！";
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
                <div className="inline-block bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-bold mb-2">
                    {stageTitle}
                </div>
                <h2 className="text-4xl font-bold text-amber-600 mb-4">
                    {grade} 年級兒童理財
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
                        className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-amber-500 hover:bg-amber-50 hover:scale-[1.02] hover:shadow-lg transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-700 group-hover:text-amber-700">
                                {topic}
                            </span>
                            <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                💰
                            </span>
                        </div>
                    </button>
                ))}

                {/* Surprise Me Option */}
                <button
                    onClick={() => { playSFX('click'); onSelectTopic("Surprise Me"); }}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-2xl shadow-md border-l-8 border-amber-700 hover:brightness-110 hover:scale-[1.02] transition-all text-left group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">
                            💎 給我一個理財驚喜 (Surprise Me)
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
