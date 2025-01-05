import React, { useEffect, useState } from "react";
import { Container, Row, Col, ListGroup, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../AppContext";

const DetailClass = () => {
  const { classId } = useParams(); // Get class ID from the URL
  const { authData, API_BASE_URL } = useAppContext();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        console.log("Fetching class details for ID:", classId);
        console.log("Authorization Token:", authData.jwt);

        // Ensure class ID exists
        if (!classId) {
          alert("Class ID is missing.");
          navigate("/admin/classes");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/admin/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          }
        );

        console.log("Class details response:", response.data);
        setClassDetail(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching class details:", error);
        alert("Failed to fetch class details.");
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [API_BASE_URL, authData.jwt, classId, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!classDetail) {
    return <div>Class not found.</div>;
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-3">Class Details</h2>

      {/* Class Information */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{classDetail.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Grade {classDetail.grade}
          </Card.Subtitle>
          <Card.Text>
            <strong>Class ID:</strong> {classDetail.id}
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Students List */}
      <Row>
        <Col md={6}>
          <h4>Students</h4>
          <ListGroup>
            {classDetail.simpleStudentDtos &&
            classDetail.simpleStudentDtos.length > 0 ? (
              classDetail.simpleStudentDtos.map((student) => (
                <ListGroup.Item key={student.id}>
                  {student.firstName} {student.lastName}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>
                No students enrolled in this class.
              </ListGroup.Item>
            )}
          </ListGroup>
        </Col>

        {/* Teachers List */}
        <Col md={6}>
          <h4>Teachers</h4>
          <ListGroup>
            {classDetail.simpleTeacherDtos &&
            classDetail.simpleTeacherDtos.length > 0 ? (
              classDetail.simpleTeacherDtos.map((teacher) => (
                <ListGroup.Item key={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>
                No teachers assigned to this class.
              </ListGroup.Item>
            )}
          </ListGroup>
        </Col>
      </Row>

      {/* Back Button */}
      <div className="mt-3 text-center">
        <Button variant="secondary" onClick={() => navigate("/admin/classes")}>
          Back to Class List
        </Button>
      </div>
    </Container>
  );
};

export default DetailClass;
