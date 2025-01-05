import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, ListGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../AppContext";

const ClassEdit = () => {
  const { classId } = useParams(); // Get class ID from URL
  const { authData, API_BASE_URL } = useAppContext();
  const [classDetail, setClassDetail] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const classResponse = await axios.get(
          `${API_BASE_URL}/api/admin/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );
        const studentsResponse = await axios.get(
          `${API_BASE_URL}/api/admin/student/all`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );
        const teachersResponse = await axios.get(
          `${API_BASE_URL}/api/admin/teacher/all`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );

        setClassDetail(classResponse.data);
        setStudents(studentsResponse.data);
        setTeachers(teachersResponse.data);

        setSelectedStudents(
          classResponse.data.simpleStudentDtos.map((student) => student.id)
        );
        setSelectedTeachers(
          classResponse.data.simpleTeacherDtos.map((teacher) => teacher.id)
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching class details:", error);
        alert("Failed to fetch class details.");
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [API_BASE_URL, authData.jwt, classId]);

  const validateForm = () => {
    const errors = {};
    if (!classDetail.name) {
      errors.name = "Class name is required.";
    }
    if (!classDetail.grade) {
      errors.grade = "Grade is required.";
    } else if (isNaN(classDetail.grade)) {
      errors.grade = "Grade must be a valid number.";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Prepare updated class data with selected students and teachers
    const updatedClass = {
      id: classDetail.id,
      name: classDetail.name,
      grade: classDetail.grade,
      simpleStudentDtos: students.filter((student) =>
        selectedStudents.includes(student.id)
      ),
      simpleTeacherDtos: teachers.filter((teacher) =>
        selectedTeachers.includes(teacher.id)
      ),
    };

    try {
      await axios.put(`${API_BASE_URL}/api/admin/class/update`, updatedClass, {
        headers: {
          Authorization: `Bearer ${authData.jwt}`,
          "Content-Type": "application/json",
        },
      });
      alert("Class updated successfully!");
      navigate("/admin/classes");
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class.");
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleTeacherSelection = (teacherId) => {
    setSelectedTeachers((prevSelected) =>
      prevSelected.includes(teacherId)
        ? prevSelected.filter((id) => id !== teacherId)
        : [...prevSelected, teacherId]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!classDetail) {
    return <div>Class not found.</div>;
  }

  return (
    <Container className="mt-4">
      <h2>Edit Class</h2>
      <Form onSubmit={handleSubmit}>
        {/* Class Information */}
        <Form.Group className="mb-3" controlId="className">
          <Form.Label>Class Name</Form.Label>
          <Form.Control
            type="text"
            value={classDetail.name}
            onChange={(e) =>
              setClassDetail({ ...classDetail, name: e.target.value })
            }
            isInvalid={!!errors.name}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="grade">
          <Form.Label>Grade</Form.Label>
          <Form.Control
            type="text"
            value={classDetail.grade}
            onChange={(e) =>
              setClassDetail({ ...classDetail, grade: e.target.value })
            }
            isInvalid={!!errors.grade}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.grade}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Students List */}
        <Row>
          <Col md={6}>
            <h4>Students</h4>
            <ListGroup>
              {students.map((student) => (
                <ListGroup.Item key={student.id}>
                  <Form.Check
                    type="checkbox"
                    label={`${student.userDto.firstName} ${student.userDto.lastName}`}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentSelection(student.id)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* Teachers List */}
          <Col md={6}>
            <h4>Teachers</h4>
            <ListGroup>
              {teachers.map((teacher) => (
                <ListGroup.Item key={teacher.id}>
                  <Form.Check
                    type="checkbox"
                    label={`${teacher.userDto.firstName} ${teacher.userDto.lastName}`}
                    checked={selectedTeachers.includes(teacher.id)}
                    onChange={() => handleTeacherSelection(teacher.id)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>

        <Button variant="success" type="submit" className="mt-3">
          Save Changes
        </Button>
        <Button
          variant="secondary"
          className="ms-2 mt-3"
          onClick={() => navigate("/admin/classes")}
        >
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default ClassEdit;
