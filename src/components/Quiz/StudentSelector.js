import React, { useState } from "react";
import { useAppContext } from "../../AppContext";
import { Form, InputGroup, ListGroup } from "react-bootstrap";

function StudentSelector({ onSelect }) {
  const { studentsByTeacher } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Lọc danh sách học sinh theo từ khóa tìm kiếm
  const filteredStudents = studentsByTeacher.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.studentCode}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Thêm/xóa học sinh vào danh sách đã chọn
  const toggleSelection = (studentId) => {
    const updatedSelection = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter((id) => id !== studentId)
      : [...selectedStudentIds, studentId];

    setSelectedStudentIds(updatedSelection);
    onSelect(updatedSelection); // Gửi danh sách đã chọn lên parent component
  };

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <InputGroup className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search students by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Danh sách học sinh */}
      <div
        style={{
          maxHeight: "300px", // Giới hạn chiều cao
          overflowY: "auto", // Thêm thanh cuộn
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "10px",
        }}
      >
        <ListGroup>
          {filteredStudents.map((student) => (
            <ListGroup.Item key={student.id}>
              <Form.Check
                type="checkbox"
                id={`student-${student.id}`}
                label={`${student.firstName} ${student.lastName} - ${student.studentCode}`}
                checked={selectedStudentIds.includes(student.id)}
                onChange={() => toggleSelection(student.id)}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}

export default StudentSelector;
