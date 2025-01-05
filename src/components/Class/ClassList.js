import React, { useEffect, useState } from "react";
import { Table, Button, Container, Form } from "react-bootstrap";
import axios from "axios";
import { useAppContext } from "../../AppContext";
import { useNavigate } from "react-router-dom";

const ClassList = () => {
  const { authData, API_BASE_URL } = useAppContext();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/class/all`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        alert("Failed to fetch classes.");
      }
    };
    fetchClasses();
  }, [API_BASE_URL, authData.jwt]);

  // Navigate to edit class page
  const handleEdit = (classId) => {
    navigate(`/admin/edit-class/${classId}`);
  };

  // Navigate to view class details page
  const handleDetail = (classId) => {
    navigate(`/admin/class/${classId}`);
  };

  // Navigate to create class page
  const handleAddClass = () => {
    navigate("/admin/create-class");
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter((classItem) => {
    const className = classItem.name.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      classItem.name.toLowerCase().includes(query) ||
      classItem.grade.toString().includes(query)
    );
  });

  return (
    <Container>
      <h2 className="mb-3">Class List</h2>

      {/* Add Class Button */}
      <Button variant="success" className="mb-3" onClick={handleAddClass}>
        Add Class
      </Button>
      <div className="mb-4 d-flex justify-content-between">
        <Form.Control
          type="text"
          placeholder="Search by Class Name or Grade"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-75"
        />
      </div>

      {/* Class Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Class Name</th>
            <th>Grade</th>
            <th>Number of Students</th>
            <th>Number of Teachers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClasses.map((classItem, index) => (
            <tr key={classItem.id}>
              <td>{index + 1}</td>
              <td>{classItem.name}</td>
              <td>{classItem.grade}</td>
              <td>
                {classItem.simpleStudentDtos
                  ? classItem.simpleStudentDtos.length
                  : 0}
              </td>
              <td>
                {classItem.simpleTeacherDtos
                  ? classItem.simpleTeacherDtos.length
                  : 0}
              </td>
              <td>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => handleEdit(classItem.id)}
                >
                  Edit
                </Button>
                {/* Detail Button */}
                <Button
                  variant="info"
                  onClick={() => handleDetail(classItem.id)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ClassList;
