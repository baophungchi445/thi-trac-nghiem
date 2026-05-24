export type AnswerKey = "A" | "B" | "C" | "D";

export type Question = {
  id: number;
  question: string;
  options: Record<AnswerKey, string>;
  answer: AnswerKey;
};

export type Subject = {
  id: string;
  label: string;
  icon: string;
  count: number;
  questions: Question[];
};
