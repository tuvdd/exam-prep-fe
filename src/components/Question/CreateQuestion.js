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
  const [answers, setAnswers] = useState([{ answerText: "", correct: true }]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedQuestionImage, setUploadedQuestionImage] = useState(null);

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

  const handleRemoveQuestionImage = () => {
    setUploadedQuestionImage(null);
  };

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

      // For Single Choice or True/False, if one answer is marked correct, others must be incorrect
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
      questionText,
      questionType,
      questionSetIds: [],
      questionImages: [], // Empty array initially
      answers,
      teacherId: userInfo?.id,
    };

    try {
      // If images are uploaded, call the API to upload them
      if (questionImages.length > 0) {
        const formData = new FormData();
        questionImages.forEach((image, index) => {
          // Assuming image is a base64 string, prepare it for upload
          const byteString = atob(image.imageUrl.split(",")[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uintArray = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([uintArray], { type: "image/jpeg" }); // Assuming images are JPEG

          // Append to FormData
          formData.append("files", blob, `image_${index}.jpg`);
        });

        // Upload multiple images to the API
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

        // Check if the API returned a list of image URLs
        if (uploadResponse.data && Array.isArray(uploadResponse.data)) {
          // Update questionImages with an array of image URLs
          questionData.questionImages = uploadResponse.data.map((url) => ({
            id: null, // No ID since it's not provided by the API
            name: "", // Empty name as requested
            imageUrl: url, // The image URL returned from the server
          }));
        } else {
          alert("Failed to upload images. Please try again.");
          return;
        }
      }

      // Now save the question with the image URLs
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

  const validateAnswers = () => {
    const valid = answers.some((ans) => ans.correct === true);
    return valid;
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
        <Form.Group className="mb-3" controlId="questionType">
          <Form.Label>Question Type:</Form.Label>
          <Form.Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="Single Choice">Single Choice</option>
            <option value="True/False">True/False</option>
            <option value="FillType">FillType</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="questionText">
          <Form.Label>Question Text:</Form.Label>
          <Form.Control
            as="textarea"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </Form.Group>

        {/* Upload Image Button and Preview */}
        <Form.Group className="mb-3" controlId="questionImageUpload">
          <Form.Label>Upload Question Images:</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            multiple
            onChange={handleQuestionImageUpload}
          />
          {questionImages.length > 0 && (
            <div className="mt-3">
              {questionImages.map((image, index) => (
                <div key={index} className="mb-2">
                  <img
                    src={image.imageUrl}
                    alt={`Question Preview ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      marginBottom: "10px",
                    }}
                  />
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteImage(index)}
                  >
                    Remove Image
                  </Button>
                </div>
              ))}
            </div>
          )}
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
              <Form.Control
                type="text"
                value="True"
                onChange={(e) =>
                  handleAnswerChange(0, "answerText", e.target.value)
                }
                disabled
              />
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
              <Form.Control
                type="text"
                value="False"
                onChange={(e) =>
                  handleAnswerChange(1, "answerText", e.target.value)
                }
                disabled
              />
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

        <div className="mb-4">
          <Button
            variant="success"
            type="submit"
            disabled={!questionText || !validateAnswers()}
          >
            Save Question
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateQuestion;
