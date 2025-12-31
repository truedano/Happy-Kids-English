
import { GradeLevel } from '../types';

export const AI_TOPICS: Record<number, string[]> = {
    [GradeLevel.ONE]: [
        "生活中哪裡有 AI (Where is AI in our life?)",
        "機器人是怎麼看世界的 (How Robots See the World?)",
        "認識我的 AI 小助手 (Meet My AI Assistant)",
        "AI 畫畫家 (AI the Painter)"
    ],
    [GradeLevel.TWO]: [
        "超級大腦：認識人工智慧 (Super Brain: What is AI?)",
        "聽話的聲控玩具 (Voice-Controlled Magic)",
        "AI 幫我選圖畫 (How AI Picks Pictures)",
        "機器人會說話嗎？ (Can Robots Talk?)"
    ],
    [GradeLevel.THREE]: [
        "機器是怎麼學習的 (How Machines Learn)",
        "圖形辨識大挑戰 (Image Recognition Challenge)",
        "AI 的分類小遊戲 (AI Sorting Games)",
        "電腦也有感官嗎？ (Do Computers Have Senses?)"
    ],
    [GradeLevel.FOUR]: [
        "大數據是什麼？ (What is Big Data?)",
        "AI 建議是怎麼來的 (How AI Makes Recommendations)",
        "與聊天機器人對話 (Chatting with Chatbots)",
        "人臉辨識的秘密 (Secrets of Face Recognition)"
    ],
    [GradeLevel.FIVE]: [
        "生成式 AI 的魔力 (The Magic of Generative AI)",
        "給 AI 的點子指令學 (The Art of Prompting)",
        "AI 的對與錯：科技倫理 (AI Ethics: Right or Wrong)",
        "深偽技術：眼見不一定為憑 (Deepfakes: Seeing is Not Believing)"
    ],
    [GradeLevel.SIX]: [
        "未來的 AI 夥伴 (Our Future AI Partners)",
        "AI 程式設計入門 (Introduction to AI Programming)",
        "演算法的公平性 (Algorithmic Fairness)",
        "AI 與我未來的職業 (AI and My Future Career)"
    ]
};
