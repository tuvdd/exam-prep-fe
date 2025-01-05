import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [redirectToClassList, setRedirectToClassList] = useState(false);

  const { authData, API_BASE_URL } = useAppContext();
  const navigate = useNavigate();

  // Handle form submission to create a new class
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/class/save`,
        { name, grade },
        {
          headers: { Authorization: `Bearer ${authData.jwt}` },
        }
      );

      if (response.status === 200) {
        setRedirectToClassList(true);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class.");
    }
  };

  // Redirect to the class list page after successful creation
  if (redirectToClassList) {
    navigate("/admin/classes");
    return null;
  }

  return (
    <Container>
      <h2 className="mb-3">Create Class</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formClassName" className="mb-3">
          <Form.Label>Class Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter class name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formGrade" className="mb-3">
          <Form.Label>Grade</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Class
        </Button>
      </Form>
    </Container>
  );
};

export default CreateClass;
