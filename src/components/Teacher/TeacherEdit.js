import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";

const TeacherEdit = () => {
  const { API_BASE_URL, authData } = useAppContext();
  const { teacherId } = useParams();
  const navigate = useNavigate();

  const [teacherCode, setTeacherCode] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [expertiseArea, setExpertiseArea] = useState("");
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
    role: "ROLE_TEACHER",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/teacher/${teacherId}`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );
        const teacherData = response.data;
        setTeacherCode(teacherData.teacherCode);
        setDepartment(teacherData.department);
        setPosition(teacherData.position);
        setExpertiseArea(teacherData.expertiseArea);
        setUserInfo({
          ...teacherData.userDto,
          password: "",
          confirmPassword: "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        alert("Failed to fetch teacher details.");
        navigate(-1);
      }
    };

    fetchTeacher();
  }, [API_BASE_URL, authData.jwt, teacherId, navigate]);

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

    const updatedTeacher = {
      id: teacherId,
      teacherCode,
      department,
      position,
      expertiseArea,
      userDto: { ...userInfo, confirmPassword: undefined },
      questionSetDtos: [],
      classDtoSet: [],
    };

    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/teacher/update`,
        updatedTeacher,
        {
          headers: {
            Authorization: `Bearer ${authData.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Teacher updated successfully!");
      navigate("/admin/teachers");
    } catch (error) {
      console.error("Error updating teacher:", error);
      alert("Failed to update teacher. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading teacher details...</p>;
  }

  return (
    <Container className="mt-4">
      <h2>Edit Teacher</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="teacherCode">
          <Form.Label>Teacher Code</Form.Label>
          <Form.Control
            type="text"
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="department">
          <Form.Label>Department</Form.Label>
          <Form.Control
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="position">
          <Form.Label>Position</Form.Label>
          <Form.Control
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="expertiseArea">
          <Form.Label>Expertise Area</Form.Label>
          <Form.Control
            type="text"
            value={expertiseArea}
            onChange={(e) => setExpertiseArea(e.target.value)}
            required
          />
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

export default TeacherEdit;
