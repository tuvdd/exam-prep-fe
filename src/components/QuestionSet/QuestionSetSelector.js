import React, { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import {
  Form,
  InputGroup,
  ListGroup,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function QuestionSetSelector() {
  const { questionSetsByTeacher } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState(null);
  const [selectedQuestionSetDetail, setSelectedQuestionSetDetail] =
    useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Load quizData from location.state
  useEffect(() => {
    if (location.state?.quizData) {
      setSelectedQuestionSetId(location.state.quizData.questionSetId);
      // Add corresponding selected question set details
      const selectedSet = questionSetsByTeacher.find(
        (set) => set.id === location.state.quizData.questionSetId
      );
      setSelectedQuestionSetDetail(selectedSet);
    }
  }, [location.state, questionSetsByTeacher]);

  const filteredQuestionSets = questionSetsByTeacher.filter((questionSet) =>
    questionSet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (questionSet) => {
    setSelectedQuestionSetId(questionSet.id);
    setSelectedQuestionSetDetail(questionSet); // Update details for selected question set
  };

  const handleSubmit = () => {
    if (!selectedQuestionSetId) {
      setError("Please select a question set.");
      return;
    }
    navigate("/teacher/create-quiz", {
      state: {
        quizData: {
          ...location.state.quizData, // Maintain existing quiz data
          questionSetId: selectedQuestionSetId, // Update selected question set
        },
        selectedStudentsDetails: location.state.selectedStudentsDetails,
        selectedQuestionSetDetail: selectedQuestionSetDetail,
      },
    });
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-center">Select Question Set</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Search Bar */}
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search question sets by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Question Set List */}
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
                {filteredQuestionSets.map((questionSet) => (
                  <ListGroup.Item
                    key={questionSet.id}
                    action
                    onClick={() => handleSelect(questionSet)}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedQuestionSetId === questionSet.id
                          ? "#d4edda"
                          : "white",
                    }}
                  >
                    <h5 className="mb-1">{questionSet.title}</h5>
                    <small>Subject: {questionSet.subject}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            {/* Display Selected Question Set */}
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Selected Question Set</Card.Title>
                {selectedQuestionSetDetail ? (
                  <div>
                    <h5>{selectedQuestionSetDetail.title}</h5>
                    <p>Subject: {selectedQuestionSetDetail.subject}</p>
                  </div>
                ) : (
                  <p>No question set selected yet.</p>
                )}
              </Card.Body>
            </Card>

            {/* Confirm Selection Button */}
            <div className="text-center mt-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!selectedQuestionSetId}
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

export default QuestionSetSelector;
