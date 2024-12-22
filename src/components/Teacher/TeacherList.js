import React, { useEffect, useState } from "react";
import { Table, Button, Container, Form } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";

const TeacherList = () => {
  const { API_BASE_URL, authData } = useAppContext();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/teacher/all`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchTeachers();
  }, [API_BASE_URL, authData]);

  const handleBanUnban = async (teacher) => {
    const apiUrl = teacher.userDto._active
      ? `${API_BASE_URL}/api/admin/user/ban/${teacher.userDto.id}`
      : `${API_BASE_URL}/api/admin/user/unban/${teacher.userDto.id}`;

    try {
      await axios.post(apiUrl, null, {
        headers: { Authorization: `Bearer ${authData.jwt}` },
      });
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === teacher.id
            ? { ...t, userDto: { ...t.userDto, _active: !t.userDto._active } }
            : t
        )
      );
    } catch (error) {
      console.error("Error updating teacher status:", error);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.userDto.firstName} ${teacher.userDto.lastName}`;
    return (
      teacher.teacherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.userDto.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.userDto.phoneNumber.includes(searchTerm) ||
      teacher.userDto.address
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      teacher.expertiseArea.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container className="mt-4">
      <h2>Teacher List</h2>
      <Button
        variant="success"
        className="mb-3"
        onClick={() => navigate("/admin/create-teacher")}
      >
        New Teacher
      </Button>
      <Form.Control
        type="text"
        placeholder="Search..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Teacher Code</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Department</th>
            <th>Position</th>
            <th>Expertise Area</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.teacherCode}</td>
              <td>{`${teacher.userDto.firstName} ${teacher.userDto.lastName}`}</td>
              <td>{teacher.userDto.email}</td>
              <td>{teacher.userDto.phoneNumber}</td>
              <td>{teacher.userDto.address}</td>
              <td>{teacher.department}</td>
              <td>{teacher.position}</td>
              <td>{teacher.expertiseArea}</td>
              <td>{teacher.userDto._active ? "Active" : "Banned"}</td>
              <td>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => navigate(`/admin/edit-teacher/${teacher.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant={teacher.userDto._active ? "danger" : "success"}
                  onClick={() => handleBanUnban(teacher)}
                >
                  {teacher.userDto._active ? "Ban" : "Unban"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default TeacherList;
