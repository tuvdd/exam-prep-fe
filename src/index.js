import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CreateQuiz from "./components/Quiz/CreateQuiz";
import LoginPage from "./components/Auth/LoginPage";
import QuizDetail from "./components/Quiz/QuizDetail";
import QuizList from "./components/Quiz/QuizList";
import ProfilePage from "./components/Profile/ProfilePage";
import QuestionSetDetail from "./components/QuestionSet/QuestionSetDetail";
import QuestionSetsList from "./components/QuestionSet/QuestionSetList";
import UpdateQuestionSet from "./components/QuestionSet/UpdateQuestionSet";
import CreateQuestion from "./components/Question/CreateQuestion";
import CreateQuestionSet from "./components/QuestionSet/CreateQuestionSet";
import StudentList from "./components/Student/StudentList";
import StudentEdit from "./components/Student/StudentEdit";
import TeacherList from "./components/Teacher/TeacherList";
import TeacherEdit from "./components/Teacher/TeacherEdit";
import CreateTeacher from "./components/Teacher/CreateTeacher";
import CreateStudent from "./components/Student/CreateStudent";
import AdminStatistics from "./components/Statistic/AdminStatistics";
import { AppProvider, useAppContext } from "./AppContext";

const DefaultRoute = () => {
  const { isLogin, authData } = useAppContext();

  if (!isLogin) return <Navigate to="/login" />;
  if (authData?.role === "ROLE_ADMIN")
    return <Navigate to="/admin/statistics" />;
  if (authData?.role === "ROLE_TEACHER")
    return <Navigate to="/teacher/quiz-list" />;
  return <Navigate to="/login" />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        {/* Default Route */}
        <Route index element={<DefaultRoute />} />

        {/* Teacher Routes */}
        <Route path="/teacher/quiz-list" element={<QuizList />} />
        <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
        <Route path="/teacher/quiz/:quizId" element={<QuizDetail />} />
        <Route
          path="/teacher/question-set/:questionSetId"
          element={<QuestionSetDetail />}
        />
        <Route path="/teacher/question-sets" element={<QuestionSetsList />} />
        <Route
          path="/teacher/update-question-set/:questionSetId"
          element={<UpdateQuestionSet />}
        />
        <Route path="/teacher/create-question" element={<CreateQuestion />} />
        <Route
          path="/teacher/create-question-set"
          element={<CreateQuestionSet />}
        />

        {/* Admin Routes */}
        <Route path="/admin/students" element={<StudentList />} />
        <Route
          path="/admin/edit-student/:studentId"
          element={<StudentEdit />}
        />
        <Route path="/admin/teachers" element={<TeacherList />} />
        <Route
          path="/admin/edit-teacher/:teacherId"
          element={<TeacherEdit />}
        />
        <Route path="/admin/create-teacher" element={<CreateTeacher />} />
        <Route path="/admin/create-student" element={<CreateStudent />} />
        <Route path="/admin/statistics" element={<AdminStatistics />} />

        {/* Shared Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppProvider>
    <AppRouter />
  </AppProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
