import React, { useState } from "react";
import { useAppContext } from "../../AppContext";
import { Container, Card, Image, Button, Modal, Form } from "react-bootstrap";

const ProfilePage = () => {
  const { isLogin, userInfo, formatDateTime, apiClient } = useAppContext();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isLogin) {
    return (
      <Container className="text-center mt-5">
        <h1 className="text-danger">Not logged in</h1>
      </Container>
    );
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    return formatDateTime(date);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
    }
  };

  const handleAvatarSubmit = async () => {
    if (!newAvatar) return;

    const formData = new FormData();
    formData.append("avatar", newAvatar);

    try {
      await apiClient.post("/user/change-avatar", formData);
      alert("Avatar changed successfully!");
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("Error updating avatar.");
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await apiClient.post("/user/change-password", {
        newPassword,
      });
      alert("Password changed successfully!");
      setShowPasswordModal(false);
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Error updating password.");
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Profile</h1>
      {userInfo ? (
        <Card
          className="mx-auto p-4 shadow-lg"
          style={{
            maxWidth: "500px",
            borderRadius: "10px",
          }}
        >
          <div className="text-center mb-4">
            <Image
              src={
                userInfo.userDto.profilePicture
                  ? userInfo.userDto.profilePicture
                  : "https://i.ibb.co/vD45h32/anh-buon-phong-canh-060206013.jpg"
              }
              alt="Profile"
              roundedCircle
              fluid
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.onerror = null; // Prevent looping error
                e.target.src =
                  "https://i.ibb.co/vD45h32/anh-buon-phong-canh-060206013.jpg";
              }}
            />
          </div>

          <h3 className="text-center mb-3">
            {`${userInfo.userDto.firstName} ${userInfo.userDto.lastName}`}
          </h3>

          <Card.Body>
            {/* Common Info for All Roles */}
            <Card.Text>
              <strong>Username:</strong> {userInfo.userDto.username}
            </Card.Text>
            <Card.Text>
              <strong>Email:</strong> {userInfo.userDto.email}
            </Card.Text>
            <Card.Text>
              <strong>Phone:</strong> {userInfo.userDto.phoneNumber}
            </Card.Text>
            <Card.Text>
              <strong>Address:</strong> {userInfo.userDto.address}
            </Card.Text>

            {/* Additional Info for Admin Role */}
            {userInfo.userDto.role === "ROLE_ADMIN" && (
              <>
                <Card.Text>
                  <strong>Created At:</strong> {formatDate(userInfo.createdAt)}
                </Card.Text>
                <Card.Text>
                  <strong>Last Login:</strong> {formatDate(userInfo.lastLogin)}
                </Card.Text>
              </>
            )}

            {/* Teacher Info */}
            {userInfo.teacherCode && (
              <>
                <Card.Text>
                  <strong>Teacher Code:</strong> {userInfo.teacherCode}
                </Card.Text>
                <Card.Text>
                  <strong>Department:</strong> {userInfo.department}
                </Card.Text>
                <Card.Text>
                  <strong>Position:</strong> {userInfo.position}
                </Card.Text>
                <Card.Text>
                  <strong>Expertise Area:</strong> {userInfo.expertiseArea}
                </Card.Text>
              </>
            )}

            {/* Role */}
            <Card.Text>
              <strong>Role:</strong>{" "}
              {userInfo.userDto.role.replace("ROLE_", "")}
            </Card.Text>

            {/* Action Buttons */}
            <div className="text-center">
              <Button
                variant="primary"
                onClick={() => setShowAvatarModal(true)}
                className="me-2"
              >
                Change Avatar
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <p className="text-center">Loading teacher information...</p>
      )}

      {/* Avatar Change Modal */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Upload New Avatar</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAvatarSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handlePasswordSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
