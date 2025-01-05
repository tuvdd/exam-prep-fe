import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const storedIsLogin = JSON.parse(localStorage.getItem("isLogin"));
  const storedAuthData = JSON.parse(localStorage.getItem("authData"));

  const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [isLogin, setLogin] = useState(storedIsLogin || false);
  const [authData, setAuthData] = useState(storedAuthData || {});
  const [allQuizzesByTeacher, setAllQuizzesByTeacher] = useState([]);
  const [questionSetsByTeacher, setQuestionSetsByTeacher] = useState([]);
  const [studentsByTeacher, setStudentsByTeacher] = useState([]);

  const [userInfo, setUserInfo] = useState(storedUserInfo || {});
  const [isLoading, setLoading] = useState(true);

  // Effect to clear state when isLogin changes to false
  useEffect(() => {
    if (!isLogin) {
      setAuthData({});
      setAllQuizzesByTeacher([]);
      setUserInfo({});
      setLoading(true);
      console.log("Logged out");
    }
  }, [isLogin]);

  useEffect(() => {
    if (isLogin) {
      localStorage.setItem("isLogin", JSON.stringify(isLogin));
    }
  }, [isLogin]);

  useEffect(() => {
    if (Object.keys(authData).length !== 0) {
      localStorage.setItem("authData", JSON.stringify(authData));
    }
  }, [authData]);

  useEffect(() => {
    if (Object.keys(userInfo).length !== 0) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
  }, [userInfo]);

  // fetch user information
  useEffect(() => {
    try {
      if (authData.role === "ROLE_TEACHER" || authData.role === "ROLE_ADMIN") {
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/api/authenticate/info`,
              {
                headers: {
                  Authorization: `Bearer ${authData.jwt}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setUserInfo(response.data);
          } catch (error) {
            console.error("Error fetching teacher info: ", error);
          }
        };
        fetchUserInfo();
      }
    } catch (e) {
      console.log(e);
    }
  }, [authData]);

  // fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      if (authData && authData.role === "ROLE_TEACHER") {
        try {
          // Gọi API để lấy dữ liệu quiz
          console.log("Fetching quiz data...", userInfo.id);
          const response = await axios.get(
            `${API_BASE_URL}/api/teacher/quiz/all/${userInfo.id}`,
            {
              headers: {
                Authorization: `Bearer ${authData.jwt}`,
                "Content-Type": "application/json",
              },
            }
          );
          setAllQuizzesByTeacher(response.data); // Cập nhật dữ liệu quiz
        } catch (error) {
          console.error("Error fetching quiz data: ", error);
        }
      } else {
        setAllQuizzesByTeacher([]);
      }
    };

    fetchQuizData();
  }, [authData, userInfo.id]); // useEffect sẽ chạy lại khi authData thay đổi

  // fetch question sets by teacher
  useEffect(() => {
    const fetchQuestionSetsByTeacher = async () => {
      if (authData && authData.role === "ROLE_TEACHER") {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/teacher/question-set/all/${userInfo.id}`,
            {
              headers: {
                Authorization: `Bearer ${authData.jwt}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Fetching question sets by teacher...", userInfo.id);
          setQuestionSetsByTeacher(response.data);
        } catch (error) {
          console.error("Error fetching question sets by teacher: ", error);
        }
      } else {
        setQuestionSetsByTeacher([]);
      }
    };
    fetchQuestionSetsByTeacher();
  }, [authData, userInfo.id]);

  useEffect(() => {
    const fetchStudentsByTeacher = async () => {
      if (authData && authData.role === "ROLE_TEACHER") {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/teacher/student/all/${userInfo.id}`,
            {
              headers: {
                Authorization: `Bearer ${authData.jwt}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Fetching students by teacher...", userInfo.id);
          setStudentsByTeacher(response.data);
        } catch (error) {
          console.error("Error fetching students by teacher: ", error);
        }
      } else {
        setStudentsByTeacher([]);
      }
    };
    fetchStudentsByTeacher();
  }, [authData, userInfo.id]);

  const formatDateTime = (dateTimeStr) => {
    const dateTime = new Date(dateTimeStr);

    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");
    const day = String(dateTime.getDate()).padStart(2, "0");
    const month = String(dateTime.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = dateTime.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  return (
    <AppContext.Provider
      value={{
        API_BASE_URL,
        authData,
        setAuthData,
        allQuizzesByTeacher,
        setAllQuizzesByTeacher,
        questionSetsByTeacher,
        setQuestionSetsByTeacher,
        studentsByTeacher,
        setStudentsByTeacher,
        userInfo,
        setUserInfo,
        isLoading,
        setLoading,
        isLogin,
        setLogin,
        formatDateTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, useAppContext };
