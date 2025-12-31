
export enum GradeLevel {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6
}

export type Subject = 'ENGLISH' | 'MATH' | 'WRITING' | 'SCIENCE' | 'FINANCE';

export interface VocabularyItem {
  word: string; // The English word OR Math Term OR Writing Technique OR Scientific Concept OR Finance Concept
  emoji: string; // Visual cue
  partOfSpeech: string; // (n.) (v.) OR (Math Category) OR (Scientific Category/Principle) OR (Finance Category)
  chinese: string; // Chinese meaning / Explanation
  exampleSentence: string; // Simple example / Formula / Experiment outcome
  exampleTranslation: string; // Translation / Detailed explanation
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  chineseTranslation: string; // Or Hint
  explanation: string;
}

export interface WrongAnswer {
  quizItem: QuizItem;
  selectedAnswer: string;
}

export interface LessonData {
  topic: string; // e.g., "At the Zoo" or "Multiplication"
  chineseTopic: string;
  vocabulary: VocabularyItem[];
  quiz: QuizItem[];
}

export interface AppState {
  currentSubject: Subject | null; // Track selected subject
  currentGrade: GradeLevel | null;
  lessonData: LessonData | null;
  isLoading: boolean;
  gameStatus: 'MENU' | 'SUBJECT_SELECTION' | 'MATH_TOPIC_SELECTION' | 'ENGLISH_TOPIC_SELECTION' | 'WRITING_TOPIC_SELECTION' | 'SCIENCE_TOPIC_SELECTION' | 'FINANCE_TOPIC_SELECTION' | 'STUDY' | 'GAME_SELECTION' | 'GAME_MATCHING' | 'GAME_SPELLING' | 'GAME_WORD_SCRAMBLE' | 'GAME_MATH_CHALLENGE' | 'GAME_NUMBER_PUZZLE' | 'GAME_GEOMETRY_BUILDER' | 'GAME_SENTENCE_BUILDER' | 'GAME_IDIOM_DOJO' | 'GAME_SCIENCE_SORT' | 'GAME_SCIENCE_CYCLE' | 'PLAYING' | 'FINISHED';
  score: number;
  currentQuestionIndex: number;
  wrongAnswers: WrongAnswer[];
}
