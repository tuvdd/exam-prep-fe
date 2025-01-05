import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library
import { useAppContext } from "../../AppContext";
import {
  Form,
  Button,
  InputGroup,
  Container,
  Card,
  Row,
  Col,
} from "react-bootstrap";

const EditQuestion = () => {
  const { authData, userInfo, API_BASE_URL } = useAppContext();
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("Multiple Choice");
  const [questionImages, setQuestionImages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    // Fetch the existing question data
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/teacher/question/${questionId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        const { questionText, questionType, questionImages, answers } =
          response.data;
        setQuestionText(questionText);
        setQuestionType(questionType);
        setExistingImages(questionImages);
        setAnswers(answers);
      } catch (error) {
        console.error("Error fetching question: ", error);
        alert("Failed to load question data. Please try again.");
        navigate(-1);
      }
    };

    fetchQuestion();
  }, [API_BASE_URL, authData.jwt, navigate, questionId]);

  const handleQuestionImageUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({ name: file.name, imageUrl: reader.result });
          if (newImages.length === files.length) {
            setQuestionImages(newImages);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDeleteExistingImage = (index) => {
    const updatedImages = existingImages.filter(
      (_, imgIndex) => imgIndex !== index
    );
    setExistingImages(updatedImages);
  };

  const handleDeleteNewImage = (index) => {
    const updatedImages = questionImages.filter(
      (_, imgIndex) => imgIndex !== index
    );
    setQuestionImages(updatedImages);
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...answers];

    if (field === "correct") {
      updatedAnswers[index][field] = value === "true";

      if (questionType === "Single Choice" || questionType === "True/False") {
        updatedAnswers.forEach((ans, i) => {
          if (i !== index) {
            ans.correct = false;
          }
        });
      }
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

    if (answers.filter((ans) => ans.correct).length < 1) {
      alert("Questions must atleast one correct answer.");
      return;
    }
    // Validate for single choice - only one correct answer is allowed
    if (
      questionType === "Single Choice" &&
      answers.filter((ans) => ans.correct).length > 1
    ) {
      alert("Single Choice questions can only have one correct answer.");
      return;
    }

    // Validate answer text for other question types
    if (answers.some((ans) => ans.answerText.trim() === "")) {
      alert("Answer text cannot be empty.");
      return;
    }

    // Validate True/False - must have one correct and one incorrect answer
    if (
      questionType === "True/False" &&
      answers.filter((ans) => ans.correct).length !== 1 &&
      answers.filter((ans) => !ans.correct).length !== 1
    ) {
      alert(
        "True/False questions must have one correct and one incorrect answer."
      );
      return;
    }

    const questionData = {
      id: questionId,
      questionText,
      questionType,
      questionSetIds: [],
      questionImages: existingImages,
      answers,
      teacherId: userInfo?.id,
    };

    try {
      if (questionImages.length > 0) {
        const formData = new FormData();
        questionImages.forEach((image, index) => {
          const byteString = atob(image.imageUrl.split(",")[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uintArray = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([uintArray], { type: "image/jpeg" });

          formData.append("files", blob, `image_${index}.jpg`);
        });

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/files/upload-multiple`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.data && Array.isArray(uploadResponse.data)) {
          questionData.questionImages = [
            ...existingImages,
            ...uploadResponse.data.map((url) => ({
              id: null,
              name: "",
              imageUrl: url,
            })),
          ];
        } else {
          alert("Failed to upload images. Please try again.");
          return;
        }
      }

      await axios.put(
        `${API_BASE_URL}/api/teacher/question/update`,
        questionData,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Question updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error updating question: ", error);
      alert("Failed to update question. Please try again.");
    }
  };
  return (
    <Container className="mt-4">
      <Card className="shadow-sm p-4">
        {/* "Back" button */}
        <Row className="mb-3">
          <Col className="d-flex justify-content-start">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Col>
        </Row>

        <Card.Body>
          {/* Title */}
          <Card.Title
            className="mb-3 text-center"
            style={{ fontSize: "2rem", fontWeight: "bold" }}
          >
            Edit Question
          </Card.Title>

          {/* Question Type */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="questionType">
              <Form.Label>Question Type:</Form.Label>
              <Form.Select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                disabled
              >
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Single Choice">Single Choice</option>
                <option value="True/False">True/False</option>
                <option value="FillType">FillType</option>
              </Form.Select>
            </Form.Group>

            {/* Question Text */}
            <Form.Group className="mb-3" controlId="questionText">
              <Form.Label>Question Text:</Form.Label>
              <Form.Control
                as="textarea"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </Form.Group>

            {/* Existing Question Images */}
            <Form.Group className="mb-3" controlId="questionImageUpload">
              <Form.Label>Existing Question Images:</Form.Label>
              {existingImages.map((image, index) => (
                <div key={index} className="mb-2">
                  <img
                    src={image.imageUrl}
                    alt={`Existing Preview ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      marginBottom: "10px",
                    }}
                  />
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteExistingImage(index)}
                  >
                    Remove Image
                  </Button>
                </div>
              ))}
            </Form.Group>

            {/* Upload New Question Images */}
            <Form.Group className="mb-3" controlId="newQuestionImageUpload">
              <Form.Label>Upload New Question Images:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleQuestionImageUpload}
              />
              {questionImages.map((image, index) => (
                <div key={index} className="mt-3">
                  <img
                    src={image.imageUrl}
                    alt={`New Preview ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      marginBottom: "10px",
                    }}
                  />
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteNewImage(index)}
                  >
                    Remove Image
                  </Button>
                </div>
              ))}
            </Form.Group>

            {/* Render fields based on question type */}
            {questionType !== "True/False" && questionType !== "FillType" && (
              <>
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
                      required
                    />
                    <Form.Select
                      value={answer.correct ? "true" : "false"}
                      onChange={(e) =>
                        handleAnswerChange(index, "correct", e.target.value)
                      }
                      style={{
                        backgroundColor: answer.correct ? "green" : "red",
                        color: "white",
                      }}
                    >
                      <option value="true">Correct</option>
                      <option value="false">Incorrect</option>
                    </Form.Select>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAnswer(index)}
                    >
                      X
                    </Button>
                  </InputGroup>
                ))}
                <Button
                  variant="primary"
                  onClick={handleAddAnswer}
                  className="mb-3"
                >
                  Add Answer
                </Button>
              </>
            )}

            {/* For True/False questions */}
            {questionType === "True/False" && (
              <>
                <h3>Answers</h3>
                <InputGroup className="mb-3">
                  <Form.Control type="text" value="True" disabled />
                  <Form.Select
                    value={answers[0]?.correct ? "true" : "false"}
                    onChange={(e) =>
                      handleAnswerChange(0, "correct", e.target.value)
                    }
                    style={{
                      backgroundColor: answers[0]?.correct ? "green" : "red",
                      color: "white",
                    }}
                  >
                    <option value="true">Correct</option>
                    <option value="false">Incorrect</option>
                  </Form.Select>
                </InputGroup>
                <InputGroup className="mb-3">
                  <Form.Control type="text" value="False" disabled />
                  <Form.Select
                    value={answers[1]?.correct ? "true" : "false"}
                    onChange={(e) =>
                      handleAnswerChange(1, "correct", e.target.value)
                    }
                    style={{
                      backgroundColor: answers[1]?.correct ? "green" : "red",
                      color: "white",
                    }}
                  >
                    <option value="true">Correct</option>
                    <option value="false">Incorrect</option>
                  </Form.Select>
                </InputGroup>
              </>
            )}

            {/* For FillType */}
            {questionType === "FillType" && (
              <>
                <h3>Answer</h3>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter your answer"
                    value={answers[0]?.answerText || ""}
                    onChange={(e) =>
                      handleAnswerChange(0, "answerText", e.target.value)
                    }
                    required
                  />
                  <Form.Select
                    value="true"
                    disabled
                    style={{
                      backgroundColor: "green",
                      color: "white",
                    }}
                  >
                    <option value="true">Correct</option>
                  </Form.Select>
                </InputGroup>
              </>
            )}

            {/* Submit Button */}
            <div className="mb-4">
              <Button variant="success" type="submit" disabled={!questionText}>
                Save Changes
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditQuestion;
