import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";

const StudentEdit = () => {
  const { API_BASE_URL, authData } = useAppContext();
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [studentCode, setStudentCode] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [userInfo, setUserInfo] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    profilePicture: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const [studentResponse, classResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/student/${studentId}`, {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }),
          axios.get(`${API_BASE_URL}/api/admin/class/all`, {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }),
        ]);

        const studentData = studentResponse.data;
        setStudentCode(studentData.studentCode);
        setClassId(studentData.classDto ? studentData.classDto.id : ""); // Only set one classId
        setUserInfo({
          ...studentData.userDto,
          password: "",
          confirmPassword: "",
        });
        setClasses(classResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load student details.");
        navigate(-1);
      }
    };

    fetchStudent();
  }, [API_BASE_URL, authData.jwt, studentId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInfo.password && userInfo.password !== userInfo.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedStudent = {
      id: studentId,
      studentCode,
      userDto: { ...userInfo, confirmPassword: undefined },
      classDto: classId ? { id: classId } : null, // Update to use a single classDto
    };

    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/student/update`,
        updatedStudent,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Student updated successfully!");
      navigate("/admin/students");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading student details...</p>;
  }

  return (
    <Container className="mt-4">
      <h2>Edit Student</h2>
      <Form onSubmit={handleSubmit}>
        {/* Student Info */}
        <Form.Group className="mb-3" controlId="studentCode">
          <Form.Label>Student Code</Form.Label>
          <Form.Control
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
          />
        </Form.Group>

        {/* Class Info */}
        <Form.Group className="mb-3" controlId="classId">
          <Form.Label>Class</Form.Label>
          <Form.Select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
          >
            <option value="">Select a Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Grade {cls.grade})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <h4>User Information</h4>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={userInfo.username}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={userInfo.password}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={userInfo.confirmPassword}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={userInfo.firstName}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={userInfo.lastName}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="profilePicture">
          <Form.Label>Profile Picture URL</Form.Label>
          <Form.Control
            type="text"
            name="profilePicture"
            value={userInfo.profilePicture}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="phoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            name="phoneNumber"
            value={userInfo.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={userInfo.address}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Button variant="success" type="submit">
          Save Changes
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default StudentEdit;
