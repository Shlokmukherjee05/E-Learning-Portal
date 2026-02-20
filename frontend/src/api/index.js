import { API_BASE, authHeaders, handleResponse } from "./config";

// ── AUTH ──────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  fetch(`${API_BASE}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const registerUser = (name, email, password, role) =>
  fetch(`${API_BASE}/auth/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  }).then(handleResponse);

// ── COURSES ───────────────────────────────────────────────────────
export const getAllCourses = () =>
  fetch(`${API_BASE}/courses`, { headers: authHeaders() }).then(handleResponse);

export const createCourse = (data) =>
  fetch(`${API_BASE}/courses`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

// ── ENROLLMENTS ───────────────────────────────────────────────────
export const enrollInCourse = (courseId) =>
  fetch(`${API_BASE}/enrollments/enroll`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ courseId }),
  }).then(handleResponse);

export const getMyCourses = () =>
  fetch(`${API_BASE}/enrollments/my-courses`, { headers: authHeaders() }).then(handleResponse);

// ── LESSONS ───────────────────────────────────────────────────────
export const getLessons = (courseId) =>
  fetch(`${API_BASE}/courses/${courseId}/lessons`, { headers: authHeaders() }).then(handleResponse);

export const addLesson = (courseId, formData) =>
  fetch(`${API_BASE}/courses/${courseId}/lessons`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    body: formData,
  }).then(handleResponse);

export const deleteLesson = (courseId, lessonId) =>
  fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }).then(handleResponse);

// ── EXAMS ─────────────────────────────────────────────────────────
export const createExam = (data) =>
  fetch(`${API_BASE}/exams/create`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const getMyExams = () =>
  fetch(`${API_BASE}/exams/my-exams`, { headers: authHeaders() }).then(handleResponse);

export const getExamByCourse = (courseId) =>
  fetch(`${API_BASE}/exams/course/${courseId}`, { headers: authHeaders() }).then(handleResponse);

export const submitExam = (examId, answers) =>
  fetch(`${API_BASE}/exams/submit`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ examId, answers }),
  }).then(handleResponse);

// ── RESULTS ───────────────────────────────────────────────────────
export const getMyResults = () =>
  fetch(`${API_BASE}/results/my-results`, { headers: authHeaders() }).then(handleResponse);
