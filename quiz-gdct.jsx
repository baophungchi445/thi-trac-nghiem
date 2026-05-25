import React, { useState, useEffect } from "react";
import { SUBJECTS, SEMESTERS } from "./mon-hoc";

function getSubjectIdFromPath() {
  if (typeof window === "undefined") return null;
  const slug = decodeURIComponent(window.location.pathname).replace(/^\/+|\/+$/g, "");
  return SUBJECTS.some(subject => subject.id === slug) ? slug : null;
}

function pushPath(path) {
  if (typeof window === "undefined" || window.location.pathname === path) return;
  window.history.pushState({}, "", path);
}

export default function QuizApp() {
  const [screen, setScreen] = useState(() => getSubjectIdFromPath() ? "subject" : "home"); // home | subject | quiz | result
  const [selectedSubject, setSelectedSubject] = useState(() => getSubjectIdFromPath());
  const [subjectTab, setSubjectTab] = useState("hoc"); // hoc | thi-thu
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [resultFilter, setResultFilter] = useState(null); // null | "wrong" | "blank"
  const [selectedSemester, setSelectedSemester] = useState(() => {
    const subjectId = getSubjectIdFromPath();
    if (!subjectId) return null;
    const sem = SEMESTERS.find(s => s.subjects.some(sub => sub.id === subjectId));
    return sem ? sem.id : null;
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });
  const QUESTIONS_PER_PAGE = 10;

  const selectedSubjectInfo =
    SUBJECTS.find(subject => subject.id === selectedSubject) ?? SUBJECTS[0];
  const questions = selectedSubjectInfo.questions;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
  const blankCount = questions.length - answeredCount;
  const wrongCount = answeredCount - correctCount;
  const score = submitted ? correctCount : 0;
  const scorePct = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, screen, subjectTab]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
    return () => {
      delete document.body.dataset.theme;
    };
  }, [theme]);

  useEffect(() => {
    function syncRoute() {
      const subjectId = getSubjectIdFromPath();
      setAnswers({});
      setSubmitted(false);
      setCurrentPage(0);
      setSelectedSubject(subjectId);
      setSubjectTab("hoc");
      setScreen(subjectId ? "subject" : "home");
    }

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function handleSelect(qId, opt) {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  }

  function openSubject(subjectId) {
    if (!SUBJECTS.some(subject => subject.id === subjectId)) return;
    const sem = SEMESTERS.find(s => s.subjects.some(sub => sub.id === subjectId));
    if (sem) setSelectedSemester(sem.id);
    setSelectedSubject(subjectId);
    setAnswers({});
    setSubmitted(false);
    setCurrentPage(0);
    setSubjectTab("hoc");
    setScreen("subject");
    pushPath(`/${subjectId}`);
  }

  function startQuiz() {
    setAnswers({});
    setSubmitted(false);
    setCurrentPage(0);
    setScreen("quiz");
  }

  function handleSubmit() {
    if (blankCount > 0) {
      if (!window.confirm(`Bạn còn ${blankCount} câu chưa trả lời. Vẫn nộp bài?`)) return;
    }
    setSubmitted(true);
    setScreen("result");
    setCurrentPage(0);
    setResultFilter(null);
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
    setCurrentPage(0);
    setScreen("home");
    setSelectedSubject(null);
    setSelectedSemester(null);
    pushPath("/");
  }

  function backToSubject() {
    setAnswers({});
    setSubmitted(false);
    setCurrentPage(0);
    setScreen("subject");
    setSubjectTab("thi-thu");
  }

  function getOptionClass(q, opt) {
    if (!submitted) {
      return answers[q.id] === opt
        ? "option selected"
        : "option";
    }
    if (opt === q.answer) return "option correct";
    if (answers[q.id] === opt && opt !== q.answer) return "option wrong";
    return "option";
  }

  const progressPct = questions.length
    ? (answeredCount / questions.length) * 100
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0f1117; }
        body[data-theme="light"] { background: #f6f8fc; }

        .app {
          min-height: 100vh;
          background: #0f1117;
          font-family: 'Be Vietnam Pro', sans-serif;
          color: #e8eaf0;
        }

        .theme-toggle {
          position: fixed;
          top: 0.9rem;
          right: 0.9rem;
          z-index: 40;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(15,17,23,0.72);
          color: #e8eaf0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.05rem;
          backdrop-filter: blur(12px);
          transition: all 0.2s;
          box-shadow: 0 10px 28px rgba(0,0,0,0.22);
        }
        .theme-toggle:hover {
          transform: translateY(-1px);
          border-color: rgba(99,179,255,0.45);
        }
        .back-home-btn {
          position: fixed;
          top: 0.9rem;
          left: 0.9rem;
          z-index: 40;
          min-height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(15,17,23,0.72);
          color: #e8eaf0;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0 0.85rem;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          backdrop-filter: blur(12px);
          transition: all 0.2s;
          box-shadow: 0 10px 28px rgba(0,0,0,0.22);
        }
        .back-home-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(99,179,255,0.45);
          color: #63b3ff;
        }

        /* HOME */
        .home {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, #1a2a4a 0%, #0f1117 70%);
        }
        .home-badge {
          background: rgba(99,179,255,0.12);
          border: 1px solid rgba(99,179,255,0.25);
          color: #63b3ff;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.35rem 1rem;
          border-radius: 99px;
          margin-bottom: 1.5rem;
        }
        .home-title {
          font-family: 'Lexend', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          line-height: 1.2;
          background: linear-gradient(135deg, #ffffff 30%, #63b3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
        }
        .home-sub {
          color: #7a8499;
          font-size: 0.95rem;
          text-align: center;
          max-width: 420px;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }
        .subject-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          width: 100%;
          max-width: 420px;
          margin-bottom: 2rem;
        }
        .subject-card {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 1.2rem 1.4rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .subject-card:hover {
          background: rgba(99,179,255,0.08);
          border-color: rgba(99,179,255,0.35);
          transform: translateY(-2px);
        }
        .subject-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #1e3a5f, #2a4a7f);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .subject-info { flex: 1; }
        .subject-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #d4daf0;
        }
        .subject-count {
          font-size: 0.78rem;
          color: #5a6480;
          margin-top: 0.2rem;
        }
        .subject-arrow {
          font-size: 1.1rem;
          color: #3a4460;
          transition: all 0.2s;
        }
        .subject-card:hover .subject-arrow {
          color: #63b3ff;
          transform: translateX(3px);
        }

        /* SEMESTER SELECT */
        .semester-list {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .semester-item {
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s;
        }
        .semester-item.semester-active {
          border-color: rgba(99,179,255,0.4);
        }
        .semester-header {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 1rem 1.2rem;
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          transition: background 0.2s;
          user-select: none;
        }
        .semester-header:hover {
          background: rgba(99,179,255,0.07);
        }
        .semester-icon {
          font-size: 1.25rem;
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #1e3a5f, #2a4a7f);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .semester-info { flex: 1; }
        .semester-label {
          font-weight: 700;
          font-size: 0.95rem;
          color: #d4daf0;
        }
        .semester-meta {
          font-size: 0.78rem;
          color: #5a6480;
          margin-top: 0.15rem;
        }
        .semester-chevron {
          font-size: 1.1rem;
          color: #3a4460;
          transition: transform 0.25s, color 0.2s;
        }
        .semester-active .semester-chevron {
          color: #63b3ff;
          transform: rotate(90deg);
        }
        .semester-subjects {
          padding: 0.5rem 0.75rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(0,0,0,0.15);
        }
        .semester-subjects .subject-card {
          border-radius: 10px;
          padding: 0.9rem 1.1rem;
          margin: 0;
        }

        /* SUBJECT PAGE */
        .subject-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .subject-page-header {
          padding: 5rem 1.5rem 0;
          max-width: 820px;
          width: 100%;
          margin: 0 auto;
        }
        .subject-page-title {
          font-family: 'Lexend', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #e8eaf0;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.35rem;
        }
        .subject-page-meta {
          font-size: 0.82rem;
          color: #5a6480;
          margin-bottom: 1.5rem;
        }
        .tab-bar {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          gap: 0;
          max-width: 820px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .tab-btn {
          padding: 0.75rem 1.4rem;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Be Vietnam Pro', sans-serif;
          background: transparent;
          border: none;
          color: #5a6480;
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .tab-btn:hover { color: #a0b0d0; }
        .tab-btn.active-tab {
          color: #63b3ff;
          border-bottom-color: #63b3ff;
        }
        .tab-content {
          flex: 1;
          max-width: 820px;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 3rem;
        }

        /* STUDY MODE (Học tab) */
        .study-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.4rem;
          margin-bottom: 1rem;
        }
        .study-question-num {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(37,99,235,0.25);
          color: #63b3ff;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          margin-bottom: 0.8rem;
        }
        .study-question-text {
          font-size: 0.95rem;
          line-height: 1.65;
          color: #d4daf0;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .study-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .study-option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          color: #a0b0d0;
          font-size: 0.88rem;
          line-height: 1.5;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .study-option.study-correct {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.45);
          color: #4ade80;
        }
        .study-option-key {
          flex-shrink: 0;
          width: 24px; height: 24px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #5a6480;
          border: 1px solid rgba(255,255,255,0.08);
          margin-top: 1px;
        }
        .study-option.study-correct .study-option-key {
          background: rgba(34,197,94,0.25);
          border-color: rgba(34,197,94,0.5);
          color: #4ade80;
        }
        .study-page-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        /* THI THU tab */
        .thi-thu-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
          gap: 1.5rem;
        }
        .thi-thu-info {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.6rem 2rem;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .thi-thu-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          color: #7a8499;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 0.8rem;
        }
        .thi-thu-info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .thi-thu-info-val {
          font-weight: 600;
          color: #d4daf0;
        }
        .thi-thu-start-btn {
          width: 100%;
          max-width: 440px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(37,99,235,0.35);
        }
        .thi-thu-start-btn:hover {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(37,99,235,0.45);
        }

        /* QUIZ */
        .quiz-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .quiz-header {
          position: sticky; top: 0; z-index: 10;
          background: rgba(15,17,23,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0.9rem 1.2rem;
        }
        .app.has-back .quiz-header {
          padding-top: 4rem;
        }
        .quiz-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.6rem;
        }
        .quiz-title {
          font-family: 'Lexend', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #a0b0d0;
          white-space: nowrap;
        }
        .quiz-stats {
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }
        .stat-chip {
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 0.3rem 0.65rem;
          font-size: 0.75rem;
          color: #7a8499;
          white-space: nowrap;
        }
        .stat-chip span { color: #e8eaf0; font-weight: 600; }
        .progress-bar {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #63b3ff);
          border-radius: 99px;
          transition: width 0.3s;
        }

        /* Page nav */
        .page-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.9rem 1.2rem;
          flex-wrap: wrap;
        }
        .page-dot {
          min-width: 44px; height: 32px;
          padding: 0 0.55rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #7a8499;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Be Vietnam Pro', sans-serif;
          display: flex; align-items: center; justify-content: center;
        }
        .page-dot:hover { background: rgba(255,255,255,0.06); color: #d4daf0; }
        .page-dot.active-page {
          background: rgba(37,99,235,0.3);
          border-color: rgba(37,99,235,0.6);
          color: #63b3ff;
        }
        .page-dot.page-answered {
          background: rgba(34,197,94,0.08);
          border-color: rgba(34,197,94,0.2);
          color: #4ade80;
        }
        .page-dot.page-answered.active-page {
          background: rgba(34,197,94,0.16);
          border-color: rgba(99,179,255,0.45);
          color: #bbf7d0;
          box-shadow: inset 0 0 0 1px rgba(99,179,255,0.2);
        }

        .quiz-body {
          flex: 1;
          padding: 1rem 1.2rem 2rem;
          max-width: 780px;
          width: 100%;
          margin: 0 auto;
        }

        .question-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.4rem;
          margin-bottom: 1rem;
        }
        .question-num {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(37,99,235,0.25);
          color: #63b3ff;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          margin-bottom: 0.8rem;
        }
        .question-text {
          font-size: 0.95rem;
          line-height: 1.65;
          color: #d4daf0;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          width: 100%;
          font-family: 'Be Vietnam Pro', sans-serif;
          color: #a0b0d0;
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .option:hover:not(.correct):not(.wrong) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.15);
          color: #e8eaf0;
        }
        .option.selected {
          background: rgba(37,99,235,0.12);
          border-color: rgba(37,99,235,0.45);
          color: #93c5fd;
        }
        .option.correct {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.45);
          color: #4ade80;
          cursor: default;
        }
        .option.wrong {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.45);
          color: #f87171;
          cursor: default;
        }
        .option-key {
          flex-shrink: 0;
          width: 24px; height: 24px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #5a6480;
          border: 1px solid rgba(255,255,255,0.08);
          margin-top: 1px;
          transition: all 0.15s;
        }
        .option.selected .option-key {
          background: rgba(37,99,235,0.3);
          border-color: rgba(37,99,235,0.5);
          color: #93c5fd;
        }
        .option.correct .option-key {
          background: rgba(34,197,94,0.25);
          border-color: rgba(34,197,94,0.5);
          color: #4ade80;
        }
        .option.wrong .option-key {
          background: rgba(239,68,68,0.25);
          border-color: rgba(239,68,68,0.5);
          color: #f87171;
        }

        .quiz-footer {
          position: sticky; bottom: 0;
          background: rgba(15,17,23,0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 1rem 1.2rem;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
        .btn-nav {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a0b0d0;
          border-radius: 10px;
          padding: 0.65rem 1.2rem;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.15s;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .btn-nav:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          color: #e8eaf0;
        }
        .btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-submit {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 0.65rem 1.6rem;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.15s;
          box-shadow: 0 3px 16px rgba(220,38,38,0.3);
        }
        .btn-submit:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transform: translateY(-1px);
        }

        /* RESULT */
        .result-screen {
          min-height: 100vh;
          padding: 1.5rem 1.2rem 3rem;
          max-width: 920px;
          margin: 0 auto;
        }
        .result-hero {
          text-align: center;
          padding: 2rem 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }
        .result-score-ring {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: conic-gradient(
            #22c55e calc(var(--pct) * 1%),
            rgba(255,255,255,0.06) 0
          );
          margin-bottom: 1rem;
          position: relative;
        }
        .result-score-ring::before {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: #0f1117;
        }
        .result-score-text {
          position: relative;
          z-index: 1;
          font-family: 'Lexend', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #22c55e;
          line-height: 1;
        }
        .result-score-label {
          position: relative;
          z-index: 1;
          font-size: 0.65rem;
          color: #5a6480;
          font-weight: 500;
        }
        .result-title {
          font-family: 'Lexend', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #e8eaf0;
          margin-bottom: 0.4rem;
        }
        .result-sub {
          color: #5a6480;
          font-size: 0.88rem;
        }
        .result-stats-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }
        .rstat {
          flex: 1;
          max-width: 120px;
          padding: 0.9rem;
          border-radius: 12px;
          text-align: center;
          border: 1px solid;
        }
        .rstat.green { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); }
        .rstat.red { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); }
        .rstat.blue { background: rgba(37,99,235,0.08); border-color: rgba(37,99,235,0.2); }
        .rstat-num { font-family: 'Lexend', sans-serif; font-size: 1.6rem; font-weight: 700; }
        .rstat.green .rstat-num { color: #4ade80; }
        .rstat.red .rstat-num { color: #f87171; }
        .rstat.blue .rstat-num { color: #60a5fa; }
        .rstat-label { font-size: 0.72rem; color: #5a6480; margin-top: 0.2rem; }
        .rstat-clickable {
          cursor: pointer;
          transition: all 0.18s;
          user-select: none;
        }
        .rstat-clickable:hover { transform: translateY(-2px); filter: brightness(1.15); }
        .rstat.red.rstat-active {
          background: rgba(239,68,68,0.18);
          border-color: rgba(239,68,68,0.55);
          box-shadow: 0 0 0 2px rgba(239,68,68,0.2);
        }
        .rstat.blue.rstat-active {
          background: rgba(37,99,235,0.18);
          border-color: rgba(37,99,235,0.55);
          box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
        }

        .result-page-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .review-section-title {
          font-family: 'Lexend', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3a4460;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .result-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .btn-restart {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none;
          color: #fff;
          border-radius: 12px;
          padding: 0.85rem 1.8rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(37,99,235,0.3);
        }
        .btn-restart:hover {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          transform: translateY(-1px);
        }
        .btn-back-subject {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: #a0b0d0;
          border-radius: 12px;
          padding: 0.85rem 1.8rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.2s;
        }
        .btn-back-subject:hover {
          background: rgba(255,255,255,0.09);
          color: #e8eaf0;
          transform: translateY(-1px);
        }

        .correct-label {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.75rem;
          padding: 0.45rem 0.75rem;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 8px;
          font-size: 0.78rem;
          color: #4ade80;
          font-weight: 700;
        }
        .result-screen .question-card {
          padding: 1.15rem;
        }
        .result-screen .question-text {
          font-size: 1rem;
          color: #eef2ff;
        }
        .result-screen .option {
          min-height: 50px;
          align-items: center;
        }

        .app.theme-light {
          background: #f6f8fc;
          color: #172033;
        }
        .theme-light .theme-toggle {
          background: rgba(255,255,255,0.78);
          border-color: rgba(15,23,42,0.12);
          color: #172033;
          box-shadow: 0 10px 28px rgba(15,23,42,0.12);
        }
        .theme-light .back-home-btn {
          background: rgba(255,255,255,0.78);
          border-color: rgba(15,23,42,0.12);
          color: #172033;
          box-shadow: 0 10px 28px rgba(15,23,42,0.12);
        }
        .theme-light .back-home-btn:hover {
          color: #2563eb;
        }
        .theme-light .home {
          background: radial-gradient(ellipse 80% 60% at 50% 0%, #d8ecff 0%, #f6f8fc 70%);
        }
        .theme-light .home-badge {
          background: rgba(37,99,235,0.1);
          border-color: rgba(37,99,235,0.2);
          color: #1d4ed8;
        }
        .theme-light .home-title {
          background: linear-gradient(135deg, #111827 30%, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .theme-light .home-sub,
        .theme-light .subject-count,
        .theme-light .stat-chip,
        .theme-light .result-sub,
        .theme-light .rstat-label,
        .theme-light .thi-thu-info-row {
          color: #64748b;
        }
        .theme-light .subject-card,
        .theme-light .question-card,
        .theme-light .result-hero,
        .theme-light .study-card,
        .theme-light .thi-thu-info {
          background: rgba(255,255,255,0.86);
          border-color: rgba(15,23,42,0.08);
          box-shadow: 0 18px 42px rgba(15,23,42,0.06);
        }
        .theme-light .subject-card:hover {
          background: rgba(239,246,255,0.96);
          border-color: rgba(37,99,235,0.35);
        }
        .theme-light .subject-icon {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }
        .theme-light .subject-name,
        .theme-light .question-text,
        .theme-light .result-title,
        .theme-light .stat-chip span,
        .theme-light .study-question-text,
        .theme-light .subject-page-title,
        .theme-light .thi-thu-info-val {
          color: #172033;
        }
        .theme-light .quiz-header,
        .theme-light .quiz-footer {
          background: rgba(246,248,252,0.9);
          border-color: rgba(15,23,42,0.08);
        }
        .theme-light .quiz-title {
          color: #334155;
        }
        .theme-light .stat-chip,
        .theme-light .btn-nav {
          background: rgba(15,23,42,0.04);
          border-color: rgba(15,23,42,0.08);
        }
        .theme-light .progress-bar,
        .theme-light .result-score-ring::before {
          background: #f6f8fc;
        }
        .theme-light .page-dot {
          border-color: rgba(15,23,42,0.1);
          color: #64748b;
        }
        .theme-light .page-dot.active-page {
          background: rgba(37,99,235,0.16);
          border-color: rgba(37,99,235,0.42);
          color: #1d4ed8;
        }
        .theme-light .page-dot.page-answered {
          background: #dcfce7;
          border-color: #86efac;
          color: #15803d;
        }
        .theme-light .page-dot:hover,
        .theme-light .btn-nav:hover:not(:disabled) {
          background: rgba(37,99,235,0.06);
          color: #172033;
        }
        .theme-light .option {
          background: rgba(255,255,255,0.9);
          border-color: rgba(15,23,42,0.1);
          color: #334155;
        }
        .theme-light .option:hover:not(.correct):not(.wrong) {
          background: #f8fbff;
          border-color: rgba(37,99,235,0.24);
          color: #172033;
        }
        .theme-light .option-key {
          background: rgba(15,23,42,0.04);
          border-color: rgba(15,23,42,0.08);
          color: #64748b;
        }
        .theme-light .option.selected {
          background: #dbeafe;
          border-color: #60a5fa;
          color: #1d4ed8;
        }
        .theme-light .option.correct {
          background: #dcfce7;
          border-color: #22c55e;
          color: #14532d;
          box-shadow: inset 4px 0 0 #22c55e;
        }
        .theme-light .option.wrong {
          background: #fee2e2;
          border-color: #ef4444;
          color: #7f1d1d;
          box-shadow: inset 4px 0 0 #ef4444;
        }
        .theme-light .option.selected .option-key {
          background: #bfdbfe;
          border-color: #60a5fa;
          color: #1d4ed8;
        }
        .theme-light .option.correct .option-key {
          background: #bbf7d0;
          border-color: #22c55e;
          color: #15803d;
        }
        .theme-light .option.wrong .option-key {
          background: #fecaca;
          border-color: #ef4444;
          color: #b91c1c;
        }
        .theme-light .correct-label {
          background: #dcfce7;
          border-color: #86efac;
          color: #15803d;
        }
        .theme-light .result-screen .question-card {
          background: #ffffff;
          border-color: rgba(15,23,42,0.1);
          box-shadow: 0 16px 34px rgba(15,23,42,0.08);
        }
        .theme-light .result-screen .question-text {
          color: #0f172a;
        }
        .theme-light .review-section-title {
          color: #475569;
          border-bottom-color: rgba(15,23,42,0.1);
        }
        .theme-light .rstat.red.rstat-active {
          background: rgba(239,68,68,0.14);
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 2px rgba(239,68,68,0.15);
        }
        .theme-light .rstat.blue.rstat-active {
          background: rgba(37,99,235,0.14);
          border-color: rgba(37,99,235,0.5);
          box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
        }
        .theme-light .tab-bar {
          border-bottom-color: rgba(15,23,42,0.1);
        }
        .theme-light .tab-btn {
          color: #94a3b8;
        }
        .theme-light .tab-btn:hover { color: #475569; }
        .theme-light .tab-btn.active-tab {
          color: #2563eb;
          border-bottom-color: #2563eb;
        }
        .theme-light .study-option {
          background: rgba(255,255,255,0.9);
          border-color: rgba(15,23,42,0.1);
          color: #334155;
        }
        .theme-light .study-option-key {
          background: rgba(15,23,42,0.04);
          border-color: rgba(15,23,42,0.08);
          color: #64748b;
        }
        .theme-light .study-option.study-correct {
          background: #dcfce7;
          border-color: #22c55e;
          color: #14532d;
          box-shadow: inset 4px 0 0 #22c55e;
        }
        .theme-light .study-option.study-correct .study-option-key {
          background: #bbf7d0;
          border-color: #22c55e;
          color: #15803d;
        }
        .theme-light .semester-item {
          border-color: rgba(15,23,42,0.1);
        }
        .theme-light .semester-item.semester-active {
          border-color: rgba(37,99,235,0.4);
        }
        .theme-light .semester-header {
          background: rgba(15,23,42,0.03);
        }
        .theme-light .semester-header:hover {
          background: rgba(37,99,235,0.05);
        }
        .theme-light .semester-label { color: #0f172a; }
        .theme-light .semester-meta { color: #94a3b8; }
        .theme-light .semester-chevron { color: #94a3b8; }
        .theme-light .semester-active .semester-chevron { color: #2563eb; }
        .theme-light .semester-subjects {
          background: rgba(15,23,42,0.03);
        }
        .theme-light .subject-page-meta { color: #94a3b8; }
        .theme-light .btn-back-subject {
          background: rgba(15,23,42,0.04);
          border-color: rgba(15,23,42,0.1);
          color: #475569;
        }
        .theme-light .btn-back-subject:hover {
          background: rgba(15,23,42,0.08);
          color: #172033;
        }

        @media (min-width: 640px) {
          .home-title { font-size: 3rem; }
        }
      `}</style>

      <div className={`app theme-${theme} ${screen !== "home" ? "has-back" : ""}`}>
        {screen !== "home" && (
          <button
            className="back-home-btn"
            type="button"
            onClick={screen === "quiz" || screen === "result" ? backToSubject : handleReset}
          >
            ← {screen === "quiz" || screen === "result" ? "Môn học" : "Home"}
          </button>
        )}
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(current => current === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* HOME */}
        {screen === "home" && (
          <div className="home">
            <div className="home-badge">🎓 Hệ thống ôn tập trắc nghiệm</div>
            <div className="home-title">Ôn tập môn học<br />trắc nghiệm</div>
            <div className="home-sub">Chọn học kì để xem danh sách môn học.</div>
            <div className="semester-list">
              {SEMESTERS.map(sem => (
                <div
                  key={sem.id}
                  className={`semester-item ${selectedSemester === sem.id ? "semester-active" : ""}`}
                >
                  <div
                    className="semester-header"
                    onClick={() => setSelectedSemester(selectedSemester === sem.id ? null : sem.id)}
                  >
                    <div className="semester-icon">📅</div>
                    <div className="semester-info">
                      <div className="semester-label">{sem.label}</div>
                      <div className="semester-meta">{sem.subjects.length} môn học</div>
                    </div>
                    <span className="semester-chevron">›</span>
                  </div>
                  {selectedSemester === sem.id && (
                    <div className="semester-subjects">
                      {sem.subjects.map(s => (
                        <div
                          key={s.id}
                          className="subject-card"
                          onClick={() => openSubject(s.id)}
                        >
                          <div className="subject-icon">{s.icon}</div>
                          <div className="subject-info">
                            <div className="subject-name">{s.label}</div>
                            <div className="subject-count">{s.count} câu hỏi</div>
                          </div>
                          <div className="subject-arrow">›</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBJECT PAGE */}
        {screen === "subject" && (
          <div className="subject-page">
            <div className="subject-page-header">
              <div className="subject-page-title">
                {selectedSubjectInfo.icon} {selectedSubjectInfo.label}
              </div>
              <div className="subject-page-meta">{selectedSubjectInfo.count} câu hỏi</div>
            </div>

            <div className="tab-bar">
              <button
                className={`tab-btn ${subjectTab === "hoc" ? "active-tab" : ""}`}
                onClick={() => { setSubjectTab("hoc"); setCurrentPage(0); }}
              >
                📖 Học
              </button>
              <button
                className={`tab-btn ${subjectTab === "thi-thu" ? "active-tab" : ""}`}
                onClick={() => setSubjectTab("thi-thu")}
              >
                🎯 Thi thử
              </button>
            </div>

            <div className="tab-content">
              {subjectTab === "hoc" && (
                <>
                  <div className="study-page-nav">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`page-dot ${currentPage === i ? "active-page" : ""}`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i * QUESTIONS_PER_PAGE + 1}–{Math.min((i + 1) * QUESTIONS_PER_PAGE, questions.length)}
                      </button>
                    ))}
                  </div>
                  {pageQuestions.map((q) => (
                    <div className="study-card" key={q.id}>
                      <div className="study-question-num">Câu {q.id}</div>
                      <div className="study-question-text">{q.question}</div>
                      <div className="study-options">
                        {Object.entries(q.options).map(([key, val]) => (
                          <div
                            key={key}
                            className={`study-option ${key === q.answer ? "study-correct" : ""}`}
                          >
                            <span className="study-option-key">{key}</span>
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {totalPages > 1 && (
                    <div className="study-page-nav" style={{ marginTop: "1rem" }}>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`page-dot ${currentPage === i ? "active-page" : ""}`}
                          onClick={() => setCurrentPage(i)}
                        >
                          {i * QUESTIONS_PER_PAGE + 1}–{Math.min((i + 1) * QUESTIONS_PER_PAGE, questions.length)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {subjectTab === "thi-thu" && (
                <div className="thi-thu-wrapper">
                  <div className="thi-thu-info">
                    <div className="thi-thu-info-row">
                      <span>Số câu hỏi</span>
                      <span className="thi-thu-info-val">{questions.length} câu</span>
                    </div>
                    <div className="thi-thu-info-row">
                      <span>Hình thức</span>
                      <span className="thi-thu-info-val">Trắc nghiệm</span>
                    </div>
                    <div className="thi-thu-info-row">
                      <span>Kết quả</span>
                      <span className="thi-thu-info-val">Hiện sau khi nộp bài</span>
                    </div>
                  </div>
                  <button className="thi-thu-start-btn" onClick={startQuiz}>
                    Bắt đầu thi thử →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUIZ */}
        {screen === "quiz" && (
          <div className="quiz-layout">
            <div className="quiz-header">
              <div className="quiz-header-top">
                <div className="quiz-title">{selectedSubjectInfo.icon} {selectedSubjectInfo.label}</div>
                <div className="quiz-stats">
                  <div className="stat-chip">Đã làm: <span>{answeredCount}/{questions.length}</span></div>
                  <div className="stat-chip">Trang: <span>{currentPage + 1}/{totalPages}</span></div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="page-nav">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageQs = questions.slice(i * QUESTIONS_PER_PAGE, (i + 1) * QUESTIONS_PER_PAGE);
                const allAnswered = pageQs.every(q => answers[q.id]);
                return (
                  <button
                    key={i}
                    className={`page-dot ${currentPage === i ? "active-page" : ""} ${allAnswered ? "page-answered" : ""}`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i * QUESTIONS_PER_PAGE + 1}–{Math.min((i + 1) * QUESTIONS_PER_PAGE, questions.length)}
                  </button>
                );
              })}
            </div>

            <div className="quiz-body">
              {pageQuestions.map((q) => (
                <div className="question-card" key={q.id}>
                  <div className="question-num">Câu {q.id}</div>
                  <div className="question-text">{q.question}</div>
                  <div className="options-list">
                    {Object.entries(q.options).map(([key, val]) => (
                      <button
                        key={key}
                        className={getOptionClass(q, key)}
                        onClick={() => handleSelect(q.id, key)}
                      >
                        <span className="option-key">{key}</span>
                        <span>{val}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-footer">
              <button
                className="btn-nav"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                ← Trước
              </button>
              {currentPage < totalPages - 1 ? (
                <button
                  className="btn-nav"
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Tiếp →
                </button>
              ) : (
                <button className="btn-submit" onClick={handleSubmit}>
                  🎯 Nộp bài
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && (
          <div className="result-screen">
            <div className="result-hero">
              <div
                className="result-score-ring"
                style={{ "--pct": scorePct }}
              >
                <div className="result-score-text">{score}</div>
                <div className="result-score-label">/ {questions.length}</div>
              </div>
              <div className="result-title">
                {scorePct >= 80 ? "Xuất sắc! 🌟" : scorePct >= 60 ? "Khá tốt! 👏" : "Cần ôn thêm 📖"}
              </div>
              <div className="result-sub">
                Tỷ lệ đúng: {scorePct}%
              </div>
            </div>

            <div className="result-stats-row">
              <div className="rstat green">
                <div className="rstat-num">{score}</div>
                <div className="rstat-label">Câu đúng</div>
              </div>
              <div
                className={`rstat red rstat-clickable ${resultFilter === "wrong" ? "rstat-active" : ""}`}
                onClick={() => setResultFilter(f => f === "wrong" ? null : "wrong")}
                title="Click để xem danh sách câu sai"
              >
                <div className="rstat-num">{wrongCount}</div>
                <div className="rstat-label">Câu sai {wrongCount > 0 ? "▾" : ""}</div>
              </div>
              <div
                className={`rstat blue rstat-clickable ${resultFilter === "blank" ? "rstat-active" : ""}`}
                onClick={() => setResultFilter(f => f === "blank" ? null : "blank")}
                title="Click để xem danh sách câu bỏ trống"
              >
                <div className="rstat-num">{blankCount}</div>
                <div className="rstat-label">Bỏ trống {blankCount > 0 ? "▾" : ""}</div>
              </div>
            </div>

            {resultFilter === null && (
              <div className="result-page-nav">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-dot ${currentPage === i ? "active-page" : ""}`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i * QUESTIONS_PER_PAGE + 1}–{Math.min((i + 1) * QUESTIONS_PER_PAGE, questions.length)}
                  </button>
                ))}
              </div>
            )}

            <div className="review-section-title">
              {resultFilter === "wrong" && `Danh sách ${wrongCount} câu sai`}
              {resultFilter === "blank" && `Danh sách ${blankCount} câu bỏ trống`}
              {resultFilter === null && "Xem lại bài làm"}
            </div>

            {(resultFilter === null ? pageQuestions : questions.filter(q =>
              resultFilter === "wrong"
                ? answers[q.id] !== undefined && answers[q.id] !== q.answer
                : answers[q.id] === undefined
            )).map((q) => (
              <div className="question-card" key={q.id}>
                <div className="question-num">Câu {q.id}</div>
                <div className="question-text">{q.question}</div>
                <div className="options-list">
                  {Object.entries(q.options).map(([key, val]) => (
                    <div key={key} className={getOptionClass(q, key)}>
                      <span className="option-key">{key}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
                {answers[q.id] !== q.answer && (
                  <div className="correct-label">
                    ✓ Đáp án đúng: {q.answer}. {q.options[q.answer]}
                  </div>
                )}
              </div>
            ))}

            <div className="result-actions">
              <button className="btn-back-subject" onClick={backToSubject}>
                ← Về môn học
              </button>
              <button className="btn-restart" onClick={startQuiz}>
                🔄 Thi lại
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
