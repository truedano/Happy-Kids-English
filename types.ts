export enum GradeLevel {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6
}

export interface VocabularyItem {
  word: string; // The English word or phrase
  emoji: string; // Visual cue
  partOfSpeech: string; // (n.) (v.) (adj.)
  chinese: string; // Chinese meaning
  exampleSentence: string; // Simple example
  exampleTranslation: string; // Translation of example
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  chineseTranslation: string;
  explanation: string;
}

export interface WrongAnswer {
  quizItem: QuizItem;
  selectedAnswer: string;
}

export interface LessonData {
  topic: string; // e.g., "At the Zoo"
  chineseTopic: string; // e.g., "在動物園"
  vocabulary: VocabularyItem[];
  quiz: QuizItem[];
}

export interface AppState {
  currentGrade: GradeLevel | null;
  lessonData: LessonData | null;
  isLoading: boolean;
  // Add new game modes here
  gameStatus: 'MENU' | 'STUDY' | 'GAME_SELECTION' | 'GAME_MATCHING' | 'GAME_SPELLING' | 'GAME_SPEAKING' | 'PLAYING' | 'FINISHED';
  score: number;
  currentQuestionIndex: number;
  wrongAnswers: WrongAnswer[]; // Store wrong answers for review
}