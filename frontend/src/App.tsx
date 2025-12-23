import MentorProgress from "./pages/MentorProgress";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";

import MentorEditCourse from "./pages/MentorEditCourse";
import AdminDashboard from "./pages/AdminDashboard";
import MentorManageChapters from "./pages/MentorManageChapters";

import MentorAssignStudents from "./pages/MentorAssignStudents";
import Course from "./pages/Course";





import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Student Dashboard */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Course Progress */}
        <Route
          path="/student/course/:courseId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Course />
            </ProtectedRoute>
          }
        />

        {/* Mentor */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/progress"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorProgress />
            </ProtectedRoute>
          }
        />

        {/* Mentor Assign Students */}
        <Route
          path="/mentor/assign/:courseId"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorAssignStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/course/:courseId/edit"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorEditCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/course/:courseId/chapters"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorManageChapters />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;



