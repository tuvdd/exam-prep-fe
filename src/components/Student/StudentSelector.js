import React, { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  ListGroup,
  InputGroup,
  Form,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function StudentSelector() {
  const { studentsByTeacher } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStudentsDetails, setSelectedStudentsDetails] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Load quizData from location.state
  useEffect(() => {
    if (location.state?.quizData) {
      setSelectedStudentIds(location.state.quizData.studentIds);
      // Add corresponding selected student details
      const initialSelectedDetails = studentsByTeacher.filter((student) =>
        location.state.quizData.studentIds.includes(student.id)
      );
      setSelectedStudentsDetails(initialSelectedDetails);
    }
  }, [location.state, studentsByTeacher]);

  const filteredStudents = studentsByTeacher.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.studentCode}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (studentId, student) => {
    const updatedSelection = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter((id) => id !== studentId)
      : [...selectedStudentIds, studentId];

    setSelectedStudentIds(updatedSelection);

    if (updatedSelection.includes(studentId)) {
      setSelectedStudentsDetails((prevDetails) => [...prevDetails, student]);
    } else {
      setSelectedStudentsDetails((prevDetails) =>
        prevDetails.filter((s) => s.id !== studentId)
      );
    }
  };

  const handleSubmit = () => {
    if (selectedStudentIds.length === 0) {
      setError("Please select at least one student.");
      return;
    }
    navigate("/teacher/create-quiz", {
      state: {
        quizData: {
          ...location.state.quizData, // Maintain existing quiz data
          studentIds: selectedStudentIds, // Update selected students
        },
        selectedStudentsDetails, // Pass selected student details
        selectedQuestionSetDetail: location.state.selectedQuestionSetDetail,
      },
    });
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-center">Select Students</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Search Bar */}
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search students by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Student List */}
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <ListGroup>
                {filteredStudents.map((student) => (
                  <ListGroup.Item
                    key={student.id}
                    action
                    onClick={() => toggleSelection(student.id, student)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedStudentIds.includes(student.id)
                        ? "#d4edda"
                        : "white",
                    }}
                  >
                    <h5 className="mb-1">
                      {student.firstName} {student.lastName} -{" "}
                      {student.studentCode}
                    </h5>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            {/* Display Selected Students */}
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Selected Students</Card.Title>
                {selectedStudentsDetails.length === 0 ? (
                  <p>No students selected yet.</p>
                ) : (
                  <Row>
                    {selectedStudentsDetails.map((student) => (
                      <Col key={student.id} md={6}>
                        <Card.Text>
                          {student.firstName} {student.lastName} -{" "}
                          {student.studentCode}
                        </Card.Text>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Confirm Selection Button */}
            <div className="text-center mt-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={selectedStudentIds.length === 0}
              >
                Confirm Selection
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default StudentSelector;
