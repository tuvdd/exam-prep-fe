import React, { useState } from "react";
import { useAppContext } from "../../AppContext";
import QuestionSetSelector from "../QuestionSet/QuestionSetSelector";
import StudentSelector from "./StudentSelector";
import axios from "axios";
import { Form, Row, Col, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function CreateQuiz() {
  const { API_BASE_URL, userInfo, authData } = useAppContext();
  const [quizData, setQuizData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    type: "Private",
    mode: "Practice",
    studentIds: [],
    questionSetId: 0,
    teacherId: userInfo.id,
  });

  const navigate = useNavigate();

  const [selectedQuestionSetTitle, setSelectedQuestionSetTitle] = useState("");

  const handleQuestionSetSelect = (selectedQuestionSet) => {
    setQuizData({ ...quizData, questionSetId: selectedQuestionSet.id });
    setSelectedQuestionSetTitle(selectedQuestionSet.title);
  };

  const handleStudentSelect = (selectedStudentIds) => {
    setQuizData({ ...quizData, studentIds: selectedStudentIds });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    if (value === "Public") {
      setQuizData({ ...quizData, type: value, studentIds: [] });
    } else {
      setQuizData({ ...quizData, type: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/teacher/quiz/save`,
        quizData,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Quiz created successfully:", response.data);
      alert("Quiz created successfully!");
      navigate("/teacher/quizzes");
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <Container fluid="md">
      <h2 className="text-center my-4">Create Quiz</h2>
      <Form onSubmit={handleSubmit}>
        {/* Title, Start Time, End Time */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="formStartTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="startTime"
                value={quizData.startTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="formEndTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="endTime"
                value={quizData.endTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Type and Mode */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={quizData.type}
                onChange={handleTypeChange}
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formMode">
              <Form.Label>Mode</Form.Label>
              <Form.Select
                name="mode"
                value={quizData.mode}
                onChange={handleInputChange}
              >
                <option value="Practice">Practice</option>
                <option value="Test">Test</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Students */}
        {quizData.type === "Private" && (
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group controlId="formStudents">
                <Form.Label>Students</Form.Label>
                <StudentSelector onSelect={handleStudentSelect} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Selected Students</Form.Label>
                <div className="border p-2 rounded" style={{ height: "100%" }}>
                  {quizData.studentIds.length > 0
                    ? quizData.studentIds.join(", ")
                    : "None"}
                </div>
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Question Set */}
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group controlId="formQuestionSet">
              <Form.Label>Question Set</Form.Label>
              <QuestionSetSelector onSelect={handleQuestionSetSelect} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Selected Question Set</Form.Label>
              <div className="border p-2 rounded" style={{ height: "100%" }}>
                {selectedQuestionSetTitle || "None Selected"}
              </div>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center">
          <Button variant="primary" type="submit">
            Create Quiz
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default CreateQuiz;
