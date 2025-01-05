import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";

const QuestionSetDetail = () => {
  const { questionSetId } = useParams();
  const { authData, API_BASE_URL } = useAppContext();
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const navigate = useNavigate();

  const fallbackImage =
    "https://i.ibb.co/vD45h32/anh-buon-phong-canh-060206013.jpg";

  useEffect(() => {
    const fetchQuestionSetData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/question-set/${questionSetId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        setSelectedQuestionSet(response.data);
      } catch (error) {
        console.error("Error fetching selected question set: ", error);
      }
    };

    fetchQuestionSetData();
  }, [authData.jwt, questionSetId, API_BASE_URL]);

  const handleUpdate = () => {
    navigate(`/teacher/update-question-set/${questionSetId}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this question set?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/teacher/question-set/${questionSetId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        alert("Question set deleted successfully.");
        navigate(`/teacher/question-sets`);
      } catch (error) {
        console.error("Error deleting question set: ", error);
        alert("Failed to delete the question set. Please try again.");
      }
    }
  };

  if (!selectedQuestionSet) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="mb-3"
          >
            Back
          </Button>
          <div className="d-flex flex-column align-items-center">
            <h2 className="text-center mb-2">{selectedQuestionSet.title}</h2>
            <p className="text-muted text-center">
              {selectedQuestionSet.subject}
            </p>
          </div>
        </Col>
      </Row>

      <h3 className="mt-4">Questions:</h3>
      <Row>
        {selectedQuestionSet.questions.map((question, index) => (
          <Col md={6} lg={4} key={index} className="mb-4">
            <Card className="h-100 shadow-sm d-flex flex-column">
              <Card.Body className="d-flex flex-column">
                <Card.Title>
                  <strong>Question:</strong>{" "}
                  {question.questionText || "No question text available"}
                </Card.Title>

                {question.questionImages &&
                question.questionImages.length > 0 ? (
                  <div className="mt-3">
                    <h5>Images:</h5>
                    {question.questionImages.map((image, imgIndex) => (
                      <div key={imgIndex} className="mb-2">
                        <img
                          src={image.imageUrl || fallbackImage}
                          alt={image.name || "Question Image"}
                          className="img-fluid"
                          style={{
                            width: "100%",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                          onError={(e) => (e.target.src = fallbackImage)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <img
                      src={fallbackImage}
                      alt="Sample"
                      className="img-fluid"
                      style={{
                        width: "100%",
                        maxHeight: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <p className="text-muted">No images available</p>
                  </div>
                )}

                <div className="mt-auto">
                  <h5 className="mt-4">Answers:</h5>
                  <ul className="list-group">
                    {question.answers.map((answer, ansIndex) => (
                      <li
                        key={ansIndex}
                        className={`list-group-item ${
                          answer.correct ? "list-group-item-success" : ""
                        }`}
                      >
                        {answer.answerText || "No answer text available"}
                        {answer.correct && (
                          <span className="badge bg-success ms-2">Correct</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-4">
        <Button variant="primary" onClick={handleUpdate} className="me-3">
          Update Question Set
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete Question Set
        </Button>
      </div>
    </Container>
  );
};

export default QuestionSetDetail;
