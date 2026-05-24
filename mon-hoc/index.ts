import giaoDucChinhTriQuestions from "./giao-duc-chinh-tri";
import type { Subject } from "./types";

export type { AnswerKey, Question, Subject } from "./types";

export const SUBJECTS: Subject[] = [
  {
    id: "giao-duc-chinh-tri",
    label: "Giáo dục Chính trị",
    icon: "📚",
    count: giaoDucChinhTriQuestions.length,
    questions: giaoDucChinhTriQuestions
  }
];
