
import { GoogleGenAI, Type } from "@google/genai";
import { GradeLevel, LessonData, Subject } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateLessonForGrade = async (
  grade: GradeLevel, 
  subject: Subject, 
  questionCount: number = 5,
  specificTopic?: string // New optional parameter
): Promise<LessonData | null> => {
  const ai = getGeminiClient();

  // Define prompts based on Subject
  let subjectPrompt = "";
  
  if (subject === 'ENGLISH') {
    let levelDesc = "";
    if (grade <= 2) levelDesc = "Beginner (A1). Concrete nouns, basic verbs, colors, numbers.";
    else if (grade <= 4) levelDesc = "Elementary (A1-A2). Daily routines, school, weather.";
    else levelDesc = "Intermediate (A2). Past tense, future plans, expressing feelings.";

    const categories = [
      "Fantasy & Magic", "Science & Space", "Animals & Nature", "Adventure & Mystery",
      "Daily Life & Fun", "Hobbies & Sports", "Food & Cooking", "Travel & Places", "Occupations"
    ];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    subjectPrompt = `
      Subject: English Learning (EFL for Taiwan/Hong Kong kids).
      Target Audience: Grade ${grade} (${levelDesc}).
      Category: "${randomCategory}".
      
      Tasks:
      1. Create a fun topic title.
      2. Select ${questionCount} vocabulary words.
      3. Create ${questionCount} multiple-choice questions testing these words.
      
      Format Requirements:
      - 'word': The English word.
      - 'chinese': Traditional Chinese meaning.
      - 'partOfSpeech': e.g., n., v., adj.
      - 'exampleSentence': Simple English sentence using the word.
      - 'exampleTranslation': Chinese translation of the sentence.
      - 'emoji': A relevant emoji.
    `;

  } else if (subject === 'MATH') {
    // If specificTopic is provided, use it. Otherwise fall back to general topic (legacy behavior)
    let mathTopic = specificTopic || "";
    
    if (!mathTopic) {
        if (grade <= 2) mathTopic = "100以內的加減法, 認識圖形";
        else if (grade <= 4) mathTopic = "九九乘法表, 除法基礎, 分數";
        else mathTopic = "小數運算, 因數與倍數, 幾何圖形";
    }

    const mathThemes = ["太空探險", "超級英雄市場", "動物園派對", "魔法學院", "海底世界", "恐龍公園"];
    const theme = mathThemes[Math.floor(Math.random() * mathThemes.length)];

    subjectPrompt = `
      Subject: Mathematics (Primary School Math for Taiwan).
      Target Audience: Grade ${grade}.
      Language: Traditional Chinese (繁體中文).
      Specific Syllabus Topic: "${mathTopic}".
      Theme: ${theme} (Use this theme to make word problems fun!).
      
      Tasks:
      1. Choose a sub-concept within the syllabus topic "${mathTopic}".
      2. 'vocabulary': Define ${questionCount} key math concepts or formulas related to "${mathTopic}".
         - 'word': The Concept Name in **Traditional Chinese** (e.g., "直角", "分數", "被乘數"). DO NOT use English here.
         - 'chinese': A simple, fun definition in Chinese suitable for kids.
         - 'partOfSpeech': Use '數學觀念'.
         - 'exampleSentence': The Formula, Equation, or a Visual Representation (e.g., "長 × 寬", "90°", "1/2 + 1/2 = 1").
         - 'exampleTranslation': A **detailed step-by-step** explanation in Chinese of how the formula works or a fun fact.
      3. 'quiz': Create ${questionCount} math word problems related to "${mathTopic}" and the theme "${theme}".
         - 'question': The math problem in **Traditional Chinese**. Make it a story! (e.g., "小熊有5個蘋果...")
         - 'chineseTranslation': Leave this empty string "" since the question is already in Chinese.
         - 'explanation': A warm, encouraging, **detailed step-by-step** solution in Chinese. Show the calculation process clearly.
         - 'options': Numbers or Chinese answers.
    `;

  } else if (subject === 'WRITING') {
    // UPDATED: Chinese Composition focus
    let writingFocus = "";
    if (grade <= 2) writingFocus = "造句練習, 標點符號運用, 簡單的譬喻(像...), 連接詞(因為...所以...), 觀察力培養";
    else if (grade <= 4) writingFocus = "段落結構(起頭/結尾), 常見成語運用, 排比法, 擬人法, 記敘文(人/事/物)";
    else writingFocus = "高級修辭(誇飾/借代), 起承轉合架構, 議論文基礎, 抒情文技巧, 豐富的形容詞";

    subjectPrompt = `
      Subject: Chinese Composition (中文寫作/國語文) for Taiwan Elementary Students.
      Target Audience: Grade ${grade}.
      Language: Traditional Chinese (繁體中文).
      Focus Areas: ${writingFocus}.
      
      Tasks:
      1. Choose a specific writing skill topic (e.g., "如何讓文章更生動", "神奇的成語", "標點符號大冒險", "描寫人物的技巧").
      2. 'vocabulary': Teach ${questionCount} writing techniques, idioms (成語), or rhetorical devices (修辭).
         - 'word': The Technique or Idiom in **Traditional Chinese** (e.g., "譬喻法", "開門見山法", "成語: 車水馬龍").
         - 'chinese': A simple explanation of the technique/idiom.
         - 'partOfSpeech': Use '寫作技巧' or '成語'.
         - 'exampleSentence': An excellent example sentence using this technique/idiom in Chinese.
         - 'exampleTranslation': Analysis/Tip: Explain *why* this sentence is good or how the technique works (in Chinese).
         - 'emoji': A relevant emoji.
      3. 'quiz': Create ${questionCount} multiple-choice questions testing these skills.
         - 'question': A question about usage, identifying the rhetoric, or filling in the blank with the correct idiom.
         - 'chineseTranslation': Leave empty string "" as it is all Chinese.
         - 'explanation': Educational explanation of the correct answer.
         - 'options': Chinese answers.
    `;
  }

  const prompt = `
    ${subjectPrompt}
    
    Output JSON format only.
    Use Traditional Chinese (繁體中文) for translations/explanations.
    The 'explanation' in the quiz should be encouraging and educational.
    Ensure strict JSON validity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "Topic title" },
            chineseTopic: { type: Type.STRING, description: "Chinese topic title" },
            vocabulary: {
              type: Type.ARRAY,
              description: `List of ${questionCount} learning items`,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  emoji: { type: Type.STRING, description: "Relevant emoji" },
                  partOfSpeech: { type: Type.STRING },
                  chinese: { type: Type.STRING },
                  exampleSentence: { type: Type.STRING },
                  exampleTranslation: { type: Type.STRING }
                },
                required: ["word", "emoji", "partOfSpeech", "chinese", "exampleSentence", "exampleTranslation"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              description: `List of ${questionCount} questions`,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  chineseTranslation: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctAnswer", "chineseTranslation", "explanation"],
              },
            },
          },
          required: ["topic", "chineseTopic", "vocabulary", "quiz"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as LessonData;
    }
    return null;
  } catch (error) {
    console.error("Error generating lesson:", error);
    return null;
  }
};
