import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminStatistics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    totalQuestionSets: 0,
    totalQuizzes: 0,
    totalQuizAttempts: 0,
  });

  // Mock data to simulate statistics
  useEffect(() => {
    const fetchData = async () => {
      const mockStats = {
        totalStudents: 30,
        totalTeachers: 5,
        totalQuestions: 70,
        totalQuestionSets: 14,
        totalQuizzes: 22,
        totalQuizAttempts: 57,
      };
      setStats(mockStats);
    };

    fetchData();
  }, []);

  // Data for the bar charts
  const data1 = {
    labels: ["Students", "Teachers"],
    datasets: [
      {
        label: "Counts",
        data: [stats.totalStudents, stats.totalTeachers],
        backgroundColor: ["#42A5F5", "#66BB6A"],
      },
    ],
  };

  const data2 = {
    labels: ["Questions", "Question Sets"],
    datasets: [
      {
        label: "Counts",
        data: [stats.totalQuestions, stats.totalQuestionSets],
        backgroundColor: ["#FFA726", "#AB47BC"],
      },
    ],
  };

  const data3 = {
    labels: ["Quizzes", "Quiz Attempts"],
    datasets: [
      {
        label: "Counts",
        data: [stats.totalQuizzes, stats.totalQuizAttempts],
        backgroundColor: ["#FF7043", "#29B6F6"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">Admin Dashboard</h2>
      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <h4 className="text-center">Students and Teachers</h4>
          <Bar data={data1} options={options} />
        </Col>
        <Col md={6} className="mb-4">
          <h4 className="text-center">Questions and Question Sets</h4>
          <Bar data={data2} options={options} />
        </Col>
        <Col md={6} className="mb-4">
          <h4 className="text-center">Quizzes and Quiz Attempts</h4>
          <Bar data={data3} options={options} />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminStatistics;
