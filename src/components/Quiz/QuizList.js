import React, { useState } from "react";
import { Card, Button, Container, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";

const QuizList = () => {
  const { allQuizzesByTeacher, formatDateTime } = useAppContext();
  const navigate = useNavigate();
  const currentTime = new Date();

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  // Bộ lọc
  const filteredQuizzes = allQuizzesByTeacher
    .filter((quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((quiz) => {
      if (startDate && new Date(quiz.startTime) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(quiz.startTime) > new Date(endDate)) {
        return false;
      }
      if (typeFilter && quiz.type !== typeFilter) {
        return false;
      }
      if (modeFilter && quiz.mode !== modeFilter) {
        return false;
      }
      return true;
    });

  // Chia quiz theo trạng thái
  const ongoingQuizzes = filteredQuizzes.filter(
    (quiz) =>
      new Date(quiz.startTime) <= currentTime &&
      new Date(quiz.endTime) >= currentTime
  );
  const upcomingQuizzes = filteredQuizzes.filter(
    (quiz) => new Date(quiz.startTime) > currentTime
  );
  const pastQuizzes = filteredQuizzes.filter(
    (quiz) => new Date(quiz.endTime) < currentTime
  );

  // Thành phần hiển thị danh sách quiz theo khu vực
  const renderQuizSection = (title, quizzes) => (
    <div className="mb-5">
      <h4 className="mb-3">{title}</h4>
      <Row>
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Col md={6} lg={4} key={quiz.id} className="mb-4">
              <Card className="shadow-sm" style={{ borderRadius: "10px" }}>
                <Card.Body>
                  <Card.Title className="text-primary">{quiz.title}</Card.Title>
                  <Card.Text>
                    <strong>Start Time:</strong>{" "}
                    {formatDateTime(quiz.startTime)}
                  </Card.Text>
                  <Card.Text>
                    <strong>End Time:</strong> {formatDateTime(quiz.endTime)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Type:</strong> {quiz.type} | <strong>Mode:</strong>{" "}
                    {quiz.mode}
                  </Card.Text>
                  <Button
                    variant="primary"
                    block
                    onClick={() => navigate(`/teacher/quiz/${quiz.id}`)}
                  >
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-muted text-center">
            No quizzes available in this section.
          </p>
        )}
      </Row>
    </div>
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Your Quizzes</h2>

      {/* Thanh tìm kiếm */}
      <Row className="mb-4">
        <Col>
          <Form.Control
            type="text"
            placeholder="Search quizzes by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Row className="mb-4 align-items-center">
        <Col md={3}>
          <Form.Group controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="typeFilter">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="modeFilter">
            <Form.Label>Mode</Form.Label>
            <Form.Select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="">All Modes</option>
              <option value="Practice">Practice</option>
              <option value="Test">Test</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Các khu vực quiz */}
      {renderQuizSection("Ongoing Quizzes", ongoingQuizzes)}
      {renderQuizSection("Upcoming Quizzes", upcomingQuizzes)}
      {renderQuizSection("Past Quizzes", pastQuizzes)}
    </Container>
  );
};

export default QuizList;
