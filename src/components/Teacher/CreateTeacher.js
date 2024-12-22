import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const CreateTeacher = () => {
  const { API_BASE_URL, authData } = useAppContext();
  const navigate = useNavigate();

  const [excelFile, setExcelFile] = useState(null);

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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInfo.password !== userInfo.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const teacherData = {
      teacherCode,
      department,
      position,
      expertiseArea,
      userDto: { ...userInfo, confirmPassword: undefined },
      questionSetDtos: [],
      classDtoSet: [],
    };

    try {
      await axios.post(`${API_BASE_URL}/api/admin/teacher/save`, teacherData, {
        headers: {
          Authorization: `Bearer ${authData.jwt}`,
          "Content-Type": "application/json",
        },
      });
      alert("Teacher created successfully!");
      navigate("/admin/teachers");
    } catch (error) {
      console.error("Error creating teacher:", error);
      alert("Failed to create teacher. Please try again.");
    }
  };

  // Handle Excel file change
  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  // Handle Excel upload and processing
  const handleUpload = async () => {
    if (!excelFile) {
      alert("Please select an Excel file first.");
      return;
    }

    try {
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Transform data to match the API format
        const teachers = data.map((row) => ({
          teacherCode: row.TeacherCode || "",
          department: row.Department || "",
          position: row.Position || "",
          expertiseArea: row.ExpertiseArea || "",
          userDto: {
            username: row.Username || "",
            password: row.Password || "",
            confirmPassword: row.Password || "",
            firstName: row.FirstName || "",
            lastName: row.LastName || "",
            email: row.Email || "",
            phoneNumber: row.PhoneNumber || "",
            address: row.Address || "",
            profilePicture: row.ProfilePicture || "",
            role: "ROLE_TEACHER",
          },
        }));

        try {
          await axios.post(
            `${API_BASE_URL}/api/admin/teacher/save-from-excel`,
            teachers,
            {
              headers: {
                Authorization: `Bearer ${authData.jwt}`,
                "Content-Type": "application/json",
              },
            }
          );
          alert("Teachers uploaded successfully!");
          navigate("/admin/teachers");
        } catch (error) {
          console.error("Error uploading teachers:", error);
          alert("Failed to upload teachers. Please check the file format.");
        }
      };

      fileReader.readAsBinaryString(excelFile);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to process the Excel file. Please try again.");
    }
  };

  return (
    <Container className="mt-4">
      <h2>Upload Teachers via Excel</h2>
      <Form>
        <Form.Group className="mb-3" controlId="excelUpload">
          <Form.Label>Excel File</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleUpload}>
          Upload
        </Button>
      </Form>

      <h4>Add a Single Teacher</h4>
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
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={userInfo.confirmPassword}
            onChange={handleInputChange}
            required
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
          Add Teacher
        </Button>
      </Form>
    </Container>
  );
};

export default CreateTeacher;
