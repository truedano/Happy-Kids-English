import { GoogleGenAI, Type } from "@google/genai";
import { GradeLevel, LessonData } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateLessonForGrade = async (grade: GradeLevel, questionCount: number = 5): Promise<LessonData | null> => {
  const ai = getGeminiClient();

  // 1. Determine constraints based on grade
  let levelDesc = "";
  if (grade <= 2) levelDesc = "Beginner (A1). Focus on concrete nouns, basic verbs, colors, numbers. Very short sentences.";
  else if (grade <= 4) levelDesc = "Elementary (A1-A2). Daily routines, school, weather, simple present/continuous tense.";
  else levelDesc = "Intermediate (A2). Past tense, future plans, expressing feelings, complex sentences.";

  // 2. Randomly select a broad category to ensure diversity
  const categories = [
    "Fantasy & Magic (e.g., Wizards, Dragons, Fairy Tales, Magic Potions)",
    "Science & Space (e.g., Planets, Robots, Inventions, Aliens, Future)",
    "Animals & Nature (e.g., Jungle, Ocean, Pets, Dinosaurs, Insects)",
    "Adventure & Mystery (e.g., Treasure Hunt, Detective, Camping, Survival)",
    "Daily Life & Fun (e.g., Playground, Shopping, Birthday Party, Amusement Park)",
    "Hobbies & Sports (e.g., Soccer, Drawing, Music, Video Games, Dance)",
    "Food & Cooking (e.g., Bakery, Pizza Party, Night Market, Ice Cream Shop)",
    "Travel & Places (e.g., Airport, Beach, Big City, Farm, Zoo)",
    "Occupations & Dreams (e.g., Doctor, Firefighter, Artist, YouTuber, Astronaut)"
  ];
  
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  const prompt = `
    Create a fun, interactive mini-lesson for a Grade ${grade} elementary student in Taiwan/Hong Kong.
    Level: ${levelDesc}.
    
    1. Topic Selection:
       - The category is: "${randomCategory}".
       - Create a specific, CREATIVE, and ENGAGING topic title based on this category.
       - Make it fun for kids! Avoid boring, standard textbook titles. (e.g., instead of "Animals", use "Dinosaur Detective" or "The Magic Zoo").
       
    2. Content:
       - Select ${questionCount} key vocabulary words or phrases related to this specific topic.
       - Create ${questionCount} multiple-choice quiz questions specifically testing these ${questionCount} vocabulary words.

    Output JSON format only.
    Use Traditional Chinese (繁體中文) for translations.
    The 'explanation' in the quiz should be encouraging.
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
            topic: { type: Type.STRING, description: "English topic title" },
            chineseTopic: { type: Type.STRING, description: "Traditional Chinese topic title" },
            vocabulary: {
              type: Type.ARRAY,
              description: `List of ${questionCount} vocabulary words to teach first`,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  emoji: { type: Type.STRING, description: "A relevant emoji for this word" },
                  partOfSpeech: { type: Type.STRING, description: "e.g., n., v., adj." },
                  chinese: { type: Type.STRING, description: "Meaning in Traditional Chinese" },
                  exampleSentence: { type: Type.STRING, description: "A very simple example sentence using this word" },
                  exampleTranslation: { type: Type.STRING, description: "Chinese translation of the example" }
                },
                required: ["word", "emoji", "partOfSpeech", "chinese", "exampleSentence", "exampleTranslation"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              description: `List of ${questionCount} questions testing the vocabulary above`,
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