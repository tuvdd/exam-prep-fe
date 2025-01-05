import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import {
  Container,
  Card,
  Button,
  Alert,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import QuestionSelector from "../Question/QuestionSelector";
import axios from "axios";

const UpdateQuestionSet = () => {
  const { authData, userInfo, API_BASE_URL } = useAppContext();
  const { questionSetId } = useParams();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false); // Show selector or main form
  const navigate = useNavigate();

  // Fetch existing question set details on component load
  useEffect(() => {
    const fetchQuestionSetDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/question-set/${questionSetId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        const { title, subject, questions } = response.data;
        setTitle(title);
        setSubject(subject);
        setSelectedQuestions(questions); // Preload selected questions
      } catch (error) {
        console.error("Error fetching question set details: ", error);
        setError("Failed to fetch question set details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSetDetails();
  }, [API_BASE_URL, authData.jwt, questionSetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedQuestionSetData = {
      id: questionSetId,
      title,
      subject,
      teacherId: userInfo?.id,
      questions: selectedQuestions.map((q) => ({ id: q.id })), // Send only question IDs
    };

    try {
      await axios.put(
        `${API_BASE_URL}/api/teacher/question-set/update`,
        updatedQuestionSetData,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Question set updated successfully!");
      navigate("/teacher/question-sets");
    } catch (error) {
      console.error("Error updating question set: ", error);
      setError("Failed to update question set. Please try again.");
    }
  };

  const handleSelectionComplete = (questions) => {
    setSelectedQuestions(questions); // Update selected questions
    setShowSelector(false); // Close selector
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <p>Loading question set details...</p>
      </Container>
    );
  }

  return showSelector ? (
    <QuestionSelector
      API_BASE_URL={API_BASE_URL}
      authData={authData}
      userInfo={userInfo}
      initialSelectedQuestions={selectedQuestions} // Pass current selected questions
      onSelectionComplete={handleSelectionComplete}
    />
  ) : (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-center">Update Question Set</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              {/* Title Field */}
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

              {/* Subject Field */}
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

              {/* Question Selector Button */}
              <Button
                variant="primary"
                onClick={() => setShowSelector(true)}
                className="mb-3"
              >
                Select Questions
              </Button>

              {/* Display Selected Questions */}
              <div>
                <h5>Selected Questions:</h5>
                {selectedQuestions.length === 0 ? (
                  <p>No questions selected yet.</p>
                ) : (
                  <ul>
                    {selectedQuestions.map((q) => (
                      <li key={q.id}>{q.questionText}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="text-center mt-4">
                <Button type="submit" variant="success" className="me-2">
                  Update Question Set
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateQuestionSet;
