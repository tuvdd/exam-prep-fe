import React, { useState } from "react";
import { useAppContext } from "../../AppContext";
import { Form, InputGroup, ListGroup } from "react-bootstrap";

function QuestionSetSelector({ onSelect }) {
  const { questionSetsByTeacher } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState(null);

  // Lọc danh sách question sets theo từ khóa tìm kiếm
  const filteredQuestionSets = questionSetsByTeacher.filter((questionSet) =>
    questionSet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý chọn question set
  const handleSelect = (e, questionSet) => {
    e.preventDefault(); // Ngăn chặn hành vi submit của form
    setSelectedQuestionSetId(questionSet.id); // Lưu ID của question set được chọn
    onSelect(questionSet); // Gửi đối tượng question set lên component cha
  };

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <InputGroup className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search question sets by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Danh sách question sets */}
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
          {filteredQuestionSets.map((questionSet) => (
            <ListGroup.Item
              key={questionSet.id}
              action
              onClick={(e) => handleSelect(e, questionSet)} // Truyền sự kiện vào hàm xử lý
              style={{
                cursor: "pointer",
                backgroundColor:
                  selectedQuestionSetId === questionSet.id
                    ? "#d4edda" // Màu nền xanh khi được chọn
                    : "white",
              }}
            >
              <h5 className="mb-1">{questionSet.title}</h5>
              <small>Subject: {questionSet.subject}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}

export default QuestionSetSelector;
