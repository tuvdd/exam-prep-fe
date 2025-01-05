import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  InputGroup,
  Button,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useAppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";

const QuizList = () => {
  const { authData, API_BASE_URL, userInfo } = useAppContext();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    fetchQuestions();
  }, []);

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
      setQuestions(response.data);
      setFilteredQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions: ", error);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    filterQuestions(e.target.value, filterType);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    filterQuestions(searchText, e.target.value);
  };

  const filterQuestions = (search, type) => {
    let filtered = questions;

    if (type !== "All") {
      filtered = filtered.filter((q) => q.questionType === type);
    }

    if (search) {
      filtered = filtered.filter((q) =>
        q.questionText.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleAddQuestion = () => {
    navigate("/teacher/create-question");
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/teacher/question/${questionId}`);
  };

  return (
    <Container>
      <h2 className="my-4">Manage Question</h2>
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search questions..."
              value={searchText}
              onChange={handleSearch}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchText("")}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select value={filterType} onChange={handleFilterChange}>
            <option value="All">All Types</option>
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="Single Choice">Single Choice</option>
            <option value="True/False">True/False</option>
            <option value="FillType">FillType</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="mb-3">
        <Button variant="primary" onClick={handleAddQuestion}>
          Add Question
        </Button>
      </div>

      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "10px",
        }}
      >
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Question Text</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <tr
                  key={question.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleQuestionClick(question.id)}
                >
                  <td>{index + 1}</td>
                  <td>{question.questionText}</td>
                  <td>{question.questionType}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default QuizList;
