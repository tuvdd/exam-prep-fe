import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import {
  Container,
  Form,
  Button,
  ListGroup,
  Card,
  Alert,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";

const CreateQuestionSet = () => {
  const { authData, userInfo, API_BASE_URL } = useAppContext();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const handleAddQuestion = () => {
    navigate("/teacher/create-question");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionSetData = {
      title,
      subject,
      teacherId: userInfo?.id,
      questions: selectedQuestions.map((q) => q.id),
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/teacher/question-set/save`,
        questionSetData,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Question set created successfully!");
      navigate("/teacher/question-sets");
    } catch (error) {
      console.error("Error creating question set: ", error);
      setError("Failed to create question set. Please try again.");
    }
  };

  const handleQuestionSelection = (question) => {
    setSelectedQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const handleSearchChange = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);

    // Filter questions based on the search term
    const filtered = availableQuestions.filter((question) =>
      question.questionText.toLowerCase().includes(search)
    );
    setFilteredQuestions(filtered);
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-center">Create Question Set</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter question set title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="subject">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </Form.Group>

              <h4 className="mt-4">Available Questions</h4>
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
                        className={`d-flex justify-content-between align-items-center ${
                          selectedQuestions.includes(question) ? "active" : ""
                        }`}
                      >
                        <span>{question.questionText}</span>
                        <Form.Check
                          type="checkbox"
                          checked={selectedQuestions.includes(question)}
                          onChange={() => handleQuestionSelection(question)}
                        />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p>No questions found. Please adjust your search.</p>
                )}
              </div>

              <Button
                variant="outline-primary"
                onClick={handleAddQuestion}
                className="mt-3"
              >
                Add New Question
              </Button>

              <div className="text-center mt-4">
                <Button type="submit" variant="success">
                  Create Question Set
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateQuestionSet;
