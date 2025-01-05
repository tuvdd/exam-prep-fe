import React, { useState, useEffect } from "react";
import {
  Container,
  ListGroup,
  Form,
  Button,
  InputGroup,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const QuestionSelector = ({
  API_BASE_URL,
  authData,
  userInfo,
  onSelectionComplete,
  initialSelectedQuestions,
}) => {
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/question/all/${userInfo.id}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        setAvailableQuestions(response.data);
        setFilteredQuestions(response.data); // Initialize with full list
      } catch (error) {
        console.error("Error fetching questions: ", error);
        setError("Failed to fetch questions. Please try again.");
      }
    };

    fetchQuestions();
  }, [API_BASE_URL, authData.jwt, userInfo.id]);

  useEffect(() => {
    if (initialSelectedQuestions) {
      setSelectedQuestions(initialSelectedQuestions);
    }
  }, [initialSelectedQuestions]);

  const handleQuestionSelection = (question) => {
    setSelectedQuestions(
      (prev) =>
        prev.some((q) => q.id === question.id)
          ? prev.filter((q) => q.id !== question.id) // Remove if already selected
          : [...prev, question] // Add if not selected
    );
  };

  const handleSearchChange = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);

    const filtered = availableQuestions.filter((question) =>
      question.questionText.toLowerCase().includes(search)
    );
    setFilteredQuestions(filtered);
  };

  const handleCompleteSelection = () => {
    onSelectionComplete(selectedQuestions);
  };

  return (
    <Container className="mt-5">
      <h2>Select Questions</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <InputGroup className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
        }}
      >
        {filteredQuestions.length > 0 ? (
          <ListGroup>
            {filteredQuestions.map((question) => (
              <ListGroup.Item
                key={question.id}
                onClick={() => handleQuestionSelection(question)}
                className={`d-flex justify-content-between align-items-center ${
                  selectedQuestions.some((q) => q.id === question.id)
                    ? "active"
                    : ""
                }`}
                style={{
                  cursor: "pointer",
                  backgroundColor: selectedQuestions.some(
                    (q) => q.id === question.id
                  )
                    ? "#0d6efd"
                    : "white",
                  color: selectedQuestions.some((q) => q.id === question.id)
                    ? "white"
                    : "black",
                }}
              >
                <span>{question.questionText}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No questions found. Please adjust your search.</p>
        )}
      </div>

      <Button
        variant="success"
        onClick={handleCompleteSelection}
        className="mt-3"
      >
        Confirm Selection
      </Button>
    </Container>
  );
};

export default QuestionSelector;
