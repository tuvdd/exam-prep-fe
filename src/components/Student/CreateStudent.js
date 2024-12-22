import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import * as XLSX from "xlsx";

const CreateStudent = () => {
  const { API_BASE_URL, authData } = useAppContext();
  const navigate = useNavigate();

  const [studentCode, setStudentCode] = useState("");
  const [classId, setClassId] = useState(""); // Selected class ID
  const [availableClasses, setAvailableClasses] = useState([]);
  const [userInfo, setUserInfo] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [excelFile, setExcelFile] = useState(null);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/class/all`,
          {
            headers: {
              Authorization: `Bearer ${authData.jwt}`,
            },
          }
        );
        setAvailableClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        alert("Failed to fetch classes.");
      }
    };

    fetchClasses();
  }, [API_BASE_URL, authData.jwt]);

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

    const newStudent = {
      studentCode,
      userDto: {
        ...userInfo,
      },
      classDtoSet: classId ? [{ id: classId }] : [], // Adds selected class ID
    };

    try {
      await axios.post(`${API_BASE_URL}/api/admin/student/save`, newStudent, {
        headers: {
          Authorization: `Bearer ${authData.jwt}`,
          "Content-Type": "application/json",
        },
      });
      alert("Student added successfully!");
      navigate("/admin/students");
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

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

        // Transform data to match API input format
        const students = data.map((row) => {
          const classObj = availableClasses.find(
            (cls) => cls.name === row.ClassName
          );

          return {
            studentCode: row.StudentCode || "",
            userDto: {
              username: row.Username || "",
              password: row.Password || "",
              confirmPassword: row.Password || "",
              firstName: row.FirstName || "",
              lastName: row.LastName || "",
              email: row.Email || "",
              phoneNumber: row.PhoneNumber || "",
              address: row.Address || "",
            },
            classDtoSet: classObj ? [{ id: classObj.id }] : [],
          };
        });

        try {
          await axios.post(
            `${API_BASE_URL}/api/admin/student/save-from-excel`,
            students,
            {
              headers: {
                Authorization: `Bearer ${authData.jwt}`,
                "Content-Type": "application/json",
              },
            }
          );
          alert("Students uploaded successfully!");
          navigate("/admin/students");
        } catch (error) {
          console.error("Error uploading students:", error);
          alert("Failed to upload students. Please check the file format.");
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
      <h2>Add Student</h2>
      <h3>Upload Students from Excel</h3>
      <Form.Group className="mb-3" controlId="fileUpload">
        <Form.Label>Select Excel File</Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleUpload}>
        Upload
      </Button>

      <h3>New Student</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="studentCode">
          <Form.Label>Student Code</Form.Label>
          <Form.Control
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
          />
        </Form.Group>

        <h4>Class Information</h4>
        <Form.Group className="mb-3" controlId="classInput">
          <Form.Label>Select Class</Form.Label>
          <Form.Select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">-- Select a Class --</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Grade {cls.grade})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <h4>User Information</h4>
        {/* User Information Fields */}
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
          Add Student
        </Button>
      </Form>

      <hr />
    </Container>
  );
};

export default CreateStudent;
