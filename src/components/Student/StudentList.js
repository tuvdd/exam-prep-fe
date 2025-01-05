import React, { useEffect, useState } from "react";
import { Table, Button, Container, Form } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";

const StudentList = () => {
  const { authData, API_BASE_URL } = useAppContext();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/student/all`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        alert("Failed to fetch students.");
      }
    };
    fetchStudents();
  }, [API_BASE_URL, authData.jwt]);

  const handleEdit = (studentId) => {
    navigate(`/admin/edit-student/${studentId}`);
  };

  const handleAddStudent = () => {
    navigate("/admin/create-student");
  };

  const handleBanUnban = async (student) => {
    const endpoint = student.userDto._active
      ? `${API_BASE_URL}/api/admin/user/ban/${student.userDto.id}`
      : `${API_BASE_URL}/api/admin/user/unban/${student.userDto.id}`;
    try {
      await axios.post(endpoint, null, {
        headers: { Authorization: `Bearer ${authData.jwt}` },
      });
      alert(
        `Student ${
          student.userDto._active ? "banned" : "unbanned"
        } successfully!`
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                userDto: { ...s.userDto, _active: !student.userDto._active },
              }
            : s
        )
      );
    } catch (error) {
      console.error("Error updating student status:", error);
      alert(
        `Failed to ${student.userDto._active ? "ban" : "unban"} the student.`
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName =
      `${student.userDto.firstName} ${student.userDto.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      student.studentCode.toLowerCase().includes(query) ||
      fullName.includes(query) ||
      student.userDto.email.toLowerCase().includes(query) ||
      student.userDto.phoneNumber.toLowerCase().includes(query) ||
      student.userDto.address.toLowerCase().includes(query) ||
      (student.classDto && student.classDto.name.toLowerCase().includes(query))
    );
  });

  return (
    <Container>
      <h2 className="mb-3">Student List</h2>

      {/* Add Student Button */}
      <Button variant="success" className="mb-3" onClick={handleAddStudent}>
        Add Student
      </Button>
      <div className="mb-4 d-flex justify-content-between">
        <Form.Control
          type="text"
          placeholder="Search by Student Code, Full Name, Email, Phone, Address, or Class"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-75"
        />
      </div>

      {/* Student Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Student Code</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Class</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.studentCode}</td>
              <td>{`${student.userDto.firstName} ${student.userDto.lastName}`}</td>
              <td>{student.userDto.email}</td>
              <td>{student.userDto.phoneNumber}</td>
              <td>{student.userDto.address}</td>
              <td>{student.classDto ? student.classDto.name : "N/A"}</td>
              <td>{student.userDto._active ? "Active" : "Banned"}</td>
              <td>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => handleEdit(student.id)}
                >
                  Edit
                </Button>
                <Button
                  variant={student.userDto._active ? "danger" : "success"}
                  onClick={() => handleBanUnban(student)}
                >
                  {student.userDto._active ? "Ban" : "Unban"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default StudentList;
