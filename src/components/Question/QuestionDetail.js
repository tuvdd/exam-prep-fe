import React, { useEffect, useState } from "react";
import {
  Card,
  ListGroup,
  Image,
  Button,
  Spinner,
  Col,
  Row,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";

const QuestionDetail = () => {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { questionId } = useParams();
  const { authData, API_BASE_URL } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch question data using the `questionId`
    const fetchQuestionData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/question/${questionId}`,
          {
            headers: { Authorization: `Bearer ${authData?.jwt}` },
          }
        );
        setQuestionData(response.data);
        console.log("Question Data:", response.data);
      } catch (error) {
        console.error("Error fetching question data:", error);
        alert("Failed to fetch question details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [authData, questionId]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/teacher/question/delete/${questionId}`,
          {
            headers: { Authorization: `Bearer ${authData?.jwt}` },
          }
        );
        alert("Question deleted successfully.");
        navigate(-1); // Navigate back to the previous page
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Failed to delete question. Please try again.");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/teacher/edit-question/${questionId}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" variant="primary" />
        <div>Loading...</div>
      </div>
    );
  }

  if (!questionData) {
    return <div className="text-center mt-4">No question data available.</div>;
  }
  return (
    <Container className="mt-4">
      <Card className="shadow-sm p-4">
        {/* "Back" button in its own row above the title */}
        <Row className="mb-3">
          <Col className="d-flex justify-content-start">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Col>
        </Row>

        <Card.Body>
          {/* Title centered with increased font size */}
          <Card.Title
            className="mb-3 text-center"
            style={{ fontSize: "2rem", fontWeight: "bold" }}
          >
            Question Details
          </Card.Title>

          {/* Subtitle with proper styling */}
          <Card.Subtitle className="mb-3 text-muted">
            <strong>Type:</strong> {questionData.questionType}
          </Card.Subtitle>

          {/* Question Text */}
          <Card.Text>
            <strong>Question Text:</strong> {questionData.questionText}
          </Card.Text>

          {/* Render Question Images */}
          {questionData.questionImages.length > 0 && (
            <div className="mb-4">
              <h5>Images:</h5>
              <div className="d-flex justify-content-center flex-wrap gap-2">
                {questionData.questionImages.map((image, index) => (
                  <Image
                    key={index}
                    src={image.imageUrl}
                    alt={`Question Image ${index + 1}`}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                    rounded
                    className="border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render Answers */}
          <div className="mt-4">
            <h5>Answers:</h5>
            <ListGroup>
              {questionData.answers.map((answer, index) => (
                <ListGroup.Item
                  key={index}
                  className="text-center"
                  style={{
                    backgroundColor: answer.correct ? "#d4edda" : "#f8d7da",
                    color: answer.correct ? "#155724" : "#721c24",
                  }}
                >
                  <strong>{answer.answerText}</strong>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="outline-primary" onClick={handleEdit}>
              Edit Question
            </Button>
            <Button variant="outline-danger" onClick={handleDelete}>
              Delete Question
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuestionDetail;
