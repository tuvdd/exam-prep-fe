import React from "react";
import { useAppContext } from "../../AppContext";
import { Container, Card, Image } from "react-bootstrap";

const ProfilePage = () => {
  const { isLogin, userInfo } = useAppContext();

  if (!isLogin) {
    return (
      <Container className="text-center mt-5">
        <h1 className="text-danger">Not logged in</h1>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Teacher Profile</h1>
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
                e.target.onerror = null; // Ngăn lặp lỗi onError
                e.target.src =
                  "https://i.ibb.co/vD45h32/anh-buon-phong-canh-060206013.jpg";
              }}
            />
          </div>

          <h3 className="text-center mb-3">
            {`${userInfo.userDto.firstName} ${userInfo.userDto.lastName}`}
          </h3>

          <Card.Body>
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
            <Card.Text>
              <strong>Role:</strong>{" "}
              {userInfo.userDto.role.replace("ROLE_", "")}
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <p className="text-center">Loading teacher information...</p>
      )}
    </Container>
  );
};

export default ProfilePage;
