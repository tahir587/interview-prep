import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/common/Navbar";
import EditProblem from "./pages/admin/EditProblem";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DSAPracticePage from "./pages/DSAPracticePage";
import MockInterviewPage from "./pages/MockInterviewPage";
import InterviewSessionPage from "./pages/InterviewSessionPage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProblems from "./pages/admin/ManageProblems";
import AddProblem from "./pages/admin/AddProblem";
import ManageSubjects from "./pages/admin/ManageSubjects";
import AddSubject from "./pages/admin/AddSubject";
import AddTopic from "./pages/admin/AddTopic";

import TopicDetailPage from "./pages/TopicDetailPage";
import HomePage from "./pages/HomePage";

// ───────────── Protected Route ─────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// ───────────── Public Route ─────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ───────────── Layout ─────────────
const AppLayout = ({ children }) => {
  return (
    <div className="layout" style={{ background: "var(--c-bg, #07080f)", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Navbar />

      {/* Main Content */}
      <div className="content-area">
        <main className="page-content" style={{ background: "transparent" }}>{children}</main>
      </div>
    </div>
  );
};

// ───────────── App ─────────────
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
       <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          pauseOnHover
          closeOnClick
          draggable
          limit={1}
        />
        <Routes>
          {/* PUBLIC ROUTES */}

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Authenticated Home Route */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* PROTECTED ROUTES */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dsa"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DSAPracticePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MockInterviewPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <InterviewSessionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SubjectsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects/:name"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SubjectDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProgressPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects/:subjectName/topics/:topicId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TopicDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/problems"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ManageProblems />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-problem"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddProblem />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-problem/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditProblem />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ManageSubjects />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-subject"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddSubject />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects/:id/add-topic"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddTopic />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
