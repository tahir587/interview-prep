import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem("token");
    const isLoginPage = window.location.pathname === "/login";
    if (error.response?.status === 401 && token && !isLoginPage) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data);

// DSA
export const getProblems = (params) => API.get("/dsa/problems", { params });
export const getProblem = (id) => API.get(`/dsa/problems/${id}`);
export const getCompanies = () => API.get("/dsa/companies");
export const getTopics = () => API.get("/dsa/topics");
export const markSolved = (id) => API.post(`/dsa/problems/${id}/solve`);
export const unmarkSolved = (id) => API.delete(`/dsa/problems/${id}/solve`);

// Mock Interview - Basic
export const startInterview = (data) => API.post("/interview/start", data);
export const getInterviews = () => API.get("/interview");
export const getInterview = (id) => API.get(`/interview/${id}`);
export const submitAnswer = (id, qIdx, data) => API.put(`/interview/${id}/answer/${qIdx}`, data);
export const completeInterview = (id, data) => API.put(`/interview/${id}/complete`, data);

// Phase management
export const getCurrentPhase = (id) => API.get(`/interview/${id}/phase`);

// Lobby phase
export const completeLobby = (id, data) => API.post(`/interview/${id}/lobby`, data);
export const joinInterview = (id) => API.post(`/interview/${id}/join`);

// Warm-up phase
export const submitWarmUp = (id, data) => API.post(`/interview/${id}/warmup`, data);

// Background phase
export const submitBackground = (id, data) => API.post(`/interview/${id}/background`, data);

// Candidate Q&A phase
export const startCandidateQA = (id) => API.post(`/interview/${id}/candidate-qa/start`);
export const submitCandidateQuestion = (id, data) => API.post(`/interview/${id}/candidate-qa/question`, data);

// Closing phase
export const startClosing = (id) => API.post(`/interview/${id}/closing`);

// Subjects
export const getSubjects = () => API.get("/subjects");
export const getSubject = (name) => API.get(`/subjects/${name}`);
export const createSubject = (data) => API.post("/subjects", data);
export const getTopic = (subj, topicId) => API.get(`/subjects/${subj}/topics/${topicId}`);
export const completeTopic = (subj, topicId, data) => API.post(`/subjects/${subj}/topics/${topicId}/complete`, data);
export const submitQuiz = (subj, topicId, data) => API.post(`/subjects/${subj}/topics/${topicId}/quiz`, data);
export const aiExplain = (data) => API.post("/subjects/ai-explain", data);

// Progress
export const getProgress = () => API.get("/progress");
export const getSolvedIds = () => API.get("/progress/solved-ids");

// Admin
export const createProblem = (data) => API.post("/admin/problems", data);
export const updateProblem = (id, data) => API.put(`/admin/problems/${id}`, data);
export const deleteProblem = (id) => API.delete(`/admin/problems/${id}`);
export const addTopic = (subjectId, data) => API.post(`/admin/subjects/${subjectId}/topics`, data);

export default API;


