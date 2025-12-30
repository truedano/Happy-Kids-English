
import { GoogleGenAI, Type } from "@google/genai";
import { GradeLevel, LessonData, Subject } from "../types";
import { getStoredApiKey } from "./apiKeyManager";

export const GEMINI_MODEL = 'gemini-3-flash-preview';

const getGeminiClient = () => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("API Key 未設定，請先在設定中輸入您的 Gemini API Key");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLessonForGrade = async (
  grade: GradeLevel,
  subject: Subject,
  questionCount: number = 5,
  specificTopic?: string
): Promise<LessonData | null> => {
  const ai = getGeminiClient();

  let subjectPrompt = "";

  // Randomness directive to be included in all prompts
  const randomnessDirective = "IMPORTANT: Every time this request is made, you MUST generate a UNIQUE set of items. Do not repeat the same words, examples, or questions from previous iterations of this topic. Be creative and vary the content extensively.";

  if (subject === 'ENGLISH') {
    let levelDesc = "";
    if (grade <= 2) levelDesc = "Beginner (A1). Concrete nouns, basic verbs, colors, numbers.";
    else if (grade <= 4) levelDesc = "Elementary (A1-A2). Daily routines, school, weather.";
    else levelDesc = "Intermediate (A2). Past tense, future plans, expressing feelings.";

    let selectedTopic = specificTopic || "";
    let themeInstruction = "";

    if (!selectedTopic || selectedTopic === "Surprise Me") {
      themeInstruction = `Task: First, invent a creative, fun, and engaging theme suitable for Grade ${grade} kids. Then create the lesson based on that theme.`;
    } else {
      themeInstruction = `Scenario/Theme: "${selectedTopic}".`;
    }

    subjectPrompt = `
      Subject: English Learning. Target Audience: Grade ${grade} (${levelDesc}). ${themeInstruction}
      ${randomnessDirective}
      Tasks:
      1. Catchy title. 
      2. Select exactly ${questionCount} vocabulary words. 
      3. Create exactly ${questionCount} multiple-choice questions (MCQs).
      'word': English. 'chinese': Traditional Chinese. 'partOfSpeech': n, v, adj. 'exampleSentence': Simple English. 'exampleTranslation': Chinese.
    `;

  } else if (subject === 'MATH') {
    let mathTopic = specificTopic || "";
    let mathInstruction = "";

    if (!mathTopic || mathTopic === "Surprise Me") {
      mathInstruction = `Task: Select a creative and appropriate mathematical topic for Grade ${grade} students in the Taiwan curriculum. Then generate the lesson items.`;
    } else {
      mathInstruction = `Topic: "${mathTopic}".`;
    }

    subjectPrompt = `
      Subject: Mathematics (Primary School Math for Taiwan). Grade: ${grade}. ${mathInstruction}
      ${randomnessDirective}
      Tasks:
      1. 'vocabulary': Define exactly ${questionCount} key math concepts or terms. Use different numbers and contexts each time.
         - 'word': Concept Name in Traditional Chinese.
         - 'chinese': Simple definition for kids.
         - 'partOfSpeech': '數學觀念'.
         - 'exampleSentence': Formula or Equation.
         - 'exampleTranslation': Step-by-step explanation.
      2. 'quiz': Create exactly ${questionCount} word problems. Detailed explanations required. Vary the story scenarios.
    `;

  } else if (subject === 'WRITING') {
    let writingTopic = specificTopic || "Creative Writing";
    if (writingTopic === "Surprise Me") writingTopic = grade <= 2 ? "看圖說話" : (grade <= 4 ? "創意修辭" : "議論文練習");

    subjectPrompt = `
      Subject: Chinese Composition. Grade: ${grade}. Skill: "${writingTopic}".
      ${randomnessDirective}
      Tasks:
      1. 'vocabulary': Teach exactly ${questionCount} techniques/idioms. Vary the selection of idioms and sentences.
         - 'word': Technique name (e.g., 譬喻法).
         - 'partOfSpeech': '寫作技巧'.
         - 'chinese': Simple definition.
         - 'exampleSentence': A short example sentence using the technique.
         - 'exampleTranslation': Analysis of why it's good.
      2. 'quiz': Create exactly ${questionCount} MCQs identifying techniques or improving sentences.
    `;
  } else if (subject === 'SCIENCE') {
    let scienceTopic = specificTopic || "General Science";
    if (scienceTopic === "Surprise Me") scienceTopic = grade <= 2 ? "生活中的科學" : (grade <= 4 ? "磁鐵與電" : "簡單機械");

    subjectPrompt = `
      Subject: Natural Science (Primary School for Taiwan). Grade: ${grade}. Topic: "${scienceTopic}".
      ${randomnessDirective}
      
      SPECIAL REQUIREMENT for Science:
      - The 'vocabulary' items should ideally be categorizable into 2-3 groups.
      - Put the group name in 'partOfSpeech' (e.g., "導體", "絕緣體").
      - If the topic is a process, order the items chronologically.
      
      Tasks:
      1. 'vocabulary': Teach EXACTLY ${questionCount} concepts/phenomena. Use fresh examples of experiments or observations.
         - 'word': The Term (Traditional Chinese).
         - 'partOfSpeech': The Category/Group (Traditional Chinese).
         - 'chinese': Simple definition.
         - 'exampleSentence': A related fact, observation, or simple formula.
         - 'exampleTranslation': Detailed scientific explanation or "Why it happens".
      2. 'quiz': Create EXACTLY ${questionCount} scenario-based MCQs. Vary the scientific problems presented.
    `;
  }

  const prompt = `
    ${subjectPrompt}
    Output JSON format only. Use Traditional Chinese (繁體中文).
    IMPORTANT: You MUST generate exactly ${questionCount} items for the 'vocabulary' array AND exactly ${questionCount} items for the 'quiz' array.
    Format must strictly match the responseSchema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 1.0, // Maximum randomness for creative variety
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            chineseTopic: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  emoji: { type: Type.STRING },
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
