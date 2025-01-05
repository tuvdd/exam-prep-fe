import React, { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, Table, Container, Row, Col, Button } from "react-bootstrap";

const QuizDetail = () => {
  const { quizId } = useParams();
  const { authData, API_BASE_URL, formatDateTime } = useAppContext();
  const [selectedQuiz, setSelectedQuiz] = useState({});
  const [selectedQuizResults, setSelectedQuizResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/quiz/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSelectedQuiz(response.data);
      } catch (error) {
        console.error("Error fetching selected quiz: ", error);
      }
    };

    fetchQuizData();
  }, [authData.jwt, quizId]);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/result/get-by-quiz/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch student data for each quiz result
        const resultsWithStudentData = await Promise.all(
          response.data.map(async (result) => {
            try {
              const studentResponse = await axios.get(
                `${API_BASE_URL}/api/teacher/student/${result.studentId}`,
                {
                  headers: {
                    Authorization: `Bearer ${authData.jwt}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              return {
                ...result,
                studentDto: studentResponse.data,
              };
            } catch (error) {
              console.error("Error fetching student data: ", error);
              return result; // Return result with no studentDto in case of error
            }
          })
        );
        setSelectedQuizResults(resultsWithStudentData);
      } catch (error) {
        console.error("Error fetching selected quiz results: ", error);
      }
    };

    fetchQuizResults();
  }, [authData.jwt, quizId]);

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="mb-3"
          >
            Back
          </Button>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title as="h3" className="text-primary">
                {selectedQuiz.title || "Quiz Details"}
              </Card.Title>
              <Card.Text>
                <strong>Start Time:</strong>{" "}
                {formatDateTime(selectedQuiz.startTime) || "N/A"}
              </Card.Text>
              <Card.Text>
                <strong>End Time:</strong>{" "}
                {formatDateTime(selectedQuiz.endTime) || "N/A"}
              </Card.Text>
              <Card.Text>
                <strong>Type:</strong> {selectedQuiz.type || "N/A"}
              </Card.Text>
              <Card.Text>
                <strong>Mode:</strong> {selectedQuiz.mode || "N/A"}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h3 className="mb-3">Student Results</h3>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Code</th>
                <th>Full Name</th>
                <th>Score</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {selectedQuizResults.length > 0 ? (
                selectedQuizResults.map((result, index) => (
                  <tr key={result.studentId}>
                    <td>{index + 1}</td>
                    <td>{result.studentDto?.studentCode || "N/A"}</td>
                    <td>
                      {result.studentDto?.userDto?.firstName}{" "}
                      {result.studentDto?.userDto?.lastName || "N/A"}
                    </td>
                    <td>{result.score}</td>
                    <td>{result.startTime || "Haven't take quiz"}</td>
                    <td>{result.endTime || "Haven't take quiz"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No results available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default QuizDetail;
