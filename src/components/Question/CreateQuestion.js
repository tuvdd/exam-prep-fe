import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library
import { useAppContext } from "../../AppContext";
import { Form, Button, InputGroup, Row, Col, Container } from "react-bootstrap";

const CreateQuestion = () => {
  const { authData, userInfo, API_BASE_URL } = useAppContext();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("Multiple Choice");
  const [questionImages, setQuestionImages] = useState([]);
  const [answers, setAnswers] = useState([
    { answerText: "", correct: false },
    { answerText: "", correct: false },
  ]);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleAddImage = () => {
    setQuestionImages([...questionImages, { name: "", imageUrl: "" }]);
  };

  const handleImageChange = (index, field, value) => {
    const updatedImages = [...questionImages];
    updatedImages[index][field] = value;
    setQuestionImages(updatedImages);
  };

  const handleDeleteImage = (index) => {
    const updatedImages = questionImages.filter(
      (_, imgIndex) => imgIndex !== index
    );
    setQuestionImages(updatedImages);
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...answers];
    if (field === "correct") {
      updatedAnswers[index][field] = value === "true";
    } else {
      updatedAnswers[index][field] = value;
    }
    setAnswers(updatedAnswers);
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { answerText: "", correct: false }]);
  };

  const handleDeleteAnswer = (index) => {
    const updatedAnswers = answers.filter((_, ansIndex) => ansIndex !== index);
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionData = {
      questionText,
      questionType,
      questionSetIds: [],
      questionImages,
      answers,
      teacherId: userInfo?.id,
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/teacher/question/save`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Question created successfully!");
      navigate(-1); // Navigate back to the previous page
    } catch (error) {
      console.error("Error creating question: ", error);
      alert("Failed to create question. Please try again.");
    }
  };

  const handleUploadExcel = async () => {
    let file = uploadedFile;
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Map JSON data to the required format for the API
      const questions = jsonData.map((row) => ({
        questionText: row["Question Text"],
        questionType: row["Question Type"] || "Multiple Choice",
        questionSetIds: [],
        questionImages: row["Images"]
          ? row["Images"].split(";").map((img) => {
              const [name, imageUrl] = img.split(",");
              return { name, imageUrl };
            })
          : [],
        answers: row["Answers"]
          ? row["Answers"].split(";").map((ans) => {
              const [answerText, correct] = ans.split(",");
              return { answerText, correct: correct === "true" };
            })
          : [],
        teacherId: userInfo?.id,
      }));

      await axios.post(
        `${API_BASE_URL}/api/teacher/question/save-from-excel`,
        questions,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Questions uploaded successfully!");
      navigate(-1); // Navigate back to the previous page
    } catch (error) {
      console.error("Error processing Excel file: ", error);
      alert("Failed to process and upload questions. Please try again.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>Upload Questions from Excel</h3>
      <Form.Group controlId="fileUpload" className="mb-3">
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </Form.Group>
      <Button variant="info" onClick={handleUploadExcel} className="mb-4">
        Confirm Upload
      </Button>

      <h2>Create New Question</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="questionText">
          <Form.Label>Question Text:</Form.Label>
          <Form.Control
            as="textarea"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="questionType">
          <Form.Label>Question Type:</Form.Label>
          <Form.Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="True/False">True/False</option>
          </Form.Select>
        </Form.Group>

        <h3>Images</h3>
        {questionImages.map((image, index) => (
          <InputGroup className="mb-3" key={index}>
            <Form.Control
              type="text"
              placeholder="Image Name"
              value={image.name}
              onChange={(e) => handleImageChange(index, "name", e.target.value)}
            />
            <Form.Control
              type="text"
              placeholder="Image URL"
              value={image.imageUrl}
              onChange={(e) =>
                handleImageChange(index, "imageUrl", e.target.value)
              }
            />
            <Button variant="danger" onClick={() => handleDeleteImage(index)}>
              X
            </Button>
          </InputGroup>
        ))}
        <Button variant="primary" onClick={handleAddImage} className="mb-3">
          Add Image
        </Button>

        <h3>Answers</h3>
        {answers.map((answer, index) => (
          <InputGroup className="mb-3" key={index}>
            <Form.Control
              type="text"
              placeholder="Answer Text"
              value={answer.answerText}
              onChange={(e) =>
                handleAnswerChange(index, "answerText", e.target.value)
              }
            />
            <Form.Select
              value={answer.correct ? "true" : "false"}
              onChange={(e) =>
                handleAnswerChange(index, "correct", e.target.value)
              }
            >
              <option value="true">Correct</option>
              <option value="false">Incorrect</option>
            </Form.Select>
            <Button variant="danger" onClick={() => handleDeleteAnswer(index)}>
              X
            </Button>
          </InputGroup>
        ))}
        <Button variant="primary" onClick={handleAddAnswer} className="mb-3">
          Add Answer
        </Button>

        <div className="mb-4">
          <Button variant="success" type="submit">
            Create Question
          </Button>
        </div>
        <div></div>
      </Form>
    </Container>
  );
};

export default CreateQuestion;
