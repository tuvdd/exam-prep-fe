import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Form,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";

const QuestionSetsList = () => {
  const {
    questionSetsByTeacher,
    setQuestionSetsByTeacher,
    authData,
    API_BASE_URL,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuestionSets, setFilteredQuestionSets] = useState([]);

  useEffect(() => {
    const fetchQuestionSets = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/question-sets`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        setQuestionSetsByTeacher(response.data);
      } catch (error) {
        console.error("Error fetching question sets:", error);
      }
    };

    fetchQuestionSets();
  }, [API_BASE_URL, authData.jwt, setQuestionSetsByTeacher]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = questionSetsByTeacher.filter((questionSet) =>
        `${questionSet.title} ${questionSet.subject}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredQuestionSets(filtered);
    } else {
      setFilteredQuestionSets(questionSetsByTeacher);
    }
  }, [searchTerm, questionSetsByTeacher]);

  if (!questionSetsByTeacher || questionSetsByTeacher.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading or no question sets available...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">Question Sets</h2>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={{ span: 6, offset: 3 }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Question Sets */}
      <Row>
        {filteredQuestionSets.length > 0 ? (
          filteredQuestionSets.map((questionSet) => (
            <Col key={questionSet.id} md={6} lg={4} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="text-primary">
                    {questionSet.title}
                  </Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">
                    Subject: {questionSet.subject}
                  </Card.Subtitle>
                  <Link
                    to={`/teacher/question-set/${questionSet.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Details
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="warning" className="text-center">
              No matching question sets found.
            </Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default QuestionSetsList;
