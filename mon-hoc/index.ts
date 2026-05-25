import { giaoDucChinhTriQuestions } from "./hoc-ki-1/giao-duc-chinh-tri";
import { phapLuatQuestions } from "./hoc-ki-1/phap-luat";
import { tiengAnhQuestions } from "./hoc-ki-1/tieng-anh";
import { tinHocQuestions } from "./hoc-ki-1/tin-hoc";

export type { AnswerKey, Question, Subject, Semester } from "./types";

export const SEMESTERS = [
  {
    id: "hoc-ki-1",
    label: "Học kì 1",
    subjects: [
      {
        id: "giao-duc-chinh-tri",
        label: "Giáo dục Chính trị",
        icon: "🎓",
        count: giaoDucChinhTriQuestions.length,
        questions: giaoDucChinhTriQuestions
      },
      {
        id: "phap-luat",
        label: "Pháp luật",
        icon: "⚖️",
        count: phapLuatQuestions.length,
        questions: phapLuatQuestions
      },
      {
        id: "tin-hoc",
        label: "Tin học",
        icon: "💻",
        count: tinHocQuestions.length,
        questions: tinHocQuestions
      },
      {
        id: "tieng-anh",
        label: "Tiếng Anh",
        icon: "🗣️",
        count: tiengAnhQuestions.length,
        questions: tiengAnhQuestions
      }
       
    ]
  }
];

export const SUBJECTS = SEMESTERS.flatMap(s => s.subjects);
