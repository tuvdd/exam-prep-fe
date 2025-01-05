import React, { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import { Form, Row, Col, Button, Container, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function CreateQuiz() {
  const { API_BASE_URL, userInfo, authData } = useAppContext();
  const [quizData, setQuizData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    type: "Public", // Default type is Public
    mode: "Practice",
    studentIds: [],
    questionSetId: 0,
    teacherId: userInfo.id,
  });

  const [selectedQuestionSetDetail, setSelectedQuestionSetDetail] =
    useState("");
  const [selectedStudentsDetails, setSelectedStudentsDetails] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for state passed through navigation (Student and Question Set data)
  useEffect(() => {
    if (location.state?.quizData) {
      setQuizData(location.state.quizData);
      console.log("Quiz Data:", location.state.quizData);
      if (location.state?.selectedQuestionSetDetail) {
        console.log(
          "Selected Question Set Details:",
          location.state.selectedQuestionSetDetail
        );
        setSelectedQuestionSetDetail(location.state?.selectedQuestionSetDetail);
      }
      if (location.state?.selectedStudentsDetails) {
        setSelectedStudentsDetails(location.state.selectedStudentsDetails);
      }
    }
  }, [location.state]);

  const handleStudentSelect = () => {
    navigate("/teacher/student-selector", {
      state: { quizData, selectedQuestionSetDetail },
    });
  };

  const handleQuestionSetSelect = () => {
    navigate("/teacher/question-set-selector", {
      state: { quizData, selectedStudentsDetails },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    if (value === "Public") {
      setQuizData({
        ...quizData,
        type: value,
        studentIds: [],
        startTime: "2024-01-01T00:00", // Set to very early time
        endTime: "2024-12-31T23:59", // Set to very late time
      });
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
      navigate(`/`);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <Container fluid="md">
      <h2 className="text-center my-4">Create Quiz</h2>
      <Form onSubmit={handleSubmit}>
        {/* Title, Type, Mode (on the same row) */}
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
            <Form.Group controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={quizData.type}
                onChange={handleTypeChange}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
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

        {/* Start Time and End Time (only visible for Private quizzes) */}
        {quizData.type !== "Public" && (
          <Row className="mb-3">
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
        )}

        {/* Selected Students */}
        <Row className="mb-3">
          <Col md={12}>
            {quizData.type === "Private" && (
              <Form.Group controlId="formStudents">
                <Form.Label>Selected Students</Form.Label>
                <div className="border p-2 rounded">
                  {selectedStudentsDetails.length > 0 ? (
                    <Row>
                      {selectedStudentsDetails
                        .sort((a, b) => {
                          const nameA = `${a.firstName} ${a.lastName}`;
                          const nameB = `${b.firstName} ${b.lastName}`;
                          return nameA.localeCompare(nameB);
                        })
                        .map((student) => (
                          <Col key={student.id} md={6}>
                            <Card.Text>
                              {student.firstName} {student.lastName} -{" "}
                              {student.studentCode}
                            </Card.Text>
                          </Col>
                        ))}
                    </Row>
                  ) : (
                    "None"
                  )}
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleStudentSelect}
                  className="mt-2"
                >
                  Select Students
                </Button>
              </Form.Group>
            )}
          </Col>
        </Row>

        {/* Selected Question Set */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="formQuestionSet">
              <Form.Label>Selected Question Set</Form.Label>
              <div className="border p-2 rounded">
                {selectedQuestionSetDetail
                  ? `${selectedQuestionSetDetail.title} (${selectedQuestionSetDetail.subject})`
                  : "None Selected"}
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleQuestionSetSelect}
                className="mt-2"
              >
                Select Question Set
              </Button>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center">
          <Button variant="primary" size="lg" type="submit">
            Create Quiz
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default CreateQuiz;
